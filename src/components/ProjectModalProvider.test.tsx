import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ProjectModalProvider from "@/components/ProjectModalProvider";
import { useProjectModal } from "@/components/ProjectModalContext";
import type { Project } from "@/components/ProjectCard";

const project: Project = {
  title: "Sample Site",
  slug: "sample-site",
  year: 2026,
  images: [{ src: "/a.png" }, { src: "/b.png" }],
};
const other: Project = { title: "Other Site", slug: "other-site", year: 2026 };

function Opener() {
  const { open } = useProjectModal();
  return <button onClick={() => open(project, [project, other])}>open project</button>;
}

// jsdom has no layout or Tailwind: treat anything under a `hidden` class as not
// rendered, like the mobile layout hides the desktop-only Previous/Next buttons.
beforeEach(() => {
  HTMLElement.prototype.checkVisibility = function (this: HTMLElement) {
    return !this.closest(".hidden");
  };
});

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, "checkVisibility");
});

function reachableControls(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>("button, a[href]")).filter(
    (el) => !el.closest(".hidden"),
  );
}

function mount() {
  render(
    <ProjectModalProvider>
      <Opener />
    </ProjectModalProvider>,
  );
  const opener = screen.getByText("open project");
  opener.focus();
  fireEvent.click(opener);
  return opener;
}

describe("ProjectModalProvider dialog", () => {
  it("is a modal dialog named by the project title", () => {
    mount();
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    const labelId = dialog.getAttribute("aria-labelledby") ?? "";
    expect(document.getElementById(labelId)?.textContent).toBe("Sample Site");
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("closes on Escape and returns focus to the opener", async () => {
    const opener = mount();
    fireEvent.keyDown(window, { key: "Escape" });
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("wraps Tab from the last control and Shift+Tab from the first, skipping hidden ones", () => {
    mount();
    const controls = reachableControls(screen.getByRole("dialog"));
    const first = controls[0];
    const last = controls[controls.length - 1];
    expect(screen.getByLabelText("Previous project").closest(".hidden")).not.toBeNull();
    first.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);
  });

  it("moves focus into the fullscreen view, traps Tab there, and returns it on Escape", async () => {
    mount();
    const expand = screen.getByLabelText("View full screen");
    expand.focus();
    fireEvent.click(expand);
    const views = screen.getAllByRole("dialog");
    const fullscreen = views[views.length - 1];
    const controls = reachableControls(fullscreen);
    expect(document.activeElement).toBe(screen.getByLabelText("Close full screen"));
    controls[controls.length - 1].focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(controls[0]);
    fireEvent.keyDown(window, { key: "Escape" });
    // Focus comes back as soon as fullscreen closes, before its exit animation ends.
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText("View full screen")));
  });
});
