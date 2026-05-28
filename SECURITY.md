# JB Holds Security Notes

This prototype is a static front-end experience. It does not include API keys, tokens, credentials, forms, database writes, Supabase clients, or backend sessions.

Production requirements for real data:

- Keep all secrets in environment variables or a managed secret store. Never ship service-role keys or private tokens to the browser.
- Use a backend boundary for privileged data access, validation, authorization, and audit logging.
- Validate and sanitize every user-controlled input on the backend, even when the frontend also validates it.
- Use parameterized queries or trusted query builders for all database access.
- Apply least-privilege permissions to every service account, API token, and database role.
- If Supabase is introduced, enable Row Level Security on every table before exposing it to the app.
- Define RLS policies by authenticated role, organization, brand, area, and assigned branch where applicable.
- Keep public read access disabled unless the data is intentionally public and reviewed.
- Store session cookies with secure, httpOnly, sameSite protections when sessions are managed server-side.
- Log administrative actions, data imports, risk-status changes, and commitment ownership changes.
