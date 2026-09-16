'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, AlertCircle, HelpCircle, Check } from 'lucide-react';
import { useTheme, D } from '@/theme/theme';
import {
  createCustomTemplate,
  loadAIModels,
  type Template,
} from '../services/templatesService';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTemplate: Template) => void;
}

const COMMON_ROLES = [
  'Developer',
  'Marketer',
  'Writer',
  'Researcher',
  'Designer',
  'Consultant',
  'Entrepreneur',
  'Educator',
  'Student',
];

export default function CreateTemplateModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTemplateModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [title, setTitle] = useState('');
  const [role, setRole] = useState('Developer');
  const [customRole, setCustomRole] = useState('');
  const [mode, setMode] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string; provider: string }>>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load models on mount
  useEffect(() => {
    if (isOpen) {
      loadAIModels().then((models) => {
        setAvailableModels(models);
        if (models.length > 0 && !selectedModelId) {
          setSelectedModelId(models[0].id);
        }
      });
      setError(null);
    }
  }, [isOpen]);

  // Reset form when modal closes
  const handleClose = () => {
    if (loading) return;
    setTitle('');
    setRole('Developer');
    setCustomRole('');
    setMode('');
    setDescription('');
    setBody('');
    setTagsInput('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Template title is required.');
      return;
    }
    if (!body.trim()) {
      setError('Prompt recipe (body) is required.');
      return;
    }

    setLoading(true);
    setError(null);

    const effectiveRole = role === 'Other' ? customRole.trim() : role;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    try {
      const created = await createCustomTemplate({
        title: title.trim(),
        role: effectiveRole || undefined,
        mode: mode.trim() || undefined,
        description: description.trim() || undefined,
        body: body.trim(),
        tags: tags.length > 0 ? tags : undefined,
        ai_model_id: selectedModelId || undefined,
      });

      onSuccess(created);
      handleClose();
    } catch (err: any) {
      console.error('Failed to create custom template:', err);
      setError(err?.message || 'Failed to create template. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            background: 'rgba(9, 9, 15, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 620,
              maxHeight: '92vh',
              background: isDark ? '#141320' : '#FFFFFF',
              borderRadius: 22,
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124, 58, 237, 0.14)'}`,
              boxShadow: isDark
                ? '0 25px 65px rgba(0, 0, 0, 0.8), 0 0 1px rgba(167, 139, 250, 0.3)'
                : '0 25px 65px rgba(109, 40, 217, 0.16), 0 0 1px rgba(124, 58, 237, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(124, 58, 237, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.25), rgba(168, 85, 247, 0.25))',
                    border: `1px solid ${isDark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(124, 58, 237, 0.2)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#C084FC',
                  }}
                >
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      margin: 0,
                      color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                      letterSpacing: -0.2,
                    }}
                  >
                    Create Custom Template
                  </h2>
                  <p
                    style={{
                      fontSize: 12.5,
                      color: isDark ? D.textSecondary : 'var(--color-text-secondary)',
                      margin: '2px 0 0 0',
                    }}
                  >
                    Build a proprietary prompt recipe tailored for your workflow
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? D.textSecondary : 'var(--color-text-secondary)',
                  padding: 6,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className={isDark ? 'hover:!bg-[rgba(255,255,255,0.08)]' : 'hover:!bg-[rgba(0,0,0,0.05)]'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
              <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Error Banner */}
                {error && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: 'rgba(239, 68, 68, 0.10)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#F87171',
                      fontSize: 13,
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Template Title */}
                <div>
                  <label
                    htmlFor="custom-template-title"
                    style={{
                      display: 'block',
                      fontSize: 12.5,
                      fontWeight: 600,
                      marginBottom: 6,
                      color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                    }}
                  >
                    Template Title <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    id="custom-template-title"
                    type="text"
                    required
                    placeholder="e.g. Senior React Architect, B2B Cold Email Copywriter..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: 13.5,
                      background: isDark ? 'rgba(20, 19, 32, 0.9)' : '#FFFFFF',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124, 58, 237, 0.16)'}`,
                      borderRadius: 10,
                      outline: 'none',
                      color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                    }}
                    className={isDark ? 'focus:!border-[rgba(167,139,250,0.5)]' : 'focus:!border-[rgba(124,58,237,0.4)]'}
                  />
                </div>

                {/* Role & Mode (Two-column) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label
                      htmlFor="custom-template-role"
                      style={{
                        display: 'block',
                        fontSize: 12.5,
                        fontWeight: 600,
                        marginBottom: 6,
                        color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                      }}
                    >
                      Role Category
                    </label>
                    <select
                      id="custom-template-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: 13,
                        background: isDark ? '#1C1B2A' : '#FFFFFF',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124, 58, 237, 0.16)'}`,
                        borderRadius: 10,
                        outline: 'none',
                        color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                      }}
                    >
                      {COMMON_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                      <option value="Other">Custom Role...</option>
                    </select>
                    {role === 'Other' && (
                      <input
                        type="text"
                        placeholder="Enter custom role"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        style={{
                          width: '100%',
                          marginTop: 6,
                          padding: '8px 12px',
                          fontSize: 12.5,
                          background: isDark ? 'rgba(20, 19, 32, 0.9)' : '#FFFFFF',
                          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124, 58, 237, 0.16)'}`,
                          borderRadius: 8,
                          outline: 'none',
                          color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                        }}
                      />
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="custom-template-mode"
                      style={{
                        display: 'block',
                        fontSize: 12.5,
                        fontWeight: 600,
                        marginBottom: 6,
                        color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                      }}
                    >
                      Workflow / Mode
                    </label>
                    <input
                      id="custom-template-mode"
                      type="text"
                      placeholder="e.g. Code Review, Copywriting..."
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: 13,
                        background: isDark ? 'rgba(20, 19, 32, 0.9)' : '#FFFFFF',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124, 58, 237, 0.16)'}`,
                        borderRadius: 10,
                        outline: 'none',
                        color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                      }}
                    />
                  </div>
                </div>

                {/* AI Model Selection */}
                {availableModels.length > 0 && (
                  <div>
                    <label
                      htmlFor="custom-template-model"
                      style={{
                        display: 'block',
                        fontSize: 12.5,
                        fontWeight: 600,
                        marginBottom: 6,
                        color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                      }}
                    >
                      Target AI Model
                    </label>
                    <select
                      id="custom-template-model"
                      value={selectedModelId}
                      onChange={(e) => setSelectedModelId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        fontSize: 13,
                        background: isDark ? '#1C1B2A' : '#FFFFFF',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124, 58, 237, 0.16)'}`,
                        borderRadius: 10,
                        outline: 'none',
                        color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                      }}
                    >
                      {availableModels.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.provider})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label
                    htmlFor="custom-template-desc"
                    style={{
                      display: 'block',
                      fontSize: 12.5,
                      fontWeight: 600,
                      marginBottom: 6,
                      color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                    }}
                  >
                    Description <span style={{ fontWeight: 400, color: isDark ? D.textMuted : 'var(--color-text-secondary)' }}>(optional)</span>
                  </label>
                  <input
                    id="custom-template-desc"
                    type="text"
                    placeholder="Short summary of what this recipe accomplishes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: 13,
                      background: isDark ? 'rgba(20, 19, 32, 0.9)' : '#FFFFFF',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124, 58, 237, 0.16)'}`,
                      borderRadius: 10,
                      outline: 'none',
                      color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                    }}
                  />
                </div>

                {/* Prompt Recipe Body */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label
                      htmlFor="custom-template-body"
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                      }}
                    >
                      Prompt Recipe (Body) <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#A855F7',
                        fontWeight: 600,
                        background: 'rgba(168, 85, 247, 0.1)',
                        padding: '2px 8px',
                        borderRadius: 6,
                      }}
                    >
                      Tip: Use {'{{PROMPT}}'} placeholder
                    </span>
                  </div>
                  <textarea
                    id="custom-template-body"
                    required
                    rows={6}
                    placeholder="Act as a Senior Architect. Your objective is to critique and optimize:&#10;&#10;Task:&#10;{{PROMPT}}&#10;&#10;Produce output following these guidelines:&#10;1. Structure...&#10;2. Tradeoffs..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      fontSize: 13,
                      fontFamily: 'monospace, SFMono-Regular, Consolas, Courier New',
                      lineHeight: 1.5,
                      background: isDark ? 'rgba(15, 14, 25, 0.95)' : '#FAF8FF',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124, 58, 237, 0.16)'}`,
                      borderRadius: 10,
                      outline: 'none',
                      color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                      resize: 'vertical',
                    }}
                    className={isDark ? 'focus:!border-[rgba(167,139,250,0.5)]' : 'focus:!border-[rgba(124,58,237,0.4)]'}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label
                    htmlFor="custom-template-tags"
                    style={{
                      display: 'block',
                      fontSize: 12.5,
                      fontWeight: 600,
                      marginBottom: 6,
                      color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                    }}
                  >
                    Tags <span style={{ fontWeight: 400, color: isDark ? D.textMuted : 'var(--color-text-secondary)' }}>(comma separated)</span>
                  </label>
                  <input
                    id="custom-template-tags"
                    type="text"
                    placeholder="e.g. react, typescript, system-design"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: 13,
                      background: isDark ? 'rgba(20, 19, 32, 0.9)' : '#FFFFFF',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124, 58, 237, 0.16)'}`,
                      borderRadius: 10,
                      outline: 'none',
                      color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  padding: '16px 24px',
                  borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 12,
                  background: isDark ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0, 0, 0, 0.02)',
                }}
              >
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  style={{
                    padding: '9px 18px',
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 10,
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
                    background: 'transparent',
                    color: isDark ? D.textSecondary : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                  }}
                  className={isDark ? 'hover:!bg-[rgba(255,255,255,0.06)]' : 'hover:!bg-[rgba(0,0,0,0.05)]'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-create-template-btn"
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '9px 20px',
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 10,
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                    color: '#FFFFFF',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                    opacity: loading ? 0.75 : 1,
                  }}
                  className="hover:brightness-110 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Create Template</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
