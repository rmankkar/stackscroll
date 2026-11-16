# 📱 StackScroll

> Swipe through the best of Stack Overflow — TikTok-style.

[![StackScroll v1.1.0](https://img.shields.io/badge/version-1.1.0-primary?style=for-the-badge&logo=stackoverflow&logoColor=white)](https://github.com/rmankkar/stackscroll)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 🚀 Now launching: StackScroll v1.1.0

StackScroll turns the Stack Overflow public API into a playful, mobile-first Q&A feed. Swipe through top-rated questions, read community answers, bookmark what you love, and search with instant, cached results — no logging in required to browse.

### What's new in v1.1.0 ✨

| Release | Highlights |
|---------|------------|
| **v1.1.0** | 🔍 **Search with caching** — debounced search (300 ms) with a 5-minute client-side cache (50 entries max) so you never fetch the same query twice.<br/>📜 **Infinite scrolling** — the feed just keeps coming, with silky loading states.<br/>🖼️ **Decorative panels** — soft blurred background blobs on desktop for a premium, app-like feel.<br/>🔖 **Bookmarks** — save your favorite Q&As and find them anytime.<br/>🧭 **Explore tab** — a second feed view with the same infinite-scroll treatment. |
| **v1.0.0** | TikTok-style swipe feed, Stack Overflow API integration (questions + answers), upvoting, text-to-speech "Hear" button, share via Web Share API, Auth0 login, profile page, and an Ask page to post your own questions. |

---

## 🎯 The one-liner

> Browsing Stack Overflow should feel like swiping through stories, not filling out forms.

StackScroll is a mobile web app that mimics the TikTok-style UI — vertical, gesture-friendly cards full of top-rated questions and answers pulled live from the Stack Overflow public API. One swipe at a time, you discover what the developer world is talking about right now.

---

## 📸 Preview

```
┌─────────────────────────────────┐
│  🔍 Search questions...  [⟳]    │
├─────────────────────────────────┤
│                                 │
│   ▲  +42                        │
│   "How do I center a div?"      │
│   author · Stack Overflow       │
│                                 │
│   [Answer] [🔊 Hear] [🔖] [↗]   │
│                                 │
│   ─── swipe up for next ───     │
│                                 │
│   ▲  +118                       │
│   "React useEffect cleanup..."  │
│   author · Stack Overflow       │
│                                 │
└─────────────────────────────────┘
    🏠 Feed   🔍 Explore   ★   👤
```

---

## ✨ Features

| Feature | What it does |
|---------|--------------|
| 📱 **TikTok-style swipe feed** | Vertical Q&A cards with Framer Motion spring animations — swipe, read, repeat. |
| 🔥 **Live Stack Overflow data** | Fetches top-voted questions and their answers straight from the Stack Exchange API. |
| 📜 **Infinite scrolling** | IntersectionObserver-driven pagination — the feed never runs out. |
| 🔍 **Smart search** | Debounced (300 ms) search with a 5-minute, 50-entry client cache — instant re-results, zero wasted calls. |
| 🔖 **Bookmarks** | Save any Q&A and revisit it from the Bookmarks tab. |
| 🧭 **Explore tab** | A dedicated discovery feed with the same infinite-scroll treatment. |
| 🔊 **Hear it aloud** | Text-to-speech on any question — listen while you code. |
| 👍 **Upvote & share** | Tap to upvote, copy the link, or use the native Web Share API. |
| 📝 **Ask your own** | Compose and post a question right from the app. |
| 🔐 **Auth0 + Profile** | Log in with Auth0 and view your stats in a personalized profile page. |
| 🖥️ **Desktop-ready** | Responsive layout with decorative gradient panels that look great on big screens. |

---

## 🛠️ Tech stack

**Frontend** — React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion · TanStack Query · Radix UI · Lucide React · React Spring · Auth0 SPA SDK

**Backend** — Express · Drizzle ORM · Zod · Stack Exchange public API

**Deploy** — any Node host; `tsx` for development, `vite build` for production

---

## 🏁 Get started in under a minute

### 1. Clone & install

```bash
git clone https://github.com/rmankkar/stackscroll.git
cd stackscroll
npm install
```

### 2. Run the dev server

```bash
npm run dev   # → http://localhost:5000 (Vite + Express via tsx)
```

### 3. Build for production

```bash
npm run build   # Vite build → client/dist
npm start       # NODE_ENV=production tsx server/index.ts
```

### Scripts

| Script | What it does |
|--------|--------------|
| `npm run dev` | Start Vite dev server + Express API (hot reload via `tsx`) |
| `npm run build` | Build the client bundle for production |
| `npm start` | Run the production server |

---

## 🔌 API quick reference

All endpoints live under `/api`.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/questions` | GET | Fetch a page of top-voted Stack Overflow questions (`?page=1`) |
| `/api/search` | GET | Search questions by title (`?q=react&page=1`) — server-cached |
| `/api/questions` | POST | Post your own question (body validated with Zod) |
| `/api/bookmarks` | GET | List a user's bookmarks (`?userId=1`) |
| `/api/bookmarks` | POST | Bookmark a question |
| `/api/bookmarks/check` | GET | Check if a question is bookmarked (`?userId=1&questionId=42`) |
| `/api/bookmarks/:id` | DELETE | Remove a bookmark |

---

## 🗺️ Roadmap

- [ ] Swipe gestures (left/right) on feed cards
- [ ] Tags & topic filters
- [ ] Answer posting from the feed
- [ ] Push notifications for new answers
- [ ] Dark mode toggle
- [ ] PWA / installable app

Have an idea? [Open an issue](https://github.com/rmankkar/stackscroll/issues/new) — we're shipping fast.

---

## 🤝 Contributing

StackScroll is open to contributions. Fork the repo, create a branch, and send a PR:

```bash
git checkout -b feat/your-feature
git commit -m "feat: describe your change"
git push origin feat/your-feature
```

Please keep commits conventional (`feat:`, `fix:`, `chore:`) and update this README when you ship user-facing changes.

---

## 📄 License

MIT — build on it, break it, remix it.

---

**Made with ❤️ and a lot of ☕ by [rmankkar](https://github.com/rmankkar)**

`StackScroll v1.1.0 — Swipe. Read. Repeat.`
