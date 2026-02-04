import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RUNTIME_CONFIG } from '../config/runtime-config';
import { TenantService } from './tenant.service';

export interface Category {
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
    iconName?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private http = inject(HttpClient);
    private tenantService = inject(TenantService);
    private apiUrl = inject(RUNTIME_CONFIG).apiUrl;

    private getHeaders() {
        const tenant = this.tenantService.tenant();
        return {
            headers: {
                'x-tenant-slug': tenant?.slug || ''
            }
        };
    }

    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.apiUrl}/categories`, this.getHeaders());
    }

    createCategory(formData: FormData): Observable<Category> {
        return this.http.post<Category>(`${this.apiUrl}/categories`, formData, this.getHeaders());
    }

    getCategory(id: string): Observable<Category> {
        return this.http.get<Category>(`${this.apiUrl}/categories/${id}`, this.getHeaders());
    }

    updateCategory(id: string, formData: FormData): Observable<Category> {
        return this.http.patch<Category>(`${this.apiUrl}/categories/${id}`, formData, this.getHeaders());
    }

    deleteCategory(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/categories/${id}`, this.getHeaders());
    }
}
