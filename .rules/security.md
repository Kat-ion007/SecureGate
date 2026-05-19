# Security Rules

- Never store plain text passwords
- Always hash passwords using bcryptjs with 12 salt rounds
- Tokens must expire
- Never expose whether an email exists
- Rate limit auth endpoints
- Validate all inputs using Zod
- Never trust client input
- Never hardcode secrets
