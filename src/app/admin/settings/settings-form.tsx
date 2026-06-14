"use client";

import { useActionState } from "react";
import { savePlatformSettings, type ActionState } from "../actions";

type J = Record<string, unknown>;
export function SettingsForm({ settings }: { settings: J }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(savePlatformSettings, {});
  const branding = (settings.branding ?? {}) as J;
  const seo = (settings.seo ?? {}) as J;
  const email = (settings.email ?? {}) as J;
  const social = (settings.social ?? {}) as J;
  const v = (x: unknown) => (typeof x === "string" ? x : "");
  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Branding">
          <F label="Brand name" name="brand_name" def={v(branding.name)} />
          <F label="Tagline" name="brand_tagline" def={v(branding.tagline)} />
          <F label="Logo URL" name="logo_url" def={v(branding.logo_url)} />
        </Card>
        <Card title="SEO">
          <F label="Meta title" name="seo_title" def={v(seo.title)} />
          <F label="Meta description" name="seo_description" def={v(seo.description)} />
          <F label="OG image URL" name="og_image" def={v(seo.og_image)} />
        </Card>
        <Card title="Email">
          <F label="From address" name="email_from" def={v(email.from)} />
          <F label="Reply-to" name="email_reply" def={v(email.reply_to)} />
        </Card>
        <Card title="Social links">
          <F label="Twitter / X" name="s_twitter" def={v(social.twitter)} />
          <F label="LinkedIn" name="s_linkedin" def={v(social.linkedin)} />
          <F label="Instagram" name="s_instagram" def={v(social.instagram)} />
        </Card>
      </div>
      <div className="flex items-center gap-3">
        <button disabled={pending} className="btn-primary">Save settings</button>
        {state.message === "saved" && <span className="text-sm text-emerald-600">Saved.</span>}
        {state.error && <span className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="card space-y-4"><h2 className="font-semibold">{title}</h2>{children}</div>;
}
function F({ label, name, def }: { label: string; name: string; def?: string }) {
  return <div><label htmlFor={name} className="mb-1 block text-sm font-medium">{label}</label><input id={name} name={name} defaultValue={def} className="input" /></div>;
}
