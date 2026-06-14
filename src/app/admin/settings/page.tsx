import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  await requireProfile("admin");
  const supabase = await createClient();
  const { data } = await supabase.from("platform_settings").select("*").eq("id", true).single();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Platform settings</h1>
        <p className="text-soft text-sm">Branding, SEO, email, languages, and social links.</p>
      </header>
      <SettingsForm settings={data ?? {}} />
    </div>
  );
}
