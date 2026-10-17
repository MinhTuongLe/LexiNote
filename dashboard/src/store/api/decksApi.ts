import { dashboardApi } from './dashboardApi';

export interface AdminDeckWord {
  word: string;
  meaningVi: string;
  type?: string;
  phonetic?: string;
  example?: string;
  audioUrl?: string;
}

export interface AdminDeck {
  id: number;
  title: string;
  description?: string | null;
  category: string;
  level?: string | null;
  coverImage?: string | null;
  wordCount?: number;
  words?: AdminDeckWord[];
}

export const decksApi = dashboardApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDecks: builder.query<{ success: boolean; data: AdminDeck[] }, { category?: string; search?: string } | void>({
      query: (params) => ({ url: '/decks/curated', params: params || undefined }),
      providesTags: ['Decks'],
    }),
    createAdminDeck: builder.mutation<{ success: boolean; data: AdminDeck }, Omit<AdminDeck, 'id' | 'wordCount' | 'words'> & { words: AdminDeckWord[] }>({
      query: (body) => ({ url: '/decks', method: 'POST', body }),
      invalidatesTags: ['Decks'],
    }),
    deleteAdminDeck: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({ url: `/decks/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Decks'],
    }),
  }),
});

export const { useGetAdminDecksQuery, useCreateAdminDeckMutation, useDeleteAdminDeckMutation } = decksApi;
