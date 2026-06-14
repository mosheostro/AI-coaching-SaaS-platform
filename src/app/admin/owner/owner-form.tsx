"use client";

import { useActionState } from "react";
import { saveOwnerProfile, type ActionState } from "../actions";

type J = Record<string, unknown>;
export function OwnerForm({ owner }: { owner: J }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveOwnerProfile, {});
  const social = (owner.social_links ?? {}) as J;
  const v = (x: unknown) => (typeof x === "string" ? x : "");
  const langs = Array.isArray(owner.languages) ? (owner.languages as string[]).join(", ") : "";
  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <h2 className="font-semibold">Identity</h2>
          <F label="Full name" name="full_name" def={v(owner.full_name)} />
          <F label="Display name" name="display_name" def={v(owner.display_name)} />
          <F label="Email" name="email" type="email" def={v(owner.email)} />
          <F label="Phone" name="phone" def={v(owner.phone)} />
          <F label="Languages (comma-separated)" name="languages" def={langs} />
        </div>
        <div className="card space-y-4">
          <h2 className="font-semibold">Presence</h2>
          <F label="Website" name="website" def={v(owner.website)} />
          <F label="Contact info" name="contact" def={v(owner.contact)} />
          <F label="Twitter / X" name="twitter" def={v(social.twitter)} />
          <F label="LinkedIn" name="linkedin" def={v(social.linkedin)} />
          <F label="Instagram" name="instagram" def={v(social.instagram)} />
          <F label="YouTube" name="youtube" def={v(social.youtube)} />
        </div>
      </div>
      <div className="card space-y-2">
        <label htmlFor="bio" className="block text-sm font-medium">Bio</label>
        <textarea id="bio" name="bio" defaultValue={v(owner.bio)} rows={4} className="input" />
        <p className="text-xs text-soft">Profile photo upload arrives in the next pass (storage avatars bucket).</p>
      </div>
      <div className="flex items-center gap-3">
        <button disabled={pending} className="btn-primary">Save profile</button>
        {state.message === "saved" && <span className="text-sm text-emerald-600">Saved.</span>}
        {state.error && <span className="text-sm text-red-600">{state.error}</span>}
      </div>
    </form>
  );
}
function F({ label, name, def, type = "text" }: { label: string; name: string; def?: string; type?: string }) {
  return <div><label htmlFor={name} className="mb-1 block text-sm font-medium">{label}</label><input id={name} name={name} type={type} defaultValue={def} className="input" /></div>;
}
