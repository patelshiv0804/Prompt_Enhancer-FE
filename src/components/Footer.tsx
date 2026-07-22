'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Globe,
  ShieldCheck,
  Heart,
  Send,
  Zap,
  Lock,
  Clock,
  ChevronRight,
} from 'lucide-react';

/* ─── Inline SVG Social Icons ─── */
const XIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const GithubIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
);
const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
);
const YoutubeIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);
const DiscordIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>
);

/* ─── Animated Gradient Border Wrapper ─── */
const GlowBorderCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div
    className={className}
    style={{
      position: 'relative',
      borderRadius: 28,
      padding: 1,
      background: 'linear-gradient(135deg, rgba(124,58,237,0.6) 0%, rgba(168,85,247,0.3) 25%, rgba(124,58,237,0.1) 50%, rgba(168,85,247,0.3) 75%, rgba(124,58,237,0.6) 100%)',
      backgroundSize: '400% 400%',
      animation: 'footerGradientShift 8s ease infinite',
    }}
  >
    <div style={{ borderRadius: 27, overflow: 'hidden' }}>
      {children}
    </div>
  </div>
);

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer
      style={{
        background: '#08060E',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* CSS Animations */}
      <style>{`
        @keyframes footerGradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes footerFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-12px) scale(1.05); }
        }
        @keyframes footerPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes footerSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .footer-link {
          position: relative;
          padding: 4px 0;
        }
        .footer-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 1px;
          background: linear-gradient(90deg, #A78BFA, transparent);
          transition: width 250ms ease;
        }
        .footer-link:hover::after {
          width: 100%;
        }
        .footer-social:hover {
          background: rgba(124, 58, 237, 0.25) !important;
          border-color: rgba(167, 139, 250, 0.40) !important;
          color: #E9D5FF !important;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.25);
        }
        .footer-cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(124, 58, 237, 0.50), 0 0 60px rgba(124, 58, 237, 0.15) !important;
        }
        .footer-cta-secondary:hover {
          background: rgba(255, 255, 255, 0.12) !important;
          border-color: rgba(255, 255, 255, 0.25) !important;
          color: #FFFFFF !important;
        }
      `}</style>

      {/* ─── Ambient Mesh Background ─── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* Primary orb */}
        <div style={{
          position: 'absolute', top: -80, left: '20%', width: 700, height: 350,
          background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, transparent 65%)',
          animation: 'footerFloat 12s ease-in-out infinite',
        }} />
        {/* Secondary orb */}
        <div style={{
          position: 'absolute', bottom: -40, right: '15%', width: 550, height: 280,
          background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.08) 0%, transparent 65%)',
          animation: 'footerFloat 15s ease-in-out infinite 3s',
        }} />
        {/* Accent orb */}
        <div style={{
          position: 'absolute', top: '40%', left: '60%', width: 300, height: 300,
          background: 'radial-gradient(circle at center, rgba(236,72,153,0.05) 0%, transparent 60%)',
          animation: 'footerFloat 10s ease-in-out infinite 6s',
        }} />
        {/* Top edge gradient line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent 5%, rgba(124,58,237,0.35) 30%, rgba(168,85,247,0.50) 50%, rgba(124,58,237,0.35) 70%, transparent 95%)',
        }} />
        {/* Noise texture overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
          opacity: 0.4,
        }} />
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '80px 32px 40px', position: 'relative', zIndex: 2 }}>

        {/* ═══════════════════════════════════════════════════
           Hero CTA Section – Commented Out
           ═══════════════════════════════════════════════════ */}
        {/* <GlowBorderCard>
          ...CTA Banner...
        </GlowBorderCard> */}

        {/* ─── Micro Trust Strip – Commented Out ─── */}
        {/* <div>...Trust Strip...</div> */}

        {/* ─── Divider – Commented Out ─── */}
        {/* <div>...Divider...</div> */}

        {/* ═══════════════════════════════════════════════════
           Main Footer Grid (6-Column: Brand + Newsletter | 4 Link Cols)
           ═══════════════════════════════════════════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr 1fr 1fr 1fr',
          gap: '48px 40px',
          marginBottom: 48,
        }}>

          {/* ── Column 1: Brand + Newsletter ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(124,58,237,0.20), rgba(168,85,247,0.12))',
                border: '1px solid rgba(167,139,250,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(124,58,237,0.15)',
              }}>
                <img src="/logo_1.svg" alt="AURE" style={{ width: 22, height: 22, objectFit: 'contain' }} />
              </div>
              <span style={{
                fontSize: 17, fontWeight: 800, color: '#FFFFFF',
                letterSpacing: '1.8px', textTransform: 'uppercase',
              }}>AURE</span>
            </div>

            <p style={{
              fontSize: 13, color: '#64748B', lineHeight: 1.7, margin: 0,
            }}>
              The intelligent AI prompt engineering platform. Optimize, evaluate, and craft perfect prompts for every model.
            </p>

            {/* Newsletter Mini Form */}
            <div style={{ marginTop: 4 }}>
              <p style={{ fontSize: 11.5, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px' }}>
                Stay in the loop
              </p>
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 0 }}>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    flex: 1, padding: '9px 14px', fontSize: 12.5,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRight: 'none',
                    borderRadius: '10px 0 0 10px',
                    color: '#E2E8F0', outline: 'none',
                    transition: 'border-color 200ms ease',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.40)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'}
                />
                <button
                  type="submit"
                  style={{
                    padding: '9px 14px',
                    background: subscribed ? '#059669' : 'linear-gradient(135deg, #7C3AED, #9333EA)',
                    border: 'none',
                    borderRadius: '0 10px 10px 0',
                    color: '#FFFFFF', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 250ms ease',
                    minWidth: 40,
                  }}
                >
                  {subscribed ? '✓' : <Send size={14} />}
                </button>
              </form>
            </div>

            {/* Social Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              {[
                { icon: XIcon, href: 'https://x.com', label: 'X (Twitter)' },
                { icon: GithubIcon, href: 'https://github.com', label: 'GitHub' },
                { icon: LinkedinIcon, href: 'https://linkedin.com', label: 'LinkedIn' },
                { icon: YoutubeIcon, href: 'https://youtube.com', label: 'YouTube' },
                { icon: DiscordIcon, href: 'https://discord.com', label: 'Discord' },
              ].map((soc, i) => {
                const Ico = soc.icon;
                return (
                  <a
                    key={i}
                    href={soc.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={soc.label}
                    className="footer-social"
                    style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#64748B', transition: 'all 250ms cubic-bezier(0.4,0,0.2,1)',
                      textDecoration: 'none',
                    }}
                  >
                    <Ico size={15} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* ── Column 2: Product ── */}
          <FooterLinkColumn
            title="Product"
            links={[
              { name: 'Prompt Optimizer', href: '/dashboard/optimizer' },
              { name: 'Style Memory', href: '/dashboard/style-memory' },
              { name: 'Prompt Vault', href: '/dashboard/vault' },
              { name: 'Template Library', href: '/dashboard/templates' },
              { name: 'Quality Benchmark', href: '/dashboard/optimizer' },
              { name: 'Chrome Extension', href: '#', badge: 'Soon', badgeColor: 'purple' },
            ]}
          />

          {/* ── Column 3: Supported Models ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <h4 style={{
              fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '1.2px', color: '#A78BFA', margin: '0 0 6px',
            }}>
              Supported Models
            </h4>
            {[
              { name: 'ChatGPT (GPT-4o)', icon: '/chatgpt-icon.svg' },
              { name: 'Claude 3.5 Sonnet', icon: '/claude-ai-icon.svg' },
              { name: 'Google Gemini 1.5', icon: '/google-gemini-icon.svg' },
              { name: 'Grok AI', icon: '/grok-icon.svg', filter: 'brightness(0) invert(1)' },
              { name: 'Midjourney v6', icon: '/midjourney-color-icon.svg' },
              { name: 'VEO Video AI', icon: '/veo-icon.svg' },
              { name: 'Perplexity AI', icon: '/perplexity-ai-icon.svg' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '4px 0', fontSize: 13, color: '#64748B',
                  transition: 'color 200ms ease',
                  cursor: 'default',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#CBD5E1')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 5,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <img
                    src={item.icon} alt={item.name}
                    width={12} height={12}
                    style={{
                      width: 12, height: 12, objectFit: 'contain',
                      filter: item.filter || 'none', opacity: 0.75,
                    }}
                  />
                </div>
                <span>{item.name}</span>
              </div>
            ))}
          </div>

          {/* ── Column 4: Resources ── */}
          <FooterLinkColumn
            title="Resources"
            links={[
              { name: 'Documentation', href: '#' },
              { name: 'Prompt Engineering Guide', href: '#' },
              { name: 'API Reference', href: '#' },
              { name: 'Community Hub', href: '#' },
              { name: 'Research Papers', href: '#' },
              { name: 'System Status', href: '#', status: true },
              { name: 'Changelog', href: '#', badge: 'New', badgeColor: 'blue' },
            ]}
          />

          {/* ── Column 5: Company ── */}
          <FooterLinkColumn
            title="Company"
            links={[
              { name: 'About AURE', href: '#' },
              { name: 'Careers', href: '#', badge: "We're hiring!", badgeColor: 'green' },
              { name: 'Blog', href: '#' },
              { name: 'Privacy Policy', href: '#' },
              { name: 'Terms of Service', href: '#' },
              { name: 'Security & Trust', href: '#' },
              { name: 'Contact Support', href: '#' },
            ]}
          />
        </div>

        {/* ─── Bottom Divider ─── */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.08) 30%, rgba(148,163,184,0.08) 70%, transparent 100%)',
        }} />

        {/* ═══════════════════════════════════════════════════
           Bottom Bar: Copyright + Certs + Language
           ═══════════════════════════════════════════════════ */}
        <div style={{
          paddingTop: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 20, flexWrap: 'wrap', fontSize: 12, color: '#475569',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>© {new Date().getFullYear()} AURE Inc.</span>
            <span style={{ color: '#334155' }}>·</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              Made with <Heart size={11} fill="#F43F5E" color="#F43F5E" style={{ animation: 'footerPulse 2s ease infinite' }} /> by builders, for builders
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Trust Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={13} style={{ color: '#34D399' }} />
              <span style={{ color: '#64748B', fontSize: 11.5 }}>SOC2 Type II</span>
            </div>
            <span style={{ color: '#1E293B' }}>·</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={12} style={{ color: '#A78BFA' }} />
              <span style={{ color: '#64748B', fontSize: 11.5 }}>GDPR Compliant</span>
            </div>
            <span style={{ color: '#1E293B' }}>·</span>
            {/* Language Selector */}
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 8,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#94A3B8', fontSize: 11.5, fontWeight: 500,
                cursor: 'pointer', transition: 'all 200ms ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              }}
            >
              <Globe size={12} />
              English (US)
              <ChevronRight size={10} style={{ opacity: 0.5, transform: 'rotate(90deg)' }} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}


/* ─── Reusable Footer Link Column ─── */
interface FooterLink {
  name: string;
  href: string;
  badge?: string;
  badgeColor?: 'purple' | 'green' | 'blue';
  status?: boolean;
}

function FooterLinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  const badgeStyles: Record<string, { bg: string; color: string; border: string }> = {
    purple: { bg: 'rgba(124,58,237,0.18)', color: '#C4B5FD', border: 'rgba(167,139,250,0.25)' },
    green: { bg: 'rgba(16,185,129,0.12)', color: '#6EE7B7', border: 'rgba(16,185,129,0.25)' },
    blue: { bg: 'rgba(59,130,246,0.12)', color: '#93C5FD', border: 'rgba(59,130,246,0.25)' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h4 style={{
        fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '1.2px', color: '#A78BFA', margin: '0 0 6px',
      }}>
        {title}
      </h4>
      {links.map((link, idx) => (
        <Link
          key={idx}
          href={link.href}
          className="footer-link"
          style={{
            fontSize: 13, color: '#64748B', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 7,
            transition: 'color 200ms ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#E2E8F0')}
          onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
        >
          <span>{link.name}</span>
          {link.badge && (() => {
            const s = badgeStyles[link.badgeColor || 'purple'];
            return (
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '1.5px 7px',
                borderRadius: 9999, background: s.bg, color: s.color,
                border: `1px solid ${s.border}`, lineHeight: '14px',
              }}>
                {link.badge}
              </span>
            );
          })()}
          {link.status && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#34D399', fontWeight: 600 }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%', background: '#34D399',
                display: 'inline-block', boxShadow: '0 0 6px rgba(52,211,153,0.5)',
                animation: 'footerPulse 2s ease infinite',
              }} />
              All Systems Operational
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
