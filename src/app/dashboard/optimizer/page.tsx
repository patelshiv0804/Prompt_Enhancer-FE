'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ComparisonBlock } from '@/features/optimizer';
import ScoreSection from '@/features/optimizer/components/ScoreSection';
import { apiClient } from '@/utils/apiClient';
import { useAuth } from '@/context/AuthContext';

const MODE_MAPPING: Record<string, { role: string; mode: string }> = {
  'General': { role: 'student', mode: 'study' },
  'Coding': { role: 'developer', mode: 'Full Stack' },
  'Research': { role: 'researcher', mode: 'Academic Research' },
  'Marketing': { role: 'Marketer', mode: 'Marketing Strategy' },
  'Storytelling': { role: 'writer', mode: 'Creative Writing' },
  'Image Gen': { role: 'writer', mode: 'Creative Writing' },
  'Cinematic Video': { role: 'writer', mode: 'Creative Writing' },
  'YouTube Shorts': { role: 'writer', mode: 'Creative Writing' },
  'SEO': { role: 'Marketer', mode: 'SEO' },
};

function OptimizerPageContent() {
  const { activeStyle } = useAuth();
  const searchParams = useSearchParams();
  const promptId = searchParams.get('prompt_id');

  const [isAnalyzing,  setIsAnalyzing]  = useState(false);
  const [isAnalyzed,   setIsAnalyzed]   = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized,  setIsOptimized]  = useState(false);

  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Prompt history and versioning states
  const [loadedPromptId, setLoadedPromptId] = useState<string | null>(null);
  const [versionsList, setVersionsList] = useState<any[]>([]);
  const [activeVersionNumber, setActiveVersionNumber] = useState<number | null>(null);
  const [originalPromptText, setOriginalPromptText] = useState<string>('');

  const loadPromptDetails = async (id: string) => {
    try {
      setError(null);
      const detailRes = await apiClient.get<any>(`/api/v1/prompts/${id}`);
      if (detailRes && detailRes.data) {
        const detail = detailRes.data;
        setLoadedPromptId(id);
        setOriginalPromptText(detail.original_prompt || '');

        // Fetch version history list
        const versionsRes = await apiClient.get<any>(`/api/v1/prompt-versions/?prompt_id=${id}`);
        if (versionsRes && versionsRes.data) {
          setVersionsList(versionsRes.data);
        }

        // Set active enhanced prompt version outcomes
        if (detail.current_version) {
          setActiveVersionNumber(detail.current_version.version_number);

          let origAnalysis = detail.old_analysis || {
            overall_score: 35,
            grade: detail.grade || 'C',
            dimensions: {},
          };
          let enhAnalysis = detail.new_analysis || {
            overall_score: 88,
            grade: detail.grade || 'C',
            dimensions: {},
          };

          let toolRecs = detail.tool_recommendations || null;

          try {
            const promises: Promise<any>[] = [
              apiClient.post<any>('/api/v1/analyze', { prompt: detail.original_prompt }),
              apiClient.post<any>('/api/v1/analyze', { prompt: detail.current_version.content }),
            ];
            if (!toolRecs) {
              promises.push(
                apiClient.post<any>('/api/v1/tools/recommend', {
                  prompt: detail.original_prompt,
                  mode: detail.title,
                })
              );
            }
            const results = await Promise.all(promises);
            if (results[0]) origAnalysis = results[0];
            if (results[1]) enhAnalysis = results[1];
            if (!toolRecs && results[2]) toolRecs = results[2];
          } catch (analysisErr) {
            console.error('Failed to load dynamic analyses or tool recommendations:', analysisErr);
          }

          setOptimizationResult({
            enhanced_prompt: detail.current_version.content,
            original_prompt: detail.original_prompt,
            original_analysis: origAnalysis,
            enhanced_analysis: enhAnalysis,
            tool_recommendations: toolRecs,
          });
          setIsOptimized(true);
        }
      }
    } catch (err: any) {
      console.error('Failed to load prompt details:', err);
      setError('Could not load prompt history record.');
    }
  };

  useEffect(() => {
    if (promptId) {
      loadPromptDetails(promptId);
    }
  }, [promptId]);

  const handleRestoreVersion = async (versionNumber: number) => {
    if (!loadedPromptId) return;
    setError(null);
    setIsOptimizing(true);
    try {
      await apiClient.post(`/api/v1/prompts/${loadedPromptId}/restore/${versionNumber}`, {});
      await loadPromptDetails(loadedPromptId);
    } catch (err: any) {
      console.error('Failed to restore version:', err);
      setError('Failed to switch version.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAnalyze = async (promptText: string) => {
    if (!promptText.trim()) return;
    setIsAnalyzing(true);
    setIsAnalyzed(false);
    setIsOptimized(false);
    setError(null);

    try {
      const res = await apiClient.post('/api/v1/analyze', { prompt: promptText });
      setAnalysisResult(res);
      setIsAnalyzed(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze prompt. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimize = async (promptText: string, activeRole: string, activeMode?: string) => {
    if (!promptText.trim()) return;
    setIsOptimizing(true);
    setError(null);

    try {
      const selectedRole = activeRole.toLowerCase();
      const selectedMode = activeMode && activeMode.trim() ? activeMode : selectedRole;
      const applyStyle = activeStyle.id !== null;

      const payload = {
        prompt: promptText,
        role: selectedRole,
        mode: selectedMode,
        apply_style: applyStyle,
        style_profile_id: activeStyle.id || undefined,
      };

      const response = await apiClient.post('/api/v1/enhance', payload);
      if (response.success && response.data) {
        let optData = response.data;
        if (!optData.original_analysis || !optData.enhanced_analysis) {
          try {
            const [origRes, enhRes] = await Promise.all([
              apiClient.post<any>('/api/v1/analyze', { prompt: promptText }),
              apiClient.post<any>('/api/v1/analyze', { prompt: optData.enhanced_prompt })
            ]);
            optData = {
              ...optData,
              original_analysis: origRes,
              enhanced_analysis: enhRes,
            };
          } catch (analysisErr) {
            console.error('Failed to run fallback analysis:', analysisErr);
          }
        }
        setOptimizationResult(optData);
        setIsOptimized(true);
        window.dispatchEvent(new Event('promptiq:history-updated'));

        if (response.data.version && response.data.version.prompt_id) {
          setLoadedPromptId(response.data.version.prompt_id);
          // Load version list without overwriting current optimization result
          try {
            const versionsRes = await apiClient.get<any>(`/api/v1/prompt-versions/?prompt_id=${response.data.version.prompt_id}`);
            if (versionsRes && versionsRes.data) {
              setVersionsList(versionsRes.data);
            }
          } catch (vErr) {
            console.error('Failed to fetch versions list:', vErr);
          }
        }
      } else {
        throw new Error(response.message || 'Optimization failed.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to optimize prompt. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="workspace-container">
      {error && (
        <div style={{
          padding: '12px 20px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          borderRadius: '16px',
          color: '#dc2626',
          fontSize: '14px',
          fontWeight: 500,
          marginBottom: '20px',
          maxWidth: 1100,
          margin: '0 auto 20px',
          textAlign: 'left'
        }}>
          {error}
        </div>
      )}
      <ComparisonBlock
        isAnalyzing={isAnalyzing}
        isAnalyzed={isAnalyzed}
        isOptimizing={isOptimizing}
        isOptimized={isOptimized}
        onAnalyze={handleAnalyze}
        onOptimize={handleOptimize}
        analysisResult={analysisResult}
        optimizationResult={optimizationResult}
        versions={versionsList}
        activeVersionNumber={activeVersionNumber}
        onRestoreVersion={handleRestoreVersion}
        initialOriginalPromptText={originalPromptText}
      />
      {(isAnalyzed || isOptimized) && (
        <ScoreSection
          isAnalyzed={isAnalyzed}
          isOptimized={isOptimized}
          originalAnalysis={optimizationResult?.original_analysis || analysisResult}
          enhancedAnalysis={optimizationResult?.enhanced_analysis}
          toolRecommendations={optimizationResult?.tool_recommendations}
        />
      )}
    </div>
  );
}

export default function OptimizerPage() {
  return (
    <Suspense fallback={<div className="workspace-container" style={{ padding: 48, textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading Workspace...</div>}>
      <OptimizerPageContent />
    </Suspense>
  );
}
