import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { RUNTIME_CONFIG, RuntimeConfig } from '../config/runtime-config';

interface UserData {
    email: string;
    sub: string;
    roles: string[];
    tenantId?: string;
    tenantSlug?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl: string;
    private tokenKey = 'access_token';
    private userDataKey = 'user_data';
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

    constructor(
        private http: HttpClient,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object,
        @Inject(RUNTIME_CONFIG) private config: RuntimeConfig
    ) {
        this.apiUrl = `${this.config.apiUrl}/auth`;
    }

    login(credential: any): Observable<any> {
        return this.http.post<{ access_token: string }>(`${this.apiUrl}/login`, credential).pipe(
            tap(response => {
                if (isPlatformBrowser(this.platformId)) {
                    localStorage.setItem(this.tokenKey, response.access_token);

                    // Decode JWT and store user data
                    const userData = this.decodeToken(response.access_token);
                    if (userData) {
                        localStorage.setItem(this.userDataKey, JSON.stringify(userData));
                    }

                    this.isAuthenticatedSubject.next(true);
                }
            })
        );
    }

    logout(): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userDataKey);
            this.isAuthenticatedSubject.next(false);
        }
        this.router.navigate(['/login']);
    }

    isAuthenticated(): Observable<boolean> {
        return this.isAuthenticatedSubject.asObservable();
    }

    private hasToken(): boolean {
        if (isPlatformBrowser(this.platformId)) {
            return !!localStorage.getItem(this.tokenKey);
        }
        return false;
    }

    getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem(this.tokenKey);
        }
        return null;
    }

    getCurrentUser(): UserData | null {
        if (isPlatformBrowser(this.platformId)) {
            const userData = localStorage.getItem(this.userDataKey);
            return userData ? JSON.parse(userData) : null;
        }
        return null;
    }

    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return user?.roles?.includes(role) || false;
    }

    getUserRole(): string | null {
        const user = this.getCurrentUser();
        if (!user || !user.roles || user.roles.length === 0) {
            return null;
        }

        // Prioritize SUPER_ADMIN
        if (user.roles.includes('SUPER_ADMIN')) {
            return 'SUPER_ADMIN';
        }
        if (user.roles.includes('TENANT_ADMIN') || user.roles.includes('ADMIN')) {
            return 'TENANT_ADMIN';
        }

        return user.roles[0];
    }

    private decodeToken(token: string): UserData | null {
        try {
            const payload = token.split('.')[1];
            const decoded = atob(payload);
            return JSON.parse(decoded);
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }
}
