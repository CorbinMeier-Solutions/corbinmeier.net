import React from "react";
import { render } from "@react-email/render";
import { EmailTemplate } from "../../src/components/EmailTemplateContactConfirmation";
import { Resend } from "resend";

interface CloudflareEnv {
  RESEND_API_KEY: string;
  PERSONAL_EMAIL: string;
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

export const onRequestPost: PagesFunction<CloudflareEnv> = async (context) => {
  const { request, env } = context;

  if (!env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not defined in the environment.");
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

    const resend = new Resend(env.RESEND_API_KEY);

    // Basic validation
    if (!body.firstName || !body.email || !body.subject) {
      return new Response(
        JSON.stringify({ error: "Please provide firstName, email and subject." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
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

    // Send confirmation email to the visitor
    const confirmationPromise = resend.emails.send({
      from: "Corbin Meier <contact@corbinmeier.net>",
      to: [body.email],
      subject: "Contact Confirmation",
      html: emailHtml,
      text: textContent,
      headers: {
        "List-Unsubscribe": "<mailto:contact@corbinmeier.net?subject=unsubscribe>",
      },
    });

    // Send notification to site owner
    if (!env.PERSONAL_EMAIL) {
      console.error("PERSONAL_EMAIL is not defined in the environment.");
    }

    const ownerNotificationPromise = resend.emails.send({
      from: "corbinmeier.net <contact@corbinmeier.net>",
      to: [env.PERSONAL_EMAIL || "contact@corbinmeier.net"], // Fallback to avoid crash if missing
      subject: `New contact: ${body.subject}`,
      text: `New contact submission:\n\nName: ${body.firstName || ""} ${
        body.lastName || ""
      }\nEmail: ${body.email}\nPhone: ${body.phone || ""}\nSubject: ${
        body.subject || ""
      }\n\nMessage:\n${body.message || "(no message)"}`,
    });

    const [confRes, ownerRes] = await Promise.all([
      confirmationPromise,
      ownerNotificationPromise,
    ]);

    if (confRes.error || ownerRes.error) {
      console.error("Email sending failed:", {
        confirmation: confRes.error,
        owner: ownerRes.error,
      });
      return new Response(
        JSON.stringify({ 
          error: "Failed to send one or more emails.",
          details: {
            visitor: confRes.error ? "Failed" : "Sent",
            owner: ownerRes.error ? "Failed" : "Sent"
          }
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
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
