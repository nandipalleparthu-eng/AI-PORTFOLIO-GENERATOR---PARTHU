export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  accent: string;
  cardBg: string;
  glow?: string;
  border?: string;
}

export interface HeroSection {
  name: string;
  title: string;
  tagline: string;
  ctaText: string;
  ctaSecondaryText?: string;
}

export interface AboutSection {
  text: string;
  headline: string;
  subHeadline?: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
  tags?: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  tech: string[];
  stars?: number;
  forks?: number;
  githubUrl: string;
  liveUrl?: string;
  featured?: boolean;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  date: string;
}

export interface AchievementItem {
  title: string;
  description: string;
  source: "github" | "linkedin" | "user";
}

export interface ServiceItem {
  title: string;
  description: string;
  price?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  period: string;
  description?: string;
}

export interface PortfolioSections {
  hero: HeroSection;
  about: AboutSection;
  skills: SkillCategory[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  certifications?: CertificationItem[];
  achievements?: AchievementItem[];
  services?: ServiceItem[];
  education?: EducationItem[];
  contactEmail: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  title: string;
  tagline: string;
  style: "Modern Startup" | "Developer" | "Creative Designer" | "Luxury" | "AI Futuristic" | "Bold Typography";
  themeColors: ThemeColors;
  sections: PortfolioSections;
  repoName: string;
  liveUrl: string;
  deployedPlatform: "Vercel" | "GitHub Pages" | "Netlify" | "Cloudflare Pages";
  deploymentStatus: "idle" | "generating" | "deploying" | "completed" | "failed";
  seoOptimization: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  customDomain?: string;
  updatedAt: string;
}

export interface OnboardingAnswers {
  displayName: string;
  role: string;
  skills: string;
  experienceYears: string;
  dreamRole: string;
  favoriteColors: string[];
  favoriteBrands: string[];
  favoriteDesignStyle: "Modern Startup" | "Developer" | "Creative Designer" | "Luxury" | "AI Futuristic" | "Bold Typography";
  favoriteAnimations: string;
  featureEmail: string;
  resumeDownload: boolean;
  contactForm: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface AISuggestion {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: "seo" | "hero" | "design" | "project";
  applied: boolean;
  createdAt: string;
}
