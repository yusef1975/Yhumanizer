# StudentVibe — AI Text Humanizer

Transform perfect AI-generated text into something that reads like it was written by a real student. Built with Next.js, Tailwind CSS, and Google Gemini.

---

## Features

- **Gemini 1.5 Flash** — Powered by Google's generative AI for context-aware text transformation
- **3 Personas** — Toggle between High School, College, and Creative writing styles
- **Burstiness Engine** — Randomly varies sentence lengths for natural rhythm
- **AI Scrubbing** — Strips common AI footprint phrases ("In conclusion", "I hope this helps", "delve", "tapestry")
- **Prompt Injection Firewall** — System prompt wrapper prevents jailbreak attempts
- **PII Detection** — Frontend warns users before sending emails or phone numbers to the AI
- **Rate Limiting** — IP-based limits via Upstash Redis (3 requests/hour)
- **Markdown Support** — Preserves headers, lists, and formatting in output
- **DOCX Export** — Download results as a Word document
- **Cloudflare Ready** — Supports `cf-connecting-ip` for accurate rate limiting behind proxies

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React, Tailwind CSS |
| AI Engine | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| Rate Limiting | Upstash Redis (`@upstash/ratelimit`) |
| Markdown | `react-markdown` |
| Export | `docx` (client-side .docx generation) |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google AI API Key](https://aistudio.google.com/apikey)

### Local Development

```bash
# Clone the repo
git clone https://github.com/yusef1975/Yhumanizer.git
cd Yhumanizer

# Install dependencies
npm install

# Create your environment file
cp .env.local.example .env.local
# Then add your GEMINI_API_KEY to .env.local

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Your Google Generative AI API key |
| `UPSTASH_REDIS_REST_URL` | ❌ | Upstash Redis URL (enables rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | ❌ | Upstash Redis token |

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Add your `GEMINI_API_KEY` in Environment Variables
4. Click **Deploy**

Vercel auto-detects Next.js and handles everything else.

## Project Structure

```
├── app/
│   ├── api/humanize/
│   │   └── route.ts        # Gemini API endpoint (server-side only)
│   ├── globals.css          # Dark glassmorphism theme
│   ├── layout.tsx           # Root layout with SEO metadata
│   └── page.tsx             # Main UI (input, output, PII detection, DOCX export)
├── .env.local               # API keys (git-ignored)
├── .gitignore               # Secrets excluded
└── package.json
```

## License

MIT
