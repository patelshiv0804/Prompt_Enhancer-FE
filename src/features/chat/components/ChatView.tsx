'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Copy, Wand2, Bookmark, TrendingUp, Clock, ArrowRight,
  CheckCircle2, AlertTriangle, Minus, GitCompareArrows,
  Sparkles, Code, Search, Megaphone, BookOpen, Image as ImageIcon,
  Film, PlaySquare, ChevronDown, GitBranch,
} from 'lucide-react';
import VersionHeader from './VersionHeader';
import VersionHistoryDrawer from './VersionHistoryDrawer';
import { useEnabledStyleOptions } from '@/features/style-memory/services/styleMemoryService';
import { apiClient } from '@/utils/apiClient';
import FormattedPromptViewer from '../../optimizer/components/FormattedPromptViewer';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Dimension {
  id: string;
  label: string;
  status: 'good' | 'warning' | 'neutral';
  icon: React.ElementType;
  desc: string;
  score: number;
  beforeScore?: number;
}

interface PromptVersion {
  versionNumber: number;
  optimizedPrompt: string;
  overallScore: number;
  dimensions: Dimension[];
  wordsAfter: number;
  tokensAfter: number;
  timestamp: string;
  tweakNote?: string;
  isStarred?: boolean;
  versionType?: string;
  toolRecommendations?: any;
}

interface OptimizationSession {
  id: string;
  originalPrompt: string;
  originalScore?: number;
  mode: string;
  modeIcon: React.ElementType;
  wordsBefore: number;
  tokensBefore: number;
  createdAt: string;
  versions: PromptVersion[];
  toolRecommendations?: {
    matched_task: string;
    match_type?: string;
    match_confidence?: number;
    tools: { name: string; rank: number }[];
  };
}

// ── Mock Sessions ──────────────────────────────────────────────────────────────
const MOCK_SESSIONS: Record<string, OptimizationSession> = {
  r1: {
    id: 'r1',
    originalPrompt: 'Write a viral Twitter thread about AI in healthcare',
    originalScore: 22,
    mode: 'Marketing',
    modeIcon: Megaphone,
    wordsBefore: 10,
    tokensBefore: 14,
    createdAt: '2 min ago',
    toolRecommendations: {
      matched_task: 'Marketing Copy',
      match_confidence: 0.85,
      tools: [
        { name: 'Claude', rank: 1 },
        { name: 'ChatGPT', rank: 2 },
        { name: 'Jasper', rank: 3 },
      ],
    },
    versions: [
      {
        versionNumber: 1,
        optimizedPrompt: 'Role: Social media copywriter.\n\nTask: Write a Twitter thread about AI in healthcare.\n\nFormat: Use numbered tweets. Keep each under 280 characters.',
        overallScore: 62,
        dimensions: [
          { id: 'clarity', label: 'Clarity', status: 'good', icon: CheckCircle2, desc: 'Task is defined but generic.', score: 70, beforeScore: 30 },
          { id: 'context', label: 'Context', status: 'warning', icon: AlertTriangle, desc: 'No specific healthcare area.', score: 55, beforeScore: 15 },
          { id: 'role', label: 'Role', status: 'good', icon: CheckCircle2, desc: 'Basic persona assigned.', score: 68, beforeScore: 10 },
          { id: 'format', label: 'Format', status: 'neutral', icon: Minus, desc: 'Minimal structure.', score: 58, beforeScore: 20 },
          { id: 'constraints', label: 'Constraints', status: 'warning', icon: AlertTriangle, desc: 'Only character limit given.', score: 52, beforeScore: 25 },
          { id: 'examples', label: 'Examples', status: 'neutral', icon: Minus, desc: 'No examples provided.', score: 40, beforeScore: 10 },
        ],
        wordsAfter: 28,
        tokensAfter: 42,
        timestamp: '5 min ago',
      },
      {
        versionNumber: 2,
        optimizedPrompt: 'Role: Viral social media strategist with expertise in healthcare technology.\n\nTask: Write a 10-tweet Twitter thread about how AI is transforming healthcare. Each tweet under 280 characters.\n\nFormat:\n• Start with a provocative hook\n• Use data points and real examples\n• Include relevant emojis\n• End with a call-to-action\n\nTone: Conversational yet authoritative.',
        overallScore: 81,
        dimensions: [
          { id: 'clarity', label: 'Clarity', status: 'good', icon: CheckCircle2, desc: 'Clear task with tweet count.', score: 85, beforeScore: 30 },
          { id: 'context', label: 'Context', status: 'good', icon: CheckCircle2, desc: 'Healthcare tech focus specified.', score: 78, beforeScore: 15 },
          { id: 'role', label: 'Role', status: 'good', icon: CheckCircle2, desc: 'Specific expert persona.', score: 88, beforeScore: 10 },
          { id: 'format', label: 'Format', status: 'good', icon: CheckCircle2, desc: 'Structure with bullets.', score: 82, beforeScore: 20 },
          { id: 'constraints', label: 'Constraints', status: 'warning', icon: AlertTriangle, desc: 'Tone defined but no content boundaries.', score: 72, beforeScore: 25 },
          { id: 'examples', label: 'Examples', status: 'neutral', icon: Minus, desc: 'No example tweets given.', score: 55, beforeScore: 10 },
        ],
        wordsAfter: 58,
        tokensAfter: 82,
        timestamp: '4 min ago',
        tweakNote: 'More specific and add formatting requirements',
      },
      {
        versionNumber: 3,
        optimizedPrompt: 'Role: You are a viral social media strategist with expertise in healthcare technology trends.\n\nTask: Write a 10-tweet Twitter thread about how AI is transforming healthcare. Each tweet must be under 280 characters.\n\nFormat:\n• Start with a provocative hook tweet that challenges conventional wisdom\n• Use data points and real examples (cite sources)\n• Include relevant emojis for visual engagement\n• End with a call-to-action for discussion\n\nTone: Conversational yet authoritative. Avoid jargon. Write for a general audience.\n\nConstraints: No medical advice. Focus on trends, not specific products.',
        overallScore: 94,
        dimensions: [
          { id: 'clarity', label: 'Clarity', status: 'good', icon: CheckCircle2, desc: 'Task is precisely defined with character limits.', score: 95, beforeScore: 30 },
          { id: 'context', label: 'Context', status: 'good', icon: CheckCircle2, desc: 'Healthcare AI context well established.', score: 92, beforeScore: 15 },
          { id: 'role', label: 'Role', status: 'good', icon: CheckCircle2, desc: 'Specific expert persona assigned.', score: 96, beforeScore: 10 },
          { id: 'format', label: 'Format', status: 'good', icon: CheckCircle2, desc: 'Thread structure with bullet requirements.', score: 94, beforeScore: 20 },
          { id: 'constraints', label: 'Constraints', status: 'good', icon: CheckCircle2, desc: 'Clear boundaries on content scope.', score: 91, beforeScore: 25 },
          { id: 'examples', label: 'Examples', status: 'neutral', icon: Minus, desc: 'No examples provided, but format is clear.', score: 88, beforeScore: 10 },
        ],
        wordsAfter: 89,
        tokensAfter: 124,
        timestamp: '2 min ago',
        tweakNote: 'Add constraints and audience targeting',
      },
      // Generate 50 mock versions to test virtualization
      ...Array.from({ length: 50 }).map((_, i) => ({
        versionNumber: 4 + i,
        optimizedPrompt: `This is a generated mock prompt for version ${4 + i}. It includes some test content to simulate length and variety.\n\nRole: Social Media Strategist\n\nTask: Test virtualization performance.\n\nNote: Auto-generated for UI testing.`,
        overallScore: 60 + ((i * 17 + 23) % 40),
        dimensions: [
          { id: 'clarity', label: 'Clarity', status: 'good' as const, icon: CheckCircle2, desc: 'Auto-generated', score: 85 },
          { id: 'context', label: 'Context', status: 'good' as const, icon: CheckCircle2, desc: 'Auto-generated', score: 80 },
          { id: 'role', label: 'Role', status: 'good' as const, icon: CheckCircle2, desc: 'Auto-generated', score: 85 },
          { id: 'format', label: 'Format', status: 'good' as const, icon: CheckCircle2, desc: 'Auto-generated', score: 80 },
          { id: 'constraints', label: 'Constraints', status: 'warning' as const, icon: AlertTriangle, desc: 'Auto-generated', score: 70 },
          { id: 'examples', label: 'Examples', status: 'neutral' as const, icon: Minus, desc: 'Auto-generated', score: 50 },
        ],
        wordsAfter: 45,
        tokensAfter: 60,
        timestamp: `${i + 1}m ago`,
        tweakNote: i % 3 === 0 ? 'Tweak auto generated' : undefined,
        isStarred: i % 10 === 0,
      })),
    ],
  },
  r2: {
    id: 'r2',
    originalPrompt: 'Debug my React useEffect infinite loop issue',
    originalScore: 18,
    mode: 'Coding',
    modeIcon: Code,
    wordsBefore: 8,
    tokensBefore: 11,
    createdAt: '1 hour ago',
    toolRecommendations: {
      matched_task: 'Coding',
      match_confidence: 0.90,
      tools: [
        { name: 'Claude', rank: 1 },
        { name: 'ChatGPT', rank: 2 },
        { name: 'Gemini', rank: 3 },
      ],
    },
    versions: [
      {
        versionNumber: 1,
        optimizedPrompt: 'Help me fix an infinite loop in my React useEffect hook. The component re-renders endlessly when I update state inside the effect.\n\nProvide common causes and solutions with code examples.',
        overallScore: 58,
        dimensions: [
          { id: 'clarity', label: 'Clarity', status: 'good', icon: CheckCircle2, desc: 'Problem stated clearly.', score: 65, beforeScore: 20 },
          { id: 'context', label: 'Context', status: 'warning', icon: AlertTriangle, desc: 'No code context provided.', score: 48, beforeScore: 10 },
          { id: 'role', label: 'Role', status: 'neutral', icon: Minus, desc: 'No expert persona.', score: 30, beforeScore: 5 },
          { id: 'format', label: 'Format', status: 'neutral', icon: Minus, desc: 'Basic output request.', score: 52, beforeScore: 15 },
          { id: 'constraints', label: 'Constraints', status: 'warning', icon: AlertTriangle, desc: 'No tech stack version info.', score: 60, beforeScore: 20 },
          { id: 'examples', label: 'Examples', status: 'neutral', icon: Minus, desc: 'No code samples.', score: 45, beforeScore: 10 },
        ],
        wordsAfter: 30,
        tokensAfter: 44,
        timestamp: '1h 5m ago',
      },
      {
        versionNumber: 2,
        optimizedPrompt: 'Role: Senior React developer and debugging expert.\n\nContext: I have a React functional component using useEffect that creates an infinite re-render loop. The component fetches data and updates state.\n\nTask: Diagnose and fix the infinite loop. Provide:\n1. Common root causes (dependency array issues, object references, state updates)\n2. Step-by-step debugging approach\n3. Corrected code pattern with explanation\n4. Best practices to prevent this\n\nFormat: Use TypeScript code blocks. Include before/after comparisons.\n\nConstraints: React 18+, functional components only.',
        overallScore: 88,
        dimensions: [
          { id: 'clarity', label: 'Clarity', status: 'good', icon: CheckCircle2, desc: 'Debugging steps clearly requested.', score: 90, beforeScore: 20 },
          { id: 'context', label: 'Context', status: 'good', icon: CheckCircle2, desc: 'React version specified.', score: 88, beforeScore: 10 },
          { id: 'role', label: 'Role', status: 'good', icon: CheckCircle2, desc: 'Senior developer persona.', score: 92, beforeScore: 5 },
          { id: 'format', label: 'Format', status: 'good', icon: CheckCircle2, desc: 'Numbered output with code blocks.', score: 86, beforeScore: 15 },
          { id: 'constraints', label: 'Constraints', status: 'good', icon: CheckCircle2, desc: 'Tech constraints well defined.', score: 85, beforeScore: 20 },
          { id: 'examples', label: 'Examples', status: 'warning', icon: AlertTriangle, desc: 'Before/after requested but no input.', score: 78, beforeScore: 10 },
        ],
        wordsAfter: 78,
        tokensAfter: 108,
        timestamp: '1h ago',
        tweakNote: 'Add role, structure, and constraints',
      },
    ],
  },
  r3: {
    id: 'r3',
    originalPrompt: 'Cinematic shot of neon rain on cyberpunk streets',
    originalScore: 15,
    mode: 'Cinematic Video',
    modeIcon: Film,
    wordsBefore: 9,
    tokensBefore: 12,
    createdAt: '3 hours ago',
    toolRecommendations: {
      matched_task: 'Cinematic Video',
      match_confidence: 0.80,
      tools: [
        { name: 'Veo', rank: 1 },
        { name: 'Kling', rank: 2 },
        { name: 'Runway', rank: 3 },
      ],
    },
    versions: [
      {
        versionNumber: 1,
        optimizedPrompt: 'A cinematic shot of a cyberpunk city street at night with neon rain. Include neon lights, wet streets, and a dark atmosphere. High resolution, photorealistic.',
        overallScore: 52,
        dimensions: [
          { id: 'clarity', label: 'Clarity', status: 'neutral', icon: Minus, desc: 'Basic scene description.', score: 55, beforeScore: 12 },
          { id: 'context', label: 'Context', status: 'warning', icon: AlertTriangle, desc: 'No aesthetic references.', score: 42, beforeScore: 8 },
          { id: 'role', label: 'Role', status: 'neutral', icon: Minus, desc: 'No director or style persona.', score: 20, beforeScore: 5 },
          { id: 'format', label: 'Format', status: 'warning', icon: AlertTriangle, desc: 'Flat text, no structure.', score: 38, beforeScore: 10 },
          { id: 'constraints', label: 'Constraints', status: 'warning', icon: AlertTriangle, desc: 'Resolution mentioned, no aspect ratio.', score: 50, beforeScore: 15 },
          { id: 'examples', label: 'Examples', status: 'neutral', icon: Minus, desc: 'No reference images or films.', score: 48, beforeScore: 10 },
        ],
        wordsAfter: 28,
        tokensAfter: 38,
        timestamp: '3h 10m ago',
      },
      {
        versionNumber: 2,
        optimizedPrompt: 'Subject: A bustling cyberpunk city street at night, torrential neon-lit rain.\n\nLighting: Magenta and cyan neon reflections on wet asphalt. Holographic ads glow.\n\nCamera: Wide establishing shot, anamorphic lens.\n\nTechnical: 8K, photorealistic, volumetric lighting, Unreal Engine 5, Blade Runner aesthetic.',
        overallScore: 76,
        dimensions: [
          { id: 'clarity', label: 'Clarity', status: 'good', icon: CheckCircle2, desc: 'Scene elements described.', score: 80 },
          { id: 'context', label: 'Context', status: 'good', icon: CheckCircle2, desc: 'Blade Runner reference added.', score: 75 },
          { id: 'role', label: 'Role', status: 'neutral', icon: Minus, desc: 'No director persona.', score: 40 },
          { id: 'format', label: 'Format', status: 'good', icon: CheckCircle2, desc: 'Sectioned by element.', score: 82 },
          { id: 'constraints', label: 'Constraints', status: 'good', icon: CheckCircle2, desc: 'Tech specs and engine specified.', score: 80 },
          { id: 'examples', label: 'Examples', status: 'good', icon: CheckCircle2, desc: 'Film reference anchors style.', score: 78 },
        ],
        wordsAfter: 52,
        tokensAfter: 72,
        timestamp: '3h 5m ago',
        tweakNote: 'Add structure and technical specs',
      },
      {
        versionNumber: 3,
        optimizedPrompt: 'Subject & Setting: A cinematic, ultra-wide establishing shot of a bustling cyberpunk city street at night. Torrential neon-lit rain cascades down, each droplet catching magenta and cyan reflections off the slick, hyper-detailed asphalt.\n\nLighting & Atmosphere: Towering holographic advertisements pulse with light, casting vibrant chromatic glows over silhouetted pedestrians carrying translucent glowing umbrellas. Dense atmospheric fog interweaves with the rain, creating volumetric god-rays from streetlights.\n\nCamera & Composition: A lone figure in a dark trench coat stands at a crosswalk, their face illuminated by the warm glow of a ramen stall. Anamorphic lens, shallow depth of field.\n\nTechnical: 8K resolution, photorealistic, volumetric lighting, Unreal Engine 5 render, Blade Runner 2049 aesthetic, Roger Deakins cinematography, --ar 21:9 --v 6.',
        overallScore: 91,
        dimensions: [
          { id: 'clarity', label: 'Clarity', status: 'good', icon: CheckCircle2, desc: 'Scene elements described precisely.', score: 93 },
          { id: 'context', label: 'Context', status: 'good', icon: CheckCircle2, desc: 'Genre and aesthetic references provided.', score: 90 },
          { id: 'role', label: 'Role', status: 'neutral', icon: Minus, desc: 'No director persona, but style refs suffice.', score: 72 },
          { id: 'format', label: 'Format', status: 'good', icon: CheckCircle2, desc: 'Structured by scene elements.', score: 95 },
          { id: 'constraints', label: 'Constraints', status: 'good', icon: CheckCircle2, desc: 'Technical specs and aspect ratio defined.', score: 92 },
          { id: 'examples', label: 'Examples', status: 'good', icon: CheckCircle2, desc: 'Blade Runner + Deakins reference.', score: 94 },
        ],
        wordsAfter: 112,
        tokensAfter: 156,
        timestamp: '3h ago',
        tweakNote: 'More detail, atmosphere, and cinematographer reference',
      },
    ],
  },
  r4: {
    id: 'r4',
    originalPrompt: 'Explain quantum entanglement to a 10-year-old',
    originalScore: 12,
    mode: 'Research',
    modeIcon: Search,
    wordsBefore: 8,
    tokensBefore: 11,
    createdAt: '5 hours ago',
    toolRecommendations: {
      matched_task: 'Academic Research',
      match_confidence: 0.82,
      tools: [
        { name: 'Consensus', rank: 1 },
        { name: 'Elicit', rank: 2 },
        { name: 'ChatGPT', rank: 3 },
      ],
    },
    versions: [
      {
        versionNumber: 1,
        optimizedPrompt: 'Explain quantum entanglement in simple terms that a child could understand. Use an analogy. Keep it short.',
        overallScore: 48,
        dimensions: [
          { id: 'clarity', label: 'Clarity', status: 'neutral', icon: Minus, desc: 'Topic clear but vague request.', score: 55 },
          { id: 'context', label: 'Context', status: 'warning', icon: AlertTriangle, desc: 'No age level specified.', score: 40 },
          { id: 'role', label: 'Role', status: 'neutral', icon: Minus, desc: 'No persona.', score: 15 },
          { id: 'format', label: 'Format', status: 'warning', icon: AlertTriangle, desc: 'No length or structure.', score: 38 },
          { id: 'constraints', label: 'Constraints', status: 'neutral', icon: Minus, desc: '"Keep it short" is vague.', score: 55 },
          { id: 'examples', label: 'Examples', status: 'neutral', icon: Minus, desc: 'No analogy examples.', score: 35 },
        ],
        wordsAfter: 18,
        tokensAfter: 24,
        timestamp: '5h 10m ago',
      },
      {
        versionNumber: 2,
        optimizedPrompt: 'Role: You are a science communicator who specializes in explaining complex physics concepts to children using everyday analogies.\n\nTask: Explain quantum entanglement to a 10-year-old student.\n\nRequirements:\n• Use a relatable analogy (e.g., magic coins, twin siblings)\n• Keep vocabulary at a 5th-grade reading level\n• Maximum 200 words\n• Include one "wow factor" statement about real-world implications\n• End with a simple question to check understanding\n\nTone: Enthusiastic, wonder-filled, encouraging.\n\nAvoid: Mathematical formulas, technical jargon, wave function terminology.',
        overallScore: 76,
        dimensions: [
          { id: 'clarity', label: 'Clarity', status: 'good', icon: CheckCircle2, desc: 'Target audience and topic clearly defined.', score: 85 },
          { id: 'context', label: 'Context', status: 'good', icon: CheckCircle2, desc: 'Reading level and age group specified.', score: 80 },
          { id: 'role', label: 'Role', status: 'good', icon: CheckCircle2, desc: 'Science communicator persona assigned.', score: 82 },
          { id: 'format', label: 'Format', status: 'good', icon: CheckCircle2, desc: 'Word limit and structure requirements given.', score: 78 },
          { id: 'constraints', label: 'Constraints', status: 'warning', icon: AlertTriangle, desc: 'Avoidance list could be more specific.', score: 65 },
          { id: 'examples', label: 'Examples', status: 'neutral', icon: Minus, desc: 'Analogy suggestions given but no full example.', score: 62 },
        ],
        wordsAfter: 72,
        tokensAfter: 98,
        timestamp: '5h ago',
        tweakNote: 'Add role, structure, and age-appropriate constraints',
      },
    ],
  },
  r5: {
    id: 'r5',
    originalPrompt: 'Generate a product launch email sequence',
    originalScore: 14,
    mode: 'Marketing',
    modeIcon: Megaphone,
    wordsBefore: 6,
    tokensBefore: 9,
    createdAt: 'Yesterday',
    toolRecommendations: {
      matched_task: 'Marketing Copy',
      match_confidence: 0.85,
      tools: [
        { name: 'Claude', rank: 1 },
        { name: 'ChatGPT', rank: 2 },
        { name: 'Jasper', rank: 3 },
      ],
    },
    versions: [
      {
        versionNumber: 1,
        optimizedPrompt: 'Write a series of emails for launching a new product. Include teaser, launch, and follow-up emails.',
        overallScore: 42,
        dimensions: [
          { id: 'clarity', label: 'Clarity', status: 'neutral', icon: Minus, desc: 'Basic structure hinted.', score: 50 },
          { id: 'context', label: 'Context', status: 'warning', icon: AlertTriangle, desc: 'No product type specified.', score: 30 },
          { id: 'role', label: 'Role', status: 'neutral', icon: Minus, desc: 'No marketer persona.', score: 15 },
          { id: 'format', label: 'Format', status: 'warning', icon: AlertTriangle, desc: 'No per-email structure.', score: 38 },
          { id: 'constraints', label: 'Constraints', status: 'neutral', icon: Minus, desc: 'No length or tone constraints.', score: 50 },
          { id: 'examples', label: 'Examples', status: 'neutral', icon: Minus, desc: 'No sample emails.', score: 45 },
        ],
        wordsAfter: 20,
        tokensAfter: 28,
        timestamp: 'Yesterday',
      },
      {
        versionNumber: 2,
        optimizedPrompt: 'Role: Email marketing strategist with 10+ years of SaaS launch experience.\n\nTask: Create a 5-email product launch drip sequence for a B2B SaaS productivity tool.\n\nSequence Structure:\n• Email 1 (Day -7): Teaser — build anticipation\n• Email 2 (Day -3): Story — the problem you solve\n• Email 3 (Day 0): Launch — full reveal with CTA\n• Email 4 (Day +2): Social proof — early user reactions\n• Email 5 (Day +5): Urgency — limited-time launch pricing\n\nFor Each Email Provide:\n- Subject line (A/B variants)\n- Preview text\n- Body copy (150–200 words)\n- Primary CTA button text\n\nTone: Professional but human. No corporate jargon.\n\nConstraints: Mobile-optimized formatting. Each email must stand alone.',
        overallScore: 83,
        dimensions: [
          { id: 'clarity', label: 'Clarity', status: 'good', icon: CheckCircle2, desc: 'Email sequence structure clearly defined.', score: 88 },
          { id: 'context', label: 'Context', status: 'good', icon: CheckCircle2, desc: 'B2B SaaS context established.', score: 82 },
          { id: 'role', label: 'Role', status: 'good', icon: CheckCircle2, desc: 'Email strategist persona assigned.', score: 86 },
          { id: 'format', label: 'Format', status: 'good', icon: CheckCircle2, desc: 'Per-email deliverables specified.', score: 85 },
          { id: 'constraints', label: 'Constraints', status: 'warning', icon: AlertTriangle, desc: 'Mobile formatting noted but no specific rules.', score: 75 },
          { id: 'examples', label: 'Examples', status: 'neutral', icon: Minus, desc: 'No example emails provided.', score: 68 },
        ],
        wordsAfter: 108,
        tokensAfter: 148,
        timestamp: 'Yesterday',
        tweakNote: 'Full structure with role, deliverables, and constraints',
      },
    ],
  },
  r6: {
    id: 'r6',
    originalPrompt: 'YouTube thumbnail prompt for tech review video',
    originalScore: 16,
    mode: 'YouTube Shorts',
    modeIcon: PlaySquare,
    wordsBefore: 7,
    tokensBefore: 10,
    createdAt: 'Yesterday',
    toolRecommendations: {
      matched_task: 'YouTube Thumbnail',
      match_confidence: 0.88,
      tools: [
        { name: 'Midjourney', rank: 1 },
        { name: 'GPT Image', rank: 2 },
        { name: 'Flux', rank: 3 },
      ],
    },
    versions: [
      {
        versionNumber: 1,
        optimizedPrompt: 'Create a YouTube thumbnail for a tech review video with bold text and an excited person holding the product.',
        overallScore: 45,
        dimensions: [
          { id: 'clarity', label: 'Clarity', status: 'neutral', icon: Minus, desc: 'Basic concept clear.', score: 52 },
          { id: 'context', label: 'Context', status: 'warning', icon: AlertTriangle, desc: 'No specific product or style.', score: 38 },
          { id: 'role', label: 'Role', status: 'neutral', icon: Minus, desc: 'No designer persona.', score: 15 },
          { id: 'format', label: 'Format', status: 'warning', icon: AlertTriangle, desc: 'No dimensions or composition details.', score: 40 },
          { id: 'constraints', label: 'Constraints', status: 'neutral', icon: Minus, desc: 'No readability constraints.', score: 48 },
          { id: 'examples', label: 'Examples', status: 'neutral', icon: Minus, desc: 'No reference thumbnails.', score: 42 },
        ],
        wordsAfter: 20,
        tokensAfter: 28,
        timestamp: 'Yesterday',
      },
      {
        versionNumber: 2,
        optimizedPrompt: 'Create a YouTube thumbnail image for a tech gadget review video.\n\nComposition:\n• Person with exaggerated shocked/excited facial expression, positioned left-of-center\n• Product (latest smartphone/laptop) held at a dynamic angle, slightly toward camera\n• Background: diagonal split — electric blue (#0066FF) on left, vibrant orange (#FF6600) on right\n\nText Overlay:\n• Large bold white text "GAME CHANGER!" with black drop shadow, positioned top-right\n• Small "vs" badge in red circle, bottom corner\n\nStyle: Hyper-saturated colors, studio lighting on face, shallow DOF on background, 1280×720.\n\nConstraints: Must be readable at small sizes (mobile). Maximum 3 words in text overlay. No fine print.',
        overallScore: 79,
        dimensions: [
          { id: 'clarity', label: 'Clarity', status: 'good', icon: CheckCircle2, desc: 'Visual composition precisely described.', score: 85 },
          { id: 'context', label: 'Context', status: 'good', icon: CheckCircle2, desc: 'Platform and format context given.', score: 82 },
          { id: 'role', label: 'Role', status: 'neutral', icon: Minus, desc: 'No designer persona.', score: 60 },
          { id: 'format', label: 'Format', status: 'good', icon: CheckCircle2, desc: 'Sectioned by composition elements.', score: 84 },
          { id: 'constraints', label: 'Constraints', status: 'good', icon: CheckCircle2, desc: 'Mobile readability and word limit specified.', score: 80 },
          { id: 'examples', label: 'Examples', status: 'warning', icon: AlertTriangle, desc: 'Color hex codes given but no reference image.', score: 72 },
        ],
        wordsAfter: 85,
        tokensAfter: 118,
        timestamp: 'Yesterday',
        tweakNote: 'Full visual composition breakdown with constraints',
      },
    ],
  },
};

const DEFAULT_SESSION: OptimizationSession = {
  id: 'default',
  originalPrompt: 'No session found.',
  mode: 'General',
  modeIcon: Sparkles,
  wordsBefore: 0,
  tokensBefore: 0,
  createdAt: '',
  versions: [
    {
      versionNumber: 1,
      optimizedPrompt: 'Please select a recent optimization from the sidebar.',
      overallScore: 0,
      dimensions: [],
      wordsAfter: 0,
      tokensAfter: 0,
      timestamp: '',
    },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function scoreColor(s: number) {
  if (s >= 80) return '#10B981';
  if (s >= 55) return '#7C3AED';
  return '#F59E0B';
}

function scoreLabel(s: number) {
  if (s >= 90) return 'Excellent';
  if (s >= 75) return 'Good';
  if (s >= 55) return 'Fair';
  return 'Needs Work';
}

function useCountUp(target: number, active: boolean, duration = 1200): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) { setValue(0); return; }
    let current = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target, active, duration]);
  return value;
}

// ── Client-side tool recommendation fallback ──────────────────────────────────
const TOOL_MAPS: Record<string, { matched_task: string; match_confidence: number; tools: { name: string; rank: number }[] }> = {
  cinematic: { matched_task: 'Cinematic Video', match_confidence: 0.80, tools: [{ name: 'Veo', rank: 1 }, { name: 'Kling', rank: 2 }, { name: 'Runway', rank: 3 }] },
  video: { matched_task: 'Video Generation', match_confidence: 0.82, tools: [{ name: 'Veo', rank: 1 }, { name: 'Runway', rank: 2 }, { name: 'Kling', rank: 3 }] },
  film: { matched_task: 'Cinematic Video', match_confidence: 0.78, tools: [{ name: 'Veo', rank: 1 }, { name: 'Kling', rank: 2 }, { name: 'Runway', rank: 3 }] },
  shorts: { matched_task: 'Short-Form Video', match_confidence: 0.85, tools: [{ name: 'Kling', rank: 1 }, { name: 'Runway', rank: 2 }, { name: 'Pika', rank: 3 }] },
  youtube: { matched_task: 'YouTube Content', match_confidence: 0.88, tools: [{ name: 'Midjourney', rank: 1 }, { name: 'GPT Image', rank: 2 }, { name: 'Flux', rank: 3 }] },
  thumbnail: { matched_task: 'Thumbnail Design', match_confidence: 0.88, tools: [{ name: 'Midjourney', rank: 1 }, { name: 'GPT Image', rank: 2 }, { name: 'Flux', rank: 3 }] },
  image: { matched_task: 'Image Generation', match_confidence: 0.87, tools: [{ name: 'Midjourney', rank: 1 }, { name: 'Flux', rank: 2 }, { name: 'DALL·E 3', rank: 3 }] },
  photo: { matched_task: 'Photo Generation', match_confidence: 0.84, tools: [{ name: 'Midjourney', rank: 1 }, { name: 'Flux', rank: 2 }, { name: 'Firefly', rank: 3 }] },
  code: { matched_task: 'Coding', match_confidence: 0.92, tools: [{ name: 'Claude', rank: 1 }, { name: 'ChatGPT', rank: 2 }, { name: 'Gemini', rank: 3 }] },
  debug: { matched_task: 'Debugging', match_confidence: 0.90, tools: [{ name: 'Claude', rank: 1 }, { name: 'ChatGPT', rank: 2 }, { name: 'Gemini', rank: 3 }] },
  react: { matched_task: 'Frontend Dev', match_confidence: 0.91, tools: [{ name: 'Claude', rank: 1 }, { name: 'ChatGPT', rank: 2 }, { name: 'Gemini', rank: 3 }] },
  marketing: { matched_task: 'Marketing Copy', match_confidence: 0.85, tools: [{ name: 'Claude', rank: 1 }, { name: 'ChatGPT', rank: 2 }, { name: 'Jasper', rank: 3 }] },
  email: { matched_task: 'Email Marketing', match_confidence: 0.86, tools: [{ name: 'Claude', rank: 1 }, { name: 'ChatGPT', rank: 2 }, { name: 'Jasper', rank: 3 }] },
  twitter: { matched_task: 'Social Copy', match_confidence: 0.84, tools: [{ name: 'Claude', rank: 1 }, { name: 'ChatGPT', rank: 2 }, { name: 'Jasper', rank: 3 }] },
  research: { matched_task: 'Research', match_confidence: 0.82, tools: [{ name: 'Consensus', rank: 1 }, { name: 'Elicit', rank: 2 }, { name: 'ChatGPT', rank: 3 }] },
  explain: { matched_task: 'Education', match_confidence: 0.80, tools: [{ name: 'ChatGPT', rank: 1 }, { name: 'Claude', rank: 2 }, { name: 'Gemini', rank: 3 }] },
  write: { matched_task: 'Writing', match_confidence: 0.83, tools: [{ name: 'Claude', rank: 1 }, { name: 'ChatGPT', rank: 2 }, { name: 'Gemini', rank: 3 }] },
  story: { matched_task: 'Creative Writing', match_confidence: 0.85, tools: [{ name: 'Claude', rank: 1 }, { name: 'ChatGPT', rank: 2 }, { name: 'Gemini', rank: 3 }] },
  music: { matched_task: 'Music Generation', match_confidence: 0.88, tools: [{ name: 'Suno', rank: 1 }, { name: 'Udio', rank: 2 }, { name: 'Mubert', rank: 3 }] },
  audio: { matched_task: 'Audio Generation', match_confidence: 0.82, tools: [{ name: 'ElevenLabs', rank: 1 }, { name: 'Suno', rank: 2 }, { name: 'Mubert', rank: 3 }] },
};

function getLocalToolRecommendations(prompt: string, mode?: string): { matched_task: string; match_confidence: number; tools: { name: string; rank: number }[] } {
  const haystack = ((mode || '') + ' ' + (prompt || '')).toLowerCase();
  for (const [keyword, rec] of Object.entries(TOOL_MAPS)) {
    if (haystack.includes(keyword)) return rec;
  }
  // Default fallback
  return { matched_task: 'General AI Task', match_confidence: 0.75, tools: [{ name: 'ChatGPT', rank: 1 }, { name: 'Claude', rank: 2 }, { name: 'Gemini', rank: 3 }] };
}

function ChatDetailSkeleton() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', flex: 1, overflowY: 'auto',
      background: 'transparent',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', width: '100%', padding: '20px 48px',
        display: 'flex', flexDirection: 'column', gap: 28, flex: 1,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', background: 'rgba(255,255,255,0.85)', borderRadius: 16,
          border: '1px solid rgba(124,58,237,0.10)', boxShadow: '0 2px 12px rgba(109,40,217,0.04)',
          width: '100%', boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="skeleton" style={{ width: 118, height: 28, borderRadius: 9999 }} />
            <div className="skeleton" style={{ width: 92, height: 18, borderRadius: 9999 }} />
          </div>
          <div className="skeleton" style={{ width: 96, height: 32, borderRadius: 10 }} />
        </div>

        <div className="skeleton" style={{ height: 96, borderRadius: 18 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {Array.from({ length: 2 }).map((_, panelIndex) => (
            <div key={panelIndex} style={{
              background: '#FFFFFF', borderRadius: 20, padding: 24,
              boxShadow: '0 4px 20px rgba(109,40,217,0.04)', border: '1px solid rgba(124,58,237,0.10)',
              display: 'flex', flexDirection: 'column', gap: 18, minHeight: 300,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ width: 128, height: 28, borderRadius: 9999 }} />
                {panelIndex === 1 && <div className="skeleton" style={{ width: 42, height: 24, borderRadius: 8 }} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="skeleton" style={{ height: 16, width: '92%', borderRadius: 8 }} />
                <div className="skeleton" style={{ height: 16, width: '84%', borderRadius: 8 }} />
                <div className="skeleton" style={{ height: 16, width: '96%', borderRadius: 8 }} />
                <div className="skeleton" style={{ height: 16, width: '70%', borderRadius: 8 }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: '#FFFFFF', borderRadius: 20, border: '1px solid rgba(124,58,237,0.10)',
          boxShadow: '0 4px 20px rgba(109,40,217,0.05)', overflow: 'hidden', display: 'flex',
        }}>
          <div style={{
            width: 190, flexShrink: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '28px 20px', gap: 12,
            borderRight: '1px solid rgba(124,58,237,0.08)', background: '#FDFCFF',
          }}>
            <div className="skeleton" style={{ width: 110, height: 110, borderRadius: '50%' }} />
            <div className="skeleton" style={{ width: 96, height: 20, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: 76, height: 24, borderRadius: 9999 }} />
          </div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 20, background: '#F8FAFC' }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton" style={{ height: 112, borderRadius: 12 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function ChatView({ chatId }: { chatId: string | null }) {
  const [currentSession, setCurrentSession] = useState<OptimizationSession>(() => {
    return chatId && MOCK_SESSIONS[chatId] ? MOCK_SESSIONS[chatId] : DEFAULT_SESSION;
  });
  const [isLoadingSession, setIsLoadingSession] = useState(() => Boolean(chatId && !MOCK_SESSIONS[chatId]));

  useEffect(() => {
    if (!chatId) return;

    if (MOCK_SESSIONS[chatId]) {
      setCurrentSession(MOCK_SESSIONS[chatId]);
      return;
    }

    setIsLoadingSession(true);
    apiClient.get(`/api/v1/prompts/${chatId}`)
      .then(async (res) => {
        const p = res.data || res;
        if (!p || !p.original_prompt) return;

        let versionsList: any[] = [];
        try {
          const vRes = await apiClient.get(`/api/v1/prompts/${chatId}/versions`);
          if (vRes && vRes.data) versionsList = vRes.data;
        } catch (e) {
          // ignore if error
        }

        // Extract real analysis objects if present in prompt payload
        const origAnal = p.old_analysis || p.original_analysis || (p.analysis?.original_analysis) || null;
        const enhAnal = p.new_analysis || p.enhanced_analysis || (p.analysis?.enhanced_analysis) || null;

        const getDimScore = (anal: any, key: string, altKey?: string): number | undefined => {
          if (!anal?.dimensions) return undefined;
          const item = anal.dimensions[key] ?? (altKey ? anal.dimensions[altKey] : undefined);
          if (item && typeof item.score === 'number' && !isNaN(item.score)) return item.score;
          if (typeof item === 'number' && !isNaN(item)) return item;
          return undefined;
        };

        const getDimDesc = (anal: any, key: string, altKey?: string, defaultDesc: string = ''): string => {
          if (!anal?.dimensions) return defaultDesc;
          const item = anal.dimensions[key] ?? (altKey ? anal.dimensions[altKey] : undefined);
          if (item && typeof item.explanation === 'string' && item.explanation) return item.explanation;
          return defaultDesc;
        };

        const originalScore = origAnal?.overall_score ?? (p.original_score !== undefined ? p.original_score : 35);
        const rawScore = enhAnal?.overall_score ?? p.total_score ?? 88;
        const overallScore = typeof rawScore === 'number' && rawScore <= 10 ? Math.round(rawScore * 10) : Math.round(rawScore);

        const makeDimensions = (origA: any, enhA: any, os: number, after: number): Dimension[] => {
          return [
            {
              id: 'clarity', label: 'Clarity', status: 'good' as const, icon: CheckCircle2,
              desc: getDimDesc(enhA, 'clarity', 'clarity', 'Task is clearly defined.'),
              score: getDimScore(enhA, 'clarity', 'clarity') ?? 93,
              beforeScore: getDimScore(origA, 'clarity', 'clarity') ?? 35
            },
            {
              id: 'context', label: 'Context', status: 'good' as const, icon: CheckCircle2,
              desc: getDimDesc(enhA, 'context', 'context', 'Context and domain specified.'),
              score: getDimScore(enhA, 'context', 'context') ?? 88,
              beforeScore: getDimScore(origA, 'context', 'context') ?? 25
            },
            {
              id: 'role', label: 'Role', status: 'good' as const, icon: CheckCircle2,
              desc: getDimDesc(enhA, 'role_definition', 'role', 'Persona role provided.'),
              score: getDimScore(enhA, 'role_definition', 'role') ?? 78,
              beforeScore: getDimScore(origA, 'role_definition', 'role') ?? 14
            },
            {
              id: 'format', label: 'Format', status: 'good' as const, icon: CheckCircle2,
              desc: getDimDesc(enhA, 'output_format', 'format', 'Output structure provided.'),
              score: getDimScore(enhA, 'output_format', 'format') ?? 88,
              beforeScore: getDimScore(origA, 'output_format', 'format') ?? 28
            },
            {
              id: 'constraints', label: 'Constraints', status: 'warning' as const, icon: AlertTriangle,
              desc: getDimDesc(enhA, 'constraints', 'constraints', 'Scope constraints defined.'),
              score: getDimScore(enhA, 'constraints', 'constraints') ?? 73,
              beforeScore: getDimScore(origA, 'constraints', 'constraints') ?? 21
            },
            {
              id: 'examples', label: 'Examples', status: 'neutral' as const, icon: Minus,
              desc: getDimDesc(enhA, 'examples', 'examples', 'Reference structure.'),
              score: getDimScore(enhA, 'examples', 'examples') ?? 68,
              beforeScore: getDimScore(origA, 'examples', 'examples') ?? 18
            },
          ];
        };

        const mappedVersions: PromptVersion[] = versionsList.length > 0
          ? versionsList.map((v: any) => {
            const optText = v.content || v.optimizedPrompt || p.current_version?.content || p.original_prompt || '';
            // Use per-version scores if they exist (reenhanced versions); fall back to parent prompt scores
            const vOldAnal = v.old_analysis || null;
            const vNewAnal = v.new_analysis || enhAnal;
            const vScore = vNewAnal?.overall_score ?? overallScore;
            const vScoreScaled = typeof vScore === 'number' && vScore <= 10 ? Math.round(vScore * 10) : Math.round(vScore ?? overallScore);
            const vToolRecs = v.tool_recommendations || null;
            return {
              versionNumber: v.version_number,
              versionType: v.version_type,
              optimizedPrompt: optText,
              overallScore: vScoreScaled,
              dimensions: makeDimensions(vOldAnal || origAnal, vNewAnal || enhAnal, originalScore, vScoreScaled),
              wordsAfter: optText.split(/\s+/).filter(Boolean).length,
              tokensAfter: Math.round(optText.length / 4),
              timestamp: v.created_at ? new Date(v.created_at).toLocaleDateString() : 'Just now',
              tweakNote: v.change_summary || undefined,
              // Store version-level tool recs so the UI can show them per-version
              ...(vToolRecs && { toolRecommendations: vToolRecs }),
            };
          })
          : [
            {
              versionNumber: 1,
              versionType: 'original',
              optimizedPrompt: p.current_version?.content || p.original_prompt || '',
              overallScore: overallScore,
              dimensions: makeDimensions(origAnal, enhAnal, originalScore, overallScore),
              wordsAfter: ((p.current_version?.content || p.original_prompt) || '').split(/\s+/).filter(Boolean).length,
              tokensAfter: Math.round(((p.current_version?.content || p.original_prompt) || '').length / 4),
              timestamp: 'Just now',
            }
          ];

        let toolRecs = p.tool_recommendations || null;
        if (!toolRecs && p.original_prompt) {
          try {
            const recRes = await apiClient.post<any>('/api/v1/tools/recommend', {
              prompt: p.original_prompt,
              mode: p.template?.mode || p.title,
            });
            if (recRes) toolRecs = recRes;
          } catch (e) {
            // API not available yet – use client-side fallback
          }
        }
        // Always ensure we have tool recommendations (client-side fallback)
        if (!toolRecs) {
          toolRecs = getLocalToolRecommendations(
            p.original_prompt || '',
            p.template?.mode || p.title || ''
          );
        }

        const sessionObj: OptimizationSession = {
          id: p.id,
          originalPrompt: p.original_prompt,
          originalScore: originalScore,
          mode: p.template?.mode || p.title?.split(' - ')[1] || 'General',
          modeIcon: Sparkles,
          wordsBefore: (p.original_prompt || '').split(/\s+/).length,
          tokensBefore: Math.round((p.original_prompt || '').length / 4),
          createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Just now',
          versions: mappedVersions,
          toolRecommendations: toolRecs,
        };

        setCurrentSession(sessionObj);
      })
      .catch((err) => {
        console.error('Failed to load chat details:', err);
      })
      .finally(() => {
        setIsLoadingSession(false);
      });
  }, [chatId]);

  const session = currentSession;
  const [activeVersionIndex, setActiveVersionIndex] = useState(session.versions.length - 1);

  useEffect(() => {
    setActiveVersionIndex(session.versions.length - 1);
  }, [session]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIndex, setCompareIndex] = useState(0);

  // Selector state
  const [selectedStyle, setSelectedStyle] = useState('None');
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState('Claude');
  const [selectedEngine, setSelectedEngine] = useState('Claude Sonnet 4.5');
  const [isTargetOpen, setIsTargetOpen] = useState(false);

  const styleDropdownRef = useRef<HTMLDivElement>(null);
  const targetDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(event.target as Node)) {
        setIsStyleOpen(false);
      }
      if (targetDropdownRef.current && !targetDropdownRef.current.contains(event.target as Node)) {
        setIsTargetOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const styleOptions = useEnabledStyleOptions();

  useEffect(() => {
    if (!styleOptions.some(o => o.label === selectedStyle)) {
      setSelectedStyle('None');
    }
  }, [styleOptions, selectedStyle]);

  const targetModels = [
    'ChatGPT', 'Claude', 'Gemini', 'Grok', 'Midjourney', 'VEO', 'Perplexity'
  ];
  const modelIcons: Record<string, string> = {
    'ChatGPT': '/chatgpt-icon.svg',
    'Claude': '/claude-ai-icon.svg',
    'Gemini': '/google-gemini-icon.svg',
    'Grok': '/grok-icon.svg',
    'Midjourney': '/midjourney-color-icon.svg',
    'VEO': '/veo-icon.svg',
    'Perplexity': '/perplexity-ai-icon.svg',
  };
  const optimizerEngines = ['Claude Sonnet 4.5', 'GPT-5.2'];
  const [ready, setReady] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [hoveredVersionIndex, setHoveredVersionIndex] = useState<number | null>(null);

  const [sessionVersions, setSessionVersions] = useState(currentSession.versions);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isReenhancing, setIsReenhancing] = useState(false);

  // ── Re-enhance handler ───────────────────────────────────────────────────────
  const handleReenhance = async () => {
    if (!chatId || MOCK_SESSIONS[chatId]) return; // skip for mock sessions
    setIsReenhancing(true);
    try {
      const res = await apiClient.post<any>(`/api/v1/prompts/${chatId}/reenhance`);
      if (!res?.data) return;
      const d = res.data;
      const vNewAnal = d.new_analysis || null;
      const vOldAnal = d.old_analysis || null;
      const vScore = vNewAnal?.overall_score ?? 0;
      const vScoreScaled = typeof vScore === 'number' && vScore <= 10 ? Math.round(vScore * 10) : Math.round(vScore);

      // Build dimension array from new_analysis
      const getDimScore = (anal: any, key: string, altKey?: string): number | undefined => {
        if (!anal?.dimensions) return undefined;
        const item = anal.dimensions[key] ?? (altKey ? anal.dimensions[altKey] : undefined);
        if (item && typeof item.score === 'number') return item.score;
        if (typeof item === 'number') return item;
        return undefined;
      };
      const getDimDesc = (anal: any, key: string, altKey?: string, def = ''): string => {
        if (!anal?.dimensions) return def;
        const item = anal.dimensions[key] ?? (altKey ? anal.dimensions[altKey] : undefined);
        if (item && typeof item.explanation === 'string') return item.explanation;
        return def;
      };
      const makeDimsLocal = (oldA: any, newA: any): any[] => [
        { id: 'clarity', label: 'Clarity', status: 'good' as const, icon: CheckCircle2, desc: getDimDesc(newA, 'clarity'), score: getDimScore(newA, 'clarity') ?? 80, beforeScore: getDimScore(oldA, 'clarity') },
        { id: 'context', label: 'Context', status: 'good' as const, icon: CheckCircle2, desc: getDimDesc(newA, 'context'), score: getDimScore(newA, 'context') ?? 75, beforeScore: getDimScore(oldA, 'context') },
        { id: 'role', label: 'Role', status: 'good' as const, icon: CheckCircle2, desc: getDimDesc(newA, 'role_definition', 'role'), score: getDimScore(newA, 'role_definition', 'role') ?? 70, beforeScore: getDimScore(oldA, 'role_definition', 'role') },
        { id: 'format', label: 'Format', status: 'good' as const, icon: CheckCircle2, desc: getDimDesc(newA, 'output_format', 'format'), score: getDimScore(newA, 'output_format', 'format') ?? 75, beforeScore: getDimScore(oldA, 'output_format', 'format') },
        { id: 'constraints', label: 'Constraints', status: 'warning' as const, icon: AlertTriangle, desc: getDimDesc(newA, 'constraints'), score: getDimScore(newA, 'constraints') ?? 65, beforeScore: getDimScore(oldA, 'constraints') },
        { id: 'examples', label: 'Examples', status: 'neutral' as const, icon: Minus, desc: getDimDesc(newA, 'examples'), score: getDimScore(newA, 'examples') ?? 60, beforeScore: getDimScore(oldA, 'examples') },
      ];

      const newVer: PromptVersion = {
        versionNumber: d.version_number,
        optimizedPrompt: d.enhanced_prompt,
        overallScore: vScoreScaled,
        dimensions: makeDimsLocal(vOldAnal, vNewAnal),
        wordsAfter: d.enhanced_prompt.split(/\s+/).filter(Boolean).length,
        tokensAfter: Math.round(d.enhanced_prompt.length / 4),
        timestamp: 'Just now',
        tweakNote: `Re-enhanced v${sessionVersions.length}`,
        versionType: 'reenhancement',
      };

      setSessionVersions(prev => [...prev, newVer]);
      setActiveVersionIndex(sessionVersions.length); // switch to new version
    } catch (err) {
      console.error('Re-enhance failed:', err);
    } finally {
      setIsReenhancing(false);
    }
  };

  useEffect(() => {
    setSessionVersions(currentSession.versions);
    setActiveVersionIndex(currentSession.versions.length - 1);
    setCompareMode(false);
    setCompareIndex(0);
    setReady(false);
    setIsHistoryOpen(false);
    const t = setTimeout(() => setReady(true), 120);
    return () => clearTimeout(t);
  }, [currentSession]);

  const version = sessionVersions[activeVersionIndex] || sessionVersions[0] || currentSession.versions[0];
  const activeVersion = version;
  const bestIndex = sessionVersions.reduce((best, v, i) => v.overallScore > sessionVersions[best].overallScore ? i : best, 0);

  const animatedScore = useCountUp(version.overallScore, ready);
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (animatedScore / 100) * circ;

  const ModeIcon = session.modeIcon;

  const handleVersionSelect = (index: number) => {
    setActiveVersionIndex(index);
  };

  const handleToggleStar = (index: number) => {
    setSessionVersions(prev => prev.map((v, i) => i === index ? { ...v, isStarred: !v.isStarred } : v));
  };

  if (isLoadingSession) {
    return <ChatDetailSkeleton />;
  }

  // Render a prompt panel
  const renderOptimizedPanel = (v: PromptVersion, label: string) => (
    <div style={{
      flex: 1, background: '#FFFFFF', borderRadius: 20, padding: 24,
      boxShadow: '0 4px 20px rgba(109,40,217,0.06), 0 1px 3px rgba(0,0,0,0.03)',
      border: '1px solid rgba(124,58,237,0.12)', display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden', minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 9999,
          fontSize: 12, fontWeight: 700, letterSpacing: '0.3px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(168,85,247,0.15))',
          color: '#6D28D9', border: '1px solid rgba(124,58,237,0.18)',
        }}>
          <Wand2 size={13} />
          <span>{label}</span>
        </div>
        <span style={{ fontSize: 20, fontWeight: 800, color: scoreColor(v.overallScore) }}>
          {v.overallScore}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 380, paddingRight: 6 }}>
        <FormattedPromptViewer content={v.optimizedPrompt} />
      </div>

      {v.tweakNote && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 14,
          borderTop: '1px dashed rgba(124,58,237,0.16)', fontSize: 12, color: '#6D28D9', fontWeight: 600,
        }}>
          <Wand2 size={13} style={{ flexShrink: 0 }} />
          <span>{v.tweakNote}</span>
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%', flex: 1, overflowY: 'auto',
      background: 'transparent',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', width: '100%', padding: '20px 48px',
        display: 'flex', flexDirection: 'column', gap: 28, flex: 1,
      }}>
        {/* Header Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', background: 'rgba(255,255,255,0.85)', borderRadius: 16,
          border: '1px solid rgba(124,58,237,0.10)', boxShadow: '0 2px 12px rgba(109,40,217,0.04)',
          backdropFilter: 'blur(12px)',
          width: '100%', boxSizing: 'border-box',
          position: 'relative', zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 9999,
              fontSize: 12.5, fontWeight: 700, background: 'rgba(124,58,237,0.11)', color: '#6D28D9',
            }}>
              <ModeIcon size={14} />
              <span>{session.mode}</span>
            </div>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748B', fontWeight: 500 }}>
              <Clock size={13} />
              {session.createdAt}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {sessionVersions.length > 1 && (
              <button
                onClick={() => { setCompareMode(!compareMode); if (!compareMode) setCompareIndex(0); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10,
                  fontSize: 12.5, fontWeight: 600, cursor: 'pointer', transition: 'all 160ms ease',
                  background: compareMode ? 'linear-gradient(135deg, #6D28D9, #7C3AED)' : 'rgba(124,58,237,0.07)',
                  color: compareMode ? 'white' : '#6D28D9', border: '1px solid rgba(124,58,237,0.15)',
                }}
              >
                <GitCompareArrows size={14} />
                <span>{compareMode ? 'Exit Compare' : 'Compare'}</span>
              </button>
            )}

            {/* Re-enhance button — only shows for real (non-mock) sessions */}
            {chatId && !MOCK_SESSIONS[chatId] && (
              <button
                id="chat-reenhance-btn"
                disabled={isReenhancing}
                onClick={handleReenhance}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 10,
                  fontSize: 12.5, fontWeight: 700, cursor: isReenhancing ? 'not-allowed' : 'pointer',
                  transition: 'all 160ms ease', opacity: isReenhancing ? 0.7 : 1,
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.14), rgba(168,85,247,0.10))',
                  color: '#6D28D9', border: '1px solid rgba(124,58,237,0.22)',
                  boxShadow: isReenhancing ? 'none' : '0 2px 8px rgba(124,58,237,0.12)',
                }}
              >
                <GitBranch size={14} style={{ animation: isReenhancing ? 'spin 1s linear infinite' : 'none' }} />
                <span>{isReenhancing ? 'Re-enhancing…' : 'Re-enhance'}</span>
              </button>
            )}

            {/* Style dropdown and Target dropdown removed from top */}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, width: '100%' }}>
          {/* Version Header Timeline */}
          {!compareMode && (
            <VersionHeader
              versions={sessionVersions.map((v, idx) => ({
                versionNumber: v.versionNumber,
                overallScore: v.overallScore,
                timestamp: v.timestamp,
                originalIndex: idx
              }))}
              activeIndex={activeVersionIndex}
              bestIndex={bestIndex}
              hoveredIndex={hoveredVersionIndex}
              onOpenHistory={() => setIsHistoryOpen(true)}
              onSelectVersion={handleVersionSelect}
              onHoverVersion={setHoveredVersionIndex}
            />
          )}

          {/* Compare vs Normal */}
          {compareMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                <select
                  value={compareIndex} onChange={e => setCompareIndex(Number(e.target.value))}
                  style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(124,58,237,0.25)', background: '#FFFFFF', fontWeight: 600 }}
                >
                  {sessionVersions.map((v, i) => (
                    <option key={i} value={i}>v{v.versionNumber} — Score {v.overallScore}</option>
                  ))}
                </select>
                <span style={{ fontWeight: 700, color: '#94A3B8', fontSize: 13 }}>vs</span>
                <select
                  value={activeVersionIndex} onChange={e => handleVersionSelect(Number(e.target.value))}
                  style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid rgba(124,58,237,0.25)', background: '#FFFFFF', fontWeight: 600 }}
                >
                  {sessionVersions.map((v, i) => (
                    <option key={i} value={i}>v{v.versionNumber} — Score {v.overallScore}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {renderOptimizedPanel(sessionVersions[compareIndex], `v${sessionVersions[compareIndex].versionNumber}`)}
                {renderOptimizedPanel(sessionVersions[activeVersionIndex], `v${sessionVersions[activeVersionIndex].versionNumber}`)}
              </div>
            </div>
          ) : (
            <>
              {/* ── Side-by-side prompt comparison ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Input / Original panel */}
                <div style={{
                  background: '#FFFFFF', borderRadius: 20, padding: 24,
                  boxShadow: '0 4px 20px rgba(109,40,217,0.04)', border: '1px solid rgba(124,58,237,0.10)',
                  display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: 9999,
                      fontSize: 12, fontWeight: 700, background: '#F1F5F9', color: '#64748B',
                    }}>
                      <span>
                        {activeVersionIndex > 0 && version.versionType?.toLowerCase() === 'reenhancement'
                          ? `Input (v${sessionVersions[activeVersionIndex - 1]?.versionNumber || 1})`
                          : 'Original'}
                      </span>
                    </div>
                  </div>
                  <div style={{ flex: 1, fontSize: 13.5, lineHeight: 1.7, color: '#475569', whiteSpace: 'pre-wrap' }}>
                    {activeVersionIndex > 0 && version.versionType?.toLowerCase() === 'reenhancement'
                      ? (sessionVersions[activeVersionIndex - 1]?.optimizedPrompt || session.originalPrompt)
                      : session.originalPrompt}
                  </div>
                </div>

                {renderOptimizedPanel(version, `Optimized · v${version.versionNumber}`)}
              </div>

              {/* ── MERGED: Score Overview + Score Breakdown (Image 2 layout) ── */}
              <div style={{
                background: '#FFFFFF', borderRadius: 20,
                border: '1px solid rgba(124,58,237,0.10)',
                boxShadow: '0 4px 20px rgba(109,40,217,0.05)',
                overflow: 'hidden',
                display: 'flex',
              }}>
                {/* LEFT COLUMN — ring + label + pts + before/after */}
                <div style={{
                  width: 190, flexShrink: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '28px 20px', gap: 12,
                  borderRight: '1px solid rgba(124,58,237,0.08)',
                  background: '#FDFCFF',
                }}>
                  {/* Ring */}
                  <div style={{ position: 'relative', width: 110, height: 110 }}>
                    <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
                      <defs>
                        <linearGradient id="scoreRingGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#7C3AED" />
                          <stop offset="100%" stopColor="#A855F7" />
                        </linearGradient>
                      </defs>
                      <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(124,58,237,0.10)" strokeWidth="7" />
                      <circle
                        cx="55" cy="55" r="46" fill="none" stroke="url(#scoreRingGrad)" strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={String(2 * Math.PI * 46)}
                        strokeDashoffset={String(2 * Math.PI * 46 - (animatedScore / 100) * 2 * Math.PI * 46)}
                        style={{ transition: 'stroke-dashoffset 1.4s ease-out' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 30, fontWeight: 900, color: '#1E293B' }}>{animatedScore}</span>
                    </div>
                  </div>

                  {/* Label */}
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#7C3AED', letterSpacing: '-0.01em' }}>
                    {scoreLabel(version.overallScore)}
                  </span>

                  {/* Pts badge */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', background: 'rgba(16,185,129,0.10)', color: '#059669', borderRadius: 9999, fontSize: 12, fontWeight: 700 }}>
                    <TrendingUp size={12} />
                    <span>+{version.overallScore - (session.originalScore ?? sessionVersions[0].overallScore)} pts</span>
                  </div>

                  {/* Before / After — use per-version old_analysis when available */}
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748B', fontWeight: 600 }}>
                      <span>Before</span>
                      <span style={{ fontWeight: 700, color: '#94A3B8' }}>
                        {version.dimensions[0]?.beforeScore !== undefined
                          ? Math.round(version.dimensions.reduce((sum, d) => sum + (d.beforeScore ?? 0), 0) / version.dimensions.length)
                          : (session.originalScore ?? sessionVersions[0].overallScore)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748B', fontWeight: 600 }}>
                      <span>After</span>
                      <span style={{ fontWeight: 900, color: scoreColor(version.overallScore), fontSize: 14 }}>{version.overallScore}</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN — 3×2 dimension cards with spacing and left border indicators */}
                <div style={{
                  flex: 1,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 16,
                  padding: 20,
                  background: '#F8FAFC',
                }}>
                  {version.dimensions.map((dim) => {
                    const Icon = dim.icon;
                    const score = dim.score;
                    const barColor = score >= 80 ? '#10B981' : score >= 55 ? '#7C3AED' : '#F59E0B';
                    return (
                      <div
                        key={dim.id}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 12,
                          padding: 16,
                          background: '#FFFFFF',
                          borderRadius: 12,
                          border: '1px solid #E2E8F0',
                          borderLeft: `4px solid ${barColor}`,
                          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
                          transition: 'transform 180ms ease, box-shadow 180ms ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 18px rgba(15, 23, 42, 0.05)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.03)';
                        }}
                      >
                        {/* Top row: icon + name + score */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: dim.status === 'good' ? 'rgba(16,185,129,0.10)' : dim.status === 'warning' ? 'rgba(245,158,11,0.10)' : 'rgba(148,163,184,0.10)',
                              color: dim.status === 'good' ? '#10B981' : dim.status === 'warning' ? '#F59E0B' : '#94A3B8',
                            }}>
                              <Icon size={13} strokeWidth={2.3} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{dim.label}</span>
                          </div>
                          {/* Score: show beforeScore → score if beforeScore exists */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700 }}>
                            {dim.beforeScore !== undefined && (
                              <>
                                <span style={{ color: '#94A3B8' }}>{dim.beforeScore}</span>
                                <span style={{ color: '#CBD5E1', fontSize: 10 }}>→</span>
                              </>
                            )}
                            <span style={{ fontSize: 15, fontWeight: 900, color: barColor }}>{score}</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div style={{ height: 4, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${score}%`, background: barColor,
                            borderRadius: 99, transition: 'width 0.9s ease-out',
                          }} />
                        </div>

                        {/* Description */}
                        <p style={{ fontSize: 11.5, color: '#64748B', margin: 0, lineHeight: 1.45, fontWeight: 500 }}>{dim.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommended AI Tools */}
              {session.toolRecommendations && session.toolRecommendations.tools && session.toolRecommendations.tools.length > 0 && (
                <div style={{
                  background: '#FFFFFF', borderRadius: 20, padding: '24px 28px',
                  border: '1px solid rgba(124,58,237,0.12)', boxShadow: '0 4px 20px rgba(109,40,217,0.06)',
                  display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={18} style={{ color: '#7C3AED' }} />
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1E293B', margin: 0 }}>
                        Recommended AI Tools for Best Execution
                      </h3>
                      {session.toolRecommendations.matched_task && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#6D28D9', background: 'rgba(124,58,237,0.08)', padding: '3px 10px', borderRadius: 9999 }}>
                          Task: {session.toolRecommendations.matched_task}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    {session.toolRecommendations.tools.map((t) => (
                      <div
                        key={t.name}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
                          background: t.rank === 1 ? 'linear-gradient(135deg, rgba(124,58,237,0.09) 0%, rgba(167,139,250,0.04) 100%)' : 'rgba(124,58,237,0.03)',
                          border: t.rank === 1 ? '1px solid rgba(124,58,237,0.22)' : '1px solid rgba(124,58,237,0.08)',
                          borderRadius: 14, flex: '1 1 200px', minWidth: 180,
                          boxShadow: t.rank === 1 ? '0 4px 14px rgba(124,58,237,0.08)' : 'none',
                        }}
                      >
                        <span
                          style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: t.rank === 1 ? '#7C3AED' : t.rank === 2 ? '#9333EA' : '#C084FC',
                            color: '#FFFFFF', fontSize: 11, fontWeight: 800,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}
                        >
                          #{t.rank}
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{t.name}</span>
                          <span style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>
                            {t.rank === 1 ? 'Primary Recommendation' : `Alternative #${t.rank}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <VersionHistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          versions={sessionVersions.map((v) => ({
            versionNumber: v.versionNumber,
            overallScore: v.overallScore,
            timestamp: v.timestamp,
            isStarred: v.isStarred,
            tweakNote: v.tweakNote,
          }))}
          activeIndex={activeVersionIndex}
          onSelect={handleVersionSelect}
          onToggleStar={handleToggleStar}
          onHoverVersion={setHoveredVersionIndex}
        />
      </div>
    </div>
  );
}
