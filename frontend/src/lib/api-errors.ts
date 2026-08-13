import type { AxiosError } from "axios";

export type ApiFieldErrors = Record<string, string>;

export type ParsedApiError = {
  message: string;
  fieldErrors: ApiFieldErrors;
};

export function parseApiError(error: unknown, fallback = "Une erreur est survenue."): ParsedApiError {
  const axiosErr = error as AxiosError<{ message?: string; errors?: ApiFieldErrors }>;
  const data = axiosErr?.response?.data;
  const fieldErrors = data?.errors ?? {};
  const firstFieldMessage = Object.values(fieldErrors)[0];
  const message = data?.message || firstFieldMessage || axiosErr?.message || fallback;
  return { message, fieldErrors };
}

export function getFieldError(fieldErrors: ApiFieldErrors, field: string): string | undefined {
  return fieldErrors[field];
}
