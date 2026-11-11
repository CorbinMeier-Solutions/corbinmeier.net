import { useRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
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

describe("useDialogFocus", () => {
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
