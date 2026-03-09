import { ScrapedItem } from "./types";

const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

const SYSTEM_INSTRUCTION = `You are an assistant for student council members at Coláiste Chraobh Abhann (CCA), a secondary school in Kilcoole, Co. Wicklow, Ireland. Your job is to take raw scraped data from the school's web presence and produce a structured assembly report that student council members can read aloud during school assemblies.

IMPORTANT RULES:
- Only include information that is clearly about CCA Kilcoole or its students/staff.
- Discard any results that are about a different school or unrelated.
- Be concise — each item should be 1-3 sentences maximum, suitable for reading aloud.
- Use a friendly, enthusiastic but professional tone appropriate for a school assembly.
- When a date is mentioned, include it.
- If a result is clearly about a specific year group, assign it to that group.
- If a result applies to the whole school or you cannot determine the year group, put it in "General / Whole School".
- Do NOT fabricate or infer information that is not in the provided data.
- If there is little or no content, say so honestly — do not pad the report.`;

function buildPrompt(
  scrapedData: {
    schoolWebsite: ScrapedItem[];
    instagram: ScrapedItem[];
    facebook: ScrapedItem[];
    general: ScrapedItem[];
  },
  dateRange: { from: string; to: string }
): string {
  let itemNum = 0;

  function formatItems(items: ScrapedItem[]): string {
    if (items.length === 0) return "  (No results found)\n";
    return items
      .map((item) => {
        itemNum++;
        return `  [${itemNum}] Title: ${item.title}\n      Snippet: ${item.snippet}\n      URL: ${item.link}${item.date ? `\n      Date: ${item.date}` : ""}`;
      })
      .join("\n\n");
  }

  return `Generate an assembly report for the period ${dateRange.from} to ${dateRange.to}.

Below is all the content scraped from the school's web presence. Each item has a source, title, snippet, and URL.

=== SCHOOL WEBSITE (colaisteca.ie) ===
${formatItems(scrapedData.schoolWebsite)}

=== INSTAGRAM (@ccakilcoole) ===
${formatItems(scrapedData.instagram)}

=== FACEBOOK (CCA Kilcoole) ===
${formatItems(scrapedData.facebook)}

=== OTHER SOURCES (news, sports orgs, etc.) ===
${formatItems(scrapedData.general)}

---

Please produce the report in the following EXACT JSON format. Do not include any text outside the JSON block:

{
  "title": "CCA Assembly Report: ${dateRange.from} to ${dateRange.to}",
  "sections": [
    {
      "yearGroup": "General / Whole School",
      "items": [
        {
          "topic": "Sports Results & Fixtures",
          "content": "Brief summary suitable for reading aloud at assembly.",
          "sourceNumbers": [1, 3]
        }
      ]
    }
  ]
}

YEAR GROUPS (use exactly these strings):
- "1st Year"
- "2nd Year"
- "3rd Year"
- "4th Year (TY)"
- "5th Year"
- "6th Year"
- "General / Whole School"

TOPIC CATEGORIES (use exactly these strings):
- "Sports Results & Fixtures"
- "Upcoming Events"
- "Special Weeks & Awareness Days"
- "Exam Reminders & Academic"
- "Achievements & Awards"
- "Clubs & Extracurriculars"
- "Other Announcements"

Rules for categorization:
- "1st Years", "first years" -> "1st Year"
- "TY", "Transition Year", "4th Year" -> "4th Year (TY)"
- "LC", "Leaving Cert" -> "6th Year"
- "JC", "Junior Cert" -> "3rd Year"
- If content mentions multiple year groups, place it in EACH relevant group.
- General school events, staff news, whole-school activities -> "General / Whole School"

IMPORTANT: Only return valid JSON. sourceNumbers should reference the item numbers from the data above so the UI can link back to original sources.`;
}

export async function generateAssemblyReport(
  scrapedData: {
    schoolWebsite: ScrapedItem[];
    instagram: ScrapedItem[];
    facebook: ScrapedItem[];
    general: ScrapedItem[];
  },
  dateRange: { from: string; to: string }
): Promise<string> {
  const prompt = buildPrompt(scrapedData, dateRange);

  const requestBody = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",
    },
  };

  const url = `${GEMINI_API_BASE}?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned no content");
  }

  return text;
}
