from fastapi import APIRouter, HTTPException, Query
from app.services import conversation_service

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.get("")
async def get_conversations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    start_time: str | None = Query(None),
    end_time: str | None = Query(None),
    agent_id: str | None = Query(None),
    status: str | None = Query(None, pattern="^(open|closed)$"),
):
    try:
        return await conversation_service.list_conversations(
            page=page,
            page_size=page_size,
            start_time=start_time,
            end_time=end_time,
            agent_id=agent_id,
            status=status,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/{conversation_id}")
async def get_conversation(conversation_id: str):
    try:
        return await conversation_service.get_conversation(conversation_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.get("/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
):
    try:
        return await conversation_service.list_messages(conversation_id, page, page_size)
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
