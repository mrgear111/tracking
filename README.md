# GITGOTPR - PR Tracker

Track pull requests for October 2025 open source activity.

## What it does

- Login with GitHub
- Tracks your PRs from Oct 1-31, 2025
- Shows leaderboard of contributors
- Admin dashboard for monitoring

## Live site

https://gitgopr.nstsdc.org

## Setup

### Frontend (Astro)
```bash
cd client
npm install
npm run dev
```

### Backend (Node.js)
```bash
cd server  
npm install
npm start
```

## Environment vars

### Server (.env)
- `GITHUB_CLIENT_ID` - OAuth app ID
- `GITHUB_CLIENT_SECRET` - OAuth secret  
- `GITHUB_TOKEN` - Personal access token
- `SUPABASE_URL` - Database URL
- `SUPABASE_ANON_KEY` - Database key
- `SESSION_SECRET` - Session encryption
- `ADMIN_PASSWORD` - Admin access
- `CLIENT_ORIGIN` - Frontend URL

### Client (.env)  
- `PUBLIC_API_BASE_URL` - Backend URL

## Database

Uses Supabase. Run this SQL:

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS college TEXT,
ADD COLUMN IF NOT EXISTS year TEXT,
ADD COLUMN IF NOT EXISTS instructor TEXT;
```

## Features

- GitHub OAuth login
- Profile collection (name, college, year, role)
- PR count tracking (merged PRs only)
- Leaderboard with filtering
- Admin dashboard
- Auto refresh every hour
- Manual refresh button

## Tech stack

- Frontend: Astro + Tailwind
- Backend: Express + Passport
- Database: Supabase
- Deploy: Vercel + Railway

Made for NSTSDC dev club.