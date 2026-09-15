import { dashboardApi } from './dashboardApi';

export const wordsApi = dashboardApi.injectEndpoints({
  endpoints: (builder) => ({
    getWords: builder.query<any, { page?: number; limit?: number; search?: string; type?: string }>({
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
    updateWord: builder.mutation<any, { id: number; data: any }>({
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
