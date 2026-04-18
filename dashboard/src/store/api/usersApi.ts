import { dashboardApi } from './dashboardApi';

export const usersApi = dashboardApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<any, { page?: number; limit?: number; search?: string }>({
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
  }),
});

export const { 
  useGetUsersQuery, 
  useCreateUserMutation,
  useToggleUserStatusMutation, 
  useUpdateUserMutation 
} = usersApi;
