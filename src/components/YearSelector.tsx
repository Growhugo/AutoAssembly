"use client";

import { YearGroup } from "@/lib/types";
import { YEAR_GROUPS, ASSEMBLY_DAYS } from "@/lib/constants";

interface YearSelectorProps {
  selected: YearGroup | null;
  onSelect: (year: YearGroup) => void;
  disabled?: boolean;
}

export default function YearSelector({
  selected,
  onSelect,
  disabled,
}: YearSelectorProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-cca-blue">
        Select your year group
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {YEAR_GROUPS.map((year) => {
          const info = ASSEMBLY_DAYS[year];
          const isSelected = selected === year;
          return (
            <button
              key={year}
              onClick={() => onSelect(year)}
              disabled={disabled}
              className={`rounded-lg border-2 px-3 py-3 text-left transition-all ${
                isSelected
                  ? "border-cca-gold bg-cca-gold-light shadow-md"
                  : "border-gray-200 bg-white hover:border-cca-gold/50 hover:bg-cca-gold-light/50"
              } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
            >
              <div className="text-sm font-bold text-cca-blue">{year}</div>
              <div className="mt-0.5 text-xs text-gray-500">
                {info.day} &middot; {info.location}
              </div>
            </button>
          );
        })}
      </div>
      {selected && (
        <p className="mt-3 text-sm text-cca-green">
          Your assembly is on{" "}
          <span className="font-bold">{ASSEMBLY_DAYS[selected].day}</span> in{" "}
          {ASSEMBLY_DAYS[selected].location}
        </p>
      )}
    </div>
  );
}
