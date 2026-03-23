import { create } from 'zustand'
import type { Conversation, Message } from '../types/conversation'

interface ConversationHistoryState {
  conversations: Conversation[]
  messagesByConversationId: Record<string, Message[]>
  setConversations: (conversations: Conversation[]) => void
  setMessages: (conversationId: string, messages: Message[]) => void
}

export const useConversationHistoryStore = create<ConversationHistoryState>((set) => ({
  conversations: [],
  messagesByConversationId: {},
  setConversations: (conversations) => set({ conversations }),
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messagesByConversationId: {
        ...state.messagesByConversationId,
        [conversationId]: messages,
      },
    })),
}))
