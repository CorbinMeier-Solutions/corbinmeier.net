/**
 * Site-wide ambient layer: faint accent-tinted scanlines under a dark
 * vignette, like a CRT terminal at night. Static CSS only (no blur, no
 * scroll animation), so it is safe on iOS Safari at any DPR.
 */
export default function ConsoleBackdrop() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 crt-scanlines" />
      <div className="absolute inset-0 crt-vignette" />
    </div>
  );
}
