# Vercel Deployment Guide

This guide will help you deploy your Astro frontend to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- Your backend server deployed and accessible (e.g., Railway, Render, Heroku)
- Git repository pushed to GitHub

## Quick Deploy

### Option 1: Deploy via Vercel Dashboard

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the `client` folder as the root directory

3. **Configure Build Settings**
   - Framework Preset: **Astro**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Root Directory: `client`

4. **Set Environment Variables**
   - Click "Environment Variables"
   - Add the following:
     - `PUBLIC_API_URL` = Your backend server URL (e.g., `https://your-backend.railway.app`)

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from the client directory**
   ```bash
   cd client
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? `your-project-name`
   - In which directory is your code located? `./`
   - Want to override the settings? **N**

5. **Set Environment Variables**
   ```bash
   vercel env add PUBLIC_API_URL
   ```
   Enter your backend URL when prompted.

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Environment Variables

You need to set the following environment variable in Vercel:

| Variable | Description | Example |
|----------|-------------|---------|
| `PUBLIC_API_URL` | Your backend server URL | `https://your-backend.railway.app` |

## Post-Deployment

### Update Backend CORS Settings

Make sure your backend server allows requests from your Vercel domain:

```javascript
// In server/index.js
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:4321',
    'https://your-vercel-domain.vercel.app', // Add this
    'https://your-custom-domain.com'          // If you have one
  ],
  credentials: true
}));
```

### Update GitHub OAuth Callback URL

Add your Vercel domain to GitHub OAuth App settings:

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Select your app
3. Add to "Authorization callback URL":
   - `https://your-backend-url/auth/github/callback`

### Custom Domain (Optional)

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Troubleshooting

### Build Fails

- Check build logs in Vercel Dashboard
- Verify all dependencies are in `package.json`
- Make sure `@astrojs/vercel` is installed

### API Requests Fail

- Verify `PUBLIC_API_URL` is set correctly in Vercel environment variables
- Check browser console for CORS errors
- Ensure backend allows requests from Vercel domain

### Authentication Issues

- Verify GitHub OAuth callback URL includes your backend URL
- Check that cookies are properly configured with `credentials: 'include'`
- Ensure backend has correct CORS settings with `credentials: true`

## Automatic Deployments

Vercel automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically build and deploy your changes!

## Local Development

To test with production environment variables locally:

```bash
# Create .env file
echo "PUBLIC_API_URL=https://your-backend-url" > .env

# Run dev server
npm run dev
```

## Useful Commands

```bash
# View deployment logs
vercel logs

# List all deployments
vercel ls

# Promote deployment to production
vercel promote <deployment-url>

# Remove deployment
vercel rm <deployment-url>
```

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Astro Deployment Guide](https://docs.astro.build/en/guides/deploy/vercel/)
