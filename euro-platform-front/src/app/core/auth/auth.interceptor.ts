import { HttpInterceptorFn } from '@angular/common/http';
import { getToken } from './token-storage';

// Attaches the JWT to our own API calls only -- never to the i18n JSON loader or any
// third-party request, since HttpClient is shared across the whole app.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) return next(req);

  const token = getToken();
  if (!token) return next(req);

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
