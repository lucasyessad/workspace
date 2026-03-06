"""
Tests — Génération et vérification de clés API
"""
import pytest
from app.api.routes.api_keys import _generate_key, _hash_key, _verify_key, KEY_PREFIX


class TestKeyGeneration:
    def test_key_starts_with_prefix(self):
        full_key, _, _ = _generate_key()
        assert full_key.startswith(KEY_PREFIX)

    def test_prefix_is_16_chars(self):
        _, prefix, _ = _generate_key()
        assert len(prefix) == 16

    def test_keys_are_unique(self):
        keys = {_generate_key()[0] for _ in range(100)}
        assert len(keys) == 100

    def test_hash_is_hex_string(self):
        _, _, h = _generate_key()
        assert len(h) == 64  # SHA-256 hex = 64 chars
        int(h, 16)  # Should not raise

    def test_verify_correct_key(self):
        full_key, _, key_hash = _generate_key()
        assert _verify_key(full_key, key_hash)

    def test_verify_wrong_key_fails(self):
        _, _, key_hash = _generate_key()
        assert not _verify_key("wrong_key_totally_invalid", key_hash)

    def test_verify_different_keys_different_hashes(self):
        k1, _, h1 = _generate_key()
        k2, _, h2 = _generate_key()
        assert h1 != h2
        assert not _verify_key(k1, h2)
        assert not _verify_key(k2, h1)

    def test_hash_deterministic(self):
        h1 = _hash_key("test_key_123")
        h2 = _hash_key("test_key_123")
        assert h1 == h2

    def test_hash_different_inputs(self):
        assert _hash_key("key_a") != _hash_key("key_b")


class TestApiKeyRoutes:
    def test_list_keys_requires_enterprise(self, client, org_and_user):
        """Starter plan should get 403."""
        res = client.get("/api/apikeys", headers=org_and_user["headers"])
        assert res.status_code == 403
        assert "Enterprise" in res.json()["detail"]

    def test_create_key_requires_enterprise(self, client, org_and_user):
        res = client.post(
            "/api/apikeys",
            json={"name": "Test Key"},
            headers=org_and_user["headers"],
        )
        assert res.status_code == 403

    def test_enterprise_can_list_keys(self, client, org_and_user):
        headers = org_and_user["headers"]
        client.post("/api/billing/upgrade", json={"plan": "enterprise"}, headers=headers)
        res = client.get("/api/apikeys", headers=headers)
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_enterprise_can_create_key(self, client, org_and_user):
        headers = org_and_user["headers"]
        client.post("/api/billing/upgrade", json={"plan": "enterprise"}, headers=headers)
        res = client.post("/api/apikeys", json={"name": "CI/CD Key"}, headers=headers)
        assert res.status_code == 201
        data = res.json()
        assert data["name"] == "CI/CD Key"
        assert "full_key" in data
        assert data["full_key"].startswith(KEY_PREFIX)

    def test_created_key_appears_in_list(self, client, org_and_user):
        headers = org_and_user["headers"]
        client.post("/api/billing/upgrade", json={"plan": "enterprise"}, headers=headers)
        client.post("/api/apikeys", json={"name": "My Key"}, headers=headers)
        keys = client.get("/api/apikeys", headers=headers).json()
        assert any(k["name"] == "My Key" for k in keys)

    def test_full_key_not_in_list(self, client, org_and_user):
        """full_key should only be returned at creation time, not in list."""
        headers = org_and_user["headers"]
        client.post("/api/billing/upgrade", json={"plan": "enterprise"}, headers=headers)
        client.post("/api/apikeys", json={"name": "Secret Key"}, headers=headers)
        keys = client.get("/api/apikeys", headers=headers).json()
        for k in keys:
            assert "full_key" not in k

    def test_revoke_key(self, client, org_and_user):
        headers = org_and_user["headers"]
        client.post("/api/billing/upgrade", json={"plan": "enterprise"}, headers=headers)
        created = client.post("/api/apikeys", json={"name": "Temp Key"}, headers=headers).json()
        res = client.delete(f"/api/apikeys/{created['id']}", headers=headers)
        assert res.status_code == 204

    def test_revoked_key_not_in_list(self, client, org_and_user):
        headers = org_and_user["headers"]
        client.post("/api/billing/upgrade", json={"plan": "enterprise"}, headers=headers)
        created = client.post("/api/apikeys", json={"name": "Temp Key"}, headers=headers).json()
        client.delete(f"/api/apikeys/{created['id']}", headers=headers)
        keys = client.get("/api/apikeys", headers=headers).json()
        assert not any(k["id"] == created["id"] for k in keys)

    def test_enterprise_key_limit(self, client, org_and_user):
        """Enterprise plan allows max 10 API keys."""
        from app.models.organization import PLAN_LIMITS
        limit = PLAN_LIMITS["enterprise"]["api_keys"]
        headers = org_and_user["headers"]
        client.post("/api/billing/upgrade", json={"plan": "enterprise"}, headers=headers)
        for i in range(limit):
            res = client.post("/api/apikeys", json={"name": f"Key {i}"}, headers=headers)
            assert res.status_code == 201

        # One more should fail
        res = client.post("/api/apikeys", json={"name": "Key overflow"}, headers=headers)
        assert res.status_code == 400
