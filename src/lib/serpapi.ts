import { ScrapedItem } from "./types";

const SERPAPI_BASE = "https://serpapi.com/search.json";

export async function googleSearch(
  query: string,
  source: ScrapedItem["source"]
): Promise<ScrapedItem[]> {
  const url = new URL(SERPAPI_BASE);
  url.searchParams.set("engine", "google");
  url.searchParams.set("api_key", process.env.SERPAPI_KEY!);
  url.searchParams.set("q", query);
  url.searchParams.set("num", "10");
  url.searchParams.set("tbs", "qdr:d14");
  url.searchParams.set("gl", "ie");
  url.searchParams.set("hl", "en");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`SerpAPI error: ${response.status}`);
  }

  const data = await response.json();
  const results = data.organic_results ?? [];

  return results.map((r: Record<string, string>) => ({
    title: r.title ?? "",
    snippet: r.snippet ?? "",
    link: r.link ?? "",
    date: r.date ?? undefined,
    source,
  }));
}

export async function facebookProfileSearch(): Promise<ScrapedItem[]> {
  const url = new URL(SERPAPI_BASE);
  url.searchParams.set("engine", "facebook_profile");
  url.searchParams.set("api_key", process.env.SERPAPI_KEY!);
  url.searchParams.set("profile_id", "CCAKilcoole");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`SerpAPI Facebook error: ${response.status}`);
  }

  const data = await response.json();
  const posts = data.profile_results?.posts ?? [];

  if (posts.length === 0) {
    return googleSearch(
      '"CCA Kilcoole" site:facebook.com',
      "facebook"
    );
  }

  return posts.map((p: Record<string, string>) => ({
    title: p.title ?? "Facebook Post",
    snippet: p.text ?? p.description ?? "",
    link: p.link ?? "https://facebook.com/CCAKilcoole",
    date: p.date ?? undefined,
    source: "facebook" as const,
  }));
}
