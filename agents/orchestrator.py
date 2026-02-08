"""
Parallel Orchestrator for the Book Writer AI Agent Team.

Runs 8 agents through a dependency-aware DAG:

  Phase 0: [Niche Researcher]
              |
  Phase 1: [Ghostwriter] + [Cover Designer] + [Marketing Specialist]   <- parallel
              |
  Phase 2: [Developmental Editor]
              |
  Phase 3: [Proofreader] + [Formatter]   <- parallel
              |
  Phase 4: [Kindle Compiler]   <- collects metadata, generates .docx

Supports two modes:
  1. CLI mode  — prints to stdout
  2. Web mode  — pushes events to an asyncio.Queue for SSE streaming
"""

import asyncio
import json
import time
from datetime import datetime
from pathlib import Path
from typing import Callable, Optional

import anthropic
import httpx

from agents.definitions import ALL_AGENTS, AgentDefinition
from config import DEFAULT_MODEL, OUTPUT_DIR

# OAuth tokens start with this prefix — everything else is a regular API key
_OAUTH_TOKEN_PREFIX = "sk-ant-oat"


def _is_oauth_token(credential: str) -> bool:
    return credential.startswith(_OAUTH_TOKEN_PREFIX)


class AgentResult:
    """Container for a single agent's output."""

    def __init__(self, agent_name: str, role: str, output: str, duration: float):
        self.agent_name = agent_name
        self.role = role
        self.output = output
        self.duration = duration
        self.timestamp = datetime.now().isoformat()

    def to_dict(self) -> dict:
        return {
            "agent": self.agent_name,
            "role": self.role,
            "output": self.output,
            "duration_seconds": round(self.duration, 2),
            "timestamp": self.timestamp,
        }


class BookWriterOrchestrator:
    """
    Manages the lifecycle of all 7 agents.
    Resolves dependencies and maximizes parallel execution.

    Supports two auth methods:
      - api_key:     Standard sk-ant-api key → uses x-api-key header
      - oauth_token: OAuth sk-ant-oat token → uses Authorization: Bearer header
    """

    def __init__(
        self,
        api_key: str = "",
        oauth_token: str = "",
        model: str = DEFAULT_MODEL,
        verbose: bool = True,
        event_queue: Optional[asyncio.Queue] = None,
    ):
        credential = api_key or oauth_token
        if not credential:
            raise ValueError("Either api_key or oauth_token is required.")

        if _is_oauth_token(credential):
            # OAuth Bearer token — use SDK's auth_token parameter
            self.client = anthropic.AsyncAnthropic(
                auth_token=credential,
                default_headers={"anthropic-beta": "oauth-2025-04-20"},
            )
            self._auth_mode = "oauth"
        else:
            # Standard API key
            self.client = anthropic.AsyncAnthropic(api_key=credential)
            self._auth_mode = "api_key"

        self.model = model
        self.verbose = verbose
        self.event_queue = event_queue
        self.results: dict[str, AgentResult] = {}
        self.output_dir = Path(OUTPUT_DIR)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    async def _emit(self, event_type: str, data: dict):
        """Send an event to the web UI via SSE queue (if connected)."""
        if self.event_queue:
            await self.event_queue.put({"event": event_type, "data": data})

    def _log(self, msg: str):
        if self.verbose:
            timestamp = datetime.now().strftime("%H:%M:%S")
            print(f"  [{timestamp}] {msg}")

    def _build_execution_phases(self) -> list[list[AgentDefinition]]:
        """Group agents into execution phases based on parallel_group."""
        phases: dict[int, list[AgentDefinition]] = {}
        for agent in ALL_AGENTS.values():
            phases.setdefault(agent.parallel_group, []).append(agent)
        return [phases[k] for k in sorted(phases.keys())]

    def _build_agent_context(self, agent: AgentDefinition, user_prompt: str) -> str:
        """
        Assemble the input message for an agent, injecting outputs from
        its dependencies so it can build on prior work.
        """
        context_parts = [f"## User Request\n{user_prompt}"]

        for dep_name in agent.depends_on:
            if dep_name in self.results:
                dep = self.results[dep_name]
                context_parts.append(
                    f"\n## Input from {dep.role}\n"
                    f"(This is the output from the {dep.role} agent — use it as your primary input)\n\n"
                    f"{dep.output}"
                )

        return "\n\n---\n\n".join(context_parts)

    async def _run_agent(self, agent: AgentDefinition, user_prompt: str) -> AgentResult:
        """Execute a single agent via the Anthropic API."""
        self._log(f"▶ Starting: {agent.role}")
        await self._emit("agent_start", {
            "agent": agent.name,
            "role": agent.role,
            "phase": agent.parallel_group,
        })

        start = time.time()
        context = self._build_agent_context(agent, user_prompt)

        try:
            # Use streaming to send partial progress updates
            output_chunks = []
            async with self.client.messages.stream(
                model=self.model,
                max_tokens=agent.max_tokens,
                temperature=agent.temperature,
                system=agent.system_prompt,
                messages=[{"role": "user", "content": context}],
            ) as stream:
                char_count = 0
                async for text in stream.text_stream:
                    output_chunks.append(text)
                    char_count += len(text)
                    # Send progress every ~200 chars to avoid flooding
                    if char_count >= 200:
                        await self._emit("agent_progress", {
                            "agent": agent.name,
                            "chars": sum(len(c) for c in output_chunks),
                        })
                        char_count = 0

            output = "".join(output_chunks)
            duration = time.time() - start

            result = AgentResult(
                agent_name=agent.name,
                role=agent.role,
                output=output,
                duration=duration,
            )

            self.results[agent.name] = result
            self._log(f"✓ Completed: {agent.role} ({duration:.1f}s)")
            await self._emit("agent_done", {
                "agent": agent.name,
                "role": agent.role,
                "duration": round(duration, 1),
                "output_length": len(output),
                "output_preview": output[:300],
            })
            return result

        except Exception as e:
            duration = time.time() - start
            error_msg = f"ERROR: {type(e).__name__}: {str(e)}"
            self._log(f"✗ Failed: {agent.role} — {error_msg}")
            await self._emit("agent_error", {
                "agent": agent.name,
                "role": agent.role,
                "error": error_msg,
                "duration": round(duration, 1),
            })
            result = AgentResult(
                agent_name=agent.name,
                role=agent.role,
                output=error_msg,
                duration=duration,
            )
            self.results[agent.name] = result
            return result

    async def run(self, book_topic: str) -> dict[str, AgentResult]:
        """
        Execute the full publishing pipeline for a given book topic.
        Returns a dict of agent_name -> AgentResult.
        """
        phases = self._build_execution_phases()

        self._log("BOOK WRITER AI AGENT TEAM — Pipeline starting")
        await self._emit("pipeline_start", {
            "topic": book_topic,
            "model": self.model,
            "total_agents": len(ALL_AGENTS),
            "total_phases": len(phases),
        })

        total_start = time.time()

        for phase_idx, phase_agents in enumerate(phases):
            agent_names = [a.name for a in phase_agents]
            agent_roles = [a.role for a in phase_agents]
            is_parallel = len(phase_agents) > 1

            self._log(f"─── Phase {phase_idx}: {', '.join(agent_roles)}")
            await self._emit("phase_start", {
                "phase": phase_idx,
                "agents": agent_names,
                "roles": agent_roles,
                "parallel": is_parallel,
            })

            tasks = [self._run_agent(agent, book_topic) for agent in phase_agents]
            await asyncio.gather(*tasks)

            await self._emit("phase_done", {"phase": phase_idx})

        total_duration = time.time() - total_start

        # Save outputs
        run_dir = await self._save_outputs(book_topic, total_duration)

        await self._emit("pipeline_done", {
            "total_duration": round(total_duration, 1),
            "output_dir": str(run_dir),
            "agents_completed": len(self.results),
        })

        # Signal end of stream
        if self.event_queue:
            await self.event_queue.put(None)

        return self.results

    async def _save_outputs(self, book_topic: str, total_duration: float) -> Path:
        """Persist all agent outputs to the output directory."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        run_dir = self.output_dir / f"run_{timestamp}"
        run_dir.mkdir(parents=True, exist_ok=True)

        # Save individual agent outputs
        for name, result in self.results.items():
            filepath = run_dir / f"{name}.md"
            filepath.write_text(
                f"# {result.role}\n\n"
                f"**Generated:** {result.timestamp}\n"
                f"**Duration:** {result.duration:.1f}s\n\n"
                f"---\n\n{result.output}\n",
                encoding="utf-8",
            )

        # Save combined summary
        summary = {
            "book_topic": book_topic,
            "total_duration_seconds": round(total_duration, 2),
            "timestamp": datetime.now().isoformat(),
            "model": self.model,
            "agents": {name: result.to_dict() for name, result in self.results.items()},
        }

        summary_path = run_dir / "summary.json"
        summary_path.write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")

        # Save a combined markdown report
        report_lines = [
            "# Book Writer AI Agent Team — Full Report",
            f"\n**Topic:** {book_topic}",
            f"**Generated:** {datetime.now().isoformat()}",
            f"**Total Duration:** {total_duration:.1f}s",
            f"**Model:** {self.model}",
            "\n---\n",
        ]

        phase_order = [
            "niche_researcher", "ghostwriter", "cover_designer",
            "marketing_specialist", "developmental_editor",
            "proofreader", "formatter", "kindle_compiler",
        ]

        for agent_name in phase_order:
            if agent_name in self.results:
                r = self.results[agent_name]
                report_lines.append(f"\n## {r.role}\n")
                report_lines.append(f"*Completed in {r.duration:.1f}s*\n")
                report_lines.append(r.output)
                report_lines.append("\n---\n")

        report_path = run_dir / "full_report.md"
        report_path.write_text("\n".join(report_lines), encoding="utf-8")

        self._log(f"Outputs saved to: {run_dir}")
        return run_dir
