import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Compass, Loader2, Bot, User as UserIcon } from 'lucide-react';
import { IdeaDetail, AIMessage, AISummary, AIExpansion } from '../../types';
import { api } from '../../services/api';
import { useIdeas } from '../../context/IdeaContext';
import { PearlSparkle, CoquetteBow } from '../common/CoquetteBow';

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
      <div className="pb-3 border-b border-powder/60 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <h3 className="font-brand text-4xl font-normal text-cocoa lowercase leading-none">studio</h3>
          <span className="text-[10px] text-cocoa-muted font-sans border border-powder/60 px-2 py-0.5 rounded-full">
            {aiStatus?.configured
              ? `${aiStatus.provider} (${aiStatus.model})`
              : 'local'}
          </span>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSummarize}
            disabled={isSummarizing}
            className="px-3 py-1 rounded-full text-xs font-sans text-cocoa-muted hover:text-cocoa border border-powder/70 hover:border-cocoa-muted/50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSummarizing ? <Loader2 className="w-3 h-3 animate-spin text-rose" /> : <Sparkles className="w-3 h-3 text-cocoa-muted" />}
            <span>summarize</span>
          </button>
          <button
            onClick={handleExpand}
            disabled={isExpanding}
            className="px-3 py-1 rounded-full text-xs font-sans text-cocoa-muted hover:text-cocoa border border-powder/70 hover:border-cocoa-muted/50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {isExpanding ? <Loader2 className="w-3 h-3 animate-spin text-rose" /> : <Compass className="w-3 h-3 text-cocoa-muted" />}
            <span>expand</span>
          </button>
        </div>
      </div>

      {/* Main Conversation & Generated Intelligence Feed */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
        {/* Summarize Result Banner (if triggered) */}
        {summaryData && (
          <div className="bg-blush/30 border border-powder/70 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-cocoa font-sans font-medium text-xs">
              <Sparkles className="w-3.5 h-3.5 text-rose" />
              <span>Summary</span>
            </div>
            <p className="font-serif text-sm font-semibold text-cocoa">{summaryData.one_sentence_summary}</p>
            <p className="text-cocoa/90 leading-relaxed font-sans">{summaryData.detailed_explanation}</p>
            <div className="pt-2 border-t border-powder/70">
              <span className="text-xs text-cocoa-muted font-sans block mb-1">Key Themes:</span>
              <div className="flex flex-wrap gap-1.5">
                {summaryData.key_themes.map((th, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full bg-pearl border border-powder/70 text-xs text-cocoa font-sans">
                    {th}
                  </span>
                ))}
              </div>
            </div>
            {summaryData.unresolved_questions?.length > 0 && (
              <div className="pt-2 border-t border-powder/70">
                <span className="text-xs text-cocoa-muted font-sans block mb-1">Questions:</span>
                <ul className="list-disc list-inside space-y-0.5 text-cocoa/80 font-sans">
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
          <div className="bg-pearl border border-powder/70 rounded-2xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center gap-1.5 text-cocoa font-sans font-medium text-xs">
              <Compass className="w-3.5 h-3.5 text-rose" />
              <span>Expansion</span>
            </div>
            <div>
              <span className="text-xs text-cocoa-muted font-sans block mb-1">Potential Directions:</span>
              <ul className="list-disc list-inside space-y-0.5 text-cocoa/80 font-sans">
                {expansionData.possible_directions.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
            <div className="pt-2 border-t border-powder/70">
              <span className="text-xs text-cocoa-muted font-sans block mb-1">First Experiments:</span>
              <ul className="list-disc list-inside space-y-0.5 text-cocoa/80 font-sans">
                {expansionData.first_experiments.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
            <div className="pt-2 border-t border-powder/70 bg-blush/20 p-2.5 rounded-xl border border-powder/60">
              <span className="text-xs text-cocoa font-sans block mb-0.5 font-medium">Next Step:</span>
              <p className="text-cocoa font-sans">{expansionData.realistic_next_step}</p>
            </div>
          </div>
        )}

        {/* Welcome Message if chat is empty */}
        {messages.length === 0 && !summaryData && !expansionData && (
          <div className="text-center py-12 px-4">
            <p className="text-xs font-sans text-cocoa-muted">Explore thoughts or ask questions about this idea</p>
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
                <div className="w-6 h-6 rounded-full bg-blush border border-powder flex items-center justify-center shrink-0 text-rose text-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed font-sans shadow-sm ${
                  isUser
                    ? 'bg-rose text-white rounded-tr-none'
                    : 'bg-pearl border border-powder text-cocoa rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <span className={`text-[9px] mt-1 block opacity-70 ${isUser ? 'text-white/80' : 'text-mauve'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {isUser && (
                <div className="w-6 h-6 rounded-full bg-powder/60 border border-powder flex items-center justify-center shrink-0 text-cocoa text-xs">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-cocoa-muted pl-8 font-sans">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose" />
            <span>Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSendMessage} className="pt-3 border-t border-powder/60 shrink-0">
        <div className="flex items-center gap-2 bg-pearl border border-powder/70 rounded-2xl p-1.5 focus-within:border-cocoa-muted/40 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this idea..."
            className="flex-1 bg-transparent text-xs text-cocoa placeholder:text-cocoa-faint focus:outline-none px-3 py-1 font-sans"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-2 rounded-xl bg-cocoa text-pearl hover:bg-cocoa-dark disabled:opacity-40 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
