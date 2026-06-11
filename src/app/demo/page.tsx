import { getDictionary } from "@/i18n";
import { DemoClient } from "./demo-client";

export const metadata = {
  title: "Free AI Coaching Session",
  description:
    "Try a real AI coaching session — no account required. Clarity, insight and one concrete next step in minutes.",
};

export default async function DemoPage() {
  const { t, locale } = await getDictionary();

  return (
    <DemoClient
      locale={locale}
      appName={t.app.name}
      labels={{
        eyebrow: t.demo.eyebrow,
        title: t.demo.title,
        sub: t.demo.sub,
        start: t.demo.start,
        restart: t.demo.restart,
        exportLabel: t.demo.export,
        ctaAfter: t.demo.ctaAfter,
        ctaButton: t.demo.ctaButton,
        disclaimer: t.demo.disclaimer,
        thinking: t.demo.thinking,
        typeMessage: t.common.typeMessage,
        send: t.common.send,
        login: t.auth.login,
        phases: t.demo.phases,
      }}
    />
  );
}
