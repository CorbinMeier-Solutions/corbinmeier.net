// Visitor email shape. Stricter than "has an @ and a dot": also rejects a
// leading/trailing dot in either part and consecutive dots anywhere. Those
// shapes pass a looser check but the Email Sending API 400s on them at send time.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function hasBadDots(part: string): boolean {
  return part.startsWith(".") || part.endsWith(".") || part.includes("..");
}

export function isValidEmail(value: string): boolean {
  if (!EMAIL_SHAPE.test(value)) return false;
  const [local, domain] = value.split("@");
  return !hasBadDots(local) && !hasBadDots(domain);
}
