"use client";

import { ReportItem } from "@/lib/types";
import { ScrapedItem } from "@/lib/types";
import SourceBadge from "./SourceBadge";

interface ReportSectionProps {
  yearGroup: string;
  items: ReportItem[];
  allScrapedItems: ScrapedItem[];
}

const TOPIC_ICONS: Record<string, string> = {
  "Sports Results & Fixtures": "🏅",
  "Upcoming Events": "📅",
  "Special Weeks & Awareness Days": "🌟",
  "Exam Reminders & Academic": "📝",
  "Achievements & Awards": "🏆",
  "Clubs & Extracurriculars": "🎭",
  "Other Announcements": "📢",
};

export default function ReportSection({
  yearGroup,
  items,
  allScrapedItems,
}: ReportSectionProps) {
  // Group items by topic
  const topicGroups = new Map<string, ReportItem[]>();
  for (const item of items) {
    const existing = topicGroups.get(item.topic) ?? [];
    existing.push(item);
    topicGroups.set(item.topic, existing);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 bg-cca-blue-light px-4 py-3">
        <h3 className="font-bold text-cca-blue">{yearGroup}</h3>
      </div>
      <div className="divide-y divide-gray-50 p-4">
        {Array.from(topicGroups.entries()).map(([topic, topicItems]) => (
          <div key={topic} className="py-3 first:pt-0 last:pb-0">
            <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <span>{TOPIC_ICONS[topic] ?? "📌"}</span>
              {topic}
            </h4>
            <div className="space-y-2">
              {topicItems.map((item, i) => (
                <div key={i} className="pl-6">
                  <p className="text-sm leading-relaxed text-gray-600">
                    {item.content}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.sourceNumbers.map((num) => {
                      const scraped = allScrapedItems[num - 1];
                      return scraped ? (
                        <SourceBadge
                          key={num}
                          source={scraped.source}
                          link={scraped.link}
                        />
                      ) : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
