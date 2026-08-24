export const siteConfig = {
  name: "Ayaan Pathan",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  title: "Ayaan Pathan | Full-Stack Developer (MERN)",
  description:
    "Portfolio of Ayaan Pathan — a full-stack MERN developer with 3+ years of experience shipping SaaS products from scratch to production: secure REST APIs, real-time systems with Socket.IO, and cloud deployment on Microsoft Azure.",
  links: {
    github: "https://github.com/ayaanp14",
    linkedin: "https://www.linkedin.com/in/ayaan-pathan-487981194",
    email: "mailto:ayaanpathan14@gmail.com",
  },
} as const;
