"""会话 API 路由测试（mock 美洽 API 调用）。"""
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_get_conversations_proxies_to_meiqia():
    mock_response = {"data": [], "total": 0, "page": 1, "page_size": 20}
    with patch(
        "app.routers.conversations.conversation_service.list_conversations",
        new_callable=AsyncMock,
        return_value=mock_response,
    ):
        response = client.get("/api/conversations")
    assert response.status_code == 200
    assert response.json() == mock_response
