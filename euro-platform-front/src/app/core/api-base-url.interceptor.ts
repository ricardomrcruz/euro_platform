import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

// Rewrites relative /api/... calls to an absolute backend URL in builds where the frontend
// is hosted separately from the API (production). Runs after authInterceptor so the token is
// attached while the URL is still relative.
export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.apiBaseUrl && req.url.startsWith('/api/')) {
    return next(req.clone({ url: environment.apiBaseUrl + req.url }));
  }
  return next(req);
};
