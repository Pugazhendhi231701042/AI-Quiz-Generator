import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import Base, engine

@pytest.mark.asyncio
async def test_register_and_login_flow():
    # Setup test database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    unique_email = f"test_{uuid.uuid4().hex[:8]}@university.edu"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Register new user
        reg_response = await ac.post("/api/auth/register", json={
            "name": "Test Student",
            "email": unique_email,
            "password": "secretpassword123"
        })
        assert reg_response.status_code == 201
        reg_data = reg_response.json()
        assert reg_data["email"] == unique_email
        assert "id" in reg_data

        # 2. Login user
        login_response = await ac.post("/api/auth/login", data={
            "username": unique_email,
            "password": "secretpassword123"
        })
        assert login_response.status_code == 200
        token_data = login_response.json()
        assert "access_token" in token_data
        token = token_data["access_token"]

        # 3. Get /me endpoint
        me_response = await ac.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me_response.status_code == 200
        me_data = me_response.json()
        assert me_data["name"] == "Test Student"
