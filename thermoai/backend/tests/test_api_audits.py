"""
Tests d'intégration — Audits & Calcul énergétique
"""


def _create_full_building(client, headers, org_and_user, project_and_building):
    """Ajoute systèmes + enveloppe au bâtiment de test."""
    bid = project_and_building["building"]["id"]
    # Système chauffage
    client.post(f"/api/buildings/{bid}/systems", json={
        "building_id": bid, "system_type": "chauffage",
        "energy_source": "gaz", "efficiency_nominal": 0.85,
    }, headers=headers)
    # ECS
    client.post(f"/api/buildings/{bid}/systems", json={
        "building_id": bid, "system_type": "ecs",
        "energy_source": "gaz", "efficiency_nominal": 0.80,
    }, headers=headers)
    # Enveloppe
    for elem, surf, u in [("mur", 1800, 1.5), ("toiture", 312, 0.8), ("plancher_bas", 312, 0.6)]:
        client.post(f"/api/buildings/{bid}/envelopes", json={
            "building_id": bid, "element_type": elem, "surface_m2": surf, "u_value": u,
        }, headers=headers)
    return bid


class TestAuditCRUD:
    def test_create_audit(self, client, org_and_user, project_and_building):
        headers = org_and_user["headers"]
        res = client.post("/api/audits", json={
            "building_id": project_and_building["building"]["id"],
            "project_id": project_and_building["project"]["id"],
            "audit_type": "standard",
        }, headers=headers)
        assert res.status_code == 201
        assert res.json()["status"] == "draft"

    def test_list_audits(self, client, org_and_user, project_and_building):
        headers = org_and_user["headers"]
        payload = {
            "building_id": project_and_building["building"]["id"],
            "project_id": project_and_building["project"]["id"],
        }
        client.post("/api/audits", json=payload, headers=headers)
        client.post("/api/audits", json=payload, headers=headers)
        res = client.get("/api/audits", headers=headers)
        assert len(res.json()) == 2

    def test_get_audit_by_id(self, client, org_and_user, project_and_building):
        headers = org_and_user["headers"]
        audit = client.post("/api/audits", json={
            "building_id": project_and_building["building"]["id"],
            "project_id": project_and_building["project"]["id"],
        }, headers=headers).json()
        res = client.get(f"/api/audits/{audit['id']}", headers=headers)
        assert res.status_code == 200

    def test_patch_audit_status(self, client, org_and_user, project_and_building):
        headers = org_and_user["headers"]
        audit = client.post("/api/audits", json={
            "building_id": project_and_building["building"]["id"],
            "project_id": project_and_building["project"]["id"],
        }, headers=headers).json()
        res = client.patch(f"/api/audits/{audit['id']}", json={"status": "in_progress"}, headers=headers)
        assert res.status_code == 200
        assert res.json()["status"] == "in_progress"

    def test_audit_404(self, client, org_and_user):
        import uuid
        res = client.get(f"/api/audits/{uuid.uuid4()}", headers=org_and_user["headers"])
        assert res.status_code == 404


class TestAuditCalculation:
    def test_calculate_sets_results(self, client, org_and_user, project_and_building):
        headers = org_and_user["headers"]
        _create_full_building(client, headers, org_and_user, project_and_building)

        audit = client.post("/api/audits", json={
            "building_id": project_and_building["building"]["id"],
            "project_id": project_and_building["project"]["id"],
        }, headers=headers).json()

        res = client.post(f"/api/audits/{audit['id']}/calculate", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "completed"
        assert data["computed_energy_label"] in list("ABCDEFG")
        assert data["result_snapshot"] is not None
        assert data["result_snapshot"]["primary_energy_per_m2"] > 0

    def test_calculate_returns_all_kpis(self, client, org_and_user, project_and_building):
        headers = org_and_user["headers"]
        _create_full_building(client, headers, org_and_user, project_and_building)

        audit = client.post("/api/audits", json={
            "building_id": project_and_building["building"]["id"],
            "project_id": project_and_building["project"]["id"],
        }, headers=headers).json()

        res = client.post(f"/api/audits/{audit['id']}/calculate", headers=headers).json()
        snap = res["result_snapshot"]
        for key in ["energy_label", "ghg_label", "primary_energy_per_m2", "co2_per_m2",
                    "heating_kwh", "ecs_kwh", "total_final_kwh", "estimated_annual_cost_eur"]:
            assert key in snap, f"Missing key: {key}"

    def test_calculate_old_building_label_low(self, client, org_and_user, project_and_building):
        """Un bâtiment de 1975 sans isolation doit avoir une mauvaise classe DPE."""
        headers = org_and_user["headers"]
        audit = client.post("/api/audits", json={
            "building_id": project_and_building["building"]["id"],
            "project_id": project_and_building["project"]["id"],
        }, headers=headers).json()
        res = client.post(f"/api/audits/{audit['id']}/calculate", headers=headers).json()
        # Bâtiment 1975 sans isolation → D, E, F ou G
        assert res["computed_energy_label"] in list("DEFG")


class TestScenarioSimulation:
    def test_simulate_requires_calculated_audit(self, client, org_and_user, project_and_building):
        headers = org_and_user["headers"]
        audit = client.post("/api/audits", json={
            "building_id": project_and_building["building"]["id"],
            "project_id": project_and_building["project"]["id"],
        }, headers=headers).json()
        # Sans calcul préalable → 400
        res = client.post(f"/api/scenarios/{audit['id']}/simulate", headers=headers)
        assert res.status_code == 400

    def test_simulate_returns_all_measures(self, client, org_and_user, project_and_building):
        headers = org_and_user["headers"]
        _create_full_building(client, headers, org_and_user, project_and_building)
        audit = client.post("/api/audits", json={
            "building_id": project_and_building["building"]["id"],
            "project_id": project_and_building["project"]["id"],
        }, headers=headers).json()
        client.post(f"/api/audits/{audit['id']}/calculate", headers=headers)

        res = client.post(f"/api/scenarios/{audit['id']}/simulate", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "baseline" in data
        assert "simulations" in data
        assert len(data["simulations"]) == 7  # 7 types de travaux

    def test_simulations_sorted_by_savings(self, client, org_and_user, project_and_building):
        headers = org_and_user["headers"]
        _create_full_building(client, headers, org_and_user, project_and_building)
        audit = client.post("/api/audits", json={
            "building_id": project_and_building["building"]["id"],
            "project_id": project_and_building["project"]["id"],
        }, headers=headers).json()
        client.post(f"/api/audits/{audit['id']}/calculate", headers=headers)

        sims = client.post(f"/api/scenarios/{audit['id']}/simulate", headers=headers).json()["simulations"]
        savings = [s["energy_savings_kwh"] for s in sims]
        assert savings == sorted(savings, reverse=True)
