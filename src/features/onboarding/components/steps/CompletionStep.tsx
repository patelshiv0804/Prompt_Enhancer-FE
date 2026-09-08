import React from 'react';
import { Sun, Moon, Laptop, Sparkles, Check } from 'lucide-react';
import { ROLES, getModeIcon } from '@/constants/roles';
import { renderPresetAvatar, getInitials } from '@/constants/avatars';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface CompletionStepProps {
  displayName: string;
  role: string;
  mode: string;
  avatarUrl: string | null;
  avatarPreset: number;
  theme: 'light' | 'dark' | 'system';
  isDark: boolean;
}

const CONFETTI_PIECES = [
  { dx: -68, dy: -56, color: '#10B981', size: 7, rot: 45, shape: 'circle', delay: 0 },
  { dx: 64, dy: -62, color: '#6366F1', size: 6, rot: 80, shape: 'square', delay: 30 },
  { dx: -82, dy: -18, color: '#F59E0B', size: 8, rot: -30, shape: 'rect', delay: 15 },
  { dx: 78, dy: -24, color: '#EC4899', size: 6, rot: 120, shape: 'circle', delay: 45 },
  { dx: -52, dy: 48, color: '#8B5CF6', size: 7, rot: -60, shape: 'square', delay: 60 },
  { dx: 56, dy: 44, color: '#10B981', size: 6, rot: 90, shape: 'circle', delay: 30 },
  { dx: -24, dy: -78, color: '#06B6D4', size: 7, rot: 15, shape: 'rect', delay: 0 },
  { dx: 28, dy: -82, color: '#F59E0B', size: 8, rot: -45, shape: 'circle', delay: 20 },
  { dx: -88, dy: 24, color: '#EC4899', size: 6, rot: 75, shape: 'circle', delay: 40 },
  { dx: 86, dy: 22, color: '#6366F1', size: 7, rot: -90, shape: 'rect', delay: 25 },
  { dx: -42, dy: -68, color: '#3B82F6', size: 5, rot: 110, shape: 'square', delay: 50 },
  { dx: 46, dy: -62, color: '#10B981', size: 6, rot: -20, shape: 'circle', delay: 15 },
  { dx: -72, dy: 42, color: '#F59E0B', size: 7, rot: 60, shape: 'rect', delay: 35 },
  { dx: 74, dy: -50, color: '#8B5CF6', size: 6, rot: -70, shape: 'square', delay: 25 },
  { dx: 0, dy: -88, color: '#EC4899', size: 7, rot: 30, shape: 'circle', delay: 10 },
  { dx: -14, dy: 68, color: '#10B981', size: 6, rot: -40, shape: 'circle', delay: 50 },
  { dx: 18, dy: 66, color: '#3B82F6', size: 7, rot: 85, shape: 'rect', delay: 40 },
  { dx: -92, dy: -42, color: '#A855F7', size: 6, rot: -105, shape: 'square', delay: 30 },
  { dx: 92, dy: -38, color: '#F59E0B', size: 7, rot: 135, shape: 'circle', delay: 20 },
  { dx: -54, dy: -34, color: '#06B6D4', size: 5, rot: -15, shape: 'rect', delay: 40 },
  { dx: 54, dy: -28, color: '#10B981', size: 6, rot: 50, shape: 'square', delay: 25 },
];

export const CompletionStep: React.FC<CompletionStepProps> = ({
  displayName,
  role,
  mode,
  avatarUrl,
  avatarPreset,
  theme,
  isDark,
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');

  const roleObj = ROLES.find(
    (r) => r.id.toLowerCase() === role.toLowerCase() || r.label.toLowerCase() === role.toLowerCase()
  ) || ROLES[0];
  const RoleIcon = roleObj.icon;
  const ModeIcon = getModeIcon(mode);

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Laptop;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: isMobile ? 12 : 14,
      width: '100%',
      height: '100%',
      alignItems: 'center',
      textAlign: 'center',
      boxSizing: 'border-box',
    }}>
      <style>{`
        @keyframes badgePop {
          0% {
            transform: scale(0.2) rotate(-15deg);
            opacity: 0;
          }
          55% {
            transform: scale(1.22) rotate(4deg);
            opacity: 1;
          }
          75% {
            transform: scale(0.94) rotate(-1deg);
          }
          100% {
            transform: scale(1) rotate(0);
            opacity: 1;
          }
        }
        @keyframes ringPulse {
          0% {
            transform: translate(-50%, -50%) scale(0.6);
            opacity: 0.85;
          }
          100% {
            transform: translate(-50%, -50%) scale(2.2);
            opacity: 0;
          }
        }
        @keyframes confettiParticle {
          0% {
            transform: translate(0, 0) scale(0) rotate(0deg);
            opacity: 1;
          }
          40% {
            opacity: 1;
          }
          100% {
            transform: translate(var(--dx), var(--dy)) scale(1) rotate(var(--rot));
            opacity: 0;
          }
        }
        @keyframes milestoneSlideUp {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes sparkleTwinkle {
          0%, 100% { transform: scale(0.85); opacity: 0.6; }
          50% { transform: scale(1.2) rotate(15deg); opacity: 1; }
        }
      `}</style>

      {/* Milestone Celebration Centerpiece */}
      <div style={{ position: 'relative', width: isMobile ? 64 : 74, height: isMobile ? 64 : 74, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Pulsing Aura Rings (properly concentric and auto-hiding) */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isMobile ? 54 : 64,
          height: isMobile ? 54 : 64,
          borderRadius: '50%',
          border: '2px solid rgba(16, 185, 129, 0.45)',
          animation: 'ringPulse 1200ms cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
          opacity: 0,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isMobile ? 54 : 64,
          height: isMobile ? 54 : 64,
          borderRadius: '50%',
          border: '1.5px solid rgba(99, 102, 241, 0.40)',
          animation: 'ringPulse 1400ms cubic-bezier(0.1, 0.8, 0.3, 1) 120ms forwards',
          opacity: 0,
          pointerEvents: 'none',
        }} />

        {/* Confetti Particle Explosion */}
        {CONFETTI_PIECES.map((p, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: p.size,
              height: p.shape === 'rect' ? p.size * 1.6 : p.size,
              borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'rect' ? 2 : 2,
              background: p.color,
              // @ts-ignore
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
              '--rot': `${p.rot}deg`,
              animation: `confettiParticle 850ms cubic-bezier(0.16, 1, 0.3, 1) ${p.delay}ms both`,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Hero Celebration Badge with Elastic Pop */}
        <div
          style={{
            width: isMobile ? 54 : 64,
            height: isMobile ? 54 : 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isDark
              ? '0 8px 30px rgba(16, 185, 129, 0.45), 0 0 0 6px rgba(16, 185, 129, 0.18)'
              : '0 8px 24px rgba(16, 185, 129, 0.35), 0 0 0 6px rgba(16, 185, 129, 0.12)',
            animation: 'badgePop 550ms cubic-bezier(0.16, 1, 0.3, 1) both',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Check size={isMobile ? 28 : 34} strokeWidth={3.5} />
        </div>

        {/* Floating Twinkle Sparkles */}
        <div style={{
          position: 'absolute', top: -4, right: -4, zIndex: 3,
          color: '#F59E0B',
          animation: 'sparkleTwinkle 1800ms ease-in-out infinite',
        }}>
          <Sparkles size={isMobile ? 16 : 19} strokeWidth={2.4} />
        </div>
      </div>

      {/* Ready to Launch Pill */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: isMobile ? '3px 10px' : '4px 14px',
          borderRadius: 99,
          background: isDark ? 'rgba(16, 185, 129, 0.16)' : '#ECFDF5',
          border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.32)' : '#A7F3D0'}`,
          boxShadow: isDark ? '0 2px 10px rgba(16, 185, 129, 0.18)' : '0 1px 3px rgba(16, 185, 129, 0.10)',
          animation: 'milestoneSlideUp 340ms cubic-bezier(0.16, 1, 0.3, 1) 120ms both',
        }}
      >
        <Sparkles size={isMobile ? 12 : 13} style={{ color: isDark ? '#34D399' : '#059669' }} />
        <span style={{
          fontSize: isMobile ? 10.5 : 11.5,
          fontWeight: 800,
          color: isDark ? '#34D399' : '#059669',
          letterSpacing: '0.4px',
          textTransform: 'uppercase',
        }}>
          Ready to Launch
        </span>
      </div>

      {/* Premium Profile & Workspace Summary Card */}
      <div style={{
        width: '100%',
        maxWidth: 620,
        borderRadius: isMobile ? 14 : 18,
        background: isDark
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(99, 102, 241, 0.04) 100%)'
          : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.10)' : '#E2E8F0'}`,
        boxShadow: isDark
          ? '0 10px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.06)'
          : '0 4px 20px rgba(99, 102, 241, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
        padding: isMobile ? '12px 14px' : '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? 10 : 12,
        boxSizing: 'border-box',
        animation: 'milestoneSlideUp 380ms cubic-bezier(0.16, 1, 0.3, 1) 220ms both',
      }}>
        {/* Top Profile Header: Avatar + Display Name + Theme Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: isMobile ? 8 : 10,
          borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9'}`,
          width: '100%',
          boxSizing: 'border-box',
          gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 12, minWidth: 0 }}>
            {/* Avatar with gradient ring */}
            <div style={{
              position: 'relative',
              width: isMobile ? 38 : 44,
              height: isMobile ? 38 : 44,
              borderRadius: '50%',
              padding: 2,
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(99, 102, 241, 0.25)',
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                background: isDark ? '#140C2C' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : avatarPreset === 0 ? (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: isDark ? 'rgba(99, 102, 241, 0.2)' : '#EEF2FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? 13 : 15,
                    fontWeight: 800,
                    color: '#6366F1',
                  }}>
                    {getInitials(displayName)}
                  </div>
                ) : (
                  renderPresetAvatar(avatarPreset, isMobile ? 36 : 40, isMobile ? 12 : 14)
                )}
              </div>
            </div>

            {/* Name and Tag */}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: isMobile ? 13.5 : 15,
                  fontWeight: 800,
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {displayName}
                </span>
                {!isMobile && (
                  <span style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 99,
                    background: isDark ? 'rgba(16, 185, 129, 0.18)' : '#ECFDF5',
                    color: isDark ? '#34D399' : '#059669',
                    border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : '#A7F3D0'}`,
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                  }}>
                    Active
                  </span>
                )}
              </div>
              <span style={{
                fontSize: isMobile ? 10.5 : 11.5,
                color: isDark ? 'rgba(255, 255, 255, 0.5)' : '#64748B',
                marginTop: 1,
              }}>
                AURE Workspace Profile
              </span>
            </div>
          </div>

          {/* Theme Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: isMobile ? '3px 8px' : '4px 10px',
            borderRadius: 8,
            background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0'}`,
            fontSize: isMobile ? 11 : 12,
            fontWeight: 600,
            color: isDark ? 'rgba(255, 255, 255, 0.85)' : '#334155',
            flexShrink: 0,
          }}>
            <ThemeIcon size={isMobile ? 12 : 13.5} style={{ color: '#6366F1' }} />
            <span style={{ textTransform: 'capitalize' }}>{theme} Theme</span>
          </div>
        </div>

        {/* Bottom Configuration Cards (Role & Mode) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: isMobile ? 8 : 10,
          width: '100%',
          boxSizing: 'border-box',
        }}>
          {/* Primary Role Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 8 : 10,
            padding: isMobile ? '8px 10px' : '10px 14px',
            borderRadius: 12,
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0'}`,
            boxSizing: 'border-box',
            textAlign: 'left',
          }}>
            <div style={{
              width: isMobile ? 26 : 30,
              height: isMobile ? 26 : 30,
              borderRadius: 8,
              background: isDark ? 'rgba(99, 102, 241, 0.18)' : '#EEF2FF',
              color: '#6366F1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <RoleIcon size={isMobile ? 13 : 15} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: 9.5, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.45)' : '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Role
              </span>
              <span style={{ fontSize: isMobile ? 11.5 : 13, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {roleObj.label}
              </span>
            </div>
          </div>

          {/* Focus Mode Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 8 : 10,
            padding: isMobile ? '8px 10px' : '10px 14px',
            borderRadius: 12,
            background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0'}`,
            boxSizing: 'border-box',
            textAlign: 'left',
          }}>
            <div style={{
              width: isMobile ? 26 : 30,
              height: isMobile ? 26 : 30,
              borderRadius: 8,
              background: isDark ? 'rgba(234, 88, 12, 0.16)' : '#FFF7ED',
              color: '#EA580C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ModeIcon size={isMobile ? 13 : 15} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: 9.5, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.45)' : '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Focus Mode
              </span>
              <span style={{ fontSize: isMobile ? 11.5 : 13, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {mode}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
