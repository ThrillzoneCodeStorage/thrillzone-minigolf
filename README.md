# 🏌️ Thrillzone Mini Golf Scorecard

Full-featured digital scorecard for Thrillzone Escape Quest's mini golf course.

## What's included

| Feature | Notes |
|---|---|
| 4 play styles | Casual, Competitive (turn-by-turn), Silly (spin wheel), Just for Fun |
| 17 stations | 9 holes + 8 challenges, drag-to-reorder in admin |
| Score entry | Large +/− buttons per player, skip any hole and return later |
| 24h session recovery | Device code saved to localStorage — reopening resumes the game |
| Silly mode wheel | Animated spin wheel with 10 default effects, all editable in admin |
| Competitive mode | Per-player turn indicator with "Next →" button |
| Selfie → Polaroid | Opens front camera, composites photo with Thrillzone logo + date |
| Photo gallery | Carousel view of all Polaroids taken during the round |
| Live leaderboard strip | Bottom bar on every hole showing avg strokes/hole |
| Leaderboard opt-out | Keeps score data but hides group from TV display |
| End screen | Final standings table, full scorecard, email form |
| Email delivery | Sends HTML scorecard + Polaroid photos via Resend |
| TV leaderboard `/leaderboard` | Full-screen display: Live / Today / This Week / All Time tabs |
| Rotating Polaroids | TV background cycles through photos taken by players |
| Admin panel `/admin` | Password login, hole editor, spinner editor, live groups, settings |
| Real-time sync | Supabase subscriptions keep TV board live without refresh |

---

## Setup (5 steps)

### 1 — Supabase project

1. [supabase.com](https://supabase.com) → New Project → choose **Sydney** region
2. Dashboard → **SQL Editor** → paste `supabase-schema.sql` → **Run**

> ⚠️ Before running, change the admin password on this line:
> ```sql
> INSERT INTO admin_settings (key, value) VALUES ('admin_password', 'YOUR_PASSWORD_HERE')
> ```

3. Dashboard → **Storage** → confirm the `photos` bucket was created (the schema does this automatically)
4. Dashboard → **Database** → **Replication** → enable `scores` and `sessions` tables for Realtime

### 2 — Environment variables

```bash
cp .env.example .env
```

Fill in `.env` with values from **Supabase → Settings → API**:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3 — Run locally

```bash
npm install
npm run dev
```

| URL | Purpose |
|---|---|
| `localhost:5173` | Player scorecard |
| `localhost:5173/leaderboard` | TV leaderboard |
| `localhost:5173/admin` | Admin panel |

### 4 — Email via Resend

1. [resend.com](https://resend.com) → sign up (free: 100 emails/day)
2. Add + verify your domain (e.g. `thrillzone.co.nz`)
3. Create an API key

4. Install Supabase CLI:
   ```bash
   npm i -g supabase
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   *(Project ref is in Supabase → Settings → General)*

5. Set the secret:
   ```bash
   supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
   ```

6. Edit the from-address in `supabase/functions/send-email/index.ts`:
   ```ts
   const FROM_EMAIL = 'Thrillzone Mini Golf <minigolf@thrillzone.co.nz>'
   ```

7. Deploy:
   ```bash
   supabase functions deploy send-email
   ```

### 5 — Deploy to production

**Vercel (recommended — free):**
1. Push this repo to GitHub
2. [vercel.com](https://vercel.com) → Import → select the repo
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy → done!

Your live URLs will be `https://your-project.vercel.app` + `/leaderboard` + `/admin`

---

## TV leaderboard

1. On the room TV, open Chrome
2. Go to `https://your-domain.com/leaderboard`
3. Press **F11** for fullscreen
4. Tabs auto-rotate every 12 seconds: Live → Today → This Week → All Time
5. Polaroid photos from players scroll as background
6. Real-time — updates the moment a score is saved

---

## Admin panel

Login at `/admin` with the password set in the SQL schema.

| Tab | What you can do |
|---|---|
| **⛳ Holes** | Add / edit / delete stations. **Drag rows to reorder** — changes take effect immediately for all new games |
| **🎰 Spinner** | Add / edit / toggle silly-mode wheel effects |
| **👥 Groups** | See who's playing right now, their scores, elapsed time, which hole they're on. Recent completed games below |
| **⚙️ Settings** | Change the admin password |

---

## Player flow

```
Open app
│
├─ Choose play style
│   Casual · Competitive · Silly · Just for Fun
│
├─ Leaderboard opt-in / opt-out
│
├─ Enter player names (1–8 players)
│
└─ Play 17 stations
    ├─ Score each player with +/− buttons
    ├─ Navigate freely — skip forward, go back
    ├─ [📷] Photo button → selfie → Polaroid frame → gallery
    ├─ [Silly] Spin the wheel after each station
    ├─ [Competitive] Turn indicator per player
    └─ Finish!
        ├─ Final standings + full scorecard table
        ├─ Email scorecard + all Polaroids
        └─ Play again
```

---

## Session recovery

A unique code (`tz_<timestamp>_<random>`) is written to `localStorage` when the first score is entered. If the player closes the tab or phone screen, reopening the URL within **24 hours** automatically resumes from the exact hole they were on — scores and photos intact.

---

## Customising

**Holes** — all editable in the admin panel. No code changes needed.

**Spinner effects** — editable in admin → Spinner tab.

**Logo** — replace `public/logo.png` with your own PNG. Transparent background recommended.

**Colours** — all in `src/index.css` under `:root { --accent-green ... }`.

**Play style rules** — text is in `src/components/HoleScreen/HoleScreen.jsx` in `RULES_MAP`, and `src/components/Onboarding/PlayStyleSelect.jsx` in `STYLES`.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Camera won't open on iPhone | iOS requires HTTPS. Use your Vercel URL, not localhost |
| Photos not uploading | Check the `photos` bucket exists in Supabase Storage with the RLS policy |
| Email not sending | Check Edge Function logs in Supabase → Edge Functions → send-email → Logs |
| TV board not live | Enable Realtime for `scores` + `sessions` in Supabase → Database → Replication |
| Admin login fails | Run the SQL schema again or check `admin_settings` table directly |

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v7 |
| Database + Auth | Supabase (PostgreSQL + RLS) |
| Real-time | Supabase Realtime subscriptions |
| Photo storage | Supabase Storage |
| Email | Resend via Supabase Edge Function (Deno) |
| Hosting | Vercel |
| Styling | Vanilla CSS custom properties — no framework |
