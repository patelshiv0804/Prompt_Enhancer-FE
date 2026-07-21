'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, X, Zap, ChevronRight, ArrowRight,
  Fingerprint, Palette, Film, Trees, User as UserIcon,
  Sparkles, ChevronDown, Pencil, Trash2,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════════════ */

interface StyleProfile {
  id: string;
  name: string;
  description: string;
  category: Category;
  injectionPrompt: string;
  tags: string[];
  enabled: boolean;
  lastUsed?: string;
}

type Category = 'character' | 'art-style' | 'cinematic-style' | 'environment';

const CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'character', label: 'Character' },
  { id: 'art-style', label: 'Art Style' },
  { id: 'cinematic-style', label: 'Cinematic Style' },
  { id: 'environment', label: 'Environment' },
];

const CATEGORY_META: Record<Category, { icon: React.ElementType; color: string }> = {
  'character': { icon: UserIcon, color: '#7C3AED' },
  'art-style': { icon: Palette, color: '#EC4899' },
  'cinematic-style': { icon: Film, color: '#F59E0B' },
  'environment': { icon: Trees, color: '#10B981' },
};

const CATEGORY_OPTIONS: { id: Category; label: string }[] = [
  { id: 'character', label: 'Character' },
  { id: 'art-style', label: 'Art Style' },
  { id: 'cinematic-style', label: 'Cinematic Style' },
  { id: 'environment', label: 'Environment' },
];

const MOCK_PROFILES: StyleProfile[] = [
  {
    id: 'sp-1',
    name: 'Cyberpunk Hero',
    description: 'Neon-lit, high-contrast character design with augmented cybernetic features and dystopian flair.',
    category: 'character',
    injectionPrompt: 'Apply cyberpunk aesthetic: neon glow, chrome implants, rain-soaked streets, holographic HUD overlays.',
    tags: ['#sci-fi', '#character', '#neon', '#cyberpunk'],
    enabled: true,
    lastUsed: '1d ago',
  },
  {
    id: 'sp-2',
    name: 'Watercolor Dream',
    description: 'Soft watercolor wash effect with bleeding edges, muted pastels, and organic brush textures.',
    category: 'art-style',
    injectionPrompt: 'Render in watercolor style: soft edges, paper texture, transparent layering, muted warm palette.',
    tags: ['#watercolor', '#soft', '#artistic', '#pastel'],
    enabled: false,
    lastUsed: '3d ago',
  },
  {
    id: 'sp-3',
    name: 'Film Noir',
    description: 'Classic black-and-white cinematic look with dramatic shadows, venetian blinds lighting, and moody atmosphere.',
    category: 'cinematic-style',
    injectionPrompt: 'Apply film noir style: high contrast B&W, deep shadows, low-key lighting, 1940s atmosphere, grain texture.',
    tags: ['#noir', '#cinematic', '#monochrome'],
    enabled: true,
    lastUsed: '2h ago',
  },
  {
    id: 'sp-4',
    name: 'Enchanted Forest',
    description: 'Mystical woodland environment with bioluminescent flora, misty atmosphere, and ancient tree canopies.',
    category: 'environment',
    injectionPrompt: 'Create enchanted forest setting: bioluminescent plants, volumetric fog, ancient trees, magical particles, twilight.',
    tags: ['#forest', '#fantasy', '#magical', '#nature'],
    enabled: false,
    lastUsed: '5d ago',
  },
  {
    id: 'sp-5',
    name: 'Anime Protagonist',
    description: 'Vibrant anime character design with large expressive eyes, dynamic hair, and cel-shaded rendering.',
    category: 'character',
    injectionPrompt: 'Design in anime style: large eyes, cel shading, vibrant palette, dynamic pose, speed lines, detailed hair.',
    tags: ['#anime', '#character', '#vibrant'],
    enabled: true,
    lastUsed: 'Just now',
  },
];

/* ═══════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════ */

/* ── Category Avatar ── */
function CategoryAvatar({ category, size = 40 }: { category: Category; size?: number }) {
  const { icon: Icon, color } = CATEGORY_META[category];
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `${color}14`, border: `1px solid ${color}22`,
      color, flexShrink: 0,
    }}>
      <Icon size={size * 0.45} strokeWidth={1.8} />
    </div>
  );
}

/* ── Toggle Switch ── */
function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={enabled ? 'Disable auto-injection' : 'Enable auto-injection'}
      style={{
        width: 38, height: 20, borderRadius: 9999, border: 'none', cursor: 'pointer',
        background: enabled ? 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' : 'rgba(124,58,237,0.12)',
        position: 'relative', transition: 'background 250ms ease', flexShrink: 0,
        boxShadow: enabled ? '0 2px 8px rgba(124,58,237,0.25)' : 'none',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: enabled ? 20 : 2,
        width: 16, height: 16, borderRadius: '50%', background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        transition: 'left 250ms ease',
      }} />
    </button>
  );
}

/* ── Profile Card ── */
function ProfileCard({ profile, onToggle, onEdit, onDelete }: {
  profile: StyleProfile;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${profile.enabled ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.10)'}`,
      borderRadius: 16,
      padding: '24px',
      display: 'flex', flexDirection: 'column', gap: 16,
      justifyContent: 'space-between',
      height: '100%',
      minHeight: 280,
      boxShadow: '0 4px 12px rgba(109,40,217,0.06), 0 1px 3px rgba(0,0,0,0.04)',
      transition: 'transform 250ms ease, box-shadow 250ms ease, border-color 250ms ease',
      animation: 'dimCardEnter 400ms ease both',
      opacity: profile.enabled ? 1 : 0.8,
    }}
      className="hover:translate-y-[-3px] hover:shadow-[0_8px_24px_rgba(109,40,217,0.09),0_2px_6px_rgba(0,0,0,0.05)] hover:!border-[rgba(124,58,237,0.18)] hover:!opacity-100"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        {/* Top row: Avatar + Name + Category + Delete */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <CategoryAvatar category={profile.category} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
              {profile.name}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span style={{
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
                color: CATEGORY_META[profile.category].color, opacity: 0.8,
              }}>
                {CATEGORY_OPTIONS.find(c => c.id === profile.category)?.label}
              </span>
            </div>
          </div>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            title="Delete profile"
            style={{
              width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
              background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-secondary)', transition: 'all 200ms ease', flexShrink: 0,
            }}
            className="hover:!bg-[rgba(239,68,68,0.08)] hover:!text-[#EF4444]"
          >
            <Trash2 size={14} strokeWidth={1.8} />
          </button>
        </div>

        {/* Description */}
        <p style={{
          margin: 0, fontSize: 13, lineHeight: 1.55, color: 'var(--color-text-secondary)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {profile.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {profile.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 11.5, fontWeight: 500, padding: '3px 10px', borderRadius: 9999,
              background: 'rgba(124,58,237,0.06)', color: 'var(--color-text-secondary)',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div style={{
        borderTop: '1px solid rgba(124,58,237,0.08)',
        paddingTop: 14,
        marginTop: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        {/* Row 1: Auto-inject + Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: '#312E81',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            Auto-inject <span style={{ color: 'var(--color-primary)', fontSize: 12 }}>✦</span>
          </span>
          <ToggleSwitch enabled={profile.enabled} onToggle={onToggle} />
        </div>

        {/* Row 2: Edit Profile + Metadata */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={onEdit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--color-primary)',
              transition: 'opacity 200ms ease',
            }}
            className="hover:opacity-80"
          >
            <Pencil size={13} strokeWidth={2} />
            Edit Profile
          </button>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', opacity: 0.8 }}>
            Last used {profile.lastUsed || 'Never'}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Add New Card (Dashed) ── */
function AddNewCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        border: '2px dashed rgba(124,58,237,0.18)',
        borderRadius: 16,
        padding: '24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 12, cursor: 'pointer',
        height: '100%',
        minHeight: 280,
        transition: 'all 250ms ease',
      }}
      className="hover:!border-[rgba(124,58,237,0.35)] hover:!bg-[rgba(124,58,237,0.03)] hover:translate-y-[-2px]"
    >
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(124,58,237,0.08)', color: 'var(--color-primary)',
      }}>
        <Plus size={22} strokeWidth={1.8} />
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
        Add New Profile
      </span>
      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: 180 }}>
        Create a custom style to apply during optimization
      </span>
    </button>
  );
}

/* ── Injection Flow Card — Premium Redesign ── */
function InjectionFlowCard() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % 3);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      label: 'Base Prompt',
      subtitle: 'Your raw creative input',
      icon: Sparkles,
      color: '#38BDF8',
      colorRgb: '56,189,248',
      gradient: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 100%)',
    },
    {
      label: 'Style Profile',
      subtitle: 'Signature injection layer',
      icon: Fingerprint,
      color: '#C084FC',
      colorRgb: '192,132,252',
      gradient: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
    },
    {
      label: 'Optimized Output',
      subtitle: 'Production-ready result',
      icon: Zap,
      color: '#34D399',
      colorRgb: '52,211,153',
      gradient: 'linear-gradient(135deg, #34D399 0%, #22D3EE 100%)',
    },
  ];

  return (
    <div style={{
      position: 'relative',
      borderRadius: 28,
      marginBottom: 36,
      padding: 1,
      background: 'linear-gradient(135deg, rgba(124,58,237,0.35) 0%, rgba(56,189,248,0.20) 30%, rgba(192,132,252,0.30) 60%, rgba(52,211,153,0.25) 100%)',
      overflow: 'hidden',
    }}>
      {/* Shimmer border sweep */}
      <style>{`
        @keyframes ifc-borderShimmer {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes ifc-floatOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -20px) scale(1.15); }
          66% { transform: translate(-20px, 15px) scale(0.9); }
        }
        @keyframes ifc-floatOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, -25px) scale(1.2); }
        }
        @keyframes ifc-floatOrb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(25px, 20px) scale(0.85); }
          80% { transform: translate(-15px, -10px) scale(1.1); }
        }
        @keyframes ifc-nodeBreath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes ifc-ringPulse {
          0% { transform: scale(0.85); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 0; }
          100% { transform: scale(0.85); opacity: 0; }
        }
        @keyframes ifc-nodeGlow0 {
          0%, 100% { box-shadow: 0 0 20px rgba(56,189,248,0.15), 0 0 60px rgba(56,189,248,0.05), inset 0 1px 0 rgba(255,255,255,0.08); }
          50% { box-shadow: 0 0 30px rgba(56,189,248,0.45), 0 0 80px rgba(56,189,248,0.15), inset 0 1px 0 rgba(255,255,255,0.15); }
        }
        @keyframes ifc-nodeGlow1 {
          0%, 100% { box-shadow: 0 0 20px rgba(192,132,252,0.15), 0 0 60px rgba(192,132,252,0.05), inset 0 1px 0 rgba(255,255,255,0.08); }
          50% { box-shadow: 0 0 30px rgba(192,132,252,0.45), 0 0 80px rgba(192,132,252,0.15), inset 0 1px 0 rgba(255,255,255,0.15); }
        }
        @keyframes ifc-nodeGlow2 {
          0%, 100% { box-shadow: 0 0 20px rgba(52,211,153,0.15), 0 0 60px rgba(52,211,153,0.05), inset 0 1px 0 rgba(255,255,255,0.08); }
          50% { box-shadow: 0 0 30px rgba(52,211,153,0.45), 0 0 80px rgba(52,211,153,0.15), inset 0 1px 0 rgba(255,255,255,0.15); }
        }
        @keyframes ifc-packetTravel {
          0% { offset-distance: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @keyframes ifc-flowDash {
          to { stroke-dashoffset: -24; }
        }
        .ifc-active-node-0 { animation: ifc-nodeGlow0 2.4s infinite ease-in-out, ifc-nodeBreath 2.4s infinite ease-in-out !important; }
        .ifc-active-node-1 { animation: ifc-nodeGlow1 2.4s infinite ease-in-out, ifc-nodeBreath 2.4s infinite ease-in-out !important; }
        .ifc-active-node-2 { animation: ifc-nodeGlow2 2.4s infinite ease-in-out, ifc-nodeBreath 2.4s infinite ease-in-out !important; }
      `}</style>

      {/* Inner card */}
      <div style={{
        background: 'linear-gradient(145deg, #0C0620 0%, #150D30 30%, #1A0E3A 55%, #0D0920 100%)',
        borderRadius: 27,
        padding: '40px 48px 44px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* ─── Layered background effects ─── */}
        {/* Aurora mesh */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.7 }}>
          <div style={{
            position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '140%',
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 65%)',
            filter: 'blur(40px)',
          }} />
          <div style={{
            position: 'absolute', top: '-30%', right: '-5%', width: '50%', height: '120%',
            background: 'radial-gradient(ellipse, rgba(56,189,248,0.10) 0%, transparent 60%)',
            filter: 'blur(50px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-20%', left: '30%', width: '45%', height: '100%',
            background: 'radial-gradient(ellipse, rgba(52,211,153,0.08) 0%, transparent 55%)',
            filter: 'blur(45px)',
          }} />
        </div>

        {/* Floating orbs */}
        <div style={{
          position: 'absolute', top: '15%', left: '8%', width: 120, height: 120,
          borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
          animation: 'ifc-floatOrb1 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '40%', right: '12%', width: 90, height: 90,
          borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(56,189,248,0.10) 0%, transparent 70%)',
          animation: 'ifc-floatOrb2 10s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '50%', width: 80, height: 80,
          borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)',
          animation: 'ifc-floatOrb3 14s ease-in-out infinite',
        }} />

        {/* Fine dot grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
          backgroundImage: 'radial-gradient(circle, #FFFFFF 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        {/* ─── Content ─── */}
        <div style={{ position: 'relative', zIndex: 2 }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '5px 14px 5px 10px', borderRadius: 9999,
              background: 'rgba(124,58,237,0.10)',
              border: '1px solid rgba(167,139,250,0.15)',
              marginBottom: 16,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={10} strokeWidth={2.5} color="#FFFFFF" />
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '1.2px', color: '#C4B5FD',
              }}>
                How It Works
              </span>
            </div>

            <h3 style={{
              fontSize: 24, fontWeight: 800, letterSpacing: -0.5, margin: '0 0 10px',
              background: 'linear-gradient(135deg, #EDE9FE 0%, #C4B5FD 40%, #A78BFA 70%, #38BDF8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.25,
            }}>
              Smart Style Injection Flow
            </h3>
            <p style={{
              fontSize: 14, color: 'rgba(196,181,253,0.55)', margin: 0,
              lineHeight: 1.65, maxWidth: 560,
            }}>
              Your enabled style profiles are automatically appended to your base prompts during optimization, instantly giving your drafts the desired creative signature.
            </p>
          </div>

          {/* ─── 3-Step Flow Pipeline ─── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 0, padding: '8px 0 4px',
          }}>
            {steps.map((step, i) => {
              const isActive = activeIdx === i;
              const isNext = activeIdx === i && i < steps.length - 1;
              return (
                <React.Fragment key={step.label}>
                  {/* Step Node */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 14, flex: '0 0 auto', position: 'relative',
                  }}>
                    {/* Outer pulse ring (active only) */}
                    {isActive && (
                      <div style={{
                        position: 'absolute', top: 0, left: '50%',
                        width: 70, height: 70,
                        marginLeft: -35,
                        borderRadius: '50%',
                        border: `2px solid ${step.color}`,
                        opacity: 0,
                        animation: 'ifc-ringPulse 2.4s infinite ease-out',
                        pointerEvents: 'none',
                      }} />
                    )}

                    {/* Main circle */}
                    <div
                      className={isActive ? `ifc-active-node-${i}` : ''}
                      style={{
                        width: 70, height: 70, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative',
                        background: isActive
                          ? `radial-gradient(circle at 35% 35%, rgba(${step.colorRgb},0.25) 0%, rgba(${step.colorRgb},0.08) 60%, transparent 100%)`
                          : `radial-gradient(circle at 35% 35%, rgba(${step.colorRgb},0.08) 0%, rgba(${step.colorRgb},0.03) 60%, transparent 100%)`,
                        border: isActive
                          ? `2px solid rgba(${step.colorRgb},0.55)`
                          : `1px solid rgba(${step.colorRgb},0.12)`,
                        backdropFilter: 'blur(8px)',
                        transition: 'all 600ms cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      {/* Inner decorative ring */}
                      <div style={{
                        position: 'absolute', inset: 6, borderRadius: '50%',
                        border: `1px solid rgba(${step.colorRgb},${isActive ? 0.2 : 0.06})`,
                        transition: 'border-color 600ms ease',
                      }} />
                      <step.icon
                        size={26}
                        strokeWidth={isActive ? 2 : 1.5}
                        style={{
                          color: step.color,
                          opacity: isActive ? 1 : 0.35,
                          filter: isActive ? `drop-shadow(0 0 8px rgba(${step.colorRgb},0.5))` : 'none',
                          transition: 'all 600ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </div>

                    {/* Label + subtitle */}
                    <div style={{ textAlign: 'center', minWidth: 110 }}>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: isActive ? '#EDE9FE' : 'rgba(237,233,254,0.4)',
                        display: 'block', whiteSpace: 'nowrap',
                        transition: 'color 500ms ease',
                        letterSpacing: '-0.01em',
                      }}>
                        {step.label}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 500,
                        color: isActive ? `rgba(${step.colorRgb},0.7)` : 'rgba(167,139,250,0.2)',
                        display: 'block', marginTop: 3, whiteSpace: 'nowrap',
                        transition: 'color 500ms ease',
                      }}>
                        {step.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* ─── Connector ─── */}
                  {i < steps.length - 1 && (
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      padding: '0 12px', marginBottom: 40,
                      position: 'relative',
                    }}>
                      <svg width="100" height="20" viewBox="0 0 100 20" style={{ overflow: 'visible' }}>
                        <defs>
                          <linearGradient id={`ifc-connGrad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={steps[i].color} stopOpacity={isNext ? 0.6 : 0.1} />
                            <stop offset="100%" stopColor={steps[i + 1].color} stopOpacity={isNext ? 0.6 : 0.1} />
                          </linearGradient>
                          <filter id={`ifc-connGlow-${i}`}>
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        {/* Track background */}
                        <line
                          x1="4" y1="10" x2="88" y2="10"
                          stroke="rgba(167,139,250,0.08)"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        {/* Active flow line */}
                        <line
                          x1="4" y1="10" x2="88" y2="10"
                          stroke={`url(#ifc-connGrad-${i})`}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeDasharray={isNext ? '6, 8' : 'none'}
                          style={{
                            animation: isNext ? 'ifc-flowDash 1s linear infinite' : 'none',
                            transition: 'all 500ms ease',
                          }}
                          filter={isNext ? `url(#ifc-connGlow-${i})` : undefined}
                        />
                        {/* Traveling data packet */}
                        {isNext && (
                          <circle r="3.5" fill={steps[i].color} opacity="0.9"
                            style={{
                              filter: `drop-shadow(0 0 6px ${steps[i].color})`,
                              offsetPath: `path('M 4 10 L 88 10')`,
                              animation: 'ifc-packetTravel 1.4s ease-in-out infinite',
                            }}
                          />
                        )}
                        {/* Arrow head */}
                        <path
                          d="M 84 5 L 92 10 L 84 15"
                          fill="none"
                          stroke={isNext ? steps[i + 1].color : 'rgba(167,139,250,0.15)'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            transition: 'stroke 500ms ease',
                            opacity: isNext ? 0.8 : 0.3,
                          }}
                        />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Bottom progress indicator */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20,
          }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                width: activeIdx === i ? 24 : 6, height: 6,
                borderRadius: 9999,
                background: activeIdx === i
                  ? step.gradient
                  : 'rgba(167,139,250,0.12)',
                transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: activeIdx === i ? `0 0 12px rgba(${step.colorRgb},0.3)` : 'none',
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Create / Edit Profile Centered Modal ── */
function ProfileModal({
  open, onClose, onSave, editingProfile,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (profile: Omit<StyleProfile, 'id'>) => void;
  editingProfile?: StyleProfile | null;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('character');
  const [injection, setInjection] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const isEditing = !!editingProfile;

  // Populate form on open — prefill when editing, reset when creating
  useEffect(() => {
    if (open && editingProfile) {
      setName(editingProfile.name);
      setCategory(editingProfile.category);
      setInjection(editingProfile.injectionPrompt);
      setTagsInput(editingProfile.tags.map(t => t.replace(/^#/, '')).join(', '));
    } else if (open) {
      setName(''); setCategory('character'); setInjection(''); setTagsInput('');
    }
  }, [open, editingProfile]);

  const handleSave = () => {
    if (!name.trim()) return;
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean).map(t => t.startsWith('#') ? t : `#${t}`);
    onSave({ name: name.trim(), description: injection.slice(0, 120), category, injectionPrompt: injection, tags, enabled: editingProfile?.enabled ?? true });
    onClose();
  };

  return (
    <>
      {/* Glassmorphic Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 10, 30, 0.45)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 998,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 300ms ease',
        }}
      />

      {/* Spring Animated Modal Container */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: open ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.95)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        width: 520,
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 48px)',
        background: '#FFFFFF',
        borderRadius: 24,
        border: '1px solid rgba(124,58,237,0.12)',
        boxShadow: '0 24px 64px rgba(109,40,217,0.18), 0 0 1px rgba(124,58,237,0.3)',
        zIndex: 999,
        display: 'flex', flexDirection: 'column',
        transition: 'transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24px 28px 20px',
          borderBottom: '1px solid rgba(124,58,237,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(168,85,247,0.1) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-primary)',
            }}>
              <Fingerprint size={20} strokeWidth={1.8} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                {isEditing ? 'Edit Style Profile' : 'New Style Profile'}
              </h2>
              <p style={{ margin: 3, padding: 0, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                {isEditing ? 'Modify your custom creative signature' : 'Design a custom preset for auto-injection'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-secondary)', transition: 'all 200ms ease',
            }}
            className="hover:!bg-[rgba(124,58,237,0.08)] hover:!text-[var(--color-text-primary)]"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Profile Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '0.02em' }}>
              Profile Name
            </label>
            <input
              type="text" placeholder="e.g. Cyberpunk Hero"
              value={name} onChange={e => setName(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', fontSize: 13, borderRadius: 10,
                border: '1px solid rgba(124,58,237,0.12)', background: '#FFFFFF',
                outline: 'none', color: 'var(--color-text-primary)',
                transition: 'border-color 200ms ease, box-shadow 200ms ease',
              }}
              className="focus:!border-[rgba(124,58,237,0.35)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.08)]"
            />
          </div>

          {/* Interactive Category Selector Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '0.02em' }}>
              Category
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {CATEGORY_OPTIONS.map(opt => {
                const isSel = category === opt.id;
                const meta = CATEGORY_META[opt.id];
                const Icon = meta.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setCategory(opt.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 14px', borderRadius: 12,
                      border: isSel ? `2px solid ${meta.color}` : '1px solid rgba(124,58,237,0.12)',
                      background: isSel ? `${meta.color}08` : '#FFFFFF',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 200ms ease',
                    }}
                    className={!isSel ? 'hover:!border-[rgba(124,58,237,0.22)] hover:!bg-[rgba(124,58,237,0.02)]' : ''}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${meta.color}14`, color: meta.color,
                      transition: 'all 200ms ease',
                    }}>
                      <Icon size={14} />
                    </div>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isSel ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                      transition: 'color 200ms ease',
                    }}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Injection Prompt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '0.02em' }}>
              Injection Prompt
            </label>
            <textarea
              placeholder="Describe the style instructions to inject..."
              value={injection} onChange={e => setInjection(e.target.value)}
              rows={4}
              style={{
                width: '100%', padding: '10px 14px', fontSize: 13, borderRadius: 10,
                border: '1px solid rgba(124,58,237,0.12)', background: '#FFFFFF',
                outline: 'none', color: 'var(--color-text-primary)', resize: 'none',
                lineHeight: 1.55, fontFamily: 'inherit',
                transition: 'border-color 200ms ease, box-shadow 200ms ease',
              }}
              className="focus:!border-[rgba(124,58,237,0.35)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.08)]"
            />
            <span style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              This instructions will be appended to base prompts automatically when active.
            </span>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '0.02em' }}>
              Tags
            </label>
            <input
              type="text" placeholder="sci-fi, character, neon (comma separated)"
              value={tagsInput} onChange={e => setTagsInput(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', fontSize: 13, borderRadius: 10,
                border: '1px solid rgba(124,58,237,0.12)', background: '#FFFFFF',
                outline: 'none', color: 'var(--color-text-primary)',
                transition: 'border-color 200ms ease, box-shadow 200ms ease',
              }}
              className="focus:!border-[rgba(124,58,237,0.35)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.08)]"
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
          padding: '16px 28px 20px',
          borderTop: '1px solid rgba(124,58,237,0.08)',
          background: '#FAFAFC',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              border: '1px solid rgba(124,58,237,0.12)', cursor: 'pointer',
              background: '#FFFFFF', color: 'var(--color-text-primary)',
              transition: 'all 200ms ease',
            }}
            className="hover:!bg-[rgba(124,58,237,0.05)] hover:!border-[rgba(124,58,237,0.22)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            style={{
              padding: '9px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              border: 'none', cursor: name.trim() ? 'pointer' : 'not-allowed',
              background: name.trim() ? 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' : 'rgba(124,58,237,0.25)',
              color: 'white',
              boxShadow: name.trim() ? '0 4px 14px rgba(124,58,237,0.30)' : 'none',
              transition: 'all 200ms ease',
            }}
            className={name.trim() ? 'hover:translate-y-[-1px] hover:brightness-105' : ''}
          >
            {isEditing ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════ */

export default function StyleMemoryPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<StyleProfile[]>(MOCK_PROFILES);
  const [activeFilter, setActiveFilter] = useState<Category | 'all'>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<StyleProfile | null>(null);

  const filtered = activeFilter === 'all'
    ? profiles
    : profiles.filter(p => p.category === activeFilter);

  const handleSaveProfile = (data: Omit<StyleProfile, 'id'>) => {
    if (editingProfile) {
      // Update existing
      setProfiles(prev => prev.map(p => p.id === editingProfile.id ? { ...p, ...data } : p));
    } else {
      // Create new
      const newProfile: StyleProfile = { ...data, id: `sp-${Date.now()}` };
      setProfiles(prev => [newProfile, ...prev]);
    }
    setEditingProfile(null);
  };

  const handleToggle = (id: string) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const handleEdit = (profile: StyleProfile) => {
    setEditingProfile(profile);
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this style profile?')) {
      setProfiles(prev => prev.filter(p => p.id !== id));
    }
  };

  const openCreateDrawer = () => {
    setEditingProfile(null);
    setDrawerOpen(true);
  };

  return (
    <>
      <div id="style-memory-page" style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 48px', paddingTop: 8,
        width: '100%', display: 'flex', flexDirection: 'column', paddingBottom: 64,
      }}>

        {/* ── Header ── */}
        <div style={{ padding: '28px 0 24px' }}>
          <span style={{
            fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.9px', color: 'var(--color-text-secondary)',
            display: 'block', marginBottom: 8,
          }}>
            Your Creative Signature
          </span>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: -0.3, margin: '0 0 6px' }}>
                Style Memory
              </h1>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
                Personalize your optimization with saved style profiles
              </p>
            </div>
            <button
              id="create-profile-btn"
              onClick={openCreateDrawer}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                color: 'white',
                boxShadow: '0 4px 14px rgba(124,58,237,0.30)',
                transition: 'all 200ms ease', flexShrink: 0,
              }}
              className="hover:translate-y-[-1px] hover:brightness-105"
            >
              <Plus size={14} strokeWidth={2.5} />Create New Profile
            </button>
          </div>
        </div>

        {/* ── Filter Pills ── */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              id={`filter-${cat.id}`}
              onClick={() => setActiveFilter(cat.id)}
              style={{
                padding: '6px 14px', borderRadius: 9999, fontSize: 12.5, fontWeight: 500,
                cursor: 'pointer', border: 'none', whiteSpace: 'nowrap',
                transition: 'all 180ms ease', flexShrink: 0,
                background: activeFilter === cat.id
                  ? 'linear-gradient(135deg, #7C3AED, #A855F7)'
                  : 'rgba(124,58,237,0.06)',
                color: activeFilter === cat.id ? 'white' : 'var(--color-text-secondary)',
                boxShadow: activeFilter === cat.id ? '0 3px 10px rgba(124,58,237,0.25)' : 'none',
              }}
              className={activeFilter !== cat.id ? 'hover:!bg-[rgba(124,58,237,0.12)] hover:!text-[var(--color-text-primary)]' : ''}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── Injection Flow Card ── */}
        <InjectionFlowCard />

        {/* ── Profile Cards Grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}>
          {filtered.map((profile, i) => (
            <div key={profile.id} style={{ animationDelay: `${i * 60}ms` }}>
              <ProfileCard
                profile={profile}
                onToggle={() => handleToggle(profile.id)}
                onEdit={() => handleEdit(profile)}
                onDelete={() => handleDelete(profile.id)}
              />
            </div>
          ))}
          <AddNewCard onClick={openCreateDrawer} />
        </div>
      </div>

      {/* ── Create / Edit Profile Centered Modal ── */}
      <ProfileModal
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingProfile(null); }}
        onSave={handleSaveProfile}
        editingProfile={editingProfile}
      />
    </>
  );
}
