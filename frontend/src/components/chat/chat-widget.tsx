import { useEffect, useMemo, useRef, useState, startTransition } from "react";
import type { FormEvent } from "react";
import { Loader2Icon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  chatConversationQueryKey,
  chatConversationsQueryKey,
  useChatConversation,
  useChatConversations,
  useCreateChatConversation,
  useDeleteChatConversation,
  useDecideChatPendingAction,
} from "@/api/chat";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AssistantPet } from "@/components/brand/assistant-pet";
import {
  AlertIcon,
  ArrowLIcon,
  CalendarIcon,
  CheckIcon,
  EditIcon,
  OkIcon,
  OwnerIcon,
  PawIcon,
  SendIcon,
  SparkleIcon,
  TrashIcon,
  XIcon,
} from "@/components/icons/vetdata-icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChatWebSocket } from "@/hooks/use-chat-websocket";
import type {
  ChatConversation,
  ChatMessage,
  ChatPendingAction,
  ChatStreamEvent,
} from "@/types";

type PendingUserMessage = {
  id: string;
  content: string;
};

type StreamingAssistant = {
  id: string;
  content: string;
};

type ToolActivity = {
  id: string;
  label: string;
  status: "running" | "done";
};

type ProcessHistoryEntry = {
  messageId: string;
  steps: ToolActivity[];
};

const FETCH_STEP_ID = "fetch-step";
const THINKING_DOT_IDS = [0, 1, 2] as const;

function formatConversationTitle(conversation: ChatConversation) {
  return conversation.title?.trim() || "Nova conversa";
}

function formatConversationMetaLabel(conversation: ChatConversation) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(conversation.updated_at));
}

function ThinkingDots() {
  return (
    <div
      className="chat-thinking-dots"
      aria-label="Assistente pensando"
      aria-live="polite"
    >
      {THINKING_DOT_IDS.map((dotId) => (
        <span key={dotId} className="chat-thinking-dot" />
      ))}
    </div>
  );
}

const SUGGESTIONS = [
  { prompt: "Mostre os pacientes ativos", category: "Pacientes", Icon: PawIcon },
  {
    prompt: "Resumo das sessões de hoje",
    category: "Agenda",
    Icon: CalendarIcon,
  },
  { prompt: "Alertas críticos?", category: "Alertas", Icon: AlertIcon },
  {
    prompt: "Mostre os tutores cadastrados",
    category: "Tutores",
    Icon: OwnerIcon,
  },
] as const;

// Local id for an optimistic user message. Called from event handlers only.
const localMessageId = () => `local-${Date.now()}`;

const iconButtonClass =
  "grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-stone-600 transition-colors duration-150 outline-none hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-forest-900/12 disabled:pointer-events-none disabled:opacity-50";

function AiAvatar() {
  return (
    <span
      aria-hidden="true"
      className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-lemon-300"
    >
      <SparkleIcon size={15} />
    </span>
  );
}

function StepLine({ step }: { step: ToolActivity }) {
  return (
    <div className="inline-flex items-center gap-2 text-[12.5px] leading-5 text-muted-foreground">
      {step.status === "done" ? (
        <OkIcon size={14} className="text-success" />
      ) : (
        <Loader2Icon className="size-3.5 animate-spin" />
      )}
      {step.label}
    </div>
  );
}

const composerFormClass =
  "flex flex-col gap-1.5 rounded-[20px] border border-input bg-card px-2.5 pt-2.5 pb-2 transition-[border-color,box-shadow] duration-150 focus-within:border-forest-600 focus-within:ring-[3px] focus-within:ring-forest-900/10";

/** Composer fields; render inside a <form className={composerFormClass}>. */
function ComposerFields({
  value,
  onChange,
  canSend,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  canSend: boolean;
  placeholder: string;
}) {
  return (
    <>
      <textarea
        value={value}
        rows={2}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (canSend) {
              event.currentTarget.form?.requestSubmit();
            }
          }
        }}
        placeholder={placeholder}
        aria-label="Mensagem para o assistente"
        className="field-sizing-content max-h-48 min-h-12 w-full resize-none border-0 bg-transparent px-1.5 py-1 text-[15px] leading-normal text-foreground placeholder:text-stone-500 focus:outline-none"
      />
      <div className="flex items-center gap-0.5">
        <span className="mr-2 ml-auto text-[11.5px] text-stone-500 max-sm:hidden">
          ↵ enviar · ⇧↵ nova linha
        </span>
        <button
          type="submit"
          disabled={!canSend}
          className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full bg-primary text-primary-foreground transition-colors duration-150 outline-none hover:bg-forest-800 focus-visible:ring-[3px] focus-visible:ring-forest-900/12 disabled:pointer-events-none disabled:bg-cream-300 disabled:text-stone-400 max-sm:ml-auto"
        >
          <SendIcon size={16} strokeWidth={2.25} />
          <span className="sr-only">Enviar</span>
        </button>
      </div>
    </>
  );
}

function Disclaimer() {
  return (
    <p className="mt-2 text-center text-[11.5px] text-stone-500">
      O Assistente VetData pode cometer erros. Confira as doses antes de
      administrar.
    </p>
  );
}

export function ChatWidget() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"home" | "chat">("home");
  const [draft, setDraft] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [pendingUserMessages, setPendingUserMessages] = useState<
    PendingUserMessage[]
  >([]);
  const [streamingAssistant, setStreamingAssistant] =
    useState<StreamingAssistant | null>(null);
  const [toolActivity, setToolActivity] = useState<ToolActivity[]>([]);
  const [processHistory, setProcessHistory] = useState<ProcessHistoryEntry[]>(
    [],
  );
  const [conversationPendingDeletion, setConversationPendingDeletion] =
    useState<ChatConversation | null>(null);
  const transcriptBottomRef = useRef<HTMLDivElement | null>(null);

  const conversationsQuery = useChatConversations(open);
  const conversationQuery = useChatConversation(activeConversationId, open);
  const createConversation = useCreateChatConversation();
  const deleteConversation = useDeleteChatConversation();
  const decidePendingAction = useDecideChatPendingAction();

  const upsertToolActivity = (entry: ToolActivity) => {
    setToolActivity((current) => {
      const existingIndex = current.findIndex((item) => item.id === entry.id);

      if (existingIndex === -1) {
        return [...current, entry];
      }

      return current.map((item) => (item.id === entry.id ? entry : item));
    });
  };

  useEffect(() => {
    if (activeConversationId || !conversationsQuery.data?.length) {
      return;
    }

    setActiveConversationId(conversationsQuery.data[0].id);
  }, [activeConversationId, conversationsQuery.data]);

  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [
    conversationQuery.data?.messages,
    pendingUserMessages,
    streamingAssistant,
    toolActivity,
  ]);

  const handleEvent = (event: ChatStreamEvent) => {
    startTransition(() => {
      switch (event.type) {
        case "conversation_ready": {
          const conversationId = event.conversation_id;
          setActiveConversationId(conversationId);
          setPendingUserMessages([]);
          queryClient.invalidateQueries({
            queryKey: chatConversationsQueryKey,
          });
          queryClient.invalidateQueries({
            queryKey: chatConversationQueryKey(conversationId),
          });
          break;
        }
        case "message_started": {
          if (!event.message_id) {
            break;
          }

          setStreamingAssistant({ id: event.message_id, content: "" });
          setToolActivity([]);
          break;
        }
        case "delta": {
          const nextText = String(event.payload.text ?? "");
          setToolActivity([]);
          setStreamingAssistant((current) =>
            current
              ? { ...current, content: `${current.content}${nextText}` }
              : null,
          );
          break;
        }
        case "tool_call_started": {
          upsertToolActivity({
            id: FETCH_STEP_ID,
            label: "Consultando dados da clínica",
            status: "running",
          });
          break;
        }
        case "tool_call_result": {
          upsertToolActivity({
            id: FETCH_STEP_ID,
            label: "Consultando dados da clínica",
            status: "done",
          });
          break;
        }
        case "confirmation_required": {
          setPendingUserMessages([]);
          setStreamingAssistant(null);
          queryClient.invalidateQueries({
            queryKey: chatConversationsQueryKey,
          });
          queryClient.invalidateQueries({
            queryKey: chatConversationQueryKey(event.conversation_id),
          });
          break;
        }
        case "message_completed": {
          setPendingUserMessages([]);
          const completedMessageId = event.message_id;

          if (completedMessageId && toolActivity.length) {
            setProcessHistory((current) => [
              ...current.filter(
                (entry) => entry.messageId !== completedMessageId,
              ),
              {
                messageId: completedMessageId,
                steps: toolActivity.map((entry) => ({
                  ...entry,
                  status: "done",
                })),
              },
            ]);
          }
          setStreamingAssistant(null);
          setToolActivity([]);
          queryClient.invalidateQueries({
            queryKey: chatConversationsQueryKey,
          });
          queryClient.invalidateQueries({
            queryKey: chatConversationQueryKey(event.conversation_id),
          });
          break;
        }
        case "error": {
          setPendingUserMessages([]);
          setStreamingAssistant(null);
          setToolActivity([]);
          if (event.conversation_id) {
            queryClient.invalidateQueries({
              queryKey: chatConversationQueryKey(event.conversation_id),
            });
          }
          toast.error(String(event.payload.message ?? "Falha no assistente."));
          break;
        }
        default:
          break;
      }
    });
  };

  const { connectionState, sendMessage } = useChatWebSocket({
    enabled: open,
    onEvent: handleEvent,
  });

  const persistedStreamingReplacement = useMemo(() => {
    if (!streamingAssistant) {
      return null;
    }

    return (conversationQuery.data?.messages ?? []).find(
      (message) =>
        message.id === streamingAssistant.id &&
        message.role === "assistant" &&
        (message.status !== "streaming" || Boolean(message.content.trim())),
    );
  }, [conversationQuery.data?.messages, streamingAssistant]);

  useEffect(() => {
    if (!persistedStreamingReplacement) {
      return;
    }

    setStreamingAssistant(null);
    setToolActivity([]);
  }, [persistedStreamingReplacement]);

  const combinedMessages = useMemo(() => {
    const persistedMessages = (conversationQuery.data?.messages ?? []).filter(
      (message) => {
        if (
          streamingAssistant &&
          message.id === streamingAssistant.id &&
          message.status === "streaming" &&
          !message.content.trim()
        ) {
          return false;
        }

        if (
          message.role === "assistant" &&
          message.status === "streaming" &&
          !message.content.trim()
        ) {
          return false;
        }

        return true;
      },
    );

    const localUserMessages: ChatMessage[] = pendingUserMessages.map(
      (message) => ({
        id: message.id,
        conversation_id: activeConversationId ?? "pending",
        clinic_id: "pending",
        user_id: "pending",
        role: "user",
        content: message.content,
        status: "completed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    );

    return [...persistedMessages, ...localUserMessages];
  }, [
    activeConversationId,
    conversationQuery.data?.messages,
    pendingUserMessages,
    streamingAssistant,
  ]);

  const pendingActions = useMemo(
    () =>
      (conversationQuery.data?.pending_actions ?? []).filter(
        (action) => action.status === "pending",
      ),
    [conversationQuery.data?.pending_actions],
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) {
      return;
    }

    if (connectionState !== "open") {
      toast.error(
        "O chat ainda está conectando. Tente novamente em instantes.",
      );
      return;
    }

    setPendingUserMessages((current) => [
      ...current,
      { id: `local-${Date.now()}`, content },
    ]);
    setDraft("");

    try {
      sendMessage({
        conversation_id: activeConversationId,
        content,
      });
    } catch (error) {
      console.error(error);
      setPendingUserMessages([]);
      toast.error("Não foi possível enviar a mensagem para o assistente.");
    }
  };

  const handleNewConversation = async () => {
    try {
      const conversation = await createConversation.mutateAsync({});
      setActiveConversationId(conversation.id);
      setView("chat");
      setPendingUserMessages([]);
      setStreamingAssistant(null);
      setToolActivity([]);
      setProcessHistory([]);
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível iniciar uma nova conversa.");
    }
  };

  const handleStartNewFromHome = async (initialPrompt: string) => {
    if (!initialPrompt.trim()) return;
    if (connectionState !== "open") {
      toast.error(
        "O chat ainda está conectando. Tente novamente em instantes.",
      );
      return;
    }

    try {
      const conversation = await createConversation.mutateAsync({});
      setActiveConversationId(conversation.id);
      setView("chat");
      setPendingUserMessages([
        { id: localMessageId(), content: initialPrompt },
      ]);
      setStreamingAssistant(null);
      setToolActivity([]);
      setProcessHistory([]);

      sendMessage({
        conversation_id: conversation.id,
        content: initialPrompt,
      });
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível iniciar a conversa.");
    }
  };

  const handleDecision = async (
    pendingAction: ChatPendingAction,
    approved: boolean,
  ) => {
    try {
      await decidePendingAction.mutateAsync({
        pendingActionId: pendingAction.id,
        payload: {
          approved,
          message: approved
            ? "Ação aprovada pelo usuário na interface do chat."
            : "Ação rejeitada pelo usuário na interface do chat.",
        },
      });
      toast.success(
        approved ? "Ação confirmada." : "Ação rejeitada pelo usuário.",
      );
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível registrar sua decisão.");
    }
  };

  const handleConfirmDeleteConversation = async () => {
    if (!conversationPendingDeletion) {
      return;
    }

    const conversationId = conversationPendingDeletion.id;

    try {
      await deleteConversation.mutateAsync(conversationId);

      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setView("home");
        setDraft("");
        setPendingUserMessages([]);
        setStreamingAssistant(null);
        setToolActivity([]);
        setProcessHistory([]);
      }

      setConversationPendingDeletion(null);
      toast.success("Conversa excluída.");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível excluir a conversa.");
    }
  };

  const canSend = Boolean(draft.trim()) && connectionState === "open";

  return (
    <>
      <button
        type="button"
        className="fixed right-5 bottom-5 z-50 grid size-14 cursor-pointer place-items-center rounded-full bg-primary text-lemon-300 shadow-md transition-[background-color,transform] duration-150 ease-out outline-none hover:bg-forest-800 focus-visible:ring-[3px] focus-visible:ring-forest-900/20 active:scale-[0.97]"
        onClick={() => setOpen(true)}
      >
        <SparkleIcon size={22} />
        <span className="sr-only">Abrir assistente VetData</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-auto right-4 bottom-4 left-auto flex h-[min(85dvh,720px)] w-[calc(100vw-2rem)] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-[18px] border border-border bg-background p-0 text-foreground shadow-lg sm:w-[420px] sm:max-w-none"
        >
          <DialogTitle className="sr-only">Assistente VetData</DialogTitle>
          {view === "home" ? (
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
                <AiAvatar />
                <span className="flex-1 text-[14.5px] font-semibold">
                  Assistente VetData
                </span>
                <button
                  type="button"
                  className={iconButtonClass}
                  onClick={() => setOpen(false)}
                >
                  <XIcon />
                  <span className="sr-only">Fechar assistente</span>
                </button>
              </div>

              <ScrollArea className="min-h-0 flex-1">
                <div className="flex flex-col gap-5 px-[18px] py-5">
                  <div className="flex flex-col items-center text-center">
                    <AssistantPet background={false} className="w-28" />
                    <h3 className="mt-2 text-[22px] font-semibold">
                      Olá, sou o Assistente VetData!
                    </h3>
                    <p className="mt-1 max-w-[320px] text-sm text-muted-foreground">
                      Sua IA para a clínica. Posso buscar pacientes, analisar
                      sessões e preparar alterações.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {SUGGESTIONS.map(({ prompt, category, Icon }) => (
                      <button
                        key={prompt}
                        type="button"
                        className="grid cursor-pointer grid-cols-[16px_1fr] gap-2.5 rounded-lg border border-border bg-card p-3 text-left text-[13.5px] transition-colors duration-150 hover:bg-cream-200"
                        onClick={() => {
                          if (connectionState === "open") {
                            handleStartNewFromHome(prompt);
                          }
                        }}
                      >
                        <Icon size={16} className="mt-0.5 text-stone-600" />
                        <span className="flex flex-col gap-0.5">
                          <span className="leading-snug text-foreground">
                            {prompt}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {category}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>

                  <section className="flex flex-col gap-2">
                    <h4 className="px-1 text-[11px] font-semibold tracking-[0.08em] text-stone-500 uppercase">
                      Conversas recentes
                    </h4>
                    {conversationsQuery.data?.length ? (
                      <div className="flex flex-col gap-1.5">
                        {conversationsQuery.data
                          .slice(0, 6)
                          .map((conversation) => (
                            <div
                              key={conversation.id}
                              className="relative rounded-lg border border-border bg-card transition-colors duration-150 hover:bg-cream-200"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveConversationId(conversation.id);
                                  setView("chat");
                                }}
                                className="flex w-full cursor-pointer flex-col items-start px-3.5 py-2.5 pr-12 text-left"
                              >
                                <span className="w-full truncate text-[13.5px] font-semibold text-foreground">
                                  {formatConversationTitle(conversation)}
                                </span>
                                <span className="mt-0.5 w-full truncate text-xs text-muted-foreground tabular-nums">
                                  Atualizada em{" "}
                                  {formatConversationMetaLabel(conversation)}
                                </span>
                              </button>
                              <button
                                type="button"
                                className={cn(
                                  iconButtonClass,
                                  "absolute top-1/2 right-2 -translate-y-1/2 hover:text-destructive",
                                )}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setConversationPendingDeletion(conversation);
                                }}
                              >
                                <TrashIcon />
                                <span className="sr-only">
                                  Excluir conversa
                                </span>
                              </button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="px-1 text-[13px] text-muted-foreground">
                        Nenhuma conversa ainda. Faça uma pergunta abaixo para
                        começar.
                      </p>
                    )}
                  </section>
                </div>
              </ScrollArea>

              <div className="px-3.5 pt-1 pb-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (draft.trim() && connectionState === "open") {
                      handleStartNewFromHome(draft);
                      setDraft("");
                    }
                  }}
                  className={composerFormClass}
                >
                  <ComposerFields
                    value={draft}
                    onChange={setDraft}
                    canSend={canSend}
                    placeholder="Faça uma pergunta ou comando..."
                  />
                </form>
                <Disclaimer />
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex items-center gap-2.5 border-b border-border py-3 pr-4 pl-2.5">
                <button
                  type="button"
                  className={iconButtonClass}
                  onClick={() => setView("home")}
                >
                  <ArrowLIcon />
                  <span className="sr-only">Voltar</span>
                </button>
                <AiAvatar />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[14.5px] leading-tight font-semibold">
                    Assistente VetData
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {conversationQuery.data?.conversation
                      ? formatConversationTitle(
                          conversationQuery.data.conversation,
                        )
                      : "Nova conversa"}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {conversationQuery.data?.conversation ? (
                    <button
                      type="button"
                      title="Excluir conversa"
                      className={cn(iconButtonClass, "hover:text-destructive")}
                      onClick={() =>
                        setConversationPendingDeletion(
                          conversationQuery.data?.conversation ?? null,
                        )
                      }
                      disabled={deleteConversation.isPending}
                    >
                      <TrashIcon />
                      <span className="sr-only">Excluir conversa</span>
                    </button>
                  ) : null}
                  <button
                    type="button"
                    title="Nova conversa"
                    className={iconButtonClass}
                    onClick={handleNewConversation}
                    disabled={createConversation.isPending}
                  >
                    {createConversation.isPending ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <EditIcon />
                    )}
                    <span className="sr-only">Nova conversa</span>
                  </button>
                  <button
                    type="button"
                    className={iconButtonClass}
                    onClick={() => setOpen(false)}
                  >
                    <XIcon />
                    <span className="sr-only">Fechar assistente</span>
                  </button>
                </div>
              </div>

              <ScrollArea className="min-h-0 flex-1">
                <div className="flex flex-col gap-5 px-[18px] py-5">
                  {!combinedMessages.length && !conversationQuery.isLoading ? (
                    <div className="flex flex-col items-center py-4 text-center">
                      <AssistantPet background={false} className="w-28" />
                      <h3 className="mt-2 text-[22px] font-semibold">
                        Peça dados ou proponha uma alteração
                      </h3>
                      <p className="mt-1 max-w-[320px] text-sm text-muted-foreground">
                        Exemplo: "mostre os pacientes ativos" ou "prepare um
                        novo tutor para Maria Souza".
                      </p>
                    </div>
                  ) : null}

                  {combinedMessages.map((message) =>
                    message.role === "user" ? (
                      <div
                        key={message.id}
                        className="max-w-[82%] self-end rounded-2xl rounded-br-md bg-secondary px-3.5 py-2.5 text-[14.5px] break-words whitespace-pre-wrap text-foreground"
                      >
                        {message.content || "..."}
                      </div>
                    ) : (
                      <div
                        key={message.id}
                        className="grid grid-cols-[28px_1fr] gap-3"
                      >
                        <AiAvatar />
                        <div className="flex min-w-0 flex-col gap-2.5 text-[14.5px] leading-relaxed text-stone-700 [&_b]:text-foreground [&_strong]:text-foreground">
                          {processHistory
                            .filter((entry) => entry.messageId === message.id)
                            .map((entry) => (
                              <div
                                key={`${message.id}-process`}
                                className="flex flex-col gap-1"
                              >
                                {entry.steps.map((step) => (
                                  <StepLine
                                    key={`${entry.messageId}-${step.id}`}
                                    step={step}
                                  />
                                ))}
                              </div>
                            ))}
                          <div className="break-words whitespace-pre-wrap">
                            {message.content || "..."}
                          </div>
                        </div>
                      </div>
                    ),
                  )}

                  {toolActivity.length || streamingAssistant ? (
                    <div className="grid grid-cols-[28px_1fr] gap-3">
                      <AiAvatar />
                      <div className="flex min-w-0 flex-col gap-2.5 text-[14.5px] leading-relaxed text-stone-700">
                        {toolActivity.length ? (
                          <div className="flex flex-col gap-1">
                            {toolActivity.map((entry) => (
                              <StepLine key={entry.id} step={entry} />
                            ))}
                          </div>
                        ) : null}
                        {streamingAssistant ? (
                          <div className="break-words whitespace-pre-wrap">
                            {streamingAssistant.content ? (
                              streamingAssistant.content
                            ) : (
                              <ThinkingDots />
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {pendingActions.map((action) => (
                    <div
                      key={action.id}
                      className="flex flex-col gap-3 rounded-xl border border-cta-border bg-lemon-100 p-4"
                    >
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-semibold text-foreground">
                          Confirmação necessária
                        </p>
                        <p className="text-[13.5px] text-stone-700">
                          {action.summary}
                        </p>
                      </div>
                      <pre className="overflow-x-auto rounded-md bg-card p-3 font-mono text-xs text-stone-700">
                        {JSON.stringify(action.arguments_json, null, 2)}
                      </pre>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleDecision(action, true)}
                          disabled={decidePendingAction.isPending}
                        >
                          <CheckIcon data-icon="inline-start" />
                          Aprovar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleDecision(action, false)}
                          disabled={decidePendingAction.isPending}
                        >
                          <XIcon data-icon="inline-start" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div ref={transcriptBottomRef} />
                </div>
              </ScrollArea>

              <div className="px-3.5 pt-1 pb-3">
                <form onSubmit={handleSubmit} className={composerFormClass}>
                  <ComposerFields
                    value={draft}
                    onChange={setDraft}
                    canSend={canSend}
                    placeholder="Pergunte sobre pacientes, sessões, alertas ou peça para preparar uma alteração..."
                  />
                </form>
                <Disclaimer />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={conversationPendingDeletion !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setConversationPendingDeletion(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conversa?</AlertDialogTitle>
            <AlertDialogDescription>
              {conversationPendingDeletion
                ? `A conversa "${formatConversationTitle(conversationPendingDeletion)}" será removida permanentemente do histórico.`
                : "A conversa selecionada será removida permanentemente do histórico."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteConversation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void handleConfirmDeleteConversation()}
              disabled={deleteConversation.isPending}
            >
              Excluir conversa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
