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
      <div className="pb-3 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-iridescent-lavender animate-pulse" />
          <span className="text-xs font-bold text-charcoal font-sans">AI Creative Studio</span>
          <span className="text-[10px] text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200 font-sans">
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
            className="px-3 py-1 rounded-xl text-xs font-semibold bg-white border border-stone-200 hover:border-stone-300 text-charcoal flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
          >
            {isSummarizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-iridescent-lavender" />}
            <span>Summarize</span>
          </button>
          <button
            onClick={handleExpand}
            disabled={isExpanding}
            className="px-3 py-1 rounded-xl text-xs font-semibold bg-white border border-stone-200 hover:border-stone-300 text-charcoal flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
          >
            {isExpanding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Compass className="w-3 h-3 text-iridescent-cyan" />}
            <span>Expand Idea</span>
          </button>
        </div>
      </div>

      {/* Main Conversation & Generated Intelligence Feed */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
        {/* Summarize Result Banner (if triggered) */}
        {summaryData && (
          <div className="bg-iridescent-lavender/10 border border-iridescent-lavender/25 rounded-2xl p-4.5 space-y-2 text-xs shadow-sm">
            <div className="flex items-center gap-1.5 text-stone-700 font-editorial italic text-sm">
              <Sparkles className="w-3.5 h-3.5 text-iridescent-lavender" />
              <span>Thought Synthesis</span>
            </div>
            <p className="font-serif text-sm font-bold text-charcoal">{summaryData.one_sentence_summary}</p>
            <p className="text-stone-700 leading-relaxed font-sans">{summaryData.detailed_explanation}</p>
            <div className="pt-2 border-t border-stone-200/60">
              <span className="text-xs text-stone-500 font-editorial italic block mb-1">Key Themes:</span>
              <div className="flex flex-wrap gap-1.5">
                {summaryData.key_themes.map((th, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full bg-white border border-iridescent-lavender/30 text-xs text-stone-700 font-medium shadow-sm">
                    {th}
                  </span>
                ))}
              </div>
            </div>
            {summaryData.unresolved_questions?.length > 0 && (
              <div className="pt-2 border-t border-stone-200/60">
                <span className="text-xs text-stone-500 font-editorial italic block mb-1">Questions to Explore:</span>
                <ul className="list-disc list-inside space-y-0.5 text-stone-600 font-sans">
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
          <div className="bg-iridescent-cyan/10 border border-iridescent-cyan/25 rounded-2xl p-4.5 space-y-2.5 text-xs shadow-sm">
            <div className="flex items-center gap-1.5 text-stone-700 font-editorial italic text-sm">
              <Compass className="w-3.5 h-3.5 text-iridescent-cyan" />
              <span>Creative Horizons</span>
            </div>
            <div>
              <span className="text-xs text-stone-500 font-editorial italic block mb-1">Potential Paths:</span>
              <ul className="list-disc list-inside space-y-0.5 text-stone-600 font-sans">
                {expansionData.possible_directions.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
            <div className="pt-2 border-t border-stone-200/60">
              <span className="text-xs text-stone-500 font-editorial italic block mb-1">First Experiments:</span>
              <ul className="list-disc list-inside space-y-0.5 text-stone-600 font-sans">
                {expansionData.first_experiments.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
            <div className="pt-2 border-t border-stone-200/60 bg-white p-3 rounded-xl shadow-sm border border-stone-200/70">
              <span className="text-xs text-emerald-700 font-editorial italic block mb-0.5">Gentle Next Step (48h):</span>
              <p className="text-charcoal font-medium font-sans">{expansionData.realistic_next_step}</p>
            </div>
          </div>
        )}

        {/* Welcome Message if chat is empty */}
        {messages.length === 0 && !summaryData && !expansionData && (
          <div className="text-center py-10 px-4">
            <Bot className="w-8 h-8 text-iridescent-lavender mx-auto mb-2 opacity-80" />
            <h4 className="text-xs font-bold text-charcoal">Brainstorm with your idea</h4>
            <p className="text-[11px] text-stone-400 max-w-xs mx-auto mt-1 font-sans">
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
                <div className="w-6 h-6 rounded-full bg-iridescent-lavender/20 border border-iridescent-lavender/40 flex items-center justify-center shrink-0 text-iridescent-lavender text-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed font-sans shadow-sm ${
                  isUser
                    ? 'bg-gradient-to-r from-iridescent-lavender to-iridescent-cyan text-white rounded-tr-none'
                    : 'bg-white border border-stone-200/90 text-charcoal rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <span className={`text-[9px] mt-1 block opacity-70 ${isUser ? 'text-white/80' : 'text-stone-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {isUser && (
                <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center shrink-0 text-stone-600 text-xs">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-stone-400 pl-8 font-sans">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-iridescent-lavender" />
            <span>Formulating insights...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSendMessage} className="pt-3 border-t border-stone-200/80 shrink-0">
        <div className="flex items-center gap-2 bg-white border border-stone-200/90 rounded-2xl p-1.5 shadow-sm focus-within:border-iridescent-lavender">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask anything about "${idea.title}"...`}
            className="flex-1 bg-transparent text-xs text-charcoal placeholder-stone-400 focus:outline-none px-3 py-1 font-sans"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-2 rounded-xl bg-gradient-to-r from-iridescent-lavender to-iridescent-cyan text-white hover:opacity-95 disabled:opacity-40 transition-all cursor-pointer shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
