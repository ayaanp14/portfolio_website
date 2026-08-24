export type ExperienceMilestone = {
  id: string;
  company: string;
  role: string;
  duration: string;
  location: string;
  description: string;
  achievements: string[];
  technologies: string[];
};

export const experienceData: ExperienceMilestone[] = [
  {
    id: "exp-codinginfotech",
    company: "Codinginfotech",
    role: "Full-Stack Developer (MERN)",
    duration: "May 2026 - Present",
    location: "Vijay Nagar, Indore, India",
    description:
      "Service and product-based software company. Building TrueHostel (truehostel.in), a hostel management SaaS, and a multi-tenant Chatbot SaaS — both shipped from scratch to production.",
    achievements: [
      "Designed and built TrueHostel end-to-end, from architecture and database schema to production deployment.",
      "Developed a digital police verification logbook that replaced manual paper registers and ensures regulatory compliance for hostel operators.",
      "Built a complete booking management system covering room inventory, occupancy tracking, tenant records, and admin reporting dashboards.",
      "Architected a multi-tenant chatbot SaaS using Socket.IO, delivered as an embeddable widget for third-party client applications.",
      "Deployed production infrastructure on Microsoft Azure with automated GitHub Actions CI/CD pipelines, reducing manual release effort and deployment errors.",
    ],
    technologies: ["React", "Node.js", "Express", "Socket.IO", "Azure", "GitHub Actions"],
  },
  {
    id: "exp-walkover",
    company: "Walkover Web Solutions",
    role: "Full-Stack Engineer",
    duration: "May 2025 - Apr 2026",
    location: "Indore, India",
    description:
      "Worked on Viasocket, Walkover's integration and automation platform, improving developer experience and platform reliability across the product.",
    achievements: [
      "Enhanced Viasocket's Developer Hub with improved UI/UX, authentication, CRUD-based features, and reusable product modules.",
      "Led a major architectural migration of the complete plugin module from frontend to backend, significantly improving security, maintainability, and scalability.",
      "Improved system performance by optimizing REST APIs and backend data flows, and resolved real-time production bugs to keep the platform stable.",
    ],
    technologies: ["React", "Node.js", "REST APIs", "PostgreSQL"],
  },
  {
    id: "exp-urban-coding-hub",
    company: "Urban Coding Hub",
    role: "Founder & Faculty",
    duration: "May 2024 - May 2025",
    location: "Bhopal, India",
    description:
      "Founded and led a certified coding institute, delivering practical, project-based programming education to hundreds of students.",
    achievements: [
      "Taught Java, C++, and Python to 300+ students through hands-on, project-based learning.",
      "Managed a 5-member teaching team and owned curriculum planning, delivery standards, and student outcomes.",
      "Executed Meta ad campaigns that increased student enrollment by 15-20% through improved reach and targeting.",
    ],
    technologies: ["Java", "C++", "Python", "Meta Ads"],
  },
  {
    id: "exp-coding-ninjas",
    company: "Coding Ninjas",
    role: "Teaching Assistant",
    duration: "Sep 2023 - Jan 2024",
    location: "Remote",
    description:
      "Supported Java programming batches in a virtual classroom, providing one-on-one guidance at scale.",
    achievements: [
      "Taught Java programming to 600+ students, resolving 50-60 coding doubts daily through one-on-one support.",
      "Developed structured lesson plans and hands-on coding exercises that measurably improved student comprehension across multiple batches.",
    ],
    technologies: ["Java", "Data Structures", "Algorithms"],
  },
];
