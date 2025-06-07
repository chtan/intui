// src/app/auth/auth.interceptor.ts
import {
  HttpEvent, HttpInterceptorFn, HttpHandlerFn, HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const auth = inject(AuthService);
  const requestType = req.headers.get('X-Request-Type');
  let cleanedReq = req.clone({ headers: req.headers.delete('X-Request-Type') });

  // Add the appropriate headers
  if (requestType === 'anonymous') {
    const anonToken = auth.getAnonymousToken();
    if (anonToken) {
      cleanedReq = cleanedReq.clone({ setHeaders: { 'X-Anonymous-Token': anonToken } });
    }
  }

  if (requestType === 'logged-in') {
    const accessToken = auth.getAccessToken();
    const refreshToken = auth.getRefreshToken();
    if (accessToken) {
      cleanedReq = cleanedReq.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
          'x-refresh-token': refreshToken || ''
        }
      });
    }
  }

  // Automatically handle token refresh on 401
  return next(cleanedReq).pipe(
    catchError(err => {
      if (err.status === 401 && requestType === 'logged-in') {
        return auth.refreshAccessToken().pipe(
          switchMap(newAccessToken => {
            const retryReq = cleanedReq.clone({
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`,
                'x-refresh-token': auth.getRefreshToken() || ''
              }
            });
            return next(retryReq);
          }),
          catchError(refreshErr => {
            auth.logout();
            return throwError(() => refreshErr);
          })
        );
      }
      return throwError(() => err);
    })
  );
};
