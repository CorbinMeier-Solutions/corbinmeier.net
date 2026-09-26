import { render } from "@react-email/render";
import { describe, it, expect } from "vitest";
import { EmailTemplateOwnerNotification } from "./EmailTemplateOwnerNotification";

const renderOwnerEmail = (
  props: Parameters<typeof EmailTemplateOwnerNotification>[0]
) => render(<EmailTemplateOwnerNotification {...props} />);

describe("EmailTemplateOwnerNotification", () => {
  it("carries the submission fields the owner needs to act on", async () => {
    const html = await renderOwnerEmail({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phone: "555-0101",
      subject: "New site",
      message: "Please call me back.",
    });

    expect(html).toContain("Ada Lovelace");
    expect(html).toContain("ada@example.com");
    expect(html).toContain("555-0101");
    expect(html).toContain("New site");
    expect(html).toContain("Please call me back.");
    // The address is actionable, not just printed.
    expect(html).toContain("mailto:ada@example.com");
  });

  it("escapes submitted markup instead of rendering it", async () => {
    // Every field here is attacker-controlled in production. A string template
    // would paste these straight into the document the mail client opens.
    const html = await renderOwnerEmail({
      firstName: "<script>alert(1)</script>",
      email: "evil@example.com",
      message: '<a href="https://phish.example">Click here</a>',
    });

    expect(html).not.toContain("<script>");
    expect(html).not.toContain('<a href="https://phish.example"');
    expect(html).toContain("&lt;script&gt;");
  });

  it("still renders when the optional fields are absent", async () => {
    const html = await renderOwnerEmail({ email: "someone@example.com" });

    expect(html).toContain("someone@example.com");
    expect(html).toContain("(no message)");
  });
});
