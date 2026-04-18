import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import ThreadView from "@/components/community/ThreadView";
import {
  getThreadInTopic,
  listMessagesForThread,
} from "@/lib/community/service";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ topicSlug: string; threadId: string }>;
}) {
  const { topicSlug, threadId } = await params;
  const detail = await getThreadInTopic(threadId, topicSlug);
  if (!detail) notFound();

  const messages = await listMessagesForThread(threadId);
  const session = await auth();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <ThreadView
        detail={detail}
        messages={messages}
        topicSlug={topicSlug}
        canReply={!!session?.user}
      />
    </div>
  );
}
