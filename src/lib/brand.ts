export const BRAND_NAME = "WWHS? x NITH";
export const BRAND_TAGLINE = "The perfect group icon doesn't exi........";
export const ALLOWED_DOMAIN = "nith.ac.in";
export const SAMPLE_EMAIL = `you@${ALLOWED_DOMAIN}`;

export const ADMIN_EMAILS = [
  "25bph049@nith.ac.in",
  "25bph050@nith.ac.in",
  "25bph045@nith.ac.in",
  "25bph035@nith.ac.in",
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}
