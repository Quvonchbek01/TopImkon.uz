import { Link } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils';

/**
 * Wordmark from DESIGN.md section 7: "TopImkon" in Manrope 800 with a small
 * rising-arrow mark in orange. The link text is the accessible name.
 */
export function Logo({
  className,
  tone = 'default',
}: {
  className?: string;
  tone?: 'default' | 'inverse';
}) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center gap-2 rounded-md text-xl font-extrabold tracking-tight',
        tone === 'inverse' ? 'text-inverse-foreground' : 'text-foreground',
        className,
      )}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 shrink-0" fill="none">
        <path
          d="M3.5 17.5 9 12l3.5 3 8-8.5"
          stroke="var(--orange-500)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20.5" cy="6.5" r="2.5" fill="var(--orange-500)" />
      </svg>
      <span>
        Top<span className="text-tag-orange-fg">Imkon</span>
      </span>
    </Link>
  );
}
