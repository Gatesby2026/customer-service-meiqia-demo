from typing import Literal
from pydantic import BaseModel


class Conversation(BaseModel):
    id: str
    status: Literal["open", "closed"]
    startedAt: str
    endedAt: str | None
    agentName: str
    customerName: str
    messageCount: int


class Message(BaseModel):
    id: str
    conversationId: str
    type: Literal["text", "image", "file", "system_event"]
    content: str
    senderRole: Literal["customer", "agent", "system"]
    sentAt: str


class PaginatedConversations(BaseModel):
    data: list[Conversation]
    total: int
    page: int
    page_size: int


class PaginatedMessages(BaseModel):
    data: list[Message]
    total: int
    page: int
    page_size: int
