"use client";

import { AssemblyReport, ScrapedItem, YearGroup } from "@/lib/types";
import { YEAR_TO_CYCLE, CYCLE_VISIBLE_SECTIONS } from "@/lib/constants";
import ReportSection from "./ReportSection";
import CopyButton from "./CopyButton";

interface ReportDisplayProps {
  report: AssemblyReport;
  selectedYear: YearGroup;
  allScrapedItems: ScrapedItem[];
  onReset: () => void;
}

export default function ReportDisplay({
  report,
  selectedYear,
  allScrapedItems,
  onReset,
}: ReportDisplayProps) {
  const sections = report.sections ?? [];
  const cycle = YEAR_TO_CYCLE[selectedYear];
  const visibleLabels = CYCLE_VISIBLE_SECTIONS[cycle];

  // Only show sections that belong to this year's cycle
  const filteredSections = sections.filter(
    (s) => visibleLabels.includes(s.yearGroup) || s.yearGroup === selectedYear
  );

  // Sort: General/Whole School first, then cycle general, then specific year
  filteredSections.sort((a, b) => {
    if (a.yearGroup === "General / Whole School") return -1;
    if (b.yearGroup === "General / Whole School") return 1;
    if (a.yearGroup.includes("(General)")) return -1;
    if (b.yearGroup.includes("(General)")) return 1;
    return 0;
  });

  const hasContent = filteredSections.some((s) => (s.items ?? []).length > 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-cca-blue">{report.title}</h2>
        <div className="flex gap-2">
          <CopyButton report={report} yearGroup={selectedYear} />
          <button
            onClick={onReset}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
          >
            New Report
          </button>
        </div>
      </div>

      {hasContent ? (
        <div className="space-y-4">
          {filteredSections
            .filter((s) => s.items.length > 0)
            .map((section) => (
              <ReportSection
                key={section.yearGroup}
                yearGroup={section.yearGroup}
                items={section.items}
                allScrapedItems={allScrapedItems}
              />
            ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">
            No relevant content was found for {selectedYear} in this period.
            This can happen during school holidays or quiet weeks.
          </p>
        </div>
      )}
    </div>
  );
}
