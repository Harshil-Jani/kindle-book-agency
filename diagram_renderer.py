#!/usr/bin/env python3
"""
Diagram Renderer for Book Writer Pipeline

Parses ```diagram``` fenced code blocks from chapter markdown and generates
clean, Kindle-optimized PNG visuals using matplotlib.

Supported diagram types:
  venn, spectrum, pyramid, cycle, progression, curve,
  ladder, pillars, canvas

Design spec:
  - Max width: 5 inches (Kindle readability)
  - Resolution: 200 DPI
  - Color scheme: Navy #1A2B4A, Amber #D4A843, Slate #4A5A7A
  - Clean, minimal style with no unnecessary chrome
  - Non-overlapping labels, readable at small sizes
"""

import hashlib
import re
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np

# ── Color Palette ────────────────────────────────────────────────────────

NAVY = "#1A2B4A"
AMBER = "#D4A843"
SLATE = "#4A5A7A"
LIGHT_SLATE = "#8A9AB0"
WHITE = "#FFFFFF"
LIGHT_GRAY = "#F0F0F0"
MID_GRAY = "#E0E0E0"
SOFT_GREEN = "#3A7D5C"
SOFT_RED = "#B04A4A"
SOFT_BLUE = "#3A6B9F"

ZONE_COLORS = [SOFT_GREEN, AMBER, SOFT_RED]
STAGE_COLORS = [LIGHT_GRAY, "#D6E4F0", "#A8C5E2", NAVY]
STAGE_TEXT_COLORS = [NAVY, NAVY, NAVY, WHITE]


# ── Spec Parser ──────────────────────────────────────────────────────────


def parse_diagram_spec(text: str) -> dict:
    """Parse a simple key-value diagram specification from a ```diagram block."""
    spec = {}
    current_key = None

    for line in text.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        if line.startswith("- "):
            # List item for current key
            if current_key is not None and isinstance(spec.get(current_key), list):
                spec[current_key].append(line[2:].strip())
        elif ":" in line:
            key, _, value = line.partition(":")
            key = key.strip()
            value = value.strip()
            if value:
                spec[key] = value
            else:
                spec[key] = []
                current_key = key

    return spec


def spec_hash(spec: dict) -> str:
    """Generate a short deterministic hash for a diagram spec."""
    raw = str(sorted(spec.items()))
    return hashlib.md5(raw.encode()).hexdigest()[:8]


# ── Common Setup ─────────────────────────────────────────────────────────


def _new_figure(width=5.0, height=3.5):
    """Create a new figure with standard settings."""
    fig, ax = plt.subplots(figsize=(width, height))
    ax.set_facecolor(WHITE)
    fig.patch.set_facecolor(WHITE)
    return fig, ax


def _save(fig, path: Path):
    """Save figure and close."""
    fig.savefig(str(path), dpi=200, bbox_inches="tight", facecolor=WHITE, pad_inches=0.15)
    plt.close(fig)


def _add_title(ax, title: str, y=1.02):
    """Add a centered title above the axes."""
    ax.set_title(title, fontsize=12, fontweight="bold", color=NAVY, pad=12, y=y)


# ── Diagram Renderers ───────────────────────────────────────────────────


def render_venn(spec: dict, path: Path):
    """Render a 2- or 3-circle Venn diagram."""
    fig, ax = _new_figure(5.0, 4.0)
    ax.set_xlim(-2.5, 2.5)
    ax.set_ylim(-2.2, 2.2)
    ax.set_aspect("equal")
    ax.axis("off")

    title = spec.get("title", "Venn Diagram")
    _add_title(ax, title, y=1.0)

    label1 = spec.get("label1", "A")
    label2 = spec.get("label2", "B")
    label3 = spec.get("label3", "")
    center = spec.get("center", "")

    colors_list = [NAVY, AMBER, SLATE]

    if label3:
        # 3-circle Venn
        positions = [(0, 0.6), (-0.8, -0.5), (0.8, -0.5)]
        labels = [label1, label2, label3]
        label_offsets = [(0, 1.55), (-1.6, -1.2), (1.6, -1.2)]

        for i, (cx, cy) in enumerate(positions):
            circle = plt.Circle(
                (cx, cy), 1.1, alpha=0.2, color=colors_list[i], linewidth=2,
                edgecolor=colors_list[i]
            )
            ax.add_patch(circle)

        for i, (lx, ly) in enumerate(label_offsets):
            ax.text(lx, ly, labels[i], ha="center", va="center",
                    fontsize=9, fontweight="bold", color=colors_list[i])

        if center:
            ax.text(0, 0.05, center, ha="center", va="center",
                    fontsize=10, fontweight="bold", color=AMBER,
                    bbox=dict(boxstyle="round,pad=0.3", facecolor=WHITE, edgecolor=AMBER, alpha=0.9))

        # Overlap labels
        overlaps = {
            "overlap_12": ((-0.45, 0.05), 7),
            "overlap_13": ((0.45, 0.05), 7),
            "overlap_23": ((0.0, -0.75), 7),
        }
        for key, (pos, fs) in overlaps.items():
            text = spec.get(key, "")
            if text:
                ax.text(pos[0], pos[1], text, ha="center", va="center",
                        fontsize=fs, color=SLATE, style="italic", alpha=0.8)
    else:
        # 2-circle Venn
        positions = [(-0.55, 0), (0.55, 0)]
        labels = [label1, label2]
        label_offsets = [(-1.3, 0), (1.3, 0)]

        for i, (cx, cy) in enumerate(positions):
            circle = plt.Circle(
                (cx, cy), 1.0, alpha=0.2, color=colors_list[i], linewidth=2,
                edgecolor=colors_list[i]
            )
            ax.add_patch(circle)

        for i, (lx, ly) in enumerate(label_offsets):
            ax.text(lx, ly, labels[i], ha="center", va="center",
                    fontsize=10, fontweight="bold", color=colors_list[i])

        if center:
            ax.text(0, 0, center, ha="center", va="center",
                    fontsize=10, fontweight="bold", color=AMBER,
                    bbox=dict(boxstyle="round,pad=0.3", facecolor=WHITE, edgecolor=AMBER))

    _save(fig, path)


def render_spectrum(spec: dict, path: Path):
    """Render a horizontal bar divided into color-coded zones."""
    fig, ax = _new_figure(5.0, 2.5)
    ax.axis("off")

    title = spec.get("title", "Spectrum")
    _add_title(ax, title)

    # Collect zones
    zones = []
    i = 1
    while f"zone{i}" in spec:
        parts = spec[f"zone{i}"].split("|", 1)
        name = parts[0].strip()
        detail = parts[1].strip() if len(parts) > 1 else ""
        zones.append((name, detail))
        i += 1

    if not zones:
        zones = [("Zone 1", ""), ("Zone 2", ""), ("Zone 3", "")]

    n = len(zones)
    bar_y = 0.45
    bar_h = 0.25
    width = 0.9 / n

    for idx, (name, detail) in enumerate(zones):
        x = 0.05 + idx * width
        color = ZONE_COLORS[idx % len(ZONE_COLORS)]
        rect = plt.Rectangle((x, bar_y), width - 0.01, bar_h,
                              transform=ax.transAxes, facecolor=color, alpha=0.75,
                              edgecolor=WHITE, linewidth=2)
        ax.add_patch(rect)
        ax.text(x + width / 2, bar_y + bar_h / 2, name,
                transform=ax.transAxes, ha="center", va="center",
                fontsize=8, fontweight="bold", color=WHITE)
        if detail:
            ax.text(x + width / 2, bar_y - 0.08, detail,
                    transform=ax.transAxes, ha="center", va="top",
                    fontsize=6.5, color=SLATE, style="italic")

    # Arrow labels
    left = spec.get("left_label", "")
    right = spec.get("right_label", "")
    if left:
        ax.annotate("", xy=(0.9, 0.15), xytext=(0.1, 0.15),
                     xycoords="axes fraction",
                     arrowprops=dict(arrowstyle="->", color=SLATE, lw=1.5))
        ax.text(0.05, 0.15, left, transform=ax.transAxes, ha="left", va="center",
                fontsize=7, color=SLATE)
        ax.text(0.95, 0.15, right, transform=ax.transAxes, ha="right", va="center",
                fontsize=7, color=SLATE)

    _save(fig, path)


def render_pyramid(spec: dict, path: Path):
    """Render a layered pyramid/stack (bottom = widest)."""
    fig, ax = _new_figure(5.0, 3.5)
    ax.axis("off")
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8)

    title = spec.get("title", "Pyramid")
    _add_title(ax, title)

    # Collect layers (bottom-up order: layer1 is bottom)
    layers = []
    i = 1
    while f"layer{i}" in spec:
        parts = spec[f"layer{i}"].split("|", 1)
        name = parts[0].strip()
        detail = parts[1].strip() if len(parts) > 1 else ""
        layers.append((name, detail))
        i += 1

    if not layers:
        return

    n = len(layers)
    layer_h = 5.5 / n
    colors = [NAVY, SLATE, AMBER]

    for idx, (name, detail) in enumerate(layers):
        y = 0.5 + idx * (layer_h + 0.3)
        # Width narrows as we go up
        w = 9.0 - idx * (3.0 / n)
        x = (10 - w) / 2
        color = colors[idx % len(colors)]

        rect = FancyBboxPatch((x, y), w, layer_h * 0.85,
                               boxstyle="round,pad=0.15", facecolor=color,
                               edgecolor=WHITE, linewidth=2, alpha=0.85)
        ax.add_patch(rect)

        text_color = WHITE if idx < 2 else NAVY
        ax.text(5, y + layer_h * 0.5, name, ha="center", va="center",
                fontsize=10, fontweight="bold", color=text_color)
        if detail:
            ax.text(5, y + layer_h * 0.15, detail, ha="center", va="center",
                    fontsize=7, color=text_color, alpha=0.8, style="italic")

    # Upward arrows between layers
    for idx in range(n - 1):
        y_from = 0.5 + idx * (layer_h + 0.3) + layer_h * 0.85
        y_to = 0.5 + (idx + 1) * (layer_h + 0.3)
        ax.annotate("", xy=(5, y_to), xytext=(5, y_from),
                     arrowprops=dict(arrowstyle="->", color=AMBER, lw=2))

    _save(fig, path)


def render_cycle(spec: dict, path: Path):
    """Render a circular process with connected nodes."""
    fig, ax = _new_figure(5.0, 5.0)
    ax.set_xlim(-2.5, 2.5)
    ax.set_ylim(-2.5, 2.5)
    ax.set_aspect("equal")
    ax.axis("off")

    title = spec.get("title", "Cycle")
    _add_title(ax, title, y=1.0)

    nodes = spec.get("nodes", [])
    if not nodes:
        return

    n = len(nodes)
    radius = 1.7
    angles = [90 - i * (360 / n) for i in range(n)]  # Start at top, go clockwise

    positions = []
    for angle in angles:
        rad = np.radians(angle)
        positions.append((radius * np.cos(rad), radius * np.sin(rad)))

    # Draw nodes
    for i, (x, y) in enumerate(positions):
        circle = plt.Circle((x, y), 0.45, facecolor=NAVY, edgecolor=WHITE,
                             linewidth=2, alpha=0.9)
        ax.add_patch(circle)
        # Wrap long labels
        label = nodes[i]
        if len(label) > 12:
            words = label.split()
            mid = len(words) // 2
            label = " ".join(words[:mid]) + "\n" + " ".join(words[mid:])
        ax.text(x, y, label, ha="center", va="center",
                fontsize=6.5, fontweight="bold", color=WHITE)

    # Draw arrows between nodes
    for i in range(n):
        x1, y1 = positions[i]
        x2, y2 = positions[(i + 1) % n]
        # Shorten arrow to not overlap circles
        dx, dy = x2 - x1, y2 - y1
        dist = np.sqrt(dx**2 + dy**2)
        shrink = 0.5 / dist
        sx, sy = x1 + dx * shrink, y1 + dy * shrink
        ex, ey = x2 - dx * shrink, y2 - dy * shrink

        ax.annotate("", xy=(ex, ey), xytext=(sx, sy),
                     arrowprops=dict(arrowstyle="->,head_width=0.3",
                                     color=AMBER, lw=2))

    _save(fig, path)


def render_progression(spec: dict, path: Path):
    """Render a left-to-right stage progression with arrows."""
    # Collect stages
    stages = []
    i = 1
    while f"stage{i}" in spec:
        parts = spec[f"stage{i}"].split("|", 1)
        name = parts[0].strip()
        detail = parts[1].strip() if len(parts) > 1 else ""
        stages.append((name, detail))
        i += 1

    if not stages:
        return

    n = len(stages)
    fig, ax = _new_figure(5.0, 2.2)
    ax.axis("off")
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 4)

    title = spec.get("title", "Progression")
    _add_title(ax, title)

    box_w = 7.5 / n
    gap = 0.5
    total_w = n * box_w + (n - 1) * gap
    start_x = (10 - total_w) / 2

    for idx, (name, detail) in enumerate(stages):
        x = start_x + idx * (box_w + gap)
        color = STAGE_COLORS[idx % len(STAGE_COLORS)]
        text_color = STAGE_TEXT_COLORS[idx % len(STAGE_TEXT_COLORS)]

        rect = FancyBboxPatch((x, 1.2), box_w, 1.8,
                               boxstyle="round,pad=0.15", facecolor=color,
                               edgecolor=NAVY, linewidth=1.5, alpha=0.9)
        ax.add_patch(rect)

        ax.text(x + box_w / 2, 2.35, name, ha="center", va="center",
                fontsize=8, fontweight="bold", color=text_color)
        if detail:
            ax.text(x + box_w / 2, 1.65, detail, ha="center", va="center",
                    fontsize=6.5, color=text_color, alpha=0.7, style="italic")

        # Arrow to next
        if idx < n - 1:
            ax.annotate("", xy=(x + box_w + gap * 0.15, 2.1),
                         xytext=(x + box_w + 0.05, 2.1),
                         arrowprops=dict(arrowstyle="->,head_width=0.2",
                                         color=AMBER, lw=2))

    _save(fig, path)


def render_curve(spec: dict, path: Path):
    """Render an illustrative curve with labeled phases."""
    fig, ax = _new_figure(5.0, 3.0)

    title = spec.get("title", "Curve")
    _add_title(ax, title)

    phases = spec.get("phases", [])
    if not phases:
        phases = ["Phase 1", "Phase 2", "Phase 3", "Phase 4", "Phase 5"]

    n = len(phases)

    # Generate a wow-to-disappointment style curve
    x = np.linspace(0, 12, 200)
    # High start, quick dip, trough, gradual recovery, plateau
    y = (1.0 * np.exp(-0.3 * x) +
         0.6 * (1 - np.exp(-0.3 * (x - 3))) +
         0.15 * np.sin(0.5 * x) * np.exp(-0.15 * x))
    # Normalize
    y = (y - y.min()) / (y.max() - y.min()) * 0.8 + 0.1

    ax.plot(x, y, color=NAVY, linewidth=2.5)
    ax.fill_between(x, 0, y, alpha=0.08, color=NAVY)

    # Phase labels at evenly spaced x positions
    phase_xs = np.linspace(0.5, 11.5, n)
    for i, (px, phase) in enumerate(zip(phase_xs, phases)):
        # Find y at this x
        idx = np.argmin(np.abs(x - px))
        py = y[idx]
        ax.plot(px, py, "o", color=AMBER, markersize=6, zorder=5)

        # Offset label to avoid overlap
        offset_y = 0.12 if i % 2 == 0 else -0.12
        va = "bottom" if offset_y > 0 else "top"
        ax.text(px, py + offset_y, phase, ha="center", va=va,
                fontsize=7, fontweight="bold", color=SLATE,
                bbox=dict(boxstyle="round,pad=0.15", facecolor=WHITE,
                          edgecolor=MID_GRAY, alpha=0.9))

    ax.set_xlabel(spec.get("x_label", "Time"), fontsize=8, color=SLATE)
    ax.set_ylabel(spec.get("y_label", ""), fontsize=8, color=SLATE)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color(MID_GRAY)
    ax.spines["bottom"].set_color(MID_GRAY)
    ax.tick_params(colors=MID_GRAY, labelsize=7)
    ax.set_yticks([])
    ax.set_xticks([])

    _save(fig, path)


def render_ladder(spec: dict, path: Path):
    """Render a vertical ascending ladder/steps."""
    # Collect rungs
    rungs = []
    i = 1
    while f"rung{i}" in spec:
        parts = spec[f"rung{i}"].split("|", 1)
        name = parts[0].strip()
        detail = parts[1].strip() if len(parts) > 1 else ""
        rungs.append((name, detail))
        i += 1

    if not rungs:
        return

    n = len(rungs)
    fig, ax = _new_figure(5.0, 3.5)
    ax.axis("off")
    ax.set_xlim(0, 10)
    ax.set_ylim(0, n * 2 + 1)

    title = spec.get("title", "Ladder")
    _add_title(ax, title)

    for idx, (name, detail) in enumerate(rungs):
        y = idx * 2 + 0.5
        w = 4.5 + idx * 0.8  # Wider as we go up (more responsibility)
        x = (10 - w) / 2
        color_val = 0.15 + idx * (0.85 / max(n - 1, 1))
        color = plt.cm.Blues(color_val * 0.7 + 0.3)
        text_color = WHITE if color_val > 0.5 else NAVY

        rect = FancyBboxPatch((x, y), w, 1.4,
                               boxstyle="round,pad=0.12", facecolor=color,
                               edgecolor=WHITE, linewidth=2)
        ax.add_patch(rect)

        # Rung number
        ax.text(x + 0.4, y + 0.7, f"{idx + 1}", ha="center", va="center",
                fontsize=12, fontweight="bold", color=text_color, alpha=0.3)

        ax.text(x + w / 2, y + 0.9, name, ha="center", va="center",
                fontsize=9, fontweight="bold", color=text_color)
        if detail:
            ax.text(x + w / 2, y + 0.35, detail, ha="center", va="center",
                    fontsize=7, color=text_color, alpha=0.75, style="italic")

    _save(fig, path)


def render_pillars(spec: dict, path: Path):
    """Render side-by-side equal-height pillars/columns."""
    # Collect pillars
    pillars = []
    i = 1
    while f"pillar{i}" in spec:
        parts = spec[f"pillar{i}"].split("|", 1)
        name = parts[0].strip()
        detail = parts[1].strip() if len(parts) > 1 else ""
        pillars.append((name, detail))
        i += 1

    if not pillars:
        return

    n = len(pillars)
    fig, ax = _new_figure(5.0, 3.0)
    ax.axis("off")
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5)

    title = spec.get("title", "Framework")
    _add_title(ax, title)

    pillar_colors = [NAVY, AMBER, SLATE, SOFT_BLUE, SOFT_GREEN]
    pillar_w = 7.0 / n
    gap = 0.4
    total_w = n * pillar_w + (n - 1) * gap
    start_x = (10 - total_w) / 2

    # Top connecting bar
    ax.add_patch(FancyBboxPatch((start_x - 0.2, 3.5), total_w + 0.4, 0.4,
                                 boxstyle="round,pad=0.08", facecolor=NAVY,
                                 edgecolor=WHITE, linewidth=1.5))

    for idx, (name, detail) in enumerate(pillars):
        x = start_x + idx * (pillar_w + gap)
        color = pillar_colors[idx % len(pillar_colors)]
        text_color = WHITE

        rect = FancyBboxPatch((x, 0.5), pillar_w, 3.0,
                               boxstyle="round,pad=0.1", facecolor=color,
                               edgecolor=WHITE, linewidth=2, alpha=0.85)
        ax.add_patch(rect)

        # Letter label
        letter = name[0] if name else str(idx + 1)
        ax.text(x + pillar_w / 2, 2.8, letter, ha="center", va="center",
                fontsize=18, fontweight="bold", color=WHITE, alpha=0.3)

        ax.text(x + pillar_w / 2, 2.1, name, ha="center", va="center",
                fontsize=9, fontweight="bold", color=text_color)
        if detail:
            ax.text(x + pillar_w / 2, 1.3, detail, ha="center", va="center",
                    fontsize=7, color=text_color, alpha=0.8, style="italic")

    _save(fig, path)


def render_canvas(spec: dict, path: Path):
    """Render a grid of labeled cells (e.g., a business canvas)."""
    rows = int(spec.get("rows", 2))
    cols = int(spec.get("cols", 4))

    fig, ax = _new_figure(5.0, 2.0 + rows * 1.0)
    ax.axis("off")
    ax.set_xlim(0, 10)
    ax.set_ylim(0, rows * 2.5 + 1)

    title = spec.get("title", "Canvas")
    _add_title(ax, title)

    cell_w = 9.0 / cols
    cell_h = 2.0
    start_x = 0.5
    start_y = 0.3

    for r in range(rows):
        for c in range(cols):
            key = f"cell_{r + 1}_{c + 1}"
            label = spec.get(key, "")
            x = start_x + c * cell_w
            # Top row at top
            y = start_y + (rows - 1 - r) * (cell_h + 0.3)

            bg = LIGHT_GRAY if (r + c) % 2 == 0 else WHITE
            rect = FancyBboxPatch((x + 0.05, y + 0.05), cell_w - 0.1, cell_h - 0.1,
                                   boxstyle="round,pad=0.1", facecolor=bg,
                                   edgecolor=SLATE, linewidth=1.2)
            ax.add_patch(rect)

            if label:
                ax.text(x + cell_w / 2, y + cell_h / 2, label,
                        ha="center", va="center", fontsize=8,
                        fontweight="bold", color=NAVY)

    _save(fig, path)


# ── Dispatcher ───────────────────────────────────────────────────────────

RENDERERS = {
    "venn": render_venn,
    "spectrum": render_spectrum,
    "pyramid": render_pyramid,
    "cycle": render_cycle,
    "progression": render_progression,
    "curve": render_curve,
    "ladder": render_ladder,
    "pillars": render_pillars,
    "canvas": render_canvas,
}


def render_diagram(spec: dict, output_dir: Path) -> Path | None:
    """
    Render a diagram from a parsed spec dict.

    Args:
        spec: Parsed diagram specification (must include 'type' key).
        output_dir: Directory to save the generated PNG.

    Returns:
        Path to the generated PNG, or None if rendering failed.
    """
    diagram_type = spec.get("type", "").lower()
    renderer = RENDERERS.get(diagram_type)

    if not renderer:
        print(f"  [diagram] Unknown type: {diagram_type}")
        return None

    # Generate a filename from title or hash
    title = spec.get("title", "diagram")
    safe_title = re.sub(r"[^a-z0-9]+", "_", title.lower()).strip("_")
    filename = f"{safe_title}_{spec_hash(spec)}.png"

    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / filename

    try:
        renderer(spec, output_path)
        print(f"  [diagram] Rendered: {filename}")
        return output_path
    except Exception as e:
        print(f"  [diagram] Error rendering {diagram_type}: {e}")
        return None


# ── Markdown Scanner ─────────────────────────────────────────────────────


def extract_diagram_blocks(markdown_text: str) -> list[tuple[int, int, dict]]:
    """
    Find all ```diagram ... ``` blocks in markdown text.

    Returns list of (start_line, end_line, parsed_spec) tuples.
    Line numbers are 0-indexed into the split lines array.
    """
    lines = markdown_text.split("\n")
    blocks = []
    i = 0
    while i < len(lines):
        stripped = lines[i].strip()
        if stripped == "```diagram":
            start = i
            i += 1
            block_lines = []
            while i < len(lines) and lines[i].strip() != "```":
                block_lines.append(lines[i])
                i += 1
            end = i  # The closing ```
            spec = parse_diagram_spec("\n".join(block_lines))
            if spec.get("type"):
                blocks.append((start, end, spec))
        i += 1
    return blocks
