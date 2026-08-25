import { profile } from "@/data/profile";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-3 px-5 py-5 font-mono text-[10.5px] tracking-[0.12em] text-dim md:flex-row md:px-8">
        <p>© 2026 {profile.name}. All rights reserved.</p>
        <p className="text-muted">
          <span className="text-signal">&gt;_</span> KEEP BUILDING. KEEP LEARNING. KEEP
          IMPACTING.
        </p>
        <p className="flex items-center gap-2">
          <span className="status-dot" aria-hidden="true" />/ SYSTEM ONLINE
        </p>
      </div>
    </footer>
  );
}
