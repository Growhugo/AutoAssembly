import { YearGroup, TopicCategory } from "./types";

export const YEAR_GROUPS: YearGroup[] = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year (TY)",
  "5th Year",
  "6th Year",
];

export const ASSEMBLY_DAYS: Record<YearGroup, { day: string; dayIndex: number; location: string }> = {
  "1st Year": { day: "Monday", dayIndex: 1, location: "The GP Area" },
  "2nd Year": { day: "Tuesday", dayIndex: 2, location: "The GP Area" },
  "3rd Year": { day: "Wednesday", dayIndex: 3, location: "The GP Area" },
  "4th Year (TY)": { day: "Friday", dayIndex: 5, location: "The TY GP Area" },
  "5th Year": { day: "Thursday", dayIndex: 4, location: "The GP Area" },
  "6th Year": { day: "Friday", dayIndex: 5, location: "The GP Area" },
};

// Cycle groupings — controls which sections a year group can see
export type Cycle = "junior" | "ty" | "senior";

export const YEAR_TO_CYCLE: Record<YearGroup, Cycle> = {
  "1st Year": "junior",
  "2nd Year": "junior",
  "3rd Year": "junior",
  "4th Year (TY)": "ty",
  "5th Year": "senior",
  "6th Year": "senior",
};

// Which yearGroup labels in the report are visible to each cycle
export const CYCLE_VISIBLE_SECTIONS: Record<Cycle, string[]> = {
  junior: ["1st Year", "2nd Year", "3rd Year", "Junior Cycle (General)", "General / Whole School"],
  ty: ["4th Year (TY)", "Transition Year (General)", "General / Whole School"],
  senior: ["5th Year", "6th Year", "Senior Cycle (General)", "General / Whole School"],
};

export const TOPIC_CATEGORIES: TopicCategory[] = [
  "Sports Results & Fixtures",
  "Upcoming Events",
  "Special Weeks & Awareness Days",
  "Exam Reminders & Academic",
  "Achievements & Awards",
  "Clubs & Extracurriculars",
  "Other Announcements",
];

export const SOURCE_LABELS: Record<string, string> = {
  "school-website": "School Website",
  facebook: "Facebook",
  general: "Other Sources",
};

export const SOURCE_COLORS: Record<string, string> = {
  "school-website": "bg-cca-blue text-white",
  facebook: "bg-blue-600 text-white",
  general: "bg-gray-500 text-white",
};
