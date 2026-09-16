import { dashboardApi } from './dashboardApi';

export const usersApi = dashboardApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<any, { page?: number; limit?: number; search?: string; isActive?: boolean }>({
      query: (params) => ({
        url: '/management/users',
        params,
      }),
      providesTags: ['Users'],
    }),
    createUser: builder.mutation<any, any>({
      query: (data) => ({
        url: '/management/users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Users', 'Stats'],
    }),
    toggleUserStatus: builder.mutation<any, number>({
      query: (id) => ({
        url: `/management/users/${id}/toggle-status`,
        method: 'POST',
      }),
      invalidatesTags: ['Users'],
    }),
    updateUser: builder.mutation<any, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/management/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation<any, number>({
      query: (id) => ({
        url: `/management/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users', 'Stats'],
    }),
    getUserDetails: builder.query<any, number>({
      query: (id) => ({
        url: `/management/users/${id}/details`,
      }),
      providesTags: (result, error, id) => [{ type: 'Users', id }],
    }),
    toggleEmailVerified: builder.mutation<any, number>({
      query: (id) => ({
        url: `/management/users/${id}/toggle-verify`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => ['Users', { type: 'Users', id }],
    }),
    getUserSessions: builder.query<any, number>({
      query: (userId) => ({
        url: `/management/users/${userId}/sessions`,
      }),
      providesTags: (result, error, userId) => [{ type: 'Users', id: `sessions-${userId}` }],
    }),
    revokeUserSession: builder.mutation<any, { userId: number; sessionId: number }>({
      query: ({ sessionId }) => ({
        url: `/management/users/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { userId }) => [{ type: 'Users', id: `sessions-${userId}` }],
    }),
    revokeAllUserSessions: builder.mutation<any, number>({
      query: (userId) => ({
        url: `/management/users/${userId}/sessions`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, userId) => [{ type: 'Users', id: `sessions-${userId}` }],
    }),
  }),
});

export const { 
  useGetUsersQuery, 
  useCreateUserMutation,
  useToggleUserStatusMutation, 
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserDetailsQuery,
  useToggleEmailVerifiedMutation,
  useGetUserSessionsQuery,
  useRevokeUserSessionMutation,
  useRevokeAllUserSessionsMutation,
} = usersApi;
