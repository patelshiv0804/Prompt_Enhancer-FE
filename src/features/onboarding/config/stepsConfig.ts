import { OnboardingStepConfig } from '../types';

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    id: 'display_name',
    title: 'What should we call you?',
    subtitle: "Enter the name you'd like to use across the platform.",
    shortLabel: 'Display Name',
  },
  {
    id: 'role',
    title: 'Select your primary role',
    subtitle: 'Choose the role that best describes your daily focus.',
    shortLabel: 'Role',
  },
  {
    id: 'mode',
    title: 'Choose your primary mode',
    subtitle: 'Select a mode associated with your role to personalize your experience.',
    shortLabel: 'Mode',
  },
  {
    id: 'avatar',
    title: 'Customize your avatar',
    subtitle: 'Upload a photo or choose from our collection.',
    shortLabel: 'Avatar',
    isOptional: true,
  },
  {
    id: 'theme',
    title: 'Choose your default theme',
    subtitle: 'You can change the theme anytime in Settings.',
    shortLabel: 'Theme',
  },
  {
    id: 'complete',
    title: "You're all set!",
    subtitle: 'Review your settings below and finish setup.',
    shortLabel: 'Review',
  },
];
