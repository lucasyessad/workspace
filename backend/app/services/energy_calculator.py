"""
ThermoPilot AI — Energy Calculation Engine
Simplified RE2020-aligned calculation for residential buildings.
Based on the 3CL-DPE (Calcul de la Consommation Conventionnelle des Logements) methodology.
"""
from dataclasses import dataclass, field
from typing import List, Optional
import numpy as np


# ─── Constants ────────────────────────────────────────────────────────────────

# Degree days base 18°C — French cities (DJU heating)
DJU_BY_CITY: dict = {
    "paris": 2500,
    "lyon": 2400,
    "marseille": 1600,
    "bordeaux": 2000,
    "lille": 2900,
    "strasbourg": 2800,
    "toulouse": 1900,
    "nantes": 2300,
    "default": 2500,
}

# Energy conversion factors (primary energy, kWhef → kWhpe)
PRIMARY_ENERGY_FACTOR = {
    "electricite": 2.3,
    "gaz": 1.0,
    "fioul": 1.0,
    "bois": 1.0,
    "pac": 2.3,
    "reseau_chaleur": 0.6,
}

# CO2 emission factors (kgCO2/kWh final)
CO2_FACTOR = {
    "electricite": 0.064,
    "gaz": 0.227,
    "fioul": 0.324,
    "bois": 0.030,
    "pac": 0.064,
    "reseau_chaleur": 0.120,
}

# Energy label thresholds (kWhpe/m²/an — primary energy)
ENERGY_LABEL_THRESHOLDS = {
    "A": (0, 70),
    "B": (70, 110),
    "C": (110, 180),
    "D": (180, 250),
    "E": (250, 330),
    "F": (330, 420),
    "G": (420, float("inf")),
}

# GHG label thresholds (kgCO2/m²/an)
GHG_LABEL_THRESHOLDS = {
    "A": (0, 6),
    "B": (6, 11),
    "C": (11, 30),
    "D": (30, 50),
    "E": (50, 70),
    "F": (70, 100),
    "G": (100, float("inf")),
}


# ─── Input Models ─────────────────────────────────────────────────────────────

@dataclass
class BuildingInput:
    heated_area_m2: float
    construction_year: int
    city: str = "default"
    floors_above_ground: int = 5
    building_type: str = "collectif"


@dataclass
class EnvelopeInput:
    element_type: str   # mur, toiture, plancher_bas, menuiserie
    surface_m2: float
    u_value: float      # W/m².K


@dataclass
class SystemInput:
    system_type: str    # chauffage, ecs
    energy_source: str  # gaz, fioul, electricite, pac, bois
    efficiency: float   # rendement (ex: 0.9 pour chaudière gaz)


@dataclass
class AuditInputData:
    building: BuildingInput
    envelopes: List[EnvelopeInput] = field(default_factory=list)
    systems: List[SystemInput] = field(default_factory=list)


# ─── Output Models ────────────────────────────────────────────────────────────

@dataclass
class EnergyResult:
    # Final energy (kWh/an)
    heating_kwh: float
    ecs_kwh: float
    ventilation_kwh: float
    total_final_kwh: float

    # Primary energy (kWh primary/m²/an)
    primary_energy_per_m2: float

    # CO2 (kg/m²/an)
    co2_per_m2: float

    # Labels
    energy_label: str
    ghg_label: str

    # Cost
    estimated_annual_cost_eur: float

    # Details
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
    new_primary_energy_per_m2: float


# ─── Main Calculator ──────────────────────────────────────────────────────────

class EnergyCalculator:

    def calculate(self, data: AuditInputData) -> EnergyResult:
        building = data.building
        area = building.heated_area_m2
        dju = DJU_BY_CITY.get(building.city.lower(), DJU_BY_CITY["default"])

        # 1. Transmission losses through envelope
        heat_loss_w_per_k = self._calc_transmission_losses(data.envelopes, area, building)

        # 2. Ventilation losses (simplified)
        # Volume = area × 2.5m ceiling height; ACH = 0.5/h
        volume_m3 = area * 2.5
        ventilation_loss_w_per_k = 0.34 * 0.5 * volume_m3  # 0.34 J/(m³·K) × ACH × Vol

        # 3. Total heat loss coefficient
        total_loss_w_per_k = heat_loss_w_per_k + ventilation_loss_w_per_k

        # 4. Heating need (kWh/an)
        # Besoins = H × DJU × 24h / 1000
        heating_need_kwh = total_loss_w_per_k * dju * 24 / 1000

        # 5. System efficiency for heating
        heating_system = next((s for s in data.systems if s.system_type == "chauffage"), None)
        if heating_system:
            heating_efficiency = heating_system.efficiency
            heating_energy_source = heating_system.energy_source
        else:
            # Default: gas boiler 85%
            heating_efficiency = 0.85
            heating_energy_source = "gaz"

        heating_kwh = heating_need_kwh / heating_efficiency

        # 6. DHW (ECS) — simplified forfait based on area
        ecs_system = next((s for s in data.systems if s.system_type == "ecs"), None)
        if ecs_system:
            ecs_efficiency = ecs_system.efficiency
            ecs_energy_source = ecs_system.energy_source
        else:
            ecs_efficiency = 0.80
            ecs_energy_source = heating_energy_source

        # ECS = 25 kWh/m²/an (typical collective)
        ecs_kwh = area * 25 / ecs_efficiency

        # 7. Ventilation auxiliary (electricity)
        ventilation_kwh = area * 3.5  # ~3.5 kWh/m²/an for VMC

        total_final_kwh = heating_kwh + ecs_kwh + ventilation_kwh

        # 8. Primary energy
        fe_heating = PRIMARY_ENERGY_FACTOR.get(heating_energy_source, 1.0)
        fe_ecs = PRIMARY_ENERGY_FACTOR.get(ecs_energy_source, 1.0)
        fe_vent = PRIMARY_ENERGY_FACTOR["electricite"]

        primary_kwh = (
            heating_kwh * fe_heating
            + ecs_kwh * fe_ecs
            + ventilation_kwh * fe_vent
        )
        primary_per_m2 = primary_kwh / area

        # 9. CO2
        co2_heating = heating_kwh * CO2_FACTOR.get(heating_energy_source, 0.2)
        co2_ecs = ecs_kwh * CO2_FACTOR.get(ecs_energy_source, 0.2)
        co2_vent = ventilation_kwh * CO2_FACTOR["electricite"]
        total_co2 = co2_heating + co2_ecs + co2_vent
        co2_per_m2 = total_co2 / area

        # 10. Labels
        energy_label = self._get_label(primary_per_m2, ENERGY_LABEL_THRESHOLDS)
        ghg_label = self._get_label(co2_per_m2, GHG_LABEL_THRESHOLDS)

        # 11. Estimated cost
        unit_price = self._get_unit_price(heating_energy_source)
        estimated_cost = heating_kwh * unit_price + ecs_kwh * self._get_unit_price(ecs_energy_source)

        return EnergyResult(
            heating_kwh=round(heating_kwh, 1),
            ecs_kwh=round(ecs_kwh, 1),
            ventilation_kwh=round(ventilation_kwh, 1),
            total_final_kwh=round(total_final_kwh, 1),
            primary_energy_per_m2=round(primary_per_m2, 1),
            co2_per_m2=round(co2_per_m2, 2),
            energy_label=energy_label,
            ghg_label=ghg_label,
            estimated_annual_cost_eur=round(estimated_cost, 0),
            details={
                "heat_loss_w_per_k": round(heat_loss_w_per_k, 1),
                "ventilation_loss_w_per_k": round(ventilation_loss_w_per_k, 1),
                "heating_need_kwh": round(heating_need_kwh, 1),
                "dju": dju,
                "heating_energy_source": heating_energy_source,
                "primary_energy_factor_heating": fe_heating,
            },
        )

    def simulate_measure(
        self,
        baseline: EnergyResult,
        data: AuditInputData,
        measure_type: str,
        measure_params: dict,
    ) -> ScenarioResult:
        """
        Simulate a single renovation measure and return the delta vs baseline.
        measure_type: ite, isolation_toiture, isolation_plancher, menuiseries,
                      remplacement_chaudiere, pac, vmc
        """
        area = data.building.heated_area_m2

        # Modify envelopes or systems, recalculate
        import copy
        new_data = copy.deepcopy(data)

        new_primary_per_m2 = baseline.primary_energy_per_m2
        cost_eur = 0.0

        if measure_type == "ite":
            # Isolation Thermique par l'Extérieur (murs)
            delta_u = measure_params.get("delta_u", 0.6)  # U reduction W/m².K
            wall_surface = sum(e.surface_m2 for e in new_data.envelopes if e.element_type == "mur")
            if not wall_surface:
                wall_surface = area * 1.8  # fallback estimate
            savings_w_per_k = delta_u * wall_surface
            savings_kwh = savings_w_per_k * DJU_BY_CITY.get(data.building.city.lower(), 2500) * 24 / 1000
            savings_kwh /= 0.85  # heating efficiency
            cost_eur = wall_surface * measure_params.get("unit_cost_eur_m2", 180)

        elif measure_type == "isolation_toiture":
            delta_u = measure_params.get("delta_u", 0.8)
            roof_surface = sum(e.surface_m2 for e in new_data.envelopes if e.element_type == "toiture")
            if not roof_surface:
                roof_surface = area / data.building.floors_above_ground
            savings_w_per_k = delta_u * roof_surface
            savings_kwh = savings_w_per_k * DJU_BY_CITY.get(data.building.city.lower(), 2500) * 24 / 1000
            savings_kwh /= 0.85
            cost_eur = roof_surface * measure_params.get("unit_cost_eur_m2", 60)

        elif measure_type == "isolation_plancher":
            delta_u = measure_params.get("delta_u", 0.7)
            floor_surface = sum(e.surface_m2 for e in new_data.envelopes if e.element_type == "plancher_bas")
            if not floor_surface:
                floor_surface = area / data.building.floors_above_ground
            savings_w_per_k = delta_u * floor_surface
            savings_kwh = savings_w_per_k * DJU_BY_CITY.get(data.building.city.lower(), 2500) * 24 / 1000
            savings_kwh /= 0.85
            cost_eur = floor_surface * measure_params.get("unit_cost_eur_m2", 30)

        elif measure_type == "menuiseries":
            delta_u = measure_params.get("delta_u", 1.5)
            window_surface = sum(e.surface_m2 for e in new_data.envelopes if e.element_type == "menuiserie")
            if not window_surface:
                window_surface = area * 0.15  # 15% of area typical
            savings_w_per_k = delta_u * window_surface
            savings_kwh = savings_w_per_k * DJU_BY_CITY.get(data.building.city.lower(), 2500) * 24 / 1000
            savings_kwh /= 0.85
            cost_eur = window_surface * measure_params.get("unit_cost_eur_m2", 650)

        elif measure_type == "remplacement_chaudiere":
            old_eff = measure_params.get("old_efficiency", 0.75)
            new_eff = measure_params.get("new_efficiency", 0.95)
            heating_kwh = baseline.heating_kwh
            old_need = heating_kwh * old_eff
            new_kwh = old_need / new_eff
            savings_kwh = heating_kwh - new_kwh
            cost_eur = measure_params.get("total_cost_eur", area * 30)

        elif measure_type == "pac":
            # Heat pump: replace gas boiler with PAC COP 3.5
            old_eff = 0.85
            cop = measure_params.get("cop", 3.5)
            heating_need = baseline.heating_kwh * old_eff
            new_kwh_elec = heating_need / cop
            # Switch from gas to electricity primary
            old_primary = baseline.heating_kwh * PRIMARY_ENERGY_FACTOR["gaz"]
            new_primary = new_kwh_elec * PRIMARY_ENERGY_FACTOR["electricite"]
            savings_kwh = baseline.heating_kwh - new_kwh_elec
            cost_eur = measure_params.get("total_cost_eur", area * 100)

        elif measure_type == "vmc":
            # VMC double flux: reduce ventilation losses by 70%
            savings_kwh = baseline.ventilation_kwh * 0.70
            cost_eur = area * measure_params.get("unit_cost_eur_m2", 35)

        else:
            savings_kwh = 0.0
            cost_eur = 0.0

        # Compute new primary energy
        heating_src = next(
            (s.energy_source for s in data.systems if s.system_type == "chauffage"), "gaz"
        )
        fe = PRIMARY_ENERGY_FACTOR.get(heating_src, 1.0)
        savings_primary_kwh = savings_kwh * fe
        new_primary_per_m2 = max(0, baseline.primary_energy_per_m2 - savings_primary_kwh / area)

        # CO2 savings
        co2_factor = CO2_FACTOR.get(heating_src, 0.2)
        co2_savings = savings_kwh * co2_factor

        # New labels
        new_energy_label = self._get_label(new_primary_per_m2, ENERGY_LABEL_THRESHOLDS)
        new_ghg_label = self._get_label(
            max(0, baseline.co2_per_m2 - co2_savings / area), GHG_LABEL_THRESHOLDS
        )

        # Payback
        annual_savings_eur = savings_kwh * self._get_unit_price(heating_src)
        payback = cost_eur / annual_savings_eur if annual_savings_eur > 0 else 99.0

        return ScenarioResult(
            measure_type=measure_type,
            energy_savings_kwh=round(savings_kwh, 1),
            energy_savings_percent=round(savings_kwh / baseline.total_final_kwh * 100, 1),
            co2_savings_kg=round(co2_savings, 1),
            estimated_cost_eur=round(cost_eur, 0),
            simple_payback_years=round(min(payback, 99.0), 1),
            new_energy_label=new_energy_label,
            new_ghg_label=new_ghg_label,
            new_primary_energy_per_m2=round(new_primary_per_m2, 1),
        )

    def _calc_transmission_losses(
        self, envelopes: List[EnvelopeInput], area: float, building: BuildingInput
    ) -> float:
        """Returns total heat loss coefficient H (W/K) from envelope."""
        if envelopes:
            return sum(e.surface_m2 * e.u_value for e in envelopes)

        # Default U-values by construction period when no data
        year = building.construction_year or 1980
        if year < 1948:
            u_wall, u_roof, u_floor, u_window = 2.5, 2.8, 1.5, 4.5
        elif year < 1974:
            u_wall, u_roof, u_floor, u_window = 2.0, 2.0, 1.2, 4.0
        elif year < 1982:
            u_wall, u_roof, u_floor, u_window = 1.5, 0.8, 0.8, 3.5
        elif year < 2000:
            u_wall, u_roof, u_floor, u_window = 0.9, 0.5, 0.6, 2.5
        elif year < 2012:
            u_wall, u_roof, u_floor, u_window = 0.6, 0.3, 0.4, 1.8
        else:
            u_wall, u_roof, u_floor, u_window = 0.3, 0.2, 0.3, 1.3

        floors = building.floors_above_ground or 5
        # Estimate surfaces from area
        floor_area = area / floors
        wall_surface = (floor_area ** 0.5) * 4 * 2.5 * floors  # perimeter × height × floors
        roof_surface = floor_area
        floor_surface = floor_area
        window_surface = area * 0.15

        h = (
            wall_surface * u_wall
            + roof_surface * u_roof
            + floor_surface * u_floor
            + window_surface * u_window
        )
        return h

    def _get_label(self, value: float, thresholds: dict) -> str:
        for label, (low, high) in thresholds.items():
            if low <= value < high:
                return label
        return "G"

    def _get_unit_price(self, energy_source: str) -> float:
        """Average unit price in €/kWh final (2024 France)"""
        prices = {
            "electricite": 0.206,
            "gaz": 0.108,
            "fioul": 0.120,
            "bois": 0.060,
            "pac": 0.206,
            "reseau_chaleur": 0.085,
        }
        return prices.get(energy_source, 0.12)


# Singleton
calculator = EnergyCalculator()
