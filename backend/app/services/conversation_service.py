"""历史会话业务逻辑：调用美洽 API 并转换数据格式。"""
from typing import Any

import httpx

from app.config import settings
from app.services.meiqia_service import get_access_token


async def list_conversations(
    page: int = 1,
    page_size: int = 20,
    start_time: str | None = None,
    end_time: str | None = None,
    agent_id: str | None = None,
    status: str | None = None,
) -> dict[str, Any]:
    token = await get_access_token()
    params: dict[str, Any] = {"page": page, "page_size": page_size}
    if start_time:
        params["start_time"] = start_time
    if end_time:
        params["end_time"] = end_time
    if agent_id:
        params["agent_id"] = agent_id
    if status:
        params["status"] = status

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{settings.meiqia_api_host}/2.0/conversations",
            headers={"Authorization": f"Bearer {token}"},
            params=params,
        )
        resp.raise_for_status()
    return resp.json()


async def get_conversation(conversation_id: str) -> dict[str, Any]:
    token = await get_access_token()
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{settings.meiqia_api_host}/2.0/conversation/{conversation_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        resp.raise_for_status()
    return resp.json()


async def list_messages(
    conversation_id: str, page: int = 1, page_size: int = 50
) -> dict[str, Any]:
    token = await get_access_token()
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{settings.meiqia_api_host}/2.0/conversation/{conversation_id}/messages",
            headers={"Authorization": f"Bearer {token}"},
            params={"page": page, "page_size": page_size},
        )
        resp.raise_for_status()
    return resp.json()
