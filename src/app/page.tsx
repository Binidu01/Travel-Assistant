'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Palmtree,
  Hotel,
  Heart,
  Umbrella,
  Send,
  Bot,
  CircleDollarSign,
  Sparkles,
  Star,
  Square,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface Message {
  id: string;
  role: 'user' | 'bot' | 'error';
  content: string;
  displayContent: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface HistoryEntry {
  role: string;
  content: string;
}

// ============================================
// QUICK SUGGESTIONS
// ============================================

const SUGGESTIONS = [
  { icon: Hotel,            text: 'Hotels in Kandy',       query: 'Find me hotels in Kandy' },
  { icon: CircleDollarSign, text: 'Budget stays',           query: 'Cheap places to stay in Colombo' },
  { icon: Hotel,            text: 'Hotels in Ella',         query: 'Hotels in Ella' },
  { icon: Heart,            text: 'Honeymoon spots',        query: 'Best honeymoon hotels in Galle' },
  { icon: Umbrella,         text: 'Beach luxury',           query: 'Luxury beach hotels in Matara' },
  { icon: Hotel,            text: 'Hotels in Galle',        query: 'Hotels in Galle' },
  { icon: Star,             text: 'Top rated in Matara',    query: 'Best hotels in Matara' },
  { icon: Sparkles,         text: 'Luxury in Colombo',      query: 'Luxury hotels in Colombo' },
];

const ALL_SUGGESTIONS = [
  ...SUGGESTIONS.map(s => s.query),
  'Cheap hotels in Kandy',
  'Hotels in Negombo',
  'Beach hotels in Hikkaduwa',
  'Hotels in Nuwara Eliya',
  'Hotels in Jaffna',
  'Hotels in Trincomalee',
  'Hotels in Arugam Bay',
  'Hotels in Sigiriya',
  'Hotels in Anuradhapura',
  'Hotels in Polonnaruwa',
  'Luxury hotels in Galle',
  'Budget hotels in Ella',
  'Honeymoon hotels in Bentota',
  'Best hotels in Matara',
  'Show more',
  'Prices in Colombo',
  'Prices in Kandy',
];

// ============================================
// MARKDOWN MESSAGE RENDERER
// ============================================

function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ node, ...props }) => (
            <div className="table-scroll-wrapper">
              <table {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <thead {...props} />,
          tbody: ({ node, ...props }) => <tbody {...props} />,
          tr: ({ node, ...props }) => <tr {...props} />,
          th: ({ node, ...props }) => <th {...props} />,
          td: ({ node, ...props }) => <td {...props} />,
          p: ({ node, ...props }) => <p className="md-p" {...props} />,
          ul: ({ node, ...props }) => <ul className="md-ul" {...props} />,
          ol: ({ node, ...props }) => <ol className="md-ol" {...props} />,
          li: ({ node, ...props }) => <li className="md-li" {...props} />,
          h1: ({ node, ...props }) => <h1 className="md-h1" {...props} />,
          h2: ({ node, ...props }) => <h2 className="md-h2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="md-h3" {...props} />,
          strong: ({ node, ...props }) => <strong className="md-strong" {...props} />,
          em: ({ node, ...props }) => <em className="md-em" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="md-blockquote" {...props} />
          ),
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code className="md-code-inline" {...props} />
            ) : (
              <pre className="md-pre">
                <code {...props} />
              </pre>
            ),
          hr: () => <hr className="md-hr" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  // Conversation history stored on the client, sent to the stateless API each turn
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTypingResponse, setIsTypingResponse] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  // ref to track typing state inside closures (avoids stale closure bug)
  const isTypingRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    if (input.trim().length > 0) {
      const filtered = ALL_SUGGESTIONS.filter(s =>
        s.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 5);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const stopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    isTypingRef.current = false;

    setMessages((prev) => {
      const updated = [...prev];
      const lastMessage = updated[updated.length - 1];
      if (lastMessage && lastMessage.role === 'bot' && lastMessage.isTyping) {
        lastMessage.isTyping = false;
        if (!lastMessage.displayContent) {
          lastMessage.displayContent = lastMessage.content.substring(0, 100) + '... [stopped]';
        }
      }
      return updated;
    });

    setIsTypingResponse(false);
    setIsLoading(false);
  };

  const addMessage = (role: 'user' | 'bot' | 'error', content: string, displayContent?: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: uuidv4(),
        role,
        content,
        displayContent: displayContent || content,
        timestamp: new Date(),
        isTyping: role === 'bot' && !displayContent,
      },
    ]);
  };

  const updateLastMessage = (displayContent: string, isComplete: boolean = false) => {
    setMessages((prev) => {
      const updated = [...prev];
      const lastMessage = updated[updated.length - 1];
      if (lastMessage && lastMessage.role === 'bot') {
        lastMessage.displayContent = displayContent;
        if (isComplete) {
          lastMessage.isTyping = false;
        }
      }
      return updated;
    });
  };

  const startTypingAnimation = (fullText: string) => {
    let currentText = '';
    let index = 0;

    const typeNextChar = () => {
      if (!isTypingRef.current) return;

      if (index < fullText.length) {
        currentText += fullText[index];
        updateLastMessage(currentText, false);
        index++;
        const delay = Math.random() * 30 + 15;
        typingTimeoutRef.current = setTimeout(typeNextChar, delay);
      } else {
        updateLastMessage(fullText, true);
        isTypingRef.current = false;
        setIsTypingResponse(false);
        typingTimeoutRef.current = null;
        abortControllerRef.current = null;
      }
    };

    typeNextChar();
  };

  const handleSend = async (text?: string) => {
    const userMessage = (text ?? input).trim();
    if (!userMessage || isLoading || isTypingResponse) return;

    addMessage('user', userMessage);
    setInput('');
    setShowSuggestions(false);
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send conversation history alongside the new message (stateless API)
        body: JSON.stringify({ message: userMessage, history }),
        signal: abortControllerRef.current.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        addMessage('error', data.error || 'Something went wrong');
        abortControllerRef.current = null;
      } else if (data.reply) {
        // Store the updated history the server returns for the next turn
        if (data.history) {
          setHistory(data.history);
        }
        addMessage('bot', data.reply, '');
        isTypingRef.current = true;
        setIsTypingResponse(true);
        startTypingAnimation(data.reply);
      } else {
        addMessage('error', 'No response received');
        abortControllerRef.current = null;
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted by user');
      } else {
        addMessage('error', 'Sorry, something went wrong. Please try again.');
      }
      abortControllerRef.current = null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Palmtree className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Sri Lanka Travel Assistant</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 py-8">
              <Palmtree className="w-16 h-16 text-blue-400 mb-5" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Welcome to Sri Lanka!</h2>
              <p className="text-center text-gray-500 max-w-sm mb-8 text-sm leading-relaxed">
                Ask me to find hotels, compare options, or get live prices — anywhere in Sri Lanka.
              </p>
              <ul
                className="flex gap-2 flex-wrap justify-center max-w-2xl list-none p-0"
                aria-label="Quick suggestions"
              >
                {SUGGESTIONS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => handleSend(s.query)}
                        disabled={isLoading || isTypingResponse}
                        className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200
                                   rounded-full text-sm font-medium text-gray-700
                                   hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700
                                   transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        aria-label={`Suggestion: ${s.text}`}
                      >
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{s.text}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role !== 'user' && (
                <div
                  className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-cyan-500
                             flex items-center justify-center mr-2 mt-1 shadow-sm"
                >
                  <Bot className="w-4 h-4 text-white" aria-label="Assistant" />
                </div>
              )}

              <div
                className={`
                  ${msg.role === 'user' ? 'max-w-[75%]' : 'max-w-[85%] md:max-w-[80%]'}
                  rounded-2xl px-4 py-3 shadow-sm
                  ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : msg.role === 'error'
                      ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }
                `}
              >
                {msg.role === 'user' ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : msg.role === 'error' ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <MarkdownMessage content={msg.displayContent || msg.content} />
                )}

                <div
                  className={`text-xs mt-2 ${
                    msg.role === 'user' ? 'text-blue-100 text-right' : 'text-gray-400'
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}

          {(isLoading || isTypingResponse) && !messages.some(m => m.isTyping) && (
            <div className="flex justify-start mb-4">
              <div
                className="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-cyan-500
                           flex items-center justify-center mr-2 shadow-sm"
              >
                <Bot className="w-4 h-4 text-white" aria-label="Assistant" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-gray-200">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.32s]" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.16s]" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input bar with typing suggestions */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative" ref={suggestionsRef}>
              <label htmlFor="chat-input" className="sr-only">
                Type your message
              </label>
              <div className="flex items-center border border-gray-300 rounded-2xl
                              focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent
                              bg-white pr-2">
                <textarea
                  id="chat-input"
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => input.trim() && setShowSuggestions(true)}
                  disabled={isLoading || isTypingResponse}
                  placeholder='Ask anything — e.g. "Hotels in Kandy"'
                  rows={1}
                  className="flex-1 resize-none border-none outline-none bg-transparent
                             px-4 py-3 text-gray-700 text-sm overflow-hidden
                             disabled:bg-transparent disabled:cursor-not-allowed"
                />

                {/* Send / Stop Button */}
                {(isLoading || isTypingResponse) ? (
                  <button
                    type="button"
                    onClick={stopTyping}
                    aria-label="Stop generating"
                    className="shrink-0 p-2 bg-gray-400 text-white rounded-full
                             hover:bg-gray-500 active:scale-95 transition-all"
                  >
                    <Square className="w-4 h-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    aria-label="Send message"
                    className={`shrink-0 p-2 text-white rounded-full active:scale-95 transition-all
                             ${input.trim()
                               ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                               : 'bg-gray-400 cursor-not-allowed'
                             }`}
                  >
                    <Send className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              {showSuggestions && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
                  {filteredSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}