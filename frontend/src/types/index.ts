export interface Word {
  id: number;
  word: string;
  meaningVi: string;
  example?: string;
  type: 'noun' | 'verb' | 'adj' | 'adv' | 'phrasal_verb' | 'idiom' | 'phrase' | 'noun_phrase' | 'verb_phrase' | 'other';
  createdAt: number;
  relations?: WordRelation[];
  reviews?: Review[];
}

export interface WordRelation {
  id: number;
  type: 'synonym' | 'antonym';
  value: string;
  word: number;
}

export interface Review {
  id: number;
  lastReviewed?: number;
  nextReview: number;
  interval: number;
  easeFactor: number;
  correctCount: number;
  wrongCount: number;
  word: number | Word;
}

export interface CreateWordDTO {
  word: string;
  meaningVi: string;
  example?: string;
  type: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalWords: number;
  dueReviewsCount: number;
  recentWords: Word[];
}
