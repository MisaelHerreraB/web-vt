import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TenantService } from './tenant.service';

export enum CouponType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED_AMOUNT = 'FIXED_AMOUNT'
}

export interface Coupon {
    id: string;
    code: string;
    type: CouponType;
    value: number;
    minPurchaseAmount?: number;
    startDate?: string;
    endDate?: string;
    usageLimit?: number;
    usageCount: number;
    isActive: boolean;
    createdAt: string;
}

export interface CouponValidationResult {
    isValid: boolean;
    code: string;
    type: CouponType;
    value: number;
    discountAmount: number;
    finalTotal: number;
}

@Injectable({
    providedIn: 'root'
})
export class CouponService {
    private http = inject(HttpClient);
    private tenantService = inject(TenantService);
    private apiUrl = `${environment.apiUrl}/coupons`;

    appliedCoupon = signal<CouponValidationResult | null>(null);

    private getHeaders() {
        const tenant = this.tenantService.tenant();
        return {
            headers: {
                'x-tenant-slug': tenant?.slug || ''
            }
        };
    }

    getCoupons(): Observable<Coupon[]> {
        return this.http.get<Coupon[]>(this.apiUrl, this.getHeaders());
    }

    createCoupon(data: any): Observable<Coupon> {
        return this.http.post<Coupon>(this.apiUrl, data, this.getHeaders());
    }

    toggleStatus(id: string): Observable<Coupon> {
        return this.http.patch<Coupon>(`${this.apiUrl}/${id}/toggle`, {}, this.getHeaders());
    }

    deleteCoupon(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getHeaders());
    }

    validateCoupon(code: string, cartTotal: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/validate`, { code, cartTotal }, this.getHeaders()).pipe(
            tap((result: any) => {
                // If invalid, clear it
                if (!result.isValid) {
                    this.removeCoupon();
                }
            })
        );
    }

    redeemCoupon(code: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/redeem/${code}`, {}, this.getHeaders());
    }

    applyCouponResult(result: any) {
        this.appliedCoupon.set(result);
    }

    removeCoupon() {
        this.appliedCoupon.set(null);
    }
}
