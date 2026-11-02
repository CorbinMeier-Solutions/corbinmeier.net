import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContactModalProvider from "@/components/ContactModalProvider";
import ContactRedirect from "@/pages/ContactRedirect";

// A navigation that stays pending (lazy route, hydration) keeps ContactRedirect
// mounted; the redirect must still run once, not once per provider render.
const navigate = vi.fn();
vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => navigate,
}));
vi.mock("@/pages/Home", () => ({ default: () => null }));

function mount(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <ContactModalProvider>
        <ContactRedirect />
      </ContactModalProvider>
    </MemoryRouter>,
  );
}

describe("ContactRedirect", () => {
  beforeEach(() => {
    navigate.mockClear();
    window.turnstile = undefined;
  });

  it.each(["/contact", "/contact?subject=Hello"])("opens the modal once for %s without a loop", async (url) => {
    mount(url);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("stays bounded when the Turnstile script fails to load", async () => {
    mount("/contact");
    document.querySelectorAll("script").forEach((script) => script.dispatchEvent(new Event("error")));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(navigate).toHaveBeenCalledTimes(1);
  });
});
