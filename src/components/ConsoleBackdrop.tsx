import ParticleField from "@/components/ParticleField";

/**
 * Site-wide ambient layer, back to front: body background (Void Navy, from
 * globals.css) -> ambient particle/light field, tinted with the live page
 * accent -> faint scanlines -> dark edge vignette, like a CRT terminal at
 * night. The scanlines/vignette are static CSS only (no blur, no scroll
 * animation); the particle field is canvas + rAF but stays safe on iOS
 * Safari at any DPR (see ParticleField.tsx).
 */
export default function ConsoleBackdrop() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <ParticleField />
      <div className="absolute inset-0 crt-scanlines" />
      <div className="absolute inset-0 crt-vignette" />
    </div>
  );
}
