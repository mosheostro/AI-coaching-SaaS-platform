import { getDictionary } from "@/i18n";
import { LandingClient } from "./landing-client";

export default async function LandingPage() {
  const { t, locale } = await getDictionary();
  return <LandingClient t={t.landing} appName={t.app.name} locale={locale} />;
}
