import React, { useState } from "react";
import { Sparkles, CheckCircle, RefreshCw, Layers, Compass, Zap } from "lucide-react";
import { AISuggestion, Portfolio } from "../types";

interface UpgradeSuggestionsProps {
  portfolio: Portfolio;
  suggestions: AISuggestion[];
  onApply: (suggestion: AISuggestion) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export default function UpgradeSuggestions({ 
  portfolio, 
  suggestions, 
  onApply, 
  onRefresh 
}: UpgradeSuggestionsProps) {
  const [loadingSuggestionId, setLoadingSuggestionId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const handleApplyClick = async (sug: AISuggestion) => {
    setLoadingSuggestionId(sug.id);
    try {
      await onApply(sug);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSuggestionId(null);
    }
  };

  const handleRefreshClick = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="bg-[#080808] border border-white/10 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
          <h3 className="font-extrabold font-mono uppercase tracking-widest text-[#F5F5F5] text-xs">Weekly AI Upgrades</h3>
        </div>
        <button 
          onClick={handleRefreshClick}
          disabled={refreshing}
          className="p-1.5 px-3 rounded bg-neutral-900 hover:bg-neutral-800 border border-white/10 disabled:opacity-40 text-[10px] text-[#F5F5F5] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
          <span>Analyze & Suggest</span>
        </button>
      </div>

      <div className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Compass className="w-8 h-8 text-neutral-600 mx-auto mb-2 animate-pulse" />
            <p className="text-xs text-neutral-400 font-bold font-mono uppercase tracking-wider">Suggestions Deck Empty</p>
            <p className="text-[10px] text-neutral-500 max-w-xs mx-auto mt-1">Click Analyze to let the AI scan your portfolio keywords, layout structures, and styling guides for optimization tips.</p>
          </div>
        ) : (
          suggestions.map((sug) => (
            <div 
              key={sug.id} 
              className={`p-4 border rounded-xl relative overflow-hidden transition-all duration-300 ${sug.applied ? "bg-white/5 border-white/20" : "bg-black/45 border-white/10 hover:border-white/25"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-left space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${sug.type === "seo" ? "bg-white/10 text-white border border-white/15" : "bg-white/10 text-white border border-white/15"}`}>
                      {sug.type}
                    </span>
                    {sug.applied && (
                      <span className="text-[9px] bg-white/10 text-white border border-white/20 rounded px-2 py-0.5 font-mono flex items-center gap-1 font-bold">
                        <CheckCircle className="w-3 h-3" />
                        <span>Applied</span>
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-xs">{sug.title}</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">{sug.description}</p>
                </div>
                
                {!sug.applied && (
                  <button 
                    onClick={() => handleApplyClick(sug)}
                    disabled={loadingSuggestionId !== null}
                    className="p-1 px-3 rounded bg-white hover:bg-neutral-200 text-[10px] font-black uppercase tracking-wider text-black shadow-md disabled:bg-neutral-850 disabled:text-neutral-500 transition-all shrink-0 self-center"
                  >
                    {loadingSuggestionId === sug.id ? (
                      <RefreshCw className="w-3.5 h-3.5 text-black animate-spin mx-auto" />
                    ) : (
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>Apply</span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
