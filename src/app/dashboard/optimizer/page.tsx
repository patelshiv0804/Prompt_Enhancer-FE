'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ComparisonBlock } from '@/features/optimizer';
import ScoreSection from '@/features/optimizer/components/ScoreSection';
import { apiClient, streamEnhance, type ReenhanceStreamDone } from '@/utils/apiClient';
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
  // Template picked from the library "Use" button. The title is shown to the
  // user; the id tells the backend to enhance with THIS template. The prompt
  // body (the proprietary "recipe") is never exposed to the client.
  const activeTemplateName = searchParams.get('template');
  const activeTemplateId = searchParams.get('template_id');
  const [templateDismissed, setTemplateDismissed] = useState(false);
  // Effective applied template — cleared once the user dismisses the chip so
  // enhancement reverts to the normal automatic-retrieval flow.
  const appliedTemplateId = !templateDismissed ? activeTemplateId : null;
  const appliedTemplateName = !templateDismissed ? activeTemplateName : null;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  // Live token buffer while an SSE enhancement is streaming. Cleared once the
  // authoritative result lands in optimizationResult (on the `done` frame).
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Prompt history and versioning states
  const [loadedPromptId, setLoadedPromptId] = useState<string | null>(null);
  const [versionsList, setVersionsList] = useState<any[]>([]);
  const [activeVersionNumber, setActiveVersionNumber] = useState<number | null>(null);
  const [originalPromptText, setOriginalPromptText] = useState<string>('');
  const reenhanceInFlight = useRef(false);

  // Use the same prompt-history endpoint consumed by the Vault flow. Keeping this
  // refresh separate lets re-enhancement update the version selector without
  // replacing the optimizer's currently displayed result.
  const loadVersionHistory = async (id: string) => {
    const versionsRes = await apiClient.get<any>(`/api/v1/prompts/${id}/versions`);
    if (versionsRes?.data) {
      setVersionsList(versionsRes.data);
    }
    return versionsRes?.data;
  };

  const loadPromptDetails = async (id: string) => {
    try {
      setError(null);
      const detailRes = await apiClient.get<any>(`/api/v1/prompts/${id}`);
      if (detailRes && detailRes.data) {
        const detail = detailRes.data;
        setLoadedPromptId(id);
        setOriginalPromptText(detail.original_prompt || '');

        // Fetch version history list
        await loadVersionHistory(id);

        // Set active enhanced prompt version outcomes
        if (detail.current_version) {
          setActiveVersionNumber(detail.current_version.version_number);

          // Version-level analysis is authoritative for re-enhanced versions.
          // Older versions fall back to the prompt-level fields and then to a
          // fresh analysis only when no persisted result exists.
          let origAnalysis = detail.current_version.old_analysis || detail.old_analysis || {
            overall_score: 35,
            grade: detail.grade || 'C',
            dimensions: {},
          };
          let enhAnalysis = detail.current_version.new_analysis || detail.new_analysis || {
            overall_score: 88,
            grade: detail.grade || 'C',
            dimensions: {},
          };

          let toolRecs = detail.current_version.tool_recommendations || detail.tool_recommendations || null;

          try {
            const promises: Promise<any>[] = [];
            const resultKeys: Array<'original' | 'enhanced' | 'tools'> = [];
            if (!detail.current_version.old_analysis && !detail.old_analysis) {
              resultKeys.push('original');
              promises.push(apiClient.post<any>('/api/v1/analyze', { prompt: detail.original_prompt }));
            }
            if (!detail.current_version.new_analysis && !detail.new_analysis) {
              resultKeys.push('enhanced');
              promises.push(apiClient.post<any>('/api/v1/analyze', { prompt: detail.current_version.content }));
            }
            if (!toolRecs) {
              resultKeys.push('tools');
              promises.push(
                apiClient.post<any>('/api/v1/tools/recommend', {
                  prompt: detail.original_prompt,
                  mode: detail.title,
                })
              );
            }
            const results = await Promise.all(promises);
            results.forEach((result, index) => {
              if (!result) return;
              if (resultKeys[index] === 'original') origAnalysis = result;
              if (resultKeys[index] === 'enhanced') enhAnalysis = result;
              if (resultKeys[index] === 'tools') toolRecs = result;
            });
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

  // Re-show the "template in use" banner whenever a different template is
  // opened from the library (a previous dismissal shouldn't hide the new one).
  useEffect(() => {
    setTemplateDismissed(false);
  }, [activeTemplateName]);

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
    if (promptText.length > 12000) {
      setError('Maximum character limit of 12,000 reached. Please shorten your prompt.');
      return;
    }
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

  // Poll the prompt record for the background quality analysis (scores + tool
  // recommendations) the backend computes asynchronously after enhancement.
  // Shared by the streaming and blocking optimize paths (2.5s, max 10 tries).
  const startBackgroundScorePolling = (pId: string) => {
    let attempts = 0;
    const pollTimer = setInterval(async () => {
      attempts++;
      try {
        const detailRes = await apiClient.get<any>(`/api/v1/prompts/${pId}`);
        if (detailRes?.data) {
          const detail = detailRes.data;
          const currentVer = detail.current_version;
          const oldAna = currentVer?.old_analysis || detail.old_analysis;
          const newAna = currentVer?.new_analysis || detail.new_analysis;
          const toolRecs = currentVer?.tool_recommendations || detail.tool_recommendations;

          if (oldAna && newAna) {
            clearInterval(pollTimer);
            setOptimizationResult((prev: any) => ({
              ...prev,
              original_analysis: oldAna,
              enhanced_analysis: newAna,
              tool_recommendations: toolRecs || prev?.tool_recommendations,
            }));
            // ⚡ Refresh Sidebar and Vault history list with updated scores!
            window.dispatchEvent(new Event('promptiq:history-updated'));
          }
        }
      } catch (pollErr) {
        console.error('Polling background analysis failed:', pollErr);
      }
      if (attempts >= 10) {
        clearInterval(pollTimer);
      }
    }, 2500);
  };

  // Blocking fallback: the original non-streaming enhance flow, used when the
  // SSE stream can't be established or fails mid-flight so the user still gets
  // a correct result.
  const runBlockingOptimize = async (payload: any, promptText: string) => {
    const response = await apiClient.post('/api/v1/enhance', payload);
    if (response.success && response.data) {
      const optData = response.data;
      setOptimizationResult({
        ...optData,
        detected_level: optData.detected_level,
        level_reason: optData.level_reason,
      });
      setIsOptimized(true);
      // ⚡ Unlock the UI immediately — show enhanced prompt right away
      setIsOptimizing(false);
      setStreamingText('');
      window.dispatchEvent(new Event('promptiq:history-updated'));

      if (response.data.version && response.data.version.prompt_id) {
        const pId = response.data.version.prompt_id;
        setLoadedPromptId(pId);
        // Fire-and-forget: load version history without blocking UI
        loadVersionHistory(pId).catch((vErr) => {
          console.error('Failed to fetch versions list:', vErr);
        });
        // If analysis is processing in background, poll for completion
        if (!optData.original_analysis || !optData.enhanced_analysis) {
          startBackgroundScorePolling(pId);
        }
      }
    } else {
      throw new Error(response.message || 'Optimization failed.');
    }
  };

  const handleOptimize = async (promptText: string, activeRole: string, activeMode?: string, enhancementLevel?: string) => {
    if (!promptText.trim()) return;
    if (promptText.length > 12000) {
      setError('Maximum character limit of 12,000 reached. Please shorten your prompt.');
      return;
    }
    setIsOptimizing(true);
    setIsOptimized(false);
    setStreamingText('');
    setError(null);

    const selectedRole = activeRole.toLowerCase();
    const selectedMode = activeMode && activeMode.trim() ? activeMode : selectedRole;
    const applyStyle = activeStyle.id !== null;
    // Send enhancement_level only when the user explicitly forced a level.
    // Omitting it (or sending undefined) tells the backend to auto-detect.
    const forcedLevel =
      enhancementLevel && enhancementLevel !== 'auto' ? enhancementLevel : undefined;

    const payload = {
      prompt: promptText,
      role: selectedRole,
      mode: selectedMode,
      apply_style: applyStyle,
      style_profile_id: activeStyle.id || undefined,
      ...(forcedLevel ? { enhancement_level: forcedLevel } : {}),
      // When a library template is applied (and not dismissed), tell the
      // backend to enhance using THAT template instead of auto-retrieval.
      // Absent → the backend runs its normal semantic-retrieval flow.
      ...(appliedTemplateId ? { template_id: appliedTemplateId } : {}),
    };

    // Carry meta (detected depth) from the `meta` frame to `done` as a
    // safety net, in case the done payload ever omits it.
    let metaLevel: string | undefined;
    let metaReason: string | undefined;

    // ⚡ Stream tokens via SSE for instant first-token feedback; fall back to
    // the blocking endpoint on any stream failure.
    await streamEnhance('/api/v1/enhance/stream', payload, {
      onMeta: (meta) => {
        metaLevel = meta.detected_level;
        metaReason = meta.level_reason;
      },
      onToken: (text) => {
        setStreamingText((prev) => prev + text);
      },
      onDone: (data) => {
        setOptimizationResult({
          enhanced_prompt: data.enhanced_prompt,
          original_prompt: data.original_prompt ?? promptText,
          original_analysis: null,
          enhanced_analysis: null,
          tool_recommendations: null,
          detected_level: data.detected_level ?? metaLevel,
          level_reason: data.level_reason ?? metaReason,
        });
        setIsOptimized(true);
        // ⚡ Final authoritative text now lives in optimizationResult —
        // drop the raw live buffer so the formatted viewer takes over.
        setStreamingText('');
        setIsOptimizing(false);
        window.dispatchEvent(new Event('promptiq:history-updated'));

        const pId = data.version?.prompt_id;
        if (pId) {
          setLoadedPromptId(pId);
          loadVersionHistory(pId).catch((vErr) => {
            console.error('Failed to fetch versions list:', vErr);
          });
          startBackgroundScorePolling(pId);
        }
      },
      onError: async (streamErr) => {
        console.error('Streaming enhance failed; falling back to /enhance:', streamErr);
        // Discard any partial stream and re-run through the reliable path.
        setStreamingText('');
        try {
          await runBlockingOptimize(payload, promptText);
        } catch (fbErr: any) {
          console.error(fbErr);
          setError(fbErr.message || 'Failed to optimize prompt. Please try again.');
          setIsOptimizing(false);
        }
      },
    });
  };

  // Blocking fallback for re-enhance: the original non-streaming flow, used
  // when the SSE stream can't be established or fails mid-flight so the user
  // still gets a correct result. Manages only the result state — the caller
  // owns the isOptimizing / in-flight flags.
  const runBlockingReenhance = async (pId: string) => {
    // POST /api/v1/prompts/{prompt_id}/reenhance
    const res = await apiClient.post<any>(`/api/v1/prompts/${pId}/reenhance`, {});
    if (res?.success && res.data) {
      const { enhanced_prompt, original_prompt, old_analysis, new_analysis, tool_recommendations, version_number } = res.data;
      // No extra /analyze calls needed — the backend already computed and
      // stored the per-version scores.
      setOptimizationResult((prev: any) => ({
        enhanced_prompt,
        original_prompt: original_prompt || prev?.original_prompt || originalPromptText,
        original_analysis: old_analysis || prev?.original_analysis,
        enhanced_analysis: new_analysis,
        tool_recommendations: tool_recommendations || prev?.tool_recommendations,
      }));
      if (version_number != null) setActiveVersionNumber(version_number);
      setIsOptimized(true);
      window.dispatchEvent(new Event('promptiq:history-updated'));
      try {
        await loadVersionHistory(pId);
      } catch (vErr) {
        console.error('Failed to refresh versions list after re-enhance:', vErr);
      }
    } else {
      throw new Error(res?.message || 'Failed to re-enhance prompt. Please try again.');
    }
  };

  const handleReenhance = async () => {
    if (!loadedPromptId || reenhanceInFlight.current) return;
    reenhanceInFlight.current = true;
    setIsOptimizing(true);
    setStreamingText('');
    setError(null);

    const pId = loadedPromptId;
    // Track whether a terminal frame (done/error) settled the stream, so the
    // in-flight lock is always released even if the stream ends unexpectedly.
    let settledLocally = false;

    // ⚡ Stream the re-enhanced prompt token-by-token via SSE for instant
    // first-token feedback; fall back to the blocking /reenhance on any failure.
    await streamEnhance<ReenhanceStreamDone>(`/api/v1/prompts/${pId}/reenhance/stream`, {}, {
      onToken: (text) => {
        setStreamingText((prev) => prev + text);
      },
      onDone: (data) => {
        settledLocally = true;
        // The backend persisted the new version AND computed per-version scores
        // synchronously — everything the UI needs is in this frame, so (unlike
        // the initial enhancement) no background score polling is required.
        setOptimizationResult((prev: any) => ({
          enhanced_prompt: data.enhanced_prompt,
          original_prompt: prev?.original_prompt || originalPromptText,
          original_analysis: data.old_analysis ?? prev?.original_analysis,
          enhanced_analysis: data.new_analysis,
          tool_recommendations: data.tool_recommendations ?? prev?.tool_recommendations,
        }));
        if (data.version_number != null) setActiveVersionNumber(data.version_number);
        setIsOptimized(true);
        // Final authoritative text now lives in optimizationResult — drop the
        // raw live buffer so the formatted viewer takes over.
        setStreamingText('');
        setIsOptimizing(false);
        reenhanceInFlight.current = false;
        window.dispatchEvent(new Event('promptiq:history-updated'));
        loadVersionHistory(pId).catch((vErr) => {
          console.error('Failed to refresh versions list after re-enhance:', vErr);
        });
      },
      onError: async (streamErr) => {
        settledLocally = true;
        console.error('Streaming re-enhance failed; falling back to blocking /reenhance:', streamErr);
        // Discard any partial stream and re-run through the reliable path.
        setStreamingText('');
        try {
          await runBlockingReenhance(pId);
        } catch (fbErr: any) {
          console.error('Failed to re-enhance prompt:', fbErr);
          setError(fbErr.message || 'Failed to re-enhance prompt. Please try again.');
        } finally {
          reenhanceInFlight.current = false;
          setIsOptimizing(false);
        }
      },
    });

    // Safety net: if the stream somehow ended without a done/error frame, still
    // release the in-flight lock so the button isn't stuck disabled.
    if (!settledLocally) {
      reenhanceInFlight.current = false;
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
        onReenhance={loadedPromptId ? handleReenhance : undefined}
        analysisResult={analysisResult}
        optimizationResult={optimizationResult}
        streamingText={streamingText}
        versions={versionsList}
        activeVersionNumber={activeVersionNumber}
        onRestoreVersion={handleRestoreVersion}
        initialOriginalPromptText={originalPromptText}
        templateName={appliedTemplateName}
        onClearTemplate={() => setTemplateDismissed(true)}
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
