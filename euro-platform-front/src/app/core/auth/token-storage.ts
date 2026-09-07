const STORAGE_KEY = 'euro-cars-token';
const REMEMBERED_EMAIL_KEY = 'euro-cars-remembered-email';

export function getToken(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Never the password -- just enough to save re-typing the email on the next visit.
export function getRememberedEmail(): string | null {
  return localStorage.getItem(REMEMBERED_EMAIL_KEY);
}

export function setRememberedEmail(email: string): void {
  localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
}

export function clearRememberedEmail(): void {
  localStorage.removeItem(REMEMBERED_EMAIL_KEY);
}
