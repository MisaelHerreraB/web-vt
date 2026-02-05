import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RUNTIME_CONFIG } from '../config/runtime-config';

export interface Tenant {
    id: string;
    // ... same interfaces
    name: string;
    slug: string;
    phoneNumber?: string;
    address?: string;
    bio?: string;
    socialFacebook?: string;
    socialInstagram?: string;
    socialTiktok?: string;
    socialYoutube?: string;
    socialWhatsapp?: string;
    socialFacebookEnabled?: boolean;
    socialInstagramEnabled?: boolean;
    socialTiktokEnabled?: boolean;
    socialYoutubeEnabled?: boolean;
    socialWhatsappEnabled?: boolean;
    logoUrl?: string;
    coverUrl?: string;
    currency?: string;
    headerLayout?: 'compact' | 'overlay' | 'minimal';
    whatsapp?: string; // WhatsApp specific number
    phone?: string;    // Fallback phone
    openingHours?: { day: string; open: string; close: string; isOpen: boolean }[];
    announcementText?: string;
    announcementEnabled?: boolean;
    announcementBgColor?: string;
    announcementTextColor?: string;
    announcementSpeed?: 'slow' | 'normal' | 'fast';
    welcomePopupEnabled?: boolean;
    welcomePopupTitle?: string;
    welcomePopupContent?: string;
    lowStockThreshold?: number;

    paymentMethods?: { type: string; name: string; number?: string; instruction?: string; isActive: boolean }[];
    themePrimaryColor?: string;
    themeSecondaryColor?: string;
    wholesaleEnabled?: boolean;
    useStockControl?: boolean; // Global stock control setting
}

export interface CreateFullTenantDto {
    name: string;
    slug: string;
    adminEmail: string;
    adminPassword: string;
    adminName: string;
    planId: string;
    currency?: string;
}

@Injectable({
    providedIn: 'root'
})
export class TenantService {
    private apiUrl = inject(RUNTIME_CONFIG).apiUrl;
    tenant = signal<Tenant | null>(null);

    constructor(private http: HttpClient) { }

    getTenant(slug: string): Observable<Tenant> {
        return this.http.get<Tenant>(`${this.apiUrl}/tenants/${slug}`).pipe(
            tap(tenant => this.tenant.set(tenant))
        );
    }

    getTenantById(id: string): Observable<Tenant> {
        return this.http.get<Tenant>(`${this.apiUrl}/tenants/id/${id}`).pipe(
            tap(tenant => this.tenant.set(tenant))
        );
    }

    updateTenant(id: string, formData: FormData): Observable<Tenant> {
        return this.http.patch<Tenant>(`${this.apiUrl}/tenants/${id}`, formData).pipe(
            tap(tenant => this.tenant.set(tenant))
        );
    }

    createTenantWithUser(data: CreateFullTenantDto): Observable<Tenant> {
        return this.http.post<Tenant>(`${this.apiUrl}/tenants/with-user`, data);
    }

    getTenants(): Observable<Tenant[]> {
        return this.http.get<Tenant[]>(`${this.apiUrl}/tenants`);
    }

    /**
     * Check if a slug is available
     * @param slug The slug to check
     * @returns Observable with availability status
     */
    checkSlugAvailability(slug: string): Observable<{ available: boolean; slug: string }> {
        return this.http.get<{ available: boolean; slug: string }>(
            `${this.apiUrl}/tenants/check-slug/${slug}`
        );
    }
}
