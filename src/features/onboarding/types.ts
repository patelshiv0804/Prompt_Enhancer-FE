export interface OnboardingState {
  displayName: string;
  role: string;
  mode: string;
  avatarUrl: string | null;
  avatarPreset: number;
  avatarFile: File | null;
  theme: 'light' | 'dark' | 'system';
  currentStepIndex: number;
  completedSteps: string[];
  isCompleted: boolean;
}

export interface OnboardingStepConfig {
  id: string;
  title: string;
  subtitle: string;
  shortLabel: string;
  isOptional?: boolean;
}
