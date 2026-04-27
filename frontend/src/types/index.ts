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

export interface StudyStats {
  streak: number;
  weeklyActivity: { date: string; count: number }[];
  totalReviewed: number;
  masteredCount: number;
  learningCount: number;
  newCount: number;
  typesBreakdown: TypeBreakdown[];
  averageEaseFactor: number;
  accuracy: number;
  totalTimeSpentMinutes: number;
  weakestWords: { word: string; meaning: string; wrongCount: number }[];
}

export interface TypeBreakdown {
  type: string;
  total: number;
  mastered: number;
  learning: number;
  new: number;
}

export interface DashboardStats {
  totalWords: number;
  dueReviewsCount: number;
  recentWords: (Word & { progress: number })[];
  streak: number;
  weeklyActivity: { date: string; count: number }[];
}
