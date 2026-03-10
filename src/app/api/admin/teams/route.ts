import { NextRequest } from "next/server";
import { put, list, del } from "@vercel/blob";
import { ScrapedItem } from "@/lib/types";

const BLOB_PATH = "teams-data.json";

function checkAuth(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret");
  return secret === process.env.ADMIN_SECRET;
}

function parseTeamsContent(raw: string): ScrapedItem[] {
  // Split by double newline (each chunk = one message/announcement)
  const chunks = raw
    .split(/\n\s*\n/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  return chunks.map((chunk, i) => {
    const lines = chunk.split("\n").map((l) => l.trim());
    const title = lines[0] || `Teams Message ${i + 1}`;
    const snippet = lines.length > 1 ? lines.slice(1).join(" ") : lines[0];

    return {
      title,
      snippet,
      link: "",
      source: "teams" as const,
    };
  });
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { blobs } = await list({ prefix: BLOB_PATH });

    if (blobs.length === 0) {
      return Response.json({ content: null, items: [], updatedAt: null });
    }

    const response = await fetch(blobs[0].url);
    const data = await response.json();
    return Response.json(data);
  } catch {
    return Response.json({ content: null, items: [], updatedAt: null });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const raw = body.content;

  if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
    return Response.json({ error: "No content provided" }, { status: 400 });
  }

  const items = parseTeamsContent(raw);
  const data = {
    content: raw,
    items,
    updatedAt: new Date().toISOString(),
  };

  await put(BLOB_PATH, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });

  return Response.json({ success: true, itemCount: items.length });
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { blobs } = await list({ prefix: BLOB_PATH });
    for (const blob of blobs) {
      await del(blob.url);
    }
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to clear data" }, { status: 500 });
  }
}
