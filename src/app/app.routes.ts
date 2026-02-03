import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home';
import { ProductDetailComponent } from './pages/product-detail';

export const routes: Routes = [
    // Auth Routes (must be before :slug wildcard)
    {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
    },

    // Super Admin Routes (must be before :slug wildcard)
    {
        path: 'super-admin',
        canActivate: [() => import('./guards/super-admin.guard').then(m => m.superAdminGuard)],
        loadComponent: () => import('./super-admin/super-admin-layout/super-admin-layout.component').then(m => m.SuperAdminLayoutComponent),
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./super-admin/dashboard/super-admin-dashboard.component').then(m => m.SuperAdminDashboardComponent)
            },
            {
                path: 'tenants',
                loadComponent: () => import('./super-admin/tenants/tenant-management.component').then(m => m.TenantManagementComponent)
            },
            {
                path: 'users',
                loadComponent: () => import('./super-admin/users/user-management.component').then(m => m.UserManagementComponent)
            },
            {
                path: 'plans',
                loadComponent: () => import('./super-admin/plans/plans-list.component').then(m => m.PlansListComponent)
            }
        ]
    },

    // Admin Routes
    {
        path: 'admin/:slug',
        canActivate: [() => import('./guards/tenant-admin.guard').then(m => m.tenantAdminGuard)],
        loadComponent: () => import('./admin/admin-layout/admin-layout').then(m => m.AdminLayoutComponent),
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () => import('./admin/dashboard/dashboard').then(m => m.DashboardComponent)
            },
            {
                path: 'categories',
                loadComponent: () => import('./admin/categories/category-list/category-list').then(m => m.CategoryListComponent)
            },
            {
                path: 'categories/new',
                loadComponent: () => import('./admin/categories/category-form/category-form').then(m => m.CategoryFormComponent)
            },
            {
                path: 'categories/:categoryId',
                loadComponent: () => import('./admin/categories/category-form/category-form').then(m => m.CategoryFormComponent)
            },
            {
                path: 'products',
                loadComponent: () => import('./admin/products/product-list/product-list').then(m => m.ProductListComponent)
            },
            {
                path: 'products/new',
                loadComponent: () => import('./admin/products/product-form/product-form').then(m => m.ProductFormComponent)
            },
            {
                path: 'products/:productId',
                loadComponent: () => import('./admin/products/product-form/product-form').then(m => m.ProductFormComponent)
            },
            {
                path: 'settings',
                loadComponent: () => import('./admin/settings/tenant-settings/tenant-settings').then(m => m.TenantSettingsComponent)
            },
            {
                path: 'promotions',
                loadComponent: () => import('./admin/settings/promotions/promotions.component').then(m => m.PromotionsComponent)
            },
            {
                path: 'orders',
                loadComponent: () => import('./admin/orders/orders-list.component').then(m => m.OrdersListComponent)
            },
            {
                path: 'orders/:id',
                loadComponent: () => import('./admin/orders/order-detail.component').then(m => m.OrderDetailComponent)
            }
        ]
    },

    // Tenant Not Found (must be before wildcards)
    {
        path: 'tenant-not-found/:slug',
        loadComponent: () => import('./pages/tenant-not-found').then(m => m.TenantNotFoundComponent)
    },

    // Public Routes (wildcards must be last)
    {
        path: ':slug',
        component: HomeComponent,
    },
    {
        path: ':slug/p/:productId',
        component: ProductDetailComponent
    },
    {
        path: '',
        loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingPageComponent),
        pathMatch: 'full'
    }
];
