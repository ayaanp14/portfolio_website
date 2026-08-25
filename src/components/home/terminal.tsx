"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { SysPanel } from "@/components/core/panel";
import { profile } from "@/data/profile";
import { projectsData } from "@/data/projects";
import { experienceData } from "@/data/experience";
import { skillsData } from "@/data/skills";

type Entry = { command: string; output: string[] };

const COMMANDS = [
  "about",
  "projects",
  "skills",
  "experience",
  "contact",
  "clear",
  "whoami",
  "status",
  "help",
] as const;

function run(commandRaw: string): string[] | "clear" {
  const command = commandRaw.trim().toLowerCase();

  switch (command) {
    case "":
      return [];
    case "help":
      return [
        "Available commands:",
        "",
        "about       - About me",
        "projects    - Show projects",
        "skills      - My technical stack",
        "experience  - My experience",
        "contact     - Get in touch",
        "status      - System status",
        "clear       - Clear terminal",
        "whoami      - Who am I",
      ];
    case "about":
      return [profile.name.toUpperCase(), profile.role, "", profile.tagline];
    case "whoami":
      return [...profile.identities];
    case "projects":
      return projectsData.flatMap((p) => [
        `> ${p.title.toUpperCase()}`,
        `  ${p.tagline}`,
        `  [${p.stack.slice(0, 4).join(", ")}]`,
      ]);
    case "skills": {
      const categories = ["Frontend", "Backend", "Database", "Cloud & DevOps"] as const;
      return categories.map(
        (cat) =>
          `${cat.padEnd(16)}: ${skillsData
            .filter((s) => s.category === cat)
            .map((s) => s.name)
            .join(", ")}`,
      );
    }
    case "experience":
      return experienceData.flatMap((job) => [
        `> ${job.duration}`,
        `  ${job.role} @ ${job.company}`,
      ]);
    case "contact":
      return [
        `email    : ${profile.email}`,
        `phone    : ${profile.phone}`,
        `github   : ${profile.githubHandle}`,
        `linkedin : ${profile.linkedinHandle}`,
        `location : ${profile.location}`,
      ];
    case "status":
      return [
        "SYSTEM ................ ONLINE",
        "AVAILABILITY .......... OPEN TO WORK",
        "CURRENT BUILD ......... TrueHostel + Chatbot SaaS",
        "DEPLOY TARGET ......... Microsoft Azure",
        "UPTIME ................ 99.99%",
      ];
    case "sudo":
    case "sudo su":
      return ["Permission denied: nice try."];
    case "clear":
      return "clear";
    default:
      return [`command not found: ${command}`, `Type 'help' for available commands.`];
  }
}

/** `// LIVE TERMINAL` — a real interactive shell over the portfolio data. */
export function Terminal() {
  const [entries, setEntries] = useState<Entry[]>([
    { command: "help", output: run("help") as string[] },
  ]);
  const [value, setValue] = useState("");
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  const submit = () => {
    const result = run(value);
    if (result === "clear") {
      setEntries([]);
    } else {
      setEntries((prev) => [...prev, { command: value, output: result }]);
    }
    setValue("");
    setHistoryIndex(-1);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const commands = entries.map((en) => en.command).filter(Boolean);
      const next = historyIndex < 0 ? commands.length - 1 : Math.max(0, historyIndex - 1);
      if (commands[next] !== undefined) {
        setHistoryIndex(next);
        setValue(commands[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const commands = entries.map((en) => en.command).filter(Boolean);
      const next = historyIndex + 1;
      if (next >= commands.length) {
        setHistoryIndex(-1);
        setValue("");
      } else {
        setHistoryIndex(next);
        setValue(commands[next]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = COMMANDS.find((c) => c.startsWith(value.toLowerCase()) && value !== "");
      if (match) setValue(match);
    }
  };

  return (
    <SysPanel
      title="LIVE TERMINAL"
      className="flex flex-col"
      bodyClassName="flex min-h-0 flex-1 flex-col p-0"
    >
      <div
        ref={scrollRef}
        className="h-[380px] flex-1 cursor-text overflow-y-auto p-4 font-mono text-[11.5px] leading-relaxed"
        onClick={() => inputRef.current?.focus()}
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
      >
        {entries.map((entry, i) => (
          <div key={i} className="mb-2">
            <p>
              <span className="text-signal">ayaan@portfolio</span>
              <span className="text-dim">:~$</span>{" "}
              <span className="text-ink">{entry.command}</span>
            </p>
            {entry.output.map((line, j) => (
              <p key={j} className="whitespace-pre-wrap text-muted">
                {line || " "}
              </p>
            ))}
          </div>
        ))}

        <div className="flex items-center gap-0">
          <span className="text-signal">ayaan@portfolio</span>
          <span className="text-dim">:~$</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            className="ml-2 min-w-0 flex-1 border-none bg-transparent font-mono text-[11.5px] text-ink caret-signal outline-none"
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal command input"
          />
        </div>
      </div>

      <p className="border-t border-line px-4 py-2 font-mono text-[9px] tracking-[0.14em] text-dim">
        TAB AUTOCOMPLETE // ↑↓ HISTORY // ENTER EXECUTE
      </p>
    </SysPanel>
  );
}
