import { NextResponse } from "next/server";
import { facebookProfileSearch } from "@/lib/serpapi";
import { ScrapeResponse } from "@/lib/types";

export async function GET(): Promise<NextResponse<ScrapeResponse>> {
  try {
    const items = await facebookProfileSearch();
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ items: [], error: message }, { status: 200 });
  }
}
