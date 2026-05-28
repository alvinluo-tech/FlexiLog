'use client'

import { useRef, useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PaperPlaneRight, 
  Sparkle, 
  User, 
  Trash, 
  Plus, 
  SidebarSimple, 
  Stop, 
  ChatCircle,
  Barbell,
  Lightning
} from "@phosphor-icons/react";
import { 
  createConversation, 
  getConversations, 
  getMessages, 
  addMessage, 
  deleteConversation 
} from "@/app/actions/ai-chat";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: any;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface AIChatProps {
  onPlanGenerated?: (plan: any) => void;
  showSidebar: boolean;
  onToggleSidebar: () => void;
}

export default function AIChat({ onPlanGenerated, showSidebar, onToggleSidebar }: AIChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadConversations = useCallback(async () => {
    const result = await getConversations();
    if (result.data) {
      setConversations(result.data);
      // Auto-select the most recent conversation on initial load
      if (result.data.length > 0 && !currentConvId) {
        setCurrentConvId(result.data[0].id);
      }
    }
  }, [currentConvId]);

  const loadMessages = useCallback(async (convId: string) => {
    const result = await getMessages(convId);
    if (result.data) {
      setMessages(
        result.data.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          metadata: m.metadata,
        }))
      );
    }
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConvId) {
      loadMessages(currentConvId);
    } else {
      setMessages([]);
    }
  }, [currentConvId, loadMessages]);

  // Auto scroll to bottom with smooth springs
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize input textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [input]);

  const startNewConversation = () => {
    setCurrentConvId(null);
    setMessages([]);
    if (window.innerWidth < 768) {
      onToggleSidebar(); // Close sidebar drawer on mobile
    }
  };

  const selectConversation = (convId: string) => {
    setCurrentConvId(convId);
    if (window.innerWidth < 768) {
      onToggleSidebar(); // Close sidebar drawer on mobile
    }
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteConversation(convId);
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (currentConvId === convId) {
      setCurrentConvId(null);
      setMessages([]);
    }
  };

  // Interrupt / Cancel generating action
  const handleInterrupt = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleSend = useCallback(async (customMessage?: string) => {
    const userMessage = (customMessage || input).trim();
    if (!userMessage || loading) return;

    if (!customMessage) {
      setInput("");
    }

    // Add user message to UI immediately for seamless tactile experience
    const tempUserMsg: Message = {
      id: "temp-" + Date.now(),
      role: "user",
      content: userMessage,
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    // Initialize AbortController for cancel capability
    const controller = new AbortController();
    abortControllerRef.current = controller

    try {
      let activeConvId = currentConvId;

      // Lazy-creation: Create database conversation row ONLY on the first message
      if (!activeConvId) {
        const result = await createConversation(userMessage.slice(0, 50));
        if (result.data) {
          setConversations((prev) => [result.data!, ...prev]);
          activeConvId = result.data.id;
          // Keep currentConvId as null locally until the AI replies successfully,
          // which avoids premature state reset and race condition flashes!
        } else {
          throw new Error(result.error || "Failed to create conversation");
        }
      }

      // POST to the chat endpoint
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationId: activeConvId,
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Add the AI response bubble
      const aiMsg: Message = {
        id: "ai-" + Date.now(),
        role: "assistant",
        content: data.content,
        metadata: data.plan ? { plan: data.plan } : undefined,
      };

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        { id: "user-" + Date.now(), role: "user", content: userMessage },
        aiMsg,
      ]);

      // If this was the first message in the session, commit the new active conversation ID
      if (currentConvId === null) {
        setCurrentConvId(activeConvId);
      }

      // If a fitness plan is outputted, invoke the plan callback
      if (data.plan && onPlanGenerated) {
        onPlanGenerated(data.plan);
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        // User aborted the generation
        const abortMsg: Message = {
          id: "abort-" + Date.now(),
          role: "assistant",
          content: "❌ 对话已由用户中断。",
        };
        setMessages((prev) => [...prev, abortMsg]);
      } else {
        console.error("Chat error:", err);
        const errorMsg: Message = {
          id: "error-" + Date.now(),
          role: "assistant",
          content: "抱歉，发生了错误：" + err.message,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, loading, currentConvId, onPlanGenerated]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div className="flex flex-1 min-h-0 bg-[var(--surface-0)] overflow-hidden relative w-full h-full">
      
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggleSidebar}
            className="absolute inset-0 bg-black/75 z-30 backdrop-blur-xs md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Conversations Drawer Sidebar (Collapsible Persistent side-panel on Desktop) */}
      <div className={cn(
        // Mobile style drawer
        "absolute inset-y-0 left-0 w-64 border-r border-white/5 flex flex-col bg-[var(--surface-1)] z-40 transition-all duration-300 ease-in-out",
        showSidebar ? "translate-x-0" : "-translate-x-full",
        // Desktop style sidebar
        "md:relative md:translate-x-0",
        showSidebar ? "md:w-64 md:opacity-100" : "md:w-0 md:opacity-0 md:border-r-0 overflow-hidden"
      )}>
        <div className="p-3.5 border-b border-white/5 flex items-center justify-between shrink-0">
          <Button
            onClick={startNewConversation}
            className="w-full justify-start gap-2 h-10 border border-white/5 bg-[var(--surface-2)] text-white hover:bg-[var(--surface-3)] rounded-xl active:scale-[0.98] transition-all font-semibold text-xs"
            variant="ghost"
          >
            <Plus weight="bold" className="h-4 w-4 text-purple-400" />
            新建对话
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {conversations.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-[10px] text-[var(--text-disabled)] uppercase tracking-wider font-bold">暂无对话</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={cn(
                  "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border border-transparent active:scale-[0.98]",
                  currentConvId === conv.id
                    ? "bg-purple-500/10 border-purple-500/20 text-purple-200"
                    : "hover:bg-[var(--surface-2)] text-[var(--text-secondary)]"
                )}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-xs font-bold truncate text-white group-hover:text-purple-300 transition-colors">
                    {conv.title || "未命名对话"}
                  </p>
                  <p className="text-[9px] text-[var(--text-disabled)] mt-0.5 font-mono">
                    {new Date(conv.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg hover:text-[var(--danger)] transition-all shrink-0 cursor-pointer"
                  title="删除对话" aria-label="删除对话"
                >
                  <Trash className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Viewport */}
      <div className="flex-1 flex flex-col bg-[var(--surface-0)] relative z-20 h-full w-full min-h-0 transition-all duration-300 ease-in-out">
        
        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 min-h-0 no-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
              <motion.div
                animate={{ rotate: [0, 8, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="h-14 w-14 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/5"
              >
                <Sparkle weight="fill" className="h-7 w-7 text-purple-400" />
              </motion.div>
              <h3 className="text-base font-black tracking-tight text-white mb-1.5">AI 健身助手</h3>
              <p className="text-xs text-[var(--text-tertiary)] max-w-[240px] leading-relaxed font-light">
                请输入您的健身目标、训练环境或身体数据，我将为您量身定制科学的健美与减脂计划。
              </p>

              {/* Suggestions Cards */}
              <div className="flex flex-col gap-2 mt-6 w-full max-w-[280px]">
                {[
                  { q: "制定一个3天推拉腿(PPL)计划", icon: <Barbell className="text-purple-400 h-4 w-4" /> },
                  { q: "膝盖有伤，帮我替换深蹲动作", icon: <Lightning className="text-blue-400 h-4 w-4" /> },
                  { q: "提供一份纯哑铃胸肌训练动作", icon: <Sparkle className="text-amber-400 h-4 w-4" /> }
                ].map((s) => (
                  <button
                    key={s.q}
                    onClick={() => handleSend(s.q)}
                    className="text-left text-[11px] font-bold px-3.5 py-3 rounded-xl bg-[var(--surface-1)] border border-white/5 hover:border-purple-500/30 hover:bg-[var(--surface-2)] active:scale-[0.98] transition-all text-[var(--text-secondary)] hover:text-white flex items-center gap-2 truncate shadow-xs cursor-pointer"
                  >
                    {s.icon}
                    <span className="truncate">{s.q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 shadow-xs relative">
                  <Sparkle weight="fill" className="h-4.5 w-4.5 text-purple-400" />
                  {loading && msg.id.startsWith("temp") && (
                    <span className="absolute inset-0 rounded-xl border border-purple-400 animate-ping" />
                  )}
                </div>
              )}
              
              <div
                className={cn(
                  "max-w-[85%] px-4 py-3 rounded-[20px] text-sm leading-relaxed shadow-sm relative overflow-hidden",
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-xs shadow-md shadow-blue-600/5 font-medium border border-blue-500/20"
                    : "bg-[var(--surface-2)] border border-white/5 text-[var(--text-secondary)] rounded-tl-xs"
                )}
              >
                {msg.role === "assistant" ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  <p className="whitespace-pre-wrap text-xs text-white">{msg.content}</p>
                )}

                {msg.metadata?.plan && (
                  <Button
                    onClick={() => onPlanGenerated?.(msg.metadata.plan)}
                    className="mt-4 w-full h-10 gap-2 text-[10px] font-bold uppercase tracking-wider bg-purple-500 hover:bg-purple-600 text-white border border-white/10 rounded-xl active:scale-95 shadow-md shadow-purple-500/10 transition-all cursor-pointer"
                  >
                    <Plus weight="bold" className="h-4 w-4" />
                    应用此健身计划
                  </Button>
                )}
              </div>

              {msg.role === "user" && (
                <div className="h-8 w-8 rounded-xl bg-[var(--surface-2)] border border-white/5 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <User weight="bold" className="h-4.5 w-4.5 text-blue-400" />
                </div>
              )}
            </div>
          ))}

          {/* Loading Skeletal Pulse */}
          {loading && (
            <div className="flex gap-3 animate-in fade-in duration-300">
              <div className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkle weight="fill" className="h-4.5 w-4.5 text-purple-400 animate-spin" />
              </div>
              <div className="bg-[var(--surface-2)] border border-white/5 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs">
                <div className="flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar (Mainstream Floating Capsule with Action Integration) */}
        <div className="p-4 border-t border-white/5 bg-[var(--surface-0)] shrink-0">
          <div className="max-w-md mx-auto w-full relative flex items-end bg-[var(--surface-2)] border border-white/5 focus-within:border-purple-500/40 rounded-[24px] pr-12 shadow-inner">
            
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="问问 AI 健身教练..."
              disabled={loading}
              aria-label="消息输入"
              className="w-full bg-transparent focus:outline-none border-none py-3.5 pl-5 pr-2 text-xs text-white font-medium resize-none min-h-[48px] max-h-[160px] no-scrollbar leading-relaxed"
            />

            {/* Absolute Dynamic Action Trigger (Send or Stop Generating) */}
            <div className="absolute right-2 bottom-2">
              {loading ? (
                <Button
                  onClick={handleInterrupt}
                  className="w-9 h-9 p-0 rounded-full bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 active:scale-90 transition-all flex items-center justify-center cursor-pointer shadow-md shadow-red-500/5"
                  title="中断生成" aria-label="中断生成"
                >
                  <Stop weight="fill" className="h-4.5 w-4.5" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className={cn(
                    "w-9 h-9 p-0 rounded-full active:scale-90 transition-all flex items-center justify-center cursor-pointer shadow-md",
                    input.trim() 
                      ? "bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/20" 
                      : "bg-transparent text-[var(--text-disabled)]"
                  )}
                >
                  <PaperPlaneRight weight="bold" className="h-4.5 w-4.5" />
                </Button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

/* ============================================================
   Custom Premium Typographic Markdown Parser
   ============================================================ */

function MarkdownRenderer({ content }: { content: string }) {
  // Normalize newlines and segment blocks
  const normalized = content.replace(/\r\n/g, "\n");
  const blocks = normalized.split(/\n\n+/);

  return (
    <div className="space-y-3 font-sans text-xs text-[var(--text-secondary)] leading-relaxed">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // 1. Headers (### 标题)
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={bIdx} className="text-xs font-black text-white mt-4 first:mt-0 tracking-tight flex items-center border-l-2 border-purple-500 pl-2.5 py-0.5">
              {parseInlineMarkdown(trimmed.replace("### ", ""))}
            </h3>
          );
        }
        if (trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
          const text = trimmed.replace(/^#+\s+/, "");
          return (
            <h2 key={bIdx} className="text-sm font-black text-white mt-5 first:mt-0 tracking-tight flex items-center border-l-2 border-purple-500 pl-3 py-0.5">
              {parseInlineMarkdown(text)}
            </h2>
          );
        }

        // 2. Unordered Bullet Lists
        const lines = trimmed.split("\n");
        const isUnordered = lines.every((line) => {
          const l = line.trim();
          return l.startsWith("- ") || l.startsWith("* ") || l === "";
        });
        if (isUnordered && lines.length > 0) {
          return (
            <ul key={bIdx} className="space-y-1.5 pl-4 list-disc list-outside text-[11px] font-medium text-[var(--text-secondary)]">
              {lines.map((line, lIdx) => {
                const text = line.trim().replace(/^[-*]\s+/, "");
                if (!text) return null;
                return (
                  <li key={lIdx} className="pl-0.5 marker:text-purple-400">
                    {parseInlineMarkdown(text)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // 3. Ordered Numeric Lists
        const isOrdered = lines.every((line) => {
          const l = line.trim();
          return /^\d+\.\s+/.test(l) || l === "";
        });
        if (isOrdered && lines.length > 0) {
          return (
            <ol key={bIdx} className="space-y-1.5 pl-4 list-decimal list-outside text-[11px] font-medium text-[var(--text-secondary)]">
              {lines.map((line, lIdx) => {
                const text = line.trim().replace(/^\d+\.\s+/, "");
                if (!text) return null;
                return (
                  <li key={lIdx} className="pl-0.5 marker:text-purple-400 marker:font-bold">
                    {parseInlineMarkdown(text)}
                  </li>
                );
              })}
            </ol>
          );
        }

        // 4. Standard Paragraph text
        return (
          <p key={bIdx} className="whitespace-pre-line text-xs font-normal text-[var(--text-secondary)]">
            {parseInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Inline elements bold (**) and inline code (`) parser
function parseInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-extrabold text-white font-sans">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-[var(--surface-3)] border border-white/5 font-mono text-[10px] text-purple-300 font-bold mx-0.5">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
