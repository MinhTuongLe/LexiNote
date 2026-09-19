import { dashboardApi } from './dashboardApi';

export const authApi = dashboardApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Admin'],
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery } = authApi;
