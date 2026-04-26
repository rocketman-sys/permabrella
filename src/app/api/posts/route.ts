import { auth } from "@/lib/auth";
import { parseRegionParam } from "@/lib/regions";
import { createUserPost, listPostsByType } from "@/lib/posts/service";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const region = parseRegionParam(searchParams.get("region"));
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 40;

  if (
    type !== "event" &&
    type !== "directory_entry" &&
    type !== "grant" &&
    type !== "news" &&
    type !== "offering" &&
    type !== "wanted" &&
    type !== "land_available" &&
    type !== "land_wanted"
  ) {
    return NextResponse.json(
      {
        error:
          "Query param type must be event, directory_entry, grant, news, offering, wanted, land_available, or land_wanted",
      },
      { status: 400 }
    );
  }

  const rows = await listPostsByType({
    type,
    region,
    limit: Number.isFinite(limit) ? limit : 40,
  });

  return NextResponse.json({
    posts: rows.map(({ post, authorDisplay }) => ({
      id: post.id,
      type: post.type,
      source: post.source,
      title: post.title,
      description: post.description,
      contactMethod: post.contactMethod,
      contactPhone: post.contactPhone,
      contactEmail: post.contactEmail,
      externalUrl: post.externalUrl,
      imageUrl: post.imageUrl,
      region: post.region,
      locationDetail: post.locationDetail,
      eventDate: post.eventDate?.toISOString() ?? null,
      expiresAt: post.expiresAt?.toISOString() ?? null,
      createdAt: post.createdAt.toISOString(),
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
  const type = b.type;
  if (
    type !== "event" &&
    type !== "directory_entry" &&
    type !== "grant" &&
    type !== "news" &&
    type !== "offering" &&
    type !== "wanted" &&
    type !== "land_available" &&
    type !== "land_wanted"
  ) {
    return NextResponse.json(
      {
        error:
          "type must be event, directory_entry, grant, news, offering, wanted, land_available, or land_wanted",
      },
      { status: 400 }
    );
  }

  const title = typeof b.title === "string" ? b.title.trim() : "";
  const description = typeof b.description === "string" ? b.description.trim() : "";
  if (!title || !description) {
    return NextResponse.json(
      { error: "title and description are required" },
      { status: 400 }
    );
  }

  const region =
    typeof b.region === "string" ? parseRegionParam(b.region) : undefined;

  const contactMethod =
    typeof b.contactMethod === "string" ? b.contactMethod.trim() : null;
  const contactPhone =
    typeof b.contactPhone === "string" ? b.contactPhone.trim() : null;
  const contactEmail =
    typeof b.contactEmail === "string" ? b.contactEmail.trim() : null;
  const externalUrl =
    typeof b.externalUrl === "string" ? b.externalUrl.trim() : null;
  const imageUrl =
    typeof b.imageUrl === "string" ? b.imageUrl.trim() : null;
  const locationDetail =
    typeof b.locationDetail === "string" ? b.locationDetail.trim() : null;

  let eventDate: Date | null = null;
  if (type === "event" && typeof b.eventDate === "string" && b.eventDate) {
    const d = new Date(b.eventDate);
    if (!Number.isNaN(d.getTime())) eventDate = d;
  }

  let expiresAt: Date | null = null;
  if (
    type === "grant" &&
    typeof b.expiresAt === "string" &&
    (b.expiresAt as string)
  ) {
    const d = new Date(b.expiresAt as string);
    if (!Number.isNaN(d.getTime())) expiresAt = d;
  }

  const id = await createUserPost({
    authorId: session.user.id,
    type,
    title,
    description,
    contactMethod,
    contactPhone: contactPhone || null,
    contactEmail: contactEmail || null,
    externalUrl: externalUrl || null,
    imageUrl: imageUrl || null,
    region: region ?? null,
    locationDetail: locationDetail || null,
    eventDate,
    expiresAt,
    tags:
      type === "grant" ? ["grant"] : type === "news" ? ["news"] : [],
  });

  return NextResponse.json({ id }, { status: 201 });
}
