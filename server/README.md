# Auth server (GitHub OAuth)

This small Express server implements GitHub OAuth using passport-github2. It provides routes:

- GET /auth/github -> start OAuth
- GET /auth/github/callback -> OAuth callback
- GET /auth/me -> return authenticated user info
- GET /auth/logout -> log out

Setup

1. Copy `.env.example` to `.env` and fill in the values. You must register an OAuth app on GitHub and set the callback URL to `http://localhost:4000/auth/github/callback` (or your deployed URL).

2. Install dependencies and run the server:

```bash
cd server
npm install
npm run dev
```

3. The client should be served from `CLIENT_ORIGIN` (default `http://localhost:3000`). The client will call `/auth/me` to detect session state and link to `/auth/github` to sign in.
