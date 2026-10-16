#!/usr/bin/env python3
"""Draw the fictional Calder Residence sheet E-1 (kitchen electrical plan).

Outputs (next to this script, under out/):
  plan-e1.pdf          one-page 24x18 in (ARCH C landscape) vector sheet
  plan-symbols.json    PDF-point centers of every countable symbol, by item

Coordinates are PDF points with a TOP-LEFT origin (PyMuPDF convention), which
is also pdf.js's page space for an unrotated page. The takeoff SPA stores count
placements in "world" units = PDF points * RENDER_ZOOM (1.5).

All names are fictional. No em dashes anywhere.
"""
import json
import os

import fitz  # PyMuPDF

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
os.makedirs(OUT, exist_ok=True)

W, H = 24 * 72, 18 * 72  # 1728 x 1296 pt
FT = 36.0                # 1/2" = 1'-0"  -> 36 pt per foot
X0, Y0 = 118.0, 150.0    # plan origin (top-left of building, outside face)

FONT_R = "/usr/share/fonts/opentype/urw-base35/NimbusSansNarrow-Regular.otf"
FONT_B = "/usr/share/fonts/opentype/urw-base35/NimbusSansNarrow-Bold.otf"

INK = (0.10, 0.11, 0.13)
WALL = (0.22, 0.23, 0.26)
GREY = (0.45, 0.47, 0.50)
LIGHT = (0.70, 0.72, 0.75)
ELEC = (0.05, 0.05, 0.08)

doc = fitz.open()
page = doc.new_page(width=W, height=H)
page.insert_font(fontname="nr", fontfile=FONT_R)
page.insert_font(fontname="nb", fontfile=FONT_B)


def P(fx, fy):
    return fitz.Point(X0 + fx * FT, Y0 + fy * FT)


def R(fx0, fy0, fx1, fy1):
    return fitz.Rect(P(fx0, fy0), P(fx1, fy1))


def text(x, y, s, size=9, bold=False, color=INK, align="left", rotate=0):
    font = "nb" if bold else "nr"
    f = fitz.Font(fontfile=FONT_B if bold else FONT_R)
    w = f.text_length(s, fontsize=size)
    if align == "center":
        x -= w / 2
    elif align == "right":
        x -= w
    page.insert_text(fitz.Point(x, y), s, fontname=font, fontsize=size, color=color, rotate=rotate)
    return w


def line(p0, p1, width=0.8, color=INK, dashes=None):
    page.draw_line(p0, p1, color=color, width=width, dashes=dashes)


def rect(r, width=0.8, color=INK, fill=None, dashes=None):
    page.draw_rect(r, color=color, width=width, fill=fill, dashes=dashes)


def circle(c, r, width=0.8, color=INK, fill=None, dashes=None):
    page.draw_circle(c, r, color=color, width=width, fill=fill, dashes=dashes)


# ---------------------------------------------------------------- sheet frame
rect(fitz.Rect(18, 18, W - 18, H - 18), width=2.0)
rect(fitz.Rect(26, 26, W - 26, H - 26), width=0.6)
# zone ticks
for i in range(1, 8):
    x = 26 + i * (W - 52 - 290) / 8
    line(fitz.Point(x, 18), fitz.Point(x, 26), 0.5)
    line(fitz.Point(x, H - 26), fitz.Point(x, H - 18), 0.5)
    text(x - (W - 52 - 290) / 16, 24, str(8 - i + 1), 6, color=GREY, align="center")
for i, z in enumerate("ABCDEF"):
    y = 26 + (i + 0.5) * (H - 52) / 6
    text(22, y + 2, z, 6, color=GREY, align="center")

# ---------------------------------------------------------------- walls
WALL_FILL = (0.30, 0.31, 0.34)


def wall(fx0, fy0, fx1, fy1):
    rect(R(fx0, fy0, fx1, fy1), width=0.6, color=WALL, fill=WALL_FILL)


T = 0.5  # exterior wall thickness (ft)
# North exterior wall (full width)
wall(0, 0, 34, T)
# West exterior wall
wall(0, 0, T, 18)
# East exterior wall with window opening at sink (y 4.75..7.75)
wall(34 - T, 0, 34, 4.75)
wall(34 - T, 7.75, 34, 18)
# South exterior wall: garage door opening x 1.5..11.5
wall(0, 18 - T, 1.5, 18)
wall(11.5, 18 - T, 34, 18)
# Garage / house separation wall x 12.75..13.25, door y 10.75..13.5
wall(12.75, T, 13.25, 10.75)
wall(12.75, 13.5, 13.25, 18 - T)
# Kitchen / family room partition y 14..14.375, cased opening x 21..29
wall(13.25, 14.0, 21.0, 14.375)
wall(29.0, 14.0, 34 - T, 14.375)

# window at sink (east): three thin lines
for dx in (0.12, 0.25, 0.38):
    line(P(34 - T + dx, 4.75), P(34 - T + dx, 7.75), 0.5, GREY)
line(P(34 - T, 4.75), P(34, 4.75), 0.6, WALL)
line(P(34 - T, 7.75), P(34, 7.75), 0.6, WALL)

# Door garage->kitchen (swing into kitchen), hinge at (13.25, 10.75)
hinge = P(13.25, 10.75)
line(hinge, P(15.95, 10.75), 0.9)  # door leaf (open 90 deg)
page.draw_sector(hinge, P(13.25, 13.45), 90, color=GREY, width=0.4, dashes="[3 2] 0")
text(*P(12.1, 12.4), "20 MIN", 5.5, color=GREY, align="center")

# Garage sectional door (dashed overhead line)
line(P(1.5, 17.75), P(11.5, 17.75), 0.6, GREY, dashes="[6 3] 0")
line(P(1.5, 16.6), P(11.5, 16.6), 0.4, LIGHT, dashes="[6 3] 0")
text(*P(6.5, 17.25), "16'-0\" x 7'-0\" SECTIONAL DOOR", 6.5, color=GREY, align="center")

# Family room beyond (not in scope), break line
fr = R(13.25, 14.375, 34 - T, 18 - T)
text(*P(23.5, 16.4), "FAMILY ROOM", 11, bold=True, color=GREY, align="center")
text(*P(23.5, 16.95), "NOT IN SCOPE", 7, color=GREY, align="center")
line(P(21.0, 14.0), P(21.0, 14.375), 0.6, WALL)
line(P(29.0, 14.0), P(29.0, 14.375), 0.6, WALL)

# ---------------------------------------------------------------- casework
CAB = (0.97, 0.97, 0.96)
# Refrigerator 36" x 30"
rect(R(13.4, T + 0.05, 16.4, 3.0), 0.9, INK, fill=CAB)
line(P(13.4, 2.75), P(16.4, 2.75), 0.4, GREY)
# North base cabinets 24" deep
rect(R(16.4, T, 22.0, 2.5), 0.9, INK, fill=CAB)
rect(R(24.5, T, 33.5, 2.5), 0.9, INK, fill=CAB)
line(P(16.4, 2.3), P(22.0, 2.3), 0.35, GREY)
line(P(24.5, 2.3), P(31.5, 2.3), 0.35, GREY)
# Range 30"
rect(R(22.0, T, 24.5, 2.6), 1.0, INK, fill=(1, 1, 1))
for cx, cy in ((22.65, 1.15), (23.85, 1.15), (22.65, 2.0), (23.85, 2.0)):
    circle(P(cx, cy), 0.28 * FT, 0.5, GREY)
text(*P(23.25, 3.05), "RANGE", 6.5, color=GREY, align="center")
# hood (dashed, above)
rect(R(21.9, T, 24.6, 2.0), 0.5, GREY, dashes="[4 2] 0")
# East base cabinets
rect(R(31.5, 2.5, 33.5, 11.0), 0.9, INK, fill=CAB)
line(P(31.7, 2.5), P(31.7, 11.0), 0.35, GREY)
# Sink (double bowl)
rect(R(31.85, 4.85, 33.25, 6.15), 0.7, INK)
rect(R(31.85, 6.35, 33.25, 7.65), 0.7, INK)
circle(P(33.05, 6.25), 2.2, 0.5)
line(P(31.5, 7.75), P(33.5, 7.75), 0.4, GREY)
line(P(31.5, 9.75), P(33.5, 9.75), 0.4, GREY)
# Upper wall cabinets (dashed, above)
for r_ in (R(16.4, T, 21.9, 1.6), R(24.6, T, 33.5, 1.6), R(32.4, 1.6, 33.5, 4.6), R(32.4, 7.9, 33.5, 11.0)):
    rect(r_, 0.5, GREY, dashes="[4 2] 0")
# Island 7'-6" x 3'-6" with seating overhang
rect(R(19.5, 6.0, 27.0, 9.5), 1.0, INK, fill=CAB)
line(P(19.5, 8.75), P(27.0, 8.75), 0.4, GREY, dashes="[3 2] 0")
text(*P(23.25, 7.2), "ISLAND", 8, bold=True, color=GREY, align="center")
for sx in (21.0, 23.25, 25.5):
    circle(P(sx, 10.15), 0.55 * FT, 0.5, LIGHT)

# Garage contents: car outline, panel
car = R(2.6, 3.6, 10.4, 15.4)
page.draw_rect(car, color=LIGHT, width=0.6, dashes="[8 4] 0", radius=0.08)
text(*P(6.5, 9.6), "PARKING", 7, color=LIGHT, align="center")

# Room labels
text(*P(6.5, 6.4), "GARAGE", 14, bold=True, align="center")
text(*P(6.5, 6.95), "103", 8, color=GREY, align="center")
text(*P(17.2, 6.0), "KITCHEN", 14, bold=True, align="center")
text(*P(17.2, 6.55), "101   9'-0\" CLG", 8, color=GREY, align="center")

# ---------------------------------------------------------------- dimensions
def dim_h(fx0, fx1, fy, label):
    a, b = P(fx0, fy), P(fx1, fy)
    line(a, b, 0.4, GREY)
    for p in (a, b):
        line(fitz.Point(p.x - 3, p.y + 3), fitz.Point(p.x + 3, p.y - 3), 0.6, GREY)
        line(fitz.Point(p.x, p.y - 5), fitz.Point(p.x, p.y + 8), 0.35, GREY)
    text((a.x + b.x) / 2, a.y - 3, label, 7.5, color=INK, align="center")


def dim_v(fy0, fy1, fx, label):
    a, b = P(fx, fy0), P(fx, fy1)
    line(a, b, 0.4, GREY)
    for p in (a, b):
        line(fitz.Point(p.x - 3, p.y + 3), fitz.Point(p.x + 3, p.y - 3), 0.6, GREY)
        line(fitz.Point(p.x - 8, p.y), fitz.Point(p.x + 5, p.y), 0.35, GREY)
    m = fitz.Point(a.x - 4, (a.y + b.y) / 2)
    page.insert_text(m, label, fontname="nr", fontsize=7.5, color=INK, rotate=90)


dim_h(0, 34, -1.6, "34'-0\"")
dim_h(0, 13, -0.85, "13'-0\"")
dim_h(13, 34, -0.85, "21'-0\"")
dim_v(0, 18, -1.1, "18'-0\"")
dim_v(0, 14.2, 35.0, "14'-2\"")

# ---------------------------------------------------------------- electrical symbols
symbols = {k: [] for k in ("lights", "gfci", "undercab", "dedicated", "dimmers", "ev")}


def recessed(fx, fy):
    c = P(fx, fy)
    circle(c, 7.5, 1.1, ELEC, fill=(1, 1, 1))
    circle(c, 3.6, 0.7, ELEC)
    text(c.x + 8.5, c.y - 6, "A", 6.5, bold=True, color=ELEC)
    symbols["lights"].append((c.x, c.y))


def duplex(fx, fy, orient="n", tag="GFCI", key="gfci", extra=None):
    """Duplex receptacle: circle with two parallel lines, wall side stem."""
    c = P(fx, fy)
    circle(c, 6.2, 1.0, ELEC, fill=(1, 1, 1))
    if orient in ("n", "s"):
        line(fitz.Point(c.x - 9.5, c.y - 2.2), fitz.Point(c.x + 9.5, c.y - 2.2), 1.0, ELEC)
        line(fitz.Point(c.x - 9.5, c.y + 2.2), fitz.Point(c.x + 9.5, c.y + 2.2), 1.0, ELEC)
        ty = c.y + 15 if orient == "n" else c.y - 9
        text(c.x, ty, tag, 6.5, bold=True, color=ELEC, align="center")
        if extra:
            text(c.x, ty + 7.5, extra, 5.5, color=GREY, align="center")
    else:
        line(fitz.Point(c.x - 2.2, c.y - 9.5), fitz.Point(c.x - 2.2, c.y + 9.5), 1.0, ELEC)
        line(fitz.Point(c.x + 2.2, c.y - 9.5), fitz.Point(c.x + 2.2, c.y + 9.5), 1.0, ELEC)
        tx = c.x - 10 if orient == "e" else c.x + 10
        text(tx, c.y + 2.5, tag, 6.5, bold=True, color=ELEC, align="right" if orient == "e" else "left")
    if key:
        symbols[key].append((c.x, c.y))


def island_gfci(fx, fy):
    c = P(fx, fy)
    rect(fitz.Rect(c.x - 8.5, c.y - 8.5, c.x + 8.5, c.y + 8.5), 0.6, ELEC, fill=(1, 1, 1))
    circle(c, 5.6, 1.0, ELEC)
    line(fitz.Point(c.x - 2, c.y - 8.5), fitz.Point(c.x - 2, c.y + 8.5), 0.9, ELEC)
    line(fitz.Point(c.x + 2, c.y - 8.5), fitz.Point(c.x + 2, c.y + 8.5), 0.9, ELEC)
    text(c.x, c.y - 11, "GFCI", 6.5, bold=True, color=ELEC, align="center")
    symbols["gfci"].append((c.x, c.y))


def undercab(fx0, fx1, fy=None, vertical=False, fxv=None, fy0=None, fy1=None):
    if not vertical:
        a, b = P(fx0, fy), P(fx1, fy)
        rect(fitz.Rect(a.x, a.y - 2.6, b.x, b.y + 2.6), 0.9, ELEC, fill=(1, 1, 1))
        n = int((b.x - a.x) / 9)
        for i in range(n):
            x = a.x + 4 + i * (b.x - a.x - 8) / max(n - 1, 1)
            line(fitz.Point(x - 2, a.y + 2.6), fitz.Point(x + 2, a.y - 2.6), 0.5, ELEC)
        mid = fitz.Point((a.x + b.x) / 2, a.y)
        text(mid.x, mid.y + 12, "UC", 6.5, bold=True, color=ELEC, align="center")
    else:
        a, b = P(fxv, fy0), P(fxv, fy1)
        rect(fitz.Rect(a.x - 2.6, a.y, b.x + 2.6, b.y), 0.9, ELEC, fill=(1, 1, 1))
        n = int((b.y - a.y) / 9)
        for i in range(n):
            y = a.y + 4 + i * (b.y - a.y - 8) / max(n - 1, 1)
            line(fitz.Point(a.x - 2.6, y + 2), fitz.Point(a.x + 2.6, y - 2), 0.5, ELEC)
        mid = fitz.Point(a.x, (a.y + b.y) / 2)
        text(mid.x, a.y - 4, "UC", 6.5, bold=True, color=ELEC, align="center")
    symbols["undercab"].append((mid.x, mid.y))


def dedicated(fx, fy, tag, note, orient="n"):
    """Single special-purpose receptacle (triangle-in-circle) with circuit tag."""
    c = P(fx, fy)
    circle(c, 7.0, 1.1, ELEC, fill=(1, 1, 1))
    tri = [fitz.Point(c.x, c.y - 4.2), fitz.Point(c.x - 3.9, c.y + 2.8), fitz.Point(c.x + 3.9, c.y + 2.8)]
    page.draw_polyline(tri + [tri[0]], color=ELEC, width=0.8, fill=ELEC)
    if orient == "n":
        text(c.x, c.y + 16, tag, 6.5, bold=True, color=ELEC, align="center")
        text(c.x, c.y + 23, note, 5.5, color=GREY, align="center")
    else:
        text(c.x - 11, c.y - 1, tag, 6.5, bold=True, color=ELEC, align="right")
        text(c.x - 11, c.y + 6, note, 5.5, color=GREY, align="right")
    symbols["dedicated"].append((c.x, c.y))


def dimmer(fx, fy, label_side="right"):
    c = P(fx, fy)
    s = 12
    text(c.x, c.y + 4.2, "S", s, bold=True, color=ELEC, align="center")
    text(c.x + 4.8, c.y + 7.2, "D", 6.5, bold=True, color=ELEC)
    symbols["dimmers"].append((c.x, c.y))


def ev(fx, fy):
    c = P(fx, fy)
    r_ = fitz.Rect(c.x - 13, c.y - 9, c.x + 13, c.y + 9)
    rect(r_, 1.2, ELEC, fill=(1, 1, 1))
    text(c.x, c.y + 3.2, "EV", 8.5, bold=True, color=ELEC, align="center")
    text(c.x, c.y + 22, "EVSE, LEVEL 2", 6.5, bold=True, color=ELEC, align="center")
    text(c.x, c.y + 29.5, "60A 2P, #6 CU, 48A CONT.", 5.5, color=GREY, align="center")
    symbols["ev"].append((c.x, c.y))


# 12 recessed downlights, 3 rows x 4
for fy in (3.75, 7.75, 11.75):
    for fx in (15.75, 20.5, 25.25, 30.0):
        if fy == 7.75 and fx in (20.5, 25.25):
            pass
        recessed(fx, fy)

# 6 GFCI countertop receptacles
duplex(19.2, 0.85, "n")
duplex(28.0, 0.85, "n")
duplex(33.15, 3.75, "e")
duplex(33.15, 10.45, "e")
island_gfci(20.0, 7.75)
island_gfci(26.5, 7.75)

# 3 under-cabinet LED runs
undercab(16.7, 21.6, fy=1.75)
undercab(24.9, 31.6, fy=1.75)
undercab(None, None, vertical=True, fxv=32.55, fy0=8.1, fy1=10.85)

# 3 dedicated appliance circuits
dedicated(14.9, 0.95, "REF", "20A, 1P")
dedicated(23.25, 0.95, "RANGE", "50A, 2P")
dedicated(31.9, 8.75, "DW", "20A, 1P", orient="w")

# 3 dimmer switches
dimmer(13.75, 10.2)
dimmer(20.45, 13.45)
dimmer(29.55, 13.45)

# EV charger on garage north wall
ev(6.5, 1.05)

# Existing panel (not counted)
pnl = R(T, 7.2, T + 0.45, 9.6)
rect(pnl, 1.0, ELEC, fill=(0.2, 0.2, 0.22))
text(*P(1.25, 8.3), "PANEL 'A'", 7, bold=True, color=ELEC)
text(*P(1.25, 8.75), "200A EXISTING", 5.8, color=GREY)

# EV home run: panel -> EVSE (dashed, with arrow tick)
hr = [P(0.95, 7.2), P(0.95, 1.05), P(6.5 - 0.37, 1.05)]
page.draw_polyline(hr, color=ELEC, width=0.9, dashes="[5 2.5] 0")
text(*P(3.2, 0.92), "EV-1, 1\" EMT", 5.8, color=GREY, align="center")

# Switch legs (curved dashed) dimmers -> light rows
def arc(p0, p1, bulge=18):
    m = fitz.Point((p0.x + p1.x) / 2, (p0.y + p1.y) / 2 - bulge)
    page.draw_bezier(p0, m, m, p1, color=GREY, width=0.5, dashes="[3 2] 0")


arc(P(13.95, 10.0), P(15.75, 11.55), 6)
arc(P(15.95, 11.75), P(20.3, 11.75), 14)
arc(P(20.7, 11.75), P(25.05, 11.75), 14)
arc(P(25.45, 11.75), P(29.8, 11.75), 14)
arc(P(20.45, 13.2), P(20.5, 7.95), -14)
arc(P(20.7, 7.75), P(25.05, 7.75), 12)
arc(P(29.55, 13.2), P(30.0, 4.0), -22)
arc(P(15.95, 3.75), P(20.3, 3.75), 12)
arc(P(20.7, 3.75), P(25.05, 3.75), 12)
arc(P(25.45, 3.75), P(29.8, 3.75), 12)

# keyed notes (hex)
def keynote(fx, fy, n):
    c = P(fx, fy)
    import math
    pts = [fitz.Point(c.x + 6.5 * math.cos(math.radians(a)), c.y + 6.5 * math.sin(math.radians(a))) for a in range(0, 361, 60)]
    page.draw_polyline(pts, color=INK, width=0.7, fill=(1, 1, 1))
    text(c.x, c.y + 2.6, str(n), 7, bold=True, align="center")


keynote(8.6, 1.05, 1)
keynote(26.5, 6.6, 2)
keynote(21.9, 0.95, 3)
keynote(2.2, 9.1, 4)

# ---------------------------------------------------------------- drawing title
ty = Y0 + 18 * FT + 46
circle(fitz.Point(X0 + 14, ty), 13, 1.0)
line(fitz.Point(X0 + 1, ty), fitz.Point(X0 + 27, ty), 0.8)
text(X0 + 14, ty - 3, "1", 9, bold=True, align="center")
text(X0 + 14, ty + 9, "E-1", 6.5, align="center")
text(X0 + 36, ty - 2, "KITCHEN AND GARAGE ELECTRICAL PLAN", 14, bold=True)
line(fitz.Point(X0 + 36, ty + 3), fitz.Point(X0 + 330, ty + 3), 1.2)
text(X0 + 36, ty + 14, "SCALE: 1/2\" = 1'-0\"", 8, color=GREY)
# north arrow + graphic scale
na = fitz.Point(X0 + 420, ty - 2)
circle(na, 13, 0.8)
page.draw_polyline([fitz.Point(na.x, na.y - 13), fitz.Point(na.x - 5, na.y + 6), fitz.Point(na.x, na.y + 2), fitz.Point(na.x, na.y - 13)], color=INK, fill=INK, width=0.6)
text(na.x, na.y - 16, "N", 7, bold=True, align="center")
gx = X0 + 470
for i in range(4):
    rect(fitz.Rect(gx + i * FT, ty - 6, gx + (i + 1) * FT, ty - 1), 0.5, INK, fill=INK if i % 2 == 0 else (1, 1, 1))
    text(gx + i * FT, ty + 7, f"{i * 2 if False else i}'", 6, color=GREY, align="center")
text(gx + 4 * FT, ty + 7, "4'", 6, color=GREY, align="center")

# ---------------------------------------------------------------- legend
LX, LY = X0, ty + 44
text(LX, LY, "ELECTRICAL SYMBOL LEGEND", 10, bold=True)
line(fitz.Point(LX, LY + 4), fitz.Point(LX + 330, LY + 4), 0.8)
rows = [
    ("rec", "RECESSED LED DOWNLIGHT, 4\" WAFER, TYPE A"),
    ("gfci", "DUPLEX RECEPTACLE, 20A, GFCI, COUNTERTOP"),
    ("uc", "UNDER-CABINET LED LIGHT RUN, 24V DRIVER"),
    ("ded", "DEDICATED APPLIANCE CIRCUIT, SEE TAG"),
    ("dim", "DIMMER SWITCH, LED RATED, ELV"),
    ("ev", "LEVEL 2 EV CHARGER CIRCUIT, 60A 2P"),
    ("pnl", "PANELBOARD, EXISTING TO REMAIN"),
]
for i, (k, label) in enumerate(rows):
    cy = LY + 24 + i * 22
    cx = LX + 18
    c = fitz.Point(cx, cy)
    if k == "rec":
        circle(c, 7.5, 1.1, ELEC); circle(c, 3.6, 0.7, ELEC)
    elif k == "gfci":
        circle(c, 6.2, 1.0, ELEC)
        line(fitz.Point(cx - 9.5, cy - 2.2), fitz.Point(cx + 9.5, cy - 2.2), 1.0, ELEC)
        line(fitz.Point(cx - 9.5, cy + 2.2), fitz.Point(cx + 9.5, cy + 2.2), 1.0, ELEC)
    elif k == "uc":
        rect(fitz.Rect(cx - 14, cy - 2.6, cx + 14, cy + 2.6), 0.9, ELEC)
        for j in range(4):
            x = cx - 10 + j * 6.6
            line(fitz.Point(x - 2, cy + 2.6), fitz.Point(x + 2, cy - 2.6), 0.5, ELEC)
    elif k == "ded":
        circle(c, 7.0, 1.1, ELEC)
        tri = [fitz.Point(cx, cy - 4.2), fitz.Point(cx - 3.9, cy + 2.8), fitz.Point(cx + 3.9, cy + 2.8)]
        page.draw_polyline(tri + [tri[0]], color=ELEC, width=0.8, fill=ELEC)
    elif k == "dim":
        text(cx, cy + 4.2, "S", 12, bold=True, color=ELEC, align="center")
        text(cx + 4.8, cy + 7.2, "D", 6.5, bold=True, color=ELEC)
    elif k == "ev":
        rect(fitz.Rect(cx - 13, cy - 8, cx + 13, cy + 8), 1.2, ELEC)
        text(cx, cy + 3, "EV", 8, bold=True, color=ELEC, align="center")
    elif k == "pnl":
        rect(fitz.Rect(cx - 13, cy - 4, cx + 13, cy + 4), 1.0, ELEC, fill=(0.2, 0.2, 0.22))
    text(LX + 44, cy + 3, label, 8)

# general notes
NX = X0 + 420
text(NX, LY, "GENERAL NOTES", 10, bold=True)
line(fitz.Point(NX, LY + 4), fitz.Point(NX + 380, LY + 4), 0.8)
notes = [
    "1. ALL WORK SHALL COMPLY WITH THE CURRENT CALIFORNIA ELECTRICAL CODE AND LOCAL AMENDMENTS.",
    "2. ALL KITCHEN COUNTERTOP RECEPTACLES SHALL BE GFCI PROTECTED, 20A, TAMPER RESISTANT.",
    "3. PROVIDE TWO 20A SMALL APPLIANCE BRANCH CIRCUITS MINIMUM FOR COUNTERTOP RECEPTACLES.",
    "4. ALL RECESSED FIXTURES SHALL BE IC RATED, AIRTIGHT, JA8 COMPLIANT, 3000K.",
    "5. DIMMERS SHALL BE COMPATIBLE WITH SPECIFIED LED DRIVERS. VERIFY BEFORE ROUGH-IN.",
    "6. EV CHARGER CIRCUIT: 60A 2P BREAKER, #6 CU THHN IN 1\" EMT, 48A CONTINUOUS.",
    "7. VERIFY ALL DEVICE LOCATIONS WITH OWNER AND CASEWORK SHOP DRAWINGS.",
]
for i, n in enumerate(notes):
    text(NX, LY + 22 + i * 14, n, 7.6)

KX = NX + 420
text(KX, LY, "KEYED NOTES", 10, bold=True)
line(fitz.Point(KX, LY + 4), fitz.Point(KX + 300, LY + 4), 0.8)
knotes = [
    ("1", "MOUNT EVSE AT 48\" AFF. COORDINATE WITH OWNER'S VEHICLE."),
    ("2", "ISLAND RECEPTACLES IN SIDE PANELS, LISTED ASSEMBLY."),
    ("3", "RANGE RECEPTACLE BEHIND RANGE, 14-50R, 50A 2P."),
    ("4", "LOAD CALC ON SHEET E-2. SPARE SPACES VERIFIED."),
]
for i, (n, s) in enumerate(knotes):
    keynote(0, 0, "")  if False else None
    c = fitz.Point(KX + 7, LY + 20 + i * 18)
    import math
    pts = [fitz.Point(c.x + 6.5 * math.cos(math.radians(a)), c.y + 6.5 * math.sin(math.radians(a))) for a in range(0, 361, 60)]
    page.draw_polyline(pts, color=INK, width=0.7)
    text(c.x, c.y + 2.6, n, 7, bold=True, align="center")
    text(KX + 20, c.y + 3, s, 7.6)


# ---------------------------------------------------------------- fixture schedule
SX, SY = X0, LY + 200
text(SX, SY, "LIGHTING FIXTURE SCHEDULE", 10, bold=True)
cols = [0, 40, 260, 330, 400, 470]
hdr = ["TYPE", "DESCRIPTION", "LAMP", "VOLTS", "WATTS", "MOUNTING"]
rowsS = [
    ["A", "4\" WAFER DOWNLIGHT, IC RATED, 90 CRI", "LED 3000K", "120", "9", "RECESSED"],
    ["UC", "UNDER-CABINET LINEAR, DIMMABLE", "LED 3000K", "24 DC", "4/FT", "SURFACE"],
    ["EV", "LEVEL 2 EVSE, HARDWIRED, 48A", "-", "240", "11,520", "WALL, 48\" AFF"],
]
tw = 560
rect(fitz.Rect(SX, SY + 8, SX + tw, SY + 8 + 16 * 4), 0.8)
for i in range(1, 4):
    line(fitz.Point(SX, SY + 8 + 16 * i), fitz.Point(SX + tw, SY + 8 + 16 * i), 0.4, GREY)
for c in cols[1:]:
    line(fitz.Point(SX + c, SY + 8), fitz.Point(SX + c, SY + 8 + 64), 0.4, GREY)
for j, h in enumerate(hdr):
    text(SX + cols[j] + 5, SY + 20, h, 7, bold=True)
for i, r in enumerate(rowsS):
    for j, v in enumerate(r):
        text(SX + cols[j] + 5, SY + 36 + 16 * i, v, 7.2, bold=(j == 0))

# ---------------------------------------------------------------- title block (right strip)
TB = fitz.Rect(W - 26 - 250, 26, W - 26, H - 26)
line(fitz.Point(TB.x0, TB.y0), fitz.Point(TB.x0, TB.y1), 1.6)
x = TB.x0 + 14
y = TB.y0 + 34
text(x, y, "LARKSPUR STUDIO", 15, bold=True)
text(x, y + 14, "RESIDENTIAL DESIGN", 8, color=GREY)
text(x, y + 26, "LOS ANGELES, CALIFORNIA", 7, color=GREY)
line(fitz.Point(TB.x0, y + 40), fitz.Point(TB.x1, y + 40), 0.7)
y += 62
text(x, y, "ELECTRICAL DESIGN-BUILD", 6.5, color=GREY)
text(x, y + 15, "VELA ELECTRIC", 13, bold=True)
text(x, y + 28, "C-10 ELECTRICAL CONTRACTOR", 7, color=GREY)
line(fitz.Point(TB.x0, y + 42), fitz.Point(TB.x1, y + 42), 0.7)
y += 64
text(x, y, "PROJECT", 6.5, color=GREY)
text(x, y + 16, "CALDER RESIDENCE", 13, bold=True)
text(x, y + 30, "KITCHEN REMODEL + EV CHARGER", 8.5, bold=True)
text(x, y + 43, "2140 LARKSPUR LANE", 8)
text(x, y + 54, "LOS ANGELES, CA 90039", 8)
line(fitz.Point(TB.x0, y + 68), fitz.Point(TB.x1, y + 68), 0.7)
y += 88
text(x, y, "REVISIONS", 6.5, color=GREY)
revs = [("NO.", "DESCRIPTION", "DATE"), ("1", "OWNER REVIEW", "09.29.26"), ("2", "PERMIT SET", "10.08.26")]
for i, (a, b, c) in enumerate(revs):
    yy = y + 16 + i * 13
    text(x, yy, a, 7, bold=(i == 0))
    text(x + 30, yy, b, 7, bold=(i == 0))
    text(TB.x1 - 14, yy, c, 7, bold=(i == 0), align="right")
line(fitz.Point(TB.x0, y + 60), fitz.Point(TB.x1, y + 60), 0.7)
y += 80
for lab, val in (("DRAWN BY", "R. OCHOA"), ("CHECKED BY", "T. VELA"), ("JOB NO.", "VE-2614"), ("DATE", "10.08.2026"), ("SCALE", "1/2\" = 1'-0\"")):
    text(x, y, lab, 6.5, color=GREY)
    text(TB.x1 - 14, y, val, 8, bold=True, align="right")
    y += 17
line(fitz.Point(TB.x0, y), fitz.Point(TB.x1, y), 0.7)
# stamp placeholder
sc = fitz.Point((TB.x0 + TB.x1) / 2, y + 95)
circle(sc, 62, 0.6, LIGHT)
circle(sc, 56, 0.4, LIGHT)
text(sc.x, sc.y - 4, "NOT FOR", 8, bold=True, color=LIGHT, align="center")
text(sc.x, sc.y + 8, "CONSTRUCTION", 8, bold=True, color=LIGHT, align="center")
# sheet title + number at bottom
yb = TB.y1 - 150
line(fitz.Point(TB.x0, yb), fitz.Point(TB.x1, yb), 1.2)
text(x, yb + 20, "SHEET TITLE", 6.5, color=GREY)
text(x, yb + 38, "ELECTRICAL PLAN", 14, bold=True)
text(x, yb + 52, "KITCHEN AND GARAGE", 9)
line(fitz.Point(TB.x0, yb + 66), fitz.Point(TB.x1, yb + 66), 0.7)
text(x, yb + 84, "SHEET", 6.5, color=GREY)
text((TB.x0 + TB.x1) / 2, yb + 132, "E-1", 46, bold=True, align="center")

# metadata
doc.set_metadata({
    "title": "Calder Residence Kitchen Remodel, Electrical Plan E-1",
    "author": "Larkspur Studio (fictional)",
    "subject": "Fictional sample plan for product film",
    "creator": "make_plan.py",
    "producer": "PyMuPDF",
})
pdf_path = os.path.join(OUT, "plan-e1.pdf")
doc.save(pdf_path, garbage=4, deflate=True)

counts = {k: len(v) for k, v in symbols.items()}
expected = {"lights": 12, "gfci": 6, "undercab": 3, "dedicated": 3, "dimmers": 3, "ev": 1}
assert counts == expected, counts
with open(os.path.join(OUT, "plan-symbols.json"), "w") as f:
    json.dump({"pageWidthPt": W, "pageHeightPt": H, "units": "pdf-points-top-left", "symbols": symbols}, f, indent=1)
print("wrote", pdf_path, counts)
