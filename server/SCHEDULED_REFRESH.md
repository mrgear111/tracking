# Automatic PR Refresh with Scheduled Jobs

## Overview

The system now automatically refreshes ALL users' PR counts every hour using a background scheduled job. No webhook configuration needed!

## How It Works

### Scheduled Job
- **Runs every hour** at minute 0 (e.g., 1:00 PM, 2:00 PM, 3:00 PM)
- **Refreshes all users** in the database automatically
- **No manual setup required** - works immediately after deployment
- **Rate-limited** - 2-second delay between users to respect GitHub API limits

### On Server Startup
- Server also runs a refresh **5 seconds after starting**
- Ensures data is fresh when the app first boots up
- Useful after deployments or restarts

## What Gets Updated

For each user in the database:
1. Fetches their latest PRs from GitHub (Oct 1 - Dec 31, 2025)
2. Updates their PR count in the database
3. Stores all PR details (title, URL, state, merged status)
4. Updates the `last_updated` timestamp

## Benefits

✅ **Zero configuration** - No webhooks to set up in GitHub repos  
✅ **Works for all users** - Refreshes everyone automatically  
✅ **Works for all repos** - No need to configure individual repositories  
✅ **Simple & reliable** - Just runs every hour like clockwork  
✅ **Rate-limited** - Won't hit GitHub API limits  

## Monitoring

Check Railway logs to see the refresh in action:

```bash
railway logs --follow
```

Look for:
```
🔄 Starting scheduled PR refresh for all users...
Refreshing PR data for 5 users...
  → Refreshing user1...
  → Refreshing user2...
  → Refreshing user3...
✅ Scheduled PR refresh completed!
```

## Schedule

The cron job uses this pattern: `0 * * * *`

- `0` = Minute 0
- `*` = Every hour
- `*` = Every day
- `*` = Every month
- `*` = Every day of week

**Translation:** Runs at the start of every hour (12:00, 1:00, 2:00, etc.)

### Customizing the Schedule

To change the frequency, edit the cron pattern in `index.js`:

```javascript
// Every 30 minutes
cron.schedule('*/30 * * * *', refreshAllUsersPRs);

// Every 2 hours
cron.schedule('0 */2 * * *', refreshAllUsersPRs);

// Every 15 minutes
cron.schedule('*/15 * * * *', refreshAllUsersPRs);

// At 9 AM every day
cron.schedule('0 9 * * *', refreshAllUsersPRs);
```

## GitHub API Rate Limits

- **Authenticated requests:** 5,000/hour
- **Each user refresh:** ~1-5 requests (depending on PR count)
- **Current setup:** 5 users × 5 requests = 25 requests/hour
- **Plenty of headroom** for growth!

With 2-second delays between users:
- 5 users = ~10 seconds total refresh time
- Very fast and efficient!

## Manual Refresh

Users can still trigger a manual refresh by:
1. Logging out
2. Logging back in

This will immediately fetch their latest PR data without waiting for the hourly job.

## Troubleshooting

### PRs not updating?

1. Check if the cron job is running:
   ```bash
   railway logs | grep "Starting scheduled PR refresh"
   ```

2. Check for errors during refresh:
   ```bash
   railway logs | grep "Error"
   ```

3. Verify GitHub token is valid:
   - Check `GITHUB_TOKEN` in Railway environment variables
   - Token needs `repo` and `read:user` permissions

### Want to run refresh manually?

The refresh runs automatically, but you can also trigger it by:
- Restarting the Railway service
- It will run 5 seconds after startup

## Comparison with Webhooks

| Feature | Scheduled Job (Current) | Webhooks |
|---------|------------------------|----------|
| Setup complexity | ✅ None | ❌ High (configure each repo) |
| Update speed | ⚠️ Up to 1 hour delay | ✅ Instant |
| Maintenance | ✅ None | ❌ Must maintain for each repo |
| Works for all repos | ✅ Yes | ❌ Only configured ones |
| API usage | ✅ Predictable | ⚠️ Varies by activity |

## Why This Approach?

You chose this because:
- ✅ You don't want to configure webhooks for every user's repository
- ✅ Hourly updates are good enough for your use case
- ✅ Simple, zero-maintenance solution
- ✅ Works automatically for all users and all repos

Perfect for a leaderboard that doesn't need real-time updates!
