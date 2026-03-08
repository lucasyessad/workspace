"""
Tests d'intégration — Authentification & Organisations
"""


class TestOrganizations:
    def test_create_organization(self, client):
        res = client.post("/api/auth/organizations", json={
            "name": "Bailleur Nord",
            "slug": "bailleur-nord",
            "organization_type": "bailleur",
        })
        assert res.status_code == 201
        data = res.json()
        assert data["slug"] == "bailleur-nord"
        assert data["is_active"] is True

    def test_duplicate_slug_rejected(self, client):
        payload = {"name": "Org A", "slug": "same-slug", "organization_type": "syndic"}
        client.post("/api/auth/organizations", json=payload)
        res = client.post("/api/auth/organizations", json=payload)
        assert res.status_code == 400

    def test_organization_requires_name(self, client):
        res = client.post("/api/auth/organizations", json={"slug": "no-name", "organization_type": "syndic"})
        assert res.status_code == 422


class TestRegisterLogin:
    def test_register_success(self, client, org_and_user):
        assert "token" in org_and_user
        assert org_and_user["user"]["email"] == "alice@syndic.fr"

    def test_login_success(self, client, org_and_user):
        res = client.post("/api/auth/login", json={
            "email": "alice@syndic.fr",
            "password": "motdepasse123",
        })
        assert res.status_code == 200
        assert "access_token" in res.json()

    def test_login_wrong_password(self, client, org_and_user):
        res = client.post("/api/auth/login", json={
            "email": "alice@syndic.fr",
            "password": "mauvais_mot_de_passe",
        })
        assert res.status_code == 401

    def test_login_unknown_email(self, client):
        res = client.post("/api/auth/login", json={
            "email": "inconnu@example.com",
            "password": "test",
        })
        assert res.status_code == 401

    def test_duplicate_email_rejected(self, client, org_and_user):
        res = client.post("/api/auth/register", json={
            "email": "alice@syndic.fr",
            "password": "autremdp",
            "organization_id": org_and_user["org"]["id"],
        })
        assert res.status_code == 400

    def test_protected_route_requires_auth(self, client):
        res = client.get("/api/buildings")
        assert res.status_code == 401

    def test_protected_route_with_bad_token(self, client):
        res = client.get("/api/buildings", headers={"Authorization": "Bearer fake.token.here"})
        assert res.status_code == 401
