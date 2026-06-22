import React, { useState, useRef, useEffect } from "react";
import { 
  Send, Sparkles, User, Database, Terminal, 
  MessageSquare, Sliders, RefreshCw, AlertCircle, ArrowUpRight 
} from "lucide-react";
import { ChatMessage, Portfolio } from "../types";

interface ChatCoachProps {
  portfolio: Portfolio;
  onPortfolioUpdate: (updatedPortfolio: Portfolio, statusMessage: string) => void;
  conversationHistory: ChatMessage[];
  onAddMessage: (msg: ChatMessage) => void;
}

export default function ChatCoach({ 
  portfolio, 
  onPortfolioUpdate, 
  conversationHistory, 
  onAddMessage 
}: ChatCoachProps) {
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || loading) return;

    const userPrompt = userInput.trim();
    setUserInput("");
    setErrorMsg("");
    setLoading(true);

    // 1. Create and log user message
    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      role: "user",
      content: userPrompt,
      timestamp: new Date().toISOString()
    };
    onAddMessage(userMsg);

    try {
      // 2. Query server-side Gemini NLP updater proxy
      const res = await fetch("/api/portfolio/update-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt,
          currentPortfolio: portfolio,
          conversationHistory: conversationHistory.slice(-10) // provide matching context history
        })
      });

      if (!res.ok) {
        throw new Error("The portfolio update pipeline failed on the server.");
      }

      const data = await res.json();
      
      // 3. Create assistant message
      const assistantMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        role: "assistant",
        content: data.assistantMessage || "I've successfully updated your website code and committed the changes to your repository!",
        timestamp: new Date().toISOString()
      };
      onAddMessage(assistantMsg);

      // 4. Update the parent portfolio state instantly!
      if (data.updatedPortfolio) {
        onPortfolioUpdate(data.updatedPortfolio, data.assistantMessage);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Could not execute natural language update on code.");
      const errorSystemMsg: ChatMessage = {
        id: `m-${Date.now() + 2}`,
        role: "system",
        content: "Error: The generative design engine encountered an exception. Please retry with a restated prompt.",
        timestamp: new Date().toISOString()
      };
      onAddMessage(errorSystemMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Dynamic Header details */}
      <div className="bg-slate-900 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <div className="text-left">
            <h3 className="font-bold text-white text-xs">AI Portfolio Coach</h3>
            <p className="text-[10px] text-slate-400">Natural language code updates</p>
          </div>
        </div>
        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-2 py-0.5 font-mono">
          Vercel Connected
        </span>
      </div>

      {/* Discussion messages timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {conversationHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <MessageSquare className="w-8 h-8 text-slate-600 animate-bounce" />
            <p className="text-slate-300 font-bold text-xs">Design & Edit with AI</p>
            <p className="text-slate-500 text-[11px] max-w-xs">
              Tell me what changes you want to apply. For example:
              <br />
              <span className="text-slate-400 italic">"Add my internship of 2026 at Google"</span> or
              <br />
              <span className="text-slate-400 italic">"Change primary accent to hot cyberpunk violet"</span>
            </p>
          </div>
        ) : (
          conversationHistory.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex items-start gap-2.5 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div 
                className={`p-2.5 rounded-xl border leading-relaxed text-left ${
                  msg.role === "user" 
                    ? "bg-indigo-600 border-indigo-500 text-white" 
                    : msg.role === "system"
                    ? "bg-red-500/10 border-red-500/20 text-rose-300"
                    : "bg-slate-900 border-slate-800 text-slate-200"
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
                <span className="block text-[8px] text-slate-500 mt-1 pb-0.5 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {errorMsg && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-slate-800 text-[10px] text-rose-300 flex items-center gap-1.5 font-sans">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/60 flex gap-2">
        <input 
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={loading ? "Deploying code updates..." : "Ask AI to change color, text, or add components..."}
          disabled={loading}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
        />
        <button 
          type="submit"
          disabled={!userInput.trim() || loading}
          className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-505 disabled:bg-slate-800 text-white disabled:text-slate-500 transition-colors shadow-md"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
