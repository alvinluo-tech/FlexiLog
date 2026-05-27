'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PaperPlaneRight, Sparkle, User, Trash, Plus } from '@phosphor-icons/react'
import { createConversation, getConversations, getMessages, addMessage, deleteConversation } from '@/app/actions/ai-chat'

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
}

export default function AIChat({ onPlanGenerated }: AIChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConvId, setCurrentConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
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
      setShowSidebar(false)
    }
  }

  const selectConversation = (convId: string) => {
    setCurrentConvId(convId)
    setShowSidebar(false)
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
    <div className="flex h-[600px] bg-[var(--surface-1)] rounded-2xl overflow-hidden border border-[var(--border-default)]">
      {/* Sidebar - Conversations List */}
      <div className={`w-64 border-r border-[var(--border-default)] flex-col bg-[var(--surface-2)] ${showSidebar ? 'flex' : 'hidden md:flex'}`}>
        <div className="p-3 border-b border-[var(--border-default)]">
          <Button onClick={startNewConversation} className="w-full justify-start gap-2" variant="ghost">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                currentConvId === conv.id ? 'bg-[var(--accent-muted)]' : 'hover:bg-[var(--surface-3)]'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{conv.title}</p>
                <p className="text-xs text-[var(--text-disabled)]">
                  {new Date(conv.updated_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => handleDeleteConversation(conv.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-[var(--danger)] transition-all"
              >
                <Trash className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-[var(--border-default)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSidebar(!showSidebar)} className="md:hidden p-1">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center">
                <Sparkle className="h-4 w-4 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-sm font-semibold">AI Coach</p>
                <p className="text-xs text-[var(--text-disabled)]">Powered by MiMo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-[var(--accent-muted)] flex items-center justify-center mb-4">
                <Sparkle className="h-8 w-8 text-[var(--accent)]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Fitness Coach</h3>
              <p className="text-sm text-[var(--text-tertiary)] max-w-xs">
                Ask me to create a training plan, modify your current plan, or get fitness advice.
              </p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {['Create a PPL plan', 'Modify my squat sets', 'Help me with recovery'].map(q => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="text-xs px-3 py-1.5 rounded-full bg-[var(--surface-3)] hover:bg-[var(--surface-4)] transition-colors"
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
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="h-8 w-8 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center flex-shrink-0">
                  <Sparkle className="h-4 w-4 text-[var(--accent)]" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--surface-3)]'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.metadata?.plan && (
                  <button
                    onClick={() => onPlanGenerated?.(msg.metadata.plan)}
                    className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-[var(--accent-muted)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors"
                  >
                    Apply This Plan
                  </button>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="h-8 w-8 rounded-lg bg-[var(--surface-3)] flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-[var(--text-secondary)]" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center flex-shrink-0">
                <Sparkle className="h-4 w-4 text-[var(--accent)] animate-pulse" />
              </div>
              <div className="bg-[var(--surface-3)] rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[var(--text-disabled)] rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-[var(--text-disabled)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-[var(--text-disabled)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[var(--border-default)]">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your training plan..."
              disabled={loading}
              className="flex-1 bg-[var(--surface-2)] border-[var(--border-default)] rounded-xl"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="rounded-xl px-4"
            >
              <PaperPlaneRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
