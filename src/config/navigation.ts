/** The six chapters of the journey — order matches the 3D world zones. */
export const chapters = [
  { id: "index", number: "01", label: "Index" },
  { id: "street", number: "02", label: "The Street" },
  { id: "factory", number: "03", label: "The Factory" },
  { id: "hood", number: "04", label: "Under the Hood" },
  { id: "missions", number: "05", label: "Missions" },
  { id: "contact", number: "06", label: "Contact" },
] as const;

export type ChapterId = (typeof chapters)[number]["id"];

/** Primary navigation — deliberately minimal, like the reference. */
export const navigationItems = [
  { label: "Index", href: "#index", chapter: 0 },
  { label: "Work", href: "#street", chapter: 1 },
  { label: "Contact", href: "#contact", chapter: 5 },
] as const;
