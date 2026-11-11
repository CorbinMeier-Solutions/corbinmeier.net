import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CyberCodeTerminalWindow, CyberCodeWindowChrome } from "./CyberCodeUIKit";

describe("CyberCodeWindowChrome dots", () => {
  it("names the real action on each dot and runs it", () => {
    const run = vi.fn();
    render(<CyberCodeWindowChrome title="x.sh" dotAction={{ label: "Close dialog", run }} />);
    const dots = screen.getAllByRole("button", { name: "Close dialog" });
    expect(dots).toHaveLength(3);
    fireEvent.click(dots[0]);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("renders decorative, unfocusable dots when they do nothing", () => {
    const { container } = render(<CyberCodeWindowChrome title="x.sh" />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    const dots = container.querySelectorAll("span[aria-hidden='true']");
    expect(dots).toHaveLength(3);
  });

  it("renders no dots when hidden", () => {
    const { container } = render(<CyberCodeWindowChrome title="x.sh" showDots={false} />);
    expect(container.querySelectorAll("span[aria-hidden='true']")).toHaveLength(0);
  });
});

describe("CyberCodeTerminalWindow dots", () => {
  it("collapsible windows label the dots with the next state", () => {
    render(
      <CyberCodeTerminalWindow title="a.jpg" collapsible>
        body
      </CyberCodeTerminalWindow>,
    );
    fireEvent.click(screen.getAllByRole("button", { name: "Collapse window" })[0]);
    expect(screen.getAllByRole("button", { name: "Expand window" })).toHaveLength(3);
  });

  it("non-collapsible windows without an action have decorative dots", () => {
    render(<CyberCodeTerminalWindow title="a.sh">body</CyberCodeTerminalWindow>);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
