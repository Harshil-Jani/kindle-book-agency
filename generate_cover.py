"""
Generate book cover: Concept C "The Clean Getaway" — Refined
Nocturnal Departure design philosophy
"""
from PIL import Image, ImageDraw, ImageFont
import math

# ─── Canvas ───
W, H = 1530, 2295  # 6" x 9" at 300 DPI
NAVY = (10, 22, 40)        # #0A1628
DEEP = (14, 28, 50)        # Subtle tone variation
ORANGE = (255, 107, 53)    # #FF6B35
WHITE = (255, 255, 255)
WHITE_DIM = (235, 230, 222) # Warm off-white — harmonizes with orange
FAINT = (130, 75, 40)      # Muted warm brown — visible but quiet

FONT_DIR = "/Users/harshiljani2002/.claude/plugins/cache/anthropic-agent-skills/document-skills/69c0b1a06741/skills/canvas-design/canvas-fonts"

img = Image.new("RGB", (W, H), NAVY)
draw = ImageDraw.Draw(img)

# ─── Fonts ───
font_out_of = ImageFont.truetype(f"{FONT_DIR}/BigShoulders-Regular.ttf", 82)
font_office = ImageFont.truetype(f"{FONT_DIR}/BigShoulders-Bold.ttf", 240)
font_subtitle = ImageFont.truetype(f"{FONT_DIR}/InstrumentSans-Regular.ttf", 32)
font_author = ImageFont.truetype(f"{FONT_DIR}/InstrumentSans-Regular.ttf", 28)
font_genre = ImageFont.truetype(f"{FONT_DIR}/InstrumentSans-Regular.ttf", 20)

CENTER_X = W // 2
LEFT_M = 130

# ─── "OUT OF" — centered, medium weight ───
out_text = "OUT OF"
bbox = draw.textbbox((0, 0), out_text, font=font_out_of)
ow = bbox[2] - bbox[0]
out_y = 480
draw.text((CENTER_X - ow // 2, out_y), out_text, fill=WHITE, font=font_out_of)

# ─── "OFFICE" — centered, massive, extra bold ───
off_text = "OFFICE"
bbox = draw.textbbox((0, 0), off_text, font=font_office)
fw = bbox[2] - bbox[0]
fh = bbox[3] - bbox[1]
off_y = out_y + 62
draw.text((CENTER_X - fw // 2, off_y), off_text, fill=WHITE, font=font_office)

# ─── Small orange accent line ───
line_y = off_y + fh + 50
draw.line([(CENTER_X - 60, line_y), (CENTER_X + 60, line_y)], fill=ORANGE, width=3)

# ─── Subtitle — two lines, centered, orange ───
sub1 = "An Indian Professional\u2019s"
sub2 = "Misadventures Across India"
s1_bbox = draw.textbbox((0, 0), sub1, font=font_subtitle)
s2_bbox = draw.textbbox((0, 0), sub2, font=font_subtitle)
sub_y = line_y + 35
draw.text((CENTER_X - (s1_bbox[2] - s1_bbox[0]) // 2, sub_y), sub1, fill=ORANGE, font=font_subtitle)
draw.text((CENTER_X - (s2_bbox[2] - s2_bbox[0]) // 2, sub_y + 44), sub2, fill=ORANGE, font=font_subtitle)


# ─── Auto-rickshaw — proper three-wheeler silhouette ───
def draw_auto_rickshaw(draw, cx, cy, color, s=1.0):
    """Minimal but recognizable Indian auto-rickshaw, facing right."""

    # ── Canopy / roof (the iconic curved top) ──
    roof_pts = [
        (cx - 40*s, cy - 52*s),   # rear top
        (cx + 10*s, cy - 58*s),   # front top (slightly higher for curve)
        (cx + 25*s, cy - 50*s),   # front curve down
        (cx + 25*s, cy - 35*s),   # front edge
        (cx - 45*s, cy - 35*s),   # rear edge
    ]
    draw.polygon(roof_pts, fill=color)

    # ── Cabin body ──
    body_pts = [
        (cx - 45*s, cy - 35*s),   # rear top
        (cx + 28*s, cy - 35*s),   # front top
        (cx + 32*s, cy - 10*s),   # front windshield angle
        (cx + 32*s, cy + 10*s),   # front bottom
        (cx - 45*s, cy + 10*s),   # rear bottom
    ]
    draw.polygon(body_pts, fill=color)

    # ── Windshield (dark cutout) ──
    ws_pts = [
        (cx - 5*s, cy - 33*s),
        (cx + 24*s, cy - 33*s),
        (cx + 28*s, cy - 14*s),
        (cx - 5*s, cy - 14*s),
    ]
    draw.polygon(ws_pts, fill=NAVY)

    # ── Open back (dark cutout — rickshaws are open at the back) ──
    back_pts = [
        (cx - 43*s, cy - 28*s),
        (cx - 12*s, cy - 28*s),
        (cx - 12*s, cy + 5*s),
        (cx - 43*s, cy + 5*s),
    ]
    draw.polygon(back_pts, fill=NAVY)

    # ── Front fender / nose ──
    nose_pts = [
        (cx + 32*s, cy - 8*s),
        (cx + 50*s, cy + 2*s),
        (cx + 50*s, cy + 14*s),
        (cx + 32*s, cy + 14*s),
    ]
    draw.polygon(nose_pts, fill=color)

    # ── Headlight ──
    hl_r = int(4 * s)
    hl_cx = int(cx + 48*s)
    hl_cy = int(cy - 2*s)
    draw.ellipse([(hl_cx - hl_r, hl_cy - hl_r), (hl_cx + hl_r, hl_cy + hl_r)], fill=WHITE)

    # ── Front wheel (single — the iconic three-wheeler front) ──
    fw_r = int(11 * s)
    fw_cx = int(cx + 40*s)
    fw_cy = int(cy + 14*s + fw_r - 2*s)
    draw.ellipse([(fw_cx - fw_r, fw_cy - fw_r), (fw_cx + fw_r, fw_cy + fw_r)], fill=color)
    # Hub
    hub_r = int(4 * s)
    draw.ellipse([(fw_cx - hub_r, fw_cy - hub_r), (fw_cx + hub_r, fw_cy + hub_r)], fill=NAVY)

    # ── Rear wheels (two, side by side — show as one from side view) ──
    rw_r = int(11 * s)
    rw_cx = int(cx - 30*s)
    rw_cy = int(cy + 14*s + rw_r - 2*s)
    draw.ellipse([(rw_cx - rw_r, rw_cy - rw_r), (rw_cx + rw_r, rw_cy + rw_r)], fill=color)
    draw.ellipse([(rw_cx - hub_r, rw_cy - hub_r), (rw_cx + hub_r, rw_cy + hub_r)], fill=NAVY)

    # ── Roof support pole (front) ──
    draw.line([(cx + 24*s, cy - 50*s), (cx + 28*s, cy - 35*s)], fill=color, width=max(2, int(3*s)))

    # ── Rear bumper line ──
    draw.line([(cx - 45*s, cy + 10*s), (cx - 45*s, cy + 20*s)], fill=color, width=max(2, int(3*s)))


# Draw the rickshaw: lower-right area, driving right
rick_cx = 1080
rick_cy = 1680
draw_auto_rickshaw(draw, rick_cx, rick_cy, ORANGE, s=1.6)

# ─── Dotted trail ───
# Trail starts behind the rickshaw rear wheel, extends left
trail_y = rick_cy + int(14 * 1.6) + int(11 * 1.6) - int(2 * 1.6) - 2  # aligned with wheel center
trail_start_x = rick_cx - int(55 * 1.6)  # behind rear bumper

num_dots = 22
for i in range(num_dots):
    x = trail_start_x - i * 30
    if x < -30:
        break
    # Dots fade: get smaller and dimmer
    progress = i / num_dots
    r = max(2, int(4.5 - progress * 2.5))
    alpha_factor = 1.0 - progress * 0.7
    dot_r = int(ORANGE[0] * alpha_factor + NAVY[0] * (1 - alpha_factor))
    dot_g = int(ORANGE[1] * alpha_factor + NAVY[1] * (1 - alpha_factor))
    dot_b = int(ORANGE[2] * alpha_factor + NAVY[2] * (1 - alpha_factor))
    draw.ellipse([(x - r, trail_y - r), (x + r, trail_y + r)], fill=(dot_r, dot_g, dot_b))

# ─── Author name — bottom left ───
author_y = H - 150
draw.text((LEFT_M, author_y), "H E R S C H E L  J.", fill=WHITE_DIM, font=font_author)

# ─── Genre tag — very subtle, above author ───
draw.text((LEFT_M, author_y - 40), "A  T R A V E L  M E M O I R", fill=FAINT, font=font_genre)


# ─── Save ───
out_path = "/Users/harshiljani2002/Desktop/Projects/book-writer/output/cover.png"
img.save(out_path, "PNG", dpi=(300, 300))
print(f"Cover saved: {out_path}")
print(f"Dimensions: {W}x{H} px at 300 DPI")
