import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "./config";
import en from "./dictionaries/en.json";
import ru from "./dictionaries/ru.json";
import he from "./dictionaries/he.json";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, ru, he };

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const v = cookieStore.get("locale")?.value;
  return isLocale(v) ? v : defaultLocale;
}

export async function getDictionary(): Promise<{ t: Dictionary; locale: Locale }> {
  const locale = await getLocale();
  return { t: dictionaries[locale], locale };
}
