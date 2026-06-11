import { getLocale } from "@/i18n";
import { DemoCoachClient } from "./demo-coach-client";

export const metadata = {
  title: "Free Coaching Session",
  description:
    "A guided coaching session that starts instantly — no account, no waiting. Clarity, insight and one concrete step.",
};

export default async function DemoCoachPage() {
  const locale = await getLocale();
  return <DemoCoachClient locale={locale} />;
}
