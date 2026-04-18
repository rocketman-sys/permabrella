import { auth } from "@/lib/auth";
import { createThread, getTopicBySlug, listThreadsForTopic } from "@/lib/community/service";
import { parseRegionParam } from "@/lib/regions";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const topicSlug = searchParams.get("topicSlug");
  const region = parseRegionParam(searchParams.get("region"));

  if (!topicSlug) {
    return NextResponse.json(
      { error: "topicSlug query parameter is required" },
      { status: 400 }
    );
  }

  const topic = await getTopicBySlug(topicSlug);
  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  const rows = await listThreadsForTopic(topic.id, region);

  return NextResponse.json({
    topic: { id: topic.id, slug: topic.slug, name: topic.name },
    threads: rows.map(({ thread, authorDisplay }) => ({
      id: thread.id,
      title: thread.title,
      body: thread.body,
      region: thread.region,
      replyCount: thread.replyCount,
      lastActivityAt: thread.lastActivityAt.toISOString(),
      isPinned: thread.isPinned,
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
  const topicSlug = typeof b.topicSlug === "string" ? b.topicSlug.trim() : "";
  const title = typeof b.title === "string" ? b.title.trim() : "";
  const textBody = typeof b.body === "string" ? b.body.trim() : "";
  const region =
    typeof b.region === "string" ? parseRegionParam(b.region) : undefined;

  if (!topicSlug || !title || !textBody) {
    return NextResponse.json(
      { error: "topicSlug, title, and body are required" },
      { status: 400 }
    );
  }

  const topic = await getTopicBySlug(topicSlug);
  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  const id = await createThread({
    authorId: session.user.id,
    topicId: topic.id,
    title,
    body: textBody,
    region: region ?? null,
  });

  return NextResponse.json(
    { id, topicSlug: topic.slug },
    { status: 201 }
  );
}
