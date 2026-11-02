import React, { useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface LazyImageProps extends Omit<HTMLMotionProps<"img">, "onLoad" | "onError"> {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackIcon?: React.ReactNode;
  priority?: boolean;
}

export default function LazyImage({
  src,
  alt,
  className = "",
  imgClassName = "w-full h-full object-cover",
  fallbackIcon,
  priority = false,
  ...props
}: LazyImageProps) {
  // Track which src finished loading/failed rather than a bare boolean, so a new
  // src (e.g. inside a modal carousel) resets the state by derivation, not an effect.
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [errorSrc, setErrorSrc] = useState<string | null>(null);

  const isLoaded = loadedSrc === src;
  const error = errorSrc === src;

  // An image can finish (or fail) before hydration attaches onLoad/onError, so
  // settle from the element's own state when it mounts.
  const settleIfDone = (img: HTMLImageElement | null) => {
    if (!img || !img.complete) return;
    if (img.naturalWidth > 0) setLoadedSrc(src);
    else setErrorSrc(src);
  };

  return (
    <div
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
    >
      {/* Cyberpunk Spinner - shows while loading */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/5 z-10">
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
            <div className="absolute w-8 h-8 rounded-full border border-accent/40 animate-ping opacity-40 scale-75" />
          </div>
        </div>
      )}

      {/* Fallback Icon on Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 text-muted-foreground/50">
          {fallbackIcon || (
            <svg
              className="w-8 h-8 opacity-40 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>
      )}

      {/* Real img in the server render; the browser lazy-loads it natively */}
      <motion.img
        ref={settleIfDone}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoadedSrc(src)}
        onError={() => setErrorSrc(src)}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={imgClassName}
        {...props}
      />
    </div>
  );
}
