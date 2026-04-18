import { dashboardApi } from './dashboardApi';

export const wordsApi = dashboardApi.injectEndpoints({
  endpoints: (builder) => ({
    getWords: builder.query<any, { page?: number; limit?: number; search?: string }>({
      query: (params) => ({
        url: '/words',
        params,
      }),
      providesTags: ['Words'],
    }),
    deleteWord: builder.mutation<any, number>({
      query: (id) => ({
        url: `/words/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Words', 'Stats'],
    }),
  }),
});

export const { useGetWordsQuery, useDeleteWordMutation } = wordsApi;
