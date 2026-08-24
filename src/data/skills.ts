import type { IconType } from "react-icons";
import {
  SiReact,
  SiJavascript,
  SiTailwindcss,
  SiMui,
  SiFramer,
  SiNodedotjs,
  SiExpress,
  SiSocketdotio,
  SiJsonwebtokens,
  SiMongodb,
  SiMysql,
  SiPostgresql,
  SiPrisma,
  SiRailway,
  SiGithubactions,
  SiGit,
  SiPostman,
  SiOpenjdk,
  SiPython,
  SiCplusplus,
} from "react-icons/si";
import { VscAzure } from "react-icons/vsc";
import { FiServer } from "react-icons/fi";

export type SkillCategory =
  | "Frontend"
  | "Backend"
  | "Database"
  | "Languages"
  | "Cloud & DevOps"
  | "Tools";

export interface SkillNode {
  id: string;
  name: string;
  category: SkillCategory;
  icon: IconType;
  description: string;
  level: number; // 0 to 1
  related: string[]; // IDs of related skills
}

export const skillsData: SkillNode[] = [
  // Frontend
  {
    id: "react",
    name: "React",
    category: "Frontend",
    icon: SiReact,
    description: "Component-driven UIs — the R in MERN. Used across TrueHostel, Viasocket, and Codexa.",
    level: 0.95,
    related: ["javascript", "tailwindcss", "mui", "framer-motion", "nodejs"],
  },
  {
    id: "javascript",
    name: "JavaScript",
    category: "Languages",
    icon: SiJavascript,
    description: "Primary language across the full stack, frontend to backend.",
    level: 0.95,
    related: ["react", "nodejs", "express"],
  },
  {
    id: "tailwindcss",
    name: "Tailwind CSS",
    category: "Frontend",
    icon: SiTailwindcss,
    description: "Utility-first styling for fast, consistent interfaces.",
    level: 0.9,
    related: ["react", "mui"],
  },
  {
    id: "mui",
    name: "Material UI",
    category: "Frontend",
    icon: SiMui,
    description: "Component library powering Codexa's polished interface.",
    level: 0.85,
    related: ["react", "tailwindcss"],
  },
  {
    id: "framer-motion",
    name: "Framer Motion",
    category: "Frontend",
    icon: SiFramer,
    description: "Production-ready animations and micro-interactions.",
    level: 0.8,
    related: ["react"],
  },

  // Backend
  {
    id: "nodejs",
    name: "Node.js",
    category: "Backend",
    icon: SiNodedotjs,
    description: "JavaScript runtime powering every backend I've shipped.",
    level: 0.9,
    related: ["express", "socketio", "jwt", "mongodb", "rest-api"],
  },
  {
    id: "express",
    name: "Express.js",
    category: "Backend",
    icon: SiExpress,
    description: "Minimal, fast API framework — the E in MERN.",
    level: 0.9,
    related: ["nodejs", "rest-api", "jwt"],
  },
  {
    id: "rest-api",
    name: "REST APIs",
    category: "Backend",
    icon: FiServer,
    description: "Secure, optimized API design — from TrueHostel to Viasocket.",
    level: 0.9,
    related: ["express", "nodejs", "postman"],
  },
  {
    id: "socketio",
    name: "Socket.IO",
    category: "Backend",
    icon: SiSocketdotio,
    description: "Real-time bidirectional messaging — chatbot SaaS widget and Codexa Pair Mode.",
    level: 0.85,
    related: ["nodejs", "express"],
  },
  {
    id: "jwt",
    name: "JWT Auth",
    category: "Backend",
    icon: SiJsonwebtokens,
    description: "Stateless authentication with OTP and rate limiting.",
    level: 0.85,
    related: ["express", "nodejs"],
  },

  // Databases
  {
    id: "mongodb",
    name: "MongoDB",
    category: "Database",
    icon: SiMongodb,
    description: "Document database — the M in MERN.",
    level: 0.85,
    related: ["nodejs", "express"],
  },
  {
    id: "mysql",
    name: "MySQL",
    category: "Database",
    icon: SiMysql,
    description: "Relational store behind Qrify's metadata tracking.",
    level: 0.8,
    related: ["rest-api", "prisma"],
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "Database",
    icon: SiPostgresql,
    description: "Advanced open-source relational database.",
    level: 0.8,
    related: ["prisma", "nodejs"],
  },
  {
    id: "prisma",
    name: "Prisma ORM",
    category: "Database",
    icon: SiPrisma,
    description: "Type-safe database access and schema management.",
    level: 0.8,
    related: ["postgresql", "mysql", "nodejs"],
  },

  // Cloud & DevOps
  {
    id: "azure",
    name: "Microsoft Azure",
    category: "Cloud & DevOps",
    icon: VscAzure,
    description: "App Service & Static Web Apps hosting TrueHostel in production.",
    level: 0.8,
    related: ["github-actions", "railway"],
  },
  {
    id: "github-actions",
    name: "GitHub Actions",
    category: "Cloud & DevOps",
    icon: SiGithubactions,
    description: "CI/CD pipelines that removed manual release effort.",
    level: 0.8,
    related: ["azure", "git"],
  },
  {
    id: "railway",
    name: "Railway",
    category: "Cloud & DevOps",
    icon: SiRailway,
    description: "Fast cloud deployments for side projects and APIs.",
    level: 0.75,
    related: ["nodejs", "azure"],
  },
  {
    id: "git",
    name: "Git & GitHub",
    category: "Cloud & DevOps",
    icon: SiGit,
    description: "Version control and collaborative workflows.",
    level: 0.9,
    related: ["github-actions"],
  },

  // Languages & Tools
  {
    id: "java",
    name: "Java",
    category: "Languages",
    icon: SiOpenjdk,
    description: "Taught to 900+ students; strong foundation in DSA and OOP.",
    level: 0.85,
    related: ["python", "cpp"],
  },
  {
    id: "python",
    name: "Python",
    category: "Languages",
    icon: SiPython,
    description: "Scripting, problem solving, and teaching.",
    level: 0.75,
    related: ["java"],
  },
  {
    id: "cpp",
    name: "C++",
    category: "Languages",
    icon: SiCplusplus,
    description: "Competitive programming and core CS fundamentals.",
    level: 0.75,
    related: ["java"],
  },
  {
    id: "postman",
    name: "Postman",
    category: "Tools",
    icon: SiPostman,
    description: "API testing and documentation workflows.",
    level: 0.85,
    related: ["rest-api"],
  },
];
