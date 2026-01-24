# Email Verification Setup

## Development Mode (Current Setup)

By default, the app runs in **console logging mode** for development. When you request a verification code:

1. **Email**: The code is logged to the server console (check your terminal)
2. **SMS**: Also logged to console (SMS functionality coming later)

## To Enable Real Email Sending (Optional)

If you want to test with actual emails, follow these steps:

### Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings → Security
   - Under "2-Step Verification", click "App passwords"
   - Select "Mail" and generate a password
3. **Update `.env.local`**:

   ```env
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-app-password
   ```

4. **Restart the dev server**: `npm run dev`

### Testing the Verification Flow

1. Click **"Log In"** or **"Sign Up"**
2. Choose **"Email"** as contact method
3. Enter your email address
4. Check:
   - **Console mode**: Look at your terminal for the 6-digit code
   - **Email mode**: Check your inbox for the verification email
5. Enter the code to complete verification

### Development API Endpoints

- `POST /api/auth/send-code` - Send verification code
- `POST /api/auth/verify-code` - Verify the code
- `GET /api/auth/dev-codes` - View active codes (dev only)

### Current Features

✅ **Email verification** - Working with console logging or Gmail SMTP  
✅ **SMS placeholder** - Logs to console (Twilio integration coming later)  
✅ **Code expiration** - Codes expire in 10 minutes  
✅ **Rate limiting** - Max 3 verification attempts  
✅ **Secure storage** - Codes stored in memory with cleanup  

### Production Notes

For production deployment, you'll need to configure proper SMTP settings in the environment variables. The app will automatically switch from console logging to real email sending.