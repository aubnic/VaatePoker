import type { ReactNode } from "react";

export function Explain({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="mb-6 rounded-[var(--radius-xl)] border border-border bg-surface p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-accent">{title}</p>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted">{children}</div>
    </aside>
  );
}

export function Term({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="border-b border-border py-3 last:border-0">
      <dt className="font-medium text-fg">{name}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-muted">{children}</dd>
    </div>
  );
}
