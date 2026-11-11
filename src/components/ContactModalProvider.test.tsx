import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import ContactModalProvider from "@/components/ContactModalProvider";
import { useContactModal } from "@/components/ContactModalContext";

function Opener() {
  const { open } = useContactModal();
  return <button onClick={() => open()}>open contact</button>;
}

function mount() {
  render(
    <ContactModalProvider>
      <Opener />
    </ContactModalProvider>,
  );
  const opener = screen.getByText("open contact");
  opener.focus();
  fireEvent.click(opener);
  return opener;
}

describe("ContactModalProvider dialog", () => {
  beforeEach(() => {
    window.turnstile = undefined;
  });

  it("is a labelled modal dialog that takes focus", () => {
    mount();
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    const labelId = dialog.getAttribute("aria-labelledby") ?? "";
    expect(document.getElementById(labelId)?.tagName).toBe("H2");
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
