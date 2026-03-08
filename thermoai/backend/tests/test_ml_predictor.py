"""
Tests unitaires — Modèle ML prédictif ThermoPilot AI
"""
import pytest
from app.services.ml_predictor import (
    ml_predictor,
    MLPredictionInput,
    _default_u_values,
    ENERGY_SOURCE_CODE,
)
from app.services.energy_calculator import (
    EnergyCalculator, AuditInputData, BuildingInput
)


class TestDefaultUValues:
    def test_pre_1948_high_u(self):
        u_wall, u_roof, u_floor, u_window = _default_u_values(1930)
        assert u_wall >= 2.0
        assert u_window >= 4.0

    def test_post_2012_low_u(self):
        u_wall, u_roof, u_floor, u_window = _default_u_values(2020)
        assert u_wall <= 0.5
        assert u_roof <= 0.3

    def test_improvement_over_time(self):
        u_old = _default_u_values(1960)[0]  # u_wall
        u_new = _default_u_values(2015)[0]
        assert u_new < u_old


class TestEnergySourceCode:
    def test_gaz_is_coded(self):
        assert "gaz" in ENERGY_SOURCE_CODE

    def test_all_sources_unique(self):
        codes = list(ENERGY_SOURCE_CODE.values())
        assert len(codes) == len(set(codes))


class TestMLPredictor:
    @pytest.fixture(autouse=True)
    def ensure_trained(self):
        """Train model once for all tests (uses 2000 samples for speed)."""
        if not ml_predictor._trained:
            ml_predictor.train(n_samples=2000)

    def _inp(self, **kwargs):
        defaults = dict(
            heated_area_m2=1000,
            construction_year=1975,
            city="paris",
            floors_above_ground=5,
            heating_efficiency=0.85,
            energy_source="gaz",
        )
        defaults.update(kwargs)
        return MLPredictionInput(**defaults)

    def test_prediction_returns_positive_value(self):
        result = ml_predictor.predict(self._inp())
        assert result["predicted_primary_energy_per_m2"] > 0

    def test_prediction_has_required_keys(self):
        result = ml_predictor.predict(self._inp())
        assert "predicted_primary_energy_per_m2" in result
        assert "model_mae_kwh_m2" in result
        assert "top_influencing_factors" in result

    def test_top_factors_have_importance(self):
        result = ml_predictor.predict(self._inp())
        factors = result["top_influencing_factors"]
        assert len(factors) == 3
        for f in factors:
            assert "feature" in f
            assert "importance" in f
            assert f["importance"] > 0

    def test_old_building_higher_energy_than_new(self):
        old = ml_predictor.predict(self._inp(construction_year=1960))
        new = ml_predictor.predict(self._inp(construction_year=2015))
        assert old["predicted_primary_energy_per_m2"] > new["predicted_primary_energy_per_m2"]

    def test_good_insulation_lower_energy(self):
        poor = ml_predictor.predict(self._inp(u_wall=2.5, u_roof=2.5))
        good = ml_predictor.predict(self._inp(u_wall=0.2, u_roof=0.15))
        assert good["predicted_primary_energy_per_m2"] < poor["predicted_primary_energy_per_m2"]

    def test_prediction_physical_minimum(self):
        """Prediction must never go below 30 kWhpe/m²/an (physical minimum)."""
        result = ml_predictor.predict(
            self._inp(construction_year=2023, u_wall=0.1, u_roof=0.1, heating_efficiency=1.0)
        )
        assert result["predicted_primary_energy_per_m2"] >= 30.0

    def test_compare_with_calculator(self):
        calc = EnergyCalculator()
        inp_ml = self._inp()
        data = AuditInputData(building=BuildingInput(
            heated_area_m2=inp_ml.heated_area_m2,
            construction_year=inp_ml.construction_year,
            city=inp_ml.city,
        ))
        calc_result = calc.calculate(data)
        comparison = ml_predictor.compare_with_calculator(inp_ml, calc_result.primary_energy_per_m2)

        assert "delta_kwh_m2" in comparison
        assert "calculator_primary_energy_per_m2" in comparison
        assert comparison["calculator_primary_energy_per_m2"] == round(calc_result.primary_energy_per_m2, 1)

    def test_mae_reasonable(self):
        """MAE should be below 50 kWhpe/m²/an (reasonable for this type of model)."""
        assert ml_predictor._mae < 50.0
