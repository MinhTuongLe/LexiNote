import { dashboardApi } from './dashboardApi';

export interface WordReview {
  id: number;
  wordId: number;
  interval: number;
  easeFactor: number;
  correctCount: number;
  wrongCount: number;
  lastReviewed: string | null;
  nextReview: string;
  createdAt: string;
  updatedAt: string;
}

export interface WordOwner {
  id: number;
  fullName: string;
  email: string;
}

export interface WordItem {
  id: number;
  word: string;
  meaningVi: string;
  example?: string | null;
  type: string;
  ownerId: number;
  difficulty?: string;
  createdAt: string;
  updatedAt: string;
  owner?: WordOwner;
  reviews?: WordReview[];
}

export type Word = WordItem;

export interface WordListResponse {
  data: WordItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const wordsApi = dashboardApi.injectEndpoints({
  endpoints: (builder) => ({
    getWords: builder.query<
      WordListResponse,
      { page?: number; limit?: number; search?: string; type?: string; ownerId?: number }
    >({
      query: (params) => ({
        url: '/words',
        params,
      }),
      providesTags: ['Words'],
    }),
    deleteWord: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/words/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Words', 'Stats'],
    }),
    updateWord: builder.mutation<WordItem, { id: number; data: Partial<WordItem> }>({
      query: ({ id, data }) => ({
        url: `/words/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Words'],
    }),
  }),
});

export const { 
  useGetWordsQuery, 
  useDeleteWordMutation,
  useUpdateWordMutation 
} = wordsApi;
