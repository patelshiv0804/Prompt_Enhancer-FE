import React, { useState } from 'react';
import { Search, X, Check } from 'lucide-react';
import { ROLES, ROLE_MODES, getModeIcon } from '@/constants/roles';

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
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, width: '100%', height: '100%', boxSizing: 'border-box' }}>
      {/* Selected Role Indicator & Search Bar Row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%', gap: 12, boxSizing: 'border-box',
      }}>
        <div style={{ fontSize: 13.5, color: isDark ? 'rgba(255,255,255,0.85)' : '#0F172A', fontWeight: 500 }}>
          Selected Role: <strong style={{ color: '#6366F1', fontWeight: 800 }}>{currentRoleObj.label}</strong>
        </div>

        {/* Search Field */}
        <div style={{ position: 'relative', width: 200, maxWidth: '50%', boxSizing: 'border-box' }}>
          <Search
            size={13}
            style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              color: isDark ? 'rgba(255,255,255,0.45)' : '#94A3B8', pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modes..."
            style={{
              width: '100%', padding: '6px 28px 6px 30px', fontSize: 12, fontWeight: 500,
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
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                color: isDark ? 'rgba(255,255,255,0.5)' : '#94A3B8', display: 'flex', alignItems: 'center'
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Mode Pills Container */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap',
        maxHeight: 220, overflowY: 'auto',
        padding: '2px 4px 4px 2px',
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
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '8px 14px', borderRadius: 10, fontSize: 12.5, fontWeight: isSelected ? 700 : 600,
                  cursor: 'pointer', border: 'none', whiteSpace: 'nowrap', boxSizing: 'border-box',
                  transition: 'all 180ms cubic-bezier(0.2, 0.8, 0.2, 1)', flexShrink: 0,
                  background: isSelected
                    ? (isDark ? 'rgba(99, 102, 241, 0.22)' : '#F5F3FF')
                    : (isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC'),
                  color: isSelected ? (isDark ? '#A5B4FC' : '#4C1D95') : (isDark ? '#FFFFFF' : '#0F172A'),
                  outline: isSelected
                    ? '2px solid #6366F1'
                    : `1.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0'}`,
                  boxShadow: isSelected
                    ? '0 3px 10px rgba(99, 102, 241, 0.20)'
                    : '0 1px 2px rgba(0,0,0,0.02)',
                }}
                className="interactive-pill hover:scale-[1.02] active:scale-[0.98]"
              >
                <ModeIcon size={15} style={{ color: isSelected ? '#6366F1' : (isDark ? 'rgba(255,255,255,0.7)' : '#64748B'), flexShrink: 0 }} />
                <span>{modeOpt}</span>
                {isSelected && (
                  <div style={{
                    width: 15, height: 15, borderRadius: '50%',
                    background: '#6366F1', color: '#FFFFFF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginLeft: 2, flexShrink: 0,
                  }}>
                    <Check size={10} strokeWidth={3.5} />
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
