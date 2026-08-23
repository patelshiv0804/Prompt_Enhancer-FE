export type SortBy = 'most-recent' | 'highest-score' | 'lowest-score' | 'oldest';

export interface HistoryItem {
  id: string;
  prompt: string;
  optimizedPrompt: string;
  category: string;
  // null while the prompt's quality analysis is still being computed in the
  // background (not yet persisted to the DB) — consumers show a loader for null.
  score: number | null;
  isFavorite: boolean;
  targetModel: string;
  mode: string;
  createdAt: string;
  wordCount: { original: number; optimized: number };
  tokenCount: number;
}

export interface HistoryStats {
  totalPrompts: number;
  averageScore: number;
  thisWeekDelta: number;
  favoritesCount: number;
}

export interface HistoryFilters {
  search: string;
  category: string;
  sortBy: SortBy;
}

export interface PaginatedHistoryResponse {
  items: HistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
