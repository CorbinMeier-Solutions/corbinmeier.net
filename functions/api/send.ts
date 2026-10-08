import React from "react";
import { render } from "@react-email/render";
import { EmailTemplate } from "../../src/components/EmailTemplateContactConfirmation";
import { EmailTemplateOwnerNotification } from "../../src/components/EmailTemplateOwnerNotification";
import { EmailSendError, isValidEmail, parseRecipients, sendEmail } from "../src/services/mail";

interface CloudflareEnv {
  CLOUDFLARE_EMAIL_API_TOKEN: string;
  CLOUDFLARE_ACCOUNT_ID: string;
  MAIL_FROM: string;
  FORM_TO_ADDRESSES: string;
  TURNSTILE_SECRET: string;
}

interface ContactRequestBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  turnstileToken?: string;
}

function logSendError(what: string, error: unknown): void {
  if (error instanceof EmailSendError) {
    console.error(
      `Email Sending failed for ${what} (status ${error.status}, retryable=${error.retryable}): ${error.detail}`
    );
  } else {
    console.error(`Sending ${what} failed:`, error);
  }
}

export const onRequestPost: PagesFunction<CloudflareEnv> = async (context) => {
  const { request, env } = context;

  if (!env.CLOUDFLARE_EMAIL_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID || !env.MAIL_FROM) {
    console.error(
      "CLOUDFLARE_EMAIL_API_TOKEN, CLOUDFLARE_ACCOUNT_ID or MAIL_FROM is not defined in the environment."
    );
    return new Response(
      JSON.stringify({ error: "Email service is not configured." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Refuse rather than skip. Gating verification on the secret's own presence
  // meant an absent or renamed binding silently turned the bot check off while
  // the form carried on accepting submissions.
  if (!env.TURNSTILE_SECRET) {
    console.error("TURNSTILE_SECRET is not defined in the environment.");
    return new Response(
      JSON.stringify({ error: "The contact form is unavailable right now." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body = (await request.json()) as ContactRequestBody;
    const { turnstileToken } = body;

    // Validation runs before Turnstile is spent: a malformed address would be
    // rejected by the Email Sending API at send time (10202) anyway.
    // Basic validation
    if (!body.firstName || !body.email || !body.subject) {
      return new Response(
        JSON.stringify({ error: "Please provide firstName, email and subject." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!isValidEmail(body.email.trim())) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid email address." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const visitorEmail = body.email.trim();

    // Turnstile verification
    if (!turnstileToken) {
      return new Response(
        JSON.stringify({ error: "Security check token missing." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const formData = new FormData();
    formData.append("secret", env.TURNSTILE_SECRET);
    formData.append("response", turnstileToken);
    const ip = request.headers.get("CF-Connecting-IP");
    if (ip) formData.append("remoteip", ip);

    const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
    const result = await fetch(url, {
      body: formData,
      method: "POST",
    });

    const outcome = (await result.json()) as { success: boolean };
    if (!outcome.success) {
      return new Response(
        JSON.stringify({ error: "Security check failed. Please try again." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Render email template
    const emailHtml = await render(
      React.createElement(EmailTemplate, {
        firstName: body.firstName || "",
        lastName: body.lastName || "",
        phone: body.phone || undefined,
        subject: body.subject || "",
        messagePreview: body.message || undefined,
      })
    );

    // Confirmation email text fallback
    const textContent = `Thanks for contacting me, ${
      [body.firstName, body.lastName].filter(Boolean).join(" ") || ""
    }.
    
${body.subject ? `Subject: ${body.subject}\n\n` : ""}I appreciate you reaching out. This is a confirmation that I received your message - I will review it and get back to you as soon as possible.

${body.message ? `Message preview:\n${body.message}\n\n` : ""}- Corbin`;

    // FORM_TO_ADDRESSES is comma-separated by contract.
    const recipients = parseRecipients(env.FORM_TO_ADDRESSES || "");
    if (recipients.length === 0) {
      console.error("FORM_TO_ADDRESSES is not defined in the environment.");
    }

    // Both parts, from the same fields: a text-only client renders nothing from
    // an HTML-only send, and an HTML-only send scores worse with spam filters.
    const ownerHtml = await render(
      React.createElement(EmailTemplateOwnerNotification, {
        firstName: body.firstName || undefined,
        lastName: body.lastName || undefined,
        email: body.email || "",
        phone: body.phone || undefined,
        subject: body.subject || undefined,
        message: body.message || undefined,
      })
    );

    const ownerText = `New contact submission:\n\nName: ${body.firstName || ""} ${
      body.lastName || ""
    }\nEmail: ${body.email}\nPhone: ${body.phone || ""}\nSubject: ${
      body.subject || ""
    }\n\nMessage:\n${body.message || "(no message)"}`;

    const fullName = [body.firstName, body.lastName].filter(Boolean).join(" ");

    // One send per recipient, not one send carrying every recipient: a single
    // bad address cannot block the others. Success is "at least one delivered".
    let ownerDelivered = false;
    for (const recipient of recipients) {
      try {
        const result = await sendEmail(env, {
          to: recipient,
          from: env.MAIL_FROM,
          reply_to: { address: visitorEmail, name: fullName || undefined },
          subject: `New contact: ${body.subject}`,
          html: ownerHtml,
          text: ownerText,
        });
        if (result.permanent_bounces.length > 0) {
          console.error(`Permanent bounce sending the contact notification to ${recipient}`);
        } else {
          ownerDelivered = true;
        }
      } catch (error) {
        logSendError(`contact notification to ${recipient}`, error);
      }
    }

    if (!ownerDelivered) {
      return new Response(
        JSON.stringify({ error: "We couldn't send your message just now. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // The visitor's confirmation is a courtesy: the enquiry already reached
    // the owner, so a failure here is logged, not shown.
    try {
      const result = await sendEmail(env, {
        to: visitorEmail,
        from: env.MAIL_FROM,
        reply_to: recipients[0],
        subject: "Contact Confirmation",
        html: emailHtml,
        text: textContent,
      });
      if (result.permanent_bounces.length > 0) {
        console.error(`Permanent bounce sending the confirmation to ${visitorEmail}`);
      }
    } catch (error) {
      logSendError("visitor confirmation", error);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
