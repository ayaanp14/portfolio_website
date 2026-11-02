/**
 * THE FACTORY — engineering capabilities behind the products. Every
 * technology and capability here is sourced from projects.ts,
 * experience.ts and skills.ts; nothing is aspirational.
 */
export type FactoryModuleKind = "screens" | "servers" | "database" | "gateway" | "cloud" | "gears";

export type FactoryModule = {
  id: string;
  number: string;
  title: string;
  kind: FactoryModuleKind;
  summary: string;
  technologies: string[];
  capabilities: string[];
  /** Project ids from projects.ts, or named roles from experience.ts */
  projects: string[];
};

export const factoryModules: FactoryModule[] = [
  {
    id: "frontend",
    number: "01",
    title: "Frontend Engineering",
    kind: "screens",
    summary:
      "Component-driven interfaces for dashboards, editors and embeddable widgets — built to be used every day, not just demoed.",
    technologies: ["React", "Next.js", "Tailwind CSS", "Material UI", "Framer Motion", "Monaco Editor"],
    capabilities: [
      "Admin dashboards for bookings, occupancy and reporting",
      "In-browser code editor with shared cursors",
      "Embeddable chat widget restyled live from settings",
      "Developer Hub UI/UX improvements on Viasocket",
    ],
    projects: ["TrueHostel", "CodeKairo", "CodingInfoBot", "Viasocket"],
  },
  {
    id: "backend",
    number: "02",
    title: "Backend Engineering",
    kind: "servers",
    summary:
      "Node.js services designed around tenancy, realtime traffic and background work — and migrated when the architecture demanded it.",
    technologies: ["Node.js", "Express 5", "Socket.IO", "BullMQ", "Judge0"],
    capabilities: [
      "Multi-tenant architecture with a workspace boundary on every route",
      "Socket.IO handshake auth for agents and visitors",
      "High-concurrency, asynchronous code execution engine",
      "Led the Viasocket plugin module migration from frontend to backend",
    ],
    projects: ["CodingInfoBot", "CodeKairo", "TrueHostel", "VertoWork", "Keel", "Viasocket"],
  },
  {
    id: "database",
    number: "03",
    title: "Database Architecture",
    kind: "database",
    summary:
      "Document and relational stores chosen per problem — schemas designed first, from tenant isolation to metadata tracking.",
    technologies: ["MongoDB", "PostgreSQL", "MySQL", "Prisma ORM"],
    capabilities: [
      "End-to-end schema design for a hostel management SaaS",
      "Workspace-scoped documents for tenant isolation",
      "55-model Prisma schema on MySQL for a freelance marketplace, migrated from MongoDB",
      "Transactional stock reservations with row locks and an append-only ledger",
    ],
    projects: ["TrueHostel", "CodingInfoBot", "VertoWork", "Keel"],
  },
  {
    id: "api",
    number: "04",
    title: "API Development",
    kind: "gateway",
    summary:
      "Secure, validated REST APIs — stateless auth, rate limits and request validation at the edge of every route.",
    technologies: ["REST APIs", "Zod", "JWT", "OTP", "Postman"],
    capabilities: [
      "17+ zod-validated route groups in a multi-tenant API",
      "JWT + OTP auth with progressive rate-limit cooldowns",
      "REST API optimisation across Viasocket data flows",
      "32 route groups behind a marketplace — jobs, payments, chat and disputes",
    ],
    projects: ["CodingInfoBot", "CodeKairo", "Viasocket", "VertoWork"],
  },
  {
    id: "cloud",
    number: "05",
    title: "Cloud & Infrastructure",
    kind: "cloud",
    summary:
      "Production deployments on Microsoft Azure with health and readiness checks that keep rolling releases safe.",
    technologies: ["Azure App Service", "Azure Static Web Apps", "GitHub Actions", "Railway"],
    capabilities: [
      "TrueHostel and CodingInfoBot running in production on Azure",
      "Health and readiness endpoints for rolling deploys",
      "Frontend on Static Web Apps, APIs on App Service",
      "Keel live on Railway with a public demo",
    ],
    projects: ["TrueHostel", "CodingInfoBot", "Keel"],
  },
  {
    id: "automation",
    number: "06",
    title: "Automation & Testing",
    kind: "gears",
    summary:
      "Pipelines and schedulers that remove manual work — from release automation to queued campaigns and test-case evaluation.",
    technologies: ["GitHub Actions", "BullMQ", "Cron schedules", "Postman", "Judge0"],
    capabilities: [
      "CI/CD pipelines that cut manual release effort and deploy errors",
      "Cron-scheduled email campaigns with per-sender daily limits",
      "Retryable marketplace sync jobs with backoff and a dead-letter queue",
      "Automated evaluation of thousands of submission test cases",
      "API testing and documentation workflows",
    ],
    projects: ["TrueHostel", "CodingInfoBot", "CodeKairo", "Keel"],
  },
];
