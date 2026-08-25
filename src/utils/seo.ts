import { profile } from "@/data/profile";

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: "Full-Stack Developer (MERN)",
    email: `mailto:${profile.email}`,
    telephone: profile.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Indore",
      addressRegion: "Madhya Pradesh",
      addressCountry: "IN",
    },
    sameAs: [profile.links.github, profile.links.linkedin],
    knowsAbout: [
      "MERN Stack",
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Socket.IO",
      "REST APIs",
      "JWT Authentication",
      "MySQL",
      "PostgreSQL",
      "Microsoft Azure",
      "CI/CD",
      "Java",
    ],
  };
}
