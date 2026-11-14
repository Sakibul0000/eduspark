import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { COURSES_CATALOG, useApp } from '../context/AppContext';
import { MarkdownMessage } from '../components/MarkdownMessage';

interface AiTutorViewProps {
  initialCourseContext?: string;
  initialPrompt?: string;
  onConsumeInitialPrompt: () => void;
}

const SUGGESTED_PROMPTS = [
  'Explain machine learning simply',
  'Teach me Python',
  'Create a study plan',
  'Explain data structures',
  'Give me five practice questions',
];

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export const AiTutorView: React.FC<AiTutorViewProps> = ({
  initialCourseContext,
  initialPrompt,
  onConsumeInitialPrompt,
}) => {
  const { chatHistory, appendChatMessage, clearChatHistory } = useApp();

  const [input, setInput] = useState('');
  const [courseContext, setCourseContext] = useState<string>(initialCourseContext || '');
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.geminiConfigured === 'boolean') {
          setGeminiConfigured(d.geminiConfigured);
        }
      })
      .catch(() => setGeminiConfigured(false));
  }, []);

  useEffect(() => {
    if (initialCourseContext) {
      setCourseContext(initialCourseContext);
    }
  }, [initialCourseContext]);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      onConsumeInitialPrompt();
    }
  }, [initialPrompt, onConsumeInitialPrompt]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory.length, sending]);

  const sendMessage = async (textOverride?: string) => {
    const promptText = (textOverride ?? input).trim();
    if (!promptText || sending) return;

    setErrorMsg(null);
    setStatusNotice(null);
    if (!textOverride) setInput('');
    setSending(true);

    try {
      await appendChatMessage('user', promptText, courseContext || undefined, false);

      const historyPayload = chatHistory.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: promptText,
          history: historyPayload,
          courseContext: courseContext || undefined,
        }),
      });

      const data = (await res.json()) as {
        reply?: string;
        isDemo?: boolean;
        notice?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to get response from AI Tutor.');
      }

      if (data.notice) {
        setStatusNotice(data.notice);
      }

      await appendChatMessage(
        'assistant',
        data.reply || 'I could not generate a response. Please try asking again.',
        courseContext || undefined,
        Boolean(data.isDemo)
      );
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleClear = async () => {
    if (chatHistory.length === 0 || clearing) return;
    setClearing(true);
    try {
      await clearChatHistory();
      setStatusNotice(null);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] min-h-[540px] max-w-5xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10182C] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-display text-base font-bold text-slate-900 dark:text-white">
              EduSpark AI Tutor
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {geminiConfigured === false
                ? 'Demo Assistant Mode · Predefined educational guides'
                : 'Concepts, study notes, debugging & practice questions'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            aria-label="Course study context"
            value={courseContext}
            onChange={(e) => setCourseContext(e.target.value)}
            className="max-w-[200px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">General Study Mode</option>
            {COURSES_CATALOG.map((c) => (
              <option key={c.id} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={chatHistory.length === 0 || clearing}
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 whitespace-nowrap"
          >
            {clearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Notices */}
      {(statusNotice || errorMsg) && (
        <div className="px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-amber-50/70 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg || statusNotice}</span>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-6 py-8">
            <div className="space-y-2">
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                How can I help you learn today?
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Ask for step-by-step explanations, paste code to debug, request study notes, or choose a starter prompt below.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1120] text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-violet-500 hover:text-indigo-600 dark:hover:text-violet-300 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {chatHistory.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-3.5 ${
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                        : 'border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      <MarkdownMessage content={msg.content} />
                    )}
                  </div>
                  <div className="mt-1 px-1 flex items-center gap-2 text-[11px] text-slate-400 tabular-nums">
                    <span>{isUser ? 'You' : msg.isDemo ? 'Demo Assistant' : 'EduSpark AI Tutor'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatTime(msg.createdAt)}</span>
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex items-start">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] px-4 py-3 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-violet-400" />
                  <span>EduSpark AI Tutor is thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Quick Prompts Bar when chat is active */}
      {chatHistory.length > 0 && (
        <div className="px-4 sm:px-6 py-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={sending}
              onClick={() => sendMessage(prompt)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-violet-500 whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0B1120] flex items-end gap-3"
      >
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Ask a question, paste code to debug, or request practice problems..."
          aria-label="Message EduSpark AI Tutor"
          className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#10182C] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 max-h-32"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 shrink-0"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
