export type ChatRole = "system" | "user" | "assistant" | "tool";
export type ChatMessageStatus =
  | "streaming"
  | "completed"
  | "error"
  | "waiting_confirmation";
export type ChatPendingStatus = "pending" | "approved" | "rejected" | "expired";
export type ChatEventType =
  | "conversation_ready"
  | "message_started"
  | "delta"
  | "tool_call_started"
  | "tool_call_result"
  | "confirmation_required"
  | "message_completed"
  | "error";

export interface ChatConversation {
  id: string;
  clinic_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  clinic_id: string;
  user_id: string;
  role: ChatRole;
  content: string;
  status: ChatMessageStatus;
  metadata_json?: {
    tool_names?: string[];
    pending_action_id?: string | null;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface ChatToolCall {
  id: string;
  conversation_id: string;
  message_id?: string | null;
  tool_name: string;
  arguments_json: Record<string, unknown>;
  result_json?: Record<string, unknown> | null;
  status: string;
  confirmation_required: boolean;
  created_at: string;
  completed_at?: string | null;
}

export interface ChatPendingAction {
  id: string;
  conversation_id: string;
  tool_call_id: string;
  tool_name: string;
  summary: string;
  arguments_json: Record<string, unknown>;
  status: ChatPendingStatus;
  confirmation_message?: string | null;
  created_at: string;
  resolved_at?: string | null;
  sequence_number: number;
}

export interface ChatConversationDetail {
  conversation: ChatConversation;
  messages: ChatMessage[];
  pending_actions: ChatPendingAction[];
}

export interface ChatConversationCreatePayload {
  title?: string | null;
}

export interface ChatPendingActionDecisionPayload {
  approved: boolean;
  message?: string | null;
}

export interface ChatSendMessagePayload {
  conversation_id?: string | null;
  content: string;
}

export interface ChatStreamEvent {
  type: ChatEventType;
  conversation_id: string;
  message_id?: string | null;
  payload: Record<string, unknown>;
}
