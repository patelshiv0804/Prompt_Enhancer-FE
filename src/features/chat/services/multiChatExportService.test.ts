import { describe, expect, it } from 'vitest';
import {
  buildMultiChatHandoff,
  buildMultiChatTranscript,
  MultiChatExportItem,
} from './multiChatExportService';

describe('multiChatExportService', () => {
  const sampleItems: MultiChatExportItem[] = [
    {
      id: 'chat-1',
      title: 'React Debugging',
      originalPrompt: 'Help fix React useEffect loop',
      mode: 'Coding',
      targetModel: 'Claude 3.7',
      score: 92,
      createdAt: '2026-09-10',
      versions: [
        {
          versionNumber: 1,
          optimizedPrompt: 'Help fix useEffect loop with examples.',
          overallScore: 60,
          tweakNote: 'Initial draft',
        },
        {
          versionNumber: 2,
          optimizedPrompt: 'Role: Senior React Developer. Diagnose useEffect re-render.',
          overallScore: 92,
          tweakNote: 'Added senior developer persona and constraints',
          dimensions: [
            { label: 'Clarity', desc: 'Clear step-by-step instructions' },
            { label: 'Constraints', desc: 'React 18+ functional components' },
          ],
        },
      ],
    },
    {
      id: 'chat-2',
      title: 'Cyberpunk Scene',
      originalPrompt: 'Rainy neon cyberpunk street',
      mode: 'Cinematic',
      targetModel: 'Veo 2',
      score: 88,
      createdAt: '2026-09-11',
      versions: [
        {
          versionNumber: 1,
          optimizedPrompt: 'A rainy cyberpunk street at night, neon reflections.',
          overallScore: 88,
        },
      ],
    },
  ];

  it('builds a structured plain text multi-chat handoff', () => {
    const text = buildMultiChatHandoff(sampleItems, 'txt');

    expect(text).toContain('MULTI-PROJECT AI CONTEXT BUNDLE');
    expect(text).toContain('Total Included Projects: 2');
    expect(text).toContain('PROJECT 1: "React Debugging"');
    expect(text).toContain('PROJECT 2: "Cyberpunk Scene"');
    expect(text).toContain('Role: Senior React Developer. Diagnose useEffect re-render.');
    expect(text).toContain('A rainy cyberpunk street at night, neon reflections.');
    expect(text).toContain('CONTINUATION INSTRUCTION FOR THE RECEIVING AI');
    expect(text).toContain('[ENHANCED PROMPT OUTPUTS (ALL 2 VERSIONS)]:');
    expect(text).toContain('--- Version 1 [Note: Initial draft] ---');
    expect(text).toContain('Help fix useEffect loop with examples.');
    expect(text).toContain('--- Version 2 (LATEST) [Note: Added senior developer persona and constraints] ---');
    expect(text).not.toContain('Mode/Domain:');
    expect(text).not.toContain('Target Model:');
  });

  it('builds a structured markdown multi-chat handoff', () => {
    const md = buildMultiChatHandoff(sampleItems, 'md');

    expect(md).toContain('# 🧠 MULTI-PROJECT AI CONTEXT BUNDLE & CONTINUATION BRIEF');
    expect(md).toContain('### 📁 PROJECT 1: "React Debugging"');
    expect(md).toContain('### 📁 PROJECT 2: "Cyberpunk Scene"');
    expect(md).toContain('#### 🚀 Enhanced Prompt Outputs (All 2 Versions)');
    expect(md).toContain('##### 🔹 Version 1 (Initial draft)');
    expect(md).toContain('Help fix useEffect loop with examples.');
    expect(md).toContain('##### 🔹 Version 2 ⭐ (Latest) (Added senior developer persona and constraints)');
    expect(md).toContain('```text\nRole: Senior React Developer.');
    expect(md).toContain('## 🤝 CONTINUATION INSTRUCTION FOR THE RECEIVING AI');
    expect(md).not.toContain('Mode/Domain:');
    expect(md).not.toContain('Target Model:');
  });

  it('builds multi-chat transcript correctly', () => {
    const transcript = buildMultiChatTranscript(sampleItems, 'txt');

    expect(transcript).toContain('COMPLETE MULTI-SESSION AUDIT TRANSCRIPT');
    expect(transcript).toContain('Total Sessions: 2');
    expect(transcript).toContain('SESSION 1: React Debugging');
    expect(transcript).toContain('SESSION 2: Cyberpunk Scene');
    expect(transcript).toContain('Version 1');
    expect(transcript).toContain('Version 2');
  });
});
