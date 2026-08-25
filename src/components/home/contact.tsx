"use client";

import { useState, type FormEvent } from "react";
import { FiArrowRight, FiGithub, FiLinkedin, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

import { SysPanel } from "@/components/core/panel";
import { profile } from "@/data/profile";

const contactRows = [
  { icon: FiMapPin, text: profile.location, href: undefined },
  { icon: FiMail, text: profile.email, href: `mailto:${profile.email}` },
  { icon: FiPhone, text: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
  { icon: FiLinkedin, text: profile.linkedinHandle, href: profile.links.linkedin },
  { icon: FiGithub, text: profile.githubHandle, href: profile.links.github },
];

/**
 * `// GET IN TOUCH` — real contact channels. The form composes a mail
 * draft (no backend) and plays the transmission-complete sequence.
 */
export function Contact() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const message = String(data.get("message") ?? "");
    const from = String(data.get("email") ?? "");

    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}\n${from}`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <SysPanel
      title="GET IN TOUCH"
      className="flex flex-col"
      bodyClassName="flex min-h-[380px] flex-1 flex-col gap-6 p-5 lg:flex-row"
    >
      <div className="flex-1">
        <h3 className="sys-heading text-[clamp(1.5rem,2.4vw,2.1rem)] font-bold leading-tight text-white">
          LET&apos;S BUILD
          <br />
          SOMETHING THAT
          <br />
          MATTERS.
        </h3>

        <ul className="mt-6 space-y-3">
          {contactRows.map(({ icon: Icon, text, href }) => (
            <li key={text} className="flex items-center gap-3 font-mono text-[11.5px]">
              <Icon className="shrink-0 text-signal" size={13} aria-hidden="true" />
              {href ? (
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="break-all text-muted transition-colors hover:text-signal"
                  data-cursor="OPEN"
                >
                  {text}
                </a>
              ) : (
                <span className="text-muted">{text}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-3" aria-label="Contact form">
        <label className="sr-only" htmlFor="contact-name">
          Your name
        </label>
        <input
          id="contact-name"
          name="name"
          required
          placeholder="Your Name"
          className="border border-line-soft bg-void/60 px-3.5 py-2.5 font-mono text-[12px] text-ink placeholder:text-dim focus:border-signal focus:outline-none"
        />
        <label className="sr-only" htmlFor="contact-email">
          Your email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          placeholder="Your Email"
          className="border border-line-soft bg-void/60 px-3.5 py-2.5 font-mono text-[12px] text-ink placeholder:text-dim focus:border-signal focus:outline-none"
        />
        <label className="sr-only" htmlFor="contact-message">
          Your message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="Your Message"
          className="flex-1 resize-none border border-line-soft bg-void/60 px-3.5 py-2.5 font-mono text-[12px] text-ink placeholder:text-dim focus:border-signal focus:outline-none"
        />

        <button type="submit" className="btn-system justify-center" data-cursor="EXECUTE">
          <FiArrowRight aria-hidden="true" />
          TRANSMIT MESSAGE
        </button>

        <AnimatePresence>
          {sent && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[11px] leading-relaxed text-signal"
              role="status"
            >
              <p>&gt; TRANSMISSION COMPLETE</p>
              <p>&gt; CONNECTION ESTABLISHED</p>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </SysPanel>
  );
}
