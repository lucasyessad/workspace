"""
Fixtures partagées pour les tests d'intégration.
Utilise une base de données SQLite en mémoire.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

# Base SQLite en mémoire pour les tests
TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function", autouse=True)
def setup_db():
    """Recrée les tables avant chaque test, les supprime après."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def org_and_user(client):
    """Crée une organisation + un utilisateur et retourne le token JWT."""
    # Organisation
    org_res = client.post("/api/auth/organizations", json={
        "name": "Syndic Test",
        "slug": "syndic-test",
        "organization_type": "syndic",
        "billing_email": "test@syndic.fr",
    })
    assert org_res.status_code == 201
    org = org_res.json()

    # Utilisateur
    user_res = client.post("/api/auth/register", json={
        "email": "alice@syndic.fr",
        "password": "motdepasse123",
        "first_name": "Alice",
        "last_name": "Dupont",
        "organization_id": org["id"],
    })
    assert user_res.status_code == 201
    data = user_res.json()

    return {
        "org": org,
        "user": data["user"],
        "token": data["access_token"],
        "headers": {"Authorization": f"Bearer {data['access_token']}"},
    }


@pytest.fixture
def project_and_building(client, org_and_user):
    """Crée un projet + un bâtiment."""
    headers = org_and_user["headers"]

    proj = client.post("/api/buildings/projects", json={
        "name": "Résidence Les Iris",
        "project_status": "active",
    }, headers=headers)
    assert proj.status_code == 201

    building = client.post("/api/buildings", json={
        "project_id": proj.json()["id"],
        "name": "Bâtiment A",
        "city": "paris",
        "postal_code": "75011",
        "construction_year": 1975,
        "heated_area_m2": 2500,
        "floors_above_ground": 8,
        "building_type": "collectif",
    }, headers=headers)
    assert building.status_code == 201

    return {
        "project": proj.json(),
        "building": building.json(),
    }
