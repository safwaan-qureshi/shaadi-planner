# 🌹 Shaadi Planner

A modern, full-featured Pakistani wedding planning application built with React, Supabase, and Tailwind CSS.

---

## ✨ Features

| Page | Features |
|------|----------|
| **Dashboard** | Wedding countdown, stats overview, upcoming tasks, event list, budget summary, vendor confirmations |
| **Events** | Create & manage Mayoon, Mehndi, Barat, Walima, Bachelor Trip, Honeymoon Trip |
| **Vendors** | Add vendors with category, contact, pricing, deposit, booking status |
| **Guests** | Guest list with RSVP tracking, event assignments, search & filter |
| **Budget** | Set total budget, track expenses, category breakdown, paid/unpaid tracking |
| **Tasks** | Task management with priority, assignment, deadline, status tracking |
| **Family** | Family collaboration with roles: Bride, Groom, Planner, Coordinator, Finance |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd shaadi-planner
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Note:** The app works in **demo mode** without Supabase. All data is seeded locally. To persist data, connect Supabase (see below).

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Choose your organisation, give it a name (e.g. `shaadi-planner`), set a strong database password, and select a region close to your users (e.g. `ap-south-1` for Pakistan)
4. Wait ~2 minutes for the project to spin up

### Step 2: Get Your Credentials

1. In your project, go to **Settings → API**
2. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### Step 3: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Paste the entire contents of `supabase-schema.sql`
4. Click **"Run"**

This creates all tables, relationships, RLS policies, and triggers.

### Step 4: Connect the App to Supabase

Update `src/context/AppContext.jsx` — replace the in-memory CRUD helpers with actual Supabase calls. Example for events:

```javascript
// In AppContext.jsx, replace the addEvent helper:
const addEvent = async (evt) => {
  const { data, error } = await supabase
    .from('events')
    .insert([evt])
    .select()
    .single()
  if (!error) setEvents(p => [...p, data])
}
```

The Supabase client is already set up in `src/lib/supabase.js`.

---

## 🌐 Deploying to Vercel

### Option A: Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts. When asked:
- Framework: **Vite**
- Build command: `npm run build`
- Output directory: `dist`

Then add your environment variables:
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

Redeploy:
```bash
vercel --prod
```

### Option B: Via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **"New Project"**
3. Import your GitHub repository
4. Vercel auto-detects Vite — leave defaults
5. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **"Deploy"**

Your app will be live at `https://your-project.vercel.app`

---

## 📁 Project Structure

```
shaadi-planner/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx      # Main layout wrapper
│   │   │   ├── Sidebar.jsx     # Navigation sidebar
│   │   │   └── Header.jsx      # Top header bar
│   │   └── ui/
│   │       ├── Modal.jsx       # Reusable modal
│   │       ├── Badge.jsx       # Status badges
│   │       ├── EmptyState.jsx  # Empty state component
│   │       └── ConfirmDialog.jsx
│   ├── context/
│   │   └── AppContext.jsx      # Global state & data
│   ├── lib/
│   │   └── supabase.js         # Supabase client
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Events.jsx
│   │   ├── Vendors.jsx
│   │   ├── Guests.jsx
│   │   ├── Budget.jsx
│   │   ├── Tasks.jsx
│   │   └── Family.jsx
│   ├── App.jsx                 # Router & routes
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── supabase-schema.sql         # Full DB schema
├── .env.example
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🔧 Tech Stack

- **React 18** — UI framework
- **React Router v6** — Client-side routing
- **Tailwind CSS 3** — Utility-first styling
- **Supabase** — PostgreSQL database + auth + real-time
- **Vite** — Build tool & dev server
- **date-fns** — Date formatting
- **Lucide React** — Icons

---

## 🚀 Next Steps (Post-MVP)

- [ ] Connect all CRUD operations to Supabase (currently runs on demo data)
- [ ] Add Supabase Auth (email/password login for family collaboration)
- [ ] Real-time updates with Supabase Realtime subscriptions
- [ ] WhatsApp integration for guest invitations
- [ ] Photo gallery / mood board per event
- [ ] Export guest list to Excel/PDF
- [ ] SMS/email reminders for tasks
- [ ] Multi-wedding support (separate shaadi instances)
- [ ] Mobile app via Capacitor

---

## 📄 License

MIT — free to use and modify.

---

*Made with ❤️ for Pakistani wedding families — wherever you are in the world.*
