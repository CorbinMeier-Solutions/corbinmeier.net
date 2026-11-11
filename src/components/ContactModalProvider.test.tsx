import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
    // jsdom has no layout: stand in for the browser's visibility check.
    HTMLElement.prototype.checkVisibility = function (this: HTMLElement) {
      return !this.closest(".hidden");
    };
  });

  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, "checkVisibility");
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

  it("wraps Tab and Shift+Tab at the visible ends, ignoring the hidden Turnstile token", () => {
    mount();
    const dialog = screen.getByRole("dialog");
    const token = document.createElement("input");
    token.type = "hidden";
    token.name = "cf-turnstile-response";
    dialog.appendChild(token);
    const controls = Array.from(
      dialog.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([type=hidden]), textarea, a[href]"),
    ).filter((el) => !el.closest(".hidden"));
    const first = controls[0];
    const last = controls[controls.length - 1];
    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });
});
