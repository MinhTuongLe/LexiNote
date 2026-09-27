interface ApiErrorPayload {
  message?: string;
  code?: string;
}

interface ApiErrorLike {
  data?: ApiErrorPayload;
  message?: string;
}

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error !== 'object' || error === null) return fallback;

  const candidate = error as ApiErrorLike;
  return candidate.data?.message || candidate.message || fallback;
};

export const getApiErrorPayload = (error: unknown): ApiErrorPayload | undefined => {
  if (typeof error !== 'object' || error === null) return undefined;
  return (error as ApiErrorLike).data;
};
