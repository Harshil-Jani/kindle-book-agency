# Book Writer AI Agent Team

A multi-agent Kindle publishing pipeline powered by Claude. 8 specialized AI agents collaborate to take a book idea from concept to a publish-ready Kindle manuscript (`.docx`).

**What you get:** Market research, book outline, sample chapters, cover design briefs, marketing strategy, professional editing, Kindle formatting specs, and a compiled manuscript — all from a single prompt.

<p align="center">
  <img src="docs/pipeline.svg" alt="Pipeline Diagram — 8 agents across 5 phases" width="100%"/>
</p>

---

## The 8 Agents

| Phase | Agent | Role | What It Produces |
|:-----:|-------|------|------------------|
| 0 | **Niche Researcher** | Market analyst | Niche validation, keyword strategy, audience persona, competitive landscape |
| 1 | **Ghostwriter** | Author | Book outline, 2 full sample chapters, SEO metadata, Amazon listing copy |
| 1 | **Cover Designer** | Art director | 3 cover concepts with color palettes, typography, AI image prompts |
| 1 | **Marketing Specialist** | Growth strategist | Launch plan, Amazon Ads strategy, pricing, KPI dashboard |
| 2 | **Developmental Editor** | Structural editor | Scored review (structure/content/market fit), chapter-by-chapter feedback |
| 3 | **Proofreader** | Copy editor | Corrected manuscript, edit log, style report, fact-check flags |
| 3 | **Formatter** | Typesetter | Kindle CSS, interior design spec, chapter templates, QA checklist |
| 4 | **Kindle Compiler** | Final assembler | Collects your metadata, compiles everything into a Kindle-ready `.docx` |

Agents in the same phase run **in parallel**. The pipeline resolves dependencies automatically — no agent starts until its inputs are ready.

---

## Getting Started

### Option A: Claude Code (Recommended — zero setup)

> No API key needed. Claude Code reads the project's `CLAUDE.md` and knows the entire workflow.

```bash
git clone https://github.com/Harshil-Jani/kindle-book-agency.git
cd kindle-book-agency
claude
```

Then describe your book:

```
> I want to write a book about stoicism for software engineers
```

That's it. Claude will:
1. **Research** your niche interactively (market, keywords, audience)
2. **Write** an outline + sample chapters, **design** cover concepts, and **build** a marketing plan
3. **Edit** the manuscript (structural review + proofreading)
4. **Format** for Kindle and **compile** into a `.docx`

All outputs are saved to `output/`.

> **Note:** You do **not** need `@agents/...` file references. Claude reads the agent prompts automatically via `CLAUDE.md`. If you prefer explicit control, you can optionally use `@` to attach a specific agent file (e.g., `@agents/niche-researcher.md "topic"`).

You can also run individual agents:

```
Do niche research on "productivity for remote workers"
Write sample chapters for my book
Create cover concepts for my book
Build a marketing strategy
```

### Option B: CLI with Your Own API Key

> Runs all 8 agents programmatically via the Anthropic API. Requires Python 3.10+ and an API key.

```bash
git clone https://github.com/Harshil-Jani/kindle-book-agency.git
cd kindle-book-agency
export ANTHROPIC_API_KEY="sk-ant-..."

# One-command run (handles venv + deps automatically)
./run.sh "stoicism for software engineers"
```

<details>
<summary><strong>Manual setup & CLI options</strong></summary>

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
npm install

python main.py "stoicism for software engineers"
```

```bash
# Faster/cheaper model
python main.py --model claude-haiku-4-5-20251001 "your topic"

# Run specific agents (dependencies auto-included)
python main.py --select ghostwriter "your topic"
python main.py --select proofreader,formatter "your topic"

# List all agents
python main.py --list-agents

# Quiet mode
python main.py --quiet "your topic"
```

</details>

---

## Pipeline Walkthrough

### Phase 0 — Market Research

The **Niche Researcher** analyzes your book idea:
- Validates the niche (demand vs. competition)
- Builds a keyword strategy (primary + long-tail)
- Creates an audience persona (demographics, pain points, desires)
- Recommends 3-5 title options with content angles
- Maps the competitive landscape (top 5 competing titles)

> In Claude Code, this phase is **interactive** — the researcher works with you to refine the niche before proceeding.

### Phase 1 — Creation (Parallel)

Three agents work simultaneously:

| Agent | Receives | Produces |
|-------|----------|----------|
| **Ghostwriter** | Research brief | Full outline, 2 sample chapters, Amazon listing copy |
| **Cover Designer** | Research brief | 3 cover concepts, color palettes, AI generation prompts |
| **Marketing Specialist** | Research brief | Launch strategy, Amazon Ads plan, pricing |

### Phase 2 — Structural Review

The **Developmental Editor** reviews the Ghostwriter's work:
- Scores structure, content strength, and market fit (1-10 each)
- Provides chapter-by-chapter feedback
- Flags critical issues vs. nice-to-have improvements

### Phase 3 — Polish (Parallel)

| Agent | Receives | Produces |
|-------|----------|----------|
| **Proofreader** | Chapters + dev edit | Corrected text, edit log, style report |
| **Formatter** | Blueprint + dev edit | Kindle CSS, interior specs, QA checklist |

### Phase 4 — Kindle Compilation

The **Kindle Compiler** collects your metadata (title, author, ISBN, dedication, bio) and compiles everything into a single `.docx`:

- **Front matter:** Title page, copyright page, dedication, table of contents
- **Body:** All polished chapters with proper scene breaks
- **Back matter:** Author bio, also-by list, review request
- **Kindle-specific formatting** — no print specs, Heading 1 for TOC generation, proper indentation

---

## Project Structure

```
kindle-book-agency/
├── agents/
│   ├── niche-researcher.md       # Agent 1: Market research & niche validation
│   ├── ghostwriter.md            # Agent 2: Book outline & sample chapters
│   ├── cover-designer.md         # Agent 3: Cover design concepts
│   ├── marketing-specialist.md   # Agent 4: Launch strategy & Amazon Ads
│   ├── developmental-editor.md   # Agent 5: Structural review & scoring
│   ├── proofreader.md            # Agent 6: Copy editing & style consistency
│   ├── formatter.md              # Agent 7: Kindle/print formatting specs
│   ├── kindle-compiler.md        # Agent 8: Final .docx manuscript compilation
│   ├── kindle-book-generator.md  # Full pipeline orchestrator prompt
│   ├── definitions.py            # All agent system prompts (for CLI mode)
│   ├── orchestrator.py           # Dependency-aware parallel pipeline runner
│   └── __init__.py
├── config/
│   └── __init__.py               # Model selection, output paths
├── docs/
│   ├── pipeline.svg              # Pipeline diagram (rendered in README)
│   └── pipeline.drawio           # Editable source (diagrams.net)
├── output/                       # Generated content (gitignored)
├── main.py                       # CLI entry point
├── run.sh                        # One-command runner (handles venv + deps)
├── requirements.txt              # Python dependencies
├── package.json                  # Node.js dependencies (docx generation)
├── CLAUDE.md                     # Claude Code workflow instructions
└── README.md
```

---

## Configuration

### Model Selection (CLI mode)

Pass `--model` on the CLI or edit `config/__init__.py`:

| Model | Speed | Quality | Cost |
|-------|-------|---------|------|
| `claude-opus-4-6` | Slowest | Best | $$$ |
| `claude-sonnet-4-5-20250929` | Fast | Great | $$ |
| `claude-haiku-4-5-20251001` | Fastest | Good | $ |

Default: `claude-opus-4-6`. For quick iterations:

```bash
python main.py --model claude-haiku-4-5-20251001 "your topic"
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | CLI mode only | Your Anthropic API key |

Not needed for Claude Code — it handles auth automatically.

---

## Output

**Claude Code:** Each agent saves to `output/{agent_name}.md`. Final manuscript: `output/kindle_manuscript.docx`.

**CLI mode:** Each run creates a timestamped directory:

```
output/run_20260208_143022/
├── niche_researcher.md
├── ghostwriter.md
├── cover_designer.md
├── marketing_specialist.md
├── developmental_editor.md
├── proofreader.md
├── formatter.md
├── kindle_compiler.md
├── full_report.md
└── summary.json
```

The `output/` directory is gitignored.

---

## FAQ

<details>
<summary><strong>Do I need an API key?</strong></summary>
No — Claude Code handles everything. You only need <code>ANTHROPIC_API_KEY</code> for the standalone CLI pipeline.
</details>

<details>
<summary><strong>Can I run just one agent?</strong></summary>
Yes. In Claude Code, ask directly (e.g., "Do niche research on X"). In CLI mode, use <code>--select</code>. Dependencies are auto-included.
</details>

<details>
<summary><strong>What format is the final manuscript?</strong></summary>
A <code>.docx</code> file structured for direct upload to <a href="https://kdp.amazon.com/">KDP</a>, with proper front matter, body, and back matter using Kindle-specific formatting.
</details>

<details>
<summary><strong>Do I need <code>@</code> file references in Claude Code?</strong></summary>
No. <code>CLAUDE.md</code> provides all workflow instructions automatically. The <code>@</code> syntax is an optional shortcut for attaching specific agent files.
</details>

<details>
<summary><strong>Can I customize the agents?</strong></summary>
Yes. Edit the agent's <code>.md</code> file in <code>agents/</code> (for Claude Code) or its <code>system_prompt</code> in <code>agents/definitions.py</code> (for CLI mode).
</details>

<details>
<summary><strong>Is this for print books too?</strong></summary>
The Formatter provides both Kindle and print specs, but the final Kindle Compiler is Kindle-only. Print specs are still available in <code>output/formatter.md</code>.
</details>

---

## License

MIT
