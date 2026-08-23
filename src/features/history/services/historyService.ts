import { apiClient } from '@/utils/apiClient';
import type { HistoryItem, HistoryStats, HistoryFilters, PaginatedHistoryResponse } from '../types/history.types';

export async function fetchHistoryStats(): Promise<HistoryStats> {
  try {
    const promptsRes = await apiClient.get<any>('/api/v1/prompts/?page=1&page_size=100');
    
    let totalPrompts = promptsRes.data ? promptsRes.data.length : 0;
    
    const activeIds = new Set((promptsRes.data || []).map((p: any) => p.id || p.prompt_id));
    const localFavs = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('promptiq_favorites') || '[]') : [];
    
    // Clean up favorites (keep only active ones)
    const cleanedFavs = localFavs.filter((id: string) => activeIds.has(id));
    
    if (typeof window !== 'undefined' && localFavs.length !== cleanedFavs.length) {
      localStorage.setItem('promptiq_favorites', JSON.stringify(cleanedFavs));
    }

    let averageScore = 0;
    if (promptsRes.data && promptsRes.data.length > 0) {
      // Only average prompts that already have a persisted score. Prompts whose
      // background analysis is still running are excluded so the average is not
      // skewed by placeholders and doesn't jump once scoring completes.
      const scored = promptsRes.data
        .map((p: any) => {
          const newAna = p.new_analysis || p.current_version?.new_analysis;
          const oldAna = p.old_analysis || p.current_version?.old_analysis;
          return newAna?.overall_score
            ?? (oldAna?.overall_score ? Math.min(95, oldAna.overall_score + 35) : null);
        })
        .filter((s: number | null): s is number => s != null);
      if (scored.length > 0) {
        const totalScore = scored.reduce((sum: number, s: number) => sum + s, 0);
        averageScore = Math.round(totalScore / scored.length);
      }
    }

    // Prompts created in the last 7 days
    const thisWeekDelta = promptsRes.data ? promptsRes.data.filter((p: any) => {
      if (!p.created_at) return false;
      const created = new Date(p.created_at);
      const diff = Date.now() - created.getTime();
      return diff < 7 * 24 * 60 * 60 * 1000;
    }).length : 0;

    return {
      totalPrompts,
      averageScore,
      thisWeekDelta,
      favoritesCount: cleanedFavs.length,
    };
  } catch (err) {
    console.error('Failed to fetch history stats:', err);
    return {
      totalPrompts: 0,
      averageScore: 0,
      thisWeekDelta: 0,
      favoritesCount: 0,
    };
  }
}

export async function fetchHistory(page: number, pageSize: number, filters: HistoryFilters): Promise<PaginatedHistoryResponse> {
  try {
    const favorites = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('promptiq_favorites') || '[]') : [];

    // Map sorting parameters
    let sortBy = 'created_at';
    let sortOrder = 'desc';

    if (filters.sortBy === 'highest-score' || filters.sortBy === 'lowest-score') {
      sortBy = 'created_at';
      sortOrder = filters.sortBy === 'highest-score' ? 'desc' : 'asc';
    } else if (filters.sortBy === 'oldest') {
      sortBy = 'created_at';
      sortOrder = 'asc';
    }

    let items: any[] = [];
    let total = 0;

    const isCategoryFilterActive = Boolean(filters.category && filters.category !== 'all');
    const isSearchActive = Boolean(filters.search && filters.search.trim().length > 0);

    // Use semantic search if a search query is active
    if (isSearchActive) {
      const searchRes = await apiClient.post<any>('/api/v1/prompts/search', {
        prompt: filters.search,
        limit: 100
      });
      if (searchRes && searchRes.results) {
        items = searchRes.results;
      }
    } else if (isCategoryFilterActive) {
      // Fetch larger set of items so client category filter has complete data
      const res = await apiClient.get<any>(
        `/api/v1/prompts/?page=1&page_size=100&sort_by=${sortBy}&sort_order=${sortOrder}`
      );
      if (res && res.data) {
        items = res.data;
      }
    } else {
      const res = await apiClient.get<any>(
        `/api/v1/prompts/?page=${page}&page_size=${pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}`
      );
      if (res && res.data) {
        items = res.data;
        total = res.total ?? items.length;
      }
    }

    const favSet = new Set(favorites.map((f: any) => String(f)));

    // Map backend items to HistoryItem structures
    let mappedItems: HistoryItem[] = items.map((p: any) => {
      const itemId = String(p.id || p.prompt_id);
      const isFav = favSet.has(itemId);
      const newAna = p.new_analysis || p.current_version?.new_analysis;
      const oldAna = p.old_analysis || p.current_version?.old_analysis;
      // No persisted analysis yet => the background scoring task is still
      // running. Return null (not a placeholder number) so the UI can render a
      // loader on the score until the real value lands in the DB.
      const finalScore = newAna?.overall_score
        ?? (oldAna?.overall_score ? Math.min(95, oldAna.overall_score + 35) : null);

      return {
        id: itemId,
        prompt: p.original_prompt || p.title || 'Untitled Prompt',
        optimizedPrompt: p.original_prompt || '',
        category: (p.template?.role || p.template?.mode || p.title?.split(' - ')[1] || 'general').toLowerCase(),
        score: finalScore,
        isFavorite: isFav,
        targetModel: p.ai_model?.model_name || 'ChatGPT',
        mode: p.template?.mode || p.title?.split(' - ')[1] || 'General',
        createdAt: p.created_at || new Date().toISOString(),
        wordCount: { original: (p.original_prompt || '').split(/\s+/).length, optimized: 20 },
        tokenCount: 50,
      };
    });

    // Handle frontend filters
    if (filters.category === 'favorites') {
      mappedItems = mappedItems.filter(i => i.isFavorite);
    } else if (filters.category && filters.category !== 'all') {
      mappedItems = mappedItems.filter(i => i.category === filters.category);
    }

    if (isSearchActive || isCategoryFilterActive) {
      total = mappedItems.length;
      mappedItems = mappedItems.slice((page - 1) * pageSize, page * pageSize);
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      items: mappedItems,
      total,
      page,
      pageSize,
      totalPages,
    };
  } catch (err) {
    console.error('Failed to fetch history list:', err);
    return {
      items: [],
      total: 0,
      page,
      pageSize: 8,
      totalPages: 1,
    };
  }
}

export async function toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
  if (typeof window !== 'undefined') {
    const favorites = JSON.parse(localStorage.getItem('promptiq_favorites') || '[]');
    const idStr = String(id);
    const existingIndex = favorites.findIndex((f: any) => String(f) === idStr);

    if (isFavorite) {
      if (existingIndex === -1) favorites.push(idStr);
    } else {
      if (existingIndex > -1) favorites.splice(existingIndex, 1);
    }
    localStorage.setItem('promptiq_favorites', JSON.stringify(favorites));
  }
}

export interface DeleteHistoryResult {
  deletedIds: string[];
  failedIds: string[];
}

export async function deleteHistoryItems(ids: string[]): Promise<DeleteHistoryResult> {
  const uniqueIds = [...new Set(ids.map(String))];
  const results = await Promise.allSettled(
    uniqueIds.map(id => apiClient.delete(`/api/v1/prompts/${id}`))
  );
  const deletedIds = uniqueIds.filter((_, index) => results[index].status === 'fulfilled');
  const failedIds = uniqueIds.filter((_, index) => results[index].status === 'rejected');

  if (typeof window !== 'undefined' && deletedIds.length > 0) {
    const deleted = new Set(deletedIds);
    const favorites = JSON.parse(localStorage.getItem('promptiq_favorites') || '[]');
    localStorage.setItem(
      'promptiq_favorites',
      JSON.stringify(favorites.filter((id: unknown) => !deleted.has(String(id))))
    );
    // Keeps the sidebar's Recent History and any other history view in sync.
    window.dispatchEvent(new Event('promptiq:history-updated'));
  }

  return { deletedIds, failedIds };
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const { failedIds } = await deleteHistoryItems([id]);
  if (failedIds.length > 0 && typeof window !== 'undefined') {
    console.error('Failed to delete prompt.');
  }
}
