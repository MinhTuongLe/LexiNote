import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { Word, CreateWordDTO, Review, PaginatedResponse, DashboardStats, StudyStats } from '../types';
import { logout, updateTokens, updateUser } from './authSlice';
import type { User } from './authSlice';
import i18n from '../i18n';

// Base query with auth header
const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:1337/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as any).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    const language = i18n.language || 'en';
    headers.set('Accept-Language', language);
    return headers;
  },
});

// Wrapper: intercept 401 → try refresh → retry original request or handle system errors
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    // Handle 401 Unauthorized -> Refresh Token Flow
    if (result.error.status === 401) {
      const refreshToken = (api.getState() as any).auth.refreshToken;

      if (refreshToken) {
        // Try to get a new access token
        const refreshResult = await rawBaseQuery(
          {
            url: '/auth/refresh',
            method: 'POST',
            body: { refreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const data = refreshResult.data as { user: User; token: string; refreshToken: string };
          // Store the new tokens
          api.dispatch(updateTokens({ token: data.token, refreshToken: data.refreshToken }));

          // Retry the original request with the new token
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          // Refresh failed — force logout
          api.dispatch(logout());
          window.dispatchEvent(new CustomEvent('system-error', { detail: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!' }));
        }
      } else {
        // No refresh token available — force logout
        api.dispatch(logout());
        window.dispatchEvent(new CustomEvent('system-error', { detail: 'Phiên đăng nhập không hợp lệ!' }));
      }
    } 
    // Handle System Errors (Network down, Server Error >= 500, etc)
    else if (
      result.error.status === 'FETCH_ERROR' || 
      result.error.status === 'TIMEOUT_ERROR' || 
      (typeof result.error.status === 'number' && result.error.status >= 500)
    ) {
      // Force logout and throw global system error event
      api.dispatch(logout());
      window.dispatchEvent(new CustomEvent('system-error', { 
        detail: 'Máy chủ phản hồi lỗi hoặc mất kết nối mạng. Bạn đã bị đăng xuất để đảm bảo an toàn!' 
      }));
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Words', 'Reviews', 'User'],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation<{ user: User; token: string; refreshToken: string }, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<{ message: string; email: string; _devVerificationToken?: string }, { email: string; password: string; fullName: string }>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getMe: builder.query<{ user: User }, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateUser(data.user));
        } catch (err) {}
      },
    }),
    refreshToken: builder.mutation<{ user: User; token: string; refreshToken: string }, { refreshToken: string }>({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
    }),
    updateProfile: builder.mutation<{ user: User; message: string }, { fullName?: string; avatar?: string }>({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation<{ message: string }, { currentPassword: string; newPassword: string }>({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
    }),
    forgotPassword: builder.mutation<{ message: string; _devResetToken?: string }, { email: string }>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation<{ message: string }, { email: string; resetToken: string; newPassword: string }>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    verifyEmail: builder.mutation<{ user: User; token: string; refreshToken: string; message: string }, { email: string; token: string }>({
      query: (data) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: data,
      }),
    }),
    resendVerification: builder.mutation<{ message: string; _devVerificationToken?: string }, { email: string }>({
      query: (data) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body: data,
      }),
    }),
    logoutServer: builder.mutation<{ message: string }, { refreshToken?: string } | void>({
      query: (body) => ({
        url: '/auth/logout',
        method: 'POST',
        body,
      }),
    }),

    // Dashboard
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/dashboard',
      providesTags: ['Words', 'Reviews'],
    }),
    getStudyStats: builder.query<StudyStats, void>({
      query: () => '/reviews/stats',
      providesTags: ['Reviews'],
    }),

    // Words
    getWords: builder.query<PaginatedResponse<Word>, { page?: number; limit?: number | 'all'; search?: string; type?: string } | void>({
      query: (params) => ({
        url: '/words',
        params: params || {},
      }),
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
        responseHandler: 'text',
      }),
      invalidatesTags: ['Words', 'Reviews'],
    }),
    deleteBulkWords: builder.mutation<{ success: boolean; count: number }, { wordIds: number[] }>({
      query: (data) => ({
        url: '/words/delete-bulk',
        method: 'POST',
        body: data,
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
    updateSettings: builder.mutation<{ settings: any; message: string }, any>({
      query: (settings) => ({
        url: '/settings',
        method: 'PATCH',
        body: settings,
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const currentUser = (getState() as any).auth.user;
          if (currentUser) {
            dispatch(updateUser({ ...currentUser, settings: data.settings }));
          }
        } catch (err) {}
      },
    }),
    getSettings: builder.query<{ preferences: any; wordTypes: { system: string[], custom: any[] } }, void>({
      query: () => '/settings',
      providesTags: ['User'],
    }),
    deactivateAccount: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/settings/deactivate',
        method: 'PATCH',
      }),
    }),
    seedStats: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/seed-stats',
        method: 'GET',
      }),
      invalidatesTags: ['Words', 'Reviews'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useRefreshTokenMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useLogoutServerMutation,
  useUpdateSettingsMutation,
  useGetSettingsQuery,
  useGetDashboardStatsQuery,
  useGetStudyStatsQuery,
  useGetWordsQuery,
  useCreateWordMutation,
  useUpdateWordMutation,
  useDeleteWordMutation,
  useDeleteBulkWordsMutation,
  useImportWordsMutation,
  useGetDueReviewsQuery,
  useUpdateSRSMutation,
  useResetProgressMutation,
  useLazyGetWordsQuery,
  useDeactivateAccountMutation,
  useSeedStatsMutation,
} = apiSlice;
