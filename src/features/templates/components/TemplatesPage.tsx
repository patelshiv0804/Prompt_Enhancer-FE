'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Bookmark, BookmarkCheck, Sparkles, Code2, Megaphone, Palette,
  Video, BookOpen, Briefcase, TrendingUp, Star, ChevronRight,
  Zap, Film, Mail, Database, FileText, Loader2, AlertCircle, RefreshCw,
  Rocket, GraduationCap, Microscope, PenLine,
} from 'lucide-react';
import { loadTemplates, type Template } from '../services/templatesService';

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  // Role taxonomy — the live facet powering the category chips.
  developer: Code2, marketer: Megaphone, researcher: Microscope,
  consultant: Briefcase, entrepreneur: Rocket, educator: GraduationCap,
  student: BookOpen, writer: PenLine, general: Sparkles,
  // Backend seed `category` taxonomy (used if category is ever populated).
  development: Code2, content: FileText, documentation: BookOpen,
  email: Mail, data: Database,
  // Original library taxonomy (kept so known categories still get their icon).
  coding: Code2, marketing: Megaphone, 'ai-art': Palette, veo: Film,
  youtube: Video, storytelling: BookOpen, business: Briefcase,
};

function categoryLabel(id: string): string {
  if (id === 'all') return 'All';
  if (id === 'ai-art') return 'AI Art';
  if (id === 'veo') return 'VEO';
  return id.charAt(0).toUpperCase() + id.slice(1);
}

/* ── Template Card ── */
function TemplateCard({ template, onUse }: { template: Template; onUse: (t: Template) => void }) {
  const [bookmarked, setBookmarked] = useState(false);
  const Icon = CATEGORY_ICON_MAP[template.category] || Sparkles;

  return (
    <div id={`template-card-${template.id}`} style={{
      background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.10)', borderRadius: 20, padding: 24,
      display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(109,40,217,0.05)', transition: 'transform 250ms ease, box-shadow 250ms ease, border-color 250ms ease',
    }}
      className="hover:translate-y-[-3px] hover:shadow-[0_8px_28px_rgba(109,40,217,0.10)] hover:!border-[rgba(124,58,237,0.18)]"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${template.modelColor}18`, color: template.modelColor, border: `1px solid ${template.modelColor}25`,
        }}>
          <Icon size={17} strokeWidth={1.5} />
        </div>
        <button id={`bookmark-${template.id}`} onClick={e => { e.stopPropagation(); setBookmarked(!bookmarked); }}
          style={{
            width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 200ms ease',
            background: bookmarked ? 'rgba(124,58,237,0.12)' : 'transparent',
            color: bookmarked ? 'var(--color-primary)' : 'rgba(107,107,138,0.45)',
          }}
          className={!bookmarked ? 'hover:!bg-[rgba(124,58,237,0.08)] hover:!text-[var(--color-primary)]' : ''}
        >
          {bookmarked ? <BookmarkCheck size={14} strokeWidth={2} /> : <Bookmark size={14} strokeWidth={2} />}
        </button>
      </div>

      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 6px', letterSpacing: -0.2 }}>{template.title}</h3>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{template.description}</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {template.tags.slice(0, 2).map(tag => (
          <span key={tag} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, background: 'rgba(124,58,237,0.08)', color: 'var(--color-primary)' }}>{tag}</span>
        ))}
        {template.isNew && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 9999, background: 'rgba(16,185,129,0.10)', color: '#059669', border: '1px solid rgba(16,185,129,0.20)' }}>New</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid rgba(124,58,237,0.07)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-secondary)' }}>
          <Star size={10} strokeWidth={2} />{template.useCount?.toLocaleString() ?? '0'}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button id={`use-${template.id}`} onClick={() => onUse(template)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #7C3AED, #A855F7)', color: 'white', boxShadow: '0 3px 10px rgba(124,58,237,0.28)', transition: 'all 180ms ease' }}
            className="hover:translate-y-[-1px] hover:brightness-105"
          ><Zap size={12} strokeWidth={2} />Use</button>
        </div>
      </div>
    </div>
  );
}

/* ── Featured Hero ── */
function FeaturedHero({ template, onUse }: { template: Template; onUse: (t: Template) => void }) {
  const [bookmarked, setBookmarked] = useState(false);
  const Icon = CATEGORY_ICON_MAP[template.category] || Sparkles;
  return (
    <div id="featured-template-hero" style={{
      borderRadius: 24, overflow: 'hidden', marginBottom: 40, position: 'relative',
      background: 'linear-gradient(135deg, #1a0a3d 0%, #2D1B69 40%, #0E0B18 100%)',
      boxShadow: '0 8px 32px rgba(109,40,217,0.22), 0 2px 8px rgba(0,0,0,0.12)',
      minHeight: 240,
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 50%, rgba(167,139,250,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(124,58,237,0.15) 0%, transparent 50%)' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '40px 48px', gap: 40 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#EDE9FE', marginBottom: 16 }}>
            <Icon size={13} strokeWidth={2} /><span>{template.model}</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#EDE9FE', letterSpacing: -0.5, margin: '0 0 10px', lineHeight: 1.2 }}>{template.title}</h2>
          <p style={{ fontSize: 14, color: 'rgba(221,214,254,0.60)', margin: '0 0 20px', lineHeight: 1.5 }}>{template.description}</p>
          {template.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {template.tags.slice(0, 4).map(tag => (
                <span key={tag} style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 9999, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.16)', color: '#EDE9FE' }}>{tag}</span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button id="hero-use-optimizer-btn" onClick={() => onUse(template)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #7C3AED, #A855F7)', color: 'white', boxShadow: '0 4px 16px rgba(124,58,237,0.45)', transition: 'all 200ms ease' }} className="hover:brightness-110 hover:translate-y-[-1px]">
              <Zap size={15} strokeWidth={2} />Use in Optimizer
            </button>
            <button id="hero-bookmark-btn" onClick={() => setBookmarked(!bookmarked)}
              style={{ width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.20)', background: bookmarked ? 'rgba(124,58,237,0.40)' : 'rgba(255,255,255,0.10)', color: '#EDE9FE', transition: 'all 200ms ease' }}>
              {bookmarked ? <BookmarkCheck size={16} strokeWidth={2} /> : <Bookmark size={16} strokeWidth={2} />}
            </button>
          </div>
        </div>
        <div style={{ flex: '0 0 280px', position: 'relative' }}>
          <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.10)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cinematic-hero.png" alt={template.title} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.60)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '5px 10px', fontSize: 11, fontWeight: 600, color: 'white' }}>
              <Icon size={12} /><span>{categoryLabel(template.category)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadTemplates();
      setTemplates(data);
    } catch (err: any) {
      console.error('Failed to load templates:', err);
      setError(err?.message || 'Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // "Use" opens the Optimizer with this template active. Only the template
  // title travels (via the query string) — the prompt body (the proprietary
  // "recipe") is never sent to the client, so nothing sensitive is exposed.
  const handleUse = useCallback((template: Template) => {
    router.push(`/dashboard/optimizer?template=${encodeURIComponent(template.title)}`);
  }, [router]);

  // Category chips are derived from the data (backend categories don't match a
  // fixed list), with "All" always first.
  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const t of templates) {
      if (t.category && !seen.includes(t.category)) seen.push(t.category);
    }
    seen.sort();
    return ['all', ...seen];
  }, [templates]);

  const heroTemplate = useMemo(() => {
    if (templates.length === 0) return null;
    const featured = templates.filter(t => t.isFeatured);
    const pool = featured.length > 0 ? featured : templates;
    return pool.reduce((best, t) => ((t.useCount ?? 0) > (best.useCount ?? 0) ? t : best), pool[0]);
  }, [templates]);

  const showHero = !!heroTemplate && activeCategory === 'all' && !searchQuery.trim();

  const filteredTemplates = useMemo(() => {
    let list = showHero && heroTemplate ? templates.filter(t => t.id !== heroTemplate.id) : templates;
    if (activeCategory !== 'all') list = list.filter(t => t.category === activeCategory);
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q)) ||
        t.model.toLowerCase().includes(q)
      );
    }
    return list;
  }, [templates, showHero, heroTemplate, activeCategory, searchQuery]);

  const trendingTemplates = filteredTemplates.filter(t => t.isTrending);
  const allOtherTemplates = filteredTemplates.filter(t => !t.isTrending);

  const sectionTitle: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 };

  return (
    <div id="templates-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px 64px', paddingTop: 8, width: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 0 24px' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: -0.3, margin: '0 0 4px' }}>Templates Library</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>Discover curated, high-performance prompts optimized for precision and scale</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={15} strokeWidth={1.8} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', pointerEvents: 'none' }} />
          <input id="templates-search-input" type="text" placeholder="Search templates..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} disabled={loading || !!error}
            style={{ padding: '9px 16px 9px 36px', fontSize: 13, background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.12)', borderRadius: 10, outline: 'none', color: 'var(--color-text-primary)', width: 240, transition: 'border-color 200ms ease, box-shadow 200ms ease' }}
            className="focus:!border-[rgba(124,58,237,0.35)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.08)]"
          />
        </div>
      </div>

      {loading ? (
        /* Loading */
        <div id="templates-loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '80px 0', color: 'var(--color-text-secondary)' }}>
          <Loader2 size={28} strokeWidth={2} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          <p style={{ fontSize: 14, margin: 0 }}>Loading templates…</p>
        </div>
      ) : error ? (
        /* Error */
        <div id="templates-error-state" style={{ textAlign: 'center', padding: '64px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}><AlertCircle size={30} strokeWidth={1.4} /></div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Couldn’t load templates</h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0, maxWidth: 420 }}>{error}</p>
          <button id="templates-retry-btn" onClick={fetchData}
            style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', borderRadius: 9, fontSize: 13, fontWeight: 600, border: '1px solid rgba(124,58,237,0.20)', cursor: 'pointer', background: 'transparent', color: 'var(--color-primary)' }}
            className="hover:bg-[rgba(124,58,237,0.06)]"
          ><RefreshCw size={14} strokeWidth={2} />Retry</button>
        </div>
      ) : templates.length === 0 ? (
        /* Backend returned no templates */
        <div id="templates-empty-library" style={{ textAlign: 'center', padding: '64px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(124,58,237,0.08)', color: 'var(--color-primary)' }}><Sparkles size={30} strokeWidth={1.2} /></div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>No templates yet</h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>Templates you add on the backend will appear here.</p>
        </div>
      ) : (
        <>
          {/* Category Chips */}
          <div id="categories-row" style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
            {categories.map(cat => {
              const Icon = cat === 'all' ? Sparkles : (CATEGORY_ICON_MAP[cat] || Sparkles);
              const active = activeCategory === cat;
              return (
                <button key={cat} id={`category-chip-${cat}`} onClick={() => setActiveCategory(cat)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9999, fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all 200ms ease',
                    background: active ? 'linear-gradient(135deg, #7C3AED, #A855F7)' : 'rgba(124,58,237,0.06)',
                    color: active ? 'white' : 'var(--color-text-secondary)',
                    border: active ? 'none' : '1px solid rgba(124,58,237,0.10)',
                    boxShadow: active ? '0 4px 12px rgba(124,58,237,0.28)' : 'none',
                  }}
                  className={!active ? 'hover:!bg-[rgba(124,58,237,0.10)] hover:!text-[var(--color-text-primary)]' : ''}
                >
                  <Icon size={14} strokeWidth={1.8} /><span>{categoryLabel(cat)}</span>
                </button>
              );
            })}
          </div>

          {/* Featured Hero */}
          {showHero && heroTemplate && <FeaturedHero template={heroTemplate} onUse={handleUse} />}

          {/* Trending */}
          {trendingTemplates.length > 0 && (
            <section id="trending-section" style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TrendingUp size={16} strokeWidth={2} style={{ color: 'var(--color-primary)' }} />
                  <h2 style={sectionTitle}>Trending Templates</h2>
                </div>
                <button id="view-all-trending-btn" onClick={() => setActiveCategory('all')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer' }} className="hover:underline">
                  View all <ChevronRight size={14} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {trendingTemplates.map(t => <TemplateCard key={t.id} template={t} onUse={handleUse} />)}
              </div>
            </section>
          )}

          {/* All others */}
          {allOtherTemplates.length > 0 && (
            <section id="all-templates-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Sparkles size={16} strokeWidth={2} style={{ color: 'var(--color-primary)' }} />
                <h2 style={sectionTitle}>{activeCategory === 'all' ? 'More Templates' : 'Templates'}</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {allOtherTemplates.map(t => <TemplateCard key={t.id} template={t} onUse={handleUse} />)}
              </div>
            </section>
          )}

          {/* No match for current filter */}
          {filteredTemplates.length === 0 && (
            <div id="templates-empty-state" style={{ textAlign: 'center', padding: '64px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 60, height: 60, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(124,58,237,0.08)', color: 'var(--color-primary)' }}><Search size={32} strokeWidth={1.2} /></div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>No templates found</h3>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>Try adjusting your search or switching categories.</p>
              <button id="templates-reset-btn" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                style={{ marginTop: 8, padding: '8px 20px', borderRadius: 9, fontSize: 13, fontWeight: 600, border: '1px solid rgba(124,58,237,0.20)', cursor: 'pointer', background: 'transparent', color: 'var(--color-primary)' }}
                className="hover:bg-[rgba(124,58,237,0.06)]"
              >Clear filters</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
