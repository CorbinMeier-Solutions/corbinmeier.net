import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProjectModalProvider from "@/components/ProjectModalProvider";
import { useProjectModal } from "@/components/ProjectModalContext";
import type { Project } from "@/components/ProjectCard";

const project: Project = { title: "Sample Site", slug: "sample-site", year: 2026 };

function Opener() {
  const { open } = useProjectModal();
  return <button onClick={() => open(project)}>open project</button>;
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
});
