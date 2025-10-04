# Profile Collection Feature

## Overview

After GitHub OAuth authentication, users are now required to complete their profile with additional information:

- **Full Name** (required)
- **College/University** (required) 
- **Year of Study** (required)
- **Instructor/Professor** (optional)

## How It Works

### 1. OAuth Flow
1. User clicks "Sign in with GitHub"
2. GitHub OAuth completes
3. Backend checks if user has completed profile
4. **If profile incomplete:** Redirect to `/register`
5. **If profile complete:** Redirect to success page

### 2. Profile Collection
- New page: `/register` 
- Shows user's GitHub info (avatar, username)
- Form to collect additional details
- Validates required fields
- Saves to Supabase `users` table

### 3. Database Changes
New columns added to `users` table:
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS college TEXT,
ADD COLUMN IF NOT EXISTS year TEXT,
ADD COLUMN IF NOT EXISTS instructor TEXT;
```

## API Endpoints

### GET `/auth/me`
Returns current logged-in user info (already existed)

### POST `/user/profile`
Updates user profile with additional fields:
```json
{
  "full_name": "John Doe",
  "college": "Example University", 
  "year": "3rd Year",
  "instructor": "Dr. Smith"
}
```

### Updated `/auth/github/callback`
Now checks if user profile is complete and redirects accordingly.

## Files Added/Modified

### Frontend
- **NEW:** `/client/src/pages/register.astro` - Profile collection form
- **Modified:** None (navbar unchanged for now)

### Backend  
- **Modified:** `/server/index.js` - Added profile endpoint, updated OAuth callback
- **NEW:** `/server/add_profile_fields.sql` - Database migration

## Setup Instructions

### 1. Database Migration
Run this SQL in your Supabase SQL editor:
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS college TEXT,
ADD COLUMN IF NOT EXISTS year TEXT,
ADD COLUMN IF NOT EXISTS instructor TEXT;
```

### 2. Deploy Changes
- Backend: Railway will auto-deploy when you push
- Frontend: Vercel will auto-deploy when you push

### 3. Test Flow
1. Go to your site and sign in with GitHub
2. New users will be redirected to `/register`
3. Fill out the form and submit
4. Should redirect to leaderboard
5. Existing users with complete profiles go directly to success page

## User Experience

### First-time Users
1. Click "Sign in with GitHub"
2. Authorize GitHub access
3. **Redirected to `/register`** (new step)
4. Fill out profile form
5. Click "Complete Profile"
6. Success message and redirect to leaderboard

### Returning Users
1. Click "Sign in with GitHub" 
2. Authorize GitHub access
3. **Directly to login success** (profile already complete)

## Error Handling

- **Not logged in:** Redirect to `/login`
- **API errors:** Show error message, keep form active
- **Missing required fields:** Browser validation prevents submit
- **Database errors:** Graceful error handling with retry option

## Future Enhancements

Could add:
- Profile edit page for users to update info later
- Admin view to see user profiles
- Export user data for analytics
- Additional fields as needed

## Testing

To test the profile collection:
1. Clear your browser cookies/session
2. Sign in with a new GitHub account
3. Verify you're redirected to `/register`
4. Complete the form
5. Verify redirect to leaderboard
6. Sign out and sign in again
7. Verify you skip `/register` the second time