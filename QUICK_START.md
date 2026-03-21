# BuildWire Frontend - Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- BuildWire backend server running on `http://localhost:5000`
- npm or yarn package manager

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file (already created):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Authentication Flow

### First Time User Flow

1. **Visit** `http://localhost:3000`
   - You'll be automatically redirected to `/login`

2. **Create Account** at `/signup`
   - Click "Sign up" link
   - Fill in required fields:
     - First Name & Last Name (min 2 characters each)
     - Email (valid email format)
     - Organization Name (min 3 characters)
     - Password (min 8 chars, must include number or special character)
     - Phone (optional)
   - Email availability is checked automatically on blur
   - Password strength indicator helps create secure passwords
   - Click "Create Account"

3. **Email Verification**
   - After registration, you're automatically logged in
   - You'll see a yellow banner asking to verify email
   - Check your email inbox for verification link
   - Click the link or use "Resend" button
   - After verification, banner disappears

4. **Access Dashboard**
   - Full access to all features after email verification
   - Your user info appears in the sidebar
   - Organization is automatically created

### Returning User Flow

1. **Login** at `/login`
   - Enter email and password
   - Optional: Check "Remember me for 30 days" for extended session
   - Click "Sign In"
   - Redirected to dashboard

2. **Forgot Password**
   - Click "Forgot password?" on login page
   - Enter email address
   - Check email for reset link
   - Create new password
   - Login with new credentials

## Features Implemented

### Authentication Pages
- `/login` - Login with email/password
- `/signup` - Registration with organization creation
- `/forgot-password` - Request password reset
- `/reset-password` - Set new password
- `/verify-email` - Email verification handler

### Security Features
- JWT access tokens (15 min expiry)
- Refresh tokens in HttpOnly cookies (24h or 30 days)
- Automatic token refresh on 401 errors
- Rate limiting protection (5 attempts in 15 min)
- Password requirements enforcement
- Email verification required for login
- CSRF protection with SameSite cookies

### Route Protection
- `ProtectedRoute` wraps the authenticated app shell (sidebar layout); feature routes are top-level (`/dashboard`, `/sales`, `/projects`, `/settings/...`, etc.)
- Unauthenticated users redirected to `/login`
- Authenticated users can't access auth pages
- Return URL preserved after login

### UI Components
- Modern, responsive design
- Dark/Light theme support
- Form validation with real-time feedback
- Password strength indicator
- Email availability checker
- Loading states and error handling
- Success/error alerts

### State Management
- Zustand store for auth state
- In-memory access token storage
- HttpOnly cookie for refresh token
- Persistent sessions with "Remember Me"

## Testing the Application

### Test User Registration

1. Go to `/signup`
2. Fill in the form with test data:
   ```
   First Name: Test
   Last Name: User
   Email: test@example.com
   Organization: Test Construction Co
   Password: TestPass123!
   ```
3. Submit and verify you're logged in
4. Check the email verification banner

### Test Login

1. Logout from the sidebar
2. Go to `/login`
3. Login with the credentials you just created
4. Verify redirection to `/dashboard` (org overview)

### Test Protected Routes

1. Logout
2. Try to access `/sales` or `/dashboard` directly
3. Verify you're redirected to `/login?returnUrl=...` (current path)
4. Login and verify you're redirected back to the requested URL

### Test Password Reset

1. Logout
2. Click "Forgot password?" on login page
3. Enter your email
4. Check email for reset link (if email service configured)

### Test Session Persistence

1. Login with "Remember me" checked
2. Close browser
3. Reopen and visit the site
4. Verify you're still logged in

## Troubleshooting

### "Failed to fetch" errors
- Ensure backend server is running on port 5000
- Check CORS is configured in backend
- Verify `.env.local` has correct API URL

### Redirect loops
- Clear cookies in browser
- Check middleware configuration
- Verify refresh token endpoint is working

### TypeScript errors
- Run `npm run build` to check for type errors
- Ensure all dependencies are installed

### Email verification not working
- Check backend email service configuration
- Verify CLIENT_URL in backend .env points to frontend URL
- Check email logs in backend console

## API Endpoints Used

All requests go through `/api/v1/auth/*`:

- `POST /register` - Create account
- `POST /login` - Authenticate user
- `POST /refresh` - Refresh access token
- `POST /logout` - End session
- `GET /me` - Get current user
- `GET /check-email` - Check email availability
- `GET /verify-email` - Verify email token
- `POST /resend-verification` - Resend verification
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password

## Production Deployment

Before deploying to production:

1. Update environment variables:
   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
   ```

2. Build for production:
   ```bash
   npm run build
   npm start
   ```

3. Ensure backend has:
   - Secure cookies enabled (NODE_ENV=production)
   - Correct CLIENT_URL for email links
   - CORS configured for production domain
   - Email service properly configured

## Support

For issues or questions:
- Check AUTH_SETUP.md for detailed architecture
- Review backend logs for API errors
- Check browser console for frontend errors
