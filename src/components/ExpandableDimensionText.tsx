'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useIsDark, D } from '@/theme/theme';

interface ExpandableDimensionTextProps {
  text: string;
  maxLines?: number;
  fontSize?: number;
  lineHeight?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Parses markdown bold (**word**) into standard <strong> tags.
 */
function renderFormattedText(text: string) {
  if (!text || !text.includes('**')) return text;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} style={{ fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function ExpandableDimensionText({
  text,
  maxLines = 3,
  fontSize = 11.5,
  lineHeight = 1.45,
  className = '',
  style = {},
}: ExpandableDimensionTextProps) {
  const isDark = useIsDark();
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  const checkOverflow = useCallback(() => {
    const el = textRef.current;
    if (!el) return;

    // Measure if the content overflows maxLines
    if (!isExpanded) {
      const hasOverflow = el.scrollHeight > el.clientHeight + 2;
      setCanExpand(hasOverflow);
    }
  }, [isExpanded]);

  useEffect(() => {
    checkOverflow();

    if (typeof ResizeObserver !== 'undefined' && textRef.current) {
      const ro = new ResizeObserver(() => {
        checkOverflow();
      });
      ro.observe(textRef.current);
      return () => ro.disconnect();
    }

    const handleResize = () => checkOverflow();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [text, checkOverflow]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
      <p
        ref={textRef}
        className={className}
        style={{
          fontSize,
          lineHeight,
          color: isDark ? D.textSecondary : '#64748B',
          margin: 0,
          fontWeight: 500,
          display: isExpanded ? 'block' : '-webkit-box',
          WebkitLineClamp: isExpanded ? 'unset' : maxLines,
          WebkitBoxOrient: 'vertical',
          overflow: isExpanded ? 'visible' : 'hidden',
          wordBreak: 'break-word',
          transition: 'all 200ms ease',
          ...style,
        }}
      >
        {renderFormattedText(text || 'No details provided.')}
      </p>

      {canExpand && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded((prev) => !prev);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            background: 'none',
            border: 'none',
            padding: '4px 0 0 0',
            marginTop: 2,
            fontSize: 11,
            fontWeight: 600,
            color: isDark ? '#C084FC' : '#7C3AED',
            cursor: 'pointer',
            alignSelf: 'flex-start',
            transition: 'opacity 150ms ease, transform 150ms ease',
          }}
          className="hover:opacity-80 active:scale-95"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Show less' : 'Show more'}</span>
          {isExpanded ? (
            <ChevronUp size={11} strokeWidth={2.4} />
          ) : (
            <ChevronDown size={11} strokeWidth={2.4} />
          )}
        </button>
      )}
    </div>
  );
}
