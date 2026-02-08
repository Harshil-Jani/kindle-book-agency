#!/usr/bin/env python3
"""
Book Writer AI Agent Team
=========================
8 AI agents run a full Kindle publishing pipeline in parallel.

Usage:
  python main.py "book topic here"                          # Full pipeline
  python main.py --model claude-haiku-4-5-20251001 "topic"  # Faster model
  python main.py --select niche_researcher "topic"          # Single agent
  python main.py --list-agents                              # Show all agents
"""

import argparse
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from agents.definitions import ALL_AGENTS
from agents.orchestrator import BookWriterOrchestrator
from config import ANTHROPIC_API_KEY, DEFAULT_MODEL


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Book Writer AI Agent Team — Kindle Publishing Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py "stoicism for software engineers"
  python main.py --model claude-haiku-4-5-20251001 "quick topic"
  python main.py --select niche_researcher,ghostwriter "my book idea"
  python main.py --list-agents
        """,
    )

    parser.add_argument(
        "topic",
        nargs="?",
        help="Book topic / brief for the pipeline",
    )

    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"Claude model to use (default: {DEFAULT_MODEL})",
    )

    parser.add_argument(
        "--select",
        type=str,
        default=None,
        help="Comma-separated agent names to run (auto-includes dependencies)",
    )

    parser.add_argument(
        "--list-agents",
        action="store_true",
        help="List all available agents and exit",
    )

    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress progress messages",
    )

    return parser.parse_args()


def list_agents():
    """Display all available agents with their configuration."""
    print("\n  Book Writer AI Agent Team — 8 Agents")
    print("  " + "=" * 55)

    for agent in ALL_AGENTS.values():
        deps = ", ".join(agent.depends_on) if agent.depends_on else "none (runs first)"
        print(f"\n  {agent.role}")
        print(f"    Name:         {agent.name}")
        print(f"    Phase:        {agent.parallel_group}")
        print(f"    Depends on:   {deps}")
        print(f"    Temperature:  {agent.temperature}")
        print(f"    Max tokens:   {agent.max_tokens}")

    print("\n  " + "=" * 55)
    print("  Pipeline: Phase 0 -> Phase 1 [parallel] -> Phase 2 -> Phase 3 [parallel] -> Phase 4 [compiler]")
    print()


async def run_pipeline(topic: str, model: str, selected: list[str] | None, verbose: bool):
    """Run the pipeline."""
    if not ANTHROPIC_API_KEY:
        print("\n  Error: ANTHROPIC_API_KEY not set.")
        print("  Export it:  export ANTHROPIC_API_KEY='sk-ant-...'")
        print("\n  Or use this project directly in Claude Code — see CLAUDE.md")
        sys.exit(1)

    if selected:
        for name in selected:
            if name not in ALL_AGENTS:
                print(f"  Error: Unknown agent '{name}'")
                print(f"  Available: {', '.join(ALL_AGENTS.keys())}")
                sys.exit(1)

        # Auto-resolve dependencies
        resolved = set()
        queue = list(selected)
        while queue:
            name = queue.pop(0)
            if name in resolved:
                continue
            resolved.add(name)
            for dep in ALL_AGENTS[name].depends_on:
                if dep not in resolved:
                    queue.append(dep)

        if resolved != set(selected):
            added = resolved - set(selected)
            print(f"  Auto-including dependencies: {', '.join(added)}")

        from agents import definitions
        original = definitions.ALL_AGENTS.copy()
        definitions.ALL_AGENTS = {k: v for k, v in original.items() if k in resolved}
        try:
            orchestrator = BookWriterOrchestrator(
                api_key=ANTHROPIC_API_KEY, model=model, verbose=verbose,
            )
            await orchestrator.run(topic)
        finally:
            definitions.ALL_AGENTS = original
    else:
        orchestrator = BookWriterOrchestrator(
            api_key=ANTHROPIC_API_KEY, model=model, verbose=verbose,
        )
        await orchestrator.run(topic)


def main():
    args = parse_args()

    if args.list_agents:
        list_agents()
        return

    if not args.topic:
        print("\n  Book Writer AI Agent Team")
        print("  " + "-" * 40)
        print('  Usage: python main.py "your book topic"')
        print("  Help:  python main.py --help")
        print("\n  Or use directly in Claude Code — see CLAUDE.md")
        sys.exit(0)

    asyncio.run(run_pipeline(args.topic, args.model,
        [s.strip() for s in args.select.split(",")] if args.select else None,
        not args.quiet))


if __name__ == "__main__":
    main()
