export interface ScrapedItem {
  title: string;
  snippet: string;
  link: string;
  date?: string;
  source: "school-website" | "facebook" | "general" | "teams";
}

export interface ScrapeResponse {
  items: ScrapedItem[];
  error?: string;
}

export interface ScrapeSourceStatus {
  source: string;
  label: string;
  status: "pending" | "loading" | "done" | "error";
  itemCount: number;
  error?: string;
}

export type YearGroup =
  | "1st Year"
  | "2nd Year"
  | "3rd Year"
  | "4th Year (TY)"
  | "5th Year"
  | "6th Year";

export type TopicCategory =
  | "Sports Results & Fixtures"
  | "Upcoming Events"
  | "Special Weeks & Awareness Days"
  | "Exam Reminders & Academic"
  | "Achievements & Awards"
  | "Clubs & Extracurriculars"
  | "Other Announcements";

export interface ReportItem {
  topic: TopicCategory;
  content: string;
  sourceNumbers: number[];
}

export interface ReportSection {
  yearGroup: YearGroup | "General / Whole School";
  items: ReportItem[];
}

export interface AssemblyReport {
  title: string;
  sections: ReportSection[];
}

// Future: Teams integration types
// GUARDRAIL: Teams access must be READ-ONLY. See CLAUDE.md.
export interface TeamsChannelMessage {
  id: string;
  content: string;
  channelName: string;
  teamName: string;
  createdDateTime: string;
  // NOTE: sender info intentionally excluded to prevent PII in reports
}

export type TeamsDataSource = "teams-announcement" | "teams-channel";
