import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { getToken } from './token-storage';
import { AuthService } from './auth.service';

// Auth's own endpoints return 401 for reasons that are NOT "your session expired" (bad
// credentials on login, an invalid registration) -- those are handled inline by their own
// dialogs, so they're excluded from the reactive "pop the login dialog" behavior below.
const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/register'];

// Attaches the JWT to our own API calls, and reacts when the server rejects it as invalid/
// expired: the token is dead either way, so log out and prompt to sign back in immediately
// instead of leaving the user stuck on a broken page.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) return next(req);

  // Captured now, synchronously -- inject() only works within this call's own injection
  // context, not inside the catchError callback below, which runs later when the response
  // (or error) actually arrives.
  const authService = inject(AuthService);

  const token = getToken();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      const isUnauthorized = error instanceof HttpErrorResponse && error.status === 401;
      const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => req.url.startsWith(path));
      if (token && isUnauthorized && !isAuthEndpoint) {
        authService.notifySessionExpired();
      }
      return throwError(() => error);
    }),
  );
};
