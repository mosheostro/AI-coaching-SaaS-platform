"use client";

import { useActionState } from "react";
import { changeMyPassword, updateMyAccount, type ActionState } from "../actions";

export function AccountForms({ fullName, email }: { fullName: string; email: string }) {
  const [pw, pwAction, pwPending] = useActionState<ActionState, FormData>(changeMyPassword, {});
  const [ac, acAction, acPending] = useActionState<ActionState, FormData>(updateMyAccount, {});

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card">
        <h2 className="mb-4 font-semibold">Profile</h2>
        <form action={acAction} className="space-y-4">
          <Field label="Full name" name="full_name" defaultValue={fullName} />
          <Field label="Email" name="email" type="email" defaultValue={email} />
          {ac.error && <p className="text-sm text-red-600">{ac.error}</p>}
          {ac.message === "saved" && <p className="text-sm text-emerald-600">Saved. Email changes require confirmation.</p>}
          <button disabled={acPending} className="btn-primary">Save profile</button>
        </form>
      </div>

      <div className="card">
        <h2 className="mb-4 font-semibold">Change password</h2>
        <form action={pwAction} className="space-y-4">
          <Field label="New password" name="password" type="password" minLength={8} required />
          <p className="text-xs text-soft">At least 8 characters, including a letter and a number.</p>
          {pw.error && <p className="text-sm text-red-600">{pw.error}</p>}
          <button disabled={pwPending} className="btn-primary">Update password</button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", defaultValue, minLength, required }: { label: string; name: string; type?: string; defaultValue?: string; minLength?: number; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium">{label}</label>
      <input id={name} name={name} type={type} defaultValue={defaultValue} minLength={minLength} required={required} className="input" />
    </div>
  );
}
