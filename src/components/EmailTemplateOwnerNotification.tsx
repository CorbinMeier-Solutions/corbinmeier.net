import * as React from "react";

interface OwnerNotificationTemplateProps {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
}

// The owner's copy of a contact submission. Every value here is supplied by the
// visitor, so it goes through JSX rather than a string template: React escapes
// interpolated text, which keeps submitted markup from rendering as markup in
// the mail client.
export function EmailTemplateOwnerNotification({
  firstName,
  lastName,
  email,
  phone,
  subject,
  message,
}: OwnerNotificationTemplateProps) {
  const name = [firstName, lastName].filter(Boolean).join(" ");

  return (
    <div
      style={{
        fontFamily:
          'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        color: "#111827",
        lineHeight: 1.5,
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: 24,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 20 }}>New contact submission</h1>

        {subject && (
          <p style={{ marginTop: 12, color: "#374151" }}>
            <strong>Subject:</strong> {subject}
          </p>
        )}

        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: "#f9fafb",
            borderRadius: 6,
          }}
        >
          {name && (
            <p style={{ margin: 0, color: "#374151", fontSize: 14 }}>
              <strong>Name:</strong> {name}
            </p>
          )}
          <p style={{ marginTop: name ? 4 : 0, color: "#374151", fontSize: 14 }}>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${email}`} style={{ color: "#2563eb" }}>
              {email}
            </a>
          </p>
          {phone && (
            <p style={{ marginTop: 4, color: "#374151", fontSize: 14 }}>
              <strong>Phone:</strong> {phone}
            </p>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Message</strong>
          {/* pre-wrap keeps the visitor's own line breaks without turning any
              part of their text into markup. */}
          <p style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>
            {message || "(no message)"}
          </p>
        </div>

        <hr
          style={{
            marginTop: 20,
            border: "none",
            borderTop: "1px solid #e5e7eb",
          }}
        />
        <p style={{ marginTop: 12, color: "#9ca3af", fontSize: 12 }}>
          Sent from the contact form on corbinmeier.net. Reply directly to reach
          the sender.
        </p>
      </div>
    </div>
  );
}
