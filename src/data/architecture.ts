export type ArchitectureLayer = {
  id: string;
  title: string;
  tech: string;
  detail: string;
};

/** The five layers of the system architecture section — real production stack. */
export const architectureLayers: ArchitectureLayer[] = [
  {
    id: "frontend",
    title: "FRONTEND",
    tech: "React / Next.js",
    detail: "Component-driven UIs across TrueHostel, Viasocket and CodeKairo",
  },
  {
    id: "backend",
    title: "BACKEND",
    tech: "Node.js / Express",
    detail: "Secure REST APIs, zod-validated, multi-tenant by design",
  },
  {
    id: "realtime",
    title: "REAL-TIME LAYER",
    tech: "Socket.IO / BullMQ",
    detail: "Live chat widgets, pair programming, queued job pipelines",
  },
  {
    id: "data",
    title: "DATA LAYER",
    tech: "MongoDB / PostgreSQL / MySQL",
    detail: "Document + relational stores, schema design to ORM",
  },
  {
    id: "infra",
    title: "INFRASTRUCTURE",
    tech: "Azure / GitHub Actions",
    detail: "App Service, Static Web Apps, automated CI/CD pipelines",
  },
];
