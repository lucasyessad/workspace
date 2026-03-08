"""
Tests unitaires — Moteur de calcul énergétique ThermoPilot AI
"""
import pytest
from app.services.energy_calculator import (
    EnergyCalculator,
    AuditInputData,
    BuildingInput,
    EnvelopeInput,
    SystemInput,
    ENERGY_LABEL_THRESHOLDS,
    GHG_LABEL_THRESHOLDS,
    calculator,
)


# ─── Fixtures ─────────────────────────────────────────────────────────────────

@pytest.fixture
def building_collectif():
    return BuildingInput(
        heated_area_m2=2500.0,
        construction_year=1975,
        city="paris",
        floors_above_ground=8,
        building_type="collectif",
    )


@pytest.fixture
def building_recent():
    return BuildingInput(
        heated_area_m2=1200.0,
        construction_year=2015,
        city="lyon",
        floors_above_ground=4,
        building_type="collectif",
    )


@pytest.fixture
def envelopes_standard():
    return [
        EnvelopeInput(element_type="mur", surface_m2=1800.0, u_value=1.5),
        EnvelopeInput(element_type="toiture", surface_m2=312.0, u_value=0.8),
        EnvelopeInput(element_type="plancher_bas", surface_m2=312.0, u_value=0.6),
        EnvelopeInput(element_type="menuiserie", surface_m2=375.0, u_value=3.5),
    ]


@pytest.fixture
def system_gaz():
    return SystemInput(system_type="chauffage", energy_source="gaz", efficiency=0.85)


@pytest.fixture
def system_ecs_gaz():
    return SystemInput(system_type="ecs", energy_source="gaz", efficiency=0.80)


@pytest.fixture
def audit_input_standard(building_collectif, envelopes_standard, system_gaz, system_ecs_gaz):
    return AuditInputData(
        building=building_collectif,
        envelopes=envelopes_standard,
        systems=[system_gaz, system_ecs_gaz],
    )


@pytest.fixture
def audit_input_no_data(building_collectif):
    """Cas sans données d'enveloppe ni système — valeurs par défaut."""
    return AuditInputData(building=building_collectif)


# ─── Tests labels ─────────────────────────────────────────────────────────────

class TestLabels:
    def test_label_A(self):
        assert calculator._get_label(50, ENERGY_LABEL_THRESHOLDS) == "A"

    def test_label_B(self):
        assert calculator._get_label(90, ENERGY_LABEL_THRESHOLDS) == "B"

    def test_label_C(self):
        assert calculator._get_label(150, ENERGY_LABEL_THRESHOLDS) == "C"

    def test_label_D(self):
        assert calculator._get_label(200, ENERGY_LABEL_THRESHOLDS) == "D"

    def test_label_E(self):
        assert calculator._get_label(280, ENERGY_LABEL_THRESHOLDS) == "E"

    def test_label_F(self):
        assert calculator._get_label(370, ENERGY_LABEL_THRESHOLDS) == "F"

    def test_label_G(self):
        assert calculator._get_label(500, ENERGY_LABEL_THRESHOLDS) == "G"

    def test_label_boundary_B_C(self):
        """110 kWhpe/m² est exactement la limite B→C."""
        assert calculator._get_label(110, ENERGY_LABEL_THRESHOLDS) == "C"

    def test_ghg_label_A(self):
        assert calculator._get_label(3.0, GHG_LABEL_THRESHOLDS) == "A"

    def test_ghg_label_G(self):
        assert calculator._get_label(150.0, GHG_LABEL_THRESHOLDS) == "G"


# ─── Tests calcul de base ──────────────────────────────────────────────────────

class TestCalculation:

    def test_result_has_all_fields(self, audit_input_standard):
        result = calculator.calculate(audit_input_standard)
        assert result.heating_kwh > 0
        assert result.ecs_kwh > 0
        assert result.ventilation_kwh > 0
        assert result.total_final_kwh > 0
        assert result.primary_energy_per_m2 > 0
        assert result.co2_per_m2 > 0
        assert result.energy_label in list("ABCDEFG")
        assert result.ghg_label in list("ABCDEFG")
        assert result.estimated_annual_cost_eur > 0

    def test_total_equals_sum_of_usages(self, audit_input_standard):
        result = calculator.calculate(audit_input_standard)
        expected = result.heating_kwh + result.ecs_kwh + result.ventilation_kwh
        assert abs(result.total_final_kwh - expected) < 1.0

    def test_recent_building_better_label_than_old(self, building_collectif, building_recent):
        old_data = AuditInputData(building=building_collectif)
        new_data = AuditInputData(building=building_recent)
        old_result = calculator.calculate(old_data)
        new_result = calculator.calculate(new_data)
        # Bâtiment récent doit avoir une énergie primaire/m² plus basse
        assert new_result.primary_energy_per_m2 < old_result.primary_energy_per_m2

    def test_pac_lower_co2_than_gaz(self, building_collectif, envelopes_standard):
        data_gaz = AuditInputData(
            building=building_collectif,
            envelopes=envelopes_standard,
            systems=[SystemInput("chauffage", "gaz", 0.85)],
        )
        data_pac = AuditInputData(
            building=building_collectif,
            envelopes=envelopes_standard,
            systems=[SystemInput("chauffage", "pac", 3.5)],
        )
        result_gaz = calculator.calculate(data_gaz)
        result_pac = calculator.calculate(data_pac)
        # PAC émet moins de CO2 par kWh final que gaz
        assert result_pac.co2_per_m2 < result_gaz.co2_per_m2

    def test_no_envelope_data_uses_defaults(self, audit_input_no_data):
        """Sans données enveloppe, le calcul doit fonctionner avec valeurs par défaut."""
        result = calculator.calculate(audit_input_no_data)
        assert result.primary_energy_per_m2 > 0
        assert result.energy_label in list("ABCDEFG")

    def test_large_area_scales_proportionally(self, building_collectif, envelopes_standard):
        """Doubler la surface doit approximativement doubler la conso totale."""
        small = BuildingInput(
            heated_area_m2=1000.0,
            construction_year=1975,
            city="paris",
            floors_above_ground=4,
        )
        large = BuildingInput(
            heated_area_m2=2000.0,
            construction_year=1975,
            city="paris",
            floors_above_ground=4,
        )
        envelopes_small = [EnvelopeInput("mur", 800.0, 1.5), EnvelopeInput("toiture", 250.0, 0.8)]
        envelopes_large = [EnvelopeInput("mur", 1600.0, 1.5), EnvelopeInput("toiture", 500.0, 0.8)]
        r_small = calculator.calculate(AuditInputData(small, envelopes_small))
        r_large = calculator.calculate(AuditInputData(large, envelopes_large))
        ratio = r_large.total_final_kwh / r_small.total_final_kwh
        assert 1.8 <= ratio <= 2.2

    def test_city_dju_affects_heating(self, envelopes_standard, system_gaz):
        """Marseille (DJU bas) doit consommer moins en chauffage que Lille (DJU haut)."""
        marseille = AuditInputData(
            building=BuildingInput(2500, 1975, "marseille", 8),
            envelopes=envelopes_standard,
            systems=[system_gaz],
        )
        lille = AuditInputData(
            building=BuildingInput(2500, 1975, "lille", 8),
            envelopes=envelopes_standard,
            systems=[system_gaz],
        )
        assert calculator.calculate(marseille).heating_kwh < calculator.calculate(lille).heating_kwh

    def test_primary_energy_factor_applied(self, building_collectif):
        """L'électricité doit avoir un facteur primaire de 2.3 vs 1.0 pour le gaz."""
        data_gaz = AuditInputData(
            building=building_collectif,
            systems=[SystemInput("chauffage", "gaz", 0.85)],
        )
        data_elec = AuditInputData(
            building=building_collectif,
            systems=[SystemInput("chauffage", "electricite", 1.0)],
        )
        r_gaz = calculator.calculate(data_gaz)
        r_elec = calculator.calculate(data_elec)
        # À efficacité finale comparable, l'électricité a plus d'énergie primaire
        assert r_elec.primary_energy_per_m2 > r_gaz.primary_energy_per_m2


# ─── Tests simulation de travaux ──────────────────────────────────────────────

class TestSimulation:

    def _get_baseline(self, audit_input):
        return calculator.calculate(audit_input)

    def test_ite_reduces_heating(self, audit_input_standard):
        baseline = self._get_baseline(audit_input_standard)
        sim = calculator.simulate_measure(baseline, audit_input_standard, "ite", {"delta_u": 0.6, "unit_cost_eur_m2": 180})
        assert sim.energy_savings_kwh > 0
        assert sim.new_primary_energy_per_m2 < baseline.primary_energy_per_m2

    def test_isolation_toiture_positive_savings(self, audit_input_standard):
        baseline = self._get_baseline(audit_input_standard)
        sim = calculator.simulate_measure(baseline, audit_input_standard, "isolation_toiture", {"delta_u": 0.8, "unit_cost_eur_m2": 60})
        assert sim.energy_savings_kwh > 0
        assert sim.estimated_cost_eur > 0

    def test_pac_saves_energy(self, audit_input_standard):
        baseline = self._get_baseline(audit_input_standard)
        sim = calculator.simulate_measure(baseline, audit_input_standard, "pac", {"cop": 3.5})
        assert sim.energy_savings_kwh > 0

    def test_vmc_reduces_ventilation(self, audit_input_standard):
        baseline = self._get_baseline(audit_input_standard)
        sim = calculator.simulate_measure(baseline, audit_input_standard, "vmc", {"unit_cost_eur_m2": 35})
        assert sim.energy_savings_kwh > 0
        assert sim.energy_savings_percent > 0

    def test_payback_positive(self, audit_input_standard):
        baseline = self._get_baseline(audit_input_standard)
        for measure_type in ["ite", "isolation_toiture", "pac", "menuiseries"]:
            sim = calculator.simulate_measure(baseline, audit_input_standard, measure_type, {})
            assert sim.simple_payback_years > 0

    def test_new_label_better_or_equal(self, audit_input_standard):
        """Après travaux, la classe ne doit pas empirer."""
        baseline = self._get_baseline(audit_input_standard)
        label_order = list("ABCDEFG")
        for measure_type in ["ite", "isolation_toiture", "isolation_plancher", "menuiseries"]:
            sim = calculator.simulate_measure(baseline, audit_input_standard, measure_type, {})
            assert label_order.index(sim.new_energy_label) <= label_order.index(baseline.energy_label)

    def test_remplacement_chaudiere_improves_efficiency(self, building_collectif):
        """Remplacement chaudière 75% → 95% doit réduire la conso."""
        data = AuditInputData(
            building=building_collectif,
            systems=[SystemInput("chauffage", "gaz", 0.75)],
        )
        baseline = calculator.calculate(data)
        sim = calculator.simulate_measure(
            baseline, data, "remplacement_chaudiere",
            {"old_efficiency": 0.75, "new_efficiency": 0.95}
        )
        assert sim.energy_savings_kwh > 0

    def test_unknown_measure_returns_zero_savings(self, audit_input_standard):
        baseline = self._get_baseline(audit_input_standard)
        sim = calculator.simulate_measure(baseline, audit_input_standard, "unknown_measure", {})
        assert sim.energy_savings_kwh == 0.0

    def test_co2_savings_positive_for_gaz(self, audit_input_standard):
        baseline = self._get_baseline(audit_input_standard)
        sim = calculator.simulate_measure(baseline, audit_input_standard, "ite", {"delta_u": 0.6})
        assert sim.co2_savings_kg > 0


# ─── Tests prix unitaires ──────────────────────────────────────────────────────

class TestUnitPrices:
    def test_electricite_price(self):
        assert calculator._get_unit_price("electricite") == pytest.approx(0.206)

    def test_gaz_price(self):
        assert calculator._get_unit_price("gaz") == pytest.approx(0.108)

    def test_unknown_energy_has_default(self):
        price = calculator._get_unit_price("unknown_source")
        assert price > 0
