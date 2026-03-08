"""
ThermoPilot AI — Moteur de Calcul Énergétique
Méthode simplifiée alignée 3CL-DPE (arrêté du 31 mars 2021).
Supporte tous les types de bâtiments : résidentiel collectif/individuel + tertiaire.

Implémenté :
  - Double critère DPE (pire des deux labels énergie/GES)
  - Ponts thermiques forfaitaires par époque
  - Apports internes par type de bâtiment
  - Apports solaires simplifiés par zone climatique
  - Hauteur sous plafond adaptée au type et à l'époque
  - ACH adapté au système de ventilation déclaré
  - ECS adaptée au type de bâtiment
  - Couverture 50+ villes (DJU base 18°C)

Limitations documentées (vs 3CL-DPE complet) :
  - Apports solaires : forfait par zone climatique, pas par orientation
  - Intermittence : non modélisée (bâtiments supposés chauffés en continu)
  - Facteur réseau de chaleur : fixe, à vérifier par opérateur réseau
"""
from dataclasses import dataclass, field
from typing import List, Optional


# ─── Constantes ───────────────────────────────────────────────────────────────

# DJU base 18°C — 50+ villes françaises (Météo-France, moyenne 30 ans)
DJU_BY_CITY: dict = {
    # Méditerranée
    "ajaccio": 900, "bastia": 1050, "nice": 1100, "toulon": 1200,
    "antibes": 1100, "cannes": 1150, "perpignan": 1400, "montpellier": 1500,
    "nimes": 1650, "marseille": 1450, "aix-en-provence": 1700, "avignon": 1700,
    # Sud-Ouest
    "pau": 1850, "bayonne": 1800, "biarritz": 1800, "tarbes": 2100,
    "toulouse": 1950, "montauban": 1950, "agen": 2000, "bordeaux": 2050,
    "mont-de-marsan": 1950,
    # Centre-Ouest / Atlantique
    "la rochelle": 2100, "rochefort": 2100, "niort": 2200, "poitiers": 2200,
    "angouleme": 2200, "limoges": 2400, "brive": 2200, "perigueux": 2200,
    # Pays de la Loire / Bretagne
    "nantes": 2300, "saint-nazaire": 2250, "angers": 2350, "le mans": 2450,
    "rennes": 2450, "brest": 2300, "quimper": 2400, "lorient": 2250, "vannes": 2250,
    # Centre / Val-de-Loire
    "tours": 2250, "blois": 2400, "orleans": 2500, "chartres": 2650,
    "bourges": 2550, "vichy": 2700, "clermont-ferrand": 2800,
    "moulins": 2700, "roanne": 2700,
    # Ile-de-France / Normandie / Nord
    "paris": 2500, "versailles": 2550, "melun": 2550, "evry": 2550,
    "pontoise": 2600, "caen": 2700, "rouen": 2700, "le havre": 2650,
    "amiens": 2850, "lille": 2900, "dunkerque": 2950, "valenciennes": 2900,
    # Est
    "reims": 2750, "troyes": 2750, "chalons-en-champagne": 2800,
    "metz": 2900, "nancy": 2900, "epinal": 3100,
    "strasbourg": 3000, "mulhouse": 3000, "colmar": 3050, "belfort": 3150,
    # Bourgogne / Franche-Comté
    "dijon": 2600, "besancon": 2800, "chalon-sur-saone": 2600,
    # Auvergne-Rhone-Alpes
    "lyon": 2450, "grenoble": 3100, "chambery": 2900, "annecy": 3000,
    "valence": 2100, "saint-etienne": 3000,
    # Default
    "default": 2500,
}

# Facteurs énergie primaire (kWhef -> kWhpe) — arrêté 31 mars 2021
PRIMARY_ENERGY_FACTOR: dict = {
    "electricite": 2.3, "gaz": 1.0, "fioul": 1.0, "bois": 1.0,
    "pac": 2.3, "reseau_chaleur": 0.6,
}

# Facteurs CO2 (kgCO2eq/kWh final) — arrêté 31 mars 2021
CO2_FACTOR: dict = {
    "electricite": 0.064, "gaz": 0.227, "fioul": 0.324,
    "bois": 0.030, "pac": 0.064, "reseau_chaleur": 0.120,
}

# Seuils étiquettes énergie primaire (kWhpe/m²/an)
ENERGY_LABEL_THRESHOLDS: dict = {
    "A": (0, 70), "B": (70, 110), "C": (110, 180),
    "D": (180, 250), "E": (250, 330), "F": (330, 420), "G": (420, float("inf")),
}

# Seuils étiquettes GES (kgCO2eq/m²/an)
GHG_LABEL_THRESHOLDS: dict = {
    "A": (0, 6), "B": (6, 11), "C": (11, 30),
    "D": (30, 50), "E": (50, 70), "F": (70, 100), "G": (100, float("inf")),
}

_LABEL_ORDER = ["A", "B", "C", "D", "E", "F", "G"]

# Prix unitaires énergie (€/kWh final, France 2024 — SDES)
UNIT_PRICE: dict = {
    "electricite": 0.206, "gaz": 0.108, "fioul": 0.120,
    "bois": 0.060, "pac": 0.206, "reseau_chaleur": 0.085,
}


# ─── Fonctions de configuration ───────────────────────────────────────────────

def _default_u_values(year: int) -> dict:
    if year < 1948:
        return {"mur": 2.5, "toiture": 2.8, "plancher_bas": 1.5, "menuiserie": 4.5}
    elif year < 1974:
        return {"mur": 2.0, "toiture": 2.0, "plancher_bas": 1.2, "menuiserie": 4.0}
    elif year < 1982:
        return {"mur": 1.5, "toiture": 0.8, "plancher_bas": 0.8, "menuiserie": 3.5}
    elif year < 2000:
        return {"mur": 0.9, "toiture": 0.5, "plancher_bas": 0.6, "menuiserie": 2.5}
    elif year < 2012:
        return {"mur": 0.6, "toiture": 0.3, "plancher_bas": 0.4, "menuiserie": 1.8}
    else:
        return {"mur": 0.3, "toiture": 0.2, "plancher_bas": 0.3, "menuiserie": 1.3}


def _thermal_bridge_penalty(year: int) -> float:
    """Majoration forfaitaire des pertes de transmission pour ponts thermiques."""
    if year < 1948:   return 0.28
    elif year < 1974: return 0.25
    elif year < 1982: return 0.20
    elif year < 2000: return 0.15
    elif year < 2012: return 0.10
    else:             return 0.05


def _ceiling_height(building_type: str, year: int) -> float:
    bt = building_type.lower()
    if bt in ("tertiaire", "bureaux", "commercial", "erp"):
        return 3.0
    elif bt == "individuel":
        return 2.5
    else:  # collectif résidentiel
        return 2.8 if year < 1948 else 2.5


def _ach_from_systems(systems: list, year: int) -> tuple:
    """Retourne (ACH, heat_recovery_ratio)."""
    for s in systems:
        st = s.system_type.lower()
        if "df" in st or "double" in st:
            return 0.35, 0.80
        if "vmc" in st or "sf" in st:
            return 0.50, 0.0
        if "naturelle" in st or "natural" in st:
            return 0.80, 0.0
    # Estimation par époque si non déclaré
    if year < 1982:   return 0.70, 0.0
    elif year < 2000: return 0.55, 0.0
    elif year < 2012: return 0.45, 0.0
    else:             return 0.35, 0.0


def _ecs_forfait_kwh_m2(building_type: str) -> float:
    bt = building_type.lower()
    if bt == "collectif":   return 25.0
    elif bt == "individuel": return 20.0
    elif bt in ("bureaux", "commercial"): return 3.0
    elif bt == "tertiaire": return 5.0
    else:                   return 25.0


def _internal_gains_kwh_m2(building_type: str) -> float:
    """Apports internes utiles pour le chauffage (kWh/m²/an)."""
    bt = building_type.lower()
    if bt in ("collectif", "individuel"): return 12.0
    elif bt == "bureaux":                 return 22.0
    elif bt in ("commercial", "tertiaire"): return 20.0
    else:                                 return 12.0


def _solar_irradiance_heating_kwh_m2(dju: int) -> float:
    """Irradiation solaire en saison de chauffe (Oct-Avr) par zone climatique (kWh/m²)."""
    if dju < 1500:   return 450
    elif dju < 2000: return 380
    elif dju < 2500: return 320
    elif dju < 3000: return 270
    else:            return 230


# ─── Modèles de données ───────────────────────────────────────────────────────

@dataclass
class BuildingInput:
    heated_area_m2: float
    construction_year: int
    city: str = "default"
    floors_above_ground: int = 5
    building_type: str = "collectif"


@dataclass
class EnvelopeInput:
    element_type: str
    surface_m2: float
    u_value: float


@dataclass
class SystemInput:
    system_type: str
    energy_source: str
    efficiency: float


@dataclass
class AuditInputData:
    building: BuildingInput
    envelopes: List[EnvelopeInput] = field(default_factory=list)
    systems: List[SystemInput] = field(default_factory=list)


@dataclass
class EnergyResult:
    heating_kwh: float
    ecs_kwh: float
    ventilation_kwh: float
    total_final_kwh: float
    primary_energy_per_m2: float
    co2_per_m2: float
    energy_label: str
    ghg_label: str
    dpe_label: str       # Double critère DPE = pire des deux
    estimated_annual_cost_eur: float
    details: dict = field(default_factory=dict)


@dataclass
class ScenarioResult:
    measure_type: str
    energy_savings_kwh: float
    energy_savings_percent: float
    co2_savings_kg: float
    estimated_cost_eur: float
    simple_payback_years: float
    new_energy_label: str
    new_ghg_label: str
    new_dpe_label: str
    new_primary_energy_per_m2: float


# ─── Calculateur principal ────────────────────────────────────────────────────

class EnergyCalculator:

    def calculate(self, data: AuditInputData) -> EnergyResult:
        building = data.building
        area     = building.heated_area_m2
        year     = building.construction_year or 1980
        bt       = building.building_type or "collectif"
        dju      = DJU_BY_CITY.get(building.city.lower().strip(), DJU_BY_CITY["default"])

        # 1. Pertes par transmission + surfaces
        h_trans, surfaces = self._calc_transmission_losses(data.envelopes, area, building)

        # 2. Ponts thermiques forfaitaires
        psi_penalty             = _thermal_bridge_penalty(year)
        h_trans_bridges         = h_trans * (1 + psi_penalty)

        # 3. Pertes par ventilation
        ceil_h   = _ceiling_height(bt, year)
        volume   = area * ceil_h
        ach, hrv = _ach_from_systems(data.systems, year)
        h_vent   = 0.34 * ach * volume

        h_total  = h_trans_bridges + h_vent

        # 4. Besoin brut de chauffage
        heating_need_gross = h_total * dju * 24 / 1000

        # 5. Apports internes
        gains_int = _internal_gains_kwh_m2(bt) * area

        # 6. Apports solaires (via menuiseries)
        win_surf  = surfaces.get("menuiserie", area * 0.15)
        isol      = _solar_irradiance_heating_kwh_m2(dju)
        gains_sol = win_surf * isol * 0.60 * 0.75   # g_value × frame_factor

        # 7. Facteur d'utilisation des apports (DIN EN ISO 13790)
        total_gains = gains_int + gains_sol
        gamma       = total_gains / max(heating_need_gross, 1.0)
        a_factor    = 1.0 + year / 20.0
        if abs(gamma - 1.0) > 1e-6:
            eta_g = (1 - gamma ** a_factor) / (1 - gamma ** (a_factor + 1))
        else:
            eta_g = a_factor / (a_factor + 1)
        eta_g = max(0.50, min(0.95, eta_g))

        useful_gains     = total_gains * eta_g

        # 8. Pour VMC DF, recalculer avec récupération de chaleur
        if hrv > 0:
            h_vent_eff       = h_vent * (1 - hrv)
            heating_need_net = max(0, (h_trans_bridges + h_vent_eff) * dju * 24 / 1000 - useful_gains)
        else:
            heating_need_net = max(0, heating_need_gross - useful_gains)

        # 9. Efficacité chauffage
        heating_sys    = next((s for s in data.systems if s.system_type == "chauffage"), None)
        heating_eff    = heating_sys.efficiency if heating_sys else 0.85
        heating_source = heating_sys.energy_source if heating_sys else "gaz"

        heating_kwh = heating_need_net / heating_eff

        # 10. ECS
        ecs_sys    = next((s for s in data.systems if s.system_type == "ecs"), None)
        ecs_eff    = ecs_sys.efficiency if ecs_sys else 0.80
        ecs_source = ecs_sys.energy_source if ecs_sys else heating_source
        ecs_kwh    = area * _ecs_forfait_kwh_m2(bt) / ecs_eff

        # 11. Auxiliaires ventilation
        aux_kwh_m2      = 5.0 if hrv > 0 else 3.5
        ventilation_kwh = area * aux_kwh_m2

        total_final_kwh = heating_kwh + ecs_kwh + ventilation_kwh

        # 12. Energie primaire
        fe_heat = PRIMARY_ENERGY_FACTOR.get(heating_source, 1.0)
        fe_ecs  = PRIMARY_ENERGY_FACTOR.get(ecs_source, 1.0)
        fe_vent = PRIMARY_ENERGY_FACTOR["electricite"]
        primary_per_m2 = (heating_kwh * fe_heat + ecs_kwh * fe_ecs + ventilation_kwh * fe_vent) / area

        # 13. GES
        co2_per_m2 = (
            heating_kwh * CO2_FACTOR.get(heating_source, 0.2)
            + ecs_kwh   * CO2_FACTOR.get(ecs_source, 0.2)
            + ventilation_kwh * CO2_FACTOR["electricite"]
        ) / area

        # 14. Étiquettes — double critère DPE
        energy_label = self._get_label(primary_per_m2, ENERGY_LABEL_THRESHOLDS)
        ghg_label    = self._get_label(co2_per_m2,     GHG_LABEL_THRESHOLDS)
        dpe_label    = self._worst_label(energy_label, ghg_label)

        # 15. Coût estimé
        cost_eur = (
            heating_kwh     * UNIT_PRICE.get(heating_source, 0.12)
            + ecs_kwh       * UNIT_PRICE.get(ecs_source, 0.12)
            + ventilation_kwh * UNIT_PRICE["electricite"]
        )

        return EnergyResult(
            heating_kwh=round(heating_kwh, 1),
            ecs_kwh=round(ecs_kwh, 1),
            ventilation_kwh=round(ventilation_kwh, 1),
            total_final_kwh=round(total_final_kwh, 1),
            primary_energy_per_m2=round(primary_per_m2, 1),
            co2_per_m2=round(co2_per_m2, 2),
            energy_label=energy_label,
            ghg_label=ghg_label,
            dpe_label=dpe_label,
            estimated_annual_cost_eur=round(cost_eur, 0),
            details={
                "dju": dju,
                "ceil_height_m": ceil_h,
                "ach": ach,
                "heat_recovery_ratio": hrv,
                "h_trans_w_per_k": round(h_trans, 1),
                "h_trans_with_bridges_w_per_k": round(h_trans_bridges, 1),
                "h_vent_w_per_k": round(h_vent, 1),
                "h_total_w_per_k": round(h_total, 1),
                "thermal_bridge_penalty_pct": round(psi_penalty * 100, 1),
                "heating_need_gross_kwh": round(heating_need_gross, 1),
                "gains_internes_kwh": round(gains_int, 1),
                "gains_solaires_kwh": round(gains_sol, 1),
                "eta_utilisation": round(eta_g, 3),
                "heating_need_net_kwh": round(heating_need_net, 1),
                "heating_efficiency": heating_eff,
                "heating_energy_source": heating_source,
                "ecs_energy_source": ecs_source,
            },
        )

    def simulate_measure(self, baseline: EnergyResult, data: AuditInputData,
                         measure_type: str, measure_params: dict) -> ScenarioResult:
        """
        Simule une mesure de rénovation sur la baseline.
        Utilise l'efficacité réelle du système pour reconstruire le besoin thermique.
        """
        area         = data.building.heated_area_m2
        year         = data.building.construction_year or 1980
        dju          = DJU_BY_CITY.get(data.building.city.lower().strip(), DJU_BY_CITY["default"])
        heating_src  = baseline.details.get("heating_energy_source", "gaz")
        heating_eff  = baseline.details.get("heating_efficiency", 0.85)
        h_vent       = baseline.details.get("h_vent_w_per_k", 0)

        surfaces     = self._estimate_surfaces(data.envelopes, area, data.building)
        savings_kwh  = 0.0
        cost_eur     = 0.0
        new_src      = heating_src

        if measure_type == "ite":
            delta_u      = measure_params.get("delta_u", 0.6)
            wall_surface = surfaces["mur"]
            u_orig       = self._avg_u(data.envelopes, "mur") or _default_u_values(year)["mur"]
            actual_delta = min(delta_u, max(0, u_orig - 0.05))
            savings_kwh  = actual_delta * wall_surface * dju * 24 / 1000 / heating_eff
            cost_eur     = wall_surface * measure_params.get("unit_cost_eur_m2", 180)

        elif measure_type == "isolation_toiture":
            delta_u      = measure_params.get("delta_u", 0.8)
            surf         = surfaces["toiture"]
            u_orig       = self._avg_u(data.envelopes, "toiture") or _default_u_values(year)["toiture"]
            actual_delta = min(delta_u, max(0, u_orig - 0.05))
            savings_kwh  = actual_delta * surf * dju * 24 / 1000 / heating_eff
            cost_eur     = surf * measure_params.get("unit_cost_eur_m2", 60)

        elif measure_type == "isolation_plancher":
            delta_u      = measure_params.get("delta_u", 0.7)
            surf         = surfaces["plancher_bas"]
            u_orig       = self._avg_u(data.envelopes, "plancher_bas") or _default_u_values(year)["plancher_bas"]
            actual_delta = min(delta_u, max(0, u_orig - 0.05))
            savings_kwh  = actual_delta * surf * dju * 24 / 1000 / heating_eff
            cost_eur     = surf * measure_params.get("unit_cost_eur_m2", 30)

        elif measure_type == "menuiseries":
            delta_u      = measure_params.get("delta_u", 1.5)
            surf         = surfaces["menuiserie"]
            u_orig       = self._avg_u(data.envelopes, "menuiserie") or _default_u_values(year)["menuiserie"]
            actual_delta = min(delta_u, max(0, u_orig - 0.70))  # triple vitrage ~0.7 W/m²K
            savings_kwh  = actual_delta * surf * dju * 24 / 1000 / heating_eff
            cost_eur     = surf * measure_params.get("unit_cost_eur_m2", 650)

        elif measure_type == "remplacement_chaudiere":
            # Utilise l'efficacité réelle de la baseline pour reconstruire le besoin
            new_eff       = measure_params.get("new_efficiency", 0.95)
            heat_need_kwh = baseline.heating_kwh * heating_eff
            savings_kwh   = heat_need_kwh * (1/heating_eff - 1/new_eff)
            cost_eur      = measure_params.get("total_cost_eur", area * 30)

        elif measure_type == "pac":
            # PAC : remplace la chaudière actuelle par PAC électrique
            cop           = measure_params.get("cop", 3.5)
            heat_need_kwh = baseline.heating_kwh * heating_eff
            new_kwh_elec  = heat_need_kwh / cop
            savings_kwh   = baseline.heating_kwh - new_kwh_elec
            new_src       = "electricite"
            cost_eur      = measure_params.get("total_cost_eur", area * 100)

        elif measure_type == "vmc":
            # VMC DF : gain principal = récupération de chaleur sur l'air extrait
            hrv_ratio       = measure_params.get("heat_recovery_efficiency", 0.75)
            thermal_savings = h_vent * hrv_ratio * dju * 24 / 1000 / heating_eff
            aux_increase    = area * 1.5   # surconsommation auxiliaires DF vs SF
            savings_kwh     = max(0.0, thermal_savings - aux_increase)
            cost_eur        = area * measure_params.get("unit_cost_eur_m2", 35)

        else:
            savings_kwh = 0.0
            cost_eur    = 0.0

        # Recalcul énergie primaire
        fe_old = PRIMARY_ENERGY_FACTOR.get(heating_src, 1.0)
        fe_new = PRIMARY_ENERGY_FACTOR.get(new_src, 1.0)

        if measure_type == "pac":
            cop           = measure_params.get("cop", 3.5)
            heat_need_kwh = baseline.heating_kwh * heating_eff
            new_kwh_elec  = heat_need_kwh / cop
            savings_primary = baseline.heating_kwh * fe_old - new_kwh_elec * fe_new
        else:
            savings_primary = savings_kwh * fe_old

        new_primary_per_m2 = max(0, baseline.primary_energy_per_m2 - savings_primary / area)

        # Recalcul GES
        co2_old = CO2_FACTOR.get(heating_src, 0.2)
        co2_new = CO2_FACTOR.get(new_src, 0.2)
        if measure_type == "pac":
            heat_need_kwh = baseline.heating_kwh * heating_eff
            new_kwh_elec  = heat_need_kwh / measure_params.get("cop", 3.5)
            co2_savings   = baseline.heating_kwh * co2_old - new_kwh_elec * co2_new
        else:
            co2_savings   = savings_kwh * co2_old

        new_co2_per_m2 = max(0, baseline.co2_per_m2 - co2_savings / area)

        # Nouvelles étiquettes (double critère)
        new_energy_label = self._get_label(new_primary_per_m2, ENERGY_LABEL_THRESHOLDS)
        new_ghg_label    = self._get_label(new_co2_per_m2,     GHG_LABEL_THRESHOLDS)
        new_dpe_label    = self._worst_label(new_energy_label, new_ghg_label)

        # Temps de retour (prix réel de l'énergie économisée)
        price_src        = new_src if measure_type == "pac" else heating_src
        annual_savings   = savings_kwh * UNIT_PRICE.get(price_src, 0.12)
        payback          = cost_eur / annual_savings if annual_savings > 0 else 99.0

        return ScenarioResult(
            measure_type=measure_type,
            energy_savings_kwh=round(savings_kwh, 1),
            energy_savings_percent=round(savings_kwh / max(baseline.total_final_kwh, 1) * 100, 1),
            co2_savings_kg=round(co2_savings, 1),
            estimated_cost_eur=round(cost_eur, 0),
            simple_payback_years=round(min(payback, 99.0), 1),
            new_energy_label=new_energy_label,
            new_ghg_label=new_ghg_label,
            new_dpe_label=new_dpe_label,
            new_primary_energy_per_m2=round(new_primary_per_m2, 1),
        )

    # ── Méthodes privées ──────────────────────────────────────────────────────

    def _calc_transmission_losses(self, envelopes, area, building):
        year   = building.construction_year or 1980
        floors = max(building.floors_above_ground or 5, 1)
        bt     = building.building_type or "collectif"
        ceil_h = _ceiling_height(bt, year)

        floor_area  = area / floors
        perim       = (floor_area ** 0.5) * 4
        surfaces = {
            "mur":          perim * ceil_h * floors,
            "toiture":      floor_area,
            "plancher_bas": floor_area,
            "menuiserie":   area * 0.15,
        }

        if envelopes:
            h_trans = sum(e.surface_m2 * e.u_value for e in envelopes)
            for etype in ("mur", "toiture", "plancher_bas", "menuiserie"):
                s = sum(e.surface_m2 for e in envelopes if e.element_type == etype)
                if s > 0:
                    surfaces[etype] = s
            return h_trans, surfaces

        u = _default_u_values(year)
        h_trans = (
            surfaces["mur"]          * u["mur"]
            + surfaces["toiture"]    * u["toiture"]
            + surfaces["plancher_bas"] * u["plancher_bas"]
            + surfaces["menuiserie"] * u["menuiserie"]
        )
        return h_trans, surfaces

    def _estimate_surfaces(self, envelopes, area, building):
        _, surfaces = self._calc_transmission_losses(envelopes, area, building)
        return surfaces

    def _avg_u(self, envelopes, element_type):
        items = [e for e in envelopes if e.element_type == element_type]
        if not items:
            return None
        total_s = sum(e.surface_m2 for e in items)
        return sum(e.surface_m2 * e.u_value for e in items) / total_s if total_s > 0 else None

    @staticmethod
    def _get_label(value, thresholds):
        for label, (low, high) in thresholds.items():
            if low <= value < high:
                return label
        return "G"

    @staticmethod
    def _worst_label(a, b):
        """Double critère DPE : retourne la plus mauvaise des deux étiquettes."""
        ia = _LABEL_ORDER.index(a) if a in _LABEL_ORDER else 6
        ib = _LABEL_ORDER.index(b) if b in _LABEL_ORDER else 6
        return _LABEL_ORDER[max(ia, ib)]


# Singleton
calculator = EnergyCalculator()
