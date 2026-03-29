import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tagsParam = req.nextUrl.searchParams.get("tags");
  if (!tagsParam) {
    return NextResponse.json({ error: "No tags" }, { status: 400 });
  }

  const tags = tagsParam.split(",").filter(Boolean);
  for (const tag of tags) {
    revalidateTag(tag, {});
  }

  return NextResponse.json({ revalidated: true, tags });
}
