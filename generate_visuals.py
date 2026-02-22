#!/usr/bin/env python3
"""
Generate professional diagrams for "Product Intelligence" book.
Produces 10 PNG files for Kindle-optimized chapter visuals.
"""

import os
import math
import numpy as np
import matplotlib

matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Arc, Wedge
from matplotlib.path import Path
import matplotlib.patheffects as path_effects

# ── Color Palette ──────────────────────────────────────────────
NAVY = "#1A2B4A"
AMBER = "#D4A843"
SLATE = "#4A5A7A"
WHITE = "#FFFFFF"
LIGHT_GRAY = "#F0F0F0"
DARK_GRAY = "#8A8A8A"

# Supplementary colors for specific diagrams
GREEN_ZONE = "#3A7D5C"
RED_ZONE = "#9B3A3A"
AMBER_ZONE = AMBER
LIGHT_NAVY = "#2C4270"
LIGHT_AMBER = "#F5E6C0"

# ── Output directory ───────────────────────────────────────────
OUTPUT_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "output",
    "ai-for-product-managers",
    "chapters",
    "visuals",
)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Common settings ────────────────────────────────────────────
DPI = 200
MAX_WIDTH = 5.0  # inches
FONT_FAMILY = "sans-serif"

plt.rcParams.update(
    {
        "font.family": FONT_FAMILY,
        "text.color": NAVY,
        "axes.labelcolor": NAVY,
        "xtick.color": NAVY,
        "ytick.color": NAVY,
        "figure.facecolor": WHITE,
        "axes.facecolor": WHITE,
        "savefig.facecolor": WHITE,
        "savefig.edgecolor": WHITE,
    }
)


def save_fig(fig, filename):
    """Save figure with standard settings."""
    path = os.path.join(OUTPUT_DIR, filename)
    fig.savefig(path, dpi=DPI, bbox_inches="tight", pad_inches=0.15)
    plt.close(fig)
    print(f"  Saved: {path}")


# ═══════════════════════════════════════════════════════════════
# DIAGRAM 1: Venn Diagram — Product Intelligence
# ═══════════════════════════════════════════════════════════════
def diagram_01_venn():
    print("Generating ch02_venn_diagram.png ...")
    fig, ax = plt.subplots(figsize=(MAX_WIDTH, 4.5))
    ax.set_xlim(-2.2, 2.2)
    ax.set_ylim(-1.8, 2.2)
    ax.set_aspect("equal")
    ax.axis("off")

    # Title
    ax.text(
        0, 2.1, "Product Intelligence", fontsize=14, fontweight="bold",
        ha="center", va="top", color=NAVY,
    )

    # Three circles
    r = 1.15
    # Positions: top, bottom-left, bottom-right
    centers = [(0, 0.65), (-0.75, -0.45), (0.75, -0.45)]
    labels = ["Product\nThinking", "AI\nCapability", "User\nNeed"]
    colors = [NAVY, SLATE, AMBER]
    alphas = [0.12, 0.12, 0.15]

    for (cx, cy), label, color, alpha in zip(centers, labels, colors, alphas):
        circle = plt.Circle((cx, cy), r, facecolor=color, alpha=alpha,
                            edgecolor=color, linewidth=1.8)
        ax.add_patch(circle)

    # Main circle labels (positioned outside the overlaps)
    ax.text(0, 1.55, "Product\nThinking", fontsize=9, fontweight="bold",
            ha="center", va="center", color=NAVY)
    ax.text(-1.35, -0.95, "AI\nCapability", fontsize=9, fontweight="bold",
            ha="center", va="center", color=SLATE)
    ax.text(1.35, -0.95, "User\nNeed", fontsize=9, fontweight="bold",
            ha="center", va="center", color=AMBER)

    # Center intersection
    ax.text(0, 0.0, "Product\nIntelligence", fontsize=9.5, fontweight="bold",
            ha="center", va="center", color=AMBER,
            bbox=dict(boxstyle="round,pad=0.2", facecolor=WHITE, edgecolor=AMBER,
                      linewidth=1.2, alpha=0.9))

    # Two-circle overlap labels
    # Product + AI (no User) — top-left overlap area
    ax.text(-0.55, 0.55, "Tech demos\nnobody uses", fontsize=6.5,
            ha="center", va="center", color=SLATE, fontstyle="italic")
    # Product + User (no AI) — top-right overlap area
    ax.text(0.55, 0.55, "Wishful\nthinking", fontsize=6.5,
            ha="center", va="center", color=SLATE, fontstyle="italic")
    # AI + User (no Product) — bottom overlap area
    ax.text(0, -0.72, "Generic\nAI tools", fontsize=6.5,
            ha="center", va="center", color=SLATE, fontstyle="italic")

    save_fig(fig, "ch02_venn_diagram.png")


# ═══════════════════════════════════════════════════════════════
# DIAGRAM 2: AI Capabilities Spectrum
# ═══════════════════════════════════════════════════════════════
def diagram_02_spectrum():
    print("Generating ch03_capability_zones.png ...")
    fig, ax = plt.subplots(figsize=(MAX_WIDTH, 3.0))
    ax.set_xlim(0, 10)
    ax.set_ylim(-1.0, 3.5)
    ax.axis("off")

    # Title
    ax.text(5, 3.3, "AI Capability Reliability Spectrum", fontsize=12,
            fontweight="bold", ha="center", va="top", color=NAVY)

    # Zone definitions
    zones = [
        (0, 3.33, GREEN_ZONE, "Paved Highway",
         "Classification\nRecommendation\nStructured Data"),
        (3.33, 6.67, AMBER_ZONE, "Gravel Road",
         "Text Generation\nSummarization\nTranslation"),
        (6.67, 10, RED_ZONE, "Uncharted Trail",
         "Reasoning\nMulti-step Planning\nNovel Creation"),
    ]

    bar_y = 1.4
    bar_h = 1.2

    for x0, x1, color, title, desc in zones:
        rect = FancyBboxPatch(
            (x0 + 0.05, bar_y), x1 - x0 - 0.1, bar_h,
            boxstyle="round,pad=0.08", facecolor=color, alpha=0.18,
            edgecolor=color, linewidth=1.5,
        )
        ax.add_patch(rect)
        mid = (x0 + x1) / 2
        ax.text(mid, bar_y + bar_h - 0.15, title, fontsize=8.5,
                fontweight="bold", ha="center", va="top", color=color)
        ax.text(mid, bar_y + 0.15, desc, fontsize=6.5, ha="center",
                va="bottom", color=NAVY, linespacing=1.3)

    # Arrow underneath
    arrow_y = 0.7
    ax.annotate(
        "", xy=(9.8, arrow_y), xytext=(0.2, arrow_y),
        arrowprops=dict(arrowstyle="-|>", color=SLATE, lw=1.5),
    )
    ax.text(0.2, arrow_y - 0.35, "High Reliability", fontsize=7,
            ha="left", va="top", color=GREEN_ZONE, fontweight="bold")
    ax.text(9.8, arrow_y - 0.35, "Experimental", fontsize=7,
            ha="right", va="top", color=RED_ZONE, fontweight="bold")

    save_fig(fig, "ch03_capability_zones.png")


# ═══════════════════════════════════════════════════════════════
# DIAGRAM 3: AI Spec Canvas
# ═══════════════════════════════════════════════════════════════
def diagram_03_canvas():
    print("Generating ch05_spec_canvas.png ...")
    fig, ax = plt.subplots(figsize=(MAX_WIDTH, 3.8))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6.5)
    ax.axis("off")

    # Title
    ax.text(5, 6.3, "The AI Spec Canvas", fontsize=13, fontweight="bold",
            ha="center", va="top", color=NAVY)

    cells = [
        # Top row (y = 3.2 to 5.7)
        (0.1, 3.2, "Problem\nStatement", "What user pain?\nHow big is it?\nCurrent solutions?"),
        (2.55, 3.2, "AI Approach", "Which model/API?\nInput → Output\nConfidence level?"),
        (5.0, 3.2, "User Story", "As a [user]...\nI want [action]...\nSo that [outcome]..."),
        (7.45, 3.2, "Error\nTolerance", "What if AI is wrong?\nFallback behavior?\nUser impact?"),
        # Bottom row (y = 0.3 to 2.8)
        (0.1, 0.3, "Success\nMetrics", "Accuracy target\nAdoption rate\nTask completion"),
        (2.55, 0.3, "Guardrails", "Content filters\nRate limits\nHuman review?"),
        (5.0, 0.3, "Evaluation\nPlan", "Test dataset\nA/B plan\nMonitoring"),
        (7.45, 0.3, "Cost\nModel", "API cost/call\nInfra budget\nUnit economics"),
    ]

    cell_w = 2.3
    cell_h = 2.35

    for x, y, title, hints in cells:
        rect = FancyBboxPatch(
            (x, y), cell_w, cell_h,
            boxstyle="round,pad=0.12", facecolor=LIGHT_GRAY,
            edgecolor=SLATE, linewidth=1.0,
        )
        ax.add_patch(rect)
        # Title
        ax.text(x + cell_w / 2, y + cell_h - 0.2, title, fontsize=7.5,
                fontweight="bold", ha="center", va="top", color=NAVY,
                linespacing=1.1)
        # Hints
        ax.text(x + cell_w / 2, y + 0.25, hints, fontsize=5.8,
                ha="center", va="bottom", color=SLATE, linespacing=1.3,
                fontstyle="italic")

    save_fig(fig, "ch05_spec_canvas.png")


# ═══════════════════════════════════════════════════════════════
# DIAGRAM 4: Data Flywheel
# ═══════════════════════════════════════════════════════════════
def diagram_04_flywheel():
    print("Generating ch07_data_flywheel.png ...")
    fig, ax = plt.subplots(figsize=(MAX_WIDTH, MAX_WIDTH))
    ax.set_xlim(-2.5, 2.5)
    ax.set_ylim(-2.5, 2.5)
    ax.set_aspect("equal")
    ax.axis("off")

    # Title in center
    ax.text(0, 0.15, "The Data", fontsize=11, fontweight="bold",
            ha="center", va="center", color=NAVY)
    ax.text(0, -0.2, "Flywheel", fontsize=11, fontweight="bold",
            ha="center", va="center", color=AMBER)

    # 7 nodes around a circle
    n = 7
    radius = 1.75
    labels = [
        "Launch\nProduct", "Users\nInteract", "Data\nGenerated",
        "Model\nTrains", "Model\nImproves", "Better\nExperience",
        "More\nUsers",
    ]

    # Angles: start from top, go clockwise
    angles = [90 - i * (360 / n) for i in range(n)]
    positions = []
    for angle in angles:
        rad = math.radians(angle)
        positions.append((radius * math.cos(rad), radius * math.sin(rad)))

    # Draw nodes
    node_r = 0.42
    for i, ((x, y), label) in enumerate(zip(positions, labels)):
        circle = plt.Circle((x, y), node_r, facecolor=NAVY, alpha=0.10,
                            edgecolor=NAVY, linewidth=1.5)
        ax.add_patch(circle)
        ax.text(x, y, label, fontsize=6.5, fontweight="bold",
                ha="center", va="center", color=NAVY, linespacing=1.1)

    # Draw curved arrows between consecutive nodes
    for i in range(n):
        j = (i + 1) % n
        x0, y0 = positions[i]
        x1, y1 = positions[j]

        # Shorten arrow to not overlap with node circles
        dx = x1 - x0
        dy = y1 - y0
        dist = math.sqrt(dx ** 2 + dy ** 2)
        shrink = node_r + 0.06

        # Start and end offset
        sx = x0 + shrink * dx / dist
        sy = y0 + shrink * dy / dist
        ex = x1 - shrink * dx / dist
        ey = y1 - shrink * dy / dist

        arrow = FancyArrowPatch(
            (sx, sy), (ex, ey),
            connectionstyle="arc3,rad=0.20",
            arrowstyle="-|>",
            color=AMBER, linewidth=1.5, mutation_scale=12,
        )
        ax.add_patch(arrow)

    save_fig(fig, "ch07_data_flywheel.png")


# ═══════════════════════════════════════════════════════════════
# DIAGRAM 5: ACE Framework
# ═══════════════════════════════════════════════════════════════
def diagram_05_ace():
    print("Generating ch08_ace_framework.png ...")
    fig, ax = plt.subplots(figsize=(MAX_WIDTH, 3.2))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5.5)
    ax.axis("off")

    # Title
    ax.text(5, 5.3, "The ACE Framework", fontsize=13, fontweight="bold",
            ha="center", va="top", color=NAVY)

    # Connecting bar at top
    bar = FancyBboxPatch(
        (0.5, 3.6), 9.0, 0.4,
        boxstyle="round,pad=0.08", facecolor=AMBER, alpha=0.25,
        edgecolor=AMBER, linewidth=1.5,
    )
    ax.add_patch(bar)
    ax.text(5, 3.8, "Balanced together for great AI products",
            fontsize=7, ha="center", va="center", color=NAVY, fontstyle="italic")

    # Three pillars
    pillars = [
        ("A", "Accuracy", "Is the AI correct?", NAVY,
         "Precision & recall\nConfidence scores\nError rate tracking"),
        ("C", "Coverage", "How often does it\nattempt an answer?", SLATE,
         "Attempt rate\nAbstention policy\nEdge case handling"),
        ("E", "Experience", "How does it feel\nto the user?", AMBER,
         "Response time\nTransparency\nGraceful failures"),
    ]

    x_positions = [1.2, 3.7, 6.2]
    pillar_w = 2.8
    pillar_h = 3.0

    for x, (letter, title, question, color, details) in zip(x_positions, pillars):
        # Pillar box
        rect = FancyBboxPatch(
            (x, 0.3), pillar_w, pillar_h,
            boxstyle="round,pad=0.12", facecolor=color, alpha=0.08,
            edgecolor=color, linewidth=1.5,
        )
        ax.add_patch(rect)

        # Big letter
        ax.text(x + pillar_w / 2, 2.85, letter, fontsize=22,
                fontweight="bold", ha="center", va="center", color=color, alpha=0.3)

        # Title
        ax.text(x + pillar_w / 2, 2.35, title, fontsize=9.5,
                fontweight="bold", ha="center", va="center", color=color)

        # Question
        ax.text(x + pillar_w / 2, 1.75, question, fontsize=6.5,
                ha="center", va="center", color=NAVY, fontstyle="italic",
                linespacing=1.2)

        # Details
        ax.text(x + pillar_w / 2, 0.75, details, fontsize=6,
                ha="center", va="center", color=SLATE, linespacing=1.3)

    save_fig(fig, "ch08_ace_framework.png")


# ═══════════════════════════════════════════════════════════════
# DIAGRAM 6: AI Metrics Stack (Pyramid)
# ═══════════════════════════════════════════════════════════════
def diagram_06_metrics():
    print("Generating ch09_metrics_stack.png ...")
    fig, ax = plt.subplots(figsize=(MAX_WIDTH, 4.0))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7.0)
    ax.axis("off")

    # Title
    ax.text(5, 6.8, "The AI Metrics Stack", fontsize=13, fontweight="bold",
            ha="center", va="top", color=NAVY)

    # Pyramid layers (bottom to top)
    layers = [
        {
            "label": "Model Metrics",
            "desc": "Accuracy  |  Latency  |  Precision  |  Recall",
            "color": NAVY,
            "y": 0.5, "h": 1.5,
            "x_left": 0.5, "x_right": 9.5,
        },
        {
            "label": "Product Metrics",
            "desc": "Task Completion  |  User Satisfaction  |  Adoption Rate",
            "color": SLATE,
            "y": 2.2, "h": 1.5,
            "x_left": 1.5, "x_right": 8.5,
        },
        {
            "label": "Business Metrics",
            "desc": "Revenue Impact  |  Cost per User  |  Retention",
            "color": AMBER,
            "y": 3.9, "h": 1.5,
            "x_left": 2.5, "x_right": 7.5,
        },
    ]

    for layer in layers:
        w = layer["x_right"] - layer["x_left"]
        rect = FancyBboxPatch(
            (layer["x_left"], layer["y"]), w, layer["h"],
            boxstyle="round,pad=0.1", facecolor=layer["color"], alpha=0.12,
            edgecolor=layer["color"], linewidth=1.8,
        )
        ax.add_patch(rect)

        mid_x = (layer["x_left"] + layer["x_right"]) / 2
        mid_y = layer["y"] + layer["h"] / 2

        ax.text(mid_x, mid_y + 0.2, layer["label"], fontsize=9.5,
                fontweight="bold", ha="center", va="center", color=layer["color"])
        ax.text(mid_x, mid_y - 0.25, layer["desc"], fontsize=6.5,
                ha="center", va="center", color=NAVY)

    # Upward arrows between layers
    for i in range(len(layers) - 1):
        y_start = layers[i]["y"] + layers[i]["h"] + 0.02
        y_end = layers[i + 1]["y"] - 0.02
        ax.annotate(
            "", xy=(5, y_end), xytext=(5, y_start),
            arrowprops=dict(arrowstyle="-|>", color=DARK_GRAY, lw=1.2),
        )

    # Side labels
    ax.text(0.2, 0.5 + 0.75, "Foundation", fontsize=6.5, ha="left",
            va="center", color=DARK_GRAY, fontstyle="italic", rotation=90)
    ax.text(9.8, 3.9 + 0.75, "Outcome", fontsize=6.5, ha="right",
            va="center", color=DARK_GRAY, fontstyle="italic", rotation=90)

    save_fig(fig, "ch09_metrics_stack.png")


# ═══════════════════════════════════════════════════════════════
# DIAGRAM 7: Build vs Buy vs Prompt
# ═══════════════════════════════════════════════════════════════
def diagram_07_bbp():
    print("Generating ch10_bbp_framework.png ...")
    fig, ax = plt.subplots(figsize=(MAX_WIDTH, 3.2))
    ax.set_xlim(0, 10)
    ax.set_ylim(-0.5, 5.0)
    ax.axis("off")

    # Title
    ax.text(5, 4.8, "The BBP Framework", fontsize=13, fontweight="bold",
            ha="center", va="top", color=NAVY)

    # Main arrow
    arrow_y = 2.5
    ax.annotate(
        "", xy=(9.5, arrow_y), xytext=(0.5, arrow_y),
        arrowprops=dict(arrowstyle="-|>", color=SLATE, lw=2.0, alpha=0.3),
    )

    # Three stops
    stops = [
        (1.5, "PROMPT", AMBER,
         ["Fast to ship", "Low cost", "Low control", "No moat"]),
        (5.0, "BUY", SLATE,
         ["Medium speed", "Medium cost", "Some control", "Some moat"]),
        (8.5, "BUILD", NAVY,
         ["Slow to ship", "Expensive", "Full control", "Strong moat"]),
    ]

    for x, title, color, traits in stops:
        # Circle marker on arrow
        circle = plt.Circle((x, arrow_y), 0.3, facecolor=color, alpha=0.15,
                            edgecolor=color, linewidth=2.0)
        ax.add_patch(circle)
        ax.text(x, arrow_y, title, fontsize=9, fontweight="bold",
                ha="center", va="center", color=color)

        # Trait labels below
        for i, trait in enumerate(traits):
            ax.text(x, arrow_y - 0.7 - i * 0.35, trait, fontsize=6.5,
                    ha="center", va="center", color=SLATE)

    # Dimension labels
    ax.text(1.5, 3.5, "Speed & Cost", fontsize=7,
            ha="center", va="center", color=AMBER, fontweight="bold")
    ax.text(5.0, 3.5, "Balance", fontsize=7,
            ha="center", va="center", color=SLATE, fontweight="bold")
    ax.text(8.5, 3.5, "Control & Moat", fontsize=7,
            ha="center", va="center", color=NAVY, fontweight="bold")

    save_fig(fig, "ch10_bbp_framework.png")


# ═══════════════════════════════════════════════════════════════
# DIAGRAM 8: Wow-to-Disappointment Curve
# ═══════════════════════════════════════════════════════════════
def diagram_08_wow_curve():
    print("Generating ch13_wow_curve.png ...")
    fig, ax = plt.subplots(figsize=(MAX_WIDTH, 3.5))

    # Create an illustrative curve
    x = np.linspace(0, 12, 300)
    # Custom curve: high start, quick dip, gradual recovery
    y = (
        0.9 * np.exp(-0.3 * x) * np.cos(0.15 * x)  # oscillating decay
        + 0.5  # baseline
        + 0.35 * np.exp(-((x - 0) ** 2) / 1.5)  # initial wow bump
        - 0.45 * np.exp(-((x - 4.5) ** 2) / 2.5)  # disappointment trough
        + 0.15 * (1 / (1 + np.exp(-0.8 * (x - 8))))  # sigmoid recovery
    )

    # Normalize to a nice range
    y = (y - y.min()) / (y.max() - y.min())
    y = y * 0.8 + 0.1  # scale to 0.1–0.9 range

    ax.plot(x, y, color=NAVY, linewidth=2.5, zorder=5)
    ax.fill_between(x, 0, y, alpha=0.06, color=NAVY)

    # Phase labels
    phases = [
        (0.8, 0.92, "Wow\nPhase", AMBER),
        (2.8, 0.68, "Exploration", SLATE),
        (4.8, 0.28, "Disappointment\nTrough", RED_ZONE),
        (7.5, 0.52, "Recalibration", SLATE),
        (10.5, 0.65, "Trust\nPhase", GREEN_ZONE),
    ]

    for px, py, label, color in phases:
        ax.annotate(
            label, xy=(px, py), xytext=(px, py + 0.13),
            fontsize=6.5, fontweight="bold", ha="center", va="bottom",
            color=color,
            arrowprops=dict(arrowstyle="-", color=color, lw=0.8),
        )

    # Axes
    ax.set_xlabel("Time", fontsize=8, color=NAVY)
    ax.set_ylabel("User Sentiment", fontsize=8, color=NAVY)
    ax.set_title("The Wow-to-Disappointment Curve", fontsize=12,
                 fontweight="bold", color=NAVY, pad=12)

    ax.set_xticks([0, 1, 4, 8, 12])
    ax.set_xticklabels(["Launch", "Week 1", "Week 4", "Week 8", "Week 12+"],
                       fontsize=6.5)
    ax.set_yticks([])
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_visible(False)
    ax.spines["bottom"].set_color(SLATE)
    ax.spines["bottom"].set_linewidth(0.8)

    save_fig(fig, "ch13_wow_curve.png")


# ═══════════════════════════════════════════════════════════════
# DIAGRAM 9: AI Org Maturity Model
# ═══════════════════════════════════════════════════════════════
def diagram_09_maturity():
    print("Generating ch14_maturity_model.png ...")
    fig, ax = plt.subplots(figsize=(MAX_WIDTH, 2.8))
    ax.set_xlim(0, 10)
    ax.set_ylim(-0.3, 4.5)
    ax.axis("off")

    # Title
    ax.text(5, 4.3, "AI Org Maturity Model", fontsize=13, fontweight="bold",
            ha="center", va="top", color=NAVY)

    stages = [
        ("Stage 1", "Ad-Hoc", "No strategy", SLATE),
        ("Stage 2", "Experimental", "Pilot projects", SLATE),
        ("Stage 3", "Integrated", "AI in roadmap", NAVY),
        ("Stage 4", "AI-Native", "AI-first culture", AMBER),
    ]

    box_w = 1.9
    box_h = 2.0
    gap = 0.45
    total_w = len(stages) * box_w + (len(stages) - 1) * gap
    start_x = (10 - total_w) / 2

    for i, (stage_num, title, desc, color) in enumerate(stages):
        x = start_x + i * (box_w + gap)
        y = 0.5

        # Progressive opacity to show growth
        alpha = 0.08 + i * 0.05

        rect = FancyBboxPatch(
            (x, y), box_w, box_h,
            boxstyle="round,pad=0.12", facecolor=color, alpha=alpha,
            edgecolor=color, linewidth=1.5,
        )
        ax.add_patch(rect)

        # Stage number
        ax.text(x + box_w / 2, y + box_h - 0.25, stage_num, fontsize=6.5,
                ha="center", va="top", color=DARK_GRAY)
        # Title
        ax.text(x + box_w / 2, y + box_h / 2 + 0.1, title, fontsize=9,
                fontweight="bold", ha="center", va="center", color=color)
        # Description
        ax.text(x + box_w / 2, y + 0.35, desc, fontsize=6.5,
                ha="center", va="center", color=SLATE, fontstyle="italic")

        # Arrow to next stage
        if i < len(stages) - 1:
            ax.annotate(
                "", xy=(x + box_w + gap - 0.05, y + box_h / 2),
                xytext=(x + box_w + 0.05, y + box_h / 2),
                arrowprops=dict(arrowstyle="-|>", color=AMBER, lw=1.5,
                                mutation_scale=14),
            )

    # Progress arrow at bottom
    ax.annotate(
        "", xy=(start_x + total_w, 0.15),
        xytext=(start_x, 0.15),
        arrowprops=dict(arrowstyle="-|>", color=DARK_GRAY, lw=1.0, alpha=0.4),
    )
    ax.text(5, -0.1, "Increasing AI Maturity", fontsize=7, ha="center",
            va="center", color=DARK_GRAY, fontstyle="italic")

    save_fig(fig, "ch14_maturity_model.png")


# ═══════════════════════════════════════════════════════════════
# DIAGRAM 10: AI PM Career Ladder
# ═══════════════════════════════════════════════════════════════
def diagram_10_career():
    print("Generating ch15_career_ladder.png ...")
    fig, ax = plt.subplots(figsize=(MAX_WIDTH, 4.5))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 8.0)
    ax.axis("off")

    # Title
    ax.text(5, 7.8, "The AI PM Career Ladder", fontsize=13, fontweight="bold",
            ha="center", va="top", color=NAVY)

    rungs = [
        ("Uses AI Tools", "PM who uses ChatGPT for daily work", SLATE),
        ("Ships AI Features", "PM who has shipped an AI-powered feature", SLATE),
        ("Owns AI Products", "PM who owns an AI product end-to-end", NAVY),
        ("Leads AI Product Org", "Head of AI Product", AMBER),
    ]

    step_h = 1.2
    base_y = 0.5
    base_x = 1.5
    step_offset_x = 0.5  # each step shifts right to create staircase

    for i, (title, desc, color) in enumerate(rungs):
        x = base_x + i * step_offset_x
        y = base_y + i * (step_h + 0.35)
        w = 7.5 - i * 0.3  # slightly narrower as we go up

        # Step background
        alpha = 0.08 + i * 0.04
        rect = FancyBboxPatch(
            (x, y), w, step_h,
            boxstyle="round,pad=0.1", facecolor=color, alpha=alpha,
            edgecolor=color, linewidth=1.5,
        )
        ax.add_patch(rect)

        # Rung number
        ax.text(x + 0.35, y + step_h / 2, f"{i + 1}", fontsize=14,
                fontweight="bold", ha="center", va="center", color=color,
                alpha=0.35)

        # Title and description
        ax.text(x + 1.0, y + step_h / 2 + 0.18, title, fontsize=9,
                fontweight="bold", ha="left", va="center", color=color)
        ax.text(x + 1.0, y + step_h / 2 - 0.22, desc, fontsize=6.5,
                ha="left", va="center", color=SLATE, fontstyle="italic")

        # Arrow to next rung
        if i < len(rungs) - 1:
            ax.annotate(
                "", xy=(x + 0.35 + step_offset_x, y + step_h + 0.05),
                xytext=(x + 0.35, y + step_h + 0.05),
                arrowprops=dict(arrowstyle="-|>", color=AMBER, lw=1.2,
                                connectionstyle="arc3,rad=0.3",
                                mutation_scale=12),
            )

    save_fig(fig, "ch15_career_ladder.png")


# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print(f"\nGenerating diagrams to: {OUTPUT_DIR}\n")

    diagram_01_venn()
    diagram_02_spectrum()
    diagram_03_canvas()
    diagram_04_flywheel()
    diagram_05_ace()
    diagram_06_metrics()
    diagram_07_bbp()
    diagram_08_wow_curve()
    diagram_09_maturity()
    diagram_10_career()

    print(f"\nDone! All 10 diagrams saved to:\n  {OUTPUT_DIR}\n")
