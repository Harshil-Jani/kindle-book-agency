# Book Writer AI Agent Team

A multi-agent Kindle publishing pipeline. 8 specialized agents collaborate to take a book idea from concept to publish-ready.

## Quick Start (Claude Code)

The fastest way to use this project — no API key required. Just open the project in Claude Code and describe your book idea:

### Full Pipeline
```
I want to write a book about "your book topic here"
```
This runs all 8 agents in sequence: market research → writing → design → editing → proofreading → formatting → compilation.

### Individual Agents
You can also ask Claude to run a specific agent:
```
Do niche research on "broad topic or genre"
Write sample chapters for my book (requires niche research output)
Create cover concepts for my book (requires niche research output)
Build a marketing strategy (requires niche research output)
Review my manuscript (requires ghostwriter output)
Proofread my chapters (requires ghostwriter + developmental editor output)
Format for Kindle (requires ghostwriter + developmental editor output)
Compile the Kindle manuscript (requires all prior outputs)
```

> **Optional:** If you prefer explicit file references, you can use the `@` syntax (e.g., `@agents/niche-researcher.md "topic"`), but this is not required — Claude reads the agent prompts automatically.

## The 8 Agents

| # | Agent | Role | Phase |
|---|-------|------|-------|
| 1 | `niche_researcher` | Market analysis, keyword strategy, audience persona | 0 (first) |
| 2 | `ghostwriter` | Book outline, sample chapters, SEO metadata | 1 |
| 3 | `cover_designer` | Cover concepts, color palettes, typography | 1 (parallel) |
| 4 | `marketing_specialist` | Launch strategy, Amazon Ads, pricing | 1 (parallel) |
| 5 | `developmental_editor` | Structural review, content scoring | 2 |
| 6 | `proofreader` | Copy editing, style consistency, fact-checks | 3 |
| 7 | `formatter` | Kindle/print formatting specs, CSS, layout | 3 (parallel) |
| 8 | `kindle_compiler` | Collects metadata, compiles all outputs into Kindle .docx | 4 (final) |

## Workflow

When the user wants to create a book, follow this sequence:

### Step 1: Market Research (Interactive)
Act as the **Niche Researcher** agent. Read the system prompt from `@agents/niche-researcher.md`. Help the user:
- Explore genres, audiences, and niches
- Analyze demand vs competition
- Suggest profitable sub-niches
- Generate title ideas with subtitles
- Identify keyword opportunities

Save the research output to `output/niche_researcher.md`.

### Step 2: Book Creation (Sequential)
Once the user picks a title/niche, run each remaining agent **in pipeline order**, using the previous agent's output as context:

1. **Ghostwriter** — Write outline + 2 sample chapters using the research brief
2. **Cover Designer** — Create cover concepts based on the research
3. **Marketing Specialist** — Build launch strategy from the research
4. **Developmental Editor** — Review the ghostwriter's output
5. **Proofreader** — Polish the sample chapters
6. **Formatter** — Create formatting specs

Save each agent's output to `output/{agent_name}.md`.

### Step 3: Kindle Manuscript Compilation (Interactive)
Act as the **Kindle Compiler** agent. This is the final step:
1. **Ask the user** for required metadata: Book Title, Subtitle, Author Name, Publisher Name, Copyright Year, ASIN, ISBN, Dedication, About the Author bio, and Also By titles
2. **Compile** all prior agent outputs into a single Kindle-ready .docx manuscript
3. The .docx includes proper front matter (title page, copyright, dedication, TOC), the full polished book body, and back matter (author bio, also by, review request)
4. Apply Kindle-specific formatting only — no print specs

Save the compiled manuscript to `output/kindle_manuscript.docx`.

### Step 4: Full Report
After all agents complete, combine outputs into `output/full_report.md`.

## Agent Execution Rules

When acting as an agent:
1. Read that agent's `.md` file from `agents/` for full instructions
2. Follow the prompt's instructions exactly — it defines what to deliver
3. Use the user's brief + any prior agent outputs as input context
4. Write the output to `output/{agent_name}.md`
5. Summarize what was produced before moving to the next agent

## CLI Mode (requires own API key)

If the user has `ANTHROPIC_API_KEY` set, they can run the parallel pipeline:

```bash
python main.py "book topic here"                          # Full pipeline
python main.py --model claude-haiku-4-5-20251001 "topic"  # Faster/cheaper
python main.py --select niche_researcher "topic"          # Single agent
python main.py --list-agents                              # Show all agents
```

Outputs are saved to `output/run_YYYYMMDD_HHMMSS/`.

## Project Structure

```
agents/
  kindle-book-generator.md  — Full pipeline orchestrator (Claude Code entry point)
  niche-researcher.md       — Agent: Market research & niche validation
  ghostwriter.md            — Agent: Book outline & sample chapters
  cover-designer.md         — Agent: Cover design concepts
  marketing-specialist.md   — Agent: Launch strategy & Amazon Ads
  developmental-editor.md   — Agent: Structural review & scoring
  proofreader.md            — Agent: Copy editing & style consistency
  formatter.md              — Agent: Kindle/print formatting specs
  kindle-compiler.md        — Agent: Final .docx manuscript compilation
  definitions.py            — Agent system prompts (for CLI mode)
  orchestrator.py           — Parallel pipeline runner (for CLI mode)
config/__init__.py          — Model and output settings
main.py                     — CLI entry point
output/                     — All generated content goes here
```
