export const AUTH_REDIRECT_KEY = "lbf.auth.redirect";

export function setAuthRedirect(path: string) {
  if (typeof window === "undefined") return;
  if (path.startsWith("/")) {
    window.localStorage.setItem(AUTH_REDIRECT_KEY, path);
  }
}

export function consumeAuthRedirect(): string | null {
  if (typeof window === "undefined") return null;
  const pending = window.localStorage.getItem(AUTH_REDIRECT_KEY);
  if (pending?.startsWith("/")) {
    window.localStorage.removeItem(AUTH_REDIRECT_KEY);
    return pending;
  }
  return null;
}
