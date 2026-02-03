import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // Session expired or invalid token
                // Show notification to user
                const notification = document.createElement('div');
                notification.className = 'fixed top-20 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in';
                notification.innerHTML = '<strong>⚠️ Sesión expirada</strong><br>Por favor, inicia sesión nuevamente';
                document.body.appendChild(notification);

                // Remove notification after 3 seconds
                setTimeout(() => notification.remove(), 3000);

                // Logout and redirect to login (after a brief delay for user to see notification)
                setTimeout(() => {
                    authService.logout();
                }, 1000);
            }
            return throwError(() => error);
        })
    );
};
