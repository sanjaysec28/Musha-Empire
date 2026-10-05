/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Phone, Eye, EyeOff, ShieldCheck, ArrowLeft, Key, Smartphone, Sparkles } from 'lucide-react';
import { AuthScreenType } from './types';
import Button from '../ui/Button';
import { Input } from '../ui/InputFields';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import MushaEmpireLogo from '../ui/MushaEmpireLogo';

interface AuthModuleProps {
  id: string;
  onAuthSuccess: (userData: { name: string; email: string; phone: string }) => void;
  triggerToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, description?: string) => void;
}

export default function AuthModule({ id, onAuthSuccess, triggerToast }: AuthModuleProps) {
  const { signUp, login, resetPassword } = useAuth();
  const [screen, setScreen] = useState<AuthScreenType>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCodes, setOtpCodes] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Validation States
  const [errors, setErrors] = useState<Record<string, string>>({});

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validateEmail = (val: string) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email address is required.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerToast('error', 'Form Validation Error', 'Please check and complete all required fields.');
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const data = await login(email, password);
      triggerToast('success', 'Authentication Approved', 'Welcome to Musha Empire Private Salon Portal.');
      onAuthSuccess({
        name: data?.user?.user_metadata?.name || data?.user?.email?.split('@')[0] || 'Royal Patron',
        email: data?.user?.email || email,
        phone: data?.user?.user_metadata?.phone || '',
      });
    } catch (err: any) {
      console.error('Login error:', err);
      triggerToast('error', 'Authentication Failed', err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name) newErrors.name = 'Full name is required.';
    if (!email) {
      newErrors.email = 'Email address is required.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please provide a valid email.';
    }
    if (!phone) {
      newErrors.phone = 'Phone number is required.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerToast('error', 'Form Validation Error', 'Please correct the highlighted issues.');
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const data = await signUp(email, password, {
        data: {
          name,
          phone,
        },
      });

      if (data?.session) {
        triggerToast('success', 'Account Registered', 'Welcome to Musha Empire Private Salon Portal.');
        onAuthSuccess({
          name: name,
          email: email,
          phone: phone,
        });
      } else {
        triggerToast('success', 'Verification Required', 'A verification OTP or link has been sent to your email.');
        setScreen('otp-verification');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      triggerToast('error', 'Registration Failed', err.message || 'Could not complete registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !validateEmail(email)) {
      setErrors({ email: 'Please enter a valid registered email address.' });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const redirectTo = `${window.location.origin}`;
      await resetPassword(email, redirectTo);
      triggerToast('success', 'Security Link Transmitted', 'Check your inbox for password reset instructions.');
      setScreen('reset-password');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      triggerToast('error', 'Action Failed', err.message || 'Could not send recovery email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!newPassword || newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters.';
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      triggerToast('success', 'Credentials Updated', 'Your security profile has been renewed. Please log in.');
      setScreen('login');
    } catch (err: any) {
      console.error('Reset password error:', err);
      triggerToast('error', 'Update Failed', err.message || 'Could not update password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const joinedOtp = otpCodes.join('');
    
    if (joinedOtp.length < 6) {
      triggerToast('error', 'Incomplete Verification Code', 'Please input the complete 6-digit OTP code.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: joinedOtp,
        type: 'signup',
      });
      if (error) throw error;

      triggerToast('success', 'Authentication Approved', 'Welcome to Musha Empire Private Salon Portal.');
      onAuthSuccess({
        name: data.user?.user_metadata?.name || name || 'Royal Patron',
        email: data.user?.email || email,
        phone: data.user?.user_metadata?.phone || phone,
      });
    } catch (err: any) {
      console.error('OTP verify error:', err);
      triggerToast('error', 'Verification Failed', err.message || 'Invalid or expired OTP passcode.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // numbers only
    const newOtp = [...otpCodes];
    newOtp[index] = value.slice(-1);
    setOtpCodes(newOtp);

    // Auto-focus next field
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCodes[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleGoogleMockLogin = async () => {
    setIsLoading(true);
    triggerToast('info', 'Connecting OAuth Service', 'Opening secure Google luxury account validation window...');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Google sign in error:', err);
      triggerToast('error', 'OAuth Connection Failed', err.message || 'Could not initiate Google Auth.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id={id} className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Decorative luxury absolute graphics */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-secondary/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-accent/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <MushaEmpireLogo variant="vertical" className="mb-8" />
        <AnimatePresence mode="wait">
          {/* LOGIN SCREEN */}
          {screen === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-brand-surface border border-brand-accent p-8 md:p-10 shadow-xl"
            >
              <div className="text-center mb-8">
                <span className="text-[10px] uppercase tracking-[0.3em] font-sans font-semibold text-brand-secondary inline-flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-3 w-3" /> PRIVATE SALON PORTAL
                </span>
                <h2 className="font-serif text-3xl font-medium text-brand-primary">
                  Welcome to the Empire
                </h2>
                <p className="font-sans text-xs text-brand-text-muted mt-2">
                  Please log in to manage royal services, rewards ledger, and appointments.
                </p>
              </div>

              {/* Social Login Button */}
              <button
                id="google-login-btn"
                type="button"
                onClick={handleGoogleMockLogin}
                disabled={isLoading}
                className="w-full py-3.5 px-4 border border-brand-accent text-brand-primary hover:border-brand-secondary hover:bg-brand-bg transition-all duration-300 flex items-center justify-center gap-3 font-sans text-xs uppercase tracking-widest font-semibold cursor-pointer mb-6"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.61 0 3.05.55 4.19 1.63l3.12-3.12C17.43 1.8 14.88 1 12 1 7.35 1 3.4 3.65 1.45 7.51l3.79 2.93c.9-2.71 3.42-4.4 6.76-4.4z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.45c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.38-4.88 3.38-8.5z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.24 14.56A7.11 7.11 0 014.84 12c0-.88.15-1.74.4-2.56L1.45 6.51A11.967 11.967 0 000 12c0 2.01.5 3.91 1.45 5.59l3.79-3.03z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-3.8 1.09-3.34 0-6.17-2.19-7.18-5.18L1.45 16.1C3.4 19.95 7.35 23 12 23z"
                  />
                </svg>
                <span>Access with Google</span>
              </button>

              <div className="relative flex py-2 items-center mb-6">
                <div className="flex-grow border-t border-brand-surface-muted"></div>
                <span className="flex-shrink mx-4 text-brand-text-muted font-sans text-[10px] uppercase tracking-widest font-semibold">Or email credentials</span>
                <div className="flex-grow border-t border-brand-surface-muted"></div>
              </div>

              <form onSubmit={handleLoginSubmit} id="login-form-element" className="space-y-4">
                <Input
                  id="login-email"
                  type="email"
                  label="Email Address"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  leftIcon={<Mail className="h-4 w-4 text-brand-text-muted" />}
                  required
                />

                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    label="Access Password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                    leftIcon={<Lock className="h-4 w-4 text-brand-text-muted" />}
                    rightIcon={
                      <button
                        type="button"
                        id="login-pass-visibility-toggle"
                        onClick={togglePasswordVisibility}
                        className="text-brand-text-muted hover:text-brand-primary cursor-pointer p-1"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                    required
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-brand-secondary border-brand-accent focus:ring-brand-secondary"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-xs font-sans text-brand-text-muted font-medium">
                      Remember device
                    </label>
                  </div>

                  <button
                    type="button"
                    id="login-forgot-pass-link"
                    onClick={() => {
                      setErrors({});
                      setScreen('forgot-password');
                    }}
                    className="text-xs font-sans font-medium text-brand-gold-dark hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="pt-4">
                  <Button
                    id="login-submit-btn"
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full font-semibold uppercase tracking-widest text-xs py-4"
                  >
                    Authorize Account
                  </Button>
                </div>
              </form>

              <div className="text-center mt-6">
                <p className="text-xs font-sans text-brand-text-muted">
                  New member of our circle?{' '}
                  <button
                    type="button"
                    id="login-to-register-btn"
                    onClick={() => {
                      setErrors({});
                      setScreen('register');
                    }}
                    className="text-brand-gold-dark hover:underline font-semibold cursor-pointer"
                  >
                    Create Salon Account
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {/* REGISTER SCREEN */}
          {screen === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-brand-surface border border-brand-accent p-8 md:p-10 shadow-xl"
            >
              <div className="text-center mb-6">
                <span className="text-[10px] uppercase tracking-[0.3em] font-sans font-semibold text-brand-secondary inline-flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="h-3.5 w-3.5" /> BECOME A ROYAL ACCESS MEMBER
                </span>
                <h2 className="font-serif text-3xl font-medium text-brand-primary">
                  Begin Experience
                </h2>
                <p className="font-sans text-xs text-brand-text-muted mt-2">
                  Join the royal circle for instant perks, wallet top-ups, and booking tracking.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} id="register-form-element" className="space-y-4">
                <Input
                  id="reg-name"
                  type="text"
                  label="Full Name"
                  placeholder="Sanjay Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  leftIcon={<User className="h-4 w-4 text-brand-text-muted" />}
                  required
                />

                <Input
                  id="reg-email"
                  type="email"
                  label="Email Address"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  leftIcon={<Mail className="h-4 w-4 text-brand-text-muted" />}
                  required
                />

                <Input
                  id="reg-phone"
                  type="tel"
                  label="Mobile Phone"
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={errors.phone}
                  leftIcon={<Phone className="h-4 w-4 text-brand-text-muted" />}
                  required
                />

                <Input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  label="Define Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  leftIcon={<Lock className="h-4 w-4 text-brand-text-muted" />}
                  rightIcon={
                    <button
                      type="button"
                      id="reg-pass-visibility-toggle"
                      onClick={togglePasswordVisibility}
                      className="text-brand-text-muted hover:text-brand-primary cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  required
                />

                <div className="pt-2">
                  <Button
                    id="register-submit-btn"
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full font-semibold uppercase tracking-widest text-xs py-4"
                  >
                    Create Account
                  </Button>
                </div>
              </form>

              <div className="text-center mt-6 pt-2 border-t border-brand-surface-muted">
                <p className="text-xs font-sans text-brand-text-muted">
                  Already a member?{' '}
                  <button
                    type="button"
                    id="register-to-login-btn"
                    onClick={() => {
                      setErrors({});
                      setScreen('login');
                    }}
                    className="text-brand-gold-dark hover:underline font-semibold cursor-pointer"
                  >
                    Log In Instead
                  </button>
                </p>
              </div>
            </motion.div>
          )}

          {/* FORGOT PASSWORD */}
          {screen === 'forgot-password' && (
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-brand-surface border border-brand-accent p-8 md:p-10 shadow-xl"
            >
              <button
                id="forgot-back-to-login-header-btn"
                onClick={() => setScreen('login')}
                className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-brand-text-muted hover:text-brand-primary mb-6 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Log In
              </button>

              <div className="text-center mb-6">
                <div className="h-12 w-12 bg-brand-gold-light border border-brand-secondary/40 flex items-center justify-center mx-auto mb-4 rounded-none">
                  <Key className="h-5 w-5 text-brand-gold-dark" />
                </div>
                <h2 className="font-serif text-3xl font-medium text-brand-primary">
                  Recover Access
                </h2>
                <p className="font-sans text-xs text-brand-text-muted mt-2">
                  Enter your verified registered email, and we will transmit security credentials link immediately.
                </p>
              </div>

              <form onSubmit={handleForgotPassword} id="forgot-password-form" className="space-y-4">
                <Input
                  id="forgot-email"
                  type="email"
                  label="Registered Email Address"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  leftIcon={<Mail className="h-4 w-4 text-brand-text-muted" />}
                  required
                />

                <div className="pt-2">
                  <Button
                    id="forgot-submit-btn"
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full font-semibold uppercase tracking-widest text-xs py-4"
                  >
                    Transmit Reset Link
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* RESET PASSWORD */}
          {screen === 'reset-password' && (
            <motion.div
              key="reset-password"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-brand-surface border border-brand-accent p-8 md:p-10 shadow-xl"
            >
              <div className="text-center mb-6">
                <h2 className="font-serif text-3xl font-medium text-brand-primary">
                  Define New Password
                </h2>
                <p className="font-sans text-xs text-brand-text-muted mt-2">
                  We confirmed your token. Please input your high-security new password credentials below.
                </p>
              </div>

              <form onSubmit={handleResetPassword} id="reset-password-form" className="space-y-4">
                <Input
                  id="reset-new-password"
                  type="password"
                  label="New Password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={errors.newPassword}
                  leftIcon={<Lock className="h-4 w-4 text-brand-text-muted" />}
                  required
                />

                <Input
                  id="reset-confirm-password"
                  type="password"
                  label="Confirm New Password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  leftIcon={<Lock className="h-4 w-4 text-brand-text-muted" />}
                  required
                />

                <div className="pt-2">
                  <Button
                    id="reset-submit-btn"
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full font-semibold uppercase tracking-widest text-xs py-4"
                  >
                    Save New Password
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* OTP VERIFICATION */}
          {screen === 'otp-verification' && (
            <motion.div
              key="otp-verification"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="bg-brand-surface border border-brand-accent p-8 md:p-10 shadow-xl"
            >
              <button
                id="otp-back-btn"
                onClick={() => setScreen('login')}
                className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-brand-text-muted hover:text-brand-primary mb-6 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Log In
              </button>

              <div className="text-center mb-6">
                <div className="h-12 w-12 bg-brand-gold-light border border-brand-secondary/40 flex items-center justify-center mx-auto mb-4 rounded-none">
                  <Smartphone className="h-5 w-5 text-brand-gold-dark" />
                </div>
                <h2 className="font-serif text-3xl font-medium text-brand-primary">
                  Verify Credentials
                </h2>
                <p className="font-sans text-xs text-brand-text-muted mt-2">
                  We've transmitted an authorized security pin passcode. Please enter the 6-digit digits.
                </p>
                <p className="font-sans text-xs text-brand-gold-dark font-medium mt-1">
                  {email || 'sanjaykumar4747pc@gmail.com'}
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} id="otp-form-element" className="space-y-6">
                {/* 6 Digit Numeric Inputs */}
                <div className="flex justify-between gap-2.5">
                  {otpCodes.map((code, index) => (
                    <input
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      maxLength={1}
                      value={code}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center bg-brand-surface text-brand-primary font-serif text-2xl border border-brand-accent focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary outline-none transition-all duration-300"
                    />
                  ))}
                </div>

                <div className="text-center">
                  <span className="text-xs font-sans text-brand-text-muted">
                    Didn't receive passcode?{' '}
                    <button
                      type="button"
                      id="otp-resend-btn"
                      onClick={() => triggerToast('success', 'Security Pin Retransmitted', 'A fresh passcode has been dispatched.')}
                      className="text-brand-gold-dark hover:underline font-semibold cursor-pointer"
                    >
                      Resend Code
                    </button>
                  </span>
                </div>

                <div className="pt-2">
                  <Button
                    id="otp-submit-btn"
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full font-semibold uppercase tracking-widest text-xs py-4"
                  >
                    Confirm & Proceed
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
