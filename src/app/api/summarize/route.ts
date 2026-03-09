import { NextRequest } from "next/server";
import { generateAssemblyReport } from "@/lib/gemini";

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
    ...(body.facebook ?? []),
    ...(body.general ?? []),
  ].length;

  if (totalItems === 0) {
    return new Response(
      JSON.stringify({ error: "No content found to summarize. Try again later." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const reportJson = await generateAssemblyReport(
      {
        schoolWebsite: body.schoolWebsite ?? [],
        facebook: body.facebook ?? [],
        general: body.general ?? [],
      },
      body.dateRange
    );

    return new Response(reportJson, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI generation failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
