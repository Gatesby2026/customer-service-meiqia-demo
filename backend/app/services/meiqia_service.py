"""
美洽 API 统一封装。
所有对 api.meiqia.com 的调用都从这里发出，token 缓存在此管理。
"""
import time
import logging
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

_token_cache: dict[str, Any] = {"token": None, "expires_at": 0}


async def get_access_token() -> str:
    """获取 access token，带内存缓存（到期前 5 分钟刷新）。"""
    now = time.time()
    if _token_cache["token"] and now < _token_cache["expires_at"] - 300:
        return _token_cache["token"]

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{settings.meiqia_api_host}/2.0/token",
            json={"app_id": settings.meiqia_app_id, "app_secret": settings.meiqia_app_secret},
        )
        resp.raise_for_status()
        data = resp.json()

    token: str = data["data"]["token"]
    expires_in: int = data["data"].get("expires_in", 7200)
    _token_cache["token"] = token
    _token_cache["expires_at"] = now + expires_in
    logger.info("美洽 access token 已刷新")
    return token
