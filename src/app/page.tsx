"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import YearSelector from "@/components/YearSelector";
import GenerateButton from "@/components/GenerateButton";
import ProgressTracker from "@/components/ProgressTracker";
import ReportDisplay from "@/components/ReportDisplay";
import ErrorBanner from "@/components/ErrorBanner";
import {
  YearGroup,
  ScrapedItem,
  ScrapeResponse,
  ScrapeSourceStatus,
  AssemblyReport,
} from "@/lib/types";

type Phase = "idle" | "scraping" | "summarizing" | "done" | "error";

const SCRAPE_SOURCES = [
  { endpoint: "/api/scrape/school-website", source: "school-website", label: "School Website" },
  { endpoint: "/api/scrape/instagram", source: "instagram", label: "Instagram" },
  { endpoint: "/api/scrape/facebook", source: "facebook", label: "Facebook" },
  { endpoint: "/api/scrape/general", source: "general", label: "Other Sources" },
] as const;

function getDateRange(): { from: string; to: string; display: string } {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 7);
  const to = new Date(now);
  to.setDate(to.getDate() + 7);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });

  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
    display: `${fmt(from)} \u2013 ${fmt(to)}`,
  };
}

export default function Home() {
  const [selectedYear, setSelectedYear] = useState<YearGroup | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [sourceStatuses, setSourceStatuses] = useState<ScrapeSourceStatus[]>([]);
  const [summarizing, setSummarizing] = useState(false);
  const [report, setReport] = useState<AssemblyReport | null>(null);
  const [allScrapedItems, setAllScrapedItems] = useState<ScrapedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const dateRange = getDateRange();

  const updateSourceStatus = useCallback(
    (source: string, update: Partial<ScrapeSourceStatus>) => {
      setSourceStatuses((prev) =>
        prev.map((s) => (s.source === source ? { ...s, ...update } : s))
      );
    },
    []
  );

  async function generateReport() {
    if (!selectedYear) return;

    setPhase("scraping");
    setError(null);
    setWarnings([]);
    setReport(null);

    const initialStatuses: ScrapeSourceStatus[] = SCRAPE_SOURCES.map((s) => ({
      source: s.source,
      label: s.label,
      status: "loading",
      itemCount: 0,
    }));
    setSourceStatuses(initialStatuses);

    const results = await Promise.allSettled(
      SCRAPE_SOURCES.map(async (s) => {
        try {
          const res = await fetch(s.endpoint);
          const data: ScrapeResponse = await res.json();

          if (data.error) {
            updateSourceStatus(s.source, {
              status: "error",
              itemCount: data.items.length,
              error: data.error,
            });
            return data.items;
          }

          updateSourceStatus(s.source, {
            status: "done",
            itemCount: data.items.length,
          });
          return data.items;
        } catch (err) {
          updateSourceStatus(s.source, {
            status: "error",
            error: err instanceof Error ? err.message : "Failed to fetch",
          });
          return [];
        }
      })
    );

    const collectedItems: ScrapedItem[] = [];
    const newWarnings: string[] = [];

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        collectedItems.push(...result.value);
        if (result.value.length === 0) {
          newWarnings.push(`${SCRAPE_SOURCES[i].label} returned no results.`);
        }
      } else {
        newWarnings.push(`${SCRAPE_SOURCES[i].label} failed to load.`);
      }
    });

    setAllScrapedItems(collectedItems);
    setWarnings(newWarnings);

    if (collectedItems.length === 0) {
      setPhase("error");
      setError(
        "No content found from any source. This might happen during school holidays. Try again later."
      );
      return;
    }

    const bySource = {
      schoolWebsite: collectedItems.filter((i) => i.source === "school-website"),
      instagram: collectedItems.filter((i) => i.source === "instagram"),
      facebook: collectedItems.filter((i) => i.source === "facebook"),
      general: collectedItems.filter((i) => i.source === "general"),
    };

    setPhase("summarizing");
    setSummarizing(true);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bySource,
          dateRange: { from: dateRange.from, to: dateRange.to },
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "AI generation failed" }));
        throw new Error(errData.error);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
      }

      const parsed: AssemblyReport = JSON.parse(fullText);
      setReport(parsed);
      setSummarizing(false);
      setPhase("done");
    } catch (err) {
      setSummarizing(false);
      setPhase("error");
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate the AI report. Please try again."
      );
    }
  }

  function handleReset() {
    setPhase("idle");
    setReport(null);
    setError(null);
    setWarnings([]);
    setSourceStatuses([]);
    setAllScrapedItems([]);
  }

  const isLoading = phase === "scraping" || phase === "summarizing";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="space-y-6">
          <YearSelector
            selected={selectedYear}
            onSelect={setSelectedYear}
            disabled={isLoading}
          />

          {phase !== "done" && (
            <GenerateButton
              dateRange={dateRange.display}
              onClick={generateReport}
              disabled={!selectedYear || isLoading}
              loading={isLoading}
            />
          )}

          {(phase === "scraping" || phase === "summarizing") && (
            <ProgressTracker
              sources={sourceStatuses}
              summarizing={phase === "summarizing"}
              summarizeDone={false}
            />
          )}

          {warnings.length > 0 && phase === "done" && (
            <ErrorBanner
              type="warning"
              message={`Some sources had issues: ${warnings.join(" ")}`}
              onDismiss={() => setWarnings([])}
            />
          )}

          {error && (
            <ErrorBanner
              type="error"
              message={error}
              onDismiss={() => {
                setError(null);
                if (phase === "error") setPhase("idle");
              }}
            />
          )}

          {phase === "done" && report && selectedYear && (
            <ReportDisplay
              report={report}
              selectedYear={selectedYear}
              allScrapedItems={allScrapedItems}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      <footer className="mt-8 border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        AutoAssembly &middot; Col&aacute;iste Chraobh Abhann, Kilcoole
      </footer>
    </div>
  );
}
