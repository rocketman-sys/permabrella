import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

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

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject: `New reply in: ${threadTitle}`,
    html: `
      <p><strong>${replyAuthor}</strong> replied to <strong>${threadTitle}</strong>:</p>
      <blockquote>${replyPreview}</blockquote>
      <p><a href="${threadUrl}">View the full thread</a></p>
      <p style="color: #666; font-size: 12px;">
        You're receiving this because you're subscribed to this thread on Permabrella.
      </p>
    `,
  });
}
