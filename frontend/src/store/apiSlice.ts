import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Word, CreateWordDTO, Review } from '../types';

const baseQuery = fetchBaseQuery({ 
  baseUrl: 'http://localhost:1337/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Words', 'Reviews'],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation<any, any>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<any, any>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    // Words
    getWords: builder.query<Word[], void>({
      query: () => '/words',
      providesTags: ['Words'],
    }),
    createWord: builder.mutation<Word, CreateWordDTO>({
      query: (newWord) => ({
        url: '/words',
        method: 'POST',
        body: newWord,
      }),
      invalidatesTags: ['Words', 'Reviews'],
    }),
    updateWord: builder.mutation<Word, { id: number; data: Partial<CreateWordDTO> }>({
      query: ({ id, data }) => ({
        url: `/words/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Words', 'Reviews'],
    }),
    deleteWord: builder.mutation<void, number>({
      query: (id) => ({
        url: `/words/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Words', 'Reviews'],
    }),
    importWords: builder.mutation<{ imported: number }, any[]>({
      query: (words) => ({
        url: '/words/import',
        method: 'POST',
        body: { words },
      }),
      invalidatesTags: ['Words', 'Reviews'],
    }),

    // Reviews
    getDueReviews: builder.query<Review[], void>({
      query: () => '/reviews/due',
      providesTags: ['Reviews'],
    }),
    updateSRS: builder.mutation<Review, { reviewId: number; quality: number }>({
      query: (data) => ({
        url: '/reviews/update',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Reviews', 'Words'],
    }),
    resetProgress: builder.mutation<{ success: boolean; count: number }, number[]>({
      query: (wordIds) => ({
        url: '/reviews/reset',
        method: 'POST',
        body: { wordIds },
      }),
      invalidatesTags: ['Reviews', 'Words'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetWordsQuery,
  useCreateWordMutation,
  useUpdateWordMutation,
  useDeleteWordMutation,
  useImportWordsMutation,
  useGetDueReviewsQuery,
  useUpdateSRSMutation,
  useResetProgressMutation,
} = apiSlice;
