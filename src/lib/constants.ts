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
