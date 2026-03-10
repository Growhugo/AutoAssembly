import { list } from "@vercel/blob";

const BLOB_PATH = "teams-data.json";

export async function GET() {
  try {
    const { blobs } = await list({ prefix: BLOB_PATH });

    if (blobs.length === 0) {
      return Response.json({ items: [], updatedAt: null });
    }

    const response = await fetch(blobs[0].url);
    const data = await response.json();
    return Response.json({
      items: data.items ?? [],
      updatedAt: data.updatedAt ?? null,
    });
  } catch {
    return Response.json({ items: [], updatedAt: null });
  }
}
