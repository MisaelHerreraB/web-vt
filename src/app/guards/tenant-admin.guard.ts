import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const tenantAdminGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const user = authService.getCurrentUser();

    // 1. Check if authenticated
    if (!user) {
        return router.createUrlTree(['/login']);
    }

    // 2. Check for SUPER_ADMIN (Access to everything)
    if (user.roles.includes('SUPER_ADMIN')) {
        return true;
    }

    // 3. Check for TENANT_ADMIN or ADMIN (Access restricted to own tenant)
    if (user.roles.includes('ADMIN') || user.roles.includes('TENANT_ADMIN')) {
        const routeSlug = route.paramMap.get('slug');
        const userTenantSlug = user.tenantSlug;

        if (routeSlug === userTenantSlug) {
            return true;
        } else {
            // Trying to access another tenant's admin panel
            // Redirect to their own dashboard or show error
            if (userTenantSlug) {
                return router.createUrlTree(['/admin', userTenantSlug, 'dashboard']);
            } else {
                // Fallback if no tenant assigned (shouldn't happen for active admins)
                return router.createUrlTree(['/']);
            }
        }
    }

    // 4. Default deny (e.g., normal users trying to access admin)
    return router.createUrlTree(['/']);
};
