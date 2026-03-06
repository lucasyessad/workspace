"""
Tests — Plans d'abonnement, quota audits et upgrades
"""
import pytest
from app.models.organization import PLAN_LIMITS


# ─── Unit tests PLAN_LIMITS ────────────────────────────────────────────────────

class TestPlanLimits:
    def test_starter_has_audit_limit(self):
        assert PLAN_LIMITS["starter"]["audits_per_month"] == 10

    def test_pro_has_unlimited_audits(self):
        assert PLAN_LIMITS["pro"]["audits_per_month"] == -1

    def test_enterprise_has_api_keys(self):
        assert PLAN_LIMITS["enterprise"]["api_keys"] > 0

    def test_starter_has_no_api_keys(self):
        assert PLAN_LIMITS["starter"]["api_keys"] == 0


# ─── Integration tests ─────────────────────────────────────────────────────────

class TestBillingRoutes:
    def test_get_plans_returns_all(self, client, org_and_user):
        res = client.get("/api/billing/plans")
        assert res.status_code == 200
        plans = res.json()
        plan_ids = [p["id"] for p in plans]
        assert "starter" in plan_ids
        assert "pro" in plan_ids
        assert "enterprise" in plan_ids

    def test_get_subscription_default_starter(self, client, org_and_user):
        res = client.get("/api/billing/subscription", headers=org_and_user["headers"])
        assert res.status_code == 200
        data = res.json()
        assert data["plan"] == "starter"
        assert data["usage"]["audits_limit"] == 10

    def test_upgrade_to_pro(self, client, org_and_user):
        res = client.post(
            "/api/billing/upgrade",
            json={"plan": "pro"},
            headers=org_and_user["headers"],
        )
        assert res.status_code == 200
        assert res.json()["new_plan"] == "pro"

    def test_subscription_after_upgrade(self, client, org_and_user):
        client.post("/api/billing/upgrade", json={"plan": "pro"}, headers=org_and_user["headers"])
        res = client.get("/api/billing/subscription", headers=org_and_user["headers"])
        assert res.json()["plan"] == "pro"
        assert res.json()["usage"]["audits_limit"] == -1

    def test_upgrade_to_unknown_plan_fails(self, client, org_and_user):
        res = client.post(
            "/api/billing/upgrade",
            json={"plan": "diamond"},
            headers=org_and_user["headers"],
        )
        assert res.status_code == 400

    def test_plan_features_present(self, client, org_and_user):
        res = client.get("/api/billing/plans")
        for plan in res.json():
            assert isinstance(plan["features"], list)
            assert len(plan["features"]) > 0


class TestAuditQuota:
    """Test that the monthly audit limit is enforced."""

    def test_starter_blocked_after_10_audits(self, client, org_and_user, project_and_building):
        headers = org_and_user["headers"]
        bid = project_and_building["building"]["id"]
        pid = project_and_building["project"]["id"]
        payload = {"building_id": bid, "project_id": pid, "audit_type": "standard"}

        # Create 10 audits — all should succeed
        for i in range(10):
            res = client.post("/api/audits", json=payload, headers=headers)
            assert res.status_code == 201, f"Audit {i+1} should succeed, got {res.status_code}"

        # 11th audit must be blocked (429 Too Many Requests)
        res = client.post("/api/audits", json=payload, headers=headers)
        assert res.status_code == 429
        assert "Limite" in res.json()["detail"]

    def test_pro_plan_unlimited_audits(self, client, org_and_user, project_and_building):
        headers = org_and_user["headers"]
        # Upgrade to pro
        client.post("/api/billing/upgrade", json={"plan": "pro"}, headers=headers)

        bid = project_and_building["building"]["id"]
        pid = project_and_building["project"]["id"]
        payload = {"building_id": bid, "project_id": pid, "audit_type": "standard"}

        # Create 15 audits — should all succeed on Pro
        for i in range(15):
            res = client.post("/api/audits", json=payload, headers=headers)
            assert res.status_code == 201, f"Pro audit {i+1} failed: {res.json()}"

    def test_quota_counter_increments(self, client, org_and_user, project_and_building):
        headers = org_and_user["headers"]
        bid = project_and_building["building"]["id"]
        pid = project_and_building["project"]["id"]

        # Create 3 audits
        for _ in range(3):
            client.post("/api/audits", json={"building_id": bid, "project_id": pid}, headers=headers)

        sub = client.get("/api/billing/subscription", headers=headers).json()
        assert sub["usage"]["audits_this_month"] == 3
        assert sub["usage"]["audits_remaining"] == 7
