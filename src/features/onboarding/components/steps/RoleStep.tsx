import React from 'react';
import { Check } from 'lucide-react';
import { ROLES, ROLE_MODES } from '@/constants/roles';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface RoleStepProps {
  selectedRole: string;
  onSelectRole: (roleId: string) => void;
  isDark: boolean;
}

export const RoleStep: React.FC<RoleStepProps> = ({
  selectedRole,
  onSelectRole,
  isDark,
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '100%',
        boxSizing: 'border-box',
        padding: isMobile ? '2px 2px' : '8px 4px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? 8 : 12,
          padding: isMobile ? '2px 2px 6px' : '10px 8px 10px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole.toLowerCase() === role.id.toLowerCase() || selectedRole.toLowerCase() === role.label.toLowerCase();
          const modeCount = ROLE_MODES[role.id]?.length || 8;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelectRole(role.id)}
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'row' : 'column',
                alignItems: 'center',
                justifyContent: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? 8 : 6,
                padding: isMobile ? '8px 10px' : '12px 8px',
                borderRadius: 14,
                border: isSelected
                  ? '2px solid #6366F1'
                  : `1.5px solid ${isDark ? 'rgba(255,255,255,0.10)' : '#E4E4E7'}`,
                outline: 'none',
                cursor: 'pointer',
                textAlign: isMobile ? 'left' : 'center',
                position: 'relative',
                minHeight: isMobile ? 52 : 74,
                boxSizing: 'border-box',
                transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                background: isSelected
                  ? (isDark ? 'rgba(99, 102, 241, 0.18)' : '#F5F3FF')
                  : (isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF'),
                color: isSelected ? (isDark ? '#A5B4FC' : '#4C1D95') : (isDark ? '#FFFFFF' : '#18181B'),
                boxShadow: isSelected
                  ? '0 4px 14px rgba(99, 102, 241, 0.20)'
                  : (isDark ? '0 1px 3px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.02)'),
              }}
              className="interactive-card hover:scale-[1.025] active:scale-[0.98]"
            >
              {/* Icon */}
              <div style={{
                width: isMobile ? 28 : 32,
                height: isMobile ? 28 : 32,
                borderRadius: 8,
                flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isSelected
                  ? (isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.12)')
                  : (isDark ? 'rgba(255,255,255,0.06)' : '#F4F4F5'),
                color: isSelected ? '#6366F1' : (isDark ? 'rgba(255,255,255,0.8)' : '#71717A'),
                transition: 'all 180ms ease',
              }}>
                <Icon size={isMobile ? 14 : 16} strokeWidth={2} />
              </div>

              {/* Title & Modes count */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  fontSize: isMobile ? 11.5 : 12.5,
                  fontWeight: 700,
                  display: 'block',
                  lineHeight: 1.15,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: isMobile ? 'nowrap' : 'normal',
                }}>
                  {role.label}
                </span>
                <span style={{
                  fontSize: isMobile ? 10 : 10.5,
                  fontWeight: 500,
                  color: isSelected
                    ? (isDark ? 'rgba(165, 180, 252, 0.85)' : '#6D28D9')
                    : (isDark ? 'rgba(255,255,255,0.5)' : '#71717A'),
                  display: 'block',
                  marginTop: 2,
                }}>
                  {modeCount} modes
                </span>
              </div>

              {/* Selected Checkmark Badge */}
              {isSelected && (
                <div style={{
                  position: 'absolute', top: 5, right: 5,
                  width: 15, height: 15, borderRadius: '50%',
                  background: '#6366F1', color: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(99, 102, 241, 0.4)',
                }}>
                  <Check size={9} strokeWidth={3.5} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
