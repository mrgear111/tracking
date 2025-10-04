# Quick Start: GitHub Webhook Setup

## Your Webhook Secret
```
03eff28c77d2d126cc24d39e9e2a87d7910af43a53e3cb15df26045bd0e0b6f4
```

## Step 1: Add to Railway (5 minutes)

1. Go to: https://railway.app/project/your-project
2. Click your service → Variables tab
3. Click "New Variable"
4. Add:
   - **Name:** `GITHUB_WEBHOOK_SECRET`
   - **Value:** `03eff28c77d2d126cc24d39e9e2a87d7910af43a53e3cb15df26045bd0e0b6f4`
5. Wait for deployment to finish (~1 min)

## Step 2: Configure GitHub Webhook (5 minutes)

For each repository you want to track:

1. Go to: `https://github.com/your-org/your-repo/settings/hooks`
2. Click "Add webhook"
3. Fill in:
   - **Payload URL:** `https://tracking-production-0c48.up.railway.app/webhook/github`
   - **Content type:** `application/json`
   - **Secret:** `03eff28c77d2d126cc24d39e9e2a87d7910af43a53e3cb15df26045bd0e0b6f4`
   - **Events:** Check "Pull requests" only
4. Click "Add webhook"

## Step 3: Test It! (2 minutes)

1. Create or close a PR in the configured repo
2. Check Railway logs: `railway logs`
3. Look for: `Webhook: PR opened/closed by username`
4. Refresh leaderboard - PR count should update automatically!

## What Happens Now?

✅ **Before:** Users had to log out and log back in to refresh their PR counts

✅ **After:** PR counts update automatically whenever:
   - A PR is opened
   - A PR is closed
   - A PR is merged
   - A PR is reopened

## Organization-Wide Setup (Optional)

To track all repos in your org:

1. Go to: `https://github.com/organizations/your-org/settings/hooks`
2. Add webhook with the same settings above
3. Now ALL repos in the org will trigger updates!

## Troubleshooting

**Webhook not triggering?**
- Check GitHub Settings → Webhooks → Recent Deliveries
- Green checkmark = Success
- Red X = Failed (click to see error)

**Still having issues?**
- See detailed guide: `WEBHOOK_SETUP.md`
- Check Railway logs: `railway logs`

## Security Note

⚠️ Keep the webhook secret secure! Never commit it to your repository.
