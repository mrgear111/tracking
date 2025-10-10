<h1 align="center">🚀 GIT GO PR — Pull Request Tracker</h1>



<p align="center">
  <b>Track your open-source pull requests during Hacktoberfest 2025 🌸</b><br/>
  Built with 💖 by the <a href="https://nstsdc.org">NSTSDC Dev Club</a>
</p>

<p align="center">
  <a href="https://gitgopr.nstsdc.org"><img src="https://img.shields.io/badge/Live%20Demo-Online-green?style=for-the-badge"></a>
  <img src="https://img.shields.io/badge/Built%20With-Astro%20%2B%20Express-blue?style=for-the-badge">
  <img src="https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white">
  <img src="https://img.shields.io/badge/Event-Hacktoberfest%202025-orange?style=for-the-badge">
</p>

---

## 🧠 Overview

GITGOTPR helps developers **track, visualize, and celebrate** their pull requests throughout **October 2025**.  
Log in with your GitHub account to see your PRs, leaderboard rank, and contribution stats in one dashboard.


## ⚙️ Features at a Glance

- Login with GitHub
- Tracks your PRs from Oct 1-31, 2025
- Shows leaderboard of contributors
- Admin dashboard for monitoring

## 🌍 Live Site

🔗 **Visit Now:** [gitgopr.nstsdc.org](https://gitgopr.nstsdc.org)

---

## 🖼️ Demo Preview

> 🪄 *See your PRs come alive — real-time tracking, leaderboard updates, and beautiful analytics dashboard.*
---
## ⚡ Setup

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

## 🔐 Environment Variables

### Server (.env)
- `GITHUB_CLIENT_ID`=OAuth app ID
- `GITHUB_CLIENT_SECRET`=OAuth secret  
- `GITHUB_TOKEN`=Personal access token
- `SUPABASE_URL`=Database URL
- `SUPABASE_ANON_KEY`=Database key
- `SUPABASE_SERVICE_ROLE_KEY`=Database Service Role key
- `SESSION_SECRET`=Session encryption
- `ADMIN_PASSWORD`=Admin access
- `CLIENT_ORIGIN`=Frontend URL

### Client (.env)  
- `PUBLIC_API_BASE_URL`=Backend URL



Uses [Supabase](https://supabase.io).  
Run this SQL to add extra user profile fields:

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS college TEXT,
ADD COLUMN IF NOT EXISTS year TEXT,
ADD COLUMN IF NOT EXISTS instructor TEXT;
```
---
## 🧰 Tech Stack

| Layer | Tools & Frameworks |
|-------|---------------------|
| 🌐 Frontend | [Astro](https://astro.build) + [TailwindCSS](https://tailwindcss.com) |
| ⚙️ Backend | [Express.js](https://expressjs.com) + [Passport.js](https://www.passportjs.org/) |
| 🗄️ Database | [Supabase](https://supabase.io) |
| ☁️ Deployment | [Vercel](https://vercel.com) + [Railway](https://railway.app) |

---

## 🤝 Contributing

Pull requests are welcome!  
If you'd like to improve the project, feel free to fork and submit a PR.

---

<p align="center">
  Made with ❤️ by <a href="https://nstsdc.org">NSTSDC Dev Club</a> | October 2025
</p>

<p align="center">
  <img src="https://media.giphy.com/media/du3J3cXyzhj75IOgvA/giphy.gif" width="150" alt="thank you gif">
</p>
