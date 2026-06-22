import React, { useState } from "react";
import { 
  Sparkles, ArrowRight, ArrowLeft, Github, 
  Linkedin, Chrome, Terminal, Palette, Sliders, Check, 
  Mail, Settings, CheckCircle2, AlertCircle
} from "lucide-react";
import { OnboardingAnswers } from "../types";

interface OnboardingWizardProps {
  onComplete: (answers: OnboardingAnswers) => void;
}

const DESIGN_STYLES = [
  { id: "Bold Typography", label: "Bold Typography", desc: "High contrast, big and heavy sans display typography with stark serif accents." },
  { id: "Modern Startup", label: "Modern Startup", desc: "Crisp and sleek like Stripe, Vercel & Linear." },
  { id: "Developer", label: "Developer Theme", desc: "Monospace and terminals like GitHub & Raycast." },
  { id: "Creative Designer", label: "Creative Designer", desc: "Splashes of gradients like Framer & Behance." },
  { id: "Luxury", label: "Luxury Brand", desc: "Premium serif fonts and expansive negative space like Apple & Tesla." },
  { id: "AI Futuristic", label: "AI Futuristic", desc: "Hexagons, grid meshes, and glowing traces like OpenAI & Nvidia." }
];

const PRESET_COLORS = [
  { name: "Bold Stark", colors: ["#ffffff", "#222222", "#050505"] },
  { name: "Matrix Green", colors: ["#10b981", "#047857", "#022c22"] },
  { name: "Neon Cyber", colors: ["#ec4899", "#a855f7", "#0f172a"] },
  { name: "Cosmic Obsidian", colors: ["#6366f1", "#4f46e5", "#030712"] },
  { name: "Apple Minimal", colors: ["#1c1917", "#78716c", "#fafaf9"] }
];

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Simulated login/fetch usernames
  const [githubUser, setGithubUser] = useState<string>("");
  const [linkedinUser, setLinkedinUser] = useState<string>("");
  const [googleStatus, setGoogleStatus] = useState<boolean>(false);

  // Core wizard responses
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    displayName: "",
    role: "",
    skills: "",
    experienceYears: "2",
    dreamRole: "",
    favoriteColors: ["#ffffff", "#222222"],
    favoriteBrands: ["Vercel", "Apple"],
    favoriteDesignStyle: "Bold Typography",
    favoriteAnimations: "Smooth transitions",
    featureEmail: "",
    resumeDownload: true,
    contactForm: true
  });

  const updateField = (field: keyof OnboardingAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const fetchProfileMeta = async (provider: "github" | "linkedin" | "google") => {
    setLoading(true);
    setErrorMessage("");
    try {
      const q = provider === "github" ? `username=${githubUser}` : provider === "linkedin" ? `username=${linkedinUser}` : "";
      const res = await fetch(`/api/simulation/profile?provider=${provider}&${q}`);
      const data = await res.json();
      
      if (provider === "github") {
        updateField("displayName", data.name);
        updateField("role", "Full Stack Developer");
        updateField("skills", data.repositories.map((r: any) => r.language).filter(Boolean).join(", ") || "TypeScript, Node, Python");
        updateField("favoriteDesignStyle", "Developer");
      } else if (provider === "linkedin") {
        updateField("displayName", data.name);
        updateField("role", data.headline || "Senior Architect");
        updateField("skills", data.skills.join(", "));
        updateField("favoriteDesignStyle", "Luxury");
      } else {
        updateField("displayName", data.name);
        updateField("featureEmail", data.email);
        setGoogleStatus(true);
      }
      
      // Auto advance slightly
      if (step === 0) setStep(1);
    } catch (err: any) {
      setErrorMessage("Could not compile profile metadata model.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && !answers.displayName.trim()) {
      setErrorMessage("Please enter your name to personalize the portfolio.");
      return;
    }
    setErrorMessage("");
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white font-bold text-lg animate-pulse">Scanning Social Connections...</p>
          <p className="text-slate-400 text-sm max-w-sm mt-2">Compiling project history, profile bios, and developer telemetry from OAuth streams.</p>
        </div>
      )}

      {/* Tabs / Step Navigation Indicator */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
          <span className="font-bold text-slate-200">Portfolio Wizard Setup</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          {[0, 1, 2, 3].map((s) => (
            <span 
              key={s} 
              className={`w-5 h-1.5 rounded-full transition-all duration-300 ${s === step ? "bg-indigo-500 w-8" : "bg-slate-800"}`}
            />
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className="space-y-6">
          <div className="text-center max-w-md mx-auto mb-8">
            <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">Connect Your Accounts</h2>
            <p className="text-slate-400 text-sm">
              We compile your bio, achievements, repositories, and stars in minutes to prefill your brand portfolio.
            </p>
          </div>

          <div className="space-y-4">
            {/* Google */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-3">
                <Chrome className="w-6 h-6 text-red-400" />
                <div className="text-left">
                  <p className="font-semibold text-white text-sm">Connect with Google</p>
                  <p className="text-xs text-slate-400">Prefills name, email, profile details</p>
                </div>
              </div>
              <button 
                onClick={() => fetchProfileMeta("google")}
                className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${googleStatus ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}
              >
                {googleStatus ? "Connected" : "Connect"}
              </button>
            </div>

            {/* GitHub */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-3 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Github className="w-6 h-6 text-slate-300" />
                  <div className="text-left">
                    <p className="font-semibold text-white text-sm">Connect GitHub Account</p>
                    <p className="text-xs text-slate-400">Pulls public repositories, languages, stars & commits</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value)}
                  placeholder="Enter GitHub Username (e.g. johnsmith)"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button 
                  onClick={() => fetchProfileMeta("github")}
                  disabled={!githubUser.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                >
                  Fetch
                </button>
              </div>
            </div>

            {/* LinkedIn */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-3 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Linkedin className="w-6 h-6 text-sky-400" />
                  <div className="text-left">
                    <p className="font-semibold text-white text-sm">Connect LinkedIn Profile</p>
                    <p className="text-xs text-slate-400">Prefills professional bio, job experience timeline & certificates</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={linkedinUser}
                  onChange={(e) => setLinkedinUser(e.target.value)}
                  placeholder="LinkedIn Profile URL / Name"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button 
                  onClick={() => fetchProfileMeta("linkedin")}
                  disabled={!linkedinUser.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors"
                >
                  Fetch
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 text-center">
            <button 
              onClick={handleNext}
              className="text-xs text-indigo-400 font-bold hover:underline"
            >
              Skip simulation & enter details manually →
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-1">Verify Your Core Profile</h2>
            <p className="text-xs text-slate-400">Double check these information before the AI designs the layouts.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
              <input 
                type="text" 
                value={answers.displayName}
                onChange={(e) => updateField("displayName", e.target.value)}
                placeholder="e.g. John Smith"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current/Target Professional Title</label>
              <input 
                type="text" 
                value={answers.role}
                onChange={(e) => updateField("role", e.target.value)}
                placeholder="e.g. Full Stack Developer, Lead Cloud Architect"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Years of Experience</label>
                <input 
                  type="number" 
                  value={answers.experienceYears}
                  onChange={(e) => updateField("experienceYears", e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Dream Job Role</label>
                <input 
                  type="text" 
                  value={answers.dreamRole}
                  onChange={(e) => updateField("dreamRole", e.target.value)}
                  placeholder="e.g. AI Product Lead"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Core Tech Stack (Comma Separated)</label>
              <textarea 
                rows={2}
                value={answers.skills}
                onChange={(e) => updateField("skills", e.target.value)}
                placeholder="React, TypeScript, Node.js, Python, PostgreSQL, Docker"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-1">Visual Design Preference</h2>
            <p className="text-xs text-slate-400">Select an architecture vibe that matches your career sector.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
            {DESIGN_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => updateField("favoriteDesignStyle", style.id)}
                className={`text-left p-4 rounded-xl border transition-all ${answers.favoriteDesignStyle === style.id ? "bg-indigo-600/20 border-indigo-500 shadow-md" : "bg-slate-950/60 border-slate-850 hover:border-slate-700"}`}
              >
                <p className="font-bold text-white text-sm">{style.label}</p>
                <p className="text-xs text-slate-400 mt-1">{style.desc}</p>
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Aesthetic Color Palette (Select matching preset)</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PRESET_COLORS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => updateField("favoriteColors", preset.colors)}
                  className="bg-slate-950 p-2 rounded-lg border border-slate-800 hover:border-slate-700 flex flex-col items-center gap-2"
                >
                  <div className="flex gap-1">
                    {preset.colors.slice(0, 3).map((col, i) => (
                      <span key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: col }} />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium truncate w-full text-center">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-1">Additional Affordances</h2>
            <p className="text-xs text-slate-400">Enable or disable supplementary components of your showcase.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Enter Public Contact Email</label>
              <input 
                type="email" 
                value={answers.featureEmail}
                onChange={(e) => updateField("featureEmail", e.target.value)}
                placeholder="e.g. contact@johnsmith.dev"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-850/50 border border-slate-800 rounded-xl">
              <div className="text-left">
                <p className="font-bold text-white text-sm">Resume Download CTA Button</p>
                <p className="text-xs text-slate-400">Adds an ATS-friendly pdf resume download toggle to the hero section</p>
              </div>
              <input 
                type="checkbox"
                checked={answers.resumeDownload}
                onChange={(e) => updateField("resumeDownload", e.target.checked)}
                className="w-5 h-5 accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-850/50 border border-slate-800 rounded-xl">
              <div className="text-left">
                <p className="font-bold text-white text-sm">Interactive Contact Form</p>
                <p className="text-xs text-slate-400">Includes secure client feedback form inside the contact area</p>
              </div>
              <input 
                type="checkbox"
                checked={answers.contactForm}
                onChange={(e) => updateField("contactForm", e.target.checked)}
                className="w-5 h-5 accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 text-rose-300 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800/60">
        <button
          onClick={handlePrev}
          disabled={step === 0}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white disabled:pointer-events-none disabled:opacity-30 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02]"
        >
          <span>{step === 3 ? "Generate Live Portfolio" : "Next Step"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
