import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Compass, HelpCircle, Loader2, Bot, User as UserIcon } from 'lucide-react';
import { IdeaDetail, AIMessage, AISummary, AIExpansion } from '../../types';
import { api } from '../../services/api';
import { useIdeas } from '../../context/IdeaContext';

interface AIChatTabProps {
  idea: IdeaDetail;
}

export const AIChatTab: React.FC<AIChatTabProps> = ({ idea }) => {
  const { aiStatus, refreshSelectedIdea } = useIdeas();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [summaryData, setSummaryData] = useState<AISummary | null>(null);
  const [expansionData, setExpansionData] = useState<AIExpansion | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load chat history on mount
  useEffect(() => {
    api.getChatHistory(idea.id).then(setMessages).catch(() => {});
  }, [idea.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, summaryData, expansionData]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setInput('');
    setIsSending(true);

    // Optimistic user message
    const tempMsg: AIMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const botReply = await api.sendChatMessage(idea.id, userText);
      setMessages((prev) => [...prev.filter((m) => m.id !== tempMsg.id), tempMsg, botReply]);
    } catch {
      // Revert on error
    } finally {
      setIsSending(false);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const res = await api.summarizeIdea(idea.id);
      setSummaryData(res);
      refreshSelectedIdea();
    } catch {
      // ignore
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleExpand = async () => {
    setIsExpanding(true);
    try {
      const res = await api.expandIdea(idea.id);
      setExpansionData(res);
      refreshSelectedIdea();
    } catch {
      // ignore
    } finally {
      setIsExpanding(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] max-h-[75vh] animate-in fade-in duration-200">
      {/* Top AI Bar & Action Buttons */}
      <div className="pb-3 border-b border-midnight-700/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cosmic-lavender animate-pulse" />
          <span className="text-xs font-semibold text-ivory-100">AI Creative Studio</span>
          <span className="text-[10px] text-slate-400 bg-midnight-800 px-2 py-0.5 rounded border border-midnight-700">
            {aiStatus?.configured
              ? `${aiStatus.provider.toUpperCase()} (${aiStatus.model})`
              : 'Local Heuristic Mode'}
          </span>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSummarize}
            disabled={isSummarizing}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-midnight-800 border border-midnight-700 hover:border-cosmic-lavender text-ivory-100 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {isSummarizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-cosmic-lavender" />}
            <span>Summarize</span>
          </button>
          <button
            onClick={handleExpand}
            disabled={isExpanding}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-midnight-800 border border-midnight-700 hover:border-cosmic-cyan text-ivory-100 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {isExpanding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Compass className="w-3 h-3 text-cosmic-cyan" />}
            <span>Expand Idea</span>
          </button>
        </div>
      </div>

      {/* Main Conversation & Generated Intelligence Feed */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
        {/* Summarize Result Banner (if triggered) */}
        {summaryData && (
          <div className="bg-midnight-800/80 border border-cosmic-lavender/40 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-cosmic-lavender font-bold uppercase tracking-wider text-[10px]">
              <Sparkles className="w-3 h-3" />
              <span>Executive Synthesis</span>
            </div>
            <p className="font-semibold text-ivory-100">{summaryData.one_sentence_summary}</p>
            <p className="text-slate-300 leading-relaxed">{summaryData.detailed_explanation}</p>
            <div className="pt-2 border-t border-midnight-700/60">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Key Themes:</span>
              <div className="flex flex-wrap gap-1.5">
                {summaryData.key_themes.map((th, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-midnight-900 border border-midnight-700 text-[11px] text-cosmic-lavender">
                    {th}
                  </span>
                ))}
              </div>
            </div>
            {summaryData.unresolved_questions?.length > 0 && (
              <div className="pt-2 border-t border-midnight-700/60">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Questions to Explore:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                  {summaryData.unresolved_questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Expansion Result Banner (if triggered) */}
        {expansionData && (
          <div className="bg-midnight-800/80 border border-cosmic-cyan/40 rounded-xl p-3.5 space-y-2.5 text-xs">
            <div className="flex items-center gap-1.5 text-cosmic-cyan font-bold uppercase tracking-wider text-[10px]">
              <Compass className="w-3 h-3" />
              <span>Actionable Expansion</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Directions:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                {expansionData.possible_directions.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
            <div className="pt-2 border-t border-midnight-700/60">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">First Experiments:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                {expansionData.first_experiments.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
            <div className="pt-2 border-t border-midnight-700/60 bg-midnight-900/60 p-2 rounded-lg">
              <span className="text-[10px] text-cosmic-mint font-semibold uppercase tracking-wider block mb-0.5">Recommended Next Step (48h):</span>
              <p className="text-ivory-100 font-medium">{expansionData.realistic_next_step}</p>
            </div>
          </div>
        )}

        {/* Welcome Message if chat is empty */}
        {messages.length === 0 && !summaryData && !expansionData && (
          <div className="text-center py-10 px-4">
            <Bot className="w-8 h-8 text-cosmic-lavender mx-auto mb-2 opacity-80" />
            <h4 className="text-xs font-semibold text-ivory-100">Brainstorm with your idea</h4>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
              Ask questions, explore edge cases, test naming ideas, or generate prototype architectures.
            </p>
          </div>
        )}

        {/* Messages List */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-full bg-cosmic-lavender/20 border border-cosmic-lavender/40 flex items-center justify-center shrink-0 text-cosmic-lavender text-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-cosmic-lavender text-white rounded-tr-none'
                    : 'bg-midnight-800/90 border border-midnight-700 text-ivory-100 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <span className="text-[9px] text-slate-400 mt-1 block opacity-70">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {isUser && (
                <div className="w-6 h-6 rounded-full bg-midnight-700 flex items-center justify-center shrink-0 text-ivory-300 text-xs">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-8">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cosmic-lavender" />
            <span>Formulating insights...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSendMessage} className="pt-3 border-t border-midnight-700/80 shrink-0">
        <div className="flex items-center gap-2 bg-midnight-800/90 border border-midnight-700 rounded-xl p-1.5 focus-within:border-cosmic-lavender">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask anything about "${idea.title}"...`}
            className="flex-1 bg-transparent text-xs text-ivory-100 placeholder-slate-500 focus:outline-none px-2 py-1"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-2 rounded-lg bg-cosmic-lavender text-white hover:bg-purple-600 disabled:opacity-40 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
