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

const FENCE_RE = /```(\w+)?\n?([\s\S]*?)```/g

function renderInlineMarkdown(text) {
  const parts = []
  const inlineRe = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g
  let lastIndex = 0
  let match

  while ((match = inlineRe.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))

    const value = match[0]
    const key = `${match.index}-${value}`
    if (value.startsWith('`')) {
      parts.push(
        <code key={key} className="rounded bg-surface-card px-1 py-0.5 font-mono text-[0.85em] text-accent">
          {value.slice(1, -1)}
        </code>,
      )
    } else if (value.startsWith('**')) {
      parts.push(<strong key={key} className="font-semibold text-white">{value.slice(2, -2)}</strong>)
    } else {
      parts.push(<em key={key}>{value.slice(1, -1)}</em>)
    }
    lastIndex = inlineRe.lastIndex
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

function renderInlineWithBreaks(text, keyPrefix) {
  return text.split('\n').flatMap((line, index, lines) => {
    const items = [
      <span key={`${keyPrefix}-line-${index}`}>{renderInlineMarkdown(line)}</span>,
    ]
    if (index < lines.length - 1) items.push(<br key={`${keyPrefix}-br-${index}`} />)
    return items
  })
}

function isTableDivider(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim())
}

function isListLine(line) {
  return /^\s*([-*+]|[0-9]+\.)\s+/.test(line) || /^\s*[\u2022]\s+/.test(line)
}

function renderTextBlocks(text, keyPrefix) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (!line.trim()) {
      i += 1
      continue
    }

    if (/^\s*---+\s*$/.test(line)) {
      blocks.push(<hr key={`${keyPrefix}-hr-${i}`} className="my-3 border-surface-border" />)
      i += 1
      continue
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line)
    if (heading) {
      blocks.push(
        <p key={`${keyPrefix}-heading-${i}`} className="mt-3 font-semibold text-white first:mt-0">
          {renderInlineMarkdown(heading[2])}
        </p>,
      )
      i += 1
      continue
    }

    if (line.includes('|') && lines[i + 1] && isTableDivider(lines[i + 1])) {
      const headers = parseTableRow(line)
      const rows = []
      i += 2
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        rows.push(parseTableRow(lines[i]))
        i += 1
      }
      blocks.push(
        <div key={`${keyPrefix}-table-${i}`} className="my-3 max-w-full overflow-x-auto rounded-xl border border-surface-border">
          <table className="w-full min-w-max border-collapse text-left text-xs">
            <thead className="bg-surface-card text-slate-300">
              <tr>
                {headers.map((header, index) => (
                  <th key={index} className="border-b border-surface-border px-3 py-2 font-semibold">
                    {renderInlineMarkdown(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-surface-border/60">
                  {headers.map((_, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2 align-top text-slate-300">
                      {renderInlineMarkdown(row[cellIndex] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    if (isListLine(line)) {
      const ordered = /^\s*[0-9]+\.\s+/.test(line)
      const items = []
      while (i < lines.length && isListLine(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*+]|[0-9]+\.|[\u2022])\s+/, ''))
        i += 1
      }
      const ListTag = ordered ? 'ol' : 'ul'
      blocks.push(
        <ListTag
          key={`${keyPrefix}-list-${i}`}
          className={clsx('my-2 space-y-1 pl-5', ordered ? 'list-decimal' : 'list-disc')}
        >
          {items.map((item, index) => (
            <li key={index} className="pl-1">
              {renderInlineWithBreaks(item, `${keyPrefix}-list-${i}-${index}`)}
            </li>
          ))}
        </ListTag>,
      )
      continue
    }

    const paragraph = [line]
    i += 1
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*---+\s*$/.test(lines[i]) &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !(lines[i].includes('|') && lines[i + 1] && isTableDivider(lines[i + 1])) &&
      !isListLine(lines[i])
    ) {
      paragraph.push(lines[i])
      i += 1
    }

    blocks.push(
      <p key={`${keyPrefix}-p-${i}`} className="my-2 first:mt-0 last:mb-0">
        {renderInlineWithBreaks(paragraph.join('\n'), `${keyPrefix}-p-${i}`)}
      </p>,
    )
  }

  return blocks
}

function FormattedMessage({ content }) {
  const text = String(content ?? '')
  const blocks = []
  let lastIndex = 0
  let match

  FENCE_RE.lastIndex = 0
  while ((match = FENCE_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      blocks.push(...renderTextBlocks(text.slice(lastIndex, match.index), `text-${lastIndex}`))
    }
    blocks.push(
      <pre
        key={`code-${match.index}`}
        className="my-3 max-h-96 max-w-full overflow-auto rounded-xl border border-surface-border bg-surface-card p-3 text-xs leading-relaxed"
      >
        <code className="font-mono text-slate-200">{match[2].trimEnd()}</code>
      </pre>,
    )
    lastIndex = FENCE_RE.lastIndex
  }

  if (lastIndex < text.length) {
    blocks.push(...renderTextBlocks(text.slice(lastIndex), `text-${lastIndex}`))
  }

  return <div className="max-w-full overflow-visible break-words">{blocks.length ? blocks : text}</div>
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={clsx('flex gap-3 overflow-visible', isUser ? 'flex-row-reverse' : 'flex-row')}
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
      <div className={clsx('min-w-0 max-w-[75%] space-y-1', isUser ? 'items-end' : 'items-start', 'flex flex-col')}>
        <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
          <FormattedMessage content={msg.content} />
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
