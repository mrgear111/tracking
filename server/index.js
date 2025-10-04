import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import dotenv from 'dotenv';
import cors from 'cors';
import { supabase, createTablesManually } from './supabase.js';
import { storeUserAndPRs, refreshUserPRs } from './prService.js';
import cron from 'node-cron';

dotenv.config();

const app = express();

// Trust proxy when deployed (Railway, Vercel, etc.)
app.set('trust proxy', 1);

app.use(cors({ 
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000', 
  credentials: true 
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site cookies in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:4000/auth/github/callback',
}, async (accessToken, refreshToken, profile, done) => {
  // Store user and fetch PRs in background
  profile.accessToken = accessToken;
  
  // Store user and PRs in Supabase
  try {
    const result = await storeUserAndPRs(profile);
    if (result.success) {
      console.log(`Successfully stored data for ${profile.username || profile.login}`);
    }
  } catch (error) {
    console.error('Error storing user data:', error);
  }
  
  return done(null, profile);
}));

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/auth/failure' }), (req, res) => {
  // Redirect back to client app with a short-lived token or rely on session cookie
  res.redirect(process.env.CLIENT_SUCCESS_REDIRECT || 'http://localhost:3000/login?auth=success');
});

app.get('/auth/me', (req, res) => {
  if (!req.user) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true, user: req.user });
});

app.get('/auth/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect(process.env.CLIENT_LOGOUT_REDIRECT || 'http://localhost:3000/login');
  });
});

// GitHub Webhook endpoint for real-time PR updates
app.post('/webhook/github', express.json(), async (req, res) => {
  try {
    const event = req.headers['x-github-event'];
    const payload = req.body;

    // Verify webhook secret if configured
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers['x-hub-signature-256'];
      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', webhookSecret);
      const digest = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
      
      if (signature !== digest) {
        console.log('Invalid webhook signature');
        return res.status(401).send('Invalid signature');
      }
    }

    // Handle pull_request events
    if (event === 'pull_request') {
      const action = payload.action; // opened, closed, reopened, etc.
      const prAuthor = payload.pull_request?.user?.login;
      
      console.log(`Webhook: PR ${action} by ${prAuthor}`);
      
      // Update user's PR data if they exist in our system
      if (prAuthor) {
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('username', prAuthor)
          .single();
        
        if (user) {
          console.log(`Refreshing PR data for ${prAuthor}...`);
          // Import the refresh function
          const { refreshUserPRs } = await import('./prService.js');
          await refreshUserPRs(prAuthor);
        }
      }
    }

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing error');
  }
});

// Admin authentication middleware
function requireAdminAuth(req, res, next) {
  const adminPassword = req.headers['x-admin-password'] || req.query.adminPassword;
  
  if (adminPassword === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized - Invalid admin credentials' });
  }
}

// Admin routes - protected
app.get('/admin/users', requireAdminAuth, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('pr_count', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/admin/users/:userId/prs', requireAdminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data: prs, error } = await supabase
      .from('pull_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ prs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual refresh endpoint for admin
app.post('/admin/refresh-all', requireAdminAuth, async (req, res) => {
  try {
    console.log('🔄 Manual refresh triggered by admin...');
    
    // Get all users from database
    const { data: users, error } = await supabase
      .from('users')
      .select('username');
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    if (!users || users.length === 0) {
      return res.json({ message: 'No users to refresh', usersRefreshed: 0 });
    }
    
    // Refresh each user's PRs
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        console.log(`  → Refreshing ${user.username}...`);
        await refreshUserPRs(user.username);
        successCount++;
        
        // Small delay between users to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`  ✗ Error refreshing ${user.username}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`✅ Manual refresh completed! Success: ${successCount}, Errors: ${errorCount}`);
    
    res.json({ 
      message: 'Refresh completed',
      usersRefreshed: successCount,
      errors: errorCount,
      total: users.length
    });
  } catch (error) {
    console.error('Error in manual refresh:', error);
    res.status(500).json({ error: error.message });
  }
});

// Public leaderboard endpoint - shows users sorted by merged PR count
app.get('/leaderboard', async (req, res) => {
  try {
    // Get users with their merged PR counts
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, display_name, avatar_url, pr_count')
      .order('pr_count', { ascending: false });

    if (usersError) {
      return res.status(500).json({ error: usersError.message });
    }

    // Get merged PR counts for each user
    const leaderboard = await Promise.all(
      users.map(async (user) => {
        const { data: prs, error: prsError } = await supabase
          .from('pull_requests')
          .select('merged_at')
          .eq('user_id', user.id)
          .not('merged_at', 'is', null); // Only count PRs that have been merged

        const mergedCount = prs ? prs.length : 0;

        return {
          username: user.username,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          total_prs: user.pr_count,
          merged_prs: mergedCount
        };
      })
    );

    // Sort by merged PRs count (highest first)
    leaderboard.sort((a, b) => b.merged_prs - a.merged_prs);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/admin/stats', requireAdminAuth, async (req, res) => {
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, pr_count');

    const { data: prs, error: prsError } = await supabase
      .from('pull_requests')
      .select('state, merged_at');

    if (usersError || prsError) {
      return res.status(500).json({ error: usersError?.message || prsError?.message });
    }

    const totalUsers = users.length;
    const totalPRs = prs.length;
    const openPRs = prs.filter(pr => pr.state === 'open').length;
    const mergedPRs = prs.filter(pr => pr.merged_at !== null).length; // Only count actually merged PRs

    res.json({
      totalUsers,
      totalPRs,
      openPRs,
      mergedPRs,
      averagePRsPerUser: totalUsers > 0 ? (totalPRs / totalUsers).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => res.send('Auth server running'));

// Background job: Refresh all users' PR counts every hour
async function refreshAllUsersPRs() {
  console.log('🔄 Starting scheduled PR refresh for all users...');
  
  try {
    // Get all users from database
    const { data: users, error } = await supabase
      .from('users')
      .select('username');
    
    if (error) {
      console.error('Error fetching users for refresh:', error);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('No users to refresh');
      return;
    }
    
    console.log(`Refreshing PR data for ${users.length} users...`);
    
    // Refresh each user's PRs with a small delay to avoid rate limiting
    for (const user of users) {
      try {
        console.log(`  → Refreshing ${user.username}...`);
        await refreshUserPRs(user.username);
        
        // Small delay between users to be nice to GitHub API
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      } catch (error) {
        console.error(`  ✗ Error refreshing ${user.username}:`, error.message);
      }
    }
    
    console.log('✅ Scheduled PR refresh completed!');
  } catch (error) {
    console.error('Error in scheduled PR refresh:', error);
  }
}

// Schedule cron job to run every hour at minute 0
// Format: minute hour day month dayOfWeek
cron.schedule('0 * * * *', refreshAllUsersPRs, {
  scheduled: true,
  timezone: "America/New_York" // Adjust to your timezone if needed
});

console.log('⏰ Scheduled job: Refresh all users PRs every hour');

const port = process.env.PORT || 4000;
app.listen(port, async () => {
  console.log(`Auth server listening on http://localhost:${port}`);
  
  // Initialize database tables
  await createTablesManually();
  
  // Run initial refresh on startup (optional)
  console.log('Running initial PR refresh on startup...');
  setTimeout(() => refreshAllUsersPRs(), 5000); // Wait 5 seconds after startup
});
