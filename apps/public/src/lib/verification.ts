// Verification code storage and management
export interface VerificationCode {
  code: string;
  contact: string;
  type: 'email' | 'sms';
  expiresAt: number;
  attempts: number;
}

class VerificationManager {
  private codes: Map<string, VerificationCode> = new Map();
  private readonly MAX_ATTEMPTS = 3;
  private readonly CODE_EXPIRY_MINUTES = 10;

  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  createVerification(contact: string, type: 'email' | 'sms'): string {
    const code = this.generateCode();
    const expiresAt = Date.now() + (this.CODE_EXPIRY_MINUTES * 60 * 1000);
    
    this.codes.set(contact, {
      code,
      contact,
      type,
      expiresAt,
      attempts: 0
    });

    // Clean up expired codes periodically
    this.cleanupExpired();
    
    console.log(`📧 Verification code for ${contact}: ${code} (expires in ${this.CODE_EXPIRY_MINUTES} min)`);
    
    return code;
  }

  verifyCode(contact: string, inputCode: string): { 
    success: boolean; 
    error?: string; 
    attemptsLeft?: number 
  } {
    const verification = this.codes.get(contact);

    if (!verification) {
      return { 
        success: false, 
        error: 'No verification code found. Please request a new one.' 
      };
    }

    if (Date.now() > verification.expiresAt) {
      this.codes.delete(contact);
      return { 
        success: false, 
        error: 'Verification code has expired. Please request a new one.' 
      };
    }

    verification.attempts++;

    if (verification.attempts > this.MAX_ATTEMPTS) {
      this.codes.delete(contact);
      return { 
        success: false, 
        error: 'Too many failed attempts. Please request a new verification code.' 
      };
    }

    if (verification.code !== inputCode) {
      return { 
        success: false, 
        error: `Invalid verification code. ${this.MAX_ATTEMPTS - verification.attempts} attempts remaining.`,
        attemptsLeft: this.MAX_ATTEMPTS - verification.attempts
      };
    }

    // Success - remove the verification code
    this.codes.delete(contact);
    return { success: true };
  }

  private cleanupExpired() {
    const now = Date.now();
    for (const [contact, verification] of this.codes.entries()) {
      if (now > verification.expiresAt) {
        this.codes.delete(contact);
      }
    }
  }

  // Get verification status (for debugging)
  getVerificationStatus(contact: string) {
    const verification = this.codes.get(contact);
    if (!verification) return null;
    
    return {
      contact: verification.contact,
      type: verification.type,
      expiresIn: Math.max(0, verification.expiresAt - Date.now()),
      attempts: verification.attempts,
      maxAttempts: this.MAX_ATTEMPTS
    };
  }

  // Development helper - list all active codes
  listActiveCodes() {
    const active = [];
    for (const [contact, verification] of this.codes.entries()) {
      if (Date.now() <= verification.expiresAt) {
        active.push({
          contact,
          code: verification.code,
          type: verification.type,
          expiresIn: verification.expiresAt - Date.now(),
          attempts: verification.attempts
        });
      }
    }
    return active;
  }
}

// Singleton instance
export const verificationManager = new VerificationManager();