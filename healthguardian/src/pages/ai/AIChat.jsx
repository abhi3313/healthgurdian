import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiRobotLine, RiSendPlaneFill, RiUserLine,
  RiDeleteBinLine, RiSparklingLine, RiRefreshLine,
} from 'react-icons/ri'
import { aiService } from '../../services/aiService'
import { unwrapData } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatDateTime } from '../../utils/helpers'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const SUGGESTIONS = [
  'What are the symptoms of high blood pressure?',
  'How can I improve my sleep quality?',
  'Explain my recent lab report values',
  'What foods should I avoid with diabetes?',
  'How often should I check my cholesterol?',
  'What are natural ways to reduce stress?',
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={clsx('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      <div className={clsx(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1',
        isUser
          ? 'bg-primary-600 text-white'
          : 'bg-gradient-to-br from-accent/30 to-primary-600/30 border border-accent/30',
      )}>
        {isUser
          ? <RiUserLine className="text-sm" />
          : <RiRobotLine className="text-sm text-accent" />
        }
      </div>

      {/* Bubble */}
      <div className={clsx('max-w-[75%] space-y-1', isUser ? 'items-end' : 'items-start', 'flex flex-col')}>
        <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
          {msg.content}
        </div>
        <p className="text-[10px] text-slate-600 px-1">{formatDateTime(msg.timestamp)}</p>
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-primary-600/30 border border-accent/30 flex items-center justify-center shrink-0">
        <RiRobotLine className="text-sm text-accent" />
      </div>
      <div className="chat-bubble-ai flex items-center gap-1.5 py-3">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-slate-400"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default function AIChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name?.split(' ')[0] ?? 'there'}! 👋 I'm your HealthGuardian AI assistant. I can help you understand health information, explain medical terms, and answer health-related questions. How can I assist you today?`,
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef               = useRef(null)
  const inputRef                = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback(async (text) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg = { role: 'user', content, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await aiService.query(content, history)
      const payload = unwrapData(res) ?? {}
      const replyText = payload.reply ?? res.data?.data?.reply
      const aiMsg = {
        role: 'assistant',
        content: replyText && String(replyText).trim()
          ? replyText
          : 'I apologize, I could not generate a response. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please check your connection and try again.',
        timestamp: new Date().toISOString(),
        error: true,
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [input, messages, loading])

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! How can I help you today?",
      timestamp: new Date().toISOString(),
    }])
    toast.success('Chat cleared')
  }

  const hasOnlyWelcome = messages.length <= 1

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary-600/20 border border-accent/30 flex items-center justify-center">
            <RiRobotLine className="text-accent text-xl" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white">AI Health Assistant</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse-slow" />
              <p className="text-xs text-slate-400">Online · Powered by HealthGuardian AI</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearChat} className="btn-ghost flex items-center gap-1.5 text-xs border border-surface-border">
            <RiDeleteBinLine /> Clear
          </button>
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 card overflow-y-auto no-scrollbar space-y-4 p-5">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        </AnimatePresence>

        <AnimatePresence>
          {loading && <TypingIndicator />}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips – show when chat only has welcome */}
      <AnimatePresence>
        {hasOnlyWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 shrink-0"
          >
            <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
              <RiSparklingLine className="text-accent" /> Try asking
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-surface-muted border border-surface-border text-slate-400
                             hover:text-white hover:border-primary-600/40 transition-all"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="mt-4 shrink-0">
        <div className="flex items-end gap-3 p-3 bg-surface-card border border-surface-border rounded-2xl focus-within:border-primary-500/50 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask me anything about your health…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none resize-none max-h-32 leading-relaxed"
            style={{ minHeight: '24px' }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className={clsx(
              'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all',
              input.trim() && !loading
                ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-glow-blue'
                : 'bg-surface-muted text-slate-600 cursor-not-allowed',
            )}
          >
            {loading
              ? <RiRefreshLine className="text-lg animate-spin" />
              : <RiSendPlaneFill className="text-sm" />
            }
          </motion.button>
        </div>
        <p className="text-[10px] text-slate-700 text-center mt-2">
          AI responses are for informational purposes only. Always consult a healthcare professional.
        </p>
      </div>
    </div>
  )
}
