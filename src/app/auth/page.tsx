'use client';
import Script from 'next/script';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Eye, EyeOff, KeyRound, Lock, Mail, RefreshCw, Sparkles, User, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

declare global {
  interface Window {
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

export default function AuthPage() {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [showPass, setShowPass] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleButtonVisible, setGoogleButtonVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleInitRef = useRef(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

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
    value instanceof Error ? value.message : 'Authentication failed. Please try again.';

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
    if (!googleReady || !window.google || !googleClientId || googleInitRef.current) {
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
          await loginWithGoogle(credential);
        } catch (err: unknown) {
          console.error(err);
          setError(getErrorMessage(err));
          setIsSubmitting(false);
        }
      },
    });

    googleInitRef.current = true;
  }, [googleClientId, googleReady, loginWithGoogle]);

  useEffect(() => {
    if (!googleReady || !window.google || !googleButtonRef.current || !googleClientId) {
      return;
    }

    setGoogleButtonVisible(false);
    googleButtonRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      text: tab === 'signin' ? 'signin_with' : 'signup_with',
      shape: 'pill',
      width: Math.max(280, Math.floor(googleButtonRef.current.offsetWidth)),
      logo_alignment: 'left',
    });
    setGoogleButtonVisible(true);
  }, [googleClientId, googleReady, tab]);

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
    setFpEmail(email); // Pre-fill from sign-in form if already typed
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
      // Auto-focus first OTP box after render
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

  const sharedStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap');
    .glass-floating { background: rgba(255,255,255,0.9); backdrop-filter: blur(32px); -webkit-backdrop-filter: blur(32px); box-shadow: 0 10px 20px rgba(23,26,43,0.04); border: 1px solid rgba(236,234,245,0.5); }
    .glass-panel { background: rgba(255,255,255,0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid #ECEAF5; }
    .fluid-shape { animation: morph 8s ease-in-out infinite; background: rgba(255,255,255,0.6); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); box-shadow: 0 20px 60px rgba(23,26,43,0.08); border: 1px solid rgba(255,255,255,0.5); }
    @keyframes morph { 0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } 50% { border-radius: 30% 70% 70% 30% / 30% 60% 40% 70%; } 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; } }
    .signup-field { overflow: hidden; transition: max-height 0.35s ease, opacity 0.3s ease, margin 0.3s ease; }
    .signup-field.visible { max-height: 120px; opacity: 1; }
    .signup-field.hidden { max-height: 0; opacity: 0; margin-top: 0 !important; margin-bottom: 0 !important; pointer-events: none; }
    .orb1 { background: radial-gradient(circle, rgba(139,92,246,0.4) 0%, rgba(139,92,246,0) 70%); }
    .orb2 { background: radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(236,72,153,0) 70%); }
    .input-glow:focus { box-shadow: 0 0 0 2px rgba(139,92,246,0.3); border-color: #8B5CF6; outline: none; }
    @keyframes bounceA { 0%,100%{transform:rotate(3deg) translateY(0)} 50%{transform:rotate(3deg) translateY(-10px)} }
    @keyframes bounceB { 0%,100%{transform:rotate(-2deg) translateY(0)} 50%{transform:rotate(-2deg) translateY(-10px)} }
    @keyframes pulse2 { 0%,100%{opacity:1} 50%{opacity:0.5} }
    .badge-a { animation: bounceA 5s ease-in-out infinite; }
    .badge-b { animation: bounceB 6s ease-in-out infinite reverse; }
    .pulse { animation: pulse2 2s ease-in-out infinite; }
    .card-hover { transition: transform 0.5s; }
    .card-hover:hover { transform: scale(1.02); }
    .btn-main { width:100%; background:#09090B; color:#fff; border:none; border-radius:9999px; padding:12px 0; font-size:14px; font-weight:600; letter-spacing:-0.01em; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 6px 22px rgba(13,13,26,0.20); transition:transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease; margin-top:4px; font-family:'Geist',sans-serif; }
    .btn-main:hover:not(:disabled) { transform:translateY(-2px) scale(1.02); box-shadow:0 10px 30px rgba(139,92,246,0.35), 0 6px 22px rgba(13,13,26,0.22); }
    .btn-main:disabled { opacity: 0.7; cursor: not-allowed; }
    .btn-secondary { width:100%; background:transparent; color:#09090B; border:1.5px solid rgba(23,26,43,0.15); border-radius:9999px; padding:13px 0; font-size:14px; font-weight:600; letter-spacing:0.02em; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all 0.2s; font-family:'Geist',sans-serif; }
    .btn-secondary:hover:not(:disabled) { border-color:#8B5CF6; color:#8B5CF6; background:rgba(139,92,246,0.05); }
    .btn-secondary:disabled { opacity:0.6; cursor:not-allowed; }
    .arrow-icon { display:inline-block; transition:transform 0.2s; }
    .btn-main:hover .arrow-icon { transform:translateX(4px); }
    .tab-btn { flex:1; padding:11px 0; background:none; border:none; border-bottom:2px solid transparent; cursor:pointer; font-size:14px; font-family:'Geist',sans-serif; letter-spacing:0.02em; transition:all 0.2s; }
    .tab-active { border-bottom-color:#8B5CF6; color:#09090B; font-weight:700; }
    .tab-inactive { color:rgba(70,70,76,0.6); font-weight:500; }
    .input-wrap { position:relative; }
    .field-input { width:100%; box-sizing:border-box; padding:11px 16px 11px 44px; background:rgba(255,255,255,0.9); border:1px solid #ECEAF5; border-radius:12px; font-size:16px; color:#111; font-family:'Inter',sans-serif; transition:border-color 0.3s, box-shadow 0.3s; }
    .field-input::placeholder { color:rgba(70,70,76,0.4); }
    .field-input.has-right { padding-right:48px; }
    .field-icon-left { position:absolute; left:14px; top:50%; transform:translateY(-50%); color:rgba(70,70,76,0.5); font-size:20px; pointer-events:none; }
    .field-icon-right { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(70,70,76,0.5); font-size:20px; display:flex; align-items:center; transition:color 0.2s; }
    .field-icon-right:hover { color:#09090B; }
    .link-style { background:none; border:none; cursor:pointer; font-weight:700; color:#09090B; font-size:16px; font-family:'Inter',sans-serif; padding:0; transition:color 0.2s; }
    .link-style:hover { color:#8B5CF6; }
    .forgot-link { font-size:12px; font-weight:600; color:#8B5CF6; text-decoration:none; letter-spacing:0.05em; transition:color 0.2s; background:none; border:none; cursor:pointer; font-family:'Inter',sans-serif; padding:0; }
    .forgot-link:hover { color:#09090B; }
    .vault-card { display:none; }
    @media(min-width:1024px) { .vault-card { display:block; } }
    @media(min-width:768px) { .badge-a-wrap { display:flex !important; } .badge-b-wrap { display:flex !important; } }
    @media(max-width:767px) { .badge-a-wrap { display:none !important; } .badge-b-wrap { display:none !important; } }
    .footer-link { font-size:12px; font-weight:600; color:rgba(70,70,76,0.6); text-decoration:none; letter-spacing:0.05em; transition:color 0.2s; }
    .footer-link:hover { color:#7C3AED; }
    .auth-home-link { cursor:pointer; transition:transform 0.2s, box-shadow 0.2s; }
    .auth-home-link:hover { transform:translateY(-1px); box-shadow:0 12px 24px rgba(23,26,43,0.1); }
    .auth-home-link .auth-home-arrow { transition:transform 0.2s; }
    .auth-home-link:hover .auth-home-arrow { transform:translateX(-3px); }
    .green-dot { width:8px; height:8px; border-radius:50%; background:#22c55e; }
    .oauth-divider { display:flex; align-items:center; gap:12px; margin-top:6px; color:rgba(70,70,76,0.45); font-size:12px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; }
    .oauth-divider::before, .oauth-divider::after { content:''; flex:1; height:1px; background:rgba(229,225,227,0.8); }
    .google-fallback { width:100%; min-height:46px; border-radius:9999px; border:1px solid #E5E7EB; background:#fff; color:#09090B; font-family:'Geist',sans-serif; font-size:14px; font-weight:600; letter-spacing:0.02em; display:flex; align-items:center; justify-content:center; gap:10px; padding:11px 0; box-sizing:border-box; box-shadow:0 1px 2px rgba(17,24,39,0.04); }
    .google-hint { margin-top:6px; font-size:11px; line-height:1.4; color:rgba(70,70,76,0.62); text-align:center; }
    .inline-skeleton { width:100%; border-radius:9999px; background:linear-gradient(90deg, rgba(139,92,246,0.12), rgba(236,72,153,0.14), rgba(139,92,246,0.12)); background-size:200% 100%; animation:shimmer 1.4s linear infinite; }
    .inline-skeleton.btn { height:44px; margin-top:6px; }
    .inline-skeleton.google { height:44px; margin-top:2px; }
    .google-button-shell { position:relative; min-height:44px; }
    .google-button-host { width:100%; min-height:44px; display:flex; justify-content:center; }
    .google-button-skeleton { position:absolute; inset:0; }
    .auth-loading-overlay { position:absolute; inset:0; z-index:80; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:18px; background:rgba(250,250,252,0.42); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border-radius:40px; }
    .auth-loading-spinner { width:42px; height:42px; border-radius:50%; border:3px solid rgba(139,92,246,0.18); border-top-color:#09090B; animation:spin 0.8s linear infinite; }
    .auth-loading-title { font-family:'Geist',sans-serif; font-size:15px; font-weight:600; letter-spacing:0.02em; color:#09090B; text-align:center; }
    .auth-loading-copy { font-size:13px; color:rgba(70,70,76,0.68); text-align:center; }
    @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
    @keyframes shimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
    /* OTP boxes */
    .otp-box { width:44px; height:54px; text-align:center; font-size:22px; font-weight:700; font-family:'Geist',sans-serif; color:#09090B; background:rgba(255,255,255,0.95); border:1.5px solid #ECEAF5; border-radius:12px; outline:none; transition:border-color 0.2s, box-shadow 0.2s, transform 0.15s; caret-color:#8B5CF6; }
    .otp-box:focus { border-color:#8B5CF6; box-shadow:0 0 0 3px rgba(139,92,246,0.2); transform:scale(1.06); }
    .otp-box.filled { border-color:#8B5CF6; background:linear-gradient(135deg,rgba(139,92,246,0.06),rgba(236,72,153,0.04)); }
    /* OTP timer */
    .otp-timer { font-size:13px; font-family:'Geist',sans-serif; font-weight:600; color:rgba(70,70,76,0.7); text-align:center; }
    .otp-timer span { color:#8B5CF6; }
    /* Back button */
    .back-btn { display:inline-flex; align-items:center; gap:6px; background:none; border:none; cursor:pointer; font-size:13px; font-weight:600; color:rgba(70,70,76,0.6); font-family:'Geist',sans-serif; padding:0; letter-spacing:0.02em; transition:color 0.2s; margin-bottom:20px; }
    .back-btn:hover { color:#8B5CF6; }
    /* Success check animation */
    @keyframes scaleIn { 0%{transform:scale(0);opacity:0} 70%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
    @keyframes fadeUp { 0%{opacity:0;transform:translateY(16px)} 100%{opacity:1;transform:translateY(0)} }
    .success-icon { animation: scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
    .success-text { animation: fadeUp 0.4s 0.3s ease both; }
    /* Step indicator */
    .step-dot { width:8px; height:8px; border-radius:50%; transition:all 0.3s; }
    .step-dot.active { background:#8B5CF6; transform:scale(1.25); }
    .step-dot.done { background:#8B5CF6; opacity:0.4; }
    .step-dot.upcoming { background:rgba(70,70,76,0.2); }
    /* fp view slide */
    .fp-view { animation: fadeUp 0.3s ease both; }
  `;

  const errorBox = (msg: string) => (
    <div style={{
      padding: '12px 16px', background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.15)', borderRadius: 12,
      color: '#dc2626', fontSize: 14, fontWeight: 500, marginBottom: 20,
    }}>
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
        {[1,2,3].map(s => (
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
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(236,72,153,0.1))', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <KeyRound size={22} color="#8B5CF6" />
        </div>
        <h2 style={{ fontFamily: "'Geist',sans-serif", fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 6, letterSpacing: '-0.02em' }}>Forgot Password?</h2>
        <p style={{ fontSize: 14, color: 'rgba(70,70,76,0.65)', lineHeight: 1.6 }}>
          Enter your registered email and we&apos;ll send a 6-digit code to reset your password.
        </p>
      </div>
      {fpError && errorBox(fpError)}
      <form onSubmit={handleSendOtp}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: "'Geist',sans-serif", fontSize: 14, fontWeight: 500, color: '#111', display: 'block', marginBottom: 6, marginLeft: 4 }}>Email address</label>
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
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(236,72,153,0.1))', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Mail size={22} color="#8B5CF6" />
        </div>
        <h2 style={{ fontFamily: "'Geist',sans-serif", fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 6, letterSpacing: '-0.02em' }}>Check your inbox</h2>
        <p style={{ fontSize: 14, color: 'rgba(70,70,76,0.65)', lineHeight: 1.6 }}>
          We sent a 6-digit code to <strong style={{ color: '#09090B' }}>{fpEmail}</strong>
        </p>
      </div>
      {fpError && errorBox(fpError)}
      <form onSubmit={handleVerifyOtp}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
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
            : <span style={{ color: 'rgba(70,70,76,0.6)' }}>Code expired</span>}
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
          <span style={{ fontSize: 13, color: 'rgba(70,70,76,0.5)' }}>Didn&apos;t receive it? Resend available when timer expires</span>
        )}
      </div>
    </div>
  );

  const renderForgotReset = () => (
    <div className="fp-view">
      {renderStepDots()}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(236,72,153,0.1))', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Lock size={22} color="#8B5CF6" />
        </div>
        <h2 style={{ fontFamily: "'Geist',sans-serif", fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 6, letterSpacing: '-0.02em' }}>Set new password</h2>
        <p style={{ fontSize: 14, color: 'rgba(70,70,76,0.65)', lineHeight: 1.6 }}>
          Choose a strong password with at least 8 characters.
        </p>
      </div>
      {fpError && errorBox(fpError)}
      <form onSubmit={handleResetPassword}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ fontFamily: "'Geist',sans-serif", fontSize: 14, fontWeight: 500, color: '#111', display: 'block', marginBottom: 6, marginLeft: 4 }}>New Password</label>
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
                {[0,1,2,3].map(i => {
                  const strength = fpNewPass.length >= 12 ? 4 : fpNewPass.length >= 10 ? 3 : fpNewPass.length >= 8 ? 2 : 1;
                  const colors = ['#ef4444','#f97316','#eab308','#22c55e'];
                  return (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 9999, background: i < strength ? colors[strength - 1] : 'rgba(70,70,76,0.1)', transition: 'background 0.3s' }} />
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <label style={{ fontFamily: "'Geist',sans-serif", fontSize: 14, fontWeight: 500, color: '#111', display: 'block', marginBottom: 6, marginLeft: 4 }}>Confirm Password</label>
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
        <h2 style={{ fontFamily: "'Geist',sans-serif", fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 10, letterSpacing: '-0.02em' }}>
          Password Reset!
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(70,70,76,0.65)', lineHeight: 1.6, marginBottom: 32 }}>
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
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#FAFAFC', minHeight: '100vh', height: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGoogleReady(true)}
      />
      <style>{sharedStyles}</style>

      {/* Top Left — Back to Home */}
      <Link
        href="/"
        className="glass-floating auth-home-link"
        style={{ position: 'absolute', top: 24, left: 24, zIndex: 50, padding: '8px 16px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
      >
        <ArrowLeft size={16} color="#09090B" className="auth-home-arrow" />
        <span style={{ fontFamily: "'Geist',sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: '#09090B' }}>Back to home</span>
      </Link>

      {/* Top Right Badge */}
      <div className="glass-floating" style={{ position: 'absolute', top: 24, right: 24, zIndex: 50, padding: '8px 16px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Zap size={16} color="#8B5CF6" />
        <span style={{ fontFamily: "'Geist',sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', color: '#09090B' }}>Token Efficiency: 94%</span>
      </div>

      <main style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10, padding: 'clamp(10px, 2vh, 26px) 24px', overflowX: 'hidden', overflowY: 'auto' }}>

        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div className="orb1" style={{ position: 'absolute', top: '25%', left: -128, width: 384, height: 384, borderRadius: '50%', filter: 'blur(64px)', opacity: 0.5 }} />
          <div className="orb2" style={{ position: 'absolute', bottom: '25%', right: -128, width: 500, height: 500, borderRadius: '50%', filter: 'blur(64px)', opacity: 0.5 }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: '120vw', height: '120vh', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(48px)', transform: 'rotate(12deg) translate(33%,-25%)', borderRadius: 100, border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 25px 50px rgba(0,0,0,0.08)' }} />
        </div>

        {/* Vault Preview */}
        <div className="vault-card" style={{ position: 'absolute', top: '33%', right: '25%', zIndex: 10, opacity: 0.6, transform: 'translate(50%,-50%) rotate(6deg) scale(0.9)' }}>
          <div className="glass-floating" style={{ padding: 24, borderRadius: 16, width: 320, position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: 'linear-gradient(90deg,#60a5fa,#8B5CF6)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <span style={{ padding: '4px 8px', background: '#eff6ff', color: '#2563eb', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Vault</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#22c55e' }}>
                <span className="ms" style={{ fontSize: 16 }}>verified</span>
                <span style={{ fontSize: 12, fontWeight: 700 }}>99</span>
              </div>
            </div>
            <h3 style={{ fontFamily: "'Geist',sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>React Component Scaffold Generator</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              <span style={{ padding: '4px 10px', background: '#f3f4f6', color: '#4b5563', borderRadius: 9999, fontSize: 11 }}>React</span>
              <span style={{ padding: '4px 10px', background: '#f3f4f6', color: '#4b5563', borderRadius: 9999, fontSize: 11 }}>TypeScript</span>
            </div>
            <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8, border: '1px solid #f3f4f6', fontFamily: 'monospace', fontSize: 11, color: '#6b7280', height: 96, overflow: 'hidden', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 48, background: 'linear-gradient(to top,#f9fafb,transparent)' }} />
              You are an expert frontend engineer. Create a reusable React component for...
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div style={{ position: 'relative', zIndex: 20, width: '100%', maxWidth: 1200, margin: 'auto', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>

          {/* LEFT */}
          <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ marginBottom: 24, textAlign: 'left' }}>
              <h1 style={{ fontFamily: "'Geist',sans-serif", fontSize: 'clamp(32px,4vw,48px)', lineHeight: 1.15, fontWeight: 700, letterSpacing: '-0.04em', color: '#111', marginBottom: 8 }}>
                Architect your <br />
                <span className="animated-remarkable-gradient">intelligence.</span>
              </h1>
            </div>

            <div style={{ position: 'relative', width: '100%', maxWidth: 448 }}>
              {/* PromptScore Badge */}
              <div className="badge-a-wrap glass-floating badge-a" style={{ position: 'absolute', top: -32, right: -64, zIndex: 40, padding: '14px 16px', borderRadius: 12, alignItems: 'center', gap: 14, border: '1px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(48px)' }}>
                <div style={{ position: 'relative', width: 48, height: 48 }}>
                  <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#8B5CF6" strokeWidth="3" strokeDasharray="98,100" />
                  </svg>
                  <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: "'Geist',sans-serif", fontWeight: 700, fontSize: 13, color: '#09090B' }}>98</span>
                </div>
                <div>
                  <p style={{ fontFamily: "'Geist',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(70,70,76,0.7)', textTransform: 'uppercase', marginBottom: 4 }}>PromptScore</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.6)', padding: '2px 8px', borderRadius: 9999, color: '#4b5563', border: '1px solid #f3f4f6' }}>Clarity</span>
                    <span style={{ fontSize: 9, background: 'rgba(255,255,255,0.6)', padding: '2px 8px', borderRadius: 9999, color: '#4b5563', border: '1px solid #f3f4f6' }}>Context</span>
                  </div>
                </div>
              </div>

              {/* Main Dashboard Card */}
              <div className="glass-floating card-hover" style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 25px 50px rgba(0,0,0,0.08)', padding: 24, position: 'relative', overflow: 'hidden', zIndex: 30, backdropFilter: 'blur(48px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }} />
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80' }} />
                  </div>
                  <span style={{ fontFamily: "'Geist',sans-serif", fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Prompt Optimizer v2.4</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: 'rgba(249,250,251,0.5)', padding: 16, borderRadius: 12, border: '1px solid rgba(243,244,246,0.5)', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: -10, left: 14, background: '#fff', padding: '0 8px', fontSize: 10, fontWeight: 700, color: '#9ca3af', borderRadius: 9999, border: '1px solid #f3f4f6' }}>Input Node</span>
                    <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#6b7280', marginTop: 4 }}>&ldquo;Write a react component for a login page...&rdquo;</p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', margin: '-8px 0' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', padding: 1, zIndex: 10 }}>
                      <div style={{ width: '100%', height: '100%', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={16} strokeWidth={2.2} color="#8B5CF6" className="pulse" />
                      </div>
                    </div>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(236,72,153,0.05))', padding: 16, borderRadius: 12, border: '1px solid rgba(139,92,246,0.3)', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: -10, left: 14, background: '#fff', padding: '0 8px', fontSize: 10, fontWeight: 700, color: '#8B5CF6', borderRadius: 9999, border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 1px 4px rgba(139,92,246,0.2)' }}>Optimized Output</span>
                    <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#09090B', lineHeight: 1.6, marginTop: 4 }}>
                      <span style={{ color: '#8B5CF6' }}>You are an expert Frontend Engineer.</span><br />
                      Create a highly accessible, responsive React login component using Tailwind CSS...
                    </p>
                  </div>
                </div>
              </div>

              {/* Model Badge */}
              <div className="badge-b-wrap glass-floating badge-b" style={{ position: 'absolute', bottom: -24, left: -48, zIndex: 40, padding: '10px 14px', borderRadius: 12, alignItems: 'center', gap: 10, border: '1px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(48px)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#8B5CF6,#EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={16} color="#fff" />
                </div>
                <div>
                  <p style={{ fontFamily: "'Geist',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(70,70,76,0.7)', textTransform: 'uppercase' }}>Target Model</p>
                  <p style={{ fontFamily: "'Geist',sans-serif", fontSize: 12, fontWeight: 700, color: '#09090B' }}>Claude 3.5 Sonnet</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Auth Card */}
          <div style={{ flex: '1 1 380px', position: 'relative', zIndex: 30, maxWidth: 480 }}>
            <div className="fluid-shape" style={{
              position: 'absolute', top: '50%', left: '50%',
              width: '110%', height: '110%',
              transform: 'translate(-50%,-50%)',
              zIndex: 0, opacity: 0.85
            }} />

            {/* Card */}
            <div className="glass-floating" style={{ position: 'relative', borderRadius: 32, padding: 'clamp(16px, 2.2vh, 32px) clamp(24px, 3vw, 38px)', overflow: 'hidden', zIndex: 1, backdropFilter: 'blur(48px)' }}>
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
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 8, background: 'linear-gradient(90deg,#6366F1,#8B5CF6,#EC4899)', opacity: 0.7 }} />

              {/* ── FORGOT PASSWORD VIEWS ── */}
              {view === 'forgot-email' && renderForgotEmail()}
              {view === 'forgot-otp' && renderForgotOtp()}
              {view === 'forgot-reset' && renderForgotReset()}
              {view === 'forgot-success' && renderForgotSuccess()}

              {/* ── NORMAL AUTH VIEW ── */}
              {view === 'auth' && (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 12 }}>
                    <h2 style={{ fontFamily: "'Geist',sans-serif", fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', color: '#111', marginBottom: 4 }}>
                      {tab === 'signin' ? 'Welcome back' : 'Create Account'}
                    </h2>
                    <p style={{ fontSize: 14, color: 'rgba(70,70,76,0.6)' }}>
                      {tab === 'signin' ? 'Sign in to continue to AURE' : 'Register your profile'}
                    </p>
                  </div>

                  {/* Tabs */}
                  <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6', marginBottom: 14 }}>
                    <button type="button" className={`tab-btn ${tab === 'signin' ? 'tab-active' : 'tab-inactive'}`} onClick={() => { setTab('signin'); setError(null); }}>Sign In</button>
                    <button type="button" className={`tab-btn ${tab === 'signup' ? 'tab-active' : 'tab-inactive'}`} onClick={() => { setTab('signup'); setError(null); }}>Create Account</button>
                  </div>

                  {error && (
                    <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '12px', color: '#dc2626', fontSize: '14px', fontWeight: 500, marginBottom: '20px', textAlign: 'left' }}>
                      {error}
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                      {/* Full Name — signup only */}
                      <div className={`signup-field ${tab === 'signup' ? 'visible' : 'hidden'}`}>
                        <label style={{ fontFamily: "'Geist',sans-serif", fontSize: 14, fontWeight: 500, letterSpacing: '0.02em', color: '#111', display: 'block', marginBottom: 6, marginLeft: 4 }}>Full Name</label>
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
                        <label style={{ fontFamily: "'Geist',sans-serif", fontSize: 14, fontWeight: 500, letterSpacing: '0.02em', color: '#111', display: 'block', marginBottom: 6, marginLeft: 4 }}>Email address</label>
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

                      {/* Password + Confirm — side-by-side on signup so the card fits the viewport without scrolling */}
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 150px', minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, marginLeft: 4 }}>
                            <label style={{ fontFamily: "'Geist',sans-serif", fontSize: 14, fontWeight: 500, letterSpacing: '0.02em', color: '#111' }}>Password</label>
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

                        {tab === 'signup' && (
                          <div style={{ flex: '1 1 150px', minWidth: 0 }}>
                            <label style={{ fontFamily: "'Geist',sans-serif", fontSize: 14, fontWeight: 500, letterSpacing: '0.02em', color: '#111', display: 'block', marginBottom: 6, marginLeft: 4 }}>Confirm Password</label>
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
                      </div>

                      {showInitialSkeleton ? (
                        <div className="inline-skeleton btn" aria-hidden="true" />
                      ) : (
                        <button type="submit" className="btn-main" style={{ marginTop: 6 }} disabled={isBusy}>
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
                              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.221 36 24 36c-6.627 0-12-5.373-12-12S17.373 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.278 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z"/>
                              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.278 4 24 4c-7.682 0-14.346 4.337-17.694 10.691Z"/>
                              <path fill="#4CAF50" d="M24 44c5.18 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.143 35.091 26.715 36 24 36c-5.2 0-9.62-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44Z"/>
                              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.084 5.571h.003l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z"/>
                            </svg>
                            {tab === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
                          </div>
                          <p className="google-hint">
                            Add <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in <code>.env.local</code> to activate Google auth.
                          </p>
                        </div>
                      )}

                      <div style={{ marginTop: 6, paddingTop: 14, borderTop: '1px solid rgba(229,225,227,0.5)', textAlign: 'center' }}>
                        <p style={{ fontSize: 14, color: 'rgba(70,70,76,0.8)' }}>
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
