"use client";

import { SOURCE_COLORS, SOURCE_LABELS } from "@/lib/constants";

interface SourceBadgeProps {
  source: string;
  link?: string;
}

export default function SourceBadge({ source, link }: SourceBadgeProps) {
  const colorClass = SOURCE_COLORS[source] ?? "bg-gray-500 text-white";
  const label = SOURCE_LABELS[source] ?? source;

  const badge = (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${colorClass}`}
    >
      {label}
    </span>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
        {badge}
      </a>
    );
  }

  return badge;
}
