import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RUNTIME_CONFIG } from '../config/runtime-config';
import { tap } from 'rxjs/operators';
import { TenantService } from './tenant.service';

export interface VariantOptionValue {
    id: string;
    name: string;
    price: number;
}

export interface VariantOption {
    id: string;
    name: string;
    values: VariantOptionValue[];
}

export interface ProductVariant {
    id: string;
    name: string;
    value: string;
    price: number;
    stock: number;
    imageIndexes?: number[];
    options?: VariantOption[];
}

export interface Product {
    id: string; // or number based on previous step. API uses UUID string.
    title: string;
    description: string;
    price: number;
    stock: number;
    imageUrl?: string;
    images?: string[];  // Array de URLs de imágenes
    category?: string;
    variants?: ProductVariant[];
    tenant_id: string;
    ignoreStock?: boolean;
    urgencyOverride?: boolean;
    showStockQuantity?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private http = inject(HttpClient);
    private tenantService = inject(TenantService);
    private apiUrl = inject(RUNTIME_CONFIG).apiUrl;

    // Simple in-memory cache: key -> { timestamp, data }
    private productsCache = new Map<string, { timestamp: number, data: Product[] }>();
    private CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    private getHeaders() {
        const tenant = this.tenantService.tenant();
        return {
            headers: {
                'x-tenant-slug': tenant?.slug || ''
            }
        };
    }

    getProducts(categoryId?: string, search?: string): Observable<Product[]> {
        const tenant = this.tenantService.tenant();
        if (!tenant) return new Observable(obs => obs.next([]));

        const cacheKey = `${tenant.id}-${categoryId || 'all'}-${search || 'none'}`;
        const cached = this.productsCache.get(cacheKey);
        const now = Date.now();

        // Check cache validity (simple strategy)
        if (cached && (now - cached.timestamp < this.CACHE_TTL)) {
            // Return cached data immediately, but we could also revalidate in background if needed.
            // For this use case (instant back nav), returning cached is the priority.
            return new Observable(obs => {
                obs.next(cached.data);
                obs.complete();
            });
        }

        let url = `${this.apiUrl}/products`;

        const params: any = {};
        if (categoryId) params.categoryId = categoryId;
        if (search) params.search = search;

        return this.http.get<Product[]>(url, { ...this.getHeaders(), params }).pipe(
            tap(data => {
                this.productsCache.set(cacheKey, { timestamp: Date.now(), data });
            })
        );
    }

    getProduct(id: string): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/products/${id}`, this.getHeaders());
    }

    // Helper to clear cache
    private clearCache() {
        this.productsCache.clear();
    }

    createProduct(formData: FormData): Observable<Product> {
        // Content-Type is multipart/form-data, but Angular sets it automatically when passing FormData
        return this.http.post<Product>(`${this.apiUrl}/products`, formData, this.getHeaders()).pipe(
            tap(() => this.clearCache())
        );
    }

    updateProduct(id: string, formData: FormData): Observable<Product> {
        return this.http.patch<Product>(`${this.apiUrl}/products/${id}`, formData, this.getHeaders()).pipe(
            tap(() => this.clearCache())
        );
    }

    uploadProductImages(productId: string, images: File[]): Observable<{ message: string; images: string[]; totalImages: number }> {
        const formData = new FormData();

        images.forEach(image => {
            formData.append('images', image);
        });

        return this.http.post<{ message: string; images: string[]; totalImages: number }>(
            `${this.apiUrl}/products/${productId}/upload-images`,
            formData,
            this.getHeaders()
        ).pipe(
            tap(() => this.clearCache())
        );
    }

    // Update product with partial data (e.g., just images array)
    updateProductImages(productId: string, data: Partial<Product>): Observable<Product> {
        const tenant = this.tenantService.tenant();
        const headers = new HttpHeaders()
            .set('x-tenant-slug', tenant?.slug || '')
            .set('Content-Type', 'application/json');
        return this.http.patch<Product>(`${this.apiUrl}/products/${productId}`, data, { headers }).pipe(
            tap(() => this.clearCache())
        );
    }

    deleteProduct(id: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/products/${id}`, this.getHeaders()).pipe(
            tap(() => this.clearCache())
        );
    }

    // Delete a single image from R2 storage
    deleteImage(imageUrl: string): Observable<{ message: string; deletedUrl: string }> {
        const tenant = this.tenantService.tenant();
        const headers = new HttpHeaders()
            .set('x-tenant-slug', tenant?.slug || '')
            .set('Content-Type', 'application/json');
        return this.http.request<{ message: string; deletedUrl: string }>('DELETE', `${this.apiUrl}/products/image`, {
            headers,
            body: { imageUrl }
        }).pipe(
            tap(() => this.clearCache())
        );
    }
}
