import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { frontendEnv } from "@/lib/env";
import type {
  ChatConversation,
  ChatConversationCreatePayload,
  ChatConversationDetail,
  ChatPendingAction,
  ChatPendingActionDecisionPayload,
} from "@/types";

export const chatConversationsQueryKey = ["chat", "conversations"] as const;

export function chatConversationQueryKey(conversationId: string | null) {
  return ["chat", "conversation", conversationId] as const;
}

export async function fetchChatConversations() {
  const { data } = await api.get<ChatConversation[]>("/chat/conversations");
  return data;
}

export async function fetchChatConversation(conversationId: string) {
  const { data } = await api.get<ChatConversationDetail>(
    `/chat/conversations/${conversationId}`,
  );
  return data;
}

export function useChatConversations(enabled = true) {
  return useQuery({
    queryKey: chatConversationsQueryKey,
    queryFn: fetchChatConversations,
    enabled,
  });
}

export function useChatConversation(
  conversationId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: chatConversationQueryKey(conversationId),
    queryFn: async () => {
      if (!conversationId) {
        throw new Error("conversationId is required");
      }

      return fetchChatConversation(conversationId);
    },
    enabled: enabled && Boolean(conversationId),
  });
}

export function useCreateChatConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ChatConversationCreatePayload = {}) => {
      const { data } = await api.post<ChatConversation>(
        "/chat/conversations",
        payload,
      );
      return data;
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: chatConversationsQueryKey });
      queryClient.setQueryData(chatConversationQueryKey(conversation.id), {
        conversation,
        messages: [],
        pending_actions: [],
      } satisfies ChatConversationDetail);
    },
  });
}

export function useDeleteChatConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      await api.delete(`/chat/conversations/${conversationId}`);
      return conversationId;
    },
    onSuccess: (conversationId) => {
      queryClient.invalidateQueries({ queryKey: chatConversationsQueryKey });
      queryClient.removeQueries({
        queryKey: chatConversationQueryKey(conversationId),
      });
    },
  });
}

export function useDecideChatPendingAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      pendingActionId,
      payload,
    }: {
      pendingActionId: string;
      payload: ChatPendingActionDecisionPayload;
    }) => {
      const { data } = await api.post<ChatPendingAction>(
        `/chat/pending-actions/${pendingActionId}/decision`,
        payload,
      );
      return data;
    },
    onSuccess: (pendingAction) => {
      queryClient.invalidateQueries({ queryKey: chatConversationsQueryKey });
      queryClient.invalidateQueries({
        queryKey: chatConversationQueryKey(pendingAction.conversation_id),
      });
    },
  });
}

export function buildChatWebSocketUrl(token: string) {
  const apiUrl = new URL(frontendEnv.apiBaseUrl);
  const protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = new URL("/api/v1/chat/ws", `${protocol}//${apiUrl.host}`);
  wsUrl.searchParams.set("token", token);
  return wsUrl.toString();
}
