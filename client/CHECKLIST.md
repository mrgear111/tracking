# Vercel Deployment Checklist

## Before Deployment

- [ ] Backend server is deployed and accessible
- [ ] Backend URL is noted down (e.g., https://your-backend.railway.app)
- [ ] GitHub OAuth app callback URL updated to backend URL
- [ ] Code pushed to GitHub repository

## Vercel Setup

- [ ] Vercel account created
- [ ] Repository imported to Vercel
- [ ] Root directory set to `client`
- [ ] Framework preset set to "Astro"
- [ ] Environment variable `PUBLIC_API_URL` added with backend URL

## Backend Configuration

- [ ] CORS updated to allow Vercel domain
- [ ] Session cookie settings configured for production
- [ ] Admin password set in backend environment variables
- [ ] Supabase credentials configured

## Post-Deployment Testing

- [ ] Visit your Vercel URL
- [ ] Test GitHub login
- [ ] Verify user data appears in Supabase
- [ ] Test admin dashboard (/admindashboard)
- [ ] Check browser console for any errors
- [ ] Verify PR fetching works

## Optional

- [ ] Custom domain added in Vercel
- [ ] DNS configured for custom domain
- [ ] SSL certificate verified
- [ ] Backend updated to allow custom domain in CORS

---

**Need help?** Check `DEPLOYMENT.md` for detailed instructions.
