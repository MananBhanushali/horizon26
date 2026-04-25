import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid place-items-center min-h-screen px-4">
      <div className="h-panel-raised h-scanline w-full max-w-lg p-8 text-center">
        <div className="h-tick text-[var(--color-warn)]">404 · NOT FOUND</div>
        <h1 className="h-mono text-3xl mt-3 tracking-tight">Off-grid.</h1>
        <p className="text-sm text-[var(--color-ink-mid)] mt-2 leading-relaxed">
          That route isn't on the terminal. Head back to the dashboard or use the command bar (⌘K).
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-5 h-mono text-xs rounded border border-[var(--color-cyan-dim)] bg-[var(--color-cyan-soft)] px-3 py-1.5 text-[var(--color-cyan)] hover:bg-[var(--color-cyan)]/15"
        >
          ← BACK TO DASHBOARD
        </Link>
      </div>
    </div>
  );
}
