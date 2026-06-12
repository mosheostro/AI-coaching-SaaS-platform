"use client";

import { useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

/** Compact one-tap language selector — fits mobile portrait headers. */
const SHORT: Record<Locale, string> = { en: "EN", ru: "RU", he: "עב" };

export function LocaleSwitcher({ current }: { current: Locale }) {
  const router = useRouter();

  function setLocale(locale: string) {
    document.cookie = `locale=${locale};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  }

  return (
    <select
      aria-label="Language"
      className="input w-auto px-2.5 py-1.5"
      value={current}
      onChange={(e) => setLocale(e.target.value)}
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {SHORT[l]}
        </option>
      ))}
    </select>
  );
}
