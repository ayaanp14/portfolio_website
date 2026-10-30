export type ProjectMetric = {
  label: string;
  value: number;
  suffix?: string;
};

export type HologramKind = "occupancy" | "chat" | "editor" | "qr";

export type ProjectData = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  role: string;
  duration: string;
  stack: string[];
  /** Two-column feature bullets shown in the featured-project panel */
  features: string[];
  /** Which mini-visualization the holographic preview renders */
  hologram: HologramKind;
  links: {
    live?: string;
    github?: string;
  };
  metrics: ProjectMetric[];
  caseStudy: {
    problem: string;
    architecture: string;
    results: string;
  };
  image?: string;
  /** Short shop-sign category, e.g. "SaaS platform" */
  category: string;
  /** Screenshot of the live product, shown in the shop window */
  screenshot?: string;
};

export const projectsData: ProjectData[] = [
  {
    id: "truehostel",
    category: "SaaS platform",
    screenshot: "/projects/truehostel.png",
    title: "TrueHostel",
    tagline: "Hostel Management SaaS Platform",
    description:
      "A full-stack hostel management SaaS platform built end-to-end — from architecture and database schema to production deployment on Microsoft Azure. It digitizes police verification, bookings, occupancy, and reporting for hostel operators.",
    role: "Full-Stack Developer",
    duration: "2026 - Present",
    stack: ["React", "Node.js", "Express", "REST APIs", "Azure", "GitHub Actions"],
    features: [
      "Digital police verification logbook",
      "Booking & room inventory management",
      "Live occupancy tracking",
      "Tenant records & reporting",
      "Admin analytics dashboards",
      "Azure CI/CD deployment",
    ],
    hologram: "occupancy",
    links: {
      live: "https://truehostel.in",
    },
    metrics: [
      { label: "End-to-End Ownership", value: 100, suffix: "%" },
      { label: "Core Modules", value: 6, suffix: "+" },
      { label: "Paper Registers", value: 0 },
      { label: "Deploys Automated", value: 100, suffix: "%" },
    ],
    caseStudy: {
      problem:
        "Hostel operators ran on paper registers and disconnected spreadsheets. Police verification records, bookings, and occupancy were all tracked manually — slow, error-prone, and a real regulatory compliance risk.",
      architecture:
        "I built the platform end-to-end: designed the database schema and secure REST APIs on Node.js and Express, and a React frontend covering a digital police verification logbook, room inventory, occupancy tracking, tenant records, and admin reporting dashboards. Production runs on Azure App Service and Static Web Apps with GitHub Actions CI/CD.",
      results:
        "Live in production at truehostel.in. Manual paper registers were fully replaced with a compliant digital logbook, operators manage bookings and occupancy from a single dashboard, and automated pipelines cut manual release effort and deployment errors.",
    },
    image:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=2000&h=1200",
  },
  {
    id: "codinginfobot",
    category: "SaaS platform",
    screenshot: "/projects/codinginfobot.png",
    title: "CodingInfoBot",
    tagline: "Embeddable Chatbot & Support SaaS",
    description:
      "A multi-tenant chatbot SaaS: customers paste one snippet into their product and get a branded live-chat widget, while their team answers from a realtime dashboard — with tracked outbound email and bulk campaigns built into the same platform.",
    role: "Full-Stack Developer",
    duration: "2026 - Present",
    stack: ["Next.js", "Express 5", "MongoDB", "Socket.IO", "BullMQ", "Zod", "Azure"],
    features: [
      "One-line embeddable chat widget",
      "Multi-tenant workspace isolation",
      "Realtime agent dashboard",
      "Outbound email campaigns on BullMQ",
      "Open / click tracking",
      "Live widget restyling over sockets",
    ],
    hologram: "chat",
    links: {
      live: "https://codinginfotechchatfrontend-eyggg5a3d9gpa8ee.eastus-01.azurewebsites.net/",
    },
    metrics: [
      { label: "Line Embed Snippet", value: 1 },
      { label: "API Route Groups", value: 17, suffix: "+" },
      { label: "Re-pastes to Restyle", value: 0 },
    ],
    caseStudy: {
      problem:
        "Businesses want live chat inside their own products without building it — but embedding on arbitrary customer domains normally means CORS configuration per domain, and every widget restyle means re-pasting a new snippet on every site.",
      architecture:
        "A multi-tenant Express 5 + MongoDB API where the workspace is the tenant boundary — every visitor, conversation, message, and email carries a workspaceId, and every route filters on it with zod-validated requests. The embed snippet mounts an iframe on the platform's own /embed route keyed by a public workspaceKey, so customer domains never enter CORS. Socket.IO authenticates agents in the connection handshake and admits visitors only after they prove ownership of a conversation. An outbound email agent runs campaigns on BullMQ with merge tags, cron schedules, per-campaign and per-sender daily limits, open/click tracking, and unsubscribe suppression enforced at send time.",
      results:
        "Integration is a one-line paste. Widget appearance is served from the API, so restyling in Settings propagates to every embedded site live over sockets — zero re-pastes. Health and readiness endpoints keep rolling deploys from routing traffic to half-started instances, and the platform runs in production on Azure App Service.",
    },
  },
  {
    id: "codekairo",
    category: "Coding platform",
    screenshot: "/projects/codekairo.png",
    title: "CodeKairo",
    tagline: "Competitive Coding & Bug-Hunting Platform",
    description:
      "A full-stack competitive coding platform with a high-concurrency code execution engine, real-time pair programming, and a gamification system designed to keep developers coming back.",
    role: "Creator & Full-Stack Developer",
    duration: "Personal Project",
    stack: ["React", "Node.js", "Socket.IO", "Judge0", "Monaco Editor", "Material UI"],
    features: [
      "High-concurrency Judge0 execution engine",
      "Pair Mode — live code sync",
      "Shared cursors & shared execution",
      "JWT + OTP + rate-limited auth",
      "XP, streaks & gamification",
      "Analytics dashboards",
    ],
    hologram: "editor",
    links: {
      live: "https://codekairo.com",
      github: "https://github.com/ayaanp14",
    },
    metrics: [
      { label: "Test Cases Handled", value: 1000, suffix: "s" },
      { label: "Languages via Judge0", value: 60, suffix: "+" },
      { label: "Auth Layers", value: 3 },
      { label: "Realtime Code Sync", value: 100, suffix: "%" },
    ],
    caseStudy: {
      problem:
        "Running untrusted code at scale is hard — thousands of submissions with heavy test suites can choke a platform. And most coding platforms treat collaboration as an afterthought, with no way to solve problems together in real time.",
      architecture:
        "I built a high-concurrency execution engine on Judge0 with asynchronous processing to handle thousands of test cases efficiently. Pair Mode uses Socket.IO and Monaco Editor for live code sync, shared cursors, and shared execution. Authentication is stateless — JWT + OTP + rate limiting with progressive cooldowns to prevent abuse.",
      results:
        "The platform executes thousands of test cases without breaking a sweat, and Pair Mode delivers true real-time collaboration. A gamification layer — XP, streaks, and analytics dashboards — measurably increased user engagement and retention, wrapped in a polished Material UI, Tailwind, and Framer Motion interface.",
    },
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=2000&h=1200",
  },
  {
    id: "qrify",
    category: "Full-stack app",
    title: "Qrify",
    tagline: "QR Code Generator & Decoder",
    description:
      "A full-stack web application to generate and decode QR codes with metadata tracking. Every generated code is stored in MySQL for retrieval and analytics, with URL shortening built in.",
    role: "Creator & Full-Stack Developer",
    duration: "Personal Project",
    stack: ["Node.js", "Express", "REST APIs", "MySQL"],
    features: [
      "Text-to-QR generation",
      "Image upload QR decoding",
      "Built-in URL shortening",
      "MySQL metadata tracking",
    ],
    hologram: "qr",
    links: {
      github: "https://github.com/ayaanp14",
    },
    metrics: [
      { label: "Core Features", value: 3 },
      { label: "Metadata Tracked", value: 100, suffix: "%" },
      { label: "Full-Stack Build", value: 100, suffix: "%" },
    ],
    caseStudy: {
      problem:
        "Most QR tools are one-shot: generate a code and lose all context. There was no lightweight way to generate, decode, and track QR codes with their metadata in one place.",
      architecture:
        "I built a REST API with Node.js and Express supporting text-to-QR generation, image upload for QR decoding, and URL shortening. Every code's metadata is persisted in MySQL for tracking and retrieval.",
      results:
        "A complete full-stack app where every generated code is traceable — generation, decoding, and shortening all flow through one API with a persistent metadata store.",
    },
    image:
      "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=2000&h=1200",
  },
];
