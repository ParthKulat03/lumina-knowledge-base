import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRagStore, ChatMessage } from "@/lib/rag-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Sparkles,
  Copy,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Bot,
  User as UserIcon,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { search, chatMessages, addChatMessage, clearChatMessages } =
    useRagStore();

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isSearching]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSearching) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    addChatMessage(userMsg);

    setIsSearching(true);
    setInput("");

    const response = await search(trimmed);

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: response.answer,
    };
    addChatMessage(assistantMsg);

    setIsSearching(false);
  };

  const handleQuickPrompt = (text: string) => {
    setInput(text);
  };

  const handleNewChat = () => {
    clearChatMessages();
    setInput("");
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const hasResult = chatMessages.some((m) => m.role === "assistant");

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full w-full">
        <div className="bg-background border-b sticky top-0 z-20 px-8 py-6">
          <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="max-w-3xl">
              <h1 className="text-2xl font-semibold mb-2">
                What can I help you find?
              </h1>
              <p className="text-sm text-muted-foreground">
                Chat with your uploaded documents. Ask follow-up questions just
                like ChatGPT.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2">
                <span>Try asking:</span>
                <button
                  className="hover:text-indigo-600 transition-colors"
                  onClick={() =>
                    handleQuickPrompt("Explain the two pointer technique.")
                  }
                  type="button"
                >
                  "Explain the two pointer technique"
                </button>
                <span>•</span>
                <button
                  className="hover:text-indigo-600 transition-colors"
                  onClick={() =>
                    handleQuickPrompt(
                      "Summarize the main algorithm in my document."
                    )
                  }
                  type="button"
                >
                  "Summarize the main algorithm"
                </button>
              </div>
            </div>

            <Button
              variant="outline"
              className="gap-2"
              onClick={handleNewChat}
              disabled={isSearching || chatMessages.length === 0}
            >
              <PlusCircle className="w-4 h-4" />
              New Chat
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col px-8 pb-4 pt-0 min-h-0">
          <div className="max-w-5xl mx-auto flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-6 py-4">
              {!isSearching && chatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-60">
                  <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Ready to search</h3>
                  <p className="text-muted-foreground max-w-xs mt-2">
                    Ask anything about your knowledge base. I’ll answer using
                    your uploaded documents.
                  </p>
                </div>
              )}

              {chatMessages.map((msg) => (
                <ChatMessageBubble
                  key={msg.id}
                  message={msg}
                  onCopy={handleCopy}
                />
              ))}

              {isSearching && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="border-t pt-4 mt-0 bg-background sticky bottom-0">
              <form onSubmit={handleSend} className="relative group max-w-5xl">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                <div className="relative bg-background rounded-xl shadow-sm border border-input flex items-center p-1">
                  <Input
                    className="border-none shadow-none focus-visible:ring-0 h-12 text-lg px-4"
                    placeholder="Ask a question about your documents..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isSearching}
                  />
                  <Button
                    size="icon"
                    type="submit"
                    className={cn(
                      "h-10 w-10 rounded-lg transition-all duration-300",
                      input.trim()
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "bg-muted text-muted-foreground"
                    )}
                    disabled={!input.trim() || isSearching}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </form>
              {hasResult && (
                <p className="mt-2 text-xs text-muted-foreground text-center">
                  Tip: Ask a follow-up question to refine the answer.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


function ChatMessageBubble({
  message,
  onCopy,
}: {
  message: ChatMessage;
  onCopy: (text: string) => void;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<"up" | "down" | null>(null);

  const handleCopyClick = async () => {
    await onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 900);
  };

  const handleThumbUp = () => {
    setLiked((prev) => (prev === "up" ? null : "up"));
  };
  const handleThumbDown = () => {
    setLiked((prev) => (prev === "down" ? null : "down"));
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="flex items-end gap-3 max-w-3xl">
          <div className="px-3 py-2 rounded-2xl rounded-br-sm bg-primary text-primary-foreground text-sm shadow-sm">
            {message.content}
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex items-start gap-3 max-w-3xl w-full">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
          <Bot className="w-4 h-4 text-white" />
        </div>

        <div className="flex-1 space-y-4">
          <div className="prose prose-slate max-w-none">
            <p className="leading-relaxed text-foreground/90 text-sm whitespace-pre-wrap">
              {message.content}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 text-xs flex items-center gap-2 transition-all",
                copied
                  ? "bg-emerald-600 text-white scale-[1.03]"
                  : "text-muted-foreground hover:bg-muted"
              )}
              onClick={handleCopyClick}
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? "Copied!" : "Copy"}</span>
            </Button>

            <div className="w-px h-4 bg-border" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleThumbUp}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-full transition-transform",
                liked === "up"
                  ? "bg-blue-600 text-white scale-105 shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleThumbDown}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-full transition-transform",
                liked === "down"
                  ? "bg-red-500 text-white scale-105 shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <ThumbsDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
