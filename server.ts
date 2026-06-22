import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Set up server-side Gemini client securely
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Mock simulation data helpers for social profiles
app.get("/api/simulation/profile", (req, res) => {
  const { provider, username } = req.query;

  if (provider === "github") {
    res.json({
      name: username ? `${username}` : "Dev John Smith",
      username: username || "johnsmith",
      bio: "⚡ Specializing in TypeScript, Node.js, and high-performance Web Apps. Loves clean layouts and Formula 1 racing simulation.",
      repositories: [
        { name: "hyper-react", description: "Minimalist reactive routing engine for state management", stars: 452, forks: 34, language: "TypeScript" },
        { name: "f1-telemetry", description: "Real-time F1 race simulator data telemetry parser", stars: 521, forks: 82, language: "Rust" },
        { name: "stripe-preserver", description: "Lightweight secure full-stack billing checkout proxy with smart retry", stars: 124, forks: 8, language: "JavaScript" }
      ],
      contributions: "1,245 contributions in the last year",
      profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    });
  } else if (provider === "linkedin") {
    res.json({
      name: "John Smith",
      headline: "Senior Software Architect & Creative Designer",
      about: "Lead developer focused on pushing the boundary of modern full-stack products. Expert in Tailwind CSS, Node clusters, microservices, and fast state loops.",
      experience: [
        { company: "Vercel Corp", role: "Vite Platform Engineer", period: "2024 - Present", description: "Steered build pipeline optimizations reducing typical deployment cold boots by 42% globally." },
        { company: "Linear App", role: "Frontend UI/UX Architect", period: "2022 - 2024", description: "Authored advanced keyboard command-palette modules and smooth state transitions." }
      ],
      skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Docker", "Node.js", "Prisma"],
      certifications: [
        { name: "Google Professional Cloud Dev Architect", issuer: "Google Cloud", date: "Jan 2025" },
        { name: "Kubernetes Certified Admin", issuer: "CNCF", date: "Sep 2024" }
      ]
    });
  } else {
    res.json({
      name: "John Smith",
      email: "johnsmith@gmail.com",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    });
  }
});

// JSON Schema description for Gemini model responses
const portfolioSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    tagline: { type: Type.STRING },
    style: { type: Type.STRING },
    themeColors: {
      type: Type.OBJECT,
      properties: {
        primary: { type: Type.STRING },
        secondary: { type: Type.STRING },
        background: { type: Type.STRING },
        surface: { type: Type.STRING },
        text: { type: Type.STRING },
        accent: { type: Type.STRING },
        cardBg: { type: Type.STRING },
        glow: { type: Type.STRING },
        border: { type: Type.STRING }
      },
      required: ["primary", "secondary", "background", "text", "accent", "cardBg"]
    },
    sections: {
      type: Type.OBJECT,
      properties: {
        hero: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            title: { type: Type.STRING },
            tagline: { type: Type.STRING },
            ctaText: { type: Type.STRING },
            ctaSecondaryText: { type: Type.STRING }
          },
          required: ["name", "title", "tagline", "ctaText"]
        },
        about: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            headline: { type: Type.STRING },
            subHeadline: { type: Type.STRING }
          },
          required: ["text", "headline"]
        },
        skills: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              items: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["category", "items"]
          }
        },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              company: { type: Type.STRING },
              role: { type: Type.STRING },
              period: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["id", "company", "role", "period", "description"]
          }
        },
        projects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              tech: { type: Type.ARRAY, items: { type: Type.STRING } },
              stars: { type: Type.INTEGER },
              githubUrl: { type: Type.STRING },
              liveUrl: { type: Type.STRING }
            },
            required: ["id", "name", "description", "tech", "githubUrl"]
          }
        },
        certifications: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              issuer: { type: Type.STRING },
              date: { type: Type.STRING }
            },
            required: ["name", "issuer", "date"]
          }
        },
        achievements: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              source: { type: Type.STRING }
            },
            required: ["title", "description", "source"]
          }
        }
      },
      required: ["hero", "about", "skills", "experience", "projects"]
    },
    seoOptimization: {
      type: Type.OBJECT,
      properties: {
        metaTitle: { type: Type.STRING },
        metaDescription: { type: Type.STRING },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["metaTitle", "metaDescription", "keywords"]
    }
  },
  required: ["title", "tagline", "style", "themeColors", "sections", "seoOptimization"]
};

// Generates initial portfolio from simulated information
app.post("/api/portfolio/generate", async (req, res) => {
  try {
    const { onboardingAnswers } = req.body;
    
    const prompt = `You are a world-class Lead Designer & Brand Architect. Your task is to generate a fully realized developer portfolio layout and rich copywriting based on the user's onboarding configurations.
    
    ONBOARDING PROFILE:
    - Name: ${onboardingAnswers.displayName}
    - Role: ${onboardingAnswers.role}
    - Skills Entered: ${onboardingAnswers.skills}
    - Years of Experience: ${onboardingAnswers.experienceYears} Matches
    - Dream Job: ${onboardingAnswers.dreamRole}
    - Preferred Portfolio Theme Style: ${onboardingAnswers.favoriteDesignStyle}
    - Favorite Colors: ${onboardingAnswers.favoriteColors.join(", ")}
    - Loved Brands (e.g., Apple, Tesla, Stripe): ${onboardingAnswers.favoriteBrands.join(", ")}
    - Animation speed preferred: ${onboardingAnswers.favoriteAnimations}
    
    You MUST output highly aesthetic copywriting. Translate generic responses like "I make websites" into elite, high-performance copy. Create matching Tailwind color tokens (like primary, secondary, glow, background, text, accent) that match their preferred design style (Luxury, AI Futuristic, Modern Startup, Creator, Developer). Make sure background colors remain off-whites/grays for Luxury/Startup palettes, or rich, deep cosmic slates for AI Futuristic/Developer mode. Apply standard grid configurations and list sections. Verify that you return all fields requested. Go for gold!`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: portfolioSchema
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error generating portfolio with Gemini:", error);
    res.status(500).json({ error: error.message });
  }
});

// Updates portfolio with Natural Language prompt (e.g. Chat bot)
app.post("/api/portfolio/update-chat", async (req, res) => {
  try {
    const { userPrompt, currentPortfolio, conversationHistory } = req.body;

    const chatSchema = {
      type: Type.OBJECT,
      properties: {
        assistantMessage: { type: Type.STRING, description: "Cheerful explanation of the update that was applied to the code/style" },
        updatedPortfolio: portfolioSchema
      },
      required: ["assistantMessage", "updatedPortfolio"]
    };

    const prompt = `You are an expert Frontend Coach and Design System partner.
    The developer user wants to make changes to their active portfolio using natural language.
    
    CURRENT PORTFOLIO (JSON):
    ${JSON.stringify(currentPortfolio, null, 2)}
    
    USER DIRECTIVE FOR UPDATE:
    "${userPrompt}"
    
    CHAT CONTEXT HISTORY:
    ${JSON.stringify(conversationHistory || [], null, 2)}
    
    INSTRUCTIONS:
    1. Parse the user request carefully (e.g. adding a new internship experience, modifying primary color, changing styling from 'Developer' to 'Luxury Brand', rewording the about section tagline).
    2. Merge these modifications cleanly into the current portfolio structure. Keep all unmodified parts intact. Do NOT delete or drop items unless requested.
    3. Generate a friendly, professional AI Assistant message explaining precisely what was customized (e.g., "I updated your primary theme to deep purple, and added the Software Engineer Internship card to your career grid! Click Deploy to publish these updates.").
    4. Provide the fully updated portfolio JSON in the response object payload. Ensure color codes fit the aesthetic perfectly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: chatSchema
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error updating portfolio with chat:", error);
    res.status(500).json({ error: error.message });
  }
});

// Periodical AI Optimizer Suggestions Generator
app.post("/api/portfolio/generate-upsuggestions", async (req, res) => {
  try {
    const { currentPortfolio } = req.body;

    const suggestionsSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Catchy optimization headline" },
          description: { type: Type.STRING, description: "Detailed summary explaining why this improves seo/design" },
          type: { type: Type.STRING, description: "One of: 'seo', 'hero', 'design', 'project'" }
        },
        required: ["title", "description", "type"]
      }
    };

    const prompt = `You are a Growth Marketer and SEO Optimization Lead. Review this portfolio config:
    ${JSON.stringify(currentPortfolio, null, 2)}
    
    Generate 3 distinct, high-impact suggestions (one for SEO keywords/meta tags, one for layout headings/branding, and one general styling improvement) that would move this presentation from good to outstanding. Make recommendations hyper-personalized and custom tailored to their content!`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: suggestionsSchema
      }
    });

    res.json(JSON.parse(response.text || "[]"));
  } catch (error: any) {
    console.error("Error generating suggestions:", error);
    res.status(500).json({ error: error.message });
  }
});

// Domain suggestion AI generator
app.post("/api/portfolio/domain-suggestions", async (req, res) => {
  try {
    const { displayName, style } = req.body;

    const domainSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          domain: { type: Type.STRING, description: "Domain name e.g. johnsmith.dev" },
          badge: { type: Type.STRING, description: "Premium, Tech, Creative badge" }
        },
        required: ["domain", "badge"]
      }
    };

    const prompt = `Generate 5 distinctive, highly attractive domain names matching the name: "${displayName}" and branding style: "${style}". Ensure a mix of premium .dev, .com, .ai extensions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: domainSchema
      }
    });

    res.json(JSON.parse(response.text || "[]"));
  } catch (error: any) {
    console.error("Error generating domain suggestions:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware & Static SPA handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Portfolio Generator Server bound and running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
