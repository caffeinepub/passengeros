import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Sparkles, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Role } from "../backend";
import { useAddAiMessage } from "../hooks/useQueries";

const AI_RESPONSES = [
  "Based on your flight BA178 departing LHR at 10:30, I recommend leaving home by 07:15 to allow time for check-in and security.",
  "Your baggage appears to be on schedule. It was loaded onto the aircraft 45 minutes ago.",
  "Security queues at Terminal 5 are currently moderate — about 18 minutes wait. Consider using Fast Track.",
  "EU Regulation 261/2004 entitles you to compensation if your flight is delayed by more than 3 hours. Your current delay qualifies.",
  "Gate B22 is a 12-minute walk from security. Follow signs to the B gates on Level 3.",
  "Your passport expires in 8 months — well within the 6-month validity requirement for your destination.",
];

type ChatMsg = { role: "user" | "assistant"; content: string };

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AiChatPanel({ open, onClose }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMsg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const addMessage = useAddAiMessage();
  const initialized = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — only run once when panel opens
  useEffect(() => {
    if (open && !initialized.current) {
      initialized.current = true;
      setLocalMessages([
        {
          role: "assistant",
          content:
            "Hello! I'm your AI travel assistant. Ask me anything about your journey — gates, queues, delays, your rights, or baggage status.",
        },
      ]);
    }
  }, [open]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scrollRef is stable, intentional scroll-to-bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, isTyping]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");

    setLocalMessages((prev) => [...prev, { role: "user", content: text }]);

    setIsTyping(true);
    setTimeout(
      () => {
        const response =
          AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
        setLocalMessages((prev) => [
          ...prev,
          { role: "assistant", content: response },
        ]);
        setIsTyping(false);
      },
      1200 + Math.random() * 600,
    );

    try {
      await addMessage.mutateAsync({
        content: text,
        role: Role.user,
        timestamp: BigInt(Date.now()),
      });
    } catch {
      // silently ignore
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ maxWidth: "430px", left: "50%", transform: "translateX(-50%)" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        role="button"
        tabIndex={0}
        aria-label="Close AI assistant"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClose();
        }}
      />

      {/* Panel */}
      <div
        data-ocid="ai.chat.panel"
        className="relative w-full rounded-t-2xl overflow-hidden animate-slide-up"
        style={{
          background: "oklch(0.15 0.02 260)",
          border: "1px solid oklch(var(--primary) / 0.2)",
          borderBottom: "none",
          height: "75dvh",
          boxShadow:
            "0 -8px 40px oklch(0 0 0 / 0.6), 0 0 60px oklch(var(--primary) / 0.08)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-display font-semibold text-sm text-foreground">
                AI Travel Assistant
              </p>
              <p className="text-[10px] text-muted-foreground">
                Always on, always accurate
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-ocid="ai.chat.close_button"
            className="w-8 h-8 rounded-full hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-none px-4 py-4 space-y-3"
          style={{ height: "calc(75dvh - 140px)" }}
        >
          {localMessages.map((msg, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: message list is append-only
              key={`msg-${i}`}
              className={`flex items-end gap-2 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              } animate-fade-in`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "assistant" ? "bg-primary/20" : "bg-muted"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Bot className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "text-foreground rounded-bl-sm"
                }`}
                style={
                  msg.role === "assistant"
                    ? {
                        background: "oklch(0.22 0.025 260)",
                        border: "1px solid oklch(var(--border) / 0.5)",
                      }
                    : {}
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-end gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div
                className="px-4 py-3 rounded-2xl rounded-bl-sm"
                style={{
                  background: "oklch(0.22 0.025 260)",
                  border: "1px solid oklch(var(--border) / 0.5)",
                }}
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 py-4 border-t border-border/30"
          style={{ background: "oklch(0.15 0.02 260)" }}
        >
          <div className="flex gap-2">
            <Input
              data-ocid="ai.chat.input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about your journey..."
              className="flex-1 bg-muted border-border/50 text-sm placeholder:text-muted-foreground focus-visible:ring-primary/50"
            />
            <Button
              type="button"
              data-ocid="ai.chat.submit_button"
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              size="icon"
              className="bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
