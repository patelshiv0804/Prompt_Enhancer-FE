'use client';
import './auth.css';
import Script from 'next/script';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Eye, EyeOff, KeyRound, Lock, Mail, RefreshCw, Sparkles, User, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useIsDark, D } from '@/theme/theme';
import { getUserMessage } from '@/utils/errorMessages';

declare global {
  interface Window {
    __gsi_initialized?: boolean;
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void | Promise<void>;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'pill' | 'rectangular' | 'square' | 'circle';
              width?: number;
              logo_alignment?: 'left' | 'center';
            }
          ) => void;
        };
      };
    };
  }
}

type View = 'auth' | 'forgot-email' | 'forgot-otp' | 'forgot-reset' | 'forgot-success';

const OTP_LENGTH = 6;

function AuthContent() {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [showPass, setShowPass] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleButtonVisible, setGoogleButtonVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleInitRef = useRef(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const isDark = useIsDark();

  const { login, register, loginWithGoogle, loading,
    sendPasswordResetOtp, verifyPasswordResetOtp, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isBusy = loading || isSubmitting;
  const showSubmitOverlay = isSubmitting;
  const showInitialSkeleton = loading && !isSubmitting;
  const showGoogleSkeleton =
    !isSubmitting &&
    (showInitialSkeleton || (Boolean(googleClientId) && (!googleReady || !googleButtonVisible)));

  // ── Forgot Password State ─────────────────────────────────────────────────
  const [view, setView] = useState<View>('auth');
  const [fpEmail, setFpEmail] = useState('');
  const [fpOtp, setFpOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [fpResetToken, setFpResetToken] = useState('');
  const [fpNewPass, setFpNewPass] = useState('');
  const [fpConfirmPass, setFpConfirmPass] = useState('');
  const [fpShowPass, setFpShowPass] = useState(false);
  const [fpError, setFpError] = useState<string | null>(null);
  const [fpLoading, setFpLoading] = useState(false);
  const [fpSuccess, setFpSuccess] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpResendAvailable, setOtpResendAvailable] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getErrorMessage = (value: unknown) =>
    getUserMessage(value, 'Authentication failed. Please try again.');

  const startOtpTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const expireMinutes = 10;
    setOtpTimer(expireMinutes * 60);
    setOtpResendAvailable(false);
    timerRef.current = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setOtpResendAvailable(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      setGoogleReady(true);
      return;
    }

    const checkGoogleInterval = setInterval(() => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        setGoogleReady(true);
        clearInterval(checkGoogleInterval);
      }
    }, 200);

    return () => clearInterval(checkGoogleInterval);
  }, []);

  const loginWithGoogleRef = useRef(loginWithGoogle);
  useEffect(() => {
    loginWithGoogleRef.current = loginWithGoogle;
  }, [loginWithGoogle]);

  useEffect(() => {
    if (!googleReady || !window.google?.accounts?.id || !googleClientId) {
      return;
    }

    if (window.__gsi_initialized) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async ({ credential }) => {
        if (!credential) {
          setError('Google sign-in did not return a credential.');
          return;
        }

        setError(null);
        setIsSubmitting(true);
        try {
          await loginWithGoogleRef.current(credential);
        } catch (err: unknown) {
          console.error(err);
          setError(getErrorMessage(err));
          setIsSubmitting(false);
        }
      },
    });

    window.__gsi_initialized = true;
    googleInitRef.current = true;
  }, [googleClientId, googleReady]);

  useEffect(() => {
    if (!googleReady || !window.google || !googleClientId || view !== 'auth') {
      return;
    }

    let intervalId: NodeJS.Timeout;

    const renderGoogleBtn = () => {
      if (!googleButtonRef.current || !window.google?.accounts?.id) return false;
      const parentWidth = googleButtonRef.current.parentElement?.clientWidth || googleButtonRef.current.clientWidth || 320;
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: isDark ? 'filled_black' : 'outline',
        size: 'large',
        text: tab === 'signin' ? 'signin_with' : 'signup_with',
        shape: 'pill',
        width: Math.min(400, Math.max(220, parentWidth)),
        logo_alignment: 'left',
      });
      setGoogleButtonVisible(true);
      return true;
    };

    if (!renderGoogleBtn()) {
      intervalId = setInterval(() => {
        if (renderGoogleBtn()) {
          clearInterval(intervalId);
        }
      }, 50);
    }

    window.addEventListener('resize', renderGoogleBtn);
    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('resize', renderGoogleBtn);
    };
  }, [googleClientId, googleReady, tab, view, isDark]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (tab === 'signin') {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 8) {
          setError('Password must be at least 8 characters long.');
          setIsSubmitting(false);
          return;
        }
        await register(email, password, fullName);
      }
    } catch (err: unknown) {
      console.error(err);
      setError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  // ── Forgot Password Handlers ──────────────────────────────────────────────

  const handleForgotOpen = () => {
    setFpEmail(email);
    setFpError(null);
    setFpOtp(Array(OTP_LENGTH).fill(''));
    setFpNewPass('');
    setFpConfirmPass('');
    setFpResetToken('');
    setView('forgot-email');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpEmail.trim()) { setFpError('Please enter your email address.'); return; }
    setFpError(null);
    setFpLoading(true);
    try {
      await sendPasswordResetOtp(fpEmail.trim());
      startOtpTimer();
      setView('forgot-otp');
      setTimeout(() => otpInputRefs.current[0]?.focus(), 50);
    } catch (err: unknown) {
      setFpError(getErrorMessage(err));
    } finally {
      setFpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setFpError(null);
    setFpLoading(true);
    setFpOtp(Array(OTP_LENGTH).fill(''));
    try {
      await sendPasswordResetOtp(fpEmail.trim());
      startOtpTimer();
      setTimeout(() => otpInputRefs.current[0]?.focus(), 50);
    } catch (err: unknown) {
      setFpError(getErrorMessage(err));
    } finally {
      setFpLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...fpOtp];
    next[index] = digit;
    setFpOtp(next);
    if (digit && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !fpOtp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length > 0) {
      e.preventDefault();
      const next = Array(OTP_LENGTH).fill('');
      pasted.split('').forEach((ch, i) => { next[i] = ch; });
      setFpOtp(next);
      const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
      otpInputRefs.current[focusIdx]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpStr = fpOtp.join('');
    if (otpStr.length < OTP_LENGTH) { setFpError('Please enter all 6 digits.'); return; }
    setFpError(null);
    setFpLoading(true);
    try {
      const token = await verifyPasswordResetOtp(fpEmail.trim(), otpStr);
      setFpResetToken(token);
      setView('forgot-reset');
    } catch (err: unknown) {
      setFpError('Invalid or expired OTP. Please try again.');
      setFpOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => otpInputRefs.current[0]?.focus(), 50);
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpNewPass || fpNewPass.length < 8) {
      setFpError('Password must be at least 8 characters.'); return;
    }
    if (fpNewPass !== fpConfirmPass) {
      setFpError('Passwords do not match.'); return;
    }
    setFpError(null);
    setFpLoading(true);
    try {
      await resetPassword(fpResetToken, fpNewPass);
      setFpSuccess(true);
      setView('forgot-success');
    } catch (err: unknown) {
      setFpError(getErrorMessage(err));
    } finally {
      setFpLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    setView('auth');
    setFpSuccess(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const errorBox = (msg: string) => (
    <div className="auth-error-box">
      {msg}
    </div>
  );

  const stepFor = (v: View): number => {
    if (v === 'forgot-email') return 1;
    if (v === 'forgot-otp') return 2;
    if (v === 'forgot-reset') return 3;
    return 0;
  };

  const renderStepDots = () => {
    const cur = stepFor(view);
    return (
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
        {[1, 2, 3].map(s => (
          <div key={s} className={`step-dot ${s === cur ? 'active' : s < cur ? 'done' : 'upcoming'}`} />
        ))}
      </div>
    );
  };

  const renderForgotEmail = () => (
    <div className="fp-view">
      <button className="back-btn" onClick={handleBackToSignIn}>
        <ArrowLeft size={14} /> Back to Sign In
      </button>
      {renderStepDots()}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div className="auth-key-wrap">
          <KeyRound size={22} color="#8B5CF6" />
        </div>
        <h2 className="auth-card-title" style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>
          Forgot Password?
        </h2>
        <p className="auth-card-sub" style={{ fontSize: 14, lineHeight: 1.6 }}>
          Enter your registered email and we&apos;ll send a 6-digit code to reset your password.
        </p>
      </div>
      {fpError && errorBox(fpError)}
      <form onSubmit={handleSendOtp}>
        <div style={{ marginBottom: 20 }}>
          <label className="auth-input-label" style={{ fontSize: 14, marginBottom: 6, marginLeft: 4 }}>Email address</label>
          <div className="input-wrap">
            <Mail size={18} className="field-icon-left" />
            <input
              id="fp-email"
              className="field-input input-glow"
              type="email"
              placeholder="name@company.com"
              value={fpEmail}
              onChange={e => setFpEmail(e.target.value)}
              disabled={fpLoading}
              required
              autoFocus
            />
          </div>
        </div>
        <button type="submit" className="btn-main" disabled={fpLoading}>
          {fpLoading ? 'Sending Code...' : <><span>Send Reset Code</span><ArrowRight size={16} className="arrow-icon" /></>}
        </button>
      </form>
    </div>
  );

  const renderForgotOtp = () => (
    <div className="fp-view">
      <button className="back-btn" onClick={() => { setView('forgot-email'); setFpError(null); }}>
        <ArrowLeft size={14} /> Change email
      </button>
      {renderStepDots()}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div className="auth-key-wrap">
          <Mail size={22} color="#8B5CF6" />
        </div>
        <h2 className="auth-card-title" style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>
          Check your inbox
        </h2>
        <p className="auth-card-sub" style={{ fontSize: 14, lineHeight: 1.6 }}>
          We sent a 6-digit code to <strong style={{ color: 'var(--auth-text-primary)' }}>{fpEmail}</strong>
        </p>
      </div>
      {fpError && errorBox(fpError)}
      <form onSubmit={handleVerifyOtp}>
        <div style={{ display: 'flex', gap: 'clamp(4px, 1.6vw, 8px)', justifyContent: 'center', marginBottom: 20 }}>
          {fpOtp.map((digit, i) => (
            <input
              key={i}
              ref={el => { otpInputRefs.current[i] = el; }}
              id={`otp-box-${i}`}
              className={`otp-box ${digit ? 'filled' : ''}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(i, e)}
              onPaste={i === 0 ? handleOtpPaste : undefined}
              disabled={fpLoading}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        <div className="otp-timer" style={{ marginBottom: 20 }}>
          {otpTimer > 0
            ? <>Code expires in <span>{formatTimer(otpTimer)}</span></>
            : <span style={{ color: 'var(--auth-text-muted)' }}>Code expired</span>}
        </div>

        <button type="submit" className="btn-main" disabled={fpLoading || fpOtp.join('').length < OTP_LENGTH}>
          {fpLoading ? 'Verifying...' : <><span>Verify Code</span><ArrowRight size={16} className="arrow-icon" /></>}
        </button>
      </form>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        {otpResendAvailable ? (
          <button className="forgot-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }} onClick={handleResendOtp} disabled={fpLoading}>
            <RefreshCw size={13} /> Resend code
          </button>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--auth-text-muted)' }}>Didn&apos;t receive it? Resend available when timer expires</span>
        )}
      </div>
    </div>
  );

  const renderForgotReset = () => (
    <div className="fp-view">
      {renderStepDots()}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div className="auth-key-wrap">
          <Lock size={22} color="#8B5CF6" />
        </div>
        <h2 className="auth-card-title" style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' }}>
          Set new password
        </h2>
        <p className="auth-card-sub" style={{ fontSize: 14, lineHeight: 1.6 }}>
          Choose a strong password with at least 8 characters.
        </p>
      </div>
      {fpError && errorBox(fpError)}
      <form onSubmit={handleResetPassword}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label className="auth-input-label" style={{ fontSize: 14, marginBottom: 6, marginLeft: 4 }}>New Password</label>
            <div className="input-wrap">
              <Lock size={18} className="field-icon-left" />
              <input
                id="fp-new-pass"
                className="field-input input-glow has-right"
                type={fpShowPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={fpNewPass}
                onChange={e => setFpNewPass(e.target.value)}
                disabled={fpLoading}
                required
                autoFocus
              />
              <button type="button" className="field-icon-right" onClick={() => setFpShowPass(p => !p)}>
                {fpShowPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Strength indicator */}
            {fpNewPass.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                {[0, 1, 2, 3].map(i => {
                  const strength = fpNewPass.length >= 12 ? 4 : fpNewPass.length >= 10 ? 3 : fpNewPass.length >= 8 ? 2 : 1;
                  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
                  return (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 9999, background: i < strength ? colors[strength - 1] : 'var(--auth-bar-inactive)', transition: 'background 0.3s' }} />
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <label className="auth-input-label" style={{ fontSize: 14, marginBottom: 6, marginLeft: 4 }}>Confirm Password</label>
            <div className="input-wrap">
              <Lock size={18} className="field-icon-left" />
              <input
                id="fp-confirm-pass"
                className="field-input input-glow"
                type="password"
                placeholder="••••••••"
                value={fpConfirmPass}
                onChange={e => setFpConfirmPass(e.target.value)}
                disabled={fpLoading}
                required
              />
            </div>
            {fpConfirmPass.length > 0 && (
              <p style={{ fontSize: 12, marginTop: 6, marginLeft: 4, color: fpNewPass === fpConfirmPass ? '#22c55e' : '#ef4444' }}>
                {fpNewPass === fpConfirmPass ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>
        </div>
        <button type="submit" className="btn-main" style={{ marginTop: 24 }} disabled={fpLoading}>
          {fpLoading ? 'Resetting Password...' : <><span>Reset Password</span><ArrowRight size={16} className="arrow-icon" /></>}
        </button>
      </form>
    </div>
  );

  const renderForgotSuccess = () => (
    <div className="fp-view" style={{ textAlign: 'center', padding: '20px 0' }}>
      <div className="success-icon" style={{ display: 'inline-flex', marginBottom: 24 }}>
        <CheckCircle size={64} color="#22c55e" strokeWidth={1.5} />
      </div>
      <div className="success-text">
        <h2 className="auth-card-title" style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em' }}>
          Password Reset!
        </h2>
        <p className="auth-card-sub" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
          Your password has been updated successfully. You can now sign in with your new password.
        </p>
        <button className="btn-main" onClick={handleBackToSignIn}>
          <span>Back to Sign In</span>
          <ArrowRight size={16} className="arrow-icon" />
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="auth-root"
      style={{
        fontFamily: "'Inter', sans-serif",
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'hidden',
        transition: 'background-color 0.4s ease, color 0.4s ease',
      }}
    >
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGoogleReady(true)}
      />
      {/* auth styles are now statically bundled via auth.css import */}

      {/* Top Left — Back to Home */}
      <Link
        href="/"
        className="auth-home-link"
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 50,
          padding: '8px 16px',
          borderRadius: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          textDecoration: 'none',
        }}
      >
        <ArrowLeft size={16} className="auth-home-arrow" />
        <span className="auth-home-text">Back to home</span>
      </Link>

      {/* Top Right Controls: Token Badge */}
      <div className="auth-top-right" style={{ position: 'absolute', top: 24, right: 24, zIndex: 50, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="auth-token-badge" style={{ padding: '8px 16px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={16} color="#8B5CF6" />
          <span className="auth-token-text">Token Efficiency: 94%</span>
        </div>
      </div>

      <main className="auth-main" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 10, padding: 'clamp(20px, 3vh, 32px) 20px', overflowX: 'hidden' }}>

        {/* Background Ambient Effects */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div className="orb1" style={{ position: 'absolute', top: '25%', left: -128, width: 384, height: 384, borderRadius: '50%', filter: 'blur(64px)' }} />
          <div className="orb2" style={{ position: 'absolute', bottom: '25%', right: -128, width: 500, height: 500, borderRadius: '50%', filter: 'blur(64px)' }} />
          <div className="auth-ambient-diagonal" />
        </div>

        {/* Main Container */}
        <div className="auth-container" style={{ position: 'relative', zIndex: 20, width: '100%', maxWidth: 1200, margin: 'auto', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>

          {/* LEFT: Branding & Preview */}
          <div className="auth-left" style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div className="auth-headline" style={{ marginBottom: 24, textAlign: 'left' }}>
              <h1 className="auth-headline-title">
                Architect your <br />
                <span className="animated-remarkable-gradient">intelligence.</span>
              </h1>
            </div>

            <div className="auth-hero-visual" style={{ position: 'relative', width: '100%', maxWidth: 448 }}>
              {/* PromptScore Badge */}
              <div className="badge-a-wrap badge-a auth-badge auth-prompt-badge">
                <div style={{ position: 'relative', width: 48, height: 48 }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <path className="auth-badge-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#8B5CF6" strokeWidth="3" strokeDasharray="98,100" />
                  </svg>
                  <span className="auth-badge-score-text">98</span>
                </div>
                <div>
                  <p className="auth-badge-title">PromptScore</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className="auth-badge-pill">Clarity</span>
                    <span className="auth-badge-pill">Context</span>
                  </div>
                </div>
              </div>

              {/* Main Dashboard Card */}
              <div className="card-hover auth-hero-card">
                <div className="auth-hero-card-header">
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80' }} />
                  </div>
                  <span className="auth-hero-version">Prompt Optimizer v2.4</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="auth-hero-node">
                    <span className="auth-hero-node-tag">Input Node</span>
                    <p className="auth-hero-node-text">&ldquo;Write a react component for a login page...&rdquo;</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', padding: 1, zIndex: 10 }}>
                      <div className="auth-hero-sparkle-center">
                        <Sparkles size={16} strokeWidth={2.2} color="#8B5CF6" className="pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="auth-hero-output">
                    <span className="auth-hero-output-tag">Optimized Output</span>
                    <p className="auth-hero-output-text">
                      <span className="auth-hero-output-lead">You are an expert Frontend Engineer.</span><br />
                      Create a highly accessible, responsive React login component using Tailwind CSS...
                    </p>
                  </div>
                </div>
              </div>

              {/* Model Badge */}
              <div className="badge-b-wrap badge-b auth-badge auth-model-badge">
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={16} color="#fff" />
                </div>
                <div>
                  <p className="auth-badge-title">Target Model</p>
                  <p className="auth-model-title">Claude 3.5 Sonnet</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Auth Card */}
          <div className="auth-right" style={{ flex: '1 1 380px', position: 'relative', zIndex: 30, maxWidth: 480 }}>
            <div className="fluid-shape" style={{
              position: 'absolute', top: '50%', left: '50%',
              width: '110%', height: '110%',
              transform: 'translate(-50%,-50%)',
              zIndex: 0,
            }} />

            {/* Card */}
            <div className="auth-card-inner">
              {showSubmitOverlay && (
                <div className="auth-loading-overlay">
                  <div className="auth-loading-spinner" />
                  <div>
                    <div className="auth-loading-title">
                      {tab === 'signin' ? 'Signing you in' : 'Creating your account'}
                    </div>
                    <div className="auth-loading-copy">Redirecting to your dashboard...</div>
                  </div>
                </div>
              )}

              {/* Top gradient bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 8, background: 'linear-gradient(90deg,#6366F1,#8B5CF6,#EC4899)', opacity: 0.85 }} />

              {/* ── FORGOT PASSWORD VIEWS ── */}
              {view === 'forgot-email' && renderForgotEmail()}
              {view === 'forgot-otp' && renderForgotOtp()}
              {view === 'forgot-reset' && renderForgotReset()}
              {view === 'forgot-success' && renderForgotSuccess()}

              {/* ── NORMAL AUTH VIEW ── */}
              {view === 'auth' && (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <h2 className="auth-card-title">
                      {tab === 'signin' ? 'Welcome back' : 'Create Account'}
                    </h2>
                    <p className="auth-card-sub">
                      {tab === 'signin' ? 'Sign in to continue to AURE' : 'Register your profile'}
                    </p>
                  </div>

                  {/* Tabs */}
                  <div className="auth-tabs-bar">
                    <button type="button" className={`tab-btn ${tab === 'signin' ? 'tab-active' : 'tab-inactive'}`} onClick={() => { setTab('signin'); setError(null); }}>Sign In</button>
                    <button type="button" className={`tab-btn ${tab === 'signup' ? 'tab-active' : 'tab-inactive'}`} onClick={() => { setTab('signup'); setError(null); }}>Create Account</button>
                  </div>

                  {error && errorBox(error)}

                  {/* Form */}
                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                      {/* Full Name — signup only */}
                      <div className={`signup-field ${tab === 'signup' ? 'visible' : 'hidden'}`}>
                        <label className="auth-input-label">Full Name</label>
                        <div className="input-wrap">
                          <User size={18} className="field-icon-left" />
                          <input
                            className="field-input input-glow"
                            type="text"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={isBusy}
                            tabIndex={tab === 'signup' ? 0 : -1}
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="auth-input-label">Email address</label>
                        <div className="input-wrap">
                          <Mail size={18} className="field-icon-left" />
                          <input
                            className="field-input input-glow"
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isBusy}
                            required
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, marginLeft: 4 }}>
                          <label className="auth-input-label" style={{ marginBottom: 0, marginLeft: 0 }}>Password</label>
                          <button
                            type="button"
                            className="forgot-link"
                            style={{ visibility: tab === 'signin' ? 'visible' : 'hidden' }}
                            onClick={handleForgotOpen}
                          >
                            Forgot?
                          </button>
                        </div>
                        <div className="input-wrap">
                          <Lock size={18} className="field-icon-left" />
                          <input
                            className="field-input input-glow has-right"
                            type={showPass ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isBusy}
                            required
                          />
                          <button type="button" className="field-icon-right" onClick={() => setShowPass(p => !p)}>
                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password Field — signup only */}
                      {tab === 'signup' && (
                        <div>
                          <label className="auth-input-label">Confirm Password</label>
                          <div className="input-wrap">
                            <Lock size={18} className="field-icon-left" />
                            <input
                              className="field-input input-glow has-right"
                              type="password"
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              disabled={isBusy}
                              tabIndex={tab === 'signup' ? 0 : -1}
                            />
                          </div>
                        </div>
                      )}

                      {showInitialSkeleton ? (
                        <div className="inline-skeleton btn" aria-hidden="true" />
                      ) : (
                        <button type="submit" className="btn-main" style={{ marginTop: 4 }} disabled={isBusy}>
                          {isSubmitting ? (
                            tab === 'signin' ? 'Signing In...' : 'Registering...'
                          ) : (
                            <>
                              {tab === 'signin' ? 'Sign In' : 'Create Account'}
                              <ArrowRight size={18} className="arrow-icon" />
                            </>
                          )}
                        </button>
                      )}

                      <div className="oauth-divider">or continue with</div>

                      {googleClientId ? (
                        <div className="google-button-shell">
                          {!showGoogleSkeleton && (
                            <div className="google-styled-btn" aria-hidden="true">
                              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.221 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.278 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z" />
                                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.278 4 24 4c-7.682 0-14.346 4.337-17.694 10.691Z" />
                                <path fill="#4CAF50" d="M24 44c5.18 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.143 35.091 26.715 36 24 36c-5.2 0-9.62-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44Z" />
                                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.084 5.571h.003l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z" />
                              </svg>
                              {tab === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
                            </div>
                          )}
                          <div
                            ref={googleButtonRef}
                            className="google-button-host"
                            style={{ visibility: showGoogleSkeleton ? 'hidden' : 'visible' }}
                          />
                          {showGoogleSkeleton && (
                            <div className="inline-skeleton google google-button-skeleton" aria-hidden="true" />
                          )}
                        </div>
                      ) : (
                        <div>
                          <div className="google-fallback">
                            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.221 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.278 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z" />
                              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.278 4 24 4c-7.682 0-14.346 4.337-17.694 10.691Z" />
                              <path fill="#4CAF50" d="M24 44c5.18 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.143 35.091 26.715 36 24 36c-5.2 0-9.62-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44Z" />
                              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.084 5.571h.003l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z" />
                            </svg>
                            {tab === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
                          </div>
                          <p className="google-hint">
                            Add <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in <code>.env.local</code> to activate Google auth.
                          </p>
                        </div>
                      )}

                      <div className="auth-card-footer">
                        <p className="auth-card-footer-text">
                          {tab === 'signin' ? (
                            <>Don&apos;t have an account? <button type="button" className="link-style" onClick={() => { setTab('signup'); setError(null); }}>Get Started</button></>
                          ) : (
                            <>Already have an account? <button type="button" className="link-style" onClick={() => { setTab('signin'); setError(null); }}>Sign In</button></>
                          )}
                        </p>
                      </div>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return <AuthContent />;
}
