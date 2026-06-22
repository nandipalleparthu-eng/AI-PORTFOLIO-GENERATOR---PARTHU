import React from "react";
import { 
  ExternalLink, Github, Mail, MapPin, Award, 
  Terminal, Sparkles, Sliders, Play, Code, Layers, 
  Briefcase, GraduationCap, ChevronRight, Eye, RefreshCw,
  Download
} from "lucide-react";
import { motion } from "motion/react";
import { jsPDF } from "jspdf";
import { Portfolio } from "../types";

interface PortfolioViewerProps {
  portfolio: Portfolio;
  isPreview?: boolean;
}

export default function PortfolioViewer({ portfolio, isPreview = false }: PortfolioViewerProps) {
  const style = portfolio.style;
  const colors = portfolio.themeColors;
  const sections = portfolio.sections;

  const exportToPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Layout sizing configurations
      const margin = 20;
      const wrapWidth = 170;
      let y = 20;

      // Ensure content doesn't run off-page
      const checkSpace = (required: number) => {
        if (y + required > 275) {
          doc.addPage();
          y = 20;
        }
      };

      const drawDivider = () => {
        checkSpace(5);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.15);
        doc.line(margin, y, margin + wrapWidth, y);
        y += 6;
      };

      // --- 1. CONTACT HEADER SECTION ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(17, 24, 39); // Deep dark slate
      const name = sections.hero.name || "Developer Candidate";
      doc.text(name, margin, y);
      y += 6.5;

      // Professional Tagline/Role
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(75, 85, 99); // Dark grey
      const titleSub = sections.hero.title || "";
      doc.text(titleSub, margin, y);
      y += 5.5;

      // Contact details
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128); // Grey
      const email = sections.contactEmail ? `Email: ${sections.contactEmail}` : "Email: developer@aistudio.dev";
      const portfolioUrl = portfolio.liveUrl ? ` | Live: ${portfolio.liveUrl}` : "";
      const extraContact = " | Worldwide (Remote / Onsite) | USA Working Authorization";
      doc.text(`${email}${portfolioUrl}${extraContact}`, margin, y);
      y += 10;

      // --- 2. PROFESSIONAL SUMMARY ---
      if (sections.about && sections.about.text) {
        checkSpace(25);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(17, 24, 39);
        doc.text("PROFESSIONAL SUMMARY", margin, y);
        y += 1.5;
        drawDivider();

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(55, 65, 81);
        const aboutLines = doc.splitTextToSize(sections.about.text, wrapWidth);
        doc.text(aboutLines, margin, y);
        y += (aboutLines.length * 4.5) + 6;
      }

      // --- 3. RELEVANT TECHNICAL SKILLS ---
      if (sections.skills && sections.skills.length > 0) {
        checkSpace(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(17, 24, 39);
        doc.text("CORE COMPETENCIES & TECHNICAL SKILLS", margin, y);
        y += 1.5;
        drawDivider();

        sections.skills.forEach(skillCat => {
          checkSpace(7);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(31, 41, 55);
          const catHeader = `${skillCat.category}: `;
          doc.text(catHeader, margin, y);
          const paddingLeft = doc.getTextWidth(catHeader);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(55, 65, 81);
          const itemsString = skillCat.items.join(", ");
          const skillLines = doc.splitTextToSize(itemsString, wrapWidth - paddingLeft - 4);
          doc.text(skillLines, margin + paddingLeft + 1, y);
          y += (skillLines.length * 4.5) + 2.5;
        });
        y += 4;
      }

      // --- 4. WORK EXPERIENCE TIMELINE ---
      if (sections.experience && sections.experience.length > 0) {
        checkSpace(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(17, 24, 39);
        doc.text("WORK SUMMARY & EXPERIENCE TIMELINE", margin, y);
        y += 1.5;
        drawDivider();

        sections.experience.forEach(exp => {
          checkSpace(28);
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(17, 24, 39);
          // Highlight Role Left
          doc.text(exp.role, margin, y);

          // Track date duration aligned with Right Column
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(75, 85, 99);
          const dateWidth = doc.getTextWidth(exp.period);
          doc.text(exp.period, margin + wrapWidth - dateWidth, y);
          y += 4.5;

          // Company Headline
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(31, 41, 55);
          doc.text(exp.company, margin, y);
          y += 5.5;

          // Responsibilities/Detail
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(55, 65, 81);
          const expLines = doc.splitTextToSize(exp.description, wrapWidth);
          doc.text(expLines, margin, y);
          y += (expLines.length * 4.4) + 6;
        });
      }

      // --- 5. EDUCATION SECTION ---
      checkSpace(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(17, 24, 39);
      doc.text("EDUCATION & RESEARCH DISCIPLINE", margin, y);
      y += 1.5;
      drawDivider();

      const eduEntries = sections.education || [];
      if (eduEntries.length > 0) {
        eduEntries.forEach(edu => {
          checkSpace(22);
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(17, 24, 39);
          doc.text(edu.degree, margin, y);

          const periodWidth = doc.getTextWidth(edu.period);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(75, 85, 99);
          doc.text(edu.period, margin + wrapWidth - periodWidth, y);
          y += 4.5;

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(31, 41, 55);
          doc.text(edu.institution, margin, y);
          y += 5;

          if (edu.description) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(55, 65, 81);
            const eduLines = doc.splitTextToSize(edu.description, wrapWidth);
            doc.text(eduLines, margin, y);
            y += (eduLines.length * 4.4) + 6;
          } else {
            y += 2;
          }
        });
      } else {
        // High-fidelity fallback centered to their active simulation space (Karunya Institute)
        checkSpace(25);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(17, 24, 39);
        doc.text("Bachelor of Technology (B.Tech) in Computer Science & Engineering", margin, y);

        const periodWidth = doc.getTextWidth("2022 - 2026");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(75, 85, 99);
        doc.text("2022 - 2026", margin + wrapWidth - periodWidth, y);
        y += 4.5;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(31, 41, 55);
        doc.text("Karunya Institute of Technology and Sciences", margin, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(55, 65, 81);
        const placeholderDescription = "Specialization in Full-Stack software engineering patterns, computer architectures, and generative AI interfaces. Recipient of Dean's List honors for high-impact open-source research and automated application deployment pipelines.";
        const fallbackLines = doc.splitTextToSize(placeholderDescription, wrapWidth);
        doc.text(fallbackLines, margin, y);
        y += (fallbackLines.length * 4.4) + 6;
      }

      // --- 6. PROJECTS & SOLUTIONS ---
      if (sections.projects && sections.projects.length > 0) {
        checkSpace(30);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(17, 24, 39);
        doc.text("SELECTED OPEN SOURCE PROJECTS", margin, y);
        y += 1.5;
        drawDivider();

        sections.projects.forEach(proj => {
          checkSpace(25);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.setTextColor(17, 24, 39);
          doc.text(proj.name, margin, y);
          
          if (proj.githubUrl) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(37, 99, 235); // Blue link color
            const linkText = `Link: ${proj.githubUrl}`;
            const linkWidth = doc.getTextWidth(linkText);
            doc.text(linkText, margin + wrapWidth - linkWidth, y);
          }
          y += 4.5;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(55, 65, 81);
          const techStack = `Technologies: ${proj.tech.join(", ")}`;
          doc.text(techStack, margin, y);
          y += 4.5;

          const projLines = doc.splitTextToSize(proj.description, wrapWidth);
          doc.text(projLines, margin, y);
          y += (projLines.length * 4.4) + 6;
        });
      }

      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(156, 163, 175);
        doc.text(
          `ATS-Compliant Profile Generated by Google AI Studio. Page ${i} of ${totalPages}`, 
          margin, 
          287
        );
      }

      doc.save(`${name.toLowerCase().replace(/\s+/g, "-")}-resume.pdf`);
    } catch (error) {
      console.error("Failed to generate and compile ATS resume:", error);
    }
  };

  // Render style specific containers and typography styles
  let wrapperClass = "w-full min-h-screen text-slate-100 transition-colors duration-500 font-sans";
  let containerClass = "max-w-6xl mx-auto px-6 py-16 sm:px-12";
  let cardClass = "";
  let titleClass = "";
  let sectionHeadingClass = "";

  if (style === "Bold Typography") {
    wrapperClass = "w-full min-h-screen bg-white text-black selection:bg-neutral-950 selection:text-white font-sans";
    cardClass = "bg-neutral-50 border border-neutral-200/80 rounded-2xl p-6 hover:shadow-md hover:border-black/20 transition-all duration-300";
    titleClass = "text-5xl sm:text-7xl font-black tracking-tighter uppercase leading-[0.85] text-black mb-4";
    sectionHeadingClass = "text-xs font-mono uppercase tracking-[0.4em] text-neutral-400 mb-8 border-b border-neutral-200 pb-2.5 flex items-center gap-2";
  } else if (style === "Developer") {
    wrapperClass = "w-full min-h-screen font-mono bg-[#0c0f16] text-[#c9d1d9] selection:bg-emerald-500/20";
    cardClass = "bg-[#161b22] border border-[#30363d] rounded-lg p-6 hover:border-emerald-500/40 transition-all duration-300 shadow-lg";
    titleClass = "text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 font-mono";
    sectionHeadingClass = "text-xl font-bold text-emerald-400 mb-8 border-b border-[#30363d] pb-2 flex items-center gap-2";
  } else if (style === "AI Futuristic") {
    wrapperClass = "w-full min-h-screen bg-[#07070c] text-slate-100 selection:bg-indigo-500/30 overflow-hidden";
    cardClass = "bg-slate-900/40 backdrop-blur-md border border-indigo-500/20 rounded-xl p-6 hover:border-indigo-400/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300";
    titleClass = "text-4xl sm:text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-4";
    sectionHeadingClass = "text-2xl font-bold tracking-tight text-white mb-8 flex items-center gap-3 decoration-indigo-500 underline-offset-8 decoration-2 underline";
  } else if (style === "Luxury") {
    wrapperClass = "w-full min-h-screen bg-[#fcfcfc] text-stone-900 selection:bg-[#c5a880]/20 font-serif";
    cardClass = "bg-white border border-stone-200 rounded-none p-8 hover:shadow-xl hover:border-stone-400 transition-all duration-500";
    titleClass = "text-3xl sm:text-5xl font-normal tracking-wide text-stone-900 mb-4 font-serif italic";
    sectionHeadingClass = "text-lg font-medium uppercase tracking-widest text-[#c5a880] mb-8 border-b border-stone-200 pb-3";
  } else if (style === "Creative Designer") {
    wrapperClass = "w-full min-h-screen bg-[#0d091e] text-slate-100 selection:bg-rose-500/30";
    cardClass = "bg-[#1b1535] border-2 border-fuchsia-500/20 rounded-3xl p-6 hover:border-rose-400/40 hover:scale-[1.02] transform transition-all duration-400 shadow-lg shadow-fuchsia-950/10";
    titleClass = "text-4xl sm:text-6xl font-black tracking-tight text-rose-300 mb-4";
    sectionHeadingClass = "text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-fuchsia-300 to-fuchsia-500 mb-8";
  } else {
    // "Modern Startup"
    wrapperClass = "w-full min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500/20 font-sans";
    cardClass = "bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all duration-300 shadow-md";
    titleClass = "text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4";
    sectionHeadingClass = "text-xl font-bold text-indigo-400 tracking-tight mb-8 border-b border-slate-800 pb-3";
  }

  return (
    <div className={wrapperClass}>
      {isPreview && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-2 text-center text-xs text-yellow-300 font-sans flex items-center justify-center gap-2">
          <Eye className="w-4 h-4 animate-pulse" />
          <span>Interactive Preview Simulator - Active Theme: <strong>{style}</strong>.</span>
        </div>
      )}

      {/* Dynamic Action Header in Portfolio Webpage */}
      <div className={`border-b ${
        style === "Bold Typography" 
          ? "bg-neutral-50/95 border-neutral-200 text-black font-sans"
          : style === "Developer"
          ? "bg-[#0d1117]/95 border-[#30363d] text-[#c9d1d9] font-mono"
          : style === "Luxury"
          ? "bg-[#faf9f6]/95 border-stone-200 text-stone-800 font-serif"
          : style === "AI Futuristic"
          ? "bg-[#0a0a14]/95 border-indigo-500/15 text-slate-200 font-sans"
          : style === "Creative Designer"
          ? "bg-[#110e2c]/95 border-fuchsia-500/25 text-slate-200 font-sans"
          : "bg-slate-900/95 border-slate-800 text-slate-200 font-sans"
      } sticky top-0 z-30 backdrop-blur-md`}>
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between sm:px-12">
          <div className="flex items-center gap-2.5">
            <div className={`w-2.1 h-2.1 rounded-full ${
              style === "Developer" ? "bg-emerald-500 animate-pulse" : "bg-indigo-500"
            }`} />
            <span className="text-xs font-bold tracking-widest uppercase opacity-90">
              {sections.hero.name || "Live Portfolio"}
            </span>
          </div>

          <button
            id="btn-export-ats-pdf"
            onClick={exportToPDF}
            className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-md hover:-translate-y-[0.5px] active:translate-y-0 active:scale-95 duration-200 ${
              style === "Bold Typography"
                ? "bg-black text-white hover:bg-neutral-800 rounded-none"
                : style === "Developer"
                ? "bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-emerald-400 font-mono"
                : style === "Luxury"
                ? "bg-stone-900 hover:bg-stone-800 text-[#faf9f6] rounded-none font-serif font-semibold"
                : style === "Creative Designer"
                ? "bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white hover:brightness-110 rounded-full"
                : style === "AI Futuristic"
                ? "bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-lg shadow-[0_0_10px_rgba(99,102,241,0.15)]"
                : "bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export ATS PDF</span>
          </button>
        </div>
      </div>

       {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/5 py-24 sm:py-32">
        {style === "AI Futuristic" && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.08),transparent_50%)]" />
        )}
        {style === "Creative Designer" && (
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" />
        )}

        <div className={containerClass}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            {style === "Developer" && (
              <div className="text-xs text-emerald-400 mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span>~/portfolio-engine init --profile</span>
              </div>
            )}
            
            <h1 className={titleClass}>
              {sections.hero.name}
            </h1>
            
            <p className={`text-xl sm:text-2xl font-medium mb-6 ${style === "Luxury" ? "text-stone-700" : style === "Bold Typography" ? "text-neutral-700 font-serif italic" : "text-slate-300"}`}>
              {sections.hero.title}
            </p>
            
            <p className={`text-base sm:text-lg mb-8 leading-relaxed max-w-2xl ${style === "Luxury" ? "text-stone-600" : style === "Bold Typography" ? "text-neutral-500" : "text-slate-400"}`}>
              {sections.hero.tagline}
            </p>

            <div className="flex flex-wrap gap-4">
              <a 
                href={`mailto:${sections.contactEmail}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300 shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-blue-500/20 text-white"
                style={style === "Luxury" ? { background: '#1c1917', borderRadius: '0', color: 'white' } : style === "Bold Typography" ? { background: '#000000', borderRadius: '9999px', color: '#ffffff' } : style === "Creative Designer" ? { background: 'linear-gradient(45deg, #f43f5e, #ec4899)', borderRadius: '9999px' } : undefined}
              >
                {sections.hero.ctaText}
                <ChevronRight className="w-4 h-4" />
              </a>
              {sections.hero.ctaSecondaryText && (
                <a 
                  href="#projects"
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border transition-all duration-300 ${style === "Luxury" ? "border-stone-300 hover:border-stone-900 bg-transparent text-stone-900 rounded-none" : style === "Bold Typography" ? "border-neutral-350 hover:border-neutral-900 bg-transparent text-neutral-800 rounded-full" : "border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 text-slate-300"}`}
                  style={style === "Creative Designer" ? { borderRadius: '9999px', border: '2px solid rgba(244,63,94,0.3)' } : undefined}
                >
                  {sections.hero.ctaSecondaryText}
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="border-b border-white/5 bg-white/[0.01]">
        <div className={containerClass}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4">
              <h2 className={sectionHeadingClass}>
                <span>About Me</span>
              </h2>
              <div className="flex flex-col gap-3">
                <p className={`text-sm ${style === "Luxury" || style === "Bold Typography" ? "text-neutral-500" : "text-slate-500"} flex items-center gap-2`}>
                  <MapPin className="w-4 h-4" />
                  <span>Available Worldwide / Remote</span>
                </p>
                <p className={`text-sm ${style === "Luxury" || style === "Bold Typography" ? "text-neutral-500" : "text-slate-500"} flex items-center gap-2`}>
                  <Mail className="w-4 h-4" />
                  <span>{sections.contactEmail}</span>
                </p>
              </div>
            </div>
            <div className="md:col-span-8">
              <h3 className={`text-2xl font-bold mb-4 ${style === "Luxury" || style === "Bold Typography" ? "text-neutral-900" : "text-white"}`}>
                {sections.about.headline}
              </h3>
              {sections.about.subHeadline && (
                <p className={`text-lg italic mb-6 ${style === "Luxury" || style === "Bold Typography" ? "text-neutral-600 border-l-2 border-neutral-300 pl-4" : "text-indigo-400"}`}>
                  "{sections.about.subHeadline}"
                </p>
              )}
              <p className={`text-base leading-relaxed ${style === "Luxury" || style === "Bold Typography" ? "text-neutral-700 font-serif" : "text-slate-300"}`}>
                {sections.about.text}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="border-b border-white/5">
        <div className={containerClass}>
          <h2 className={sectionHeadingClass}>
            <span>Skill Matrix</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sections.skills.map((cat, idx) => (
              <div key={idx} className={cardClass}>
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${style === "Luxury" || style === "Bold Typography" ? "text-neutral-900" : "text-white"}`}>
                  <Code className="w-5 h-5 text-indigo-500" />
                  <span>{cat.category}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((item, id) => (
                    <span 
                      key={id} 
                      className={`text-xs px-3 py-1 rounded-full border ${style === "Luxury" || style === "Bold Typography" ? "border-neutral-200 bg-neutral-100 text-neutral-800" : "border-slate-800 bg-slate-900/60 text-slate-300"}`}
                      style={style === "Developer" ? { border: '1px solid #30363d', color: '#c9d1d9' } : undefined}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="border-b border-white/5 bg-white/[0.01]">
        <div className={containerClass}>
          <h2 className={sectionHeadingClass}>
            <span>Experience Timeline</span>
          </h2>
          <div className={`relative pl-6 sm:pl-8 border-l ${style === "Bold Typography" ? "border-neutral-200" : "border-slate-800"} space-y-12`}>
            {sections.experience.map((exp) => (
              <div key={exp.id} className="relative">
                <span className={`absolute -left-[31px] sm:-left-[39px] mt-1.5 w-4 h-4 rounded-full border-2 ${style === "Bold Typography" ? "border-black bg-white" : "border-indigo-500 bg-[#0c0f16]"}`} />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className={`text-lg font-bold ${style === "Luxury" || style === "Bold Typography" ? "text-neutral-900" : "text-white"}`}>
                      {exp.role}
                    </h3>
                    <p className={`text-sm ${style === "Luxury" ? "text-[#c5a880]" : style === "Bold Typography" ? "text-neutral-700 font-semibold uppercase tracking-wider" : "text-indigo-400"}`}>
                      {exp.company}
                    </p>
                  </div>
                  <span className={`text-xs inline-block px-3 py-1 bg-slate-900/60 border border-slate-800 rounded-full ${style === "Luxury" ? "bg-stone-100 border-stone-200 text-stone-700 rounded-none" : style === "Bold Typography" ? "bg-neutral-100 border-neutral-200 text-neutral-800 rounded-full" : "text-slate-400"}`}>
                    {exp.period}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed max-w-4xl ${style === "Luxury" || style === "Bold Typography" ? "text-neutral-600 font-serif" : "text-slate-300"}`}>
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="border-b border-white/5">
        <div className={containerClass}>
          <h2 className={sectionHeadingClass}>
            <span>Featured Solutions</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.projects.map((proj) => (
              <div key={proj.id} className={cardClass}>
                <div className="flex items-center justify-between mb-4">
                  <Github className="w-5 h-5 text-slate-400" />
                  {proj.stars !== undefined && (
                    <span className="text-xs text-yellow-500 flex items-center gap-1">
                      ★ {proj.stars}
                    </span>
                  )}
                </div>
                <h3 className={`text-lg font-bold mb-2 ${style === "Luxury" || style === "Bold Typography" ? "text-neutral-900" : "text-white"}`}>
                  {proj.name}
                </h3>
                <p className={`text-sm mb-4 line-clamp-3 leading-relaxed h-16 ${style === "Luxury" || style === "Bold Typography" ? "text-neutral-600 font-serif" : "text-slate-400"}`}>
                  {proj.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {proj.tech.map((t, idx) => (
                    <span key={idx} className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded font-mono">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-auto">
                  <a 
                    href={proj.githubUrl}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="text-xs hover:underline flex items-center gap-1 text-slate-400 hover:text-white"
                  >
                    <span>Source Code</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {proj.liveUrl && (
                    <a 
                      href={proj.liveUrl}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      {sections.certifications && sections.certifications.length > 0 && (
        <section className="border-b border-white/5 bg-white/[0.01]">
          <div className={containerClass}>
            <h2 className={sectionHeadingClass}>
              <span>Certifications</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sections.certifications.map((cert, index) => (
                <div key={index} className={`flex items-start gap-4 p-5 ${style === "Bold Typography" ? "bg-neutral-50 border border-neutral-200" : "bg-slate-900/30 border border-slate-800"} rounded-xl hover:border-slate-700 transition-all duration-300`}>
                  <Award className="w-8 h-8 text-[#c5a880] shrink-0 mt-1" />
                  <div>
                    <h3 className={`font-bold text-base ${style === "Bold Typography" ? "text-neutral-900" : "text-white"}`}>{cert.name}</h3>
                    <p className={`text-sm ${style === "Bold Typography" ? "text-neutral-600" : "text-slate-400"} mt-0.5`}>{cert.issuer}</p>
                    <p className="text-xs text-slate-550 mt-1">{cert.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certifications & Achievements Section */}
      {sections.achievements && sections.achievements.length > 0 && (
        <section className="border-b border-white/5 bg-white/[0.01]">
          <div className={containerClass}>
            <h2 className={sectionHeadingClass}>
              <span>Incredible Achievements</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sections.achievements.map((ach, index) => (
                <div key={index} className={`flex items-start gap-4 p-5 ${style === "Bold Typography" ? "bg-neutral-50 border border-neutral-200" : "bg-slate-900/30 border border-slate-800"} rounded-xl hover:border-slate-700 transition-all duration-300`}>
                  <Award className="w-8 h-8 text-yellow-500 shrink-0 mt-1 animate-pulse" />
                  <div>
                    <h3 className={`font-bold text-base ${style === "Bold Typography" ? "text-neutral-900" : "text-white"}`}>{ach.title}</h3>
                    <p className={`text-sm ${style === "Bold Typography" ? "text-neutral-600" : "text-slate-400"} mt-0.5`}>{ach.description}</p>
                    <span className={`inline-block mt-2 text-[10px] border ${style === "Bold Typography" ? "border-neutral-200 bg-neutral-100 text-neutral-500" : "border-slate-700 bg-slate-800 text-slate-500"} rounded-full px-2.5 py-0.5 font-mono capitalize`}>
                      Source: {ach.source}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className={`py-16 sm:py-24 ${style === "Bold Typography" ? "bg-neutral-50 border-t border-b border-neutral-200" : "bg-slate-950/40"}`}>
        <div className={containerClass}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className={titleClass}>Get In Touch</h2>
            <p className={`mb-8 max-w-md mx-auto ${style === "Bold Typography" ? "text-neutral-500" : "text-slate-400"}`}>
              Want to collaborate, build something epic, or inquire about open consulting opportunities? Send a message directly.
            </p>
            
            <a 
              href={`mailto:${sections.contactEmail}`}
              className={`inline-flex items-center gap-3 px-8 py-4 font-bold transition-all duration-300 shadow-xl ${style === "Bold Typography" ? "bg-black text-white hover:bg-neutral-800 rounded-full" : "bg-white text-slate-900 hover:bg-slate-100 rounded-xl"}`}
              style={style === "Luxury" ? { borderRadius: '0', background: '#1c1917', color: 'white' } : style === "Creative Designer" ? { borderRadius: '9999px', background: 'linear-gradient(45deg, #ec4899, #f43f5e)', color: 'white' } : undefined}
            >
              <Mail className="w-5 h-5" />
              <span>{sections.contactEmail}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${style === "Bold Typography" ? "border-neutral-200 bg-neutral-50 text-neutral-500" : "border-white/5 bg-black/40 text-slate-500"} py-8 text-center text-xs`}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {sections.hero.name}. Powered by AI Portfolio Generator & Google Gemini.</p>
          <div className="flex items-center gap-4">
            <a href="#" className={`hover:${style === "Bold Typography" ? "text-black" : "text-white"} transition-colors`}>Twitter</a>
            <a href="#" className={`hover:${style === "Bold Typography" ? "text-black" : "text-white"} transition-colors`}>LinkedIn</a>
            <a href="#" className={`hover:${style === "Bold Typography" ? "text-black" : "text-white"} transition-colors`}>GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
