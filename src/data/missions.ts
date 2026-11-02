/** CHOOSE YOUR MISSION — the kinds of work I take on, backed by shipped projects. */
export type Mission = {
  id: string;
  number: string;
  title: string;
  brief: string;
  description: string;
  loadout: string[];
  /** Project ids from projects.ts */
  projects: string[];
};

export const missions: Mission[] = [
  {
    id: "web-apps",
    number: "01",
    title: "Web Application Development",
    brief: "SaaS platforms, from schema to production.",
    description:
      "Full products built end-to-end: data model, secure APIs, a usable interface and an automated deploy. TrueHostel went from an empty repo to truehostel.in this way.",
    loadout: ["React", "Next.js", "Node.js", "Express", "MongoDB", "Azure"],
    projects: ["truehostel", "codinginfobot", "vertowork"],
  },
  {
    id: "backend-api",
    number: "02",
    title: "Backend & API Engineering",
    brief: "Secure, multi-tenant and realtime APIs.",
    description:
      "Validated REST APIs, stateless auth, rate limiting and realtime channels. Tenancy and security are designed in from the first route, not bolted on.",
    loadout: ["Node.js", "Express 5", "Zod", "JWT", "Socket.IO", "BullMQ"],
    projects: ["codinginfobot", "vertowork", "keel", "codekairo"],
  },
  {
    id: "database",
    number: "03",
    title: "Database Architecture",
    brief: "Schemas that survive real usage.",
    description:
      "Choosing between document and relational stores, modelling tenants and records, and keeping queries lean as data grows.",
    loadout: ["MongoDB", "PostgreSQL", "MySQL", "Prisma ORM"],
    projects: ["truehostel", "vertowork", "keel"],
  },
  {
    id: "product",
    number: "04",
    title: "Product Development",
    brief: "Turning a workflow into a product.",
    description:
      "Replacing paper registers, spreadsheets and copy-paste processes with software people actually adopt — scoped, shipped and iterated.",
    loadout: ["Product scoping", "React", "Node.js", "Dashboards", "CI/CD"],
    projects: ["truehostel", "codinginfobot", "codekairo"],
  },
  {
    id: "frontend-motion",
    number: "05",
    title: "Frontend & Motion Design",
    brief: "Interfaces with craft and motion.",
    description:
      "Component systems, realtime editors and dashboards with purposeful micro-interactions — polished enough that people come back.",
    loadout: ["React", "Tailwind CSS", "Material UI", "Framer Motion", "Monaco Editor"],
    projects: ["codekairo", "truehostel"],
  },
  {
    id: "cloud",
    number: "06",
    title: "Cloud & Deployment",
    brief: "Shipping safely, repeatedly.",
    description:
      "Azure hosting, CI/CD pipelines and health checks so releases are routine instead of risky.",
    loadout: ["Azure App Service", "Static Web Apps", "GitHub Actions", "Railway"],
    projects: ["truehostel", "codinginfobot"],
  },
];
