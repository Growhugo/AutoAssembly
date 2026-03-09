"use client";

import { useState } from "react";
import { AssemblyReport } from "@/lib/types";
import { TOPIC_CATEGORIES } from "@/lib/constants";

interface CopyButtonProps {
  report: AssemblyReport;
  yearGroup: string;
}

function formatReportAsText(report: AssemblyReport, yearGroup: string): string {
  const lines: string[] = [];
  lines.push("CCA ASSEMBLY REPORT");
  lines.push("====================");
  lines.push(`Year: ${yearGroup}`);
  lines.push(`${report.title.replace("CCA Assembly Report: ", "Period: ")}`);
  lines.push("");

  for (const section of report.sections) {
    lines.push(section.yearGroup.toUpperCase());
    lines.push("-".repeat(section.yearGroup.length));
    lines.push("");

    const topicGroups = new Map<string, string[]>();
    for (const item of section.items) {
      const existing = topicGroups.get(item.topic) ?? [];
      existing.push(item.content);
      topicGroups.set(item.topic, existing);
    }

    for (const topic of TOPIC_CATEGORIES) {
      const items = topicGroups.get(topic);
      if (!items) continue;
      lines.push(`${topic.toUpperCase()}:`);
      for (const content of items) {
        lines.push(`  - ${content}`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

export default function CopyButton({ report, yearGroup }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = formatReportAsText(report, yearGroup);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-lg border border-cca-blue/20 bg-white px-4 py-2 text-sm font-medium text-cca-blue shadow-sm transition-all hover:bg-cca-blue-light active:scale-95"
    >
      {copied ? (
        <>
          <svg className="h-4 w-4 text-cca-green" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
          Copy Report
        </>
      )}
    </button>
  );
}
