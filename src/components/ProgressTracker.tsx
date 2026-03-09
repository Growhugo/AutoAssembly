"use client";

import { ScrapeSourceStatus } from "@/lib/types";

interface ProgressTrackerProps {
  sources: ScrapeSourceStatus[];
  summarizing: boolean;
  summarizeDone: boolean;
}

function StatusIcon({ status }: { status: ScrapeSourceStatus["status"] }) {
  switch (status) {
    case "loading":
      return (
        <svg className="h-5 w-5 animate-spin text-cca-blue" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      );
    case "done":
      return (
        <svg className="h-5 w-5 text-cca-green" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    case "error":
      return (
        <svg className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    default:
      return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
  }
}

export default function ProgressTracker({
  sources,
  summarizing,
  summarizeDone,
}: ProgressTrackerProps) {
  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-cca-blue">Progress</h3>
      {sources.map((s) => (
        <div key={s.source} className="flex items-center gap-3">
          <StatusIcon status={s.status} />
          <div className="flex-1">
            <span className="text-sm text-gray-700">{s.label}</span>
            {s.status === "done" && (
              <span className="ml-2 text-xs text-gray-400">
                {s.itemCount} item{s.itemCount !== 1 ? "s" : ""} found
              </span>
            )}
            {s.status === "error" && s.error && (
              <span className="ml-2 text-xs text-orange-500">{s.error}</span>
            )}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3 border-t border-gray-100 pt-3">
        {summarizeDone ? (
          <svg className="h-5 w-5 text-cca-green" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : summarizing ? (
          <svg className="h-5 w-5 animate-spin text-cca-blue" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
        )}
        <span className="text-sm text-gray-700">AI Report Generation</span>
      </div>
    </div>
  );
}
