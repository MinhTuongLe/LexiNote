import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { logout } from '../slices/authSlice';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337/api/v1/dashboard';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as { auth?: { token?: string } }).auth?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    try {
      const settings = localStorage.getItem('lexi_settings');
      const lang = settings ? JSON.parse(settings)?.lang?.toLowerCase() : 'vn';
      headers.set('accept-language', lang === 'en' ? 'en' : 'vi');
    } catch {
      headers.set('accept-language', 'vi');
    }

    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Session expired or invalid token
    api.dispatch(logout());
  }
  return result;
};

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Stats', 'Users', 'Words', 'Config', 'Admin', 'AuditLogs'],
  endpoints: () => ({}),
});
