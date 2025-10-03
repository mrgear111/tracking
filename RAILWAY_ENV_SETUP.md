# Railway Environment Variables Setup

## Complete List of Environment Variables for Railway

Copy these to your Railway dashboard (Settings → Variables):

```bash
# Node Environment
NODE_ENV=production

# GitHub OAuth App Credentials
GITHUB_CLIENT_ID=<your_github_client_id>
GITHUB_CLIENT_SECRET=<your_github_client_secret>

# GitHub OAuth Callback (IMPORTANT: Also update in GitHub OAuth App settings)
GITHUB_CALLBACK_URL=https://tracking-production-0c48.up.railway.app/auth/github/callback

# GitHub Personal Access Token (for fetching PRs)
GITHUB_TOKEN=<your_github_personal_access_token>

# Session Secret (Generate a new secure one for production!)
SESSION_SECRET=<generate_secure_random_string>

# Frontend URLs (Update with your Vercel deployment URL)
CLIENT_ORIGIN=https://tracking-85fy.vercel.app
CLIENT_SUCCESS_REDIRECT=https://tracking-85fy.vercel.app/login?auth=success
CLIENT_LOGOUT_REDIRECT=https://tracking-85fy.vercel.app/login

# Supabase Configuration
SUPABASE_URL=<your_supabase_url>
SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>
SUPABASE_ANON_KEY=<your_supabase_anon_key>

# Admin Dashboard Password
ADMIN_PASSWORD=<your_admin_password>
```

## Important Steps:

### 1. Update GitHub OAuth App Settings
Go to: https://github.com/settings/developers
- Find your OAuth App
- Update **Authorization callback URL** to:
  ```
  https://tracking-production-0c48.up.railway.app/auth/github/callback
  ```

### 2. Add NODE_ENV=production
This is CRITICAL for CORS to work properly with cookies across domains.

### 3. Security Recommendations for Production

Generate a new secure SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. After updating Railway variables:
- Redeploy your Railway service
- The new CORS settings will allow your Vercel frontend to communicate with Railway backend

## Current Issue:
Your frontend (Vercel) is being blocked by CORS because:
- `CLIENT_ORIGIN` is not set to your Vercel URL
- `NODE_ENV` is not set to 'production'
- Cookie `sameSite` needs to be 'none' for cross-domain cookies in production

## Total Variables Count: 12
Make sure all 12 variables are set in Railway!

## Copy values from your local .env file
Get the actual values from `/server/.env` and paste them into Railway variables.
