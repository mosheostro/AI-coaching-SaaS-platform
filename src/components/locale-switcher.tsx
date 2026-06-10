"use client";

import { useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

export function LocaleSwitcher({ current }: { current: Locale }) {
  const router = useRouter();

  function setLocale(locale: string) {
    document.cookie = `locale=${locale};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  }

  return (
    <select
      aria-label="Language"
      className="input w-auto py-1.5"
      value={current}
      onChange={(e) => setLocale(e.target.value)}
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {l === "en" ? "English" : l === "ru" ? "Русский" : "עברית"}
        </option>
      ))}
    </select>
  );
}
