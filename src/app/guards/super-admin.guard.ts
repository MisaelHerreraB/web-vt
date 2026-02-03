import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const superAdminGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasRole('SUPER_ADMIN')) {
        return true;
    }

    // Redirect to login if not authenticated or not super admin
    router.navigate(['/login']);
    return false;
};
