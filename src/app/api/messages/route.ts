import { auth } from "@/lib/auth";
import { notifyThreadSubscribersOfReply } from "@/lib/community/notify-reply";
import {
  createReply,
  getThreadInTopic,
  listMessagesForThread,
} from "@/lib/community/service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get("threadId");
  const topicSlug = searchParams.get("topicSlug");

  if (!threadId || !topicSlug) {
    return NextResponse.json(
      { error: "threadId and topicSlug are required" },
      { status: 400 }
    );
  }

  const detail = await getThreadInTopic(threadId, topicSlug);
  if (!detail) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const messages = await listMessagesForThread(threadId);

  return NextResponse.json({
    messages: messages.map(({ message, authorDisplay }) => ({
      id: message.id,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      authorDisplay,
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const threadId = typeof b.threadId === "string" ? b.threadId.trim() : "";
  const topicSlug = typeof b.topicSlug === "string" ? b.topicSlug.trim() : "";
  const textBody = typeof b.body === "string" ? b.body.trim() : "";

  if (!threadId || !topicSlug || !textBody) {
    return NextResponse.json(
      { error: "threadId, topicSlug, and body are required" },
      { status: 400 }
    );
  }

  const detail = await getThreadInTopic(threadId, topicSlug);
  if (!detail) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const result = await createReply({
    authorId: session.user.id,
    threadId,
    body: textBody,
  });

  if ("error" in result) {
    return NextResponse.json({ error: "Thread is locked" }, { status: 403 });
  }

  await notifyThreadSubscribersOfReply({
    threadId,
    topicSlug,
    threadTitle: detail.thread.title,
    replyAuthorId: session.user.id,
    replyBody: textBody,
  });

  return NextResponse.json({ id: result.id }, { status: 201 });
}
