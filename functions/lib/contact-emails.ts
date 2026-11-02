import React from "react";
import { render } from "@react-email/render";
import { EmailTemplate } from "../../src/components/EmailTemplateContactConfirmation";
import { EmailTemplateOwnerNotification } from "../../src/components/EmailTemplateOwnerNotification";
import type { ContactForm } from "./contact-form";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/** Both emails: HTML and text from the same fields, one renderer. */
export async function renderOwnerEmail(form: ContactForm): Promise<RenderedEmail> {
  const html = await render(
    React.createElement(EmailTemplateOwnerNotification, {
      firstName: form.firstName || undefined,
      lastName: form.lastName || undefined,
      email: form.email,
      phone: form.phone || undefined,
      subject: form.subject,
      message: form.message || undefined,
    })
  );
  const text = `New contact submission:\n\nName: ${form.firstName} ${form.lastName}\nEmail: ${form.email}\nPhone: ${form.phone}\nSubject: ${form.subject}\n\nMessage:\n${form.message || "(no message)"}`;
  return { subject: `New contact: ${form.subject}`, html, text };
}

export async function renderConfirmationEmail(form: ContactForm): Promise<RenderedEmail> {
  const html = await render(
    React.createElement(EmailTemplate, {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone || undefined,
      subject: form.subject,
      messagePreview: form.message || undefined,
    })
  );
  const name = [form.firstName, form.lastName].filter(Boolean).join(" ");
  const text = `Thanks for contacting me, ${name}.

Subject: ${form.subject}

I appreciate you reaching out. This is a confirmation that I received your message - I will review it and get back to you as soon as possible.

${form.message ? `Message preview:\n${form.message}\n\n` : ""}- Corbin`;
  return { subject: "Contact Confirmation", html, text };
}
