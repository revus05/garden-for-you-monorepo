import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { isKnownTag } from "@/shared/cache";
import { serverEnv } from "@/shared/config/env";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  if (secret !== serverEnv.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tagsParam = req.nextUrl.searchParams.get("tags");
  if (!tagsParam) {
    return NextResponse.json({ error: "No tags" }, { status: 400 });
  }

  const tags = tagsParam.split(",").filter(Boolean);
  const validTags = tags.filter(isKnownTag);
  const ignored = tags.filter((tag) => !isKnownTag(tag));

  for (const tag of validTags) {
    // `expire: 0` — drop the entries right away instead of leaving them to the
    // default cache-life profile, which would only mark them stale.
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({ revalidated: true, tags: validTags, ignored });
}
