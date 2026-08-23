import React from 'react';
import { Check } from 'lucide-react';
import { ROLES, ROLE_MODES } from '@/constants/roles';

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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', boxSizing: 'border-box' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
        width: '100%',
        boxSizing: 'border-box',
      }}>
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
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 5, padding: '10px 6px', borderRadius: 14, border: 'none', cursor: 'pointer',
                textAlign: 'center', position: 'relative', minHeight: 74, boxSizing: 'border-box',
                transition: 'all 180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                background: isSelected
                  ? (isDark ? 'rgba(99, 102, 241, 0.18)' : '#F5F3FF')
                  : (isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF'),
                color: isSelected ? (isDark ? '#A5B4FC' : '#4C1D95') : (isDark ? '#FFFFFF' : '#18181B'),
                outline: isSelected
                  ? '2px solid #6366F1'
                  : `1.5px solid ${isDark ? 'rgba(255,255,255,0.10)' : '#E4E4E7'}`,
                boxShadow: isSelected
                  ? '0 3px 10px rgba(99, 102, 241, 0.18)'
                  : '0 1px 2px rgba(0,0,0,0.02)',
              }}
              className="interactive-card hover:scale-[1.02] active:scale-[0.98]"
            >
              {/* Icon */}
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isSelected
                  ? (isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.12)')
                  : (isDark ? 'rgba(255,255,255,0.06)' : '#F4F4F5'),
                color: isSelected ? '#6366F1' : (isDark ? 'rgba(255,255,255,0.8)' : '#71717A'),
                transition: 'all 180ms ease',
              }}>
                <Icon size={16} strokeWidth={2} />
              </div>

              {/* Title & Modes count */}
              <div>
                <span style={{ fontSize: 12.5, fontWeight: 700, display: 'block', lineHeight: 1.1 }}>
                  {role.label}
                </span>
                <span style={{
                  fontSize: 10.5, fontWeight: 500,
                  color: isSelected
                    ? (isDark ? 'rgba(165, 180, 252, 0.85)' : '#6D28D9')
                    : (isDark ? 'rgba(255,255,255,0.5)' : '#71717A'),
                  display: 'block', marginTop: 2,
                }}>
                  {modeCount} modes
                </span>
              </div>

              {/* Selected Checkmark Badge */}
              {isSelected && (
                <div style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#6366F1', color: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 5px rgba(99, 102, 241, 0.4)',
                }}>
                  <Check size={10} strokeWidth={3.5} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
