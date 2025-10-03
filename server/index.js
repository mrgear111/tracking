import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import dotenv from 'dotenv';
import cors from 'cors';
import { supabase, createTablesManually } from './supabase.js';
import { storeUserAndPRs } from './prService.js';

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

app.get('/admin/stats', requireAdminAuth, async (req, res) => {
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, pr_count');

    const { data: prs, error: prsError } = await supabase
      .from('pull_requests')
      .select('state');

    if (usersError || prsError) {
      return res.status(500).json({ error: usersError?.message || prsError?.message });
    }

    const totalUsers = users.length;
    const totalPRs = prs.length;
    const openPRs = prs.filter(pr => pr.state === 'open').length;
    const mergedPRs = prs.filter(pr => pr.state === 'closed').length; // Assuming closed = merged for simplicity

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

const port = process.env.PORT || 4000;
app.listen(port, async () => {
  console.log(`Auth server listening on http://localhost:${port}`);
  
  // Initialize database tables
  await createTablesManually();
});
