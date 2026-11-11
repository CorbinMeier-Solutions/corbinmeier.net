import { useRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import { useDialogFocus } from "./useDialogFocus";

function Harness({ open }: { open: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(open, ref);
  return (
    <>
      <button>opener</button>
      {open && (
        <div ref={ref} tabIndex={-1} data-testid="dialog">
          <button>first</button>
          <button>last</button>
        </div>
      )}
    </>
  );
}

function Layered({ edges }: { edges: "start" | "end" | "hidden-input" | "iframe" | "aria" }) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(true, ref);
  return (
    <div ref={ref} tabIndex={-1} data-testid="dialog">
      {edges === "start" && <button className="gone">gone</button>}
      {edges === "aria" && (
        <div aria-hidden="true">
          <button>masked</button>
        </div>
      )}
      <button>first</button>
      {edges === "iframe" ? <iframe title="challenge" /> : <button>last</button>}
      {edges === "end" && <button className="gone">gone</button>}
      {edges === "hidden-input" && <input type="hidden" name="token" />}
    </div>
  );
}

// jsdom has no layout: stand in for the browser's visibility check, treating
// anything with the "gone" class as not rendered.
function stubVisibility() {
  HTMLElement.prototype.checkVisibility = function (this: HTMLElement) {
    return !this.classList.contains("gone");
  };
}

afterEach(() => {
  Reflect.deleteProperty(HTMLElement.prototype, "checkVisibility");
});

describe("useDialogFocus", () => {
  it("skips a not-rendered button at the start when wrapping Shift+Tab", () => {
    stubVisibility();
    render(<Layered edges="start" />);
    screen.getByText("first").focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(screen.getByText("last"));
  });

  it("skips a not-rendered button at the end when wrapping Tab", () => {
    stubVisibility();
    render(<Layered edges="end" />);
    screen.getByText("last").focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByText("first"));
  });

  it("ignores a hidden input at the end", () => {
    render(<Layered edges="hidden-input" />);
    screen.getByText("last").focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByText("first"));
  });

  it("skips controls inside an aria-hidden subtree", () => {
    render(<Layered edges="aria" />);
    screen.getByText("first").focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(screen.getByText("last"));
  });

  it("counts an iframe as the last control", () => {
    render(<Layered edges="iframe" />);
    screen.getByText("first").focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(screen.getByTitle("challenge"));
  });

  it("moves focus into the dialog on open", () => {
    const { rerender } = render(<Harness open={false} />);
    rerender(<Harness open={true} />);
    expect(document.activeElement).toBe(screen.getByTestId("dialog"));
  });

  it("wraps Tab from the last control to the first and Shift+Tab back", () => {
    render(<Harness open={true} />);
    screen.getByText("last").focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByText("first"));
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(screen.getByText("last"));
  });

  it("pulls focus back in when it has escaped the dialog", () => {
    render(<Harness open={true} />);
    screen.getByText("opener").focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByText("first"));
  });

  it("returns focus to the opener on close", () => {
    const { rerender } = render(<Harness open={false} />);
    screen.getByText("opener").focus();
    rerender(<Harness open={true} />);
    expect(document.activeElement).not.toBe(screen.getByText("opener"));
    rerender(<Harness open={false} />);
    expect(document.activeElement).toBe(screen.getByText("opener"));
  });
});
