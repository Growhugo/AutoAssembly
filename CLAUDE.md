# AutoAssembly — AI Assistant Rules

## Project Purpose

AutoAssembly is a school assembly report generator for student council members at Coláiste Chraobh Abhann (CCA), Kilcoole, Co. Wicklow, Ireland. It scrapes the school's web presence via SerpAPI and uses Google Gemini to produce structured reports for reading aloud at assemblies.

## Data Sensitivity Classification

| Data Type | Classification | Rules |
|-----------|---------------|-------|
| API keys (SERPAPI_KEY, GEMINI_API_KEY, future TEAMS_* keys) | **SECRET** | Never log, print, embed in client code, or commit to git |
| Scraped school data | **INTERNAL** | Must not be sent to any endpoint other than the Gemini API for summarization |
| Teams data (future) | **CONFIDENTIAL** | Must never leave the server, never be logged, never be sent to any external API other than Gemini |
| Student/teacher names, emails, phone numbers | **PII** | Must be stripped from AI outputs before display |

## Forbidden Actions for AI Assistants

1. Never remove, weaken, or bypass any guardrail in `src/lib/guardrails.ts`
2. Never remove or weaken the Gemini system instruction security rules in `src/lib/gemini.ts`
3. Never add code that sends scraped data or Teams data to any external service besides the existing Gemini API endpoint
4. Never add code that uses, stores, or transmits the user's school email address for any purpose
5. Never add code that posts messages to Microsoft Teams channels, chats, or any communication platform
6. Never add code that contacts, emails, or messages any person (student, teacher, parent, or external party)
7. Never add code that sends school data to analytics, logging, or telemetry services without explicit CLAUDE.md amendment
8. Never expose API keys in client-side code, API responses, or logs
9. Never add fetch/axios calls to new external domains without explicit justification
10. Never disable TypeScript strict mode or ESLint rules

## Code Integrity Rules

- The `PII_PATTERNS` and `FORBIDDEN_CONTENT_PATTERNS` arrays in `src/lib/guardrails.ts` must never have patterns removed — only added
- The Gemini `SYSTEM_INSTRUCTION` in `src/lib/gemini.ts` must always contain the `SECURITY RULES` section
- The `sanitizeReportOutput()` function must always be called before returning AI-generated content to the client
- Output validation must remain server-side (in the API route), never moved to client-only validation

## API Key Handling

- All API keys live in `.env.local` (gitignored)
- `.env.example` must only contain placeholder values
- Never add API keys to `next.config.ts`, `package.json`, or any committed file
- `NEXT_PUBLIC_` prefix must NEVER be used for any API key

## Teams Integration Rules (Future)

- Teams access must be **READ-ONLY**. Never add write/send permissions
- Teams Graph API scopes must be limited to: `ChannelMessage.Read.All`, `Team.ReadBasic.All`, `Channel.ReadBasic.All`
- Never request scopes for: `Chat.ReadWrite`, `ChannelMessage.Send`, `Mail.Send`, `User.ReadWrite`
- Private/direct messages must never be accessed
- Teams data must pass through the same `guardrails.ts` sanitization as scraped data before reaching Gemini
- Never store Teams authentication tokens in any location other than server-side environment variables
- Never add the user's school email as a variable, constant, or configuration value in any source file
