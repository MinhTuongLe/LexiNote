import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the base URL for the dashboard API
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337/api/v1/dashboard';

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // We will add auth token injection here later
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Stats', 'Users', 'Words', 'Config', 'Admin'],
  endpoints: () => ({}), // Split into multiple files later using injectEndpoints
});
