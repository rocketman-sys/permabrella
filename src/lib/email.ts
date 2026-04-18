import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendNotificationEmail({
  to,
  threadTitle,
  replyAuthor,
  replyPreview,
  threadUrl,
}: {
  to: string;
  threadTitle: string;
  replyAuthor: string;
  replyPreview: string;
  threadUrl: string;
}) {
  if (!resend || !process.env.EMAIL_FROM) {
    console.warn(
      "Resend not configured (RESEND_API_KEY / EMAIL_FROM); skipping email."
    );
    return;
  }

  const safeTitle = escapeHtml(threadTitle);
  const safeAuthor = escapeHtml(replyAuthor);
  const safePreview = escapeHtml(replyPreview);
  const safeUrl = escapeHtml(threadUrl);

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: `New reply in: ${threadTitle}`,
    html: `
      <p><strong>${safeAuthor}</strong> replied to <strong>${safeTitle}</strong>:</p>
      <blockquote>${safePreview}</blockquote>
      <p><a href="${safeUrl}">View the full thread</a></p>
      <p style="color: #666; font-size: 12px;">
        You're receiving this because you're subscribed to this thread on PermaBrella.
      </p>
    `,
  });
}
