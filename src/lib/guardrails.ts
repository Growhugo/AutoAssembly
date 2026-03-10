/**
 * GUARDRAIL: Output validation for AI-generated report content.
 * This module must be called before returning any AI output to the client.
 * See CLAUDE.md for code integrity requirements — patterns must never be removed.
 */

// PII detection patterns — these catch common Irish/EU PII formats
// GUARDRAIL: Only add patterns to this array, never remove them.
export const PII_PATTERNS: { pattern: RegExp; label: string }[] = [
  // Email addresses
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, label: "email" },
  // Irish phone numbers (landline and mobile)
  { pattern: /(?:\+353|0)[\s.-]?\d{1,2}[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g, label: "phone" },
  // PPS numbers (Irish personal public service number: 7 digits + 1-2 letters)
  { pattern: /\b\d{7}[A-Za-z]{1,2}\b/g, label: "pps_number" },
  // Eircode (Irish postal code)
  { pattern: /\b[A-Za-z]\d{2}\s?[A-Za-z0-9]{4}\b/g, label: "eircode" },
];

// Content that should never appear in an assembly report
// GUARDRAIL: Only add patterns to this array, never remove them.
export const FORBIDDEN_CONTENT_PATTERNS: { pattern: RegExp; label: string }[] = [
  // Prompt injection artifacts
  { pattern: /ignore\s+(previous|prior|above)\s+instructions/i, label: "prompt_injection" },
  { pattern: /\bAPI[_\s]?KEY\b/i, label: "api_key_reference" },
  { pattern: /\bSERPAPI\b/i, label: "internal_service_reference" },
  { pattern: /\bGEMINI_API\b/i, label: "internal_service_reference" },
  // Harmful content indicators
  { pattern: /\bblackmail\b/i, label: "harmful_content" },
];

export interface SanitizationResult {
  sanitized: string;
  redactions: { type: string; count: number }[];
  blocked: boolean;
  blockReason?: string;
}

/**
 * Redact PII from a text string, replacing matches with [REDACTED].
 */
export function redactPII(text: string): { result: string; redactions: { type: string; count: number }[] } {
  const redactions: Map<string, number> = new Map();
  let result = text;

  for (const { pattern, label } of PII_PATTERNS) {
    // Reset regex lastIndex for global patterns
    pattern.lastIndex = 0;
    const matches = result.match(pattern);
    if (matches) {
      redactions.set(label, (redactions.get(label) ?? 0) + matches.length);
      result = result.replace(pattern, "[REDACTED]");
    }
  }

  return {
    result,
    redactions: Array.from(redactions.entries()).map(([type, count]) => ({ type, count })),
  };
}

/**
 * Check if text contains forbidden content patterns.
 * Returns the first matched pattern label, or null if clean.
 */
export function checkForbiddenContent(text: string): string | null {
  for (const { pattern, label } of FORBIDDEN_CONTENT_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      return label;
    }
  }
  return null;
}

/**
 * Sanitize the full AI-generated report JSON string.
 * Call this in the /api/summarize route BEFORE returning to the client.
 */
export function sanitizeReportOutput(rawJson: string): SanitizationResult {
  // First check: block entirely if forbidden content is present
  const forbiddenMatch = checkForbiddenContent(rawJson);
  if (
    forbiddenMatch === "prompt_injection" ||
    forbiddenMatch === "api_key_reference" ||
    forbiddenMatch === "internal_service_reference"
  ) {
    return {
      sanitized: rawJson,
      redactions: [],
      blocked: true,
      blockReason: `AI output contained suspicious content (${forbiddenMatch}). Output blocked for safety.`,
    };
  }

  // Second pass: redact PII from all text content
  const { result, redactions } = redactPII(rawJson);

  return {
    sanitized: result,
    redactions,
    blocked: false,
  };
}
