// Shared validation for the auth flows.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

/**
 * Production-sane password policy without being annoying:
 * at least 8 chars, with at least one letter and one number.
 * Supabase also enforces a server-side minimum; keep these in sync.
 */
export function passwordProblem(password: string): string | null {
  if (password.length < 8) return "weakPassword";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return "weakPassword";
  if (password.length > 72) return "weakPassword"; // bcrypt limit
  return null;
}
