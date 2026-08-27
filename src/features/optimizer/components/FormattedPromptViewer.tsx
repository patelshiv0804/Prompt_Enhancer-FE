'use client';

import React, { useState } from 'react';
import { Copy, Check, Code as CodeIcon } from 'lucide-react';
import { useTheme, D } from '@/theme/theme';

interface FormattedPromptViewerProps {
  content: string;
}

export default function FormattedPromptViewer({ content }: FormattedPromptViewerProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  if (!content) return null;

  // Clean raw markers if any
  let text = content.trim();
  const markers = ['ENHANCED PROMPT:', 'ENHANCED PROMPT', 'Enhanced Prompt:'];
  for (const m of markers) {
    const idx = text.indexOf(m);
    if (idx !== -1) {
      text = text.substring(idx + m.length).trim();
      break;
    }
  }

  // Historical versions may have been saved before the backend began
  // normalising LLM Markdown. Remove emphasis delimiters here as a final UI
  // safeguard, including escaped markers returned by some providers.
  text = text
    .replace(/\\([*_`])/g, '$1')
    .replace(/\\?\*{2,}/g, '')
    .replace(/\\?_{2,}/g, '')
    .replace(/\\?`/g, '')
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '$1')
    .replace(/(?<!_)_([^_\n]+?)_(?!_)/g, '$1');

  if (text.includes('DIAGNOSED MODE:') || text.includes('DIAGNOSIS NOTES:')) {
    const actIdx = text.search(/(Act as|You are|Your task|System Prompt|# |\*\*Persona|\*\*Task)/i);
    if (actIdx !== -1) {
      text = text.substring(actIdx).trim();
    }
  }

  const handleCopyCode = async (codeText: string, index: number) => {
    await navigator.clipboard.writeText(codeText);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Helper to render inline formatting (**bold**, `code`)
  const renderInline = (str: string) => {
    const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : 'var(--color-text-primary, #1E1B4B)' }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            style={{
              background: isDark ? 'rgba(139,92,246,0.18)' : 'rgba(124,58,237,0.08)',
              color: isDark ? '#C084FC' : '#6D28D9',
              padding: '2px 6px',
              borderRadius: '6px',
              fontSize: '0.9em',
              fontFamily: 'monospace',
              fontWeight: 600,
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Split into blocks (code blocks vs text blocks)
  const blocks: { type: 'text' | 'code'; content: string; language?: string }[] = [];
  const lines = text.split('\n');

  let inCode = false;
  let codeBuffer: string[] = [];
  let codeLang = '';
  let textBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      if (inCode) {
        // End code block
        blocks.push({ type: 'code', content: codeBuffer.join('\n'), language: codeLang });
        codeBuffer = [];
        codeLang = '';
        inCode = false;
      } else {
        // Start code block
        if (textBuffer.length > 0) {
          blocks.push({ type: 'text', content: textBuffer.join('\n') });
          textBuffer = [];
        }
        inCode = true;
        codeLang = line.trim().slice(3).trim() || 'plaintext';
      }
    } else if (inCode) {
      codeBuffer.push(line);
    } else {
      textBuffer.push(line);
    }
  }

  if (textBuffer.length > 0) {
    blocks.push({ type: 'text', content: textBuffer.join('\n') });
  }
  if (codeBuffer.length > 0) {
    blocks.push({ type: 'code', content: codeBuffer.join('\n'), language: codeLang });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', fontSize: 14, lineHeight: 1.65 }}>
      {blocks.map((block, bIdx) => {
        if (block.type === 'code') {
          return (
            <div
              key={bIdx}
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                background: '#0B0B12',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(124,58,237,0.15)'}`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                margin: '8px 0',
              }}
            >
              {/* Code Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 16px',
                  background: isDark ? '#141320' : '#1E293B',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 12,
                  color: '#94A3B8',
                  fontFamily: 'monospace',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CodeIcon size={14} style={{ color: '#A78BFA' }} />
                  <span style={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                    {block.language}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyCode(block.content, bIdx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 10px',
                    color: copiedCodeIndex === bIdx ? '#4ADE80' : '#E2E8F0',
                    fontSize: 11,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {copiedCodeIndex === bIdx ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedCodeIndex === bIdx ? 'Copied' : 'Copy code'}</span>
                </button>
              </div>
              {/* Code Body */}
              <pre
                style={{
                  padding: 16,
                  margin: 0,
                  overflowX: 'auto',
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: '#F8FAFC',
                  background: 'transparent',
                }}
              >
                <code>{block.content}</code>
              </pre>
            </div>
          );
        }

        // Render formatted text lines
        const paragraphLines = block.content.split('\n');
        return (
          <div key={bIdx} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {paragraphLines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              if (/^(---+|___+|\*\*\*+)$/.test(trimmed)) return null;

              const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
              if (headingMatch) {
                const headingLevel = headingMatch[1].length;
                const headingStyle = {
                  fontSize: headingLevel <= 2 ? 20 : headingLevel <= 4 ? 17 : 15,
                  fontWeight: 700,
                  color: headingLevel <= 2 ? (isDark ? '#F5F4F8' : '#1E1B4B') : headingLevel <= 4 ? (isDark ? '#C084FC' : '#4C1D95') : (isDark ? '#A78BFA' : '#6D28D9'),
                  margin: '10px 0 4px',
                  letterSpacing: headingLevel <= 2 ? '-0.02em' : '-0.01em',
                  fontFamily: "'Geist', sans-serif",
                };
                return <div key={lIdx} style={headingStyle}>{renderInline(headingMatch[2])}</div>;
              }

              if (trimmed.startsWith('# ')) {
                return (
                  <h1
                    key={lIdx}
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: isDark ? '#F5F4F8' : '#1E1B4B',
                      margin: '12px 0 4px',
                      letterSpacing: '-0.02em',
                      fontFamily: "'Geist', sans-serif",
                    }}
                  >
                    {trimmed.slice(2)}
                  </h1>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h2
                    key={lIdx}
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: isDark ? '#C084FC' : '#4C1D95',
                      margin: '10px 0 4px',
                      letterSpacing: '-0.01em',
                      fontFamily: "'Geist', sans-serif",
                    }}
                  >
                    {trimmed.slice(3)}
                  </h2>
                );
              }
              if (trimmed.startsWith('### ')) {
                return (
                  <h3
                    key={lIdx}
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: isDark ? '#A78BFA' : '#6D28D9',
                      margin: '8px 0 2px',
                      fontFamily: "'Geist', sans-serif",
                    }}
                  >
                    {trimmed.slice(4)}
                  </h3>
                );
              }

              // Check for Key Section Header like **Persona**: or **Task**: or **Requirements**:
              const sectionMatch = trimmed.match(/^(\*\*[^*]+:\*\*|\*\*[^*]+\*\*)\s*(.*)/);
              if (sectionMatch && (trimmed.startsWith('**Persona') || trimmed.startsWith('**Task') || trimmed.startsWith('**Requirements') || trimmed.startsWith('**Step') || trimmed.startsWith('**Output') || trimmed.startsWith('**Structure') || trimmed.startsWith('**Level'))) {
                return (
                  <div
                    key={lIdx}
                    style={{
                      marginTop: 10,
                      padding: '10px 14px',
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(139,92,246,0.14) 0%, rgba(167,139,250,0.06) 100%)'
                        : 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(167,139,250,0.03) 100%)',
                      borderLeft: '4px solid #8B5CF6',
                      borderRadius: '0 10px 10px 0',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: isDark ? '#C084FC' : '#5B21B6', fontSize: 14, marginBottom: sectionMatch[2] ? 4 : 0 }}>
                      {renderInline(sectionMatch[1])}
                    </div>
                    {sectionMatch[2] && (
                      <div style={{ color: isDark ? D.textSecondary : '#374151', fontSize: 13.5, lineHeight: 1.6 }}>
                        {renderInline(sectionMatch[2])}
                      </div>
                    )}
                  </div>
                );
              }

              // Check for Bullet points (- or *)
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lIdx} style={{ display: 'flex', gap: 10, paddingLeft: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: isDark ? '#A78BFA' : '#7C3AED', fontWeight: 800, fontSize: 16, lineHeight: '18px' }}>•</span>
                    <div style={{ color: isDark ? D.textPrimary : '#374151', flex: 1 }}>{renderInline(trimmed.slice(2))}</div>
                  </div>
                );
              }

              // Check for Numbered lists (1. , 2. )
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lIdx} style={{ display: 'flex', gap: 10, paddingLeft: 6, alignItems: 'flex-start' }}>
                    <span
                      style={{
                        background: isDark ? 'rgba(139,92,246,0.2)' : 'rgba(124,58,237,0.1)',
                        color: isDark ? '#C084FC' : '#6D28D9',
                        fontWeight: 700,
                        fontSize: 11,
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {numMatch[1]}
                    </span>
                    <div style={{ color: isDark ? D.textPrimary : '#374151', flex: 1 }}>{renderInline(numMatch[2])}</div>
                  </div>
                );
              }

              // Standard paragraph line
              return (
                <p key={lIdx} style={{ margin: 0, color: isDark ? D.textPrimary : '#374151' }}>
                  {renderInline(trimmed)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
