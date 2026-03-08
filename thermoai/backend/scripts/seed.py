"""
ThermoPilot AI — Script de seed
Crée un jeu de données de démonstration complet :
  - 1 organisation (syndic démo)
  - 1 utilisateur admin
  - 2 projets
  - 3 bâtiments avec systèmes + enveloppe + factures
  - 1 audit calculé par bâtiment
  - 2 scénarios de rénovation
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, Base, engine
from app.models.organization import Organization
from app.models.user import User
from app.models.building import BuildingProject, Building, System, Envelope, EnergyBill
from app.models.audit import Audit
from app.models.scenario import RenovationScenario, RenovationMeasure, ScenarioMeasureLink
from app.core.security import hash_password
from app.services.energy_calculator import (
    calculator, AuditInputData, BuildingInput, EnvelopeInput, SystemInput
)

# ─── Données de demo ──────────────────────────────────────────────────────────

BUILDINGS_DATA = [
    {
        "name": "Résidence Les Iris — Bât A",
        "address_line_1": "12 rue des Lilas",
        "postal_code": "75011",
        "city": "paris",
        "construction_year": 1972,
        "building_type": "collectif",
        "ownership_type": "copropriete",
        "heated_area_m2": 3200.0,
        "floors_above_ground": 10,
        "main_use_type": "residentiel",
        "systems": [
            {"system_type": "chauffage", "energy_source": "fioul", "efficiency_nominal": 0.75, "nominal_power_kw": 180.0, "installation_year": 2001},
            {"system_type": "ecs", "energy_source": "fioul", "efficiency_nominal": 0.70, "installation_year": 2001},
        ],
        "envelopes": [
            {"element_type": "mur", "surface_m2": 2800.0, "u_value": 2.2, "orientation": "mixte", "condition_state": "mauvais"},
            {"element_type": "toiture", "surface_m2": 320.0, "u_value": 1.5, "condition_state": "mauvais"},
            {"element_type": "plancher_bas", "surface_m2": 320.0, "u_value": 1.2, "condition_state": "moyen"},
            {"element_type": "menuiserie", "surface_m2": 480.0, "u_value": 4.2, "condition_state": "mauvais"},
        ],
        "bills": [
            {"billing_period_start": "2022-01-01", "billing_period_end": "2022-12-31", "energy_type": "fioul", "consumption_kwh": 680000, "cost_eur_ttc": 89400},
            {"billing_period_start": "2023-01-01", "billing_period_end": "2023-12-31", "energy_type": "fioul", "consumption_kwh": 655000, "cost_eur_ttc": 95200},
        ],
    },
    {
        "name": "Cité Bellevue — Tour B",
        "address_line_1": "45 avenue Gambetta",
        "postal_code": "69003",
        "city": "lyon",
        "construction_year": 1985,
        "building_type": "collectif",
        "ownership_type": "bailleur",
        "heated_area_m2": 5600.0,
        "floors_above_ground": 15,
        "main_use_type": "residentiel",
        "systems": [
            {"system_type": "chauffage", "energy_source": "gaz", "efficiency_nominal": 0.82, "nominal_power_kw": 350.0, "installation_year": 2010},
            {"system_type": "ecs", "energy_source": "gaz", "efficiency_nominal": 0.78, "installation_year": 2010},
        ],
        "envelopes": [
            {"element_type": "mur", "surface_m2": 4500.0, "u_value": 1.8, "condition_state": "moyen"},
            {"element_type": "toiture", "surface_m2": 373.0, "u_value": 0.9, "condition_state": "moyen"},
            {"element_type": "plancher_bas", "surface_m2": 373.0, "u_value": 0.7, "condition_state": "bon"},
            {"element_type": "menuiserie", "surface_m2": 840.0, "u_value": 3.0, "condition_state": "moyen"},
        ],
        "bills": [
            {"billing_period_start": "2022-01-01", "billing_period_end": "2022-12-31", "energy_type": "gaz", "consumption_kwh": 980000, "cost_eur_ttc": 105840},
            {"billing_period_start": "2023-01-01", "billing_period_end": "2023-12-31", "energy_type": "gaz", "consumption_kwh": 945000, "cost_eur_ttc": 102060},
        ],
    },
    {
        "name": "Résidence Éco — Bât C",
        "address_line_1": "8 rue du Moulin Vert",
        "postal_code": "33000",
        "city": "bordeaux",
        "construction_year": 2010,
        "building_type": "collectif",
        "ownership_type": "copropriete",
        "heated_area_m2": 1800.0,
        "floors_above_ground": 5,
        "main_use_type": "residentiel",
        "systems": [
            {"system_type": "chauffage", "energy_source": "gaz", "efficiency_nominal": 0.94, "nominal_power_kw": 90.0, "installation_year": 2018},
            {"system_type": "ecs", "energy_source": "electricite", "efficiency_nominal": 0.90, "installation_year": 2018},
        ],
        "envelopes": [
            {"element_type": "mur", "surface_m2": 1400.0, "u_value": 0.55, "condition_state": "bon"},
            {"element_type": "toiture", "surface_m2": 360.0, "u_value": 0.25, "condition_state": "bon"},
            {"element_type": "plancher_bas", "surface_m2": 360.0, "u_value": 0.30, "condition_state": "bon"},
            {"element_type": "menuiserie", "surface_m2": 270.0, "u_value": 1.4, "condition_state": "bon"},
        ],
        "bills": [
            {"billing_period_start": "2023-01-01", "billing_period_end": "2023-12-31", "energy_type": "gaz", "consumption_kwh": 165000, "cost_eur_ttc": 17820},
        ],
    },
]


def run(db: Session):
    print("🌡️  ThermoPilot AI — Seed de démonstration\n")

    # ── Organisation ──────────────────────────────────────────────────────────
    org = Organization(
        name="Syndic Démo ThermoPilot",
        slug="demo-thermopilot",
        organization_type="syndic",
        billing_email="demo@thermopilot.ai",
        country_code="FR",
    )
    db.add(org)
    db.flush()
    print(f"✅ Organisation créée : {org.name} ({org.id})")

    # ── Utilisateur admin ─────────────────────────────────────────────────────
    user = User(
        organization_id=org.id,
        email="demo@thermopilot.ai",
        password_hash=hash_password("demo1234"),
        first_name="Alice",
        last_name="Dubois",
        job_title="Gestionnaire de patrimoine",
        status="active",
    )
    db.add(user)
    db.flush()
    print(f"✅ Utilisateur créé : {user.email} / demo1234")

    # ── Projets ───────────────────────────────────────────────────────────────
    project_idf = BuildingProject(
        organization_id=org.id,
        name="Portefeuille Île-de-France",
        project_code="IDF-2024",
        project_status="active",
        primary_manager_user_id=user.id,
    )
    project_regions = BuildingProject(
        organization_id=org.id,
        name="Portefeuille Régions",
        project_code="REG-2024",
        project_status="active",
        primary_manager_user_id=user.id,
    )
    db.add_all([project_idf, project_regions])
    db.flush()
    print(f"✅ Projets créés : {project_idf.name}, {project_regions.name}")

    # ── Bâtiments + Audits ────────────────────────────────────────────────────
    projects = [project_idf, project_idf, project_regions]

    for i, b_data in enumerate(BUILDINGS_DATA):
        project = projects[i]
        building = Building(
            organization_id=org.id,
            project_id=project.id,
            name=b_data["name"],
            address_line_1=b_data["address_line_1"],
            postal_code=b_data["postal_code"],
            city=b_data["city"],
            construction_year=b_data["construction_year"],
            building_type=b_data["building_type"],
            ownership_type=b_data["ownership_type"],
            heated_area_m2=b_data["heated_area_m2"],
            floors_above_ground=b_data["floors_above_ground"],
            main_use_type=b_data["main_use_type"],
        )
        db.add(building)
        db.flush()

        # Systèmes
        sys_objects = []
        for s in b_data["systems"]:
            system = System(building_id=building.id, **s)
            db.add(system)
            sys_objects.append(system)

        # Enveloppe
        env_objects = []
        for e in b_data["envelopes"]:
            envelope = Envelope(building_id=building.id, **e)
            db.add(envelope)
            env_objects.append(envelope)

        # Factures
        for bill_data in b_data["bills"]:
            bill = EnergyBill(building_id=building.id, **bill_data)
            db.add(bill)

        db.flush()

        # ── Calcul énergétique ────────────────────────────────────────────────
        building_input = BuildingInput(
            heated_area_m2=float(b_data["heated_area_m2"]),
            construction_year=b_data["construction_year"],
            city=b_data["city"],
            floors_above_ground=b_data["floors_above_ground"],
        )
        envelope_inputs = [
            EnvelopeInput(e.element_type, float(e.surface_m2), float(e.u_value))
            for e in env_objects
        ]
        system_inputs = [
            SystemInput(s.system_type, s.energy_source, float(s.efficiency_nominal))
            for s in sys_objects
        ]
        audit_data_in = AuditInputData(building_input, envelope_inputs, system_inputs)
        result = calculator.calculate(audit_data_in)

        # Mise à jour label bâtiment
        building.current_energy_label = result.energy_label
        building.current_ghg_label = result.ghg_label

        # Créer l'audit
        audit = Audit(
            organization_id=org.id,
            project_id=project.id,
            building_id=building.id,
            audit_type="standard",
            status="completed",
            initiated_by_user_id=user.id,
            validated_by_user_id=user.id,
            baseline_energy_consumption_kwh=result.total_final_kwh,
            baseline_co2_kg=result.co2_per_m2 * float(b_data["heated_area_m2"]),
            computed_energy_label=result.energy_label,
            computed_ghg_label=result.ghg_label,
            result_snapshot={
                "energy_label": result.energy_label,
                "ghg_label": result.ghg_label,
                "primary_energy_per_m2": result.primary_energy_per_m2,
                "co2_per_m2": result.co2_per_m2,
                "heating_kwh": result.heating_kwh,
                "ecs_kwh": result.ecs_kwh,
                "ventilation_kwh": result.ventilation_kwh,
                "total_final_kwh": result.total_final_kwh,
                "estimated_annual_cost_eur": result.estimated_annual_cost_eur,
                "details": result.details,
            },
        )
        db.add(audit)
        db.flush()

        print(
            f"✅ Bâtiment : {building.name}\n"
            f"   Classe DPE : {result.energy_label} | {result.primary_energy_per_m2} kWhpe/m²/an\n"
            f"   CO₂ : {result.co2_per_m2} kgCO₂/m²/an | Coût : {result.estimated_annual_cost_eur} €/an"
        )

        # ── Scénarios pour le premier bâtiment ────────────────────────────────
        if i == 0:
            # Scénario 1 : ITE + toiture + chaudière
            scenario1 = RenovationScenario(
                organization_id=org.id,
                audit_id=audit.id,
                name="Rénovation globale — Niveau C",
                scenario_type="performant",
                target_energy_label="C",
                status="draft",
                estimated_total_cost_eur=520000,
                estimated_energy_savings_kwh=285000,
                estimated_annual_savings_eur=34200,
                estimated_co2_reduction_kg=92340,
                simple_payback_years=15.2,
            )
            db.add(scenario1)
            db.flush()

            measures_s1 = [
                RenovationMeasure(
                    organization_id=org.id,
                    measure_type="ite",
                    component_scope="Murs façades + pignons",
                    description="ITE laine de roche 14cm — U cible 0.25 W/m².K",
                    quantity=2800, unit="m²",
                    estimated_unit_cost_eur=185, estimated_total_cost_eur=518000,
                    expected_energy_gain_kwh=195000, expected_co2_gain_kg=63180,
                    execution_complexity="complex", phasing_group="phase_1",
                ),
                RenovationMeasure(
                    organization_id=org.id,
                    measure_type="isolation_toiture",
                    component_scope="Toiture-terrasse",
                    description="Sarking 20cm — U cible 0.18 W/m².K",
                    quantity=320, unit="m²",
                    estimated_unit_cost_eur=95, estimated_total_cost_eur=30400,
                    expected_energy_gain_kwh=52000, expected_co2_gain_kg=16848,
                    execution_complexity="moderate", phasing_group="phase_1",
                ),
                RenovationMeasure(
                    organization_id=org.id,
                    measure_type="remplacement_chaudiere",
                    component_scope="Chaufferie centrale",
                    description="Chaudière condensation fioul HTE — rendement 95%",
                    quantity=1, unit="unité",
                    estimated_unit_cost_eur=28000, estimated_total_cost_eur=28000,
                    expected_energy_gain_kwh=38000, expected_co2_gain_kg=12312,
                    execution_complexity="moderate", phasing_group="phase_2",
                ),
            ]
            for m in measures_s1:
                db.add(m)
            db.flush()
            for m in measures_s1:
                db.add(ScenarioMeasureLink(scenario_id=scenario1.id, measure_id=m.id))

            # Scénario 2 : PAC + menuiseries (plus ambitieux)
            scenario2 = RenovationScenario(
                organization_id=org.id,
                audit_id=audit.id,
                name="BBC Rénovation — Niveau B",
                scenario_type="bbc_renovation",
                target_energy_label="B",
                status="draft",
                estimated_total_cost_eur=985000,
                estimated_energy_savings_kwh=410000,
                estimated_annual_savings_eur=52890,
                estimated_co2_reduction_kg=132840,
                simple_payback_years=18.6,
            )
            db.add(scenario2)
            db.flush()

            print(f"   ↳ 2 scénarios créés pour ce bâtiment")

    db.commit()
    print("\n🎉 Seed terminé avec succès !")
    print("\n─── Accès démo ─────────────────────────────────────────────")
    print("   URL      : http://localhost:3000")
    print("   Email    : demo@thermopilot.ai")
    print("   Mot de passe : demo1234")
    print("────────────────────────────────────────────────────────────")


if __name__ == "__main__":
    print("Création des tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        run(db)
    except Exception as e:
        db.rollback()
        print(f"\n❌ Erreur : {e}")
        raise
    finally:
        db.close()
