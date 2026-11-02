import { isValidEmail } from "./validation";

export interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export type ParsedContact =
  | { ok: true; form: ContactForm }
  | { ok: false; error: string };

const FIELDS = ["firstName", "lastName", "email", "phone", "subject", "message"] as const;
export const MISSING_FIELDS_ERROR = "Please enter your first name, email and subject.";
const HEADER_BREAK = /[\r\n]/;

/** Reads one submitted field as a trimmed string; anything else becomes "". */
function field(raw: Record<string, unknown>, key: string): string {
  const value = raw[key];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Parses the untrusted request body once. CR or LF in any field is refused
 * outright (header injection) before a value can reach `subject` or `replyTo`.
 */
export function parseContactForm(raw: unknown): ParsedContact {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: MISSING_FIELDS_ERROR };
  }
  const record = raw as Record<string, unknown>;
  const form = Object.fromEntries(FIELDS.map((key) => [key, field(record, key)])) as unknown as ContactForm;

  // The message body may span lines; every other field is a single line.
  for (const key of FIELDS) {
    if (key !== "message" && HEADER_BREAK.test(form[key])) {
      return { ok: false, error: "Please remove line breaks from your details." };
    }
  }
  if (!form.firstName || !form.email || !form.subject) {
    return { ok: false, error: MISSING_FIELDS_ERROR };
  }
  if (!isValidEmail(form.email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  return { ok: true, form };
}

/** `"First Last" <email>`, display name quoted with inner quotes replaced. */
export function buildReplyTo(form: ContactForm): string {
  const name = [form.firstName, form.lastName].filter(Boolean).join(" ").replace(/["\\]/g, "'");
  return name ? `"${name}" <${form.email}>` : form.email;
}
