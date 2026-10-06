from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    json_data = response.json()
    assert "Welcome to SkillBridge AI Engine API" in json_data["message"]
    assert json_data["docs"] == "/docs"

def test_health_check_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "online"
    assert json_data["service"] == "SkillBridge AI"
    assert "services" in json_data
