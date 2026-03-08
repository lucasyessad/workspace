"""
Tests d'intégration — Bâtiments, Systèmes, Enveloppe, Factures
"""


class TestBuildingProjects:
    def test_create_project(self, client, org_and_user):
        res = client.post("/api/buildings/projects", json={
            "name": "Résidence Test",
            "project_status": "active",
        }, headers=org_and_user["headers"])
        assert res.status_code == 201
        assert res.json()["name"] == "Résidence Test"

    def test_list_projects(self, client, org_and_user):
        headers = org_and_user["headers"]
        client.post("/api/buildings/projects", json={"name": "Projet 1", "project_status": "active"}, headers=headers)
        client.post("/api/buildings/projects", json={"name": "Projet 2", "project_status": "active"}, headers=headers)
        res = client.get("/api/buildings/projects", headers=headers)
        assert res.status_code == 200
        assert len(res.json()) == 2

    def test_projects_isolated_by_org(self, client, org_and_user):
        """Un utilisateur ne voit pas les projets d'une autre organisation."""
        # Créer une deuxième org + user
        org2 = client.post("/api/auth/organizations", json={
            "name": "Autre Org", "slug": "autre-org", "organization_type": "syndic",
        }).json()
        token2 = client.post("/api/auth/register", json={
            "email": "bob@autre.fr", "password": "mdp", "organization_id": org2["id"],
        }).json()["access_token"]
        headers2 = {"Authorization": f"Bearer {token2}"}

        # Créer un projet depuis org1
        proj_res = client.post("/api/buildings/projects", json={
            "name": "Projet Org1", "project_status": "active"
        }, headers=org_and_user["headers"])
        assert proj_res.status_code == 201

        # org2 ne doit pas voir ce projet
        res = client.get("/api/buildings/projects", headers=headers2)
        assert len(res.json()) == 0


class TestBuildings:
    def test_create_building(self, client, org_and_user, project_and_building):
        building = project_and_building["building"]
        assert building["name"] == "Bâtiment A"
        assert building["construction_year"] == 1975
        assert building["heated_area_m2"] == 2500.0

    def test_list_buildings(self, client, org_and_user, project_and_building):
        res = client.get("/api/buildings", headers=org_and_user["headers"])
        assert res.status_code == 200
        assert len(res.json()) == 1

    def test_get_building_by_id(self, client, org_and_user, project_and_building):
        bid = project_and_building["building"]["id"]
        res = client.get(f"/api/buildings/{bid}", headers=org_and_user["headers"])
        assert res.status_code == 200
        assert res.json()["id"] == bid

    def test_get_building_404(self, client, org_and_user):
        import uuid
        res = client.get(f"/api/buildings/{uuid.uuid4()}", headers=org_and_user["headers"])
        assert res.status_code == 404

    def test_update_building(self, client, org_and_user, project_and_building):
        bid = project_and_building["building"]["id"]
        pid = project_and_building["project"]["id"]
        res = client.put(f"/api/buildings/{bid}", json={
            "project_id": pid,
            "name": "Bâtiment A — modifié",
            "city": "lyon",
            "construction_year": 1975,
            "heated_area_m2": 2500,
        }, headers=org_and_user["headers"])
        assert res.status_code == 200
        assert res.json()["name"] == "Bâtiment A — modifié"
        assert res.json()["city"] == "lyon"


class TestSystems:
    def test_create_system(self, client, org_and_user, project_and_building):
        bid = project_and_building["building"]["id"]
        res = client.post(f"/api/buildings/{bid}/systems", json={
            "building_id": bid,
            "system_type": "chauffage",
            "energy_source": "gaz",
            "nominal_power_kw": 120.0,
            "efficiency_nominal": 0.87,
            "installation_year": 2005,
        }, headers=org_and_user["headers"])
        assert res.status_code == 201
        assert res.json()["system_type"] == "chauffage"

    def test_list_systems(self, client, org_and_user, project_and_building):
        bid = project_and_building["building"]["id"]
        headers = org_and_user["headers"]
        client.post(f"/api/buildings/{bid}/systems", json={"building_id": bid, "system_type": "chauffage", "energy_source": "gaz"}, headers=headers)
        client.post(f"/api/buildings/{bid}/systems", json={"building_id": bid, "system_type": "ecs", "energy_source": "gaz"}, headers=headers)
        res = client.get(f"/api/buildings/{bid}/systems", headers=headers)
        assert len(res.json()) == 2


class TestEnvelopes:
    def test_create_envelope(self, client, org_and_user, project_and_building):
        bid = project_and_building["building"]["id"]
        res = client.post(f"/api/buildings/{bid}/envelopes", json={
            "building_id": bid,
            "element_type": "mur",
            "surface_m2": 1800.0,
            "u_value": 1.5,
            "orientation": "N",
            "condition_state": "moyen",
        }, headers=org_and_user["headers"])
        assert res.status_code == 201
        assert res.json()["u_value"] == 1.5

    def test_list_envelopes(self, client, org_and_user, project_and_building):
        bid = project_and_building["building"]["id"]
        headers = org_and_user["headers"]
        for elem in ["mur", "toiture", "plancher_bas"]:
            client.post(f"/api/buildings/{bid}/envelopes", json={
                "building_id": bid, "element_type": elem, "surface_m2": 300.0, "u_value": 1.0
            }, headers=headers)
        res = client.get(f"/api/buildings/{bid}/envelopes", headers=headers)
        assert len(res.json()) == 3


class TestEnergyBills:
    def test_create_bill(self, client, org_and_user, project_and_building):
        bid = project_and_building["building"]["id"]
        res = client.post(f"/api/buildings/{bid}/bills", json={
            "building_id": bid,
            "billing_period_start": "2023-01-01",
            "billing_period_end": "2023-12-31",
            "energy_type": "gaz",
            "consumption_kwh": 450000.0,
            "cost_eur_ttc": 38700.0,
        }, headers=org_and_user["headers"])
        assert res.status_code == 201
        assert res.json()["consumption_kwh"] == 450000.0

    def test_list_bills(self, client, org_and_user, project_and_building):
        bid = project_and_building["building"]["id"]
        headers = org_and_user["headers"]
        for year in ["2022", "2023"]:
            client.post(f"/api/buildings/{bid}/bills", json={
                "building_id": bid,
                "billing_period_start": f"{year}-01-01",
                "billing_period_end": f"{year}-12-31",
                "energy_type": "gaz",
                "consumption_kwh": 400000.0,
            }, headers=headers)
        res = client.get(f"/api/buildings/{bid}/bills", headers=headers)
        assert len(res.json()) == 2
