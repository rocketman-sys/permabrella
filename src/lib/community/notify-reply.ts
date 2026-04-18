import { sendNotificationEmail } from "@/lib/email";
import {
  getUserDisplayForEmail,
  listNotificationRecipients,
} from "@/lib/community/service";
import { threadPublicUrl } from "@/lib/community/url";

export async function notifyThreadSubscribersOfReply(opts: {
  threadId: string;
  topicSlug: string;
  threadTitle: string;
  replyAuthorId: string;
  replyBody: string;
}): Promise<void> {
  const author = await getUserDisplayForEmail(opts.replyAuthorId);
  const preview = opts.replyBody.trim().slice(0, 280);
  const url = threadPublicUrl(opts.topicSlug, opts.threadId);
  const recipients = await listNotificationRecipients(
    opts.threadId,
    opts.replyAuthorId
  );

  await Promise.allSettled(
    recipients.map((r) =>
      sendNotificationEmail({
        to: r.email,
        threadTitle: opts.threadTitle,
        replyAuthor: author,
        replyPreview: preview,
        threadUrl: url,
      })
    )
  );
}
