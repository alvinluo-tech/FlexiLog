<div align="center">

<img src="public/icon-512.png" alt="FlexiLog" width="120" />

# FlexiLog

**AI-Powered Fitness Tracking Platform**

Intelligent workout planning, real-time session tracking, and AI coaching — all in one modern web app.

<br />

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Vitest-6E45D2?style=flat-square&logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

<br />

[Features](#features) · [Tech Stack](#tech-stack) · [Getting Started](#getting-started) · [Project Structure](#project-structure) · [Testing](#testing)

</div>

---

## Features

<table>
<tr>
<td width="50%">

### AI Coach
- Conversational AI chat with context-aware training advice
- Auto-generate personalized workout plans based on body data
- Exercise recommendations & recovery analysis
- Natural language plan modification

</td>
<td width="50%">

### Workout Tracking
- Real-time session timer with rest countdown
- Set/rep/weight logging with RPE tracking
- Exercise library with 200+ exercises & demo images
- Template system for quick workout starts

</td>
</tr>
<tr>
<td>

### Social Feed
- Share workouts with the community
- Like & comment on training sessions
- Discover trending workouts

</td>
<td>

### Analytics Dashboard
- Training volume & frequency charts
- Personal records tracking (1RM, max weight, max reps)
- Progress photos & body metrics
- Export training history to CSV

</td>
</tr>
<tr>
<td>

### Offline & PWA
- Service Worker for offline capability
- IndexedDB offline queue with Background Sync
- Installable as a Progressive Web App

</td>
<td>

### Security
- Supabase Auth with PKCE flow
- Row Level Security (RLS) on all tables
- Rate limiting & input validation on APIs
- Open redirect prevention & security headers

</td>
</tr>
</table>

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **UI** | React 19, shadcn/ui, Tailwind CSS v4, Motion |
| **Language** | TypeScript (strict mode) |
| **Database** | Supabase (PostgreSQL + Auth + RLS) |
| **AI** | MiMo API (Xiaomi) for coaching & plan generation |
| **Charts** | Chart.js + react-chartjs-2 |
| **Testing** | Vitest (unit) + Playwright (E2E) |
| **Deployment** | Vercel |

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** (recommended)
- **Supabase** project ([supabase.com](https://supabase.com))

### Installation

```bash
# Clone the repo
git clone https://github.com/alvinluo-tech/FlexiLog.git
cd FlexiLog

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
MIMO_API_KEY=your_mimo_api_key
MIMO_BASE_URL=https://token-plan-ams.xiaomimimo.com/v1
```

### Run

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm start        # Start production server
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, register, password reset
│   ├── ai-coach/         # AI coaching page
│   ├── api/              # API routes (AI chat, plan generation)
│   ├── dashboard/        # Analytics dashboard
│   ├── exercises/        # Exercise library (200+ exercises)
│   ├── feed/             # Social feed
│   ├── history/          # Workout history
│   ├── profile/          # User profile & body metrics
│   └── workout/
│       └── live/         # Real-time workout tracking
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── ai-chat.tsx       # Conversational AI interface
│   └── navigation.tsx    # Sidebar & bottom nav
├── lib/
│   ├── supabase/         # Supabase client (server + browser)
│   ├── ai.ts             # MiMo API integration
│   ├── exercise-images.ts
│   ├── rate-limit.ts
│   └── volume-utils.ts
└── types/                # Shared TypeScript interfaces
```

---

## Testing

```bash
pnpm test           # Run unit tests (Vitest)
pnpm test:watch     # Watch mode
pnpm test:coverage  # Coverage report
pnpm test:e2e       # E2E tests (Playwright)
pnpm typecheck      # TypeScript type checking
```

**Coverage targets:** 80% minimum for utilities, API routes, and server actions.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with Next.js, Supabase, and AI**

</div>
