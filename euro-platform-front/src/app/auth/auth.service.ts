import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { getToken, setToken, clearToken } from './token-storage';
import { decodeJwtPayload, JwtPayload } from './jwt';

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisteredUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  // Initialized from whatever token is already in storage, so a page refresh stays logged in.
  private readonly userSignal = signal<JwtPayload | null>(this.readUserFromStorage());
  readonly currentUser = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.userSignal() !== null);

  // The login dialog is mounted once (in the app shell) and opened from anywhere -- the
  // navbar's "Sign In" button and the register page's post-success "sign in" button both
  // trigger the same instance via this shared signal.
  private readonly loginDialogVisibleSignal = signal(false);
  readonly loginDialogVisible = this.loginDialogVisibleSignal.asReadonly();

  openLoginDialog(): void {
    this.loginDialogVisibleSignal.set(true);
  }

  closeLoginDialog(): void {
    this.loginDialogVisibleSignal.set(false);
  }

  // No token is returned on register -- the caller (register page) is responsible for
  // prompting the user to log in afterward.
  register(payload: RegisterPayload): Promise<RegisteredUser> {
    return firstValueFrom(this.http.post<RegisteredUser>('/api/auth/register', payload));
  }

  async login(payload: LoginPayload): Promise<void> {
    const { accessToken } = await firstValueFrom(
      this.http.post<{ accessToken: string }>('/api/auth/login', payload),
    );
    setToken(accessToken);
    this.userSignal.set(decodeJwtPayload(accessToken));
  }

  // Client-side only, by design -- there's no logout endpoint yet (tokenVersion revocation
  // exists but nothing triggers it), so forgetting the token locally is all that's needed.
  logout(): void {
    clearToken();
    this.userSignal.set(null);
  }

  private readUserFromStorage(): JwtPayload | null {
    const token = getToken();
    return token ? decodeJwtPayload(token) : null;
  }
}
