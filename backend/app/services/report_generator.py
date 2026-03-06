"""
ThermoPilot AI — PDF Report Generator
Uses ReportLab to generate professional energy audit reports.
"""
import io
import os
from datetime import datetime
from typing import Optional
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT

# Energy label colors
LABEL_COLORS = {
    "A": "#00a84f",
    "B": "#52b748",
    "C": "#c8d200",
    "D": "#f7e400",
    "E": "#f0a500",
    "F": "#e8500a",
    "G": "#cc0000",
}


class ReportGenerator:

    def generate_audit_report(self, audit_data: dict, building_data: dict, org_name: str) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2 * cm,
            leftMargin=2 * cm,
            topMargin=2.5 * cm,
            bottomMargin=2 * cm,
        )

        styles = getSampleStyleSheet()
        story = []

        # ── Header ────────────────────────────────────────────────────────────
        title_style = ParagraphStyle(
            "title",
            parent=styles["Title"],
            fontSize=22,
            textColor=colors.HexColor("#1a365d"),
            spaceAfter=6,
        )
        subtitle_style = ParagraphStyle(
            "subtitle",
            parent=styles["Normal"],
            fontSize=11,
            textColor=colors.HexColor("#4a5568"),
            spaceAfter=20,
        )

        story.append(Paragraph("ThermoPilot AI", title_style))
        story.append(Paragraph("Rapport d'Audit Énergétique", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#2b6cb0")))
        story.append(Spacer(1, 0.5 * cm))

        # ── Building info ─────────────────────────────────────────────────────
        section_style = ParagraphStyle(
            "section",
            parent=styles["Heading2"],
            fontSize=13,
            textColor=colors.HexColor("#2b6cb0"),
            spaceBefore=12,
            spaceAfter=6,
        )
        body_style = ParagraphStyle(
            "body",
            parent=styles["Normal"],
            fontSize=10,
            spaceAfter=4,
        )

        story.append(Paragraph("Informations du bâtiment", section_style))

        building_info = [
            ["Organisation", org_name],
            ["Bâtiment", building_data.get("name", "—")],
            ["Adresse", building_data.get("address_line_1", "—")],
            ["Ville", f"{building_data.get('postal_code', '')} {building_data.get('city', '')}".strip()],
            ["Année de construction", str(building_data.get("construction_year", "—"))],
            ["Surface chauffée", f"{building_data.get('heated_area_m2', '—')} m²"],
            ["Type de bâtiment", building_data.get("building_type", "—")],
            ["Date de l'audit", datetime.now().strftime("%d/%m/%Y")],
        ]

        t = Table(building_info, colWidths=[5 * cm, 11 * cm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#ebf4ff")),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#f7fafc")]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e0")),
            ("PADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(t)
        story.append(Spacer(1, 0.4 * cm))

        # ── Energy performance ─────────────────────────────────────────────────
        story.append(Paragraph("Performance énergétique", section_style))

        result = audit_data.get("result_snapshot", {})
        energy_label = result.get("energy_label", audit_data.get("computed_energy_label", "—"))
        ghg_label = result.get("ghg_label", audit_data.get("computed_ghg_label", "—"))
        primary_energy = result.get("primary_energy_per_m2", "—")
        co2 = result.get("co2_per_m2", "—")
        annual_cost = result.get("estimated_annual_cost_eur", "—")
        total_kwh = result.get("total_final_kwh", audit_data.get("baseline_energy_consumption_kwh", "—"))

        label_color = colors.HexColor(LABEL_COLORS.get(str(energy_label), "#888888"))

        perf_data = [
            ["Indicateur", "Valeur", "Classe"],
            [
                "Énergie primaire",
                f"{primary_energy} kWhpe/m²/an" if primary_energy != "—" else "—",
                energy_label,
            ],
            [
                "Émissions GES",
                f"{co2} kgCO₂/m²/an" if co2 != "—" else "—",
                ghg_label,
            ],
            [
                "Consommation finale",
                f"{total_kwh} kWh/an" if total_kwh != "—" else "—",
                "—",
            ],
            [
                "Coût estimé",
                f"{annual_cost} €/an" if annual_cost != "—" else "—",
                "—",
            ],
        ]

        pt = Table(perf_data, colWidths=[6 * cm, 7 * cm, 3 * cm])
        pt.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2b6cb0")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7fafc")]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e0")),
            ("ALIGN", (2, 1), (2, -1), "CENTER"),
            ("FONTNAME", (2, 1), (2, 1), "Helvetica-Bold"),
            ("TEXTCOLOR", (2, 1), (2, 1), label_color),
            ("FONTSIZE", (2, 1), (2, 1), 14),
            ("PADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(pt)
        story.append(Spacer(1, 0.4 * cm))

        # ── Methodology note ──────────────────────────────────────────────────
        story.append(Paragraph("Méthodologie", section_style))
        story.append(Paragraph(
            "Ce rapport a été généré par ThermoPilot AI selon une méthode de calcul "
            "simplifiée inspirée de la réglementation 3CL-DPE. Les résultats sont "
            "indicatifs et doivent être confirmés par un auditeur certifié pour toute "
            "démarche réglementaire.",
            body_style,
        ))

        # ── Footer ────────────────────────────────────────────────────────────
        story.append(Spacer(1, 1 * cm))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e0")))
        footer_style = ParagraphStyle(
            "footer",
            parent=styles["Normal"],
            fontSize=8,
            textColor=colors.HexColor("#718096"),
            alignment=TA_CENTER,
            spaceBefore=4,
        )
        story.append(Paragraph(
            f"ThermoPilot AI — Rapport généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')} — Confidentiel",
            footer_style,
        ))

        doc.build(story)
        return buffer.getvalue()

    def generate_scenario_report(
        self, audit_data: dict, scenarios: list, building_data: dict, org_name: str
    ) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm,
                                topMargin=2.5*cm, bottomMargin=2*cm)
        styles = getSampleStyleSheet()
        story = []

        title_style = ParagraphStyle("title", parent=styles["Title"], fontSize=20,
                                      textColor=colors.HexColor("#1a365d"), spaceAfter=4)
        section_style = ParagraphStyle("section", parent=styles["Heading2"], fontSize=13,
                                        textColor=colors.HexColor("#2b6cb0"), spaceBefore=12, spaceAfter=6)

        story.append(Paragraph("ThermoPilot AI", title_style))
        story.append(Paragraph("Comparatif des Scénarios de Rénovation", styles["Heading2"]))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#2b6cb0")))
        story.append(Spacer(1, 0.4*cm))

        story.append(Paragraph(f"Bâtiment : {building_data.get('name', '—')} — {org_name}", styles["Normal"]))
        story.append(Spacer(1, 0.3*cm))

        story.append(Paragraph("Comparatif des scénarios", section_style))

        headers = ["Scénario", "Économies\n(kWh/an)", "Coût\n(€)", "Retour\n(ans)", "Classe\nvisée"]
        table_data = [headers]
        for s in scenarios:
            table_data.append([
                s.get("name", "—"),
                f"{s.get('estimated_energy_savings_kwh', '—')}",
                f"{s.get('estimated_total_cost_eur', '—')} €",
                f"{s.get('simple_payback_years', '—')} ans",
                s.get("target_energy_label", "—"),
            ])

        ct = Table(table_data, colWidths=[4.5*cm, 3.5*cm, 3*cm, 3*cm, 2*cm])
        ct.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2b6cb0")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f7fafc")]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e0")),
            ("ALIGN", (1, 0), (-1, -1), "CENTER"),
            ("PADDING", (0, 0), (-1, -1), 6),
        ]))
        story.append(ct)

        story.append(Spacer(1, 1*cm))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e0")))
        footer_style = ParagraphStyle("footer", parent=styles["Normal"], fontSize=8,
                                       textColor=colors.HexColor("#718096"), alignment=TA_CENTER, spaceBefore=4)
        story.append(Paragraph(
            f"ThermoPilot AI — {datetime.now().strftime('%d/%m/%Y')} — Confidentiel",
            footer_style,
        ))

        doc.build(story)
        return buffer.getvalue()


report_generator = ReportGenerator()
