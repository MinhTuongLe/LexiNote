import { dashboardApi } from './dashboardApi';

export interface ApiUser {
  id: number;
  email: string;
  fullName: string;
  avatar?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: number | string;
  updatedAt?: number | string;
  role?: string;
  wordCount?: number;
}

export interface GetUsersResponse {
  data: ApiUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserDetailsResponse {
  user: ApiUser;
  stats: {
    totalWords: number;
    activeReviews: number;
    joinedDaysAgo: number;
    totalReviewed?: number;
    avgEaseFactor?: number | string;
    retentionRate?: number | string;
    totalCorrect?: number;
    totalWrong?: number;
  };
  words: {
    id: number;
    word: string;
    type: string;
    meaningVi: string;
    example?: string;
    reviews?: {
      correctCount: number;
      wrongCount: number;
      easeFactor: number;
      interval: number;
    }[];
  }[];
}

export interface UserSession {
  id: number;
  userId: number;
  token?: string;
  ipAddress?: string;
  userAgent?: string;
  isExpired?: boolean;
  createdAt?: string;
  expiresAt?: string;
}

export const usersApi = dashboardApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<GetUsersResponse, { page?: number; limit?: number; search?: string; isActive?: boolean }>({
      query: (params) => ({
        url: '/management/users',
        params,
      }),
      providesTags: ['Users'],
    }),
    createUser: builder.mutation<ApiUser, { fullName: string; email: string }>({
      query: (data) => ({
        url: '/management/users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Users', 'Stats'],
    }),
    toggleUserStatus: builder.mutation<{ success: boolean; isActive?: boolean }, number>({
      query: (id) => ({
        url: `/management/users/${id}/toggle-status`,
        method: 'POST',
      }),
      invalidatesTags: ['Users'],
    }),
    updateUser: builder.mutation<ApiUser, { id: number; data: { fullName?: string; email?: string } }>({
      query: ({ id, data }) => ({
        url: `/management/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
    deleteUser: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/management/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users', 'Stats'],
    }),
    getUserDetails: builder.query<UserDetailsResponse, number>({
      query: (id) => ({
        url: `/management/users/${id}/details`,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),
    toggleEmailVerified: builder.mutation<{ success: boolean; isEmailVerified?: boolean }, number>({
      query: (id) => ({
        url: `/management/users/${id}/toggle-verify`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => ['Users', { type: 'Users', id }],
    }),
    getUserSessions: builder.query<UserSession[], number>({
      query: (userId) => ({
        url: `/management/users/${userId}/sessions`,
      }),
      providesTags: (_result, _error, userId) => [{ type: 'Users', id: `sessions-${userId}` }],
    }),
    revokeUserSession: builder.mutation<{ success: boolean }, { userId: number; sessionId: number }>({
      query: ({ sessionId }) => ({
        url: `/management/users/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'Users', id: `sessions-${userId}` }],
    }),
    revokeAllUserSessions: builder.mutation<{ success: boolean }, number>({
      query: (userId) => ({
        url: `/management/users/${userId}/sessions`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, userId) => [{ type: 'Users', id: `sessions-${userId}` }],
    }),
    updateUserRole: builder.mutation<ApiUser, { id: number; role: 'ADMIN' | 'MEMBER' }>({
      query: ({ id, role }) => ({
        url: `/management/users/${id}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['Users'],
    }),
    resetUserPassword: builder.mutation<{ message: string; defaultPassword?: string; revokedSessionsCount?: number }, number>({
      query: (id) => ({
        url: `/management/users/${id}/reset-password`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => ['Users', { type: 'Users', id }, { type: 'Users', id: `sessions-${id}` }],
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
  useUpdateUserRoleMutation,
  useResetUserPasswordMutation,
} = usersApi;
