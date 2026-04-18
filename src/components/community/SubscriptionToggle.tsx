import Link from "next/link";
import { auth } from "@/lib/auth";
import { isUserSubscribed } from "@/lib/community/service";
import { threadPublicPath } from "@/lib/community/url";
import { subscriptionFormAction } from "@/app/community/actions";
import { Button } from "@/components/ui/Button";

export async function SubscriptionToggle({
  threadId,
  topicSlug,
}: {
  threadId: string;
  topicSlug: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    const back = threadPublicPath(topicSlug, threadId);
    return (
      <p className="text-sm text-[var(--perm-muted)]">
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(back)}`}
          className="text-[var(--perm-secondary)] hover:underline"
        >
          Sign in
        </Link>{" "}
        to get email updates on this thread.
      </p>
    );
  }

  const subscribed = await isUserSubscribed(session.user.id, threadId);

  return (
    <form action={subscriptionFormAction} className="inline">
      <input type="hidden" name="threadId" value={threadId} />
      <input type="hidden" name="topicSlug" value={topicSlug} />
      <input type="hidden" name="subscribe" value={subscribed ? "false" : "true"} />
      <Button type="submit" variant="ghost" className="!text-sm">
        {subscribed ? "Unsubscribe from replies" : "Email me new replies"}
      </Button>
    </form>
  );
}
