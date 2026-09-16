'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface MarqueeTitleProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  titleHover?: string;
}

export default function MarqueeTitle({ text, className = '', style = {}, titleHover }: MarqueeTitleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflowDistance, setOverflowDistance] = useState(0);

  const checkOverflow = useCallback(() => {
    if (!containerRef.current || !textRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const textWidth = textRef.current.scrollWidth;

    if (textWidth > containerWidth + 2) {
      setOverflowDistance(textWidth - containerWidth);
    } else {
      setOverflowDistance(0);
    }
  }, []);

  useEffect(() => {
    checkOverflow();

    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      const ro = new ResizeObserver(() => {
        checkOverflow();
      });
      ro.observe(containerRef.current);
      return () => ro.disconnect();
    }

    const handleResize = () => checkOverflow();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [text, checkOverflow]);

  const isOverflowing = overflowDistance > 0;
  // Natural reading speed: ~35px per second for the forward scroll (48% of loop)
  const forwardTravelTime = overflowDistance / 35;
  const duration = Math.max(2.4, Math.min(8.0, forwardTravelTime / 0.48));

  return (
    <div
      ref={containerRef}
      title={titleHover || text}
      className={`marquee-container ${className}`}
      style={{
        overflow: 'hidden',
        position: 'relative',
        minWidth: 0,
        width: '100%',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <span
        ref={textRef}
        className={`marquee-content ${isOverflowing ? 'is-overflowing' : ''}`}
        style={
          isOverflowing
            ? ({
                '--marquee-dist': `-${overflowDistance + 8}px`,
                '--marquee-duration': `${duration.toFixed(2)}s`,
              } as React.CSSProperties)
            : undefined
        }
      >
        {text}
      </span>
    </div>
  );
}
