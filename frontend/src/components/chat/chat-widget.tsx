import { useEffect, useMemo, useRef, useState, startTransition } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeftIcon,
  BotIcon,
  CheckIcon,
  LoaderCircleIcon,
  MessageCircleMoreIcon,
  PlusIcon,
  SendHorizontalIcon,
  SparklesIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
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

  const combinedMessages = useMemo(() => {
    const persistedMessages = (conversationQuery.data?.messages ?? []).filter(
      (message) => {
        if (streamingAssistant && message.id === streamingAssistant.id) {
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
        { id: `local-${Date.now()}`, content: initialPrompt },
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

  return (
    <>
      <Button
        type="button"
        size="icon-lg"
        className="fixed right-5 bottom-5 z-50 rounded-full border border-primary/20 bg-[radial-gradient(circle_at_top,color-mix(in_oklch,var(--chart-1)_55%,white),color-mix(in_oklch,var(--primary)_86%,black))] text-primary-foreground shadow-[0_22px_50px_-22px_color-mix(in_oklch,var(--primary)_55%,black)] transition-transform hover:scale-[1.03]"
        onClick={() => setOpen(true)}
      >
        <MessageCircleMoreIcon className="size-5" />
        <span className="sr-only">Abrir assistente VetData</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="h-[min(90vh,820px)] w-[96vw] md:w-[700px] lg:w-[900px] lg:min-w-[900px] max-w-none flex flex-col 
          gap-0 overflow-hidden border border-border/70 p-0 
          shadow-[0_30px_90px_-35px_color-mix(in_oklch,var(--primary)_28%,black)] 
          bg-[linear-gradient(180deg,color-mix(in_oklch,var(--chart-1)_10%,white),color-mix(in_oklch,var(--background)_92%,var(--primary)_8%))]"
        >
          {view === "home" ? (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-2 text-primary">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                    <BotIcon className="size-4" />
                  </div>
                  <span className="font-medium text-sm font-(--theme-font-sans)">
                    Assistente VetData
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setOpen(false)}
                >
                  <XIcon />
                </Button>
              </div>

              <ScrollArea className="flex-1 px-4 py-8">
                <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
                  <div className="mb-4 flex size-16 items-center justify-center rounded-[1.25rem] bg-primary/10 text-primary shadow-sm">
                    <SparklesIcon className="size-8" />
                  </div>
                  <h2 className="text-2xl font-medium font-(--theme-font-sans) sm:text-3xl">
                    Olá, sou o Assistente VetData!
                  </h2>
                  <p className="mt-3 max-w-md text-muted-foreground text-sm sm:text-base">
                    Sua IA para a clínica. Posso buscar pacientes, analisar
                    sessões e preparar alterações.
                  </p>

                  <div className="mt-8 w-full">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (draft.trim() && connectionState === "open") {
                          handleStartNewFromHome(draft);
                          setDraft("");
                        }
                      }}
                      className="group flex w-full items-center gap-2 rounded-[1.5rem] border border-border/70 bg-background/80 px-4 py-2 shadow-sm transition-colors focus-within:border-primary/40 focus-within:bg-background"
                    >
                      <BotIcon className="size-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <input
                        type="text"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Faça uma pergunta ou comando..."
                        className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground/70"
                      />
                      <Button
                        type="submit"
                        size="icon"
                        disabled={!draft.trim() || connectionState !== "open"}
                        className="size-9 shrink-0 rounded-full"
                      >
                        <SendHorizontalIcon className="size-4" />
                      </Button>
                    </form>
                  </div>

                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {[
                      "Mostre os pacientes ativos",
                      "Resumo das sessões de hoje",
                      "Alertas críticos?",
                    ].map((prompt) => (
                      <Button
                        key={prompt}
                        type="button"
                        variant="outline"
                        className="rounded-full bg-white/50 px-4 text-xs font-normal text-muted-foreground hover:bg-white/80"
                        onClick={() => {
                          if (connectionState === "open") {
                            handleStartNewFromHome(prompt);
                          }
                        }}
                      >
                        <SparklesIcon className="mr-2 size-3" />
                        {prompt}
                      </Button>
                    ))}
                  </div>

                  <div className="mt-14 w-full text-left">
                    <div className="mb-4 flex items-center justify-between px-1">
                      <h3 className="text-sm font-medium text-foreground">
                        Conversas recentes
                      </h3>
                    </div>
                    {conversationsQuery.data?.length ? (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {conversationsQuery.data
                          .slice(0, 6)
                          .map((conversation) => (
                            <div
                              key={conversation.id}
                              className="relative rounded-[1.25rem] border border-border/50 bg-white/60 shadow-sm transition-colors hover:bg-primary/5"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveConversationId(conversation.id);
                                  setView("chat");
                                }}
                                className="flex w-full flex-col items-start px-5 py-4 pr-14 text-left"
                              >
                                <span className="w-full truncate text-sm font-medium text-foreground">
                                  {formatConversationTitle(conversation)}
                                </span>
                                <span className="mt-1.5 w-full line-clamp-1 text-xs text-muted-foreground/80">
                                  Atualizada em{" "}
                                  {formatConversationMetaLabel(conversation)}
                                </span>
                              </button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="absolute top-3 right-3 text-muted-foreground hover:text-destructive"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setConversationPendingDeletion(conversation);
                                }}
                              >
                                <Trash2Icon className="size-4" />
                                <span className="sr-only">
                                  Excluir conversa
                                </span>
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="mt-8 px-1 text-center text-sm text-muted-foreground">
                        Nenhuma conversa ainda. Faça uma pergunta acima para
                        começar.
                      </p>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border/70 bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-2 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => setView("home")}
                  >
                    <ArrowLeftIcon data-icon="inline-start" />
                    Voltar
                  </Button>
                  <div className="hidden h-4 w-px bg-border/80 sm:block"></div>
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <BotIcon className="size-3.5" />
                    </div>
                    <span className="truncate text-sm font-medium">
                      {conversationQuery.data?.conversation
                        ? formatConversationTitle(
                            conversationQuery.data.conversation,
                          )
                        : "Nova conversa"}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {conversationQuery.data?.conversation ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Excluir conversa"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        setConversationPendingDeletion(
                          conversationQuery.data?.conversation ?? null,
                        )
                      }
                      disabled={deleteConversation.isPending}
                    >
                      <Trash2Icon className="size-4" />
                      <span className="sr-only">Excluir conversa</span>
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="md:-mr-1"
                    title="Nova conversa"
                    onClick={handleNewConversation}
                    disabled={createConversation.isPending}
                  >
                    {createConversation.isPending ? (
                      <LoaderCircleIcon className="animate-spin" />
                    ) : (
                      <PlusIcon />
                    )}
                    <span className="sr-only">Nova conversa</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setOpen(false)}
                  >
                    <XIcon />
                    <span className="sr-only">Fechar assistente</span>
                  </Button>
                </div>
              </div>

              <ScrollArea className="min-h-0 flex-1 px-4 py-4 sm:px-6 sm:py-5">
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-5">
                  {!combinedMessages.length && !conversationQuery.isLoading ? (
                    <Card className="border-primary/15 bg-white/72 shadow-sm">
                      <CardHeader>
                        <div className="flex items-center gap-2 text-primary">
                          <SparklesIcon className="size-4" />
                          <CardTitle className="text-sm">
                            Peça dados ou proponha uma alteração
                          </CardTitle>
                        </div>
                        <CardDescription>
                          Exemplo: "mostre os pacientes ativos" ou "prepare um
                          novo tutor para Maria Souza".
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ) : null}

                  {combinedMessages.map((message) => (
                    <div key={message.id} className="space-y-2">
                      {message.role === "assistant"
                        ? processHistory
                            .filter((entry) => entry.messageId === message.id)
                            .map((entry) => (
                              <div
                                key={`${message.id}-process`}
                                className="space-y-1 pl-2 text-xs text-muted-foreground"
                              >
                                {entry.steps.map((step) => (
                                  <div
                                    key={`${entry.messageId}-${step.id}`}
                                    className="leading-5"
                                  >
                                    {step.label}
                                  </div>
                                ))}
                              </div>
                            ))
                        : null}

                      <div
                        className={cn(
                          "flex",
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start",
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[92%] rounded-[1.4rem] px-4 py-3 text-sm shadow-sm sm:max-w-[85%]",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "border border-border/70 bg-background/88 text-foreground",
                          )}
                        >
                          <div className="whitespace-pre-wrap leading-6">
                            {message.content || "..."}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {toolActivity.length ? (
                    <div className="space-y-1 pl-2 text-xs text-muted-foreground">
                      {toolActivity.map((entry) => (
                        <div key={entry.id} className="leading-5">
                          {entry.label}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {streamingAssistant ? (
                    <div className="flex justify-start">
                      <div className="max-w-[92%] rounded-[1.4rem] border border-border/70 bg-background/88 px-4 py-3 text-sm text-foreground shadow-sm sm:max-w-[85%]">
                        <div className="whitespace-pre-wrap leading-6">
                          {streamingAssistant.content ? (
                            streamingAssistant.content
                          ) : (
                            <ThinkingDots />
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {pendingActions.map((action) => (
                    <Card
                      key={action.id}
                      className="border-amber-200/70 bg-amber-50/85 shadow-sm"
                    >
                      <CardHeader>
                        <CardTitle className="text-sm">
                          Confirmação necessária
                        </CardTitle>
                        <CardDescription>{action.summary}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <pre className="overflow-x-auto rounded-xl bg-white/70 p-3 text-xs text-muted-foreground">
                          {JSON.stringify(action.arguments_json, null, 2)}
                        </pre>
                        <div className="flex flex-col gap-2 sm:flex-row">
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
                      </CardContent>
                    </Card>
                  ))}

                  <div ref={transcriptBottomRef} />
                </div>
              </ScrollArea>

              <form
                onSubmit={handleSubmit}
                className="border-t border-border/70 bg-background/88 px-4 py-4 backdrop-blur sm:px-6"
              >
                <div className="mx-auto flex w-full max-w-4xl items-end gap-3">
                  <Textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        if (draft.trim() && connectionState === "open") {
                          handleSubmit(event);
                        }
                      }
                    }}
                    placeholder="Pergunte sobre pacientes, sessões, alertas ou peça para preparar uma alteração..."
                    className="min-h-[50px] resize-none bg-white/75 sm:min-h-[52px]"
                  />
                  <Button
                    type="submit"
                    className="shrink-0"
                    disabled={!draft.trim() || connectionState !== "open"}
                  >
                    <SendHorizontalIcon data-icon="inline-start" />
                    Enviar
                  </Button>
                </div>
              </form>
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
