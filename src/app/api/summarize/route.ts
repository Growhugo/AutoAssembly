import { NextRequest } from "next/server";
import { streamAssemblyReport } from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.dateRange?.from || !body.dateRange?.to) {
    return new Response(JSON.stringify({ error: "Missing date range" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const totalItems = [
    ...(body.schoolWebsite ?? []),
    ...(body.instagram ?? []),
    ...(body.facebook ?? []),
    ...(body.general ?? []),
  ].length;

  if (totalItems === 0) {
    return new Response(
      JSON.stringify({ error: "No content found to summarize. Try again later." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamAssemblyReport(
          {
            schoolWebsite: body.schoolWebsite ?? [],
            instagram: body.instagram ?? [],
            facebook: body.facebook ?? [],
            general: body.general ?? [],
          },
          body.dateRange
        )) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (error) {
        const message = error instanceof Error ? error.message : "AI generation failed";
        controller.enqueue(encoder.encode(JSON.stringify({ error: message })));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
