'use client';

import { useState } from 'react';
import { X, Mail, Phone, User, MapPin, Calendar, Shield, Trophy, Users } from 'lucide-react';

interface AuthModalProps {
  mode: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (userData: any) => void;
}

export function AuthModal({ mode, onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<'contact' | 'verify' | 'profile' | 'complete'>('contact');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    contact: '',
    verificationCode: '',
    accountType: 'player' as 'player' | 'td' | 'admin',
    firstName: '',
    lastName: '',
    city: '',
    state: '',
    fargoProfile: '',
    birthMonth: '',
    birthDay: '',
    availableAsManager: false
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: formData.contact,
          method: contactMethod
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setSuccessMessage(data.message);
      setStep('verify');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: formData.contact,
          code: formData.verificationCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      // Verification successful
      if (mode === 'login') {
        onSuccess({ accountType: formData.accountType });
      } else {
        setStep('profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock successful signup
    onSuccess({ 
      ...formData,
      id: 'mock-user-id'
    });
  };

  const isValidContact = (contact: string) => {
    if (contactMethod === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    } else {
      // Basic phone validation (10 digits)
      return /^\d{10}$/.test(contact.replace(/\D/g, ''));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-600">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {mode === 'login' ? 'Login' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Contact Method */}
          {step === 'contact' && (
            <form onSubmit={handleContactSubmit} className="space-y-6">
              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
              {successMessage && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  How would you like to receive your login code?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setContactMethod('email')}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      contactMethod === 'email'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <Mail className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm">Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactMethod('phone')}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      contactMethod === 'phone'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <Phone className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm">Text</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {contactMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <input
                  type={contactMethod === 'email' ? 'email' : 'tel'}
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder={contactMethod === 'email' ? 'your@email.com' : '(555) 123-4567'}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                />
                {contactMethod === 'phone' && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    VoIP numbers not allowed. Enter 10-digit phone number.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isValidContact(formData.contact) || isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Sending Code...' : `Send ${contactMethod === 'email' ? 'Email' : 'Text'} Code`}
              </button>
            </form>
          )}

          {/* Step 2: Verify Code */}
          {step === 'verify' && (
            <form onSubmit={handleVerificationSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              <div className="text-center">
                <p className="text-slate-600 dark:text-slate-400">
                  We sent a verification code to:
                </p>
                <p className="font-medium text-slate-900 dark:text-white mt-1">
                  {formData.contact}
                </p>
                {contactMethod === 'phone' && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    📱 SMS not yet implemented - check server console for code
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={formData.verificationCode}
                  onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value })}
                  placeholder="123456"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('contact')}
                  className="flex-1 bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white py-3 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={formData.verificationCode.length !== 6 || isLoading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Profile Setup (Signup Only) */}
          {step === 'profile' && mode === 'signup' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Account Type
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: 'player' })}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      formData.accountType === 'player'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Player</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Join and participate in tournaments</div>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: 'td' })}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      formData.accountType === 'td'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Tournament Director</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Create and manage tournaments + all Player features</div>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: 'admin' })}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      formData.accountType === 'admin'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Admin</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Full system control + all TD and Player features</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="TX"
                    maxLength={2}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white uppercase"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Fargo Profile (Optional)
                </label>
                <input
                  type="text"
                  value={formData.fargoProfile}
                  onChange={(e) => setFormData({ ...formData, fargoProfile: e.target.value })}
                  placeholder="Link your Fargo profile..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Must match your First and Last name
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Birthday (Optional - for Birthday Chip eligibility)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={formData.birthMonth}
                    onChange={(e) => setFormData({ ...formData, birthMonth: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={formData.birthDay}
                    onChange={(e) => setFormData({ ...formData, birthDay: e.target.value })}
                    placeholder="Day"
                    min="1"
                    max="31"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="availableAsManager"
                  checked={formData.availableAsManager}
                  onChange={(e) => setFormData({ ...formData, availableAsManager: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="availableAsManager" className="text-sm text-slate-700 dark:text-slate-300">
                  Available to be assigned as a Tournament Manager
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('verify')}
                  className="flex-1 bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white py-3 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!formData.firstName || !formData.lastName || !formData.city || !formData.state}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}