'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Flame, Zap } from 'lucide-react';
import { useTheme, D } from '@/theme/theme';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ActivityHeatmapProps {
  activityCalendar?: Record<string, number>;
  currentStreak?: number;
  longestStreak?: number;
  totalActiveDays?: number;
  totalPrompts?: number;
}

interface DayCell {
  dateStr: string;
  displayDate: string;
  count: number;
  isStreak: boolean;
  dayOfWeek: number; // 0 = Sun, 6 = Sat
  isToday: boolean;
  isFuture: boolean;
}

// Helper to reliably format local YYYY-MM-DD regardless of client timezone
const toLocalDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Check activity count matching local key
const getActivityCount = (d: Date, calendar: Record<string, number>): number => {
  const localKey = toLocalDateKey(d);
  return calendar[localKey] || 0;
};

export function ActivityHeatmap({
  activityCalendar = {},
  currentStreak = 0,
  longestStreak = 0,
  totalActiveDays = 0,
  totalPrompts = 0,
}: ActivityHeatmapProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSmall = useMediaQuery('(max-width: 420px)');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to today (right side of the 52-week calendar) on mobile/tablet
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, []);

  const [hoveredCell, setHoveredCell] = useState<{
    cell: DayCell;
    x: number;
    y: number;
  } | null>(null);

  // Derive active days count if not provided
  const activeDaysCount = useMemo(() => {
    if (totalActiveDays > 0) return totalActiveDays;
    return Object.values(activityCalendar).filter((c) => c > 0).length;
  }, [totalActiveDays, activityCalendar]);

  // Dynamically compute streak from calendar activity to ensure real-time accuracy
  const effectiveStreak = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount = getActivityCount(today, activityCalendar);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayCount = getActivityCount(yesterday, activityCalendar);

    let activeStreak = 0;
    let checkD = new Date(today);
    if (todayCount === 0 && yesterdayCount > 0) {
      checkD = yesterday;
    } else if (todayCount === 0 && yesterdayCount === 0) {
      return currentStreak > 0 ? currentStreak : 0;
    }

    while (true) {
      const count = getActivityCount(checkD, activityCalendar);
      if (count > 0) {
        activeStreak++;
        checkD.setDate(checkD.getDate() - 1);
      } else {
        break;
      }
    }

    return Math.max(activeStreak, currentStreak);
  }, [activityCalendar, currentStreak]);

  const maxStreakCount = useMemo(() => {
    const maxVal = Math.max(longestStreak, effectiveStreak);
    return maxVal > 0 ? maxVal : 0;
  }, [longestStreak, effectiveStreak]);

  // Compute 52 weeks (364 days, full year like LeetCode and GitHub)
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Current streak set of dates
    const streakDates = new Set<string>();
    if (effectiveStreak > 0) {
      const todayCount = getActivityCount(today, activityCalendar);
      const startD = new Date(today);
      if (todayCount === 0) {
        startD.setDate(startD.getDate() - 1);
      }
      for (let i = 0; i < effectiveStreak; i++) {
        const d = new Date(startD);
        d.setDate(d.getDate() - i);
        streakDates.add(toLocalDateKey(d));
      }
    }

    // 52 weeks across the full year
    const WEEKS_COUNT = 52;
    const dayOfWeekToday = today.getDay(); // 0 = Sunday, 6 = Saturday
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + (6 - dayOfWeekToday)); // end on current week's Saturday

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - WEEKS_COUNT * 7 + 1);

    const calculatedWeeks: DayCell[][] = [];
    const months: { label: string; colIndex: number }[] = [];
    let lastLabeledCol = -10;
    let lastMonthIdx = -1;

    const cursor = new Date(startDate);

    for (let w = 0; w < WEEKS_COUNT; w++) {
      const weekDays: DayCell[] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = toLocalDateKey(cursor);
        const isFuture = cursor > today;
        const isTodayDate = cursor.getTime() === today.getTime();
        const count = isFuture ? 0 : getActivityCount(cursor, activityCalendar);
        const isStreakDay = streakDates.has(dateStr);

        const currentMonth = cursor.getMonth();
        // Check if we entered a new month on this day and have enough spacing (at least 3 columns)
        if (d === 0 && currentMonth !== lastMonthIdx) {
          if (w - lastLabeledCol >= 3) {
            months.push({
              label: cursor.toLocaleDateString('en-US', { month: 'short' }),
              colIndex: w,
            });
            lastLabeledCol = w;
          }
          lastMonthIdx = currentMonth;
        }

        weekDays.push({
          dateStr,
          displayDate: cursor.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          count,
          isStreak: isStreakDay,
          dayOfWeek: d,
          isToday: isTodayDate,
          isFuture,
        });

        cursor.setDate(cursor.getDate() + 1);
      }
      calculatedWeeks.push(weekDays);
    }

    return { weeks: calculatedWeeks, monthLabels: months };
  }, [activityCalendar, effectiveStreak]);

  // Color determination for each cell matching LeetCode screenshot
  const getCellBackground = (cell: DayCell) => {
    if (cell.isFuture) {
      return isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)';
    }
    // Consecutive active streak highlight: vibrant purple/magenta pill (matches screenshot)
    if (cell.isStreak && cell.count > 0) {
      return 'linear-gradient(135deg, #A855F7 0%, #D946EF 100%)';
    }
    if (cell.count === 0) {
      return isDark ? 'rgba(255, 255, 255, 0.045)' : '#E2E8F0';
    }
    if (cell.count >= 6) {
      return '#22C55E';
    }
    if (cell.count >= 3) {
      return '#16A34A';
    }
    return '#15803D';
  };

  const getCellGlow = (cell: DayCell) => {
    if (cell.isStreak && cell.count > 0) {
      return '0 0 7px rgba(217, 70, 239, 0.6)';
    }
    if (cell.count >= 6) {
      return '0 0 6px rgba(34, 197, 94, 0.45)';
    }
    if (cell.isToday) {
      return '0 0 0 1.5px #7C3AED';
    }
    return 'none';
  };

  return (
    <div
      style={{
        background: isDark ? 'rgba(18, 16, 28, 0.88)' : '#FFFFFF',
        borderRadius: 24,
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(124, 58, 237, 0.12)'}`,
        boxShadow: isDark
          ? 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 16px 40px -8px rgba(0, 0, 0, 0.5)'
          : '0 8px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
        padding: isSmall ? '16px 14px' : isMobile ? '18px 18px' : '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? 14 : 18,
        width: '100%',
        position: 'relative',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Top Header & Streak Telemetry */}
      <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: isSmall ? 14.5 : isMobile ? 15.5 : 17, fontWeight: 800, color: isDark ? D.textPrimary : '#0F172A', margin: 0, letterSpacing: -0.3 }}>
            Prompt Enhancement Activity Calendar
          </h3>
        </div>

        {/* Streak Stat Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: isDark ? 'rgba(245, 158, 11, 0.14)' : 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              padding: isSmall ? '4px 10px' : '5px 12px',
              borderRadius: 9999,
              fontSize: isSmall ? 11 : 12,
              fontWeight: 700,
              color: '#F59E0B',
            }}
          >
            <Flame size={isSmall ? 13 : 14} color="#F59E0B" />
            <span>{effectiveStreak}d Streak</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: isDark ? 'rgba(168, 85, 247, 0.14)' : 'rgba(168, 85, 247, 0.08)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              padding: isSmall ? '4px 10px' : '5px 12px',
              borderRadius: 9999,
              fontSize: isSmall ? 11 : 12,
              fontWeight: 700,
              color: '#C084FC',
            }}
          >
            <Zap size={isSmall ? 13 : 14} color="#C084FC" />
            <span>Max: {maxStreakCount}d</span>
          </div>
        </div>
      </div>

      {/* On mobile: subtle swipe reminder */}
      {isMobile && (
        <div style={{ fontSize: 10.5, color: isDark ? D.textMuted : '#94A3B8', marginTop: -4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>← Swipe horizontally to see 52-week activity history</span>
        </div>
      )}

      {/* Full-Size Calendar Heatmap Container */}
      <div
        ref={scrollContainerRef}
        style={{
          width: '100%',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: 8,
          scrollbarWidth: 'thin',
        }}
      >
        <div style={{ minWidth: 940, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Month Labels Row */}
          <div style={{ display: 'flex', marginLeft: 32, position: 'relative', height: 18 }}>
            {monthLabels.map((m, i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  left: m.colIndex * 17.5,
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: isDark ? D.textMuted : '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid: Weekday labels on left + 52 Week Columns */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Weekday indicators */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: 7 * 13.5 + 6 * 4,
                width: 24,
                fontSize: 9.5,
                fontWeight: 600,
                color: isDark ? D.textMuted : '#94A3B8',
                paddingTop: 1,
              }}
            >
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* 52 Columns Grid (Full size 13.5px cells with 4px gap) */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', flex: 1 }}>
              {weeks.map((week, wIdx) => (
                <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {week.map((cell, dIdx) => {
                    const bg = getCellBackground(cell);
                    const glow = getCellGlow(cell);

                    return (
                      <div
                        key={dIdx}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCell({
                            cell,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{
                          width: 13.5,
                          height: 13.5,
                          borderRadius: 3.5,
                          background: bg,
                          boxShadow: glow,
                          border: cell.isStreak && cell.count > 0 ? '1px solid rgba(255, 255, 255, 0.4)' : 'none',
                          cursor: cell.isFuture ? 'default' : 'pointer',
                          transition: 'transform 120ms ease, box-shadow 120ms ease',
                          transform: hoveredCell?.cell.dateStr === cell.dateStr ? 'scale(1.4)' : 'none',
                          zIndex: hoveredCell?.cell.dateStr === cell.dateStr ? 10 : 1,
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Legend & Summary */}
      <div
        style={{
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 12,
          paddingTop: 8,
          borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9'}`,
        }}
      >
        <span style={{ fontSize: isSmall ? 10.5 : 11.5, color: isDark ? D.textMuted : '#64748B' }}>
          Total <strong style={{ color: isDark ? D.textPrimary : '#1E293B' }}>{totalPrompts}</strong> lifetime prompt enhancements recorded • <strong style={{ color: isDark ? D.textPrimary : '#1E293B' }}>{activeDaysCount}</strong> active days
        </span>

        {/* Legend with LeetCode Streak Highlight */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: isSmall ? 10 : 11, color: isDark ? D.textMuted : '#94A3B8', flexWrap: 'wrap' }}>
          <span>Less</span>
          <div style={{ width: 11, height: 11, borderRadius: 3, background: isDark ? 'rgba(255,255,255,0.045)' : '#E2E8F0' }} />
          <div style={{ width: 11, height: 11, borderRadius: 3, background: '#15803D' }} />
          <div style={{ width: 11, height: 11, borderRadius: 3, background: '#16A34A' }} />
          <div style={{ width: 11, height: 11, borderRadius: 3, background: '#22C55E' }} />
          <div
            title="Active Streak Highlight"
            style={{
              width: 11,
              height: 11,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #A855F7, #D946EF)',
              boxShadow: '0 0 6px rgba(217, 70, 239, 0.7)',
            }}
          />
          <span>More</span>
          <span style={{ marginLeft: 6, fontSize: isSmall ? 10 : 11, color: '#D946EF', fontWeight: 700 }}>
            (🟣 Streak Highlight)
          </span>
        </div>
      </div>

      {/* Floating Hover Tooltip rendered to document.body so it is never trapped by backdropFilter/transform */}
      {hoveredCell && !hoveredCell.cell.isFuture && typeof document !== 'undefined' &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              left: hoveredCell.x,
              top: hoveredCell.y - 10,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
              background: isDark ? 'rgba(15, 14, 22, 0.97)' : '#0F172A',
              border: `1px solid ${hoveredCell.cell.isStreak && hoveredCell.cell.count > 0 ? '#D946EF' : (isDark ? 'rgba(255, 255, 255, 0.18)' : '#334155')}`,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.55)',
              color: '#FFFFFF',
              padding: '7px 12px',
              borderRadius: 8,
              fontSize: 11.5,
              zIndex: 999999,
              whiteSpace: 'nowrap',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              textAlign: 'center',
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {hoveredCell.cell.count === 0
                ? 'No enhancements'
                : `${hoveredCell.cell.count} prompt enhancement${hoveredCell.cell.count === 1 ? '' : 's'}`}
            </div>
            <div style={{ fontSize: 10, color: '#94A3B8' }}>{hoveredCell.cell.displayDate}</div>
            {hoveredCell.cell.isStreak && hoveredCell.cell.count > 0 && (
              <div style={{ fontSize: 10, color: '#D946EF', fontWeight: 700 }}>
                🔥 Active Consecutive Streak Day
              </div>
            )}
            {/* Tooltip arrow notch */}
            <div
              style={{
                position: 'absolute',
                bottom: -4,
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: 8,
                height: 8,
                background: isDark ? 'rgba(15, 14, 22, 0.97)' : '#0F172A',
                borderRight: `1px solid ${hoveredCell.cell.isStreak && hoveredCell.cell.count > 0 ? '#D946EF' : (isDark ? 'rgba(255, 255, 255, 0.18)' : '#334155')}`,
                borderBottom: `1px solid ${hoveredCell.cell.isStreak && hoveredCell.cell.count > 0 ? '#D946EF' : (isDark ? 'rgba(255, 255, 255, 0.18)' : '#334155')}`,
              }}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
