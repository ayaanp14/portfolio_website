export type ProjectMetric = {
  label: string;
  value: number;
  suffix?: string;
};

export type HologramKind = "occupancy" | "chat" | "editor" | "marketplace" | "inventory";

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
  /** Marks a standout project: shown as a ribbon on its shop and a callout in its case study */
  spotlight?: string;
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
    spotlight: "My personal project — built, hosted and live",
    tagline: "Competitive Coding & Bug-Hunting Platform",
    description:
      "My own personal project, designed, built and hosted by me and live at codekairo.com: a full-stack competitive coding platform with a high-concurrency code execution engine, real-time pair programming, and a gamification system designed to keep developers coming back.",
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
        "Hosted and live at codekairo.com. The platform executes thousands of test cases without breaking a sweat, and Pair Mode delivers true real-time collaboration. A gamification layer — XP, streaks, and analytics dashboards — measurably increased user engagement and retention, wrapped in a polished Material UI, Tailwind, and Framer Motion interface.",
    },
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=2000&h=1200",
  },
  {
    id: "vertowork",
    category: "Marketplace",
    screenshot: "/projects/vertowork.png",
    title: "VertoWork",
    tagline: "Freelance Marketplace & Time Tracker",
    description:
      "A full freelance marketplace: clients post jobs and hire, freelancers bid and get paid through milestones or hourly contracts, and a companion desktop app tracks billable time. Web app, API and desktop tracker built as one product.",
    role: "Full-Stack Developer",
    duration: "2026",
    stack: ["React 19", "Express 5", "Prisma", "MySQL", "Socket.IO", "Razorpay", "Electron"],
    features: [
      "Jobs, proposals & bidding",
      "Milestone payments & wallet",
      "Hourly contracts with Work Diary",
      "Electron desktop time tracker",
      "Realtime chat & scheduled calls",
      "Agencies, disputes & admin",
    ],
    hologram: "marketplace",
    links: {},
    metrics: [
      { label: "Database Models", value: 55 },
      { label: "API Route Groups", value: 32 },
      { label: "Server-Rendered Pages", value: 72 },
      { label: "Apps: Web + Desktop", value: 2 },
    ],
    caseStudy: {
      problem:
        "A freelance marketplace has to get money and trust right: clients need proof of work before paying, freelancers need to be paid for the hours they actually put in, and both sides need a fair way out when a contract goes wrong — all while the job pages stay fast and findable in search.",
      architecture:
        "One Node process serves everything: an Express 5 API split into 32 route groups, server-rendered React 19 pages (Vite + React Router, with per-page metadata and JSON-LD for SEO), Socket.IO for chat, and user uploads. Data lives in MySQL behind a 55-model Prisma schema, migrated from MongoDB with dedicated migration scripts. Auth.js handles Firebase email and Google, Facebook, GitHub and credential sign-in. Payments run through Razorpay into wallets, milestones and withdrawals. For hourly contracts, an Electron desktop tracker counts time in 10-minute blocks with a random screenshot and per-minute activity counts in each, stops on idle, sleep or the weekly limit, works offline, and signs in through the browser with PKCE.",
      results:
        "A complete marketplace — jobs, proposals, milestone and hourly contracts, wallet and withdrawals, chat, scheduled calls, agencies, disputes and an admin panel — across 72 server-rendered pages. Hourly work is billed from the same 10-minute blocks the freelancer tracks and the client reviews in the Work Diary, and any block the freelancer deletes is never billed.",
    },
  },
  {
    id: "keel",
    category: "Inventory SaaS",
    screenshot: "/projects/keel.png",
    title: "Keel",
    tagline: "Multi-Marketplace Inventory Management",
    description:
      "A multi-tenant inventory SaaS for sellers who list the same products on Amazon, Flipkart, Shopify, Wix and eBay. MySQL is the single source of truth: a sale on any marketplace reserves stock in one transaction, and background workers push the new quantity to every other channel.",
    role: "Full-Stack Developer",
    duration: "2026",
    stack: ["React", "Express", "Prisma", "MySQL", "BullMQ", "Redis", "Zod", "Railway"],
    features: [
      "One central stock ledger per SKU",
      "Amazon, Flipkart, Shopify, Wix & eBay adapters",
      "Transactional reservations, no overselling",
      "Queued, retryable channel sync",
      "Per-marketplace listing validation",
      "RBAC, tenant isolation & encrypted credentials",
    ],
    hologram: "inventory",
    links: {
      live: "https://inventoryfrontend-production-e7e3.up.railway.app",
    },
    metrics: [
      { label: "Marketplaces", value: 5 },
      { label: "Database Models", value: 37 },
      { label: "Test Files", value: 28 },
      { label: "User Roles", value: 5 },
    ],
    caseStudy: {
      problem:
        "Sellers who list the same stock on several marketplaces keep a separate count on each one. A sale on Amazon doesn't change the number on Flipkart or Shopify, so the same last unit gets sold twice — and every marketplace has its own API, listing rules and way of reporting orders.",
      architecture:
        "An Express API over a 37-model Prisma schema on MySQL, which holds every SKU, warehouse, reservation and order; marketplaces only mirror it. Incoming orders (signed webhooks, or polling for eBay) are imported idempotently and reserve stock with row locks inside one transaction, and every change is an append-only ledger entry. BullMQ workers on Redis then push one coalesced update per channel, with exponential backoff, rate-limit-aware retries, a dead-letter queue and a reconciliation job. Each marketplace plugs into one adapter contract that validates its listing rules before anything is sent, with mock adapters for local testing. Security covers argon2id passwords, short-lived JWTs with rotating refresh cookies and reuse detection, five-role RBAC, tenant isolation and AES-256-GCM encryption for marketplace credentials.",
      results:
        "Live on Railway with a working demo. A sale on any channel updates central stock and every other marketplace from a single source of truth; a channel whose listing is missing required fields is held back with the missing fields listed, and sync health — logs, failed-job retries, queue depth — is visible in the app.",
    },
  },
];
