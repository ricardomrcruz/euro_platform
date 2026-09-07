import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  getToken,
  setToken,
  clearToken,
  getRememberedEmail,
  setRememberedEmail,
  clearRememberedEmail,
} from './token-storage';
import { decodeJwtPayload, JwtPayload } from './jwt';
import { LoginPayload, RegisterPayload, RegisteredUser } from './interfaces/auth.interface';

// Warn this long before the token's own expiry -- gives the user a chance to extend the
// session before a request actually fails mid-action.
const EXPIRY_WARNING_LEAD_MS = 2 * 60 * 1000;
// setTimeout silently overflows past ~24.8 days (32-bit signed ms), which a 30-day
// "remember me" token exceeds -- re-arm in chunks instead of scheduling the real delay directly.
const MAX_TIMEOUT_MS = 20 * 24 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  // Initialized from whatever token is already in storage, so a page refresh stays logged in.
  private readonly userSignal = signal<JwtPayload | null>(this.readUserFromStorage());
  readonly currentUser = this.userSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.userSignal() !== null);

  readonly rememberedEmail = signal(getRememberedEmail() ?? '');

  // The login dialog is mounted once (in the app shell) and opened from anywhere -- the
  // navbar's "Sign In" button, the register dialog's post-success prompt, the session-expiry
  // warning's "stay signed in" action, and the interceptor's reactive 401 handling all trigger
  // the same instance via this shared signal.
  private readonly loginDialogVisibleSignal = signal(false);
  readonly loginDialogVisible = this.loginDialogVisibleSignal.asReadonly();

  // Set only when the dialog was opened *because* a request came back unauthorized -- lets
  // the dialog show "your session expired" instead of a plain sign-in prompt. Cleared on the
  // next successful login or manual close.
  private readonly sessionExpiredNoticeSignal = signal(false);
  readonly sessionExpiredNotice = this.sessionExpiredNoticeSignal.asReadonly();

  private readonly registerDialogVisibleSignal = signal(false);
  readonly registerDialogVisible = this.registerDialogVisibleSignal.asReadonly();

  // The proactive "your session is about to expire" prompt -- distinct from the dialog above,
  // shown ahead of time rather than after a request has already failed.
  private readonly sessionWarningVisibleSignal = signal(false);
  readonly sessionWarningVisible = this.sessionWarningVisibleSignal.asReadonly();

  private expiryTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    if (this.userSignal()) this.scheduleExpiryWarning();
  }

  openLoginDialog(): void {
    this.loginDialogVisibleSignal.set(true);
  }

  closeLoginDialog(): void {
    this.loginDialogVisibleSignal.set(false);
    this.sessionExpiredNoticeSignal.set(false);
  }

  openRegisterDialog(): void {
    this.registerDialogVisibleSignal.set(true);
  }

  closeRegisterDialog(): void {
    this.registerDialogVisibleSignal.set(false);
  }

  dismissSessionWarning(): void {
    this.sessionWarningVisibleSignal.set(false);
  }

  // "Stay signed in" on the proactive warning -- there's no silent token-refresh endpoint, so
  // the honest path is the same one the reactive 401 flow uses: log in again for a fresh token.
  extendSession(): void {
    this.sessionWarningVisibleSignal.set(false);
    this.openLoginDialog();
  }

  // Called by the HTTP interceptor when an authenticated request comes back unauthorized --
  // the current token is dead either way, so drop it and prompt to sign back in immediately
  // rather than leaving the user stuck on a broken page not knowing why an action failed.
  notifySessionExpired(): void {
    this.logout();
    this.sessionExpiredNoticeSignal.set(true);
    this.loginDialogVisibleSignal.set(true);
  }

  // No token is returned on register -- the caller (register dialog) is responsible for
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
    this.sessionExpiredNoticeSignal.set(false);

    if (payload.rememberMe) {
      setRememberedEmail(payload.email);
      this.rememberedEmail.set(payload.email);
    } else {
      clearRememberedEmail();
      this.rememberedEmail.set('');
    }

    this.scheduleExpiryWarning();
  }

  // Client-side only, by design -- there's no logout endpoint yet (tokenVersion revocation
  // exists but nothing triggers it), so forgetting the token locally is all that's needed.
  logout(): void {
    clearToken();
    this.userSignal.set(null);
    clearTimeout(this.expiryTimer);
  }

  private readUserFromStorage(): JwtPayload | null {
    const token = getToken();
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    if (!payload || payload.exp * 1000 <= Date.now()) {
      clearToken();
      return null;
    }
    return payload;
  }

  // Handles both ordinary (~1h) and "remember me" (30d) tokens: re-arms itself in safe chunks
  // if the real delay would overflow setTimeout's ~24.8-day limit, so this needs no special
  // casing at the call site.
  private scheduleExpiryWarning(): void {
    clearTimeout(this.expiryTimer);
    const user = this.userSignal();
    if (!user) return;

    const msUntilExpiry = user.exp * 1000 - Date.now();
    const msUntilWarning = msUntilExpiry - EXPIRY_WARNING_LEAD_MS;

    if (msUntilWarning <= 0) {
      this.sessionWarningVisibleSignal.set(true);
      return;
    }

    if (msUntilWarning > MAX_TIMEOUT_MS) {
      this.expiryTimer = setTimeout(() => this.scheduleExpiryWarning(), MAX_TIMEOUT_MS);
      return;
    }

    this.expiryTimer = setTimeout(() => this.sessionWarningVisibleSignal.set(true), msUntilWarning);
  }
}
