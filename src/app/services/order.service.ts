import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RUNTIME_CONFIG } from '../config/runtime-config';
import { TenantService } from './tenant.service';

export interface OrderItemDto {
    productTitle: string;
    productPrice: number;
    quantity: number;
    subtotal: number;
}

export interface CreateOrderDto {
    customerName: string;
    customerDni: string;
    customerPhone: string;
    customerNotes?: string;
    deliveryMethod: 'PICKUP' | 'DELIVERY';
    deliveryAddress?: string;
    deliveryReference?: string;
    items: OrderItemDto[];
    subtotal: number;
    discount: number;
    total: number;
    couponCode?: string;
    captchaToken: string;
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private http = inject(HttpClient);
    private tenantService = inject(TenantService);
    private apiUrl = `${inject(RUNTIME_CONFIG).apiUrl}/orders`;

    private getHeaders() {
        const tenant = this.tenantService.tenant();
        return {
            headers: {
                'x-tenant-slug': tenant?.slug || ''
            }
        };
    }

    createOrder(orderData: CreateOrderDto): Observable<any> {
        return this.http.post<any>(this.apiUrl, orderData, this.getHeaders());
    }

    getOrders(status?: string): Observable<any[]> {
        const url = status ? `${this.apiUrl}?status=${status}` : this.apiUrl;
        return this.http.get<any[]>(url, this.getHeaders());
    }

    getOrder(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`, this.getHeaders());
    }

    updateOrderStatus(id: string, status: string): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { status }, this.getHeaders());
    }

    deleteOrder(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getHeaders());
    }
}
