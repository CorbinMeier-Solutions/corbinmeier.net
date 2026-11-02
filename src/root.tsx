import { Links, Meta, Outlet, Scripts, isRouteErrorResponse, useRouteError } from "react-router";
import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import RootBoundary from "@/components/ErrorBoundary";
import RootFallback from "@/components/RootFallback";
import ConsoleBackdrop from "@/components/ConsoleBackdrop";
import ScrollToTop from "@/components/ScrollToTop";
import PersonJsonLd from "@/components/PersonJsonLd";
import ContactModalProvider from "@/components/ContactModalProvider";
import { CyberCodeStyles } from "@/components/cybercode/CyberCodeUIKit";
import { themeBootScript } from "@/lib/themeBootScript";
// Self-hosted so no visitor's browser has to contact a third-party font CDN
// before they have consented to anything. Variable faces, 100-900.
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./globals.css";

export function links() {
  return [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }];
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Meta />
        <Links />
        <PersonJsonLd />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <RootBoundary label="root" fallback={<RootFallback />}>
      <div className="antialiased font-sans">
        {/* "user" respects the OS prefers-reduced-motion setting for every
            framer-motion animation site-wide, the same signal Typewriter checks. */}
        <MotionConfig reducedMotion="user">
          <ContactModalProvider>
            <CyberCodeStyles />
            {/* Mounted once here, above the route outlet, so it survives
                client-side navigation instead of remounting per page (#31). */}
            <ConsoleBackdrop />
            <ScrollToTop />
            <Outlet />
            {/* No analytics component by design: Cloudflare Web Analytics is
                enabled on the Pages project and injects its own beacon. */}
          </ContactModalProvider>
        </MotionConfig>
      </div>
    </RootBoundary>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : error);
  return <RootFallback />;
}
