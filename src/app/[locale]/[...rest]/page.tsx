import { notFound } from 'next/navigation';

/**
 * Catches every path inside a locale that no route matches (for example
 * `/uz/this-page-does-not-exist`). Without this file Next.js would fall back to
 * the bare root 404; with it the locale-aware `not-found.tsx` renders inside the
 * normal header/footer shell and keeps the user's language.
 */
export default function CatchAllPage() {
  notFound();
}
