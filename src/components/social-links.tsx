import { FOUNDER } from "@/lib/founder";

const ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
      <path d="M10.5 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M14 4v9.5a4 4 0 1 1-4-4" />
      <path d="M14 5.5c.8 1.8 2.4 3 4.5 3.2" />
    </svg>
  ),
  facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M14.5 8.5H17V5h-2.5A3.5 3.5 0 0 0 11 8.5V11H8.5v3.5H11V21h3.5v-6.5H17l.5-3.5h-3z" />
    </svg>
  ),
  telegram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M21 4 3.5 11l5 1.8L10 19l3-3.2 4.5 3.2z" />
    </svg>
  ),
};

export function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={className ?? "flex items-center gap-2"}>
      {FOUNDER.socials.map((s) => (
        <a
          key={s.key}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          title={s.label}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-soft transition hover:border-sage/50 hover:text-ink"
        >
          {ICONS[s.key]}
        </a>
      ))}
    </div>
  );
}
