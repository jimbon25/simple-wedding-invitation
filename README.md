> **Note:** This version does not use Google reCAPTCHA or any captcha. All anti-spam and bot protection is handled by backend logic (honeypot, blacklist, time-based validation, rate limiting, and admin notification).

> **Security Notice:** If you discover any vulnerability in this project, please contact the author: jimbonluis90@gmail.com

# Simple Wedding Invitation

<p align="center">
  <a href="https://app.netlify.com/projects/invitation-dn/deploys">
    <img src="https://api.netlify.com/api/v1/badges/a3d51b63-c999-4e01-823f-b52ee8e7b7a4/deploy-status" alt="Netlify Status" height="120" />
  </a>
  <a href="https://github.com/jimbon25/simple-wedding-invitation/actions/workflows/ci.yml">
    <img src="https://github.com/jimbon25/simple-wedding-invitation/actions/workflows/ci.yml/badge.svg" alt="CI Status" height="120" />
  </a>
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="MIT License" height="120" />
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/node.js-16%20%7C%2018%20%7C%2020-brightgreen?style=flat-square" alt="Node.js Version" height="120" />
  </a>
  <a href="https://github.com/jimbon25/simple-wedding-invitation/commits/main">
    <img src="https://img.shields.io/github/last-commit/jimbon25/simple-wedding-invitation?logo=github&style=flat-square" alt="Last Commit" height="120" />
  </a>
  <a href="https://reactjs.org/">
    <img src="https://img.shields.io/badge/react-19.1.0-61DAFB.svg?logo=react&style=flat-square" alt="React Version" height="120" />
  </a>
  <a href="#enhanced-visitor-tracking-system">
    <img src="https://img.shields.io/badge/analytics-suspect%20tracking-orange?style=flat-square" alt="Visitor Tracking" height="120" />
  </a>
  <a href="https://ai.google.dev/gemini-api">
    <img src="https://img.shields.io/badge/AI-Gemini%20Powered-purple?logo=google&style=flat-square" alt="Gemini AI" height="120" />
  </a>
  <a href="#multi-platform-support">
    <img src="https://img.shields.io/badge/platforms-Netlify%20%7C%20Vercel-black?style=flat-square" alt="Platforms" height="120" />
  </a>
  <a href="https://core.telegram.org/bots/api">
    <img src="https://img.shields.io/badge/notifications-Telegram%20Bot-26A5E4?logo=telegram&style=flat-square" alt="Telegram Bot" height="120" />
  </a>
  <a href="https://discord.com/developers/docs/resources/webhook">
    <img src="https://img.shields.io/badge/notifications-Discord%20Webhook-5865F2?logo=discord&style=flat-square" alt="Discord Webhook" height="120" />
  </a>
  <a href="https://ipinfo.io/">
    <img src="https://img.shields.io/badge/security-IP%20Geolocation-blue?logo=internetexplorer&style=flat-square" alt="IP Geolocation" height="120" />
  </a>
  <a href="https://developers.google.com/recaptcha">
    <img src="https://img.shields.io/badge/security-reCAPTCHA%20v2-4285F4?logo=google&style=flat-square" alt="Google reCAPTCHA" height="120" />
  </a>
</p>

### Environment Variables

Set these environment variables on your hosting platform:

| Variable Name | Netlify | Vercel | Description |
|---------------|---------|--------|-------------|
| `SUSPECT_BOT_TOKEN` | ✓ | ✓ | Telegram bot token for suspect notification |
| `SUSPECT_CHAT_ID` | ✓ | ✓ | Chat ID to receive notifications for suspect |
| `DISCORD_WEBHOOK_URL` | ✓ | ✓ | Your Discord channel webhook URL |
| `TELEGRAM_BOT_TOKEN` | ✓ | ✓ | Your Telegram bot token |
| `TELEGRAM_CHAT_ID` | ✓ | ✓ | Chat ID to send notifications |
| `GEMINI_API_KEY` | ✓ | ✓ | Google Gemini API key |
| `GUEST_API_KEY` | ✓ | ✓ | Custom API key for guest |
| `PENTEST_RATE_KEY` | ✓ | ✓ | Custom API key for developers or pentest |
| `ANALYTICS_BOT_TOKEN` | ✓ | ✓ | Token for analytics Telegram bot |
| `ANALYTICS_CHAT_ID` | ✓ | ✓ | Chat ID for analytics data |
| `IPINFO_TOKEN` | ✓ | ✓ | Token for IP Geolocation services |
| `ALLOWED_COUNTRIES` | ✓ | ✓ | Comma-separated list of allowed country codes |
| `REACT_APP_GUEST_API_KEY` | ✓ | ✗ | Public guest API key (Netlify) |
| `REACT_APP_SITE_URL` | ✓ | ✗ | Site URL for Netlify |
| `NEXT_PUBLIC_GUEST_API_KEY` | ✗ | ✓ | Public guest API key (Vercel) |
| `NEXT_PUBLIC_SITE_URL` | ✗ | ✓ | Site URL for Vercel |


## Disclaimer

This project is provided as-is, without any warranty. Use at your own risk. The author is not responsible for any issues, damages, or losses resulting from the use, deployment, or modification of this code. Please review and test thoroughly before deploying to production.

