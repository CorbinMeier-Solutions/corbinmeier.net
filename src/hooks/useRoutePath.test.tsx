import { describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { act } from "react";
import { MemoryRouter, StaticRouter } from "react-router";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { normalizePathname } from "./useRoutePath";

describe("normalizePathname", () => {
  it("drops trailing slashes but keeps the root", () => {
    expect(normalizePathname("/about/")).toBe("/about");
    expect(normalizePathname("/about")).toBe("/about");
    expect(normalizePathname("/")).toBe("/");
  });
});

describe("prerender path vs browser path", () => {
  it.each(["/about", "/projects", "/workshop", "/faq", "/pricing"])(
    "hydrates the nav for %s without a mismatch",
    async (path) => {
      const tree = (router: "static" | "memory") => {
        const nav = (
          <>
            <Header />
            <Sidebar />
          </>
        );
        return router === "static" ? (
          <StaticRouter location={`${path}/`}>{nav}</StaticRouter>
        ) : (
          <MemoryRouter initialEntries={[path]}>{nav}</MemoryRouter>
        );
      };
      const container = document.createElement("div");
      container.innerHTML = renderToString(tree("static"));
      document.body.appendChild(container);
      const onRecoverableError = vi.fn();
      const errors = vi.spyOn(console, "error").mockImplementation(() => {});
      await act(async () => {
        hydrateRoot(container, tree("memory"), { onRecoverableError });
      });
      expect(onRecoverableError).not.toHaveBeenCalled();
      expect(errors).not.toHaveBeenCalled();
      errors.mockRestore();
      container.remove();
    }
  );
});
