import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { catchError, switchMap, throwError, from } from 'rxjs';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);

  // Skip auth for token endpoints
  if (req.url.includes('/token/generate') || req.url.includes('/token/refresh') || req.url.includes('/register')) {
    return next(req);
  }

  const token = auth.token;
  let authReq = req;
  if (token && req.url.includes(environment.apiUrl)) {
    authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isRefreshing && auth.refreshToken) {
        isRefreshing = true;
        return from(auth.refreshTokens()).pipe(
          switchMap((tokens) => {
            isRefreshing = false;
            const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${tokens.accessToken}` } });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            auth.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
