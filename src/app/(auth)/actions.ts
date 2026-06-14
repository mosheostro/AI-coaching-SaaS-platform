"use server";
// Auth server actions: instant-access signup, login, password reset.

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail, passwordProblem } from "@/lib/auth-validation";
import { rateLimited, RULES } from "@/lib/rate-limit";
import { getOrigin, clientIp } from "@/lib/site-url";

export type AuthState = { error?: string; message?: string };

// Internal codes the forms localize via the dictionary.
const ERR = {
  invalidEmail: "invalidEmail",
  weakPassword: "weakPassword",
  tooMany: "tooManyAttempts",
  generic: "genericError",
} as const;

async function ip(): Promise<string> {
  return clientIp(await headers());
}

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const captchaToken = String(formData.get("cf-turnstile-response") ?? "");

  if (rateLimited(`login:${await ip()}`, RULES.login)) {
    return { error: ERR.tooMany };
  }
  if (!isValidEmail(email)) return { error: ERR.invalidEmail };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: captchaToken ? { captchaToken } : undefined,
  });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = formData.get("role") === "coach" ? "coach" : "client";
  const captchaToken = String(formData.get("cf-turnstile-response") ?? "");

  if (rateLimited(`signup:${await ip()}`, RULES.signup)) {
    return { error: ERR.tooMany };
  }
  if (!isValidEmail(email)) return { error: ERR.invalidEmail };
  const pwProblem = passwordProblem(password);
  if (pwProblem) return { error: pwProblem };

  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
      // Used only if email confirmation is re-enabled later.
      emailRedirectTo: `${origin}/auth/confirm?next=/dashboard`,
      ...(captchaToken ? { captchaToken } : {}),
    },
  });

  if (error) return { error: error.message };

  // Instant access: confirmation disabled -> a session is returned now.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  // Fallback if email confirmation is ever turned back on at project level.
  if (data.user && !data.session) {
    return { message: "check_email" };
  }

  return { error: ERR.generic };
}

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const captchaToken = String(formData.get("cf-turnstile-response") ?? "");

  if (rateLimited(`reset:${await ip()}`, RULES.reset)) {
    return { error: ERR.tooMany };
  }
  if (!isValidEmail(email)) return { error: ERR.invalidEmail };

  const supabase = await createClient();
  const origin = await getOrigin();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
    ...(captchaToken ? { captchaToken } : {}),
  });

  // Always report success -- never reveal whether an account exists.
  return { message: "reset_sent" };
}

export async function updatePassword(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const pwProblem = passwordProblem(password);
  if (pwProblem) return { error: pwProblem };

  const supabase = await createClient();

  // The recovery link established a session via /auth/confirm.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: ERR.generic };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
