import type { IconType } from "react-icons";
import {
  SiElectron,
  SiExpress,
  SiGithubactions,
  SiMongodb,
  SiMui,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPrisma,
  SiRailway,
  SiRazorpay,
  SiReact,
  SiRedis,
  SiSocketdotio,
  SiZod,
} from "react-icons/si";
import { VscAzure } from "react-icons/vsc";

/** Keyword → icon. Matched against the start of a stack entry ("React 19", "Express 5"). */
const ICONS: [string, IconType][] = [
  ["react", SiReact],
  ["next", SiNextdotjs],
  ["node", SiNodedotjs],
  ["express", SiExpress],
  ["mongodb", SiMongodb],
  ["mysql", SiMysql],
  ["postgres", SiPostgresql],
  ["prisma", SiPrisma],
  ["socket", SiSocketdotio],
  ["redis", SiRedis],
  ["zod", SiZod],
  ["azure", VscAzure],
  ["github actions", SiGithubactions],
  ["railway", SiRailway],
  ["razorpay", SiRazorpay],
  ["electron", SiElectron],
  ["material", SiMui],
];

export function techIcon(name: string): IconType | undefined {
  const n = name.toLowerCase();
  return ICONS.find(([k]) => n.startsWith(k))?.[1];
}

/** The first `max` stack entries that have an icon */
export function stackWithIcons(stack: readonly string[], max = 3) {
  return stack.flatMap((name) => {
    const Icon = techIcon(name);
    return Icon ? [{ name, Icon }] : [];
  }).slice(0, max);
}
