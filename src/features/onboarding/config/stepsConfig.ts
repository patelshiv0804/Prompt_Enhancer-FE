import { OnboardingStepConfig } from '../types';

export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    id: 'profile',
    title: 'Set up your profile',
    subtitle: 'Tell us your name and pick an avatar to personalize your workspace.',
    shortLabel: 'Profile',
    motivationalTitle: "Let's get started 👋",
    motivationalSubtitle: 'Add your name and a face — this is how your workspace will greet you.',
    quote: 'Every breakthrough prompt begins with a clear voice.',
    badgeEmoji: '🚀',
  },
  {
    id: 'role',
    title: 'Select your primary role',
    subtitle: 'Choose the role that best matches your daily focus.',
    shortLabel: 'Role',
    motivationalTitle: "You're doing great! 🎉",
    motivationalSubtitle: 'Your role tailors every suggestion to the work you actually do.',
    quote: 'Specialized roles yield 10x more targeted, high-impact results.',
    badgeEmoji: '🔥',
  },
  {
    id: 'focus',
    title: 'Choose your focus mode',
    subtitle: 'Pick a default focus mode for instant, tailored prompt enhancement.',
    shortLabel: 'Focus',
    motivationalTitle: "You're on a roll! ⚡",
    motivationalSubtitle: 'Set a starting focus — you can switch modes anytime while you work.',
    quote: 'The right mode transforms raw ideas into polished masterpieces.',
    badgeEmoji: '⚡',
  },
  {
    id: 'finish',
    title: "You're all set!",
    subtitle: 'Pick your appearance and review your workspace before you launch.',
    shortLabel: 'Finish',
    motivationalTitle: "You're all set! 🎊",
    motivationalSubtitle: "Choose your look, give it a final glance, and start engineering elite prompts.",
    quote: 'Welcome to AURE — where ideas become elite prompts.',
    badgeEmoji: '🎉',
  },
];
