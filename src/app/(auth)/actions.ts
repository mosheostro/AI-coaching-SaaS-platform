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

const ERR = {
  invalidEmail: "invalidEmail",
  weakPassword: "weakPassword",
  tooMany: "tooManyAttempts",
  generic: "genericError",
} as const;

async function reqMeta(): Promise<{ ip: string; ua: string }> {
  const h = await headers();
  return { ip: clientIp(h), ua: h.get("user-agent") ?? "" };
}

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const captchaToken = String(formData.get("cf-turnstile-response") ?? "");
  const { ip, ua } = await reqMeta();

  if (rateLimited(`login:${ip}`, RULES.login)) {
    return { error: ERR.tooMany };
  }
  if (!isValidEmail(email)) return { error: ERR.invalidEmail };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: captchaToken ? { captchaToken } : undefined,
  });

  if (error) {
    // Record the failed attempt for the admin Security Center (best-effort).
    void supabase.rpc("log_security_event", {
      p_type: "failed_login", p_email: email, p_ip: ip, p_user_agent: ua, p_meta: {},
    });
    return { error: error.message };
  }

  void supabase.rpc("log_security_event", {
    p_type: "login", p_email: email, p_ip: ip, p_user_agent: ua, p_meta: {},
  });
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
  const { ip } = await reqMeta();

  if (rateLimited(`signup:${ip}`, RULES.signup)) {
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
      emailRedirectTo: `${origin}/auth/confirm?next=/dashboard`,
      ...(captchaToken ? { captchaToken } : {}),
    },
  });

  if (error) return { error: error.message };

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }
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
  const { ip, ua } = await reqMeta();

  if (rateLimited(`reset:${ip}`, RULES.reset)) {
    return { error: ERR.tooMany };
  }
  if (!isValidEmail(email)) return { error: ERR.invalidEmail };

  const supabase = await createClient();
  const origin = await getOrigin();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
    ...(captchaToken ? { captchaToken } : {}),
  });
  void supabase.rpc("log_security_event", {
    p_type: "password_reset", p_email: email, p_ip: ip, p_user_agent: ua, p_meta: {},
  });
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
