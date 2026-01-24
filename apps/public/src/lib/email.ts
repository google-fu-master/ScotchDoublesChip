import nodemailer from 'nodemailer';

// Email service configuration
export class EmailService {
  private transporter;

  constructor() {
    // Configure transporter based on environment
    if (process.env.NODE_ENV === 'production') {
      // Production SMTP configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Development: Use Gmail SMTP or console logging
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });
      } else {
        // No credentials provided - use console logging only
        console.log('📧 No email credentials configured - using console logging for development');
        this.transporter = null;
      }
    }
  }

  async sendVerificationCode(email: string, code: string) {
    // If no transporter configured (development without credentials)
    if (!this.transporter) {
      console.log('📧 ===== EMAIL VERIFICATION CODE =====');
      console.log('📧 To:', email);
      console.log('📧 Code:', code);
      console.log('📧 =====================================');
      return { 
        success: true, 
        messageId: 'dev-console-' + Date.now(),
        note: 'Email logged to console - no SMTP configured'
      };
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL || '"Scotch Doubles" <noreply@scotchdoubles.com>',
      to: email,
      subject: 'Your Scotch Doubles Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎱 Scotch Doubles</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Tournament Management Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Your Verification Code</h2>
            
            <p>Hello! You've requested a verification code to access your Scotch Doubles account.</p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <h3 style="color: #667eea; margin: 0 0 10px 0; font-size: 16px;">Your 6-Digit Code</h3>
              <div style="font-size: 36px; font-weight: bold; color: #495057; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${code}
              </div>
            </div>
            
            <p style="color: #6c757d; font-size: 14px; margin-bottom: 0;">
              <strong>Security Notice:</strong><br>
              • This code expires in 10 minutes<br>
              • Never share this code with anyone<br>
              • If you didn't request this, please ignore this email
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #6c757d; font-size: 12px;">
            <p>Scotch Doubles Tournament Platform<br>
            This is an automated message, please do not reply.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Your Scotch Doubles Verification Code
        
        Hello! You've requested a verification code to access your Scotch Doubles account.
        
        Your 6-digit code: ${code}
        
        This code expires in 10 minutes.
        Never share this code with anyone.
        If you didn't request this, please ignore this email.
        
        Scotch Doubles Tournament Platform
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async testConnection() {
    if (!this.transporter) {
      return { 
        success: true, 
        message: 'Development mode - no SMTP configured, using console logging' 
      };
    }
    
    try {
      await this.transporter.verify();
      return { success: true, message: 'SMTP connection successful' };
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Singleton instance
export const emailService = new EmailService();