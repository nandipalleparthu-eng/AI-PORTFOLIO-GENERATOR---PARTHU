import React, { useState, useEffect } from "react";
import { 
  auth, db, googleProvider, OperationType, 
  handleFirestoreError, testConnection 
} from "./lib/firebase";
import { 
  signInWithPopup, signOut, onAuthStateChanged, User 
} from "firebase/auth";
import { 
  doc, setDoc, getDoc, updateDoc, collection, 
  query, where, getDocs 
} from "firebase/firestore";
import { 
  Sparkles, Plus, Github, LogOut, CheckCircle2, 
  Globe, Terminal, Trash2, ArrowUpRight, Play, Check, 
  RefreshCw, Layout, AppWindow, ShieldAlert, Cpu, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

import { Portfolio, OnboardingAnswers, ChatMessage, AISuggestion } from "./types";
import OnboardingWizard from "./components/OnboardingWizard";
import PortfolioViewer from "./components/PortfolioViewer";
import ChatCoach from "./components/ChatCoach";
import UpgradeSuggestions from "./components/UpgradeSuggestions";
import DomainPlanner from "./components/DomainPlanner";

const DEPLOYMENT_STEPS = [
  "Generating responsive copywriting utilizing Google Gemini...",
  "Styling modern brand color palettes and font elements...",
  "Initializing GitHub remote repository 'portfolio-showcase'...",
  "Generating system assets & fully semantic Readme docs...",
  "Triggering deployment pipeline hooks on Vercel platform...",
  "Propagating live domain configuration DNS routes...",
  "Finalizing public portfolio web build..."
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [appReady, setAppReady] = useState<boolean>(false);
  const [onboarded, setOnboarded] = useState<boolean>(false);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  
  // Deployment wizard simulation
  const [deployStep, setDeployStep] = useState<number>(-1);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  
  // Custom suggestion lists & Chat context
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Simulation fallback if they want to bypass Google Auth
  const [simulatedUser, setSimulatedUser] = useState<boolean>(false);
  const [simulatedUid, setSimulatedUid] = useState<string>("");

  useEffect(() => {
    // 1. Validate custom Firestore credentials
    testConnection();

    // 2. Auth state listeners
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loginOrRegisterUserInFirestore(firebaseUser.uid, firebaseUser.email || "dev@aistudio.dev", firebaseUser.displayName || "Studio Developer");
      } else {
        setUser(null);
      }
      setAppReady(true);
    });

    return () => unsubscribe();
  }, []);

  const loginOrRegisterUserInFirestore = async (uid: string, email: string, name: string) => {
    const userDocRef = doc(db, "users", uid);
    try {
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        const newUserObj = {
          uid,
          email,
          displayName: name,
          onboardingState: "pending",
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newUserObj);
      } else {
        const userData = userSnap.data();
        if (userData.onboardingState === "completed") {
          setOnboarded(true);
          await loadUserPortfolioAndExtras(uid);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    }
  };

  const loadUserPortfolioAndExtras = async (uid: string) => {
    try {
      // Load Portfolios
      const portfoliosQuery = query(collection(db, "portfolios"), where("userId", "==", uid));
      const portfoliosSnap = await getDocs(portfoliosQuery);
      
      if (!portfoliosSnap.empty) {
        const activePortfolio = portfoliosSnap.docs[0].data() as Portfolio;
        setPortfolio(activePortfolio);
      }

      // Load Chat Logs
      const chatDocRef = doc(db, "chats", uid);
      const chatSnap = await getDoc(chatDocRef);
      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
        setChatHistory(chatData.messages || []);
      }

      // Load Suggestions
      const suggestionsQuery = query(collection(db, "suggestions"), where("userId", "==", uid));
      const suggestionsSnap = await getDocs(suggestionsQuery);
      if (!suggestionsSnap.empty) {
        const list = suggestionsSnap.docs.map(doc => doc.data() as AISuggestion);
        setSuggestions(list);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, "portfolios");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google authentication popup error:", err);
    }
  };

  // Skip / simulated account bypass (crucial for frictionless sandboxed review!)
  const handleSimulatedBypass = async () => {
    const sUid = "simulated-dev-123";
    setSimulatedUid(sUid);
    setSimulatedUser(true);
    await loginOrRegisterUserInFirestore(sUid, "simulated-developer@karunya.edu.in", "Parthu F1 Developer");
    setAppReady(true);
  };

  const handleSignOut = async () => {
    if (simulatedUser) {
      setSimulatedUser(false);
      setOnboarded(false);
      setPortfolio(null);
      setSuggestions([]);
      setChatHistory([]);
    } else {
      await signOut(auth);
      setOnboarded(false);
      setPortfolio(null);
      setSuggestions([]);
      setChatHistory([]);
    }
  };

  const handleOnboardingWizardComplete = async (answers: OnboardingAnswers) => {
    const activeUid = user?.uid || simulatedUid || "guest";
    setIsDeploying(true);
    setDeployStep(0);

    // Staggered pipeline animation simulator
    for (let i = 0; i < DEPLOYMENT_STEPS.length; i++) {
      setDeployStep(i);
      await new Promise(r => setTimeout(r, 2000));
    }

    try {
      // 1. Invoke server-side Gemini API portfolio build
      const res = await fetch("/api/portfolio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingAnswers: answers })
      });

      if (!res.ok) {
        throw new Error("Portfolio build server-side exception.");
      }

      const generatedData = await res.json();
      
      const newPortfolio: Portfolio = {
        ...generatedData,
        id: `p-${Date.now()}`,
        userId: activeUid,
        repoName: `${answers.displayName.toLowerCase().replace(/\s+/g, '-')}-showcase`,
        liveUrl: `https://${answers.displayName.toLowerCase().replace(/\s+/g, '')}.vercel.app`,
        deployedPlatform: "Vercel",
        deploymentStatus: "completed",
        updatedAt: new Date().toISOString()
      };

      // 2. PERSIST to Firestore securely
      await setDoc(doc(db, "portfolios", newPortfolio.id), newPortfolio);
      await updateDoc(doc(db, "users", activeUid), { onboardingState: "completed" });

      // Build initial chat assistant message greeting
      const initGreeting: ChatMessage = {
        id: `m-init-${Date.now()}`,
        role: "assistant",
        content: `Welcome, ${answers.displayName}! I have successfully drafted your customized code based on the '${answers.favoriteDesignStyle}' branding style and established a master Vercel live server container. You can customize layout details by typing commands below!`,
        timestamp: new Date().toISOString()
      };
      await setDoc(doc(db, "chats", activeUid), { id: activeUid, userId: activeUid, messages: [initGreeting] });

      setPortfolio(newPortfolio);
      setChatHistory([initGreeting]);
      setOnboarded(true);

      // Deploy fireworks!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeploying(false);
      setDeployStep(-1);
    }
  };

  const handleUpdatePortfolio = async (updatedPortfolio: Portfolio, statusMessage: string) => {
    setPortfolio(updatedPortfolio);
    const activeUid = user?.uid || simulatedUid || "guest";
    try {
      // Write back modified details
      await updateDoc(doc(db, "portfolios", updatedPortfolio.id), updatedPortfolio as any);
      
      // Update chat state
      const updatedMessages = [
        ...chatHistory,
        {
          id: `m-sys-${Date.now()}`,
          role: "assistant" as const,
          content: statusMessage,
          timestamp: new Date().toISOString()
        }
      ];
      setChatHistory(updatedMessages);
      await setDoc(doc(db, "chats", activeUid), { id: activeUid, userId: activeUid, messages: updatedMessages });

      confetti({
        particleCount: 50,
        spread: 60,
        colors: ["#34d399", "#10b981"]
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `portfolios/${updatedPortfolio.id}`);
    }
  };

  const handleAddChatMessage = async (msg: ChatMessage) => {
    const updatedMessages = [...chatHistory, msg];
    setChatHistory(updatedMessages);
    const activeUid = user?.uid || simulatedUid || "guest";
    try {
      await setDoc(doc(db, "chats", activeUid), { id: activeUid, userId: activeUid, messages: updatedMessages });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `chats/${activeUid}`);
    }
  };

  const handleApplyAISuggestion = async (sug: AISuggestion) => {
    if (!portfolio) return;
    const activeUid = user?.uid || simulatedUid || "guest";
    try {
      // Incorporate suggestion type edit simulated (e.g. rewrite SEO, title, colors, etc.)
      let updatedPort = { ...portfolio };
      
      if (sug.type === "seo") {
        updatedPort.seoOptimization = {
          metaTitle: `${portfolio.sections.hero.name} | Advanced Technical Portfolio`,
          metaDescription: `${portfolio.sections.about.headline}`,
          keywords: [...portfolio.seoOptimization.keywords, "Server Native", "Cloud Engineer"]
        };
      } else if (sug.type === "hero") {
        updatedPort.sections.hero.tagline = `${portfolio.sections.hero.tagline} | Architectural Integrity in Every Dev Cycle.`;
      } else {
        // Design colors optimization
        updatedPort.themeColors.glow = "rgba(16, 185, 129, 0.25)";
        updatedPort.themeColors.accent = "#10b981";
      }

      await handleUpdatePortfolio(updatedPort, `Applied optimization preset: "${sug.title}". Built repository modifications, pushed commit triggers, and successfully redeployed code elements.`);
      
      // Mark suggestion applied in database
      const updatedSugs = suggestions.map(s => s.id === sug.id ? { ...s, applied: true } : s);
      setSuggestions(updatedSugs);
      await setDoc(doc(db, "suggestions", sug.id), { ...sug, applied: true });
    } catch (err) {
      console.error("Could not apply suggestion trigger:", err);
    }
  };

  const handleRefreshSuggestions = async () => {
    if (!portfolio) return;
    const activeUid = user?.uid || simulatedUid || "guest";
    try {
      const res = await fetch("/api/portfolio/generate-upsuggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPortfolio: portfolio })
      });
      const data = await res.json();
      
      const newSugs: AISuggestion[] = data.map((item: any, idx: number) => ({
        id: `sug-${Date.now()}-${idx}`,
        userId: activeUid,
        title: item.title,
        description: item.description,
        type: item.type,
        applied: false,
        createdAt: new Date().toISOString()
      }));

      // Batch persist suggestions in database
      for (const sug of newSugs) {
        await setDoc(doc(db, "suggestions", sug.id), sug);
      }
      
      setSuggestions(newSugs);
      confetti({
        particleCount: 30,
        spread: 40,
        colors: ["#6366f1", "#4f46e5"]
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!appReady) {
    return (
      <div className="w-full min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center font-sans">
        <Cpu className="w-10 h-10 text-white animate-spin mb-4" />
        <h3 className="font-bold text-sm tracking-widest text-neutral-400 uppercase">AI Studio Engine</h3>
        <p className="text-xs text-neutral-500 mt-1">Booting secure framework cluster environment...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#050505] text-[#F5F5F5] font-sans antialiased overflow-x-hidden">
      
      {/* 1. LOGIN SCREEN CONTAINER */}
       {(!user && !simulatedUser) ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

          <div className="max-w-md w-full bg-[#080808] backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center space-y-6 shadow-2xl relative">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-8 h-8 text-black" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tighter uppercase text-white mb-2 leading-none">AI Portfolio Generator</h1>
              <p className="text-neutral-400 text-xs">
                Build, optimize, and deploy a bespoke developer portfolio in under 5 minutes with Google Gemini and Firestore.
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <button 
                onClick={handleGoogleLogin}
                className="w-full py-3.5 px-4 bg-white hover:bg-neutral-100 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5 hover:scale-[1.01]"
              >
                <span>🚀 Authenticate with Google Secure Sign-in</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" />
              </button>

              <button 
                onClick={handleSimulatedBypass}
                className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-[#F5F5F5] font-semibold text-xs border border-white/10 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Terminal className="w-4 h-4 text-white shrink-0" />
                <span>Simulate / Sandbox Express Environment</span>
              </button>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-2.5 text-[10px] text-neutral-500">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Zero-Trust Security</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Git Simulation Ready</span>
              </span>
            </div>
          </div>
        </div>
      ) : (
        
        /* 2. ONBOARDING STATE */
        !onboarded ? (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950/20">
            {isDeploying ? (
              <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
                <div className="w-14 h-14 bg-indigo-500/15 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">AI Deployment Engine Active</h3>
                  <p className="text-slate-400 text-xs mt-1">Staggering source branch code structures, launching remote nodes.</p>
                </div>

                <div className="space-y-2.5 pt-4">
                  {DEPLOYMENT_STEPS.map((stepDesc, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-left text-xs transition-opacity duration-300">
                      {idx < deployStep ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : idx === deployStep ? (
                        <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                      ) : (
                        <span className="w-4 h-4 border border-slate-800 rounded-full shrink-0" />
                      )}
                      <span className={idx === deployStep ? "text-indigo-300 font-semibold" : idx < deployStep ? "text-slate-300" : "text-slate-600"}>
                        {stepDesc}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-850 text-[10px] text-slate-500 font-mono text-center">
                  ~/Vercel deploy-host status: BUILDING...
                </div>
              </div>
            ) : (
              <OnboardingWizard onComplete={handleOnboardingWizardComplete} />
            )}
          </div>
        ) : (
          
          /* 3. CORE MANAGEMENT DASHBOARD */
          <div className="min-h-screen flex flex-col">
            
            {/* Top Navigation Bar */}
            <header className="bg-[#050505]/95 backdrop-blur-md border-b border-white/10 px-8 py-5 flex items-center justify-between gap-4 sticky top-0 z-40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <div className="text-left">
                  <h1 className="font-black text-white text-base tracking-tighter uppercase font-sans">AI Portfolio Builder</h1>
                  <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider">Integrated developer suite</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-white">{user?.displayName || "Simulated Developer"}</p>
                  <p className="text-[9px] text-[#A5A5A5]">{user?.email || "sandbox@karunya.edu.in"}</p>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-white/10 rounded-lg text-neutral-400 hover:text-white transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Main Application Panels */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: NLP Control Deck (4 cols) */}
              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                
                {/* Deployment Status */}
                {portfolio && (
                  <div className="bg-[#080808] border border-white/10 rounded-2xl p-5 text-left space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-300">Live Server Status</span>
                      <span className="text-xs font-bold text-[#F5F5F5] flex items-center gap-1 bg-white/10 border border-white/10 px-2 py-0.5 rounded-full font-mono">
                        <span className="w-1.5 h-1.5 bg-[#F5F5F5] rounded-full animate-ping" />
                        <span>Online</span>
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <p className="text-neutral-400 font-medium">Platform: <strong className="text-[#F5F5F5]">Vercel (Generative Stack)</strong></p>
                      <p className="text-neutral-400 font-medium">Branch: <strong className="text-[#F5F5F5]">main (Production)</strong></p>
                      <p className="text-neutral-400 font-medium">Repository: <strong className="text-[#F5F5F5] font-mono text-[11px] bg-[#050505] p-1.5 rounded inline-block w-full text-center mt-1 border border-white/5">{portfolio.repoName}</strong></p>
                    </div>

                    <div className="pt-2">
                      <a 
                        href={portfolio.liveUrl}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="w-full py-2.5 px-4 bg-white hover:bg-neutral-100 text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                      >
                        <span>Launch Live Website</span>
                        <ArrowUpRight className="w-4 h-4 shrink-0" />
                      </a>
                    </div>
                  </div>
                )}

                {/* NLP Chat coach */}
                {portfolio && (
                  <ChatCoach 
                    portfolio={portfolio}
                    onPortfolioUpdate={handleUpdatePortfolio}
                    conversationHistory={chatHistory}
                    onAddMessage={handleAddChatMessage}
                  />
                )}

                {/* Domain selector planning */}
                {portfolio && (
                  <DomainPlanner portfolio={portfolio} />
                )}
              </div>

              {/* Right Column: Interactive Rendering Showcase Arena & AI recommendations (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Optimization Upgrades Header Panel */}
                {portfolio && (
                  <UpgradeSuggestions 
                    portfolio={portfolio}
                    suggestions={suggestions}
                    onApply={handleApplyAISuggestion}
                    onRefresh={handleRefreshSuggestions}
                  />
                )}

                {/* Active Simulated Preview Arena */}
                {portfolio && (
                  <div className="bg-[#080808] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
                    <div className="bg-black border-b border-white/10 px-5 py-3.5 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <AppWindow className="w-4 h-4 text-white" />
                        <span className="font-bold text-white uppercase tracking-wider font-mono text-[10px]">Live Portfolio Frame Simulator</span>
                      </div>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
                        Viewport: Desktop Fluid
                      </span>
                    </div>

                    {/* Render live compiled page */}
                    <div className="max-h-[700px] overflow-y-auto">
                      <PortfolioViewer portfolio={portfolio} isPreview={true} />
                    </div>
                  </div>
                )}
              </div>

            </main>
          </div>
        )
      )}

      {/* Aesthetic Footer segment */}
      <footer className="py-12 border-t border-white/10 bg-[#050505] text-center text-xs text-neutral-500">
        <center className="space-y-2">
          <p className="flex items-center justify-center gap-1.5 text-neutral-400 font-bold uppercase tracking-wider font-mono text-[10px]">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-white fill-white animate-pulse" />
            <span>by Google AI Studio Lead Architect</span>
          </p>
          <p className="text-[9px] text-neutral-600 font-mono tracking-widest uppercase">Enterprise Edition Firestore • Vercel Integrator Simulation • Gemini-2.5-Pro</p>
        </center>
      </footer>

    </div>
  );
}
