#!/usr/bin/env python3
"""
Parallel Chapter Expansion via Claude CLI Subprocesses.

Parses the ghostwriter outline, identifies unwritten chapters, and spawns
parallel `claude -p` processes to write each one independently. Each chapter
gets its own context window with the voice guide, outline, and dev editor
feedback injected into the prompt.

Usage:
    python write_chapters.py output/my-book                     # Write all unwritten chapters
    python write_chapters.py output/my-book --chapters 7,12     # Specific chapters only
    python write_chapters.py output/my-book --concurrency 3     # Limit parallelism
    python write_chapters.py output/my-book --model opus        # Model choice
    python write_chapters.py output/my-book --force             # Overwrite existing
    python write_chapters.py output/my-book --dry-run           # Preview prompts
"""

import argparse
import asyncio
import re
import sys
import time
from pathlib import Path


# ── Parsing ────────────────────────────────────────────────────────────────


def parse_ghostwriter(text: str) -> dict:
    """Parse ghostwriter output into structured components."""
    result = {
        "voice_guide": "",
        "parts": [],          # list of {"title": str, "chapters": [int]}
        "chapters": {},       # {chapter_num: {"title": str, "outline": str}}
        "sample_chapters": {},  # {chapter_num: str}  (full text)
        "blueprint": "",
    }

    # Extract voice guide
    voice_match = re.search(
        r"### Tone & Voice Guide\s*\n(.*?)(?=\n---|\n## \d)", text, re.DOTALL
    )
    if voice_match:
        result["voice_guide"] = voice_match.group(1).strip()

    # Extract blueprint section (everything from ## 1. Book Blueprint to ## 2.)
    blueprint_match = re.search(
        r"## 1\. Book Blueprint\s*\n(.*?)(?=\n## 2\.)", text, re.DOTALL
    )
    if blueprint_match:
        result["blueprint"] = blueprint_match.group(1).strip()

    # Extract parts and chapter outlines from ## 2. Detailed Chapter Outline
    outline_match = re.search(
        r"## 2\. Detailed Chapter Outline\s*\n(.*?)(?=\n---\s*\n## 3\.)", text, re.DOTALL
    )
    if not outline_match:
        # Fallback: try without the --- separator
        outline_match = re.search(
            r"## 2\. Detailed Chapter Outline\s*\n(.*?)(?=\n## 3\.)", text, re.DOTALL
        )

    if outline_match:
        outline_text = outline_match.group(1)
        _parse_outline(outline_text, result)

    # Extract sample chapters from ## 3. Sample Chapters
    sample_match = re.search(
        r"## 3\. Sample Chapters\s*\n(.*?)(?=\n---\s*\n## 4\.|\n## 4\.)", text, re.DOTALL
    )
    if sample_match:
        sample_text = sample_match.group(1)
        _parse_sample_chapters(sample_text, result)

    return result


def _parse_outline(outline_text: str, result: dict):
    """Parse the detailed chapter outline into parts and chapters."""
    current_part = None
    current_chapter_num = None
    current_chapter_title = None
    current_chapter_lines = []

    for line in outline_text.split("\n"):
        # Match PART headings like ### PART 1: THE QUESTION (3 chapters, ~30 pages)
        part_match = re.match(r"^### (PART \d+:.*?)(?:\s*\(.*\))?\s*$", line)
        if part_match:
            # Save previous chapter if any
            if current_chapter_num is not None:
                result["chapters"][current_chapter_num] = {
                    "title": current_chapter_title,
                    "outline": "\n".join(current_chapter_lines).strip(),
                }
            current_part = {"title": part_match.group(1).strip(), "chapters": []}
            result["parts"].append(current_part)
            current_chapter_num = None
            current_chapter_lines = []
            continue

        # Match chapter headings like **Chapter 1: The 9 PM Slack**
        ch_match = re.match(r"^\*\*Chapter (\d+):\s*(.+?)\*\*\s*$", line)
        if ch_match:
            # Save previous chapter
            if current_chapter_num is not None:
                result["chapters"][current_chapter_num] = {
                    "title": current_chapter_title,
                    "outline": "\n".join(current_chapter_lines).strip(),
                }
            current_chapter_num = int(ch_match.group(1))
            current_chapter_title = ch_match.group(2).strip()
            current_chapter_lines = []
            if current_part is not None:
                current_part["chapters"].append(current_chapter_num)
            continue

        # Accumulate outline content for current chapter
        if current_chapter_num is not None:
            current_chapter_lines.append(line)

    # Save last chapter
    if current_chapter_num is not None:
        result["chapters"][current_chapter_num] = {
            "title": current_chapter_title,
            "outline": "\n".join(current_chapter_lines).strip(),
        }


def _parse_sample_chapters(sample_text: str, result: dict):
    """Extract full sample chapter texts."""
    # Split on chapter headings like ### CHAPTER 1: ...
    parts = re.split(r"(?=^### CHAPTER \d+:)", sample_text, flags=re.MULTILINE)
    for part in parts:
        ch_match = re.match(r"^### CHAPTER (\d+):\s*(.+)\n", part)
        if ch_match:
            ch_num = int(ch_match.group(1))
            # Convert ### CHAPTER to # Chapter for consistency
            chapter_text = re.sub(
                r"^### CHAPTER (\d+):",
                r"# Chapter \1:",
                part,
                count=1,
            ).strip()
            result["sample_chapters"][ch_num] = chapter_text


def parse_dev_editor(text: str) -> dict[int, str]:
    """Extract per-chapter feedback from the developmental editor output."""
    feedback = {}
    # Match sections like #### Chapter N: Title
    parts = re.split(r"(?=^#### Chapter \d+:)", text, flags=re.MULTILINE)
    for part in parts:
        ch_match = re.match(r"^#### Chapter (\d+):", part)
        if ch_match:
            ch_num = int(ch_match.group(1))
            feedback[ch_num] = part.strip()
    return feedback


def extract_audience_keywords(niche_text: str) -> str:
    """Extract audience persona and keyword data from niche researcher output."""
    sections = []

    # Extract target audience persona
    persona_match = re.search(
        r"## 3\. Target Audience Persona\s*\n(.*?)(?=\n## \d\.)",
        niche_text,
        re.DOTALL,
    )
    if persona_match:
        sections.append("### Audience Persona\n" + persona_match.group(1).strip())

    # Extract keyword strategy
    kw_match = re.search(
        r"## 2\. Keyword Strategy\s*\n(.*?)(?=\n## \d\.)",
        niche_text,
        re.DOTALL,
    )
    if kw_match:
        # Just take first ~500 chars to keep prompt concise
        kw_text = kw_match.group(1).strip()
        if len(kw_text) > 500:
            kw_text = kw_text[:500] + "\n..."
        sections.append("### Target Keywords\n" + kw_text)

    return "\n\n".join(sections) if sections else ""


# ── Prompt Building ────────────────────────────────────────────────────────


def get_sample_excerpts(sample_chapters: dict[int, str], max_words: int = 500) -> str:
    """Get ~500 word excerpts from each sample chapter for voice matching."""
    excerpts = []
    for ch_num in sorted(sample_chapters.keys()):
        text = sample_chapters[ch_num]
        words = text.split()
        excerpt = " ".join(words[:max_words])
        if len(words) > max_words:
            excerpt += "\n[... excerpt truncated ...]"
        excerpts.append(f"--- Sample from Chapter {ch_num} ---\n{excerpt}")
    return "\n\n".join(excerpts)


def build_outline_summary(parsed: dict) -> str:
    """Build a condensed full-book outline for continuity context."""
    lines = []
    for part in parsed["parts"]:
        lines.append(f"\n**{part['title']}**")
        for ch_num in part["chapters"]:
            ch = parsed["chapters"].get(ch_num, {})
            title = ch.get("title", f"Chapter {ch_num}")
            # Extract just the first 2-3 bullet points for brevity
            outline = ch.get("outline", "")
            bullets = [
                l.strip()
                for l in outline.split("\n")
                if l.strip().startswith("-") or l.strip().startswith("*")
            ]
            summary = "; ".join(b.lstrip("-* ") for b in bullets[:3])
            is_sample = " [SAMPLE CHAPTER - already written]" if ch_num in parsed["sample_chapters"] else ""
            lines.append(f"  Ch {ch_num}: {title} — {summary}{is_sample}")
    return "\n".join(lines)


def build_chapter_prompt(
    ch_num: int,
    parsed: dict,
    dev_feedback: dict[int, str],
    audience_keywords: str,
) -> str:
    """Build the full prompt for a single chapter's claude -p invocation."""
    ch = parsed["chapters"][ch_num]
    title = ch["title"]
    outline = ch["outline"]

    # Extract word count target from outline if present
    wc_match = re.search(r"~([\d,]+)\s*words?", outline)
    word_target = wc_match.group(1).replace(",", "") if wc_match else "3400"

    # Get context about previous and next chapters
    all_nums = sorted(parsed["chapters"].keys())
    idx = all_nums.index(ch_num)
    prev_ch = all_nums[idx - 1] if idx > 0 else None
    next_ch = all_nums[idx + 1] if idx < len(all_nums) - 1 else None

    prev_context = ""
    if prev_ch:
        prev_title = parsed["chapters"][prev_ch]["title"]
        prev_context = f"Previous chapter (Ch {prev_ch}): \"{prev_title}\""

    next_context = ""
    if next_ch:
        next_title = parsed["chapters"][next_ch]["title"]
        next_context = f"Next chapter (Ch {next_ch}): \"{next_title}\""

    # Get developmental editor feedback for this chapter
    editor_notes = dev_feedback.get(ch_num, "No specific editor feedback for this chapter.")

    # Get sample excerpts for voice matching
    excerpts = get_sample_excerpts(parsed["sample_chapters"])

    # Get condensed outline
    outline_summary = build_outline_summary(parsed)

    # Determine which PART this chapter belongs to
    part_title = ""
    for part in parsed["parts"]:
        if ch_num in part["chapters"]:
            part_title = part["title"]
            break

    prompt = f"""You are a professional ghostwriter. Write Chapter {ch_num} of a Kindle book in full.

## YOUR ASSIGNMENT

**Chapter {ch_num}: {title}**
**Part:** {part_title}
**Target word count:** ~{word_target} words

### Chapter Outline (cover ALL of these points):
{outline}

### Continuity
{prev_context}
{next_context}

---

## VOICE & STYLE GUIDE

{parsed["voice_guide"]}

### Sample Excerpts (match this voice exactly):

{excerpts}

---

## FULL BOOK OUTLINE (for context and continuity):

{outline_summary}

---

## DEVELOPMENTAL EDITOR FEEDBACK FOR THIS CHAPTER:

{editor_notes}

---

## AUDIENCE & KEYWORDS:

{audience_keywords}

---

## INSTRUCTIONS

1. Write the COMPLETE chapter as polished, publish-ready prose
2. Start with: # Chapter {ch_num}: {title}
3. Use ### for section subheadings (3-6 sections)
4. Match the voice from the sample excerpts exactly
5. Cover every bullet point from the outline
6. Address the developmental editor's feedback
7. Open with a hook, close with a bridge to the next chapter
8. Target ~{word_target} words — no filler, no placeholders
9. Output ONLY the chapter markdown — no preamble or commentary"""

    return prompt


# ── Subprocess Execution ───────────────────────────────────────────────────


async def _spawn_claude(prompt: str, model: str) -> tuple[int, str, str]:
    """Spawn a claude -p subprocess, passing the prompt via stdin.

    Returns (returncode, stdout, stderr).
    """
    proc = await asyncio.create_subprocess_exec(
        "claude",
        "-p",
        "--model", model,
        "--output-format", "text",
        "--no-session-persistence",
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    stdout, stderr = await proc.communicate(input=prompt.encode("utf-8"))
    return (
        proc.returncode,
        stdout.decode("utf-8", errors="replace").strip(),
        stderr.decode("utf-8", errors="replace").strip(),
    )


async def run_chapter(
    ch_num: int,
    ch_title: str,
    prompt: str,
    output_dir: Path,
    model: str,
    semaphore: asyncio.Semaphore,
    force: bool = False,
) -> dict:
    """Spawn a claude -p subprocess to write one chapter."""
    output_file = output_dir / f"ch{ch_num:02d}.md"

    if output_file.exists() and not force:
        return {
            "chapter": ch_num,
            "status": "skipped",
            "reason": f"{output_file.name} already exists (use --force to overwrite)",
            "duration": 0,
            "word_count": 0,
        }

    async with semaphore:
        print(f"  ▶ Chapter {ch_num}: starting generation...")
        start = time.time()

        try:
            returncode, output, error = await _spawn_claude(prompt, model)
            duration = time.time() - start

            if returncode != 0:
                print(f"  ✗ Chapter {ch_num}: failed ({duration:.1f}s) — {error[:200]}")
                return {
                    "chapter": ch_num,
                    "status": "error",
                    "reason": error[:500],
                    "duration": duration,
                    "word_count": 0,
                }

            # Validate output
            word_count = len(output.split())
            has_heading = bool(re.match(rf"#\s+Chapter\s+{ch_num}\b", output))

            if word_count < 500:
                print(f"  ⚠ Chapter {ch_num}: output too short ({word_count} words), retrying...")
                rc2, output2, _ = await _spawn_claude(prompt, model)
                duration = time.time() - start
                wc2 = len(output2.split())

                if wc2 > word_count:
                    output = output2
                    word_count = wc2
                    has_heading = bool(re.match(rf"#\s+Chapter\s+{ch_num}\b", output))

            if word_count < 500:
                print(f"  ✗ Chapter {ch_num}: still too short after retry ({word_count} words)")
                return {
                    "chapter": ch_num,
                    "status": "warning",
                    "reason": f"Output only {word_count} words (expected 1000+)",
                    "duration": duration,
                    "word_count": word_count,
                }

            # Add heading if missing
            if not has_heading:
                first_line = output.split("\n")[0].strip()
                if not first_line.startswith("#"):
                    output = f"# Chapter {ch_num}: {ch_title}\n\n{output}"

            # Save
            output_file.write_text(output, encoding="utf-8")
            print(f"  ✓ Chapter {ch_num}: done ({word_count:,} words, {duration:.1f}s)")

            return {
                "chapter": ch_num,
                "status": "success",
                "reason": "",
                "duration": duration,
                "word_count": word_count,
            }

        except FileNotFoundError:
            print("  ✗ Error: 'claude' CLI not found. Install Claude Code first.")
            return {
                "chapter": ch_num,
                "status": "error",
                "reason": "claude CLI not found",
                "duration": 0,
                "word_count": 0,
            }
        except Exception as e:
            duration = time.time() - start
            print(f"  ✗ Chapter {ch_num}: exception — {e}")
            return {
                "chapter": ch_num,
                "status": "error",
                "reason": str(e),
                "duration": duration,
                "word_count": 0,
            }


# ── Public API (for orchestrator.py integration) ──────────────────────────


async def expand_chapters(
    project_dir: str | Path,
    chapters: list[int] | None = None,
    concurrency: int = 5,
    model: str = "sonnet",
    force: bool = False,
    dry_run: bool = False,
) -> list[dict]:
    """
    Expand unwritten chapters for a book project.

    Args:
        project_dir: Path to the project output directory (e.g. output/my-book)
        chapters: Specific chapter numbers to write (None = all unwritten)
        concurrency: Max parallel claude processes
        model: Claude model to use
        force: Overwrite existing chapter files
        dry_run: Print prompts without executing

    Returns:
        List of result dicts with status for each chapter.
    """
    project_dir = Path(project_dir)

    # Read inputs
    ghostwriter_path = project_dir / "ghostwriter.md"
    dev_editor_path = project_dir / "developmental_editor.md"
    niche_path = project_dir / "niche_researcher.md"

    if not ghostwriter_path.exists():
        print(f"Error: {ghostwriter_path} not found. Run the ghostwriter first.")
        return []

    ghostwriter_text = ghostwriter_path.read_text(encoding="utf-8")
    parsed = parse_ghostwriter(ghostwriter_text)

    if not parsed["chapters"]:
        print("Error: Could not parse any chapters from ghostwriter output.")
        return []

    # Parse dev editor feedback (optional)
    dev_feedback = {}
    if dev_editor_path.exists():
        dev_editor_text = dev_editor_path.read_text(encoding="utf-8")
        dev_feedback = parse_dev_editor(dev_editor_text)

    # Parse audience/keywords (optional)
    audience_keywords = ""
    if niche_path.exists():
        niche_text = niche_path.read_text(encoding="utf-8")
        audience_keywords = extract_audience_keywords(niche_text)

    # Determine which chapters to write
    all_chapter_nums = sorted(parsed["chapters"].keys())
    sample_nums = set(parsed["sample_chapters"].keys())

    if chapters:
        target_nums = [n for n in chapters if n in parsed["chapters"]]
    else:
        # All chapters except samples (unless --force)
        target_nums = [
            n for n in all_chapter_nums
            if n not in sample_nums or force
        ]

    if not target_nums:
        print("No chapters to expand. All chapters already written or no targets specified.")
        return []

    # Create chapters directory
    chapters_dir = project_dir / "chapters"
    chapters_dir.mkdir(parents=True, exist_ok=True)

    # Copy sample chapters to chapters/ directory
    for ch_num, ch_text in parsed["sample_chapters"].items():
        sample_file = chapters_dir / f"ch{ch_num:02d}.md"
        if not sample_file.exists() or force:
            sample_file.write_text(ch_text, encoding="utf-8")
            print(f"  📋 Copied sample chapter {ch_num} to {sample_file.name}")

    # Build prompts
    prompts = {}
    for ch_num in target_nums:
        prompts[ch_num] = build_chapter_prompt(
            ch_num, parsed, dev_feedback, audience_keywords
        )

    print(f"\n{'=' * 60}")
    print("CHAPTER EXPANSION")
    print(f"{'=' * 60}")
    print(f"  Project:     {project_dir}")
    print(f"  Model:       {model}")
    print(f"  Concurrency: {concurrency}")
    print(f"  Total chapters in book: {len(all_chapter_nums)}")
    print(f"  Sample chapters: {sorted(sample_nums)}")
    print(f"  Chapters to write: {target_nums}")
    print(f"  Force overwrite: {force}")
    print()

    if dry_run:
        print("DRY RUN — printing prompts without executing:\n")
        for ch_num in target_nums:
            prompt = prompts[ch_num]
            print(f"{'─' * 60}")
            print(f"Chapter {ch_num} prompt ({len(prompt)} chars):")
            print(f"{'─' * 60}")
            # Print first/last 500 chars
            if len(prompt) > 1200:
                print(prompt[:600])
                print(f"\n  ... [{len(prompt) - 1200} chars omitted] ...\n")
                print(prompt[-600:])
            else:
                print(prompt)
            print()
        return [{"chapter": n, "status": "dry_run"} for n in target_nums]

    # Execute in parallel
    semaphore = asyncio.Semaphore(concurrency)
    tasks = [
        run_chapter(
            ch_num,
            parsed["chapters"][ch_num]["title"],
            prompts[ch_num],
            chapters_dir,
            model,
            semaphore,
            force,
        )
        for ch_num in target_nums
    ]

    start_time = time.time()
    results = await asyncio.gather(*tasks)
    total_duration = time.time() - start_time

    # Print summary
    print(f"\n{'=' * 60}")
    print("EXPANSION COMPLETE")
    print(f"{'=' * 60}")

    succeeded = [r for r in results if r["status"] == "success"]
    skipped = [r for r in results if r["status"] == "skipped"]
    warnings = [r for r in results if r["status"] == "warning"]
    errors = [r for r in results if r["status"] == "error"]

    total_words = sum(r["word_count"] for r in results)

    print(f"  Succeeded: {len(succeeded)}")
    print(f"  Skipped:   {len(skipped)}")
    print(f"  Warnings:  {len(warnings)}")
    print(f"  Errors:    {len(errors)}")
    print(f"  Total words written: {total_words:,}")
    print(f"  Total time: {total_duration:.1f}s")

    if errors:
        print("\n  Failed chapters:")
        for r in errors:
            print(f"    Ch {r['chapter']}: {r['reason'][:100]}")

    if warnings:
        print("\n  Warnings:")
        for r in warnings:
            print(f"    Ch {r['chapter']}: {r['reason']}")

    print(f"\n  Output: {chapters_dir}/")

    return results


# ── CLI Entry Point ────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(
        description="Expand unwritten book chapters using parallel Claude CLI subprocesses.",
    )
    parser.add_argument(
        "project_dir",
        type=Path,
        help="Path to the project output directory (e.g. output/my-book)",
    )
    parser.add_argument(
        "--chapters",
        type=str,
        default=None,
        help="Comma-separated chapter numbers to write (default: all unwritten)",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=5,
        help="Max parallel claude processes (default: 5)",
    )
    parser.add_argument(
        "--model",
        type=str,
        default="sonnet",
        help="Claude model to use (default: sonnet)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing chapter files",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview prompts without executing",
    )

    args = parser.parse_args()

    # Parse chapter list
    chapter_list = None
    if args.chapters:
        try:
            chapter_list = [int(n.strip()) for n in args.chapters.split(",") if n.strip()]
        except ValueError:
            parser.error(f"--chapters must be comma-separated integers, got: {args.chapters!r}")

    results = asyncio.run(
        expand_chapters(
            project_dir=args.project_dir,
            chapters=chapter_list,
            concurrency=args.concurrency,
            model=args.model,
            force=args.force,
            dry_run=args.dry_run,
        )
    )

    # Exit with error code if any chapters failed
    if any(r.get("status") == "error" for r in results):
        sys.exit(1)


if __name__ == "__main__":
    main()
