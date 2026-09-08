import React, { useState } from 'react';
import { Search, X, Check } from 'lucide-react';
import { ROLES, ROLE_MODES, getModeIcon } from '@/constants/roles';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ModeStepProps {
  selectedRole: string;
  selectedMode: string;
  onSelectMode: (mode: string) => void;
  isDark: boolean;
}

export const ModeStep: React.FC<ModeStepProps> = ({
  selectedRole,
  selectedMode,
  onSelectMode,
  isDark,
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const [searchQuery, setSearchQuery] = useState('');

  const currentRoleObj = ROLES.find(
    (r) => r.id.toLowerCase() === selectedRole.toLowerCase() || r.label.toLowerCase() === selectedRole.toLowerCase()
  ) || ROLES[0];

  const currentRoleId = currentRoleObj.id.toLowerCase();
  const availableModes = ROLE_MODES[currentRoleId] || ROLE_MODES['general'];

  const filteredModes = availableModes.filter((m) =>
    m.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: isMobile ? 10 : 14, width: '100%', height: '100%', boxSizing: 'border-box' }}>
      {/* Selected Role Indicator & Search Bar Row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%', gap: 8, boxSizing: 'border-box',
      }}>
        <div style={{ fontSize: isMobile ? 12 : 13.5, color: isDark ? 'rgba(255,255,255,0.85)' : '#0F172A', fontWeight: 500, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          Selected: <strong style={{ color: '#6366F1', fontWeight: 800 }}>{currentRoleObj.label}</strong>
        </div>

        {/* Search Field */}
        <div style={{ position: 'relative', width: isMobile ? 140 : 200, flexShrink: 0, boxSizing: 'border-box' }}>
          <Search
            size={isMobile ? 12 : 13}
            style={{
              position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)',
              color: isDark ? 'rgba(255,255,255,0.45)' : '#94A3B8', pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modes..."
            style={{
              width: '100%', padding: isMobile ? '5px 22px 5px 26px' : '6px 28px 6px 30px', fontSize: isMobile ? 11.5 : 12, fontWeight: 500,
              borderRadius: 8, outline: 'none', boxSizing: 'border-box',
              background: isDark ? 'rgba(255,255,255,0.06)' : '#F8FAFC',
              color: isDark ? '#FFFFFF' : '#0F172A',
              border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.14)' : '#E2E8F0'}`,
              transition: 'all 180ms ease',
            }}
            className="focus:!border-[#6366F1]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                color: isDark ? 'rgba(255,255,255,0.5)' : '#94A3B8', display: 'flex', alignItems: 'center'
              }}
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Mode Pills Container */}
      <div style={{
        display: 'flex', gap: isMobile ? 6 : 8, flexWrap: 'wrap',
        maxHeight: isMobile ? 190 : 220, overflowY: 'auto',
        padding: '4px 6px 6px 4px',
        width: '100%', boxSizing: 'border-box',
        scrollbarWidth: 'thin',
      }}>
        {filteredModes.length === 0 ? (
          <div style={{
            padding: '20px 0', width: '100%', textAlign: 'center', fontSize: 12.5,
            fontStyle: 'italic', color: isDark ? 'rgba(255,255,255,0.5)' : '#64748B'
          }}>
            No modes matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredModes.map((modeOpt) => {
            const ModeIcon = getModeIcon(modeOpt);
            const isSelected = selectedMode.toLowerCase() === modeOpt.toLowerCase();

            return (
              <button
                key={modeOpt}
                type="button"
                onClick={() => onSelectMode(modeOpt)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: isMobile ? 5 : 7,
                  padding: isMobile ? '6px 11px' : '8px 14px', borderRadius: 10, fontSize: isMobile ? 11.5 : 12.5, fontWeight: isSelected ? 700 : 600,
                  cursor: 'pointer',
                  border: isSelected
                    ? '2px solid #6366F1'
                    : `1.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0'}`,
                  outline: 'none',
                  whiteSpace: 'nowrap',
                  boxSizing: 'border-box',
                  transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                  flexShrink: 0,
                  background: isSelected
                    ? (isDark ? 'rgba(99, 102, 241, 0.22)' : '#F5F3FF')
                    : (isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC'),
                  color: isSelected ? (isDark ? '#A5B4FC' : '#4C1D95') : (isDark ? '#FFFFFF' : '#0F172A'),
                  boxShadow: isSelected
                    ? '0 3px 10px rgba(99, 102, 241, 0.20)'
                    : (isDark ? '0 1px 3px rgba(0,0,0,0.15)' : '0 1px 2px rgba(0,0,0,0.02)'),
                }}
                className="interactive-pill hover:scale-[1.03] active:scale-[0.98]"
              >
                <ModeIcon size={isMobile ? 13 : 15} style={{ color: isSelected ? '#6366F1' : (isDark ? 'rgba(255,255,255,0.7)' : '#64748B'), flexShrink: 0 }} />
                <span>{modeOpt}</span>
                {isSelected && (
                  <div style={{
                    width: isMobile ? 13 : 15, height: isMobile ? 13 : 15, borderRadius: '50%',
                    background: '#6366F1', color: '#FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginLeft: 2, flexShrink: 0,
                  }}>
                    <Check size={isMobile ? 8 : 10} strokeWidth={3.5} />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
