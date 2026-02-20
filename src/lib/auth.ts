export const AUTH_TOKEN_KEY = "OF__auth_token";

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
