import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";

import { buildChatWebSocketUrl } from "@/api/chat";
import type { ChatSendMessagePayload, ChatStreamEvent } from "@/types";

type ConnectionState = "idle" | "connecting" | "open" | "closed" | "error";

type UseChatWebSocketOptions = {
  enabled: boolean;
  onEvent: (event: ChatStreamEvent) => void;
};

export function useChatWebSocket({
  enabled,
  onEvent,
}: UseChatWebSocketOptions) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(false);
  const onEventRef = useRef(onEvent);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    shouldReconnectRef.current = enabled;

    function clearReconnectTimer() {
      if (reconnectTimerRef.current) {
        globalThis.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    }

    async function connect() {
      if (!enabled || !isLoaded || !isSignedIn || socketRef.current) {
        return;
      }

      const token = await getToken();
      if (!token) {
        setConnectionState("error");
        return;
      }

      setConnectionState("connecting");
      const socket = new WebSocket(buildChatWebSocketUrl(token));
      socketRef.current = socket;

      function reconnect() {
        void connect();
      }

      socket.addEventListener("open", () => {
        setConnectionState("open");
      });

      socket.addEventListener("message", (nativeEvent) => {
        const payload = JSON.parse(nativeEvent.data) as ChatStreamEvent;
        onEventRef.current(payload);
      });

      socket.addEventListener("close", () => {
        socketRef.current = null;
        setConnectionState("closed");

        if (!shouldReconnectRef.current) {
          return;
        }

        reconnectTimerRef.current = globalThis.setTimeout(reconnect, 1500);
      });

      socket.addEventListener("error", () => {
        setConnectionState("error");
      });
    }

    if (!enabled) {
      clearReconnectTimer();

      socketRef.current?.close();
      socketRef.current = null;
      setConnectionState("idle");
      return;
    }

    void connect();

    return () => {
      shouldReconnectRef.current = false;
      clearReconnectTimer();
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [enabled, getToken, isLoaded, isSignedIn]);

  const sendMessage = (payload: ChatSendMessagePayload) => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) {
      throw new Error("Chat socket is not connected.");
    }

    socketRef.current.send(JSON.stringify(payload));
  };

  return {
    connectionState,
    sendMessage,
  };
}
