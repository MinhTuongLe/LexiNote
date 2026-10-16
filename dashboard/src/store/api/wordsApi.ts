import { dashboardApi } from './dashboardApi';

export interface WordRelationItem {
  id: number;
  wordId: number;
  type: string; // synonym, antonym, collocation
  value: string;
  createdAt?: string;
  updatedAt?: string;
}

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
  phonetic?: string | null;
  audioUrl?: string | null;
  ownerId: number;
  moderationStatus?: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NEEDS_EDIT';
  flagReason?: string | null;
  rejectReason?: string | null;
  difficulty?: string;
  createdAt: string;
  updatedAt: string;
  owner?: WordOwner;
  reviews?: WordReview[];
  relations?: WordRelationItem[];
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
    transferWordOwnership: builder.mutation<{ success: boolean; wordId: number }, { id: number; newOwnerId: number }>({
      query: ({ id, newOwnerId }) => ({
        url: `/words/${id}/transfer-ownership`,
        method: 'POST',
        body: { newOwnerId },
      }),
      invalidatesTags: ['Words'],
    }),
    addWordRelation: builder.mutation<WordRelationItem, { wordId: number; type: string; value: string }>({
      query: ({ wordId, type, value }) => ({
        url: `/words/${wordId}/relations`,
        method: 'POST',
        body: { type, value },
      }),
      invalidatesTags: ['Words'],
    }),
    deleteWordRelation: builder.mutation<{ id: number }, number>({
      query: (relationId) => ({
        url: `/words/relations/${relationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Words'],
    }),
    importWords: builder.mutation<{ success: boolean; importedCount: number }, { rawWords: string; type?: string; autoEnrich?: boolean }>({
      query: (data) => ({
        url: '/words/import',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Words', 'Stats'],
    }),
    getPendingModerationWords: builder.query<
      WordListResponse,
      { page?: number; limit?: number; search?: string; reason?: string }
    >({
      query: (params) => ({
        url: '/moderation/pending',
        params,
      }),
      providesTags: ['Words'],
    }),
    approveWord: builder.mutation<{ success: boolean; wordId: number }, number>({
      query: (id) => ({
        url: `/moderation/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['Words', 'Stats'],
    }),
    rejectWord: builder.mutation<{ success: boolean; wordId: number }, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/moderation/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Words', 'Stats'],
    }),
    requestEditWord: builder.mutation<{ success: boolean; wordId: number }, { id: number; note: string }>({
      query: ({ id, note }) => ({
        url: `/moderation/${id}/request-edit`,
        method: 'POST',
        body: { note },
      }),
      invalidatesTags: ['Words', 'Stats'],
    }),
    batchApproveWords: builder.mutation<{ success: boolean; approvedCount: number }, number[]>({
      query: (wordIds) => ({
        url: '/moderation/batch-approve',
        method: 'POST',
        body: { wordIds },
      }),
      invalidatesTags: ['Words', 'Stats'],
    }),
    resetWordSrs: builder.mutation<{ success: boolean; message: string; review: any }, number>({
      query: (id) => ({
        url: `/words/${id}/reset-srs`,
        method: 'POST',
      }),
      invalidatesTags: ['Words', 'Stats'],
    }),
    getDistinctWordTypes: builder.query<string[], void>({
      query: () => '/words/types',
      providesTags: ['Words'],
    }),
  }),
});

export const { 
  useGetWordsQuery, 
  useDeleteWordMutation,
  useUpdateWordMutation,
  useTransferWordOwnershipMutation,
  useAddWordRelationMutation,
  useDeleteWordRelationMutation,
  useImportWordsMutation,
  useGetPendingModerationWordsQuery,
  useApproveWordMutation,
  useRejectWordMutation,
  useRequestEditWordMutation,
  useBatchApproveWordsMutation,
  useResetWordSrsMutation,
  useGetDistinctWordTypesQuery,
} = wordsApi;

