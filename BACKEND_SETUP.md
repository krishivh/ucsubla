# UCSubLA — Backend Setup Guide

## What's been added

| Feature | Before | Now |
|---|---|---|
| Listings | `mockData.ts` + `localStorage` | Postgres via `/api/listings` |
| Bookmarks | `mockUser.bookmarks` (in-memory) | Supabase `bookmarks` table, per user |
| Messaging | `mockConversations` (in-memory) | Supabase `conversations` + `messages` tables, 3s polling |
| Auth | Fake redirect | Supabase magic link (UCLA email only) |
| Images | Local file previews | Supabase Storage bucket |
| Auth guard | None | Middleware redirects protected routes to `/login` |

---

## 1. Create a Supabase project

1. Go to https://supabase.com and create a free project
2. Choose a region close to LA (e.g., US West)
3. Save your **project URL** and **anon key** (Settings → API)

---

## 2. Run the database schema

1. In your Supabase dashboard, open **SQL Editor**
2. Paste the contents of `supabase/schema.sql` and click **Run**

---

## 3. Create the Storage bucket

In Supabase dashboard → **Storage** → **New bucket**:
- Name: `listing-images`
- Public: ✅ (checked)

Then in **Storage → Policies**, add these policies for `listing-images`:
- **SELECT**: `true` (anyone can read)
- **INSERT**: `auth.role() = 'authenticated'` (logged-in users can upload)
- **DELETE**: `auth.uid()::text = (storage.foldername(name))[1]` (only uploader)

Or just paste and run the commented-out storage SQL at the bottom of `schema.sql`.

---

## 4. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 5. Configure Supabase Auth

In Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3003`
- **Redirect URLs**: `http://localhost:3003/auth/callback`

> For production (Vercel etc.), add your deployed URL here too.

---

## 6. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3003

---

## How it works end-to-end

### Auth flow
1. User enters `@ucla.edu` email on `/login`
2. Supabase sends a magic link email
3. User clicks link → `/auth/callback` exchanges code for session
4. Supabase trigger auto-creates a `profiles` row; `verified_ucla = true` for UCLA emails

### Listing creation
1. User fills out `/listing/new` form
2. Images uploaded to Supabase Storage via `/api/upload`
3. Listing saved to `listings` table via `POST /api/listings`
4. RLS ensures only the creator can edit/delete

### Messaging
1. User taps **Message** on a listing detail page → modal appears
2. `POST /api/conversations` creates conversation + first message
3. `/messages` page lists all conversations for the current user
4. Chat view polls `/api/conversations/[id]/messages` every 3s for new messages
5. Messages are marked read when the other party opens the chat

### Bookmarks
1. Bookmark toggle calls `POST/DELETE /api/bookmarks` with optimistic UI update
2. On page load, `/api/bookmarks` returns all bookmarked listing IDs
3. Bookmarks page fetches the full listing data for each saved ID

---

## File structure added

```
lib/
  supabase/
    client.ts        # browser Supabase client
    server.ts        # server/API route client
    mappers.ts       # DB row ↔ app type converters
  hooks/
    useAuth.tsx      # AuthProvider + useAuth hook
    useBookmarks.ts  # bookmark toggle with optimistic update
    useListings.ts   # fetch/create/delete listings
    useMessages.ts   # conversations + real-time polling

app/
  api/
    listings/route.ts          # GET all, POST create
    listings/[id]/route.ts     # GET one, DELETE, PATCH
    listings/mine/route.ts     # GET current user's listings
    bookmarks/route.ts         # GET, POST, DELETE
    conversations/route.ts     # GET list, POST create
    conversations/[id]/messages/route.ts  # GET, POST
    upload/route.ts            # POST image to Storage
  auth/callback/route.ts       # Magic link exchange

middleware.ts        # Auth guard for protected routes
supabase/schema.sql  # Full Postgres schema + RLS policies
```
