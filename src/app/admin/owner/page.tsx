import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { OwnerForm } from "./owner-form";

export default async function OwnerPage() {
  await requireProfile("admin");
  const supabase = await createClient();
  const { data } = await supabase.from("owner_profile").select("*").eq("id", true).single();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-semibold">Owner profile</h1>
        <p className="text-soft text-sm">Your public-facing platform owner details.</p>
      </header>
      <OwnerForm owner={data ?? {}} />
    </div>
  );
}
