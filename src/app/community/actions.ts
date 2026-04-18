"use server";

import { auth } from "@/lib/auth";
import { notifyThreadSubscribersOfReply } from "@/lib/community/notify-reply";
import {
  createReply,
  createThread,
  getThreadInTopic,
  getTopicBySlug,
  setUserSubscription,
} from "@/lib/community/service";
import { parseRegionParam } from "@/lib/regions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type CommunityFormState = { error?: string; ok?: boolean } | null;

export async function createThreadAction(
  _prev: CommunityFormState,
  formData: FormData
): Promise<CommunityFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to start a thread." };
  }

  const topicSlug = String(formData.get("topicSlug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const regionRaw = String(formData.get("region") ?? "").trim();

  const topic = await getTopicBySlug(topicSlug);
  if (!topic) return { error: "Invalid topic." };
  if (!title || !body) return { error: "Title and body are required." };

  const region = regionRaw ? parseRegionParam(regionRaw) : undefined;
  if (regionRaw && !region) return { error: "Invalid region." };

  const id = await createThread({
    authorId: session.user.id,
    topicId: topic.id,
    title,
    body,
    region: region ?? null,
  });

  revalidatePath("/community");
  revalidatePath(`/community/${topicSlug}`);
  revalidatePath("/");
  redirect(`/community/${topicSlug}/${id}`);
}

export async function replyToThreadAction(
  _prev: CommunityFormState,
  formData: FormData
): Promise<CommunityFormState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in to reply." };
  }

  const threadId = String(formData.get("threadId") ?? "").trim();
  const topicSlug = String(formData.get("topicSlug") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!threadId || !topicSlug || !body) {
    return { error: "Write a message before posting." };
  }

  const detail = await getThreadInTopic(threadId, topicSlug);
  if (!detail) return { error: "Thread not found." };

  const result = await createReply({
    authorId: session.user.id,
    threadId,
    body,
  });

  if ("error" in result && result.error === "locked") {
    return { error: "This thread is locked." };
  }

  await notifyThreadSubscribersOfReply({
    threadId,
    topicSlug,
    threadTitle: detail.thread.title,
    replyAuthorId: session.user.id,
    replyBody: body,
  });

  revalidatePath(`/community/${topicSlug}/${threadId}`);
  revalidatePath(`/community/${topicSlug}`);
  revalidatePath("/");
  return { ok: true };
}

export async function subscriptionFormAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const threadId = String(formData.get("threadId") ?? "").trim();
  const topicSlug = String(formData.get("topicSlug") ?? "").trim();
  const subscribe = String(formData.get("subscribe") ?? "") === "true";

  if (!threadId || !topicSlug) return;

  await setUserSubscription(session.user.id, threadId, subscribe);
  revalidatePath(`/community/${topicSlug}/${threadId}`);
}
