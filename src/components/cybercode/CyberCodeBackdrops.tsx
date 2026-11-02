import { useEffect, useRef } from "react";

/**
 * Full-viewport decorative backdrops for the CyberCode UI Kit: a matrix-rain
 * canvas, a linked-particle field, and a custom cursor. Each is self-managed
 * (mounts its own canvas, cleans up its own listeners/rAF loop) and safe to
 * drop anywhere in the tree - position with the `className` prop (defaults
 * assume a `fixed inset-0` layer behind page content).
 */

/** Falling-character rain, canvas-based. Respects prefers-reduced-motion by rendering nothing. */
export function CyberCodeMatrixRain({
  color = "#3b82f6",
  fontSize = 14,
  fps = 18,
  className = "pointer-events-none fixed inset-0 z-0 opacity-10",
}: {
  color?: string;
  fontSize?: number;
  fps?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const characters = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@";
    let columns = 0;
    let drops: number[] = [];
    let animationId = 0;
    let lastFrame = 0;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * canvas.height);
    };

    const draw = () => {
      context.fillStyle = "rgba(10, 10, 10, 0.08)";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = color;
      context.font = `${fontSize}px "Fira Code", monospace`;

      drops.forEach((drop, index) => {
        const char = characters[Math.floor(Math.random() * characters.length)];
        context.fillText(char, index * fontSize, drop * fontSize);
        if (drop * fontSize > canvas.height && Math.random() > 0.975) {
          drops[index] = 0;
        } else {
          drops[index] += 1;
        }
      });
    };

    const loop = (timestamp: number) => {
      const interval = fps > 0 ? 1000 / fps : Infinity;
      if (timestamp - lastFrame >= interval) {
        lastFrame = timestamp;
        draw();
      }
      animationId = window.requestAnimationFrame(loop);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    animationId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, [color, fontSize, fps]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}

/** Drifting dot field that draws connecting lines near the cursor. */
export function CyberCodeParticleField({
  count = 40,
  color = "59,130,246",
  linkRadius = 120,
  className = "pointer-events-none fixed inset-0 z-[1]",
}: {
  count?: number;
  color?: string;
  linkRadius?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    type Particle = { x: number; y: number; vx: number; vy: number; radius: number };
    let particles: Particle[] = [];
    let animationId = 0;
    let mouseX = 0;
    let mouseY = 0;
    let mouseKnown = false;

    const onMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      mouseKnown = true;
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
      }));
    };

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(${color}, 0.55)`;
        context.fill();
      });

      if (mouseKnown) {
        const near = particles.filter((p) => Math.hypot(p.x - mouseX, p.y - mouseY) < 150);
        for (let i = 0; i < near.length; i += 1) {
          for (let j = i + 1; j < near.length; j += 1) {
            const distance = Math.hypot(near[i].x - near[j].x, near[i].y - near[j].y);
            if (distance < linkRadius) {
              context.beginPath();
              context.moveTo(near[i].x, near[i].y);
              context.lineTo(near[j].x, near[j].y);
              context.strokeStyle = `rgba(${color}, ${1 - distance / linkRadius})`;
              context.lineWidth = 0.5;
              context.stroke();
            }
          }
        }
      }

      animationId = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    animationId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [count, color, linkRadius]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}

/** Ring + soft trailing dot that follow the pointer, replacing the OS cursor. Hidden on touch/coarse pointers. */
export function CyberCodeCustomCursor({
  color = "#3b82f6",
  className = "hidden tablet:block",
}: {
  color?: string;
  className?: string;
}) {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMouseMove = (event: MouseEvent) => {
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${event.clientX - 6}px, ${event.clientY - 6}px)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${event.clientX - 15}px, ${event.clientY - 15}px)`;
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <div className={className} aria-hidden="true">
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[10000] h-3 w-3 rounded-full border-2 mix-blend-difference"
        style={{ borderColor: color }}
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-7.5 w-7.5 rounded-full"
        style={{ backgroundColor: `${color}1a` }}
      />
    </div>
  );
}

/** CSS-only decorative strip of floating code snippets (no canvas) for hero/panel backgrounds. */
export function CyberCodeFloatingSnippets({
  lines,
  className = "pointer-events-none absolute -inset-x-[8%] -inset-y-[20%] z-0 flex flex-col gap-4.5 rotate-[-12deg] opacity-80",
}: {
  lines: string[];
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={className}>
      {lines.map((line, index) => (
        <span
          key={index}
          className="w-max whitespace-pre rounded-full border border-[#00ff8820] bg-[#00ff880c] px-3.5 py-2 font-mono text-xs text-[#7ee78780] [animation:cc-code-drift_9s_linear_infinite]"
          style={{ animationDelay: `${(index % 5) * 1.2}s`, alignSelf: index % 2 === 0 ? "flex-start" : "flex-end" }}
        >
          {line}
        </span>
      ))}
    </div>
  );
}
