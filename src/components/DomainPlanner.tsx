import React, { useState } from "react";
import { Search, Globe, Check, Sliders, Sparkles, ShoppingBag } from "lucide-react";
import { Portfolio } from "../types";

interface DomainPlannerProps {
  portfolio: Portfolio;
}

interface DomainSuggestion {
  domain: string;
  badge: string;
}

export default function DomainPlanner({ portfolio }: DomainPlannerProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<DomainSuggestion[]>([]);
  const [registeredDomain, setRegisteredDomain] = useState<string | null>(null);

  const generateDomains = async () => {
    setLoading(true);
    setRegisteredDomain(null);
    try {
      const name = portfolio.sections.hero.name || "dev_user";
      const res = await fetch("/api/portfolio/domain-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name, style: portfolio.style })
      });
      const data = await res.json();
      setSuggestions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (domain: string) => {
    setRegisteredDomain(domain);
  };

  return (
    <div className="bg-[#080808] border border-white/10 rounded-2xl p-6 shadow-xl text-left space-y-4">
      <div className="pb-2 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-white" />
          <h3 className="font-extrabold font-mono uppercase tracking-widest text-[#F5F5F5] text-xs">AI Domain Configurator</h3>
        </div>
        <button 
          onClick={generateDomains}
          disabled={loading}
          className="p-1.5 px-3 bg-white hover:bg-neutral-200 text-black text-[10px] font-black uppercase tracking-wider font-mono rounded shadow transition-all flex items-center gap-1.5"
        >
          {loading ? "Matching..." : "Match Domains"}
        </button>
      </div>

      <p className="text-neutral-400 text-[11px] leading-relaxed">
        Let Gemini design custom address combinations matching your style tagline. Establish an authoritative primary brand home.
      </p>

      {registeredDomain && (
        <div className="p-3 bg-white/10 border border-white/20 rounded-xl text-xs text-[#F5F5F5] flex items-center gap-2 font-mono">
          <Check className="w-4 h-4 text-white shrink-0" />
          <span>Simulated domain registration successful: <strong>{registeredDomain}</strong> has been bound to your live portfolio DNS records!</span>
        </div>
      )}

      <div className="space-y-2">
        {suggestions.length === 0 ? (
          <div className="text-center py-6 text-neutral-500 text-xs border border-dashed border-white/10 rounded-xl">
            No custom domains matched, click 'Match Domains' to query.
          </div>
        ) : (
          suggestions.map((item, idx) => (
            <div 
              key={idx}
              className="p-3 bg-black/50 border border-white/10 rounded-xl flex items-center justify-between gap-4 hover:border-white/20 transition-all text-xs"
            >
              <div className="text-left space-y-0.5">
                <p className="font-mono text-white font-semibold">{item.domain}</p>
                <span className="inline-block text-[9px] bg-white/10 text-white border border-white/15 rounded px-1.5 py-0.5 font-bold font-mono uppercase">
                  {item.badge}
                </span>
              </div>
              
              <button 
                onClick={() => handleRegister(item.domain)}
                disabled={registeredDomain === item.domain}
                className={`py-1 px-3.5 rounded font-bold text-[10px] transition-all flex items-center gap-1 ${registeredDomain === item.domain ? "bg-white/20 text-white cursor-default" : "bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-white font-mono uppercase"}`}
              >
                {registeredDomain === item.domain ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Registered</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3 h-3" />
                    <span>Clinch</span>
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
