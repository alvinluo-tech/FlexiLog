'use client'

import { useRef, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PaperPlaneRight, Sparkle, User, Trash, Plus } from '@phosphor-icons/react'
import { createConversation, getConversations, getMessages, addMessage, deleteConversation } from '@/app/actions/ai-chat'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  metadata?: any
}

interface Conversation {
  id: string
  title: string
  updated_at: string
}

interface AIChatProps {
  onPlanGenerated?: (plan: any) => void
  showSidebar: boolean
  onToggleSidebar: () => void
}

export default function AIChat({ onPlanGenerated, showSidebar, onToggleSidebar }: AIChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConvId, setCurrentConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load conversations
  useEffect(() => {
    loadConversations()
  }, [])

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConvId) {
      loadMessages(currentConvId)
    }
  }, [currentConvId])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = async () => {
    const result = await getConversations()
    if (result.data) {
      setConversations(result.data)
    }
  }

  const loadMessages = async (convId: string) => {
    const result = await getMessages(convId)
    if (result.data) {
      setMessages(result.data.map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        metadata: m.metadata,
      })))
    }
  }

  const startNewConversation = async () => {
    const result = await createConversation()
    if (result.data) {
      setConversations(prev => [result.data!, ...prev])
      setCurrentConvId(result.data.id)
      setMessages([])
      onToggleSidebar() // close on selecting new
    }
  }

  const selectConversation = (convId: string) => {
    setCurrentConvId(convId)
    onToggleSidebar() // close sidebar drawer on select
  }

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await deleteConversation(convId)
    setConversations(prev => prev.filter(c => c.id !== convId))
    if (currentConvId === convId) {
      setCurrentConvId(null)
      setMessages([])
    }
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    // Create conversation if none selected
    if (!currentConvId) {
      const result = await createConversation(input.slice(0, 50))
      if (result.data) {
        setConversations(prev => [result.data!, ...prev])
        setCurrentConvId(result.data.id)
      } else {
        return
      }
    }

    const userMessage = input.trim()
    setInput('')
    
    // Add user message to UI immediately
    const tempUserMsg: Message = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: userMessage,
    }
    setMessages(prev => [...prev, tempUserMsg])
    setLoading(true)

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId: currentConvId,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Add AI response
      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: data.content,
        metadata: data.plan ? { plan: data.plan } : undefined,
      }
      setMessages(prev => [...prev, aiMsg])

      // If a plan was generated, notify parent
      if (data.plan && onPlanGenerated) {
        onPlanGenerated(data.plan)
      }
    } catch (error: any) {
      console.error('Chat error:', error)
      const errorMsg: Message = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: '抱歉，发生了错误：' + error.message,
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-1 min-h-0 bg-[var(--surface-0)] overflow-hidden relative w-full h-full">
      {/* Sidebar Drawer Overlay for Mobile */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggleSidebar}
            className="absolute inset-0 bg-black/70 z-30 backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Conversations Drawer Sidebar */}
      <div className={cn(
        "absolute inset-y-0 left-0 w-64 border-r border-white/5 flex flex-col bg-[var(--surface-2)] z-45 transition-transform duration-300",
        showSidebar ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-3.5 border-b border-white/5">
          <Button 
            onClick={startNewConversation} 
            className="w-full justify-start gap-2 h-10 border border-white/5 bg-[var(--surface-3)] text-white hover:bg-[var(--surface-4)] rounded-xl" 
            variant="ghost"
          >
            <Plus weight="bold" className="h-4.5 w-4.5 text-purple-400" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={cn(
                "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all active:scale-[0.98]",
                currentConvId === conv.id 
                  ? "bg-purple-500/10 border border-purple-500/20 text-purple-200" 
                  : "hover:bg-[var(--surface-3)] border border-transparent"
              )}
            >
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs font-bold truncate text-white">{conv.title || 'Untitled Chat'}</p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 font-semibold">
                  {new Date(conv.updated_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => handleDeleteConversation(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg hover:text-[var(--danger)] transition-all shrink-0"
              >
                <Trash className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Viewport */}
      <div className="flex-1 flex flex-col bg-[var(--surface-0)] relative z-20 h-full w-full min-h-0">
        {/* Messages list takes 100% available viewport height */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="h-14 w-14 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/5"
              >
                <Sparkle weight="fill" className="h-7 w-7 text-purple-400" />
              </motion.div>
              <h3 className="text-base font-extrabold mb-1 text-white">AI Coach Assistant</h3>
              <p className="text-xs text-[var(--text-tertiary)] max-w-[240px] leading-relaxed">
                Describe your goals, equipment, or schedule, and I will generate a fully custom bodybuilding or fat-loss program.
              </p>
              <div className="flex flex-col gap-2 mt-6 w-full max-w-[260px]">
                {['Create a 3-Day Split PPL Plan', 'Help me replace squats due to knee pain', 'Generate a dumbbell-only chest routine'].map(q => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="text-left text-[11px] font-bold px-3 py-2.5 rounded-xl bg-[var(--surface-1)] border border-white/5 hover:border-white/10 hover:bg-[var(--surface-2)] active:scale-[0.98] transition-all text-[var(--text-secondary)] hover:text-white truncate"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex gap-2.5", msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && (
                <div className="h-8 w-8 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkle weight="fill" className="h-4 w-4 text-purple-400" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-xs font-semibold shadow-md shadow-blue-500/5'
                    : 'bg-[var(--surface-2)] border border-white/5 text-[var(--text-secondary)] rounded-2xl rounded-tl-xs'
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.metadata?.plan && (
                  <Button
                    onClick={() => onPlanGenerated?.(msg.metadata.plan)}
                    className="mt-3.5 w-full h-10 gap-1.5 text-xs font-bold uppercase tracking-wider bg-purple-500 hover:bg-purple-600 text-white rounded-xl active:scale-95 shadow-md shadow-purple-500/10 transition-transform"
                  >
                    <Plus weight="bold" className="h-3.5 w-3.5" />
                    Apply Routine
                  </Button>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="h-8 w-8 rounded-lg bg-[var(--surface-2)] border border-white/5 flex items-center justify-center flex-shrink-0">
                  <User weight="bold" className="h-4 w-4 text-[var(--text-secondary)]" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Sparkle weight="fill" className="h-4 w-4 text-purple-400 animate-pulse" />
              </div>
              <div className="bg-[var(--surface-2)] border border-white/5 rounded-2xl px-4 py-3.5">
                <div className="flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar (ChatGPT-style Floating Capsule) */}
        <div className="p-4 border-t border-white/5 bg-[var(--surface-0)] shrink-0">
          <div className="max-w-md mx-auto w-full relative flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI Coach anything..."
              disabled={loading}
              className="w-full bg-[var(--surface-2)] border border-white/5 focus-visible:ring-purple-500 rounded-full h-12 pl-5 pr-14 text-sm text-white font-semibold shadow-inner"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={cn(
                "absolute right-1.5 w-9 h-9 p-0 rounded-full active:scale-90 transition-all flex items-center justify-center shrink-0 shadow-md",
                input.trim() ? "bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/20" : "bg-transparent text-[var(--text-disabled)]"
              )}
            >
              <PaperPlaneRight weight="bold" className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
