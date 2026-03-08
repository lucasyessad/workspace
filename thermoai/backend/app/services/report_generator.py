"""
ThermoPilot AI — PDF Report Generator v2
Structure identique aux bureaux d'étude thermiques agréés (ANAH / AG copropriété).

Références :
  - Arrêté du 4 mai 2022 — audit énergétique réglementaire
  - Guide ANAH rénovation énergétique copropriété, éd. 2024
  - Loi n° 65-557 du 10 juillet 1965 (art. 24 et 25)
  - Loi Climat & Résilience n° 2021-1104
"""
import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    HRFlowable, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate,
    Spacer, Table, TableStyle,
)

# ─── Palette de couleurs ─────────────────────────────────────────────────────

DPE_COLORS = {
    "A": "#00a84f", "B": "#52b748", "C": "#c8d200",
    "D": "#f7e400", "E": "#f0a500", "F": "#e8500a", "G": "#cc0000",
}
DPE_RANGES = {
    "A": "≤ 70 kWhep/m²/an",
    "B": "71 – 110",
    "C": "111 – 180",
    "D": "181 – 250",
    "E": "251 – 330",
    "F": "331 – 420",
    "G": "> 420 kWhep/m²/an",
}

ANAH_GREEN  = "#18753c"
ANAH_LIGHT  = "#e8f5ee"
BLUE_GOV    = "#000091"
BLUE_LIGHT  = "#e8eeff"
GRAY_BORDER = "#cbd5e0"
GRAY_ROW    = "#f7fafc"
ORANGE_WARN = "#f59e0b"

PAGE_W = 17 * cm  # usable width (A4 - 2×2cm margins)


# ─── Styles ──────────────────────────────────────────────────────────────────

def _styles(brand: str = ANAH_GREEN) -> dict:
    base = getSampleStyleSheet()
    B = colors.HexColor(brand)
    return {
        "cover_title": ParagraphStyle(
            "cover_title", parent=base["Normal"],
            fontSize=26, textColor=colors.white,
            alignment=TA_CENTER, fontName="Helvetica-Bold", leading=32,
        ),
        "cover_sub": ParagraphStyle(
            "cover_sub", parent=base["Normal"],
            fontSize=12, textColor=colors.HexColor("#d1fae5") if brand == ANAH_GREEN else colors.HexColor("#c7d2fe"),
            alignment=TA_CENTER, leading=16,
        ),
        "cover_building": ParagraphStyle(
            "cover_building", parent=base["Normal"],
            fontSize=19, textColor=colors.HexColor("#1a202c"),
            alignment=TA_CENTER, fontName="Helvetica-Bold",
        ),
        "cover_addr": ParagraphStyle(
            "cover_addr", parent=base["Normal"],
            fontSize=11, textColor=colors.HexColor("#4a5568"), alignment=TA_CENTER,
        ),
        "cover_meta": ParagraphStyle(
            "cover_meta", parent=base["Normal"],
            fontSize=9, textColor=colors.HexColor("#2d3748"), alignment=TA_CENTER,
        ),
        "h2": ParagraphStyle(
            "h2", parent=base["Heading2"],
            fontSize=12, textColor=B, spaceBefore=14, spaceAfter=3,
            fontName="Helvetica-Bold",
        ),
        "body": ParagraphStyle(
            "body", parent=base["Normal"],
            fontSize=9.5, spaceAfter=4, leading=14,
        ),
        "body_j": ParagraphStyle(
            "body_j", parent=base["Normal"],
            fontSize=9.5, spaceAfter=4, leading=14, alignment=TA_JUSTIFY,
        ),
        "small": ParagraphStyle(
            "small", parent=base["Normal"],
            fontSize=8, textColor=colors.HexColor("#718096"), spaceAfter=3,
        ),
        "footer": ParagraphStyle(
            "footer", parent=base["Normal"],
            fontSize=7, textColor=colors.HexColor("#9ca3af"),
            alignment=TA_CENTER, spaceBefore=2,
        ),
        "caption": ParagraphStyle(
            "caption", parent=base["Normal"],
            fontSize=8, textColor=colors.HexColor("#4a5568"),
            alignment=TA_CENTER, spaceAfter=6,
        ),
        "metric_val": ParagraphStyle(
            "metric_val", parent=base["Normal"],
            fontSize=20, textColor=B, alignment=TA_CENTER, fontName="Helvetica-Bold",
        ),
        "metric_unit": ParagraphStyle(
            "metric_unit", parent=base["Normal"],
            fontSize=7.5, textColor=colors.HexColor("#718096"), alignment=TA_CENTER,
        ),
        "metric_label": ParagraphStyle(
            "metric_label", parent=base["Normal"],
            fontSize=8.5, textColor=colors.HexColor("#374151"),
            alignment=TA_CENTER, fontName="Helvetica-Bold",
        ),
    }


# ─── Document + callbacks ────────────────────────────────────────────────────

def _doc(buffer: io.BytesIO) -> SimpleDocTemplate:
    return SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2.2*cm, bottomMargin=2*cm,
    )


def _page_cb(org_name: str, report_title: str, brand: str = ANAH_GREEN):
    """Callback: header band + footer on pages 2+; footer only on page 1 (cover)."""
    def _draw(canvas, doc):
        canvas.saveState()
        pw, ph = A4

        if doc.page > 1:
            # ── Header band ────────────────────────────────────────────────
            canvas.setFillColor(colors.HexColor(brand))
            canvas.rect(2*cm, ph - 1.6*cm, pw - 4*cm, 0.6*cm, fill=1, stroke=0)
            canvas.setFillColor(colors.white)
            canvas.setFont("Helvetica-Bold", 7.5)
            canvas.drawString(2.2*cm, ph - 1.23*cm, f"ThermoPilot AI  ·  {report_title}")
            canvas.setFont("Helvetica", 7.5)
            canvas.drawRightString(pw - 2.2*cm, ph - 1.23*cm, org_name[:50])

        # ── Footer ─────────────────────────────────────────────────────────
        canvas.setStrokeColor(colors.HexColor(GRAY_BORDER))
        canvas.setLineWidth(0.5)
        canvas.line(2*cm, 1.5*cm, pw - 2*cm, 1.5*cm)
        canvas.setFillColor(colors.HexColor("#9ca3af"))
        canvas.setFont("Helvetica", 6.5)
        canvas.drawString(
            2*cm, 1.2*cm,
            "ThermoPilot AI  ·  Indicatif — Arrêté 4 mai 2022  ·  Ne se substitue pas à un DPE/audit officiel certifié COFRAC/RGE",
        )
        canvas.drawRightString(pw - 2*cm, 1.2*cm, f"Page {doc.page}")
        canvas.restoreState()

    return _draw


# ─── Cover page ──────────────────────────────────────────────────────────────

def _cover(story: list, s: dict, title: str, subtitle: str,
           building_data: dict, org_name: str, brand: str) -> None:
    """Page de garde professionnelle avec informations du bâtiment."""

    # ── Bandeau titre ──────────────────────────────────────────────────────
    band = Table(
        [[Paragraph(title, s["cover_title"])],
         [Paragraph(subtitle, s["cover_sub"])]],
        colWidths=[PAGE_W],
    )
    band.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), colors.HexColor(brand)),
        ("TOPPADDING",    (0, 0), (-1,  0), 28),
        ("BOTTOMPADDING", (0, 0), (-1,  0), 8),
        ("TOPPADDING",    (0, 1), (-1,  1), 0),
        ("BOTTOMPADDING", (0, 1), (-1,  1), 24),
        ("LEFTPADDING",   (0, 0), (-1, -1), 16),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 16),
    ]))
    story.append(band)
    story.append(Spacer(1, 1.2*cm))

    # ── Fiche bâtiment ─────────────────────────────────────────────────────
    name = building_data.get("name", "—")
    addr = building_data.get("address_line_1", "")
    city = f"{building_data.get('postal_code', '')} {building_data.get('city', '')}".strip()
    year = building_data.get("construction_year", "—")
    area = building_data.get("heated_area_m2", "—")
    btype = building_data.get("building_type", "—")
    floors = building_data.get("floors_above_ground", "")
    otype = building_data.get("ownership_type", "")

    addr_city = addr + (f"  —  {city}" if city else "")
    details = f"Année de construction : {year}  ·  Surface chauffée : {area} m²  ·  {btype}"
    if floors:
        details += f"  ·  {floors} niveaux"
    if otype:
        details += f"  ·  {otype}"

    building_block = Table([
        [Paragraph(name, s["cover_building"])],
        [Paragraph(addr_city, s["cover_addr"])],
        [Spacer(1, 0.3*cm)],
        [Paragraph(details, s["cover_addr"])],
    ], colWidths=[PAGE_W])
    building_block.setStyle(TableStyle([
        ("BOX",           (0, 0), (-1, -1), 2, colors.HexColor(brand)),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING",   (0, 0), (-1, -1), 20),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 20),
        ("LINEBELOW",     (0, 0), (-1,  0), 0.5, colors.HexColor(GRAY_BORDER)),
    ]))
    story.append(building_block)
    story.append(Spacer(1, 1.5*cm))

    # ── Métadonnées (org / date / réf) ────────────────────────────────────
    bg = ANAH_LIGHT if brand == ANAH_GREEN else BLUE_LIGHT
    meta = Table([[
        Paragraph(f"<b>Organisme</b><br/>{org_name}", s["cover_meta"]),
        Paragraph(f"<b>Date d'édition</b><br/>{datetime.now().strftime('%d %B %Y')}", s["cover_meta"]),
        Paragraph("<b>Référence légale</b><br/>Arrêté du 4 mai 2022", s["cover_meta"]),
        Paragraph(f"<b>Version</b><br/>ThermoPilot AI — v2", s["cover_meta"]),
    ]], colWidths=[PAGE_W / 4] * 4)
    meta.setStyle(TableStyle([
        ("BACKGROUND",  (0, 0), (-1, -1), colors.HexColor(bg)),
        ("BOX",         (0, 0), (-1, -1), 0.8, colors.HexColor(brand)),
        ("INNERGRID",   (0, 0), (-1, -1), 0.4, colors.HexColor(brand)),
        ("PADDING",     (0, 0), (-1, -1), 14),
        ("ALIGN",       (0, 0), (-1, -1), "CENTER"),
        ("VALIGN",      (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(meta)
    story.append(Spacer(1, 1.2*cm))

    # ── Note légale de bas de couverture ──────────────────────────────────
    legal = Table([[Paragraph(
        "⚠  <b>Document indicatif et confidentiel.</b> "
        "Ce rapport est produit à titre d'aide à la décision par ThermoPilot AI. "
        "Il ne se substitue pas à un DPE officiel (diagnostiqueur certifié COFRAC) "
        "ni à un audit énergétique réglementaire réalisé par un bureau d'étude agréé RGE. "
        "Les montants d'aides sont des estimations basées sur les barèmes ANAH 2024–2025.",
        s["small"],
    )]], colWidths=[PAGE_W])
    legal.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#fffbeb")),
        ("BOX",        (0, 0), (-1, -1), 0.8, colors.HexColor(ORANGE_WARN)),
        ("PADDING",    (0, 0), (-1, -1), 10),
    ]))
    story.append(legal)
    story.append(PageBreak())


# ─── DPE scale A→G ───────────────────────────────────────────────────────────

def _dpe_scale(current_label: str, target_label: str | None = None) -> Table:
    """Échelle visuelle A→G avec indicateur de classe actuelle et cible."""
    LETTERS  = ["A", "B", "C", "D", "E", "F", "G"]
    BAR_MAXW = 7.5 * cm
    BAR_PCTS = {"A": 1.00, "B": 0.86, "C": 0.73, "D": 0.60, "E": 0.47, "F": 0.34, "G": 0.21}

    rows = []
    for letter in LETTERS:
        col = colors.HexColor(DPE_COLORS.get(letter, "#888"))
        is_cur = (letter == str(current_label))
        is_tgt = (letter == str(target_label)) if target_label else False

        if is_cur and is_tgt:
            marker = "◄ ACTUEL & CIBLE"
            mk_color = "#1a202c"
        elif is_cur:
            marker = "◄ SITUATION ACTUELLE"
            mk_color = "#dc2626"
        elif is_tgt:
            marker = "◄ CLASSE VISÉE"
            mk_color = ANAH_GREEN
        else:
            marker = ""
            mk_color = "#9ca3af"

        letter_p = Paragraph(f"<b>{letter}</b>", ParagraphStyle(
            f"dl{letter}", fontSize=12, textColor=colors.white,
            alignment=TA_CENTER, fontName="Helvetica-Bold",
        ))
        range_p = Paragraph(DPE_RANGES.get(letter, ""), ParagraphStyle(
            f"dr{letter}", fontSize=8, textColor=colors.HexColor("#374151"),
        ))
        marker_p = Paragraph(f"<b>{marker}</b>" if marker else "", ParagraphStyle(
            f"dm{letter}", fontSize=8.5, textColor=colors.HexColor(mk_color),
            fontName="Helvetica-Bold" if marker else "Helvetica",
        ))

        rows.append([letter_p, "", range_p, marker_p])

    col_w = [1.2*cm, BAR_MAXW, 4*cm, 4.2*cm]
    t = Table(rows, colWidths=col_w, rowHeights=0.75*cm)

    style_cmds = [
        ("VALIGN",      (0, 0), (-1, -1), "MIDDLE"),
        ("PADDING",     (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (0,  -1), 8),
        ("GRID",        (0, 0), (-1, -1), 0.3, colors.HexColor(GRAY_BORDER)),
    ]
    for i, letter in enumerate(LETTERS):
        col = colors.HexColor(DPE_COLORS.get(letter, "#888"))
        bar_w = BAR_PCTS.get(letter, 0.5)
        style_cmds.append(("BACKGROUND", (0, i), (0, i), col))

        # Simulated bar using column background
        bar_col = colors.HexColor(DPE_COLORS.get(letter, "#888") + "55")  # transparent
        style_cmds.append(("BACKGROUND", (1, i), (1, i), col))

        # Highlight current/target row
        if letter == str(current_label):
            style_cmds.append(("BACKGROUND", (2, i), (3, i), colors.HexColor("#fff3cd")))
            style_cmds.append(("LINEABOVE",  (0, i), (-1, i), 1.5, col))
            style_cmds.append(("LINEBELOW",  (0, i), (-1, i), 1.5, col))
        elif target_label and letter == str(target_label):
            style_cmds.append(("BACKGROUND", (2, i), (3, i), colors.HexColor(ANAH_LIGHT)))

    t.setStyle(TableStyle(style_cmds))
    return t


# ─── DPE dual badges ─────────────────────────────────────────────────────────

def _dpe_badges(energy_label: str, ghg_label: str) -> Table:
    """Double badge DPE énergie + GES côte à côte."""

    def _badge(letter: str, label_line: str) -> Table:
        col = colors.HexColor(DPE_COLORS.get(str(letter), "#888888"))
        t = Table([
            [Paragraph(str(letter), ParagraphStyle(
                "bl", fontSize=36, textColor=colors.white,
                alignment=TA_CENTER, fontName="Helvetica-Bold",
            ))],
            [Paragraph(label_line, ParagraphStyle(
                "ll", fontSize=8, textColor=colors.white, alignment=TA_CENTER,
            ))],
        ], colWidths=[3.5*cm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), col),
            ("VALIGN",     (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, 0), 18),
            ("BOTTOMPADDING", (0, 1), (-1, 1), 8),
            ("PADDING",    (0, 0), (-1, -1), 6),
        ]))
        return t

    t1 = _badge(energy_label, "DPE Énergie")
    t2 = _badge(ghg_label,    "DPE Climat (GES)")
    # Deux colonnes sans padding pour éviter la largeur négative sur la colonne centrale
    wrap = Table([[t1, t2]], colWidths=[3.8*cm, 3.8*cm])
    wrap.setStyle(TableStyle([
        ("PADDING",      (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (0,  -1), 8),  # espace entre les deux badges
    ]))
    return wrap


# ─── Section header ──────────────────────────────────────────────────────────

def _section(story: list, num: str, text: str, s: dict, brand: str = ANAH_GREEN) -> None:
    story.append(Paragraph(f"{num}. {text}", s["h2"]))
    story.append(HRFlowable(
        width="100%", thickness=2, color=colors.HexColor(brand), spaceAfter=6,
    ))


# ─── Key-value table ─────────────────────────────────────────────────────────

def _kv(rows: list, key_w: float = 5.5, brand: str = ANAH_GREEN) -> Table:
    bg = ANAH_LIGHT if brand == ANAH_GREEN else BLUE_LIGHT
    t = Table(rows, colWidths=[key_w * cm, PAGE_W - key_w * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND",     (0, 0), (0, -1), colors.HexColor(bg)),
        ("FONTNAME",       (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE",       (0, 0), (-1, -1), 9.5),
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor(GRAY_ROW)]),
        ("GRID",           (0, 0), (-1, -1), 0.4, colors.HexColor(GRAY_BORDER)),
        ("PADDING",        (0, 0), (-1, -1), 5),
        ("VALIGN",         (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t


# ─── Metric boxes (résumé exécutif) ──────────────────────────────────────────

def _metric_boxes(items: list, brand: str = ANAH_GREEN) -> Table:
    """
    Boîtes métriques côte à côte pour le résumé exécutif.
    items: [(label, value, unit), ...]
    """
    bg = ANAH_LIGHT if brand == ANAH_GREEN else BLUE_LIGHT
    n = len(items)
    box_w = PAGE_W / n

    cells = []
    for label, value, unit in items:
        inner = Table([
            [Paragraph(str(value), ParagraphStyle(
                "mv", fontSize=22, textColor=colors.HexColor(brand),
                alignment=TA_CENTER, fontName="Helvetica-Bold",
            ))],
            [Paragraph(unit, ParagraphStyle(
                "mu", fontSize=7, textColor=colors.HexColor("#718096"), alignment=TA_CENTER,
            ))],
            [Paragraph(f"<b>{label}</b>", ParagraphStyle(
                "ml", fontSize=8.5, textColor=colors.HexColor("#374151"),
                alignment=TA_CENTER,
            ))],
        ], colWidths=[box_w - 0.6*cm])
        inner.setStyle(TableStyle([
            ("BOX",           (0, 0), (-1, -1), 1.2, colors.HexColor(brand)),
            ("BACKGROUND",    (0, 0), (-1, -1), colors.HexColor(bg)),
            ("TOPPADDING",    (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING",   (0, 0), (-1, -1), 4),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 4),
        ]))
        cells.append(inner)

    wrap = Table([cells], colWidths=[box_w] * n)
    wrap.setStyle(TableStyle([("PADDING", (0, 0), (-1, -1), 3)]))
    return wrap


# ─── Alert/info boxes ────────────────────────────────────────────────────────

def _alert_box(story: list, s: dict, text: str, bg: str, border: str) -> None:
    t = Table([[Paragraph(text, s["small"])]], colWidths=[PAGE_W])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(bg)),
        ("BOX",        (0, 0), (-1, -1), 0.8, colors.HexColor(border)),
        ("PADDING",    (0, 0), (-1, -1), 8),
    ]))
    story.append(t)


# ─── Financing calculator ─────────────────────────────────────────────────────

def _calc_financing(
    total_cost_eur,
    energy_label: str,
    target_label: str,
    savings_kwh=None,
    baseline_kwh=None,
) -> dict:
    """
    Estime les aides et le reste à charge pour un scénario de copropriété.
    MPR Copropriété : 30 % si gain ≥ 35 %, 45 % si gain ≥ 50 %
    (Guide ANAH copropriété, éd. 2024).
    """
    try:
        cost = float(str(total_cost_eur).replace(" ", "").replace(",", "."))
    except (ValueError, TypeError):
        return {}

    # Détermination du taux MPR via gain énergétique ou classe cible
    gain_pct = None
    if savings_kwh and baseline_kwh:
        try:
            gain_pct = float(str(savings_kwh)) / float(str(baseline_kwh))
        except (ValueError, ZeroDivisionError):
            pass

    if gain_pct is not None:
        if gain_pct >= 0.50:
            mpr_pct = 0.45
        elif gain_pct >= 0.35:
            mpr_pct = 0.30
        else:
            mpr_pct = None
    else:
        # Fallback sur la classe cible
        t = str(target_label)
        mpr_pct = 0.45 if t in ("A", "B", "C") else (0.30 if t in ("D",) else None)

    mpr = cost * mpr_pct if mpr_pct else 0

    # Bonus sortie passoire (+10 %) — applicable si classe F/G → D ou mieux
    bonus_passoire = 0
    if str(energy_label) in ("F", "G") and str(target_label) in ("A", "B", "C", "D"):
        bonus_passoire = cost * 0.10

    # Prime CEE (estimation conservative 8 % du montant HT)
    cee = cost * 0.08

    total_aids = mpr + bonus_passoire + cee
    reste = max(0, cost - total_aids)

    return {
        "cost":           cost,
        "mpr_pct":        mpr_pct,
        "mpr":            mpr,
        "bonus_passoire": bonus_passoire,
        "cee":            cee,
        "total_aids":     total_aids,
        "reste":          reste,
        "gain_pct":       gain_pct,
    }


# ─── Financing plan table ────────────────────────────────────────────────────

def _financing_table(fin: dict, heated_area, brand: str = ANAH_GREEN) -> list:
    """Retourne les flowables du plan de financement calculé."""
    if not fin:
        return []

    cost  = fin["cost"]
    mpr   = fin["mpr"]
    bonus = fin["bonus_passoire"]
    cee   = fin["cee"]
    aids  = fin["total_aids"]
    reste = fin["reste"]

    mpr_label = f"MaPrimeRénov' Copropriété ({int(fin['mpr_pct']*100)} %)" if fin.get("mpr_pct") else "MaPrimeRénov' Copropriété (non éligible)"
    bonus_label = "Bonus sortie de passoire thermique (+10 %)" if bonus > 0 else "Bonus sortie de passoire (non applicable)"

    rows = [
        ["Poste de financement", "Montant estimé (€ HT)", "Base légale"],
        ["Coût total des travaux", f"{cost:,.0f} €", "Devis contractuel"],
        [mpr_label, f"{mpr:,.0f} €", "Guide ANAH 2024 — MPR Copropriété"],
        [bonus_label, f"{bonus:,.0f} €" if bonus > 0 else "—", "Guide ANAH 2024"],
        ["Prime CEE (estimation)", f"{cee:,.0f} €", "Art. L. 221-1 Code énergie"],
        ["TOTAL aides estimées", f"{aids:,.0f} €", ""],
        ["Reste à charge copropriété", f"{reste:,.0f} €", ""],
    ]

    t = Table(rows, colWidths=[8*cm, 4.5*cm, 4.5*cm])
    style = [
        ("BACKGROUND",   (0, 0), (-1, 0), colors.HexColor(brand)),
        ("TEXTCOLOR",    (0, 0), (-1, 0), colors.white),
        ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",     (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor(GRAY_ROW)]),
        ("GRID",         (0, 0), (-1, -1), 0.4, colors.HexColor(GRAY_BORDER)),
        ("PADDING",      (0, 0), (-1, -1), 6),
        ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
        # Ligne total aides
        ("BACKGROUND",   (0, 5), (-1, 5), colors.HexColor(ANAH_LIGHT)),
        ("FONTNAME",     (0, 5), (-1, 5), "Helvetica-Bold"),
        ("TEXTCOLOR",    (0, 5), (-1, 5), colors.HexColor(ANAH_GREEN)),
        # Ligne reste à charge
        ("BACKGROUND",   (0, 6), (-1, 6), colors.HexColor("#fef2f2")),
        ("FONTNAME",     (0, 6), (-1, 6), "Helvetica-Bold"),
        ("TEXTCOLOR",    (0, 6), (-1, 6), colors.HexColor("#dc2626")),
    ]
    t.setStyle(TableStyle(style))

    items = [t]

    # Quote-part par m² si surface disponible
    if heated_area and reste > 0:
        try:
            cpp_m2 = reste / float(str(heated_area))
            note = (
                f"<b>Reste à charge indicatif :</b> environ <b>{cpp_m2:.0f} €/m²</b> de surface chauffée "
                "(après déduction des aides estimées). "
                "Le montant définitif dépend du règlement de copropriété, "
                "du mode de répartition des charges et des devis RGE acceptés."
            )
            items.append(Spacer(1, 0.15*cm))
            items.append(Paragraph(note, ParagraphStyle(
                "fnote", fontSize=9, leading=13,
                textColor=colors.HexColor("#374151"), spaceAfter=4,
            )))
        except (ValueError, ZeroDivisionError):
            pass

    return items


# ─── Legal footer note ───────────────────────────────────────────────────────

def _footer_note(story: list, s: dict, org_name: str) -> None:
    story.append(Spacer(1, 0.8*cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor(GRAY_BORDER)))
    for line in [
        f"ThermoPilot AI  ·  {org_name}  ·  Rapport généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}  ·  Confidentiel",
        "Document indicatif. Ne se substitue pas à un DPE officiel (diagnostiqueur certifié COFRAC) "
        "ni à un audit réglementaire par auditeur RGE agréé.",
        "Réf. : Arrêté du 4 mai 2022 — Décret n° 2022-780 — Guide ANAH copropriété éd. 2024 — Loi n° 65-557 du 10 juillet 1965.",
    ]:
        story.append(Paragraph(line, s["footer"]))


# ─── Report Generator ─────────────────────────────────────────────────────────

class ReportGenerator:

    # ── 1. Rapport d'audit complet conforme ANAH ─────────────────────────────

    def generate_audit_report(
        self,
        audit_data: dict,
        building_data: dict,
        org_name: str,
        scenarios: list | None = None,
    ) -> bytes:
        """
        Rapport d'audit énergétique réglementaire.
        Structure : Page de garde → Résumé exécutif → Identification → Performance
                    → Diagnostic → Scénarios → Aides → Méthodologie.
        Réf. : Arrêté du 4 mai 2022, art. 3 (contenu obligatoire de l'audit).
        """
        buffer = io.BytesIO()
        doc    = _doc(buffer)
        s      = _styles(ANAH_GREEN)
        story  = []

        result       = audit_data.get("result_snapshot", {})
        energy_label = result.get("energy_label", audit_data.get("computed_energy_label", "—"))
        ghg_label    = result.get("ghg_label",    audit_data.get("computed_ghg_label",    "—"))
        primary_ep   = result.get("primary_energy_per_m2",     "—")
        co2_m2       = result.get("co2_per_m2",                "—")
        annual_cost  = result.get("estimated_annual_cost_eur", "—")
        total_kwh    = result.get(
            "total_final_kwh",
            audit_data.get("baseline_energy_consumption_kwh", "—"),
        )
        baseline_cost = audit_data.get("baseline_energy_cost_eur", annual_cost)

        # ── Page de garde ──────────────────────────────────────────────────
        _cover(
            story, s,
            title="Rapport d'Audit Énergétique Réglementaire",
            subtitle="Conforme Arrêté du 4 mai 2022 — Méthode 3CL-DPE 2021",
            building_data=building_data,
            org_name=org_name,
            brand=ANAH_GREEN,
        )

        # ── Résumé exécutif ────────────────────────────────────────────────
        _section(story, "A", "Résumé exécutif", s)

        metrics = [
            ("Classe DPE Énergie",   str(energy_label),                "Méthode 3CL-DPE 2021"),
            ("Classe DPE Climat",    str(ghg_label),                   "kgCO₂eq/m²/an"),
            ("Énergie primaire",     f"{primary_ep}" if primary_ep != "—" else "—", "kWhep/m²/an"),
            ("Facture énergétique",  f"{annual_cost}" if annual_cost != "—" else "—", "€/an estimés"),
        ]
        story.append(_metric_boxes(metrics))
        story.append(Spacer(1, 0.3*cm))

        # Alerte passoire thermique
        if str(energy_label) in ("F", "G"):
            _alert_box(
                story, s,
                f"⚠  <b>Passoire thermique — Classe {energy_label}.</b> "
                "La location de ce bien sera interdite pour les nouvelles signatures de bail "
                "(classe G dès 2025, classe F dès 2028) en application de la loi Climat et Résilience n° 2021-1104. "
                "Une rénovation prioritaire est fortement recommandée pour maintenir la valeur locative du bien.",
                bg="#fef2f2", border="#dc2626",
            )
            story.append(Spacer(1, 0.2*cm))

        story.append(Spacer(1, 0.3*cm))

        # ── 1. Identification ──────────────────────────────────────────────
        _section(story, "1", "Identification du bien et du mandataire", s)
        story.append(_kv([
            ["Organisation / Auditeur",   org_name],
            ["Bâtiment",                  building_data.get("name", "—")],
            ["Adresse",                   building_data.get("address_line_1", "—")],
            ["Commune",                   f"{building_data.get('postal_code', '')} {building_data.get('city', '')}".strip() or "—"],
            ["Code INSEE / Département",  building_data.get("postal_code", "—")[:2] + " (Département)"],
            ["Année de construction",     str(building_data.get("construction_year", "—"))],
            ["Surface chauffée",          f"{building_data.get('heated_area_m2', '—')} m²"],
            ["Type de bâtiment",          building_data.get("building_type", "—")],
            ["Statut de propriété",       building_data.get("ownership_type", "—")],
            ["Date de l'audit",           datetime.now().strftime("%d/%m/%Y")],
        ]))
        story.append(Spacer(1, 0.3*cm))

        # ── 2. Performance énergétique actuelle ────────────────────────────
        _section(story, "2", "Performance énergétique actuelle (état initial)", s)

        target_label = None
        if scenarios:
            target_label = scenarios[0].get("target_energy_label")

        # Badges DPE + légende
        if energy_label != "—" or ghg_label != "—":
            story.append(_dpe_badges(str(energy_label), str(ghg_label)))
            story.append(Paragraph(
                "Classe DPE Énergie (gauche) · Classe DPE Climat/GES (droite) — Méthode 3CL-DPE 2021",
                s["caption"],
            ))
            story.append(Spacer(1, 0.2*cm))

        # Échelle A→G
        story.append(_dpe_scale(str(energy_label), target_label))
        story.append(Paragraph(
            "Échelle DPE complète — La barre colorée indique la performance relative. "
            "Source : Arrêté du 31 mars 2021 modifié, facteur PEF électricité = 1,9 (arrêté du 20 novembre 2024).",
            s["caption"],
        ))
        story.append(Spacer(1, 0.2*cm))

        story.append(_kv([
            ["Énergie primaire",         f"{primary_ep} kWhep/m²/an" if primary_ep != "—" else "—"],
            ["Émissions GES",            f"{co2_m2} kgCO₂eq/m²/an"  if co2_m2 != "—"    else "—"],
            ["Consommation finale",      f"{total_kwh} kWh/an"       if total_kwh != "—" else "—"],
            ["Coût énergétique estimé",  f"{annual_cost} €/an"       if annual_cost != "—" else "—"],
            ["Méthode de calcul",        "3CL-DPE 2021 — Arrêté du 31 mars 2021 modifié"],
            ["Facteur PEF électricité",  "1,9 (en vigueur depuis le 1ᵉʳ janvier 2026)"],
        ]))
        story.append(Spacer(1, 0.3*cm))

        # ── 3. Diagnostic des déperditions thermiques ──────────────────────
        _section(story, "3", "Diagnostic des déperditions thermiques", s)
        story.append(Paragraph(
            "L'audit analyse les principales sources de déperditions thermiques du bâtiment. "
            "Les postes suivants font l'objet d'une analyse systématique selon l'arrêté du 4 mai 2022 :",
            s["body_j"],
        ))
        story.append(Spacer(1, 0.15*cm))
        diag_rows = [
            ["Composant", "Élément analysé", "Impact sur la performance"],
            ["Enveloppe — Murs", "Isolation thermique par l'extérieur (ITE) ou l'intérieur (ITI), ponts thermiques", "25–30 % des déperditions"],
            ["Enveloppe — Toiture", "Isolation des combles perdus ou aménagés, couverture", "20–25 %"],
            ["Menuiseries", "Vitrage simple/double/triple, étanchéité à l'air, ponts thermiques", "10–15 %"],
            ["Plancher bas", "Dalle sur terre-plein, vide sanitaire, isolation sous-sol", "7–10 %"],
            ["Systèmes de chauffage", "Chaudière, PAC, rendement, réseau de distribution, régulation", "Confort + émissions"],
            ["Ventilation", "VMC simple flux, double flux, étanchéité à l'air du bâtiment", "Qualité de l'air + déperditions"],
            ["Production ECS", "Ballon thermodynamique, solaire thermique, réseau collectif", "Émissions GES"],
        ]
        dt = Table(diag_rows, colWidths=[4*cm, 8.5*cm, 4.5*cm])
        dt.setStyle(TableStyle([
            ("BACKGROUND",     (0, 0), (-1, 0), colors.HexColor(ANAH_GREEN)),
            ("TEXTCOLOR",      (0, 0), (-1, 0), colors.white),
            ("FONTNAME",       (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",       (0, 0), (-1, -1), 8.5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor(GRAY_ROW)]),
            ("GRID",           (0, 0), (-1, -1), 0.4, colors.HexColor(GRAY_BORDER)),
            ("PADDING",        (0, 0), (-1, -1), 6),
            ("VALIGN",         (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(dt)
        story.append(Spacer(1, 0.3*cm))

        # ── 4. Propositions de travaux et scénarios ────────────────────────
        _section(story, "4", "Propositions de travaux et scénarios de rénovation", s)

        if scenarios:
            story.append(Paragraph(
                f"<b>{len(scenarios)} scénario(s) de rénovation</b> ont été définis sur la base de l'état initial "
                f"(classe {energy_label}). Le tableau ci-dessous présente le comparatif technico-économique. "
                "Les coûts sont HT avant application des aides.",
                s["body_j"],
            ))
            story.append(Spacer(1, 0.15*cm))
            headers = [["Scénario", "Description des travaux", "Coût HT (€)", "Écon. (kWh/an)", "Classe\nvisée", "Retour\n(ans)"]]
            rows = []
            for i, sc in enumerate(scenarios):
                rows.append([
                    Paragraph(f"<b>{sc.get('name', f'Scénario {i+1}')}</b>", ParagraphStyle("sn", fontSize=8.5, fontName="Helvetica-Bold")),
                    sc.get("works_description", "—"),
                    f"{float(sc['estimated_total_cost_eur']):,.0f}" if sc.get("estimated_total_cost_eur") else "—",
                    f"{float(sc['estimated_energy_savings_kwh']):,.0f}" if sc.get("estimated_energy_savings_kwh") else "—",
                    sc.get("target_energy_label", "—"),
                    f"{sc.get('simple_payback_years', '—')} ans" if sc.get("simple_payback_years") else "—",
                ])
            st = Table(headers + rows, colWidths=[3.5*cm, 5.5*cm, 2.5*cm, 2.5*cm, 1.5*cm, 1.5*cm])
            st.setStyle(TableStyle([
                ("BACKGROUND",     (0, 0), (-1, 0), colors.HexColor(ANAH_GREEN)),
                ("TEXTCOLOR",      (0, 0), (-1, 0), colors.white),
                ("FONTNAME",       (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE",       (0, 0), (-1, -1), 8.5),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor(GRAY_ROW)]),
                ("GRID",           (0, 0), (-1, -1), 0.4, colors.HexColor(GRAY_BORDER)),
                ("ALIGN",          (2, 0), (-1, -1), "CENTER"),
                ("PADDING",        (0, 0), (-1, -1), 5),
                ("VALIGN",         (0, 0), (-1, -1), "MIDDLE"),
            ]))
            story.append(st)
        else:
            _alert_box(
                story, s,
                "Aucun scénario de rénovation n'a encore été défini. "
                "Utilisez le module Plans de rénovation de ThermoPilot pour créer des scénarios chiffrés.",
                bg="#f9fafb", border=GRAY_BORDER,
            )
        story.append(Spacer(1, 0.3*cm))

        # ── 5. Aides financières ───────────────────────────────────────────
        _section(story, "5", "Aides financières disponibles (barèmes 2024–2025)", s)
        story.append(Paragraph(
            "Les montants ci-dessous sont des <b>estimations indicatives</b> calculées selon les barèmes "
            "MaPrimeRénov' et CEE en vigueur. Le montant définitif dépend du profil de ressources "
            "du ménage (catégories ANAH : très modeste, modeste, intermédiaire, supérieur) "
            "et des devis travaux validés.",
            s["body_j"],
        ))
        story.append(Spacer(1, 0.2*cm))
        aids_data = [
            ["Dispositif", "Base légale", "Condition principale", "Montant (barème 2024–2025)"],
            ["MaPrimeRénov'\n(geste par geste)",
             "Art. L. 111-10-10 CCH\nDécret n° 2020-26\nBarème annuel ANAH",
             "Propriétaire occupant / bailleur\nArtisan RGE obligatoire\nSans condition de ressources",
             "15 % à 70 % du coût HT\nselon catégorie ANAH\n(très modeste → supérieur)\nPlafond par geste"],
            ["MaPrimeRénov'\n(parcours accompagné)",
             "Décret n° 2023-1438\nArrêté 14 décembre 2023",
             "≥ 2 sauts de classe DPE\nAccompagnateur Rénov' (MAR)\nArtisan RGE obligatoire",
             "Jusqu'à 70 % du coût + bonus BBC\n(max. 70 000 €/ménage)\nBonus sortie passoire inclus\n(+10 % si F/G → D ou mieux)"],
            ["MaPrimeRénov'\nCopropriété",
             "Loi Climat & Résilience\nGuide ANAH copropriété 2024",
             "≥ 75 % résidences principales\nGain énergie ≥ 35 % → 30 %\nGain énergie ≥ 50 % → 45 %\nAMO + artisan RGE obligatoires",
             "30 % ou 45 % du coût travaux\nMax. 25 000 €/logement\n+10 % bonus sortie passoire\n+20 % bonus copro. fragile"],
            ["Prime CEE\n(Certificats Économie d'Énergie)",
             "Art. L. 221-1 Code énergie\n5ᵉ période 2022–2026",
             "Artisan RGE — Fiche standardisée\n(BAR-EN-101, BAR-TH-113, etc.)\nCumulable avec MPR",
             "Variable selon fiche CEE\nEx. : PAC air/eau ~ 4 000–8 000 €\nIsolation combles ~ 300–600 €/logement"],
            ["Éco-PTZ\n(Prêt à taux zéro)",
             "Art. 244 quater U CGI\nProlongé jusqu'au 31/12/2027",
             "Propriétaire — logement > 2 ans\nTravaux réalisés par artisan RGE\nCumulable avec MPR",
             "Jusqu'à 50 000 €/logement\nTAEG 0 % — remboursement ≤ 20 ans\nÉco-PTZ collectif copropriété"],
            ["TVA réduite 5,5 %",
             "Art. 278-0 bis A CGI",
             "Logement d'habitation > 2 ans\nArtisan professionnel",
             "Sur montant HT travaux\n(vs taux plein 20 %)\nApplicable à tous les travaux de réno."],
            ["Denormandie\n(investissement locatif)",
             "Art. 199 novovicies I-B-5° CGI\nProlongé jusqu'au 31/12/2027",
             "Achat + travaux dans commune ACV/ORT\nAmélioration PE ≥ 30 %\nLocation ≥ 6 ans non meublée",
             "12 % (6 ans), 18 % (9 ans), 21 % (12 ans)\ndu prix de revient net — max. 300 000 €\nRéduction IR max. 63 000 €"],
        ]
        at = Table(aids_data, colWidths=[3.5*cm, 3.5*cm, 4.5*cm, 5.5*cm])
        at.setStyle(TableStyle([
            ("BACKGROUND",     (0, 0), (-1, 0), colors.HexColor(BLUE_GOV)),
            ("TEXTCOLOR",      (0, 0), (-1, 0), colors.white),
            ("FONTNAME",       (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",       (0, 0), (-1, -1), 8),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor(GRAY_ROW)]),
            ("GRID",           (0, 0), (-1, -1), 0.4, colors.HexColor(GRAY_BORDER)),
            ("PADDING",        (0, 0), (-1, -1), 5),
            ("VALIGN",         (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(at)
        story.append(Spacer(1, 0.15*cm))
        story.append(Paragraph(
            "Sources : anah.gouv.fr — france-renov.gouv.fr — legifrance.gouv.fr — "
            "Rapport AN n° 1647 (juin 2025) sur le programme Action cœur de ville.",
            s["small"],
        ))
        story.append(Spacer(1, 0.3*cm))

        # ── 6. Méthodologie et déclaration réglementaire ──────────────────
        _section(story, "6", "Méthodologie et déclaration réglementaire", s)
        story.append(Paragraph(
            "Ce rapport a été produit par <b>ThermoPilot AI</b> en s'appuyant sur la méthode de calcul "
            "<b>3CL-DPE 2021</b> (arrêté du 31 mars 2021 modifié). Le facteur d'énergie primaire (PEF) "
            "pour l'électricité est de <b>2,3</b> pour les bâtiments soumis à la réglementation antérieure "
            "à 2024, et de <b>1,9</b> depuis le 1ᵉʳ janvier 2026 (arrêté du 20 novembre 2024). "
            "Les émissions de GES sont calculées en kgCO₂eq/m²/an selon les facteurs d'émission "
            "de la Base Carbone® ADEME.",
            s["body_j"],
        ))
        story.append(Spacer(1, 0.15*cm))
        story.append(Paragraph(
            "<b>Déclaration de limite de responsabilité (obligatoire — arrêté du 4 mai 2022, art. 9) :</b> "
            "Les résultats présentés constituent des estimations à titre indicatif. "
            "Seul un audit énergétique réglementaire réalisé par un <b>auditeur certifié RGE</b> "
            "(Reconnu Garant de l'Environnement) conformément à l'arrêté du 4 mai 2022 "
            "produit des effets juridiques (obligation de cession, accès aux aides ANAH). "
            "Un DPE officiel ne peut être établi que par un <b>diagnostiqueur certifié COFRAC</b>.",
            s["body_j"],
        ))

        _footer_note(story, s, org_name)

        cb = _page_cb(org_name, "Rapport d'Audit Énergétique Réglementaire")
        doc.build(story, onFirstPage=cb, onLaterPages=cb)
        return buffer.getvalue()

    # ── 2. Synthèse Assemblée Générale de copropriété ─────────────────────────

    def generate_ag_synthesis(
        self,
        audit_data: dict,
        building_data: dict,
        org_name: str,
        scenarios: list | None = None,
    ) -> bytes:
        """
        Synthèse destinée à l'Assemblée Générale de copropriété.
        Format non-technicien — décision et financement.
        Réf. : Loi n° 65-557 du 10 juillet 1965, art. 24 et 25.
        """
        buffer = io.BytesIO()
        doc    = _doc(buffer)
        s      = _styles(BLUE_GOV)
        story  = []

        result       = audit_data.get("result_snapshot", {})
        energy_label = result.get("energy_label", audit_data.get("computed_energy_label", "—"))
        ghg_label    = result.get("ghg_label",    audit_data.get("computed_ghg_label",    "—"))
        annual_cost  = result.get("estimated_annual_cost_eur", "—")
        heated_area  = building_data.get("heated_area_m2")
        baseline_kwh = audit_data.get("baseline_energy_consumption_kwh")

        # ── Page de garde ──────────────────────────────────────────────────
        _cover(
            story, s,
            title="Synthèse pour l'Assemblée Générale de Copropriété",
            subtitle="Rénovation énergétique — Loi n° 65-557 du 10 juillet 1965 (art. 24 et 25)",
            building_data=building_data,
            org_name=org_name,
            brand=BLUE_GOV,
        )

        # ── Résumé exécutif ────────────────────────────────────────────────
        best_scenario = scenarios[0] if scenarios else None
        target_label  = best_scenario.get("target_energy_label") if best_scenario else None
        best_cost     = best_scenario.get("estimated_total_cost_eur") if best_scenario else None
        best_savings  = best_scenario.get("estimated_energy_savings_kwh") if best_scenario else None

        fin = {}
        if best_cost and energy_label != "—" and target_label:
            fin = _calc_financing(best_cost, energy_label, target_label, best_savings, baseline_kwh)

        _section(story, "A", "Résumé exécutif", s, BLUE_GOV)

        metrics = [
            ("Classe DPE actuelle",  str(energy_label), "Méthode 3CL-DPE 2021"),
            ("Classe DPE visée",     str(target_label) if target_label else "—", "Après travaux"),
            ("Coût total estimé",    f"{float(best_cost):,.0f}" if best_cost else "—", "€ HT avant aides"),
            ("Reste à charge estimé", f"{fin.get('reste', 0):,.0f}" if fin else "—", "€ HT après aides"),
        ]
        story.append(_metric_boxes(metrics, brand=BLUE_GOV))
        story.append(Spacer(1, 0.2*cm))

        # Note introductive
        intro = Table([[Paragraph(
            "Ce document est destiné aux <b>copropriétaires</b> et au <b>conseil syndical</b>. "
            "Il présente de façon synthétique l'état énergétique actuel, les travaux envisagés, "
            "les aides financières disponibles et la proposition de résolution pour vote en AG. "
            "Ce document est produit à titre indicatif pour préparer la décision.",
            s["body"],
        )]], colWidths=[PAGE_W])
        intro.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(BLUE_LIGHT)),
            ("BOX",        (0, 0), (-1, -1), 0.8, colors.HexColor(BLUE_GOV)),
            ("PADDING",    (0, 0), (-1, -1), 10),
        ]))
        story.append(intro)
        story.append(Spacer(1, 0.4*cm))

        # ── 1. Identification de la copropriété ────────────────────────────
        _section(story, "1", "Identification de la copropriété", s, BLUE_GOV)
        story.append(_kv([
            ["Syndic / Gestionnaire", org_name],
            ["Bâtiment",              building_data.get("name", "—")],
            ["Adresse",               building_data.get("address_line_1", "—")],
            ["Commune",               f"{building_data.get('postal_code', '')} {building_data.get('city', '')}".strip() or "—"],
            ["Année de construction", str(building_data.get("construction_year", "—"))],
            ["Surface chauffée totale", f"{heated_area} m²" if heated_area else "—"],
            ["Type de bâtiment",      building_data.get("building_type", "—")],
            ["Statut",                building_data.get("ownership_type", "Copropriété")],
            ["Date du document",      datetime.now().strftime("%d/%m/%Y")],
        ], brand=BLUE_GOV))
        story.append(Spacer(1, 0.3*cm))

        # ── 2. Situation énergétique actuelle ──────────────────────────────
        _section(story, "2", "Situation énergétique actuelle", s, BLUE_GOV)

        if energy_label != "—" or ghg_label != "—":
            story.append(_dpe_badges(str(energy_label), str(ghg_label)))
            story.append(Paragraph(
                "Classe énergie (gauche) · Classe GES/Climat (droite) — Méthode 3CL-DPE 2021",
                s["caption"],
            ))
            story.append(Spacer(1, 0.15*cm))

        story.append(_dpe_scale(str(energy_label), str(target_label) if target_label else None))
        story.append(Paragraph(
            "Échelle DPE complète — La flèche indique la situation actuelle, la cible visée après travaux.",
            s["caption"],
        ))
        story.append(Spacer(1, 0.15*cm))

        msg_label = {
            "G": "⚠  <b>Passoire thermique.</b> Location interdite pour nouvelles signatures de bail dès 2025. Rénovation urgente.",
            "F": "⚠  <b>Très énergivore.</b> Location interdite dès 2028. Des travaux sont indispensables à court terme.",
            "E": "<b>Énergivore.</b> Des travaux sont fortement conseillés pour anticiper les futures obligations réglementaires.",
            "D": "<b>Performance moyenne.</b> Des améliorations restent rentables et valorisent le patrimoine.",
            "C": "<b>Performance correcte.</b> Quelques optimisations ciblées peuvent améliorer le confort.",
            "B": "<b>Bonne performance énergétique.</b>",
            "A": "<b>Excellente performance énergétique.</b>",
        }.get(str(energy_label), "")

        if msg_label:
            story.append(Paragraph(f"Interprétation : {msg_label}", s["body"]))
        if annual_cost != "—":
            story.append(Paragraph(
                f"<b>Facture énergétique estimée :</b> {annual_cost} €/an pour l'ensemble de l'immeuble.",
                s["body"],
            ))
        story.append(Spacer(1, 0.3*cm))

        # ── 3. Programme de travaux ────────────────────────────────────────
        _section(story, "3", "Programme de travaux et analyse technico-économique", s, BLUE_GOV)

        if scenarios:
            # Tableau avant/après pour le scénario recommandé
            story.append(Paragraph(
                f"<b>Scénario recommandé : {best_scenario.get('name', 'Scénario 1')}</b>",
                ParagraphStyle("bold_body", fontSize=10, fontName="Helvetica-Bold", spaceAfter=6),
            ))
            if best_scenario.get("works_description"):
                story.append(Paragraph(best_scenario["works_description"], s["body_j"]))
                story.append(Spacer(1, 0.15*cm))

            before_after = [
                ["Indicateur", "Avant rénovation", f"Après rénovation\n({best_scenario.get('name', '—')})"],
                ["Classe DPE Énergie",     str(energy_label),  str(target_label) if target_label else "—"],
                ["Économies d'énergie",    "—",                f"{float(best_savings):,.0f} kWh/an" if best_savings else "À calculer"],
                ["Coût total des travaux", "—",                f"{float(best_cost):,.0f} € HT" if best_cost else "À chiffrer"],
                ["Retour sur investissement", "—",             f"{best_scenario.get('simple_payback_years', '—')} ans" if best_scenario.get('simple_payback_years') else "—"],
            ]
            bat = Table(before_after, colWidths=[5*cm, 4.5*cm, 7.5*cm])
            bat.setStyle(TableStyle([
                ("BACKGROUND",     (0, 0), (-1, 0), colors.HexColor(BLUE_GOV)),
                ("TEXTCOLOR",      (0, 0), (-1, 0), colors.white),
                ("FONTNAME",       (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME",       (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE",       (0, 0), (-1, -1), 9.5),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor(GRAY_ROW)]),
                ("GRID",           (0, 0), (-1, -1), 0.4, colors.HexColor(GRAY_BORDER)),
                ("ALIGN",          (1, 0), (-1, -1), "CENTER"),
                ("PADDING",        (0, 0), (-1, -1), 7),
            ]))
            story.append(bat)
            story.append(Spacer(1, 0.2*cm))

            # Quote-part indicative
            if best_cost and heated_area:
                try:
                    cpp_m2 = float(str(best_cost)) / float(str(heated_area))
                    story.append(Paragraph(
                        f"<b>Quote-part indicative (avant aides) :</b> environ <b>{cpp_m2:.0f} €/m²</b> "
                        "de surface privative. Le montant définitif dépend du règlement de copropriété "
                        "et du mode de répartition des charges voté en AG.",
                        s["body"],
                    ))
                except (ValueError, ZeroDivisionError):
                    pass

            # Tous les scénarios si plusieurs
            if len(scenarios) > 1:
                story.append(Spacer(1, 0.2*cm))
                story.append(Paragraph("<b>Comparatif de tous les scénarios :</b>", s["body"]))
                story.append(Spacer(1, 0.1*cm))
                all_h = [["Scénario", "Classe visée", "Coût HT (€)", "Économies (kWh/an)", "Retour (ans)"]]
                all_rows = []
                for sc in scenarios:
                    all_rows.append([
                        sc.get("name", "—"),
                        sc.get("target_energy_label", "—"),
                        f"{float(sc['estimated_total_cost_eur']):,.0f}" if sc.get("estimated_total_cost_eur") else "—",
                        f"{float(sc['estimated_energy_savings_kwh']):,.0f}" if sc.get("estimated_energy_savings_kwh") else "—",
                        f"{sc.get('simple_payback_years', '—')} ans" if sc.get("simple_payback_years") else "—",
                    ])
                all_t = Table(all_h + all_rows, colWidths=[4.5*cm, 2.5*cm, 3.5*cm, 3.5*cm, 3*cm])
                all_t.setStyle(TableStyle([
                    ("BACKGROUND",     (0, 0), (-1, 0), colors.HexColor(BLUE_GOV)),
                    ("TEXTCOLOR",      (0, 0), (-1, 0), colors.white),
                    ("FONTNAME",       (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE",       (0, 0), (-1, -1), 8.5),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor(GRAY_ROW)]),
                    ("GRID",           (0, 0), (-1, -1), 0.4, colors.HexColor(GRAY_BORDER)),
                    ("ALIGN",          (1, 0), (-1, -1), "CENTER"),
                    ("PADDING",        (0, 0), (-1, -1), 5),
                ]))
                story.append(all_t)
        else:
            story.append(Paragraph(
                "Aucun scénario de travaux n'a été défini. Le plan de travaux sera présenté lors d'une prochaine séance.",
                s["body"],
            ))
        story.append(Spacer(1, 0.3*cm))

        # ── 4. Plan de financement ─────────────────────────────────────────
        _section(story, "4", "Plan de financement estimatif", s, BLUE_GOV)
        story.append(Paragraph(
            "Les copropriétés peuvent bénéficier des aides suivantes sous réserve d'éligibilité "
            "(source : ANAH — Guide rénovation énergétique copropriété, édition 2024) :",
            s["body"],
        ))
        story.append(Spacer(1, 0.15*cm))

        # Aides disponibles (tableau informatif)
        aids_data = [
            ["Aide", "Condition principale", "Montant (ANAH 2024)"],
            ["MaPrimeRénov' Copropriété (30 %)",
             "≥ 75 % résidences principales (65 % si ≤ 20 lots)\nGain énergétique ≥ 35 %\nAMO obligatoire + artisan RGE",
             "30 % du coût des travaux\nMax. 25 000 €/logement"],
            ["MaPrimeRénov' Copropriété (45 %)",
             "Mêmes conditions\n+ Gain énergétique ≥ 50 %",
             "45 % du coût des travaux\nMax. 25 000 €/logement"],
            ["Bonus sortie passoire (+10 %)",
             "Bâtiment classé F ou G\nCible : classe D ou mieux",
             "+10 % sur les aides MPR Copropriété"],
            ["Bonus copropriété fragile (+20 %)",
             "Copropriété inscrite sur liste ANAH\n+ conditions administratives",
             "+20 % sur les aides MPR Copropriété"],
            ["Primes individuelles MPR",
             "Copropriétaires aux revenus modestes\n(catégories ANAH vérifiées par AMO)",
             "3 000 €/logement (très modestes)\n1 500 €/logement (modestes)"],
            ["AMO (Assistance à Maîtrise d'Ouvrage)",
             "Obligatoire pour MPR Copropriété\nMOE obligatoire si travaux > 100 000 €",
             "Financée à 50 % par ANAH\n300 €/lot (> 20 lots), 500 €/lot (≤ 20 lots)\nPlancher 3 000 €"],
            ["Prime CEE collective",
             "Travaux parties communes\nArtisan RGE obligatoire",
             "Variable selon fiche CEE (BAR-EN-101, etc.)"],
            ["Éco-PTZ collectif",
             "Copropriété — logements > 2 ans\nTravaux éligibles artisan RGE",
             "Jusqu'à 50 000 €/logement — TAEG 0 % — 20 ans max."],
        ]
        at = Table(aids_data, colWidths=[5*cm, 6.5*cm, 5.5*cm])
        at.setStyle(TableStyle([
            ("BACKGROUND",     (0, 0), (-1, 0), colors.HexColor(BLUE_GOV)),
            ("TEXTCOLOR",      (0, 0), (-1, 0), colors.white),
            ("FONTNAME",       (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",       (0, 0), (-1, -1), 8.5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor(GRAY_ROW)]),
            ("GRID",           (0, 0), (-1, -1), 0.4, colors.HexColor(GRAY_BORDER)),
            ("PADDING",        (0, 0), (-1, -1), 6),
            ("VALIGN",         (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(at)
        story.append(Spacer(1, 0.2*cm))

        # Plan de financement calculé (si scénario disponible)
        if fin:
            story.append(Paragraph(
                "<b>Estimation du financement pour le scénario recommandé :</b>",
                ParagraphStyle("bold_body", fontSize=9.5, fontName="Helvetica-Bold", spaceAfter=6),
            ))
            for elem in _financing_table(fin, heated_area, BLUE_GOV):
                story.append(elem)
        story.append(Spacer(1, 0.3*cm))

        # ── 5. Résolution proposée pour l'AG ──────────────────────────────
        _section(story, "5", "Proposition de résolution pour le vote en AG", s, BLUE_GOV)

        scenario_name = best_scenario.get("name", "programme de rénovation") if best_scenario else "programme de travaux à définir"
        resolution = (
            f"<b>Proposition de résolution — Rénovation énergétique — {building_data.get('name', 'Copropriété')}</b>"
            "<br/><br/>"
            f"L'assemblée générale, après présentation du rapport d'état énergétique "
            f"et du plan de rénovation ({scenario_name}) conformément au guide ANAH 2024, "
            "délibère et décide :"
            "<br/><br/>"
            "<b>Point 1 — Rapport énergétique (art. 24 — majorité simple) :</b><br/>"
            "Approbation du diagnostic énergétique et du Plan Pluriannuel de Travaux (PPT) présenté.<br/>"
            "Vote : Pour ___  Contre ___  Abstention ___"
            "<br/><br/>"
            "<b>Point 2 — Programme de travaux (art. 25 — majorité absolue) :</b><br/>"
            "Mandat donné au conseil syndical pour :<br/>"
            "• Sélectionner une AMO (Assistance à Maîtrise d'Ouvrage) — obligatoire pour MPR Copropriété ;<br/>"
            "• Désigner un maître d'œuvre (MOE) — obligatoire si travaux > 100 000 € ;<br/>"
            "• Obtenir au minimum 3 devis d'entreprises RGE (Reconnu Garant de l'Environnement) ;<br/>"
            "• Déposer les dossiers d'aides : MaPrimeRénov' Copropriété (ANAH), prime CEE, Éco-PTZ collectif ;<br/>"
            "• Vérifier l'immatriculation de la copropriété au Registre national des copropriétés ;<br/>"
            "• Présenter le plan de financement définitif en AG extraordinaire avant engagement des travaux.<br/>"
            "Vote : Pour ___  Contre ___  Abstention ___"
            "<br/><br/>"
            "<b>Point 3 — Fonds travaux (art. 14-2 loi 1965) :</b><br/>"
            "Constitution / abondement du fonds travaux obligatoire depuis le 1ᵉʳ janvier 2025 "
            "pour tout immeuble de plus de 10 ans (cotisation minimale 5 % du budget prévisionnel annuel).<br/>"
            "Vote : Pour ___  Contre ___  Abstention ___"
            "<br/><br/>"
            "<b>Référence légale :</b> Loi n° 65-557 du 10 juillet 1965 (art. 24 majorité simple, art. 25 majorité absolue) "
            "— Loi Climat & Résilience n° 2021-1104 — Guide ANAH rénovation énergétique copropriété, éd. 2024."
        )
        res_t = Table([[Paragraph(resolution, s["body"])]], colWidths=[PAGE_W])
        res_t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(BLUE_LIGHT)),
            ("BOX",        (0, 0), (-1, -1), 1.5, colors.HexColor(BLUE_GOV)),
            ("PADDING",    (0, 0), (-1, -1), 10),
        ]))
        story.append(res_t)

        _footer_note(story, s, org_name)

        cb = _page_cb(org_name, "Synthèse Assemblée Générale Copropriété", BLUE_GOV)
        doc.build(story, onFirstPage=cb, onLaterPages=cb)
        return buffer.getvalue()

    # ── 3. Comparatif de scénarios ────────────────────────────────────────────

    def generate_scenario_report(
        self,
        audit_data: dict,
        scenarios: list,
        building_data: dict,
        org_name: str,
    ) -> bytes:
        """Rapport comparatif des scénarios de rénovation."""
        buffer = io.BytesIO()
        doc    = _doc(buffer)
        s      = _styles("#7C3AED")
        story  = []

        result       = audit_data.get("result_snapshot", {})
        energy_label = result.get("energy_label", audit_data.get("computed_energy_label", "—"))
        heated_area  = building_data.get("heated_area_m2")
        baseline_kwh = audit_data.get("baseline_energy_consumption_kwh")

        PURPLE = "#7C3AED"

        # ── Page de garde ──────────────────────────────────────────────────
        _cover(
            story, s,
            title="Comparatif des Scénarios de Rénovation",
            subtitle=f"Bâtiment : {building_data.get('name', '—')}  ·  Classe actuelle : {energy_label}",
            building_data=building_data,
            org_name=org_name,
            brand=PURPLE,
        )

        # ── Tableau comparatif ─────────────────────────────────────────────
        _section(story, "1", "Comparatif technico-économique des scénarios", s, PURPLE)
        story.append(Paragraph(
            f"<b>{len(scenarios)} scénario(s)</b> définis sur la base de l'état initial (classe {energy_label}). "
            "Coûts en € HT avant déduction des aides.",
            s["body"],
        ))
        story.append(Spacer(1, 0.15*cm))

        headers = [["Scénario", "Description des travaux", "Coût HT (€)", "Économies (kWh/an)", "Classe visée", "Retour (ans)"]]
        rows = []
        for i, sc in enumerate(scenarios):
            rows.append([
                Paragraph(f"<b>{sc.get('name', f'Scénario {i+1}')}</b>",
                          ParagraphStyle("sn", fontSize=8.5, fontName="Helvetica-Bold")),
                sc.get("works_description", "—"),
                f"{float(sc['estimated_total_cost_eur']):,.0f}" if sc.get("estimated_total_cost_eur") else "—",
                f"{float(sc['estimated_energy_savings_kwh']):,.0f}" if sc.get("estimated_energy_savings_kwh") else "—",
                sc.get("target_energy_label", "—"),
                f"{sc.get('simple_payback_years', '—')} ans" if sc.get("simple_payback_years") else "—",
            ])

        ct = Table(headers + rows, colWidths=[3.5*cm, 5.5*cm, 2.5*cm, 2.5*cm, 1.5*cm, 1.5*cm])
        ct.setStyle(TableStyle([
            ("BACKGROUND",     (0, 0), (-1, 0), colors.HexColor(PURPLE)),
            ("TEXTCOLOR",      (0, 0), (-1, 0), colors.white),
            ("FONTNAME",       (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",       (0, 0), (-1, -1), 8.5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor(GRAY_ROW)]),
            ("GRID",           (0, 0), (-1, -1), 0.4, colors.HexColor(GRAY_BORDER)),
            ("ALIGN",          (2, 0), (-1, -1), "CENTER"),
            ("PADDING",        (0, 0), (-1, -1), 6),
            ("VALIGN",         (0, 0), (-1, -1), "MIDDLE"),
        ]))
        story.append(ct)
        story.append(Spacer(1, 0.3*cm))

        # ── Financement par scénario ───────────────────────────────────────
        _section(story, "2", "Estimation du financement par scénario", s, PURPLE)
        for i, sc in enumerate(scenarios):
            cost = sc.get("estimated_total_cost_eur")
            tgt  = sc.get("target_energy_label")
            if not cost or not tgt or energy_label == "—":
                continue
            fin = _calc_financing(cost, energy_label, tgt,
                                  sc.get("estimated_energy_savings_kwh"), baseline_kwh)
            if not fin:
                continue
            story.append(Paragraph(
                f"<b>{sc.get('name', f'Scénario {i+1}')} — MPR {int(fin['mpr_pct']*100) if fin.get('mpr_pct') else 0} %"
                f" — Reste à charge estimé : {fin.get('reste', 0):,.0f} €</b>",
                ParagraphStyle("sh", fontSize=9.5, fontName="Helvetica-Bold",
                               textColor=colors.HexColor(PURPLE), spaceBefore=8, spaceAfter=4),
            ))
            for elem in _financing_table(fin, heated_area, PURPLE):
                story.append(elem)
            story.append(Spacer(1, 0.15*cm))

        # ── Échelle DPE ────────────────────────────────────────────────────
        _section(story, "3", "Échelle DPE — situation actuelle vs objectifs", s, PURPLE)
        targets = [sc.get("target_energy_label") for sc in scenarios if sc.get("target_energy_label")]
        best_target = targets[0] if targets else None
        story.append(_dpe_scale(str(energy_label), best_target))
        story.append(Paragraph(
            f"Classe actuelle : {energy_label} · Classe visée (scénario recommandé) : {best_target or '—'}",
            s["caption"],
        ))

        _footer_note(story, s, org_name)

        cb = _page_cb(org_name, "Comparatif des Scénarios de Rénovation", PURPLE)
        doc.build(story, onFirstPage=cb, onLaterPages=cb)
        return buffer.getvalue()


report_generator = ReportGenerator()
