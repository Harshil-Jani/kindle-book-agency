# Kindle Book Generator — Full Pipeline

> **Usage:** Reference this file with `@agents/kindle-book-generator.md` in Claude Code, followed by your book topic or idea.
>
> Example: `@agents/kindle-book-generator.md "Stoicism for software developers"`

This is the **master orchestrator** that runs all 8 agents in the correct order to take a book idea from concept to a publish-ready Kindle manuscript.

---

## Pipeline Overview

| Phase | Agent(s) | What Happens |
|-------|----------|--------------|
| 0 | Niche Researcher | Market analysis, keyword strategy, audience persona |
| 1 | Ghostwriter, Cover Designer, Marketing Specialist | Book outline + chapters, cover concepts, launch strategy |
| 2 | Developmental Editor | Structural review and content scoring |
| 3 | Proofreader, Formatter | Copy editing + Kindle/print formatting specs |
| 4 | Kindle Compiler | Collects metadata from user, compiles final .docx manuscript |
| Final | Full Report | Combines all outputs into one document |

---

## Execution Instructions

Follow each phase below **in order**. Do not skip phases. Save each agent's output to the specified file before moving to the next.

### Phase 0: Market Research (Interactive)

**Role:** Content & Niche Researcher
**Output:** `output/niche_researcher.md`

Read `@agents/niche-researcher.md` for full instructions.

Work **interactively** with the user to:
1. Explore the topic space — discuss genres, sub-niches, and angles
2. Analyze demand vs. competition for promising niches
3. Help the user select a specific niche and title direction
4. Produce the full Niche Research Brief (validation report, keyword strategy, audience persona, content angle, competitive landscape)

**Do not proceed until the user approves the niche and direction.**

---

### Phase 1: Content Creation (Sequential)

Run these three agents one after another. All three depend on the Phase 0 output.

#### 1a. Ghostwriter
**Role:** Elite Ghostwriter
**Input:** `output/niche_researcher.md`
**Output:** `output/ghostwriter.md`

Read `@agents/ghostwriter.md` for full instructions.

Deliver: Book blueprint, detailed chapter outline, 2 full sample chapters, SEO metadata.

#### 1b. Cover Designer
**Role:** Book Cover Designer
**Input:** `output/niche_researcher.md`
**Output:** `output/cover_designer.md`

Read `@agents/cover-designer.md` for full instructions.

Deliver: Visual research, 3 cover concepts with color palettes and typography, technical specs, A/B testing recommendations, AI image generation prompts.

#### 1c. Marketing Specialist
**Role:** Marketing & Launch Specialist
**Input:** `output/niche_researcher.md`
**Output:** `output/marketing_specialist.md`

Read `@agents/marketing-specialist.md` for full instructions.

Deliver: Pre-launch strategy, Amazon listing optimization, launch week plan, Amazon Ads strategy, post-launch growth plan, KPI dashboard.

---

### Phase 2: Editorial Review

#### 2. Developmental Editor
**Role:** Senior Developmental Editor
**Input:** `output/ghostwriter.md` + `output/niche_researcher.md`
**Output:** `output/developmental_editor.md`

Read `@agents/developmental-editor.md` for full instructions.

Deliver: Structural assessment (scored 1-10), content strength analysis, market fit assessment, chapter-by-chapter feedback, revision priority list.

---

### Phase 3: Polish & Format (Sequential)

Run these two agents one after another. Both depend on the Phase 2 output.

#### 3a. Proofreader
**Role:** Proofreader & Copy Editor
**Input:** `output/ghostwriter.md` + `output/developmental_editor.md`
**Output:** `output/proofreader.md`

Read `@agents/proofreader.md` for full instructions.

Deliver: Corrected manuscript text, edit log, style consistency report, fact-check flags, quality metrics.

#### 3b. Formatter
**Role:** Book Formatter & Typesetter
**Input:** `output/ghostwriter.md` + `output/developmental_editor.md`
**Output:** `output/formatter.md`

Read `@agents/formatter.md` for full instructions.

Deliver: Interior design spec, chapter layout template, Kindle CSS stylesheet, print formatting guide, QA checklist.

---

### Phase 4: Kindle Compilation (Interactive)

#### 4. Kindle Compiler
**Role:** Kindle Manuscript Compiler
**Input:** ALL prior outputs (`output/niche_researcher.md`, `output/ghostwriter.md`, `output/developmental_editor.md`, `output/proofreader.md`, `output/cover_designer.md`, `output/formatter.md`, `output/marketing_specialist.md`)
**Output:** `output/kindle_manuscript.docx` + `output/kindle_compiler.md`

Read `@agents/kindle-compiler.md` for full instructions.

This phase is **interactive** — the compiler must ask the user for metadata (title, author name, publisher, dedication, bio, etc.) before generating the final .docx manuscript.

---

### Final: Combine Full Report

After all agents complete, combine all outputs into a single `output/full_report.md` with these sections:

1. **Executive Summary** — Book title, niche, target audience, and key metrics
2. **Market Research** — From niche researcher
3. **Book Blueprint & Sample Chapters** — From ghostwriter
4. **Cover Design Brief** — From cover designer
5. **Marketing & Launch Plan** — From marketing specialist
6. **Developmental Edit Report** — From developmental editor
7. **Copy Edit & Proofread Report** — From proofreader
8. **Formatting Specifications** — From formatter
9. **Kindle Compilation Summary** — From kindle compiler
10. **Next Steps** — Action items for the user to publish

---

## Between Phases

After completing each agent's work:
1. Confirm the output was saved to the correct file
2. Provide a brief summary of what was produced
3. Ask the user if they want to review or adjust before continuing
4. Move to the next agent in the pipeline
