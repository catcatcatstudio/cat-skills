# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in cat-skills, please report it responsibly.

**Do not open a public issue.**

Email: wwwcolorcolor@gmail.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Which skill is affected
- Potential impact

We will acknowledge receipt within 48 hours and aim to provide a fix or mitigation within 7 days.

## Scope

Skills are instruction sets (markdown files) that run inside AI agents. The primary security concerns are:

- **Prompt injection:** A skill that causes the agent to take unintended actions
- **Data exfiltration:** A skill that instructs the agent to send data to external services
- **Credential exposure:** A skill that logs or transmits API keys or tokens

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest (main branch) | Yes |
| Older commits | No |
