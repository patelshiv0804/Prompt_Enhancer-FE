'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, X, Zap, ChevronRight, ArrowRight,
  Fingerprint, Palette, Film, Trees, User as UserIcon,
  Sparkles, ChevronDown, Pencil, Trash2, RefreshCw, Loader2
} from 'lucide-react';
import {
  useStyleProfiles,
  StyleProfile,
  StyleCategory,
  CATEGORY_COLORS
} from '@/features/style-memory/services/styleMemoryService';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import StyleMemorySkeleton from '@/features/style-memory/components/StyleMemorySkeleton';

/* ═══════════════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════════════ */

const CATEGORIES: { id: StyleCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'character', label: 'Character' },
  { id: 'art_style', label: 'Art Style' },
  { id: 'cinematic', label: 'Cinematic Style' },
  { id: 'environment', label: 'Environment' },
  { id: 'brand_voice', label: 'Brand Voice' },
];

const CATEGORY_META: Record<StyleCategory, { icon: React.ElementType; color: string }> = {
  'character': { icon: UserIcon, color: '#7C3AED' },
  'art_style': { icon: Palette, color: '#EC4899' },
  'cinematic': { icon: Film, color: '#F59E0B' },
  'environment': { icon: Trees, color: '#10B981' },
  'brand_voice': { icon: Fingerprint, color: '#3B82F6' },
};

const CATEGORY_OPTIONS: { id: StyleCategory; label: string }[] = [
  { id: 'character', label: 'Character' },
  { id: 'art_style', label: 'Art Style' },
  { id: 'cinematic', label: 'Cinematic Style' },
  { id: 'environment', label: 'Environment' },
  { id: 'brand_voice', label: 'Brand Voice' },
];

/* ═══════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════ */

/* ── Category Avatar ── */
function CategoryAvatar({ category, size = 40 }: { category: StyleCategory; size?: number }) {
  const meta = CATEGORY_META[category] || CATEGORY_META.character;
  const Icon = meta.icon;
  const color = meta.color;
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
function ToggleSwitch({ enabled, onToggle, disabled = false }: { enabled: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-label={enabled ? 'Deactivate style' : 'Activate style'}
      style={{
        width: 38, height: 20, borderRadius: 9999, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: enabled ? 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' : 'rgba(124,58,237,0.12)',
        position: 'relative', transition: 'background 250ms ease', flexShrink: 0,
        boxShadow: enabled ? '0 2px 8px rgba(124,58,237,0.25)' : 'none',
        opacity: disabled ? 0.6 : 1,
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
  const meta = CATEGORY_META[profile.category] || CATEGORY_META.character;
  const label = CATEGORY_OPTIONS.find(c => c.id === profile.category)?.label || profile.category;

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
      transition: 'transform 250ms ease, box-shadow 250ms ease, border-color 250ms ease, opacity 250ms ease',
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
                color: meta.color, opacity: 0.8,
              }}>
                {label}
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
        {/* Row 1: Active Style + Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: 13.5,
            fontWeight: 600,
            color: '#312E81',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            Active Style <span style={{ color: 'var(--color-primary)', fontSize: 12 }}>✦</span>
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

/* ── Injection Flow Card ── */
function InjectionFlowCard({ isMobile, isTablet }: { isMobile: boolean; isTablet: boolean }) {
  const [activeIdx, setActiveIdx] = useState(0);
  // The three steps stay on one horizontal row at every width. Below ~1024px the
  // original fixed 100px SVG connectors + nowrap labels would overflow, so tablet
  // & mobile use a "compact" layout: flexible (flex) connectors that shrink to fit
  // and labels that wrap. Desktop keeps the original fixed-connector look.
  const compact = isTablet;
  const nodeSize = isMobile ? 50 : 70;

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
      borderRadius: isMobile ? 20 : 28,
      marginBottom: isMobile ? 24 : 36,
      padding: 1,
      background: 'linear-gradient(135deg, rgba(124,58,237,0.35) 0%, rgba(56,189,248,0.20) 30%, rgba(192,132,252,0.30) 60%, rgba(52,211,153,0.25) 100%)',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes ifc-ringPulse {
          0% { transform: scale(0.85); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 0; }
          100% { transform: scale(0.85); opacity: 0; }
        }
        @keyframes ifc-nodeGlow0 {
          0%, 100% { box-shadow: 0 0 20px rgba(56,189,248,0.15), 0 0 60px rgba(56,189,248,0.05); }
          50% { box-shadow: 0 0 30px rgba(56,189,248,0.45), 0 0 80px rgba(56,189,248,0.15); }
        }
        @keyframes ifc-nodeGlow1 {
          0%, 100% { box-shadow: 0 0 20px rgba(192,132,252,0.15), 0 0 60px rgba(192,132,252,0.05); }
          50% { box-shadow: 0 0 30px rgba(192,132,252,0.45), 0 0 80px rgba(192,132,252,0.15); }
        }
        @keyframes ifc-nodeGlow2 {
          0%, 100% { box-shadow: 0 0 20px rgba(52,211,153,0.15), 0 0 60px rgba(52,211,153,0.05); }
          50% { box-shadow: 0 0 30px rgba(52,211,153,0.45), 0 0 80px rgba(52,211,153,0.15); }
        }
        @keyframes ifc-flowDash { to { stroke-dashoffset: -24; } }
        @keyframes ifc-flowMove { to { background-position: 14px 0; } }
        .ifc-active-node-0 { animation: ifc-nodeGlow0 2.4s infinite ease-in-out !important; }
        .ifc-active-node-1 { animation: ifc-nodeGlow1 2.4s infinite ease-in-out !important; }
        .ifc-active-node-2 { animation: ifc-nodeGlow2 2.4s infinite ease-in-out !important; }
      `}</style>

      <div style={{
        background: 'linear-gradient(145deg, #0C0620 0%, #150D30 30%, #1A0E3A 55%, #0D0920 100%)',
        border: '1px solid rgba(167, 139, 250, 0.18)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        borderRadius: isMobile ? 22 : 30,
        padding: isMobile ? '28px 22px 30px' : isTablet ? '36px 32px 38px' : '40px 48px 44px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient background glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(124, 58, 237, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Header */}
          <div style={{ marginBottom: isMobile ? 24 : 36 }}>
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
              fontSize: isMobile ? 20 : 24, fontWeight: 800, letterSpacing: -0.5, margin: '0 0 10px',
              background: 'linear-gradient(135deg, #EDE9FE 0%, #C4B5FD 40%, #A78BFA 70%, #38BDF8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.25,
            }}>
              Smart Style Injection Flow
            </h3>
            <p style={{
              fontSize: isMobile ? 13 : 14, color: 'rgba(196,181,253,0.55)', margin: 0,
              lineHeight: 1.65, maxWidth: 560,
            }}>
              Your enabled style profiles are automatically appended to your base prompts during optimization, instantly giving your drafts the desired creative signature.
            </p>
          </div>

          {/* 3-Step Pipeline */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: compact ? 'flex-start' : 'center',
            justifyContent: 'center',
            gap: 0, padding: '8px 0 4px',
          }}>
            {steps.map((step, i) => {
              const isActive = activeIdx === i;
              const isNext = activeIdx === i && i < steps.length - 1;
              return (
                <React.Fragment key={step.label}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: isMobile ? 10 : 14,
                    flex: compact ? '1 1 0' : '0 0 auto',
                    minWidth: 0, maxWidth: compact ? 120 : undefined,
                    position: 'relative',
                  }}>
                    {isActive && (
                      <div style={{
                        position: 'absolute', top: 0, left: '50%',
                        width: nodeSize, height: nodeSize,
                        marginLeft: -nodeSize / 2, borderRadius: '50%',
                        border: `2px solid ${step.color}`,
                        opacity: 0,
                        animation: 'ifc-ringPulse 2.4s infinite ease-out',
                        pointerEvents: 'none',
                      }} />
                    )}

                    <div
                      className={isActive ? `ifc-active-node-${i}` : ''}
                      style={{
                        width: nodeSize, height: nodeSize, borderRadius: '50%',
                        flexShrink: 0,
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
                      <step.icon
                        size={isMobile ? 20 : 26}
                        strokeWidth={isActive ? 2 : 1.5}
                        style={{
                          color: step.color,
                          opacity: isActive ? 1 : 0.35,
                          transition: 'all 600ms cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </div>

                    <div style={{ textAlign: 'center', minWidth: 0, width: '100%' }}>
                      <span style={{
                        fontSize: isMobile ? 11 : 13, fontWeight: 700,
                        color: isActive ? '#EDE9FE' : 'rgba(237,233,254,0.4)',
                        display: 'block', whiteSpace: compact ? 'normal' : 'nowrap',
                        lineHeight: 1.25,
                        transition: 'color 500ms ease',
                      }}>
                        {step.label}
                      </span>
                      <span style={{
                        fontSize: isMobile ? 10 : 11, fontWeight: 500,
                        color: isActive ? `rgba(${step.colorRgb},0.7)` : 'rgba(167,139,250,0.2)',
                        display: 'block', marginTop: 3, whiteSpace: compact ? 'normal' : 'nowrap',
                        lineHeight: 1.3,
                        transition: 'color 500ms ease',
                      }}>
                        {step.subtitle}
                      </span>
                    </div>
                  </div>

                  {i < steps.length - 1 && (
                    compact ? (
                      /* Compact connector: a flex-grow line + arrow that shrinks
                         to fit any width, keeping all 3 steps on one row. Its
                         height matches the node so the arrow lands on the node's
                         vertical center (container is aligned flex-start). */
                      <div style={{
                        flex: '0 0 auto',
                        width: isMobile ? 24 : 40,
                        height: nodeSize,
                        display: 'flex', alignItems: 'center',
                        position: 'relative',
                      }}>
                        <div style={{
                          position: 'absolute', left: 1, right: 8, top: '50%', height: 2, marginTop: -1,
                          background: 'rgba(167,139,250,0.12)', borderRadius: 2,
                        }} />
                        <div style={{
                          position: 'absolute', left: 1, right: 8, top: '50%', height: 2, marginTop: -1, borderRadius: 2,
                          backgroundColor: isNext ? 'transparent' : 'rgba(167,139,250,0.18)',
                          backgroundImage: isNext ? `repeating-linear-gradient(90deg, ${steps[i].color} 0 6px, transparent 6px 14px)` : 'none',
                          backgroundSize: '14px 100%',
                          animation: isNext ? 'ifc-flowMove 0.8s linear infinite' : 'none',
                        }} />
                        <svg width="9" height="12" viewBox="0 0 9 12" style={{ position: 'absolute', right: -1, top: '50%', transform: 'translateY(-50%)', overflow: 'visible' }}>
                          <path d="M 2 2 L 7 6 L 2 10" fill="none" stroke={isNext ? steps[i + 1].color : 'rgba(167,139,250,0.3)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 400ms ease' }} />
                        </svg>
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 12px', marginBottom: 40,
                        position: 'relative',
                      }}>
                        <svg width="100" height="20" viewBox="0 0 100 20" style={{ overflow: 'visible' }}>
                          <line x1="4" y1="10" x2="88" y2="10" stroke="rgba(167,139,250,0.08)" strokeWidth="2" strokeLinecap="round" />
                          <line
                            x1="4" y1="10" x2="88" y2="10"
                            stroke={isNext ? steps[i].color : 'rgba(167,139,250,0.15)'}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray={isNext ? '6, 8' : 'none'}
                            style={{ animation: isNext ? 'ifc-flowDash 1s linear infinite' : 'none' }}
                          />
                          <path d="M 84 5 L 92 10 L 84 15" fill="none" stroke={isNext ? steps[i + 1].color : 'rgba(167,139,250,0.15)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Create / Edit Profile Centered Modal ── */
function ProfileModal({
  open, onClose, onSave, editingProfile, isMobile = false,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (profile: Omit<StyleProfile, 'id'>) => Promise<void>;
  editingProfile?: StyleProfile | null;
  isMobile?: boolean;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<StyleCategory>('character');
  const [injection, setInjection] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!editingProfile;

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

  const handleSave = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean).map(t => t.startsWith('#') ? t : `#${t}`);
      await onSave({
        name: name.trim(),
        description: injection.slice(0, 120) || 'Custom style profile.',
        category,
        injectionPrompt: injection || `Apply ${name.trim()} style instructions.`,
        tags,
        enabled: editingProfile?.enabled ?? false
      });
      onClose();
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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

      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: open ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.95)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        width: 540,
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
          padding: isMobile ? '20px 18px 16px' : '24px 28px 20px',
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
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '20px 18px' : '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Profile Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '0.02em' }}>
              Profile Name
            </label>
            <input
              type="text" placeholder="e.g. Cyberpunk Hero"
              value={name} onChange={e => setName(e.target.value)}
              disabled={submitting}
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
                    type="button"
                    onClick={() => setCategory(opt.id)}
                    disabled={submitting}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 14px', borderRadius: 12,
                      border: isSel ? `2px solid ${meta.color}` : '1px solid rgba(124,58,237,0.12)',
                      background: isSel ? `${meta.color}08` : '#FFFFFF',
                      cursor: submitting ? 'not-allowed' : 'pointer', textAlign: 'left',
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
              disabled={submitting}
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
              These instructions will be appended to base prompts automatically when active.
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
              disabled={submitting}
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
          padding: isMobile ? '14px 18px 18px' : '16px 28px 20px',
          borderTop: '1px solid rgba(124,58,237,0.08)',
          background: '#FAFAFC',
        }}>
          <button
            onClick={onClose}
            disabled={submitting}
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
            disabled={!name.trim() || submitting}
            style={{
              padding: '9px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              border: 'none', cursor: (name.trim() && !submitting) ? 'pointer' : 'not-allowed',
              background: (name.trim() && !submitting) ? 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' : 'rgba(124,58,237,0.25)',
              color: 'white',
              boxShadow: (name.trim() && !submitting) ? '0 4px 14px rgba(124,58,237,0.30)' : 'none',
              transition: 'all 200ms ease',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
            className={(name.trim() && !submitting) ? 'hover:translate-y-[-1px] hover:brightness-105' : ''}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
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
  const [profiles, loading, { reload, add, update, toggle, remove }] = useStyleProfiles();
  const [activeFilter, setActiveFilter] = useState<StyleCategory | 'all'>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<StyleProfile | null>(null);

  // Responsive breakpoints — inline styles can't be overridden by CSS @media,
  // so layout decisions are driven from JS (matches the vault/header pattern).
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const pagePadX = isMobile ? 16 : isTablet ? 32 : 48;

  const filtered = activeFilter === 'all'
    ? profiles
    : profiles.filter(p => p.category === activeFilter);

  const handleSaveProfile = async (data: Omit<StyleProfile, 'id'>) => {
    if (editingProfile) {
      await update(editingProfile.id, data);
    } else {
      await add(data);
    }
    setEditingProfile(null);
  };

  const handleToggle = async (profile: StyleProfile) => {
    await toggle(profile.id, profile.enabled);
  };

  const handleEdit = (profile: StyleProfile) => {
    setEditingProfile(profile);
    setDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this style profile?')) {
      await remove(id);
    }
  };

  const openCreateDrawer = () => {
    setEditingProfile(null);
    setDrawerOpen(true);
  };

  if (loading && profiles.length === 0) {
    return <StyleMemorySkeleton />;
  }

  return (
    <>
      <div id="style-memory-page" style={{
        maxWidth: 1100, margin: '0 auto',
        padding: `0 ${pagePadX}px`, paddingTop: 8,
        width: '100%', display: 'flex', flexDirection: 'column', paddingBottom: 64,
      }}>

        {/* ── Header ── */}
        {/* On mobile the shared shell floats a hamburger at top-left (top:12,
            40px). Rather than indent the eyebrow/title to clear it (which left
            the buttons + pills below misaligned), we push the whole header down
            so every row shares the same left edge — a cohesive, aligned block. */}
        <div style={{ padding: isMobile ? '52px 0 22px' : '28px 0 24px' }}>
          <span style={{
            fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.9px', color: 'var(--color-text-secondary)',
            display: 'block', marginBottom: 8,
          }}>
            Your Creative Signature
          </span>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'flex-start',
            justifyContent: 'space-between', gap: 16,
          }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: -0.3, margin: '0 0 6px' }}>
                Style Memory
              </h1>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
                Personalize your optimization with saved style profiles
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: isMobile ? '100%' : undefined }}>
              <button
                onClick={() => reload()}
                title="Refresh from Database"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '9px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  border: '1px solid rgba(124,58,237,0.15)', cursor: 'pointer',
                  background: '#FFFFFF', color: 'var(--color-text-secondary)',
                  transition: 'all 200ms ease', flexShrink: 0,
                }}
                className="hover:!border-[rgba(124,58,237,0.3)] hover:!text-[var(--color-primary)]"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                id="create-profile-btn"
                onClick={openCreateDrawer}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                  color: 'white',
                  boxShadow: '0 4px 14px rgba(124,58,237,0.30)',
                  transition: 'all 200ms ease',
                  flex: isMobile ? '1 1 auto' : '0 0 auto',
                }}
                className="hover:translate-y-[-1px] hover:brightness-105"
              >
                <Plus size={14} strokeWidth={2.5} />Create New Profile
              </button>
            </div>
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
        <InjectionFlowCard isMobile={isMobile} isTablet={isTablet} />

        {/* ── Profile Cards Grid ── */}
        {loading && profiles.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 10, color: 'var(--color-text-secondary)' }}>
            <Loader2 size={20} className="animate-spin" />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Loading style profiles from database...</span>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            // Auto-fitting track count: as many ~300px+ columns as fit. This
            // yields 3 cols on desktop, 2 on tablet (incl. 768px, which the old
            // isMobile check wrongly forced to a single full-width column), and
            // 1 on phones — with no hard breakpoint to land on the wrong side of.
            // min(300px,100%) keeps a lone/narrow card from overflowing < 300px.
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
            gap: 16,
          }}>
            {filtered.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onToggle={() => handleToggle(profile)}
                onEdit={() => handleEdit(profile)}
                onDelete={() => handleDelete(profile.id)}
              />
            ))}
            <AddNewCard onClick={openCreateDrawer} />
          </div>
        )}
      </div>

      {/* ── Create / Edit Profile Centered Modal ── */}
      <ProfileModal
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingProfile(null); }}
        onSave={handleSaveProfile}
        editingProfile={editingProfile}
        isMobile={isMobile}
      />
    </>
  );
}
