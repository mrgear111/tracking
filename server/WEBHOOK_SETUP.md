# GitHub Webhook Setup

This guide explains how to set up GitHub webhooks for automatic PR count updates.

## Overview

GitHub webhooks allow the system to receive real-time notifications when PRs are opened, closed, or merged. This eliminates the need for users to log in again to refresh their PR counts.

## Setup Steps

### 1. Generate a Webhook Secret

First, generate a secure random string for webhook verification:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy this value - you'll need it for both GitHub and your environment variables.

### 2. Add Environment Variable

Add the webhook secret to your server environment:

**Local Development (.env file):**
```env
GITHUB_WEBHOOK_SECRET=your_generated_secret_here
```

**Railway Production:**
1. Go to your Railway project dashboard
2. Click on your service
3. Go to Variables tab
4. Add new variable:
   - Name: `GITHUB_WEBHOOK_SECRET`
   - Value: `your_generated_secret_here`
5. Click "Deploy"

### 3. Configure GitHub Repository Webhook

For **each repository** you want to track:

1. Go to the repository on GitHub
2. Click Settings → Webhooks → Add webhook

3. Configure the webhook:
   - **Payload URL:** `https://tracking-production-0c48.up.railway.app/webhook/github`
   - **Content type:** `application/json`
   - **Secret:** (paste your generated secret from step 1)
   - **Which events:** Select "Let me select individual events"
     - ✅ Check "Pull requests"
     - ✅ Uncheck everything else
   - **Active:** ✅ Checked

4. Click "Add webhook"

5. Test the webhook:
   - GitHub will send a ping event immediately
   - Check "Recent Deliveries" tab to see if it succeeded (green checkmark)

### 4. Configure Organization-Wide Webhook (Optional)

If you have many repositories, you can set up an organization-wide webhook:

1. Go to your GitHub Organization page
2. Click Settings → Webhooks → Add webhook
3. Use the same configuration as above
4. This will apply to all repositories in the organization

## How It Works

1. **PR Event Occurs:** User opens, closes, or merges a PR
2. **GitHub Sends Webhook:** GitHub sends a POST request to your webhook endpoint
3. **Verification:** Server verifies the webhook signature using the secret
4. **Check User:** Server checks if the PR author exists in the database
5. **Refresh Data:** If user exists, server fetches their latest PR data from GitHub
6. **Update Database:** Server updates the PR count and data in Supabase
7. **Real-Time Update:** Leaderboard shows updated counts immediately (no login needed)

## Events Handled

The webhook listens for these `pull_request` events:
- `opened` - When a PR is created
- `closed` - When a PR is closed or merged
- `reopened` - When a PR is reopened
- `synchronize` - When commits are pushed to the PR

## Security

- Webhook signature verification ensures requests come from GitHub
- Only PRs from users in the database are processed
- Invalid signatures are rejected with 401 status

## Testing

### Test with a Real PR:

1. Create or close a PR in a configured repository
2. Check your Railway logs: `railway logs`
3. Look for: `Webhook: PR opened/closed by <username>`
4. Verify the leaderboard updates without refreshing

### Test Webhook Delivery on GitHub:

1. Go to repository Settings → Webhooks
2. Click on your webhook
3. Go to "Recent Deliveries" tab
4. Click on any delivery to see:
   - Request headers
   - Request payload
   - Response status
5. Click "Redeliver" to test again

## Troubleshooting

### Webhook Not Triggering:

1. Check "Recent Deliveries" on GitHub:
   - Red X = Failed delivery
   - Check response code and error message

2. Verify webhook URL is correct:
   - Should be: `https://tracking-production-0c48.up.railway.app/webhook/github`
   - Note: No trailing slash

3. Check Railway logs for errors:
   ```bash
   railway logs
   ```

### Signature Verification Failing:

1. Verify `GITHUB_WEBHOOK_SECRET` matches in:
   - GitHub webhook configuration
   - Railway environment variables

2. Secret must be **exactly** the same (no extra spaces/newlines)

### PR Count Not Updating:

1. Check if user exists in database:
   - Only registered users' PRs are tracked
   - User must have logged in at least once

2. Check Railway logs for:
   - "User not found in database" message
   - Any error messages during PR refresh

3. Verify date range:
   - PRs must be created between Oct 1 - Dec 31, 2025

## Alternative: Manual Refresh

If webhooks aren't working, users can still refresh their data by logging out and logging back in.

## Monitoring

Monitor webhook activity in Railway logs:
```bash
railway logs --follow
```

Look for:
- `Webhook: PR <action> by <username>` - Webhook received
- `Refreshing PR data for <username>...` - Starting refresh
- `Found X PRs for <username>` - PRs fetched from GitHub
- `Successfully refreshed PR data for <username>` - Update complete

## Rate Limits

GitHub API rate limits:
- Authenticated: 5,000 requests/hour
- Each webhook refresh = ~1-5 requests (depending on PR count)
- Should be plenty for most use cases
