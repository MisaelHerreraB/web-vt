import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plan } from './plan.service';

export interface Subscription {
    id: string;
    tenantId: string;
    planId: string;
    plan: Plan;
    startDate: Date;
    endDate: Date | null;
    billingCycle: 'monthly' | 'annual';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateSubscriptionDto {
    tenantId: string;
    planId: string;
    billingCycle: 'monthly' | 'annual';
    startDate?: string;
    endDate?: string;
}

export interface ChangePlanDto {
    planId: string;
}

@Injectable({
    providedIn: 'root'
})
export class SubscriptionService {
    private apiUrl = 'http://localhost:3000/subscriptions';

    constructor(private http: HttpClient) { }

    assignPlan(dto: CreateSubscriptionDto): Observable<Subscription> {
        return this.http.post<Subscription>(this.apiUrl, dto);
    }

    changePlan(tenantId: string, dto: ChangePlanDto): Observable<Subscription> {
        return this.http.patch<Subscription>(`${this.apiUrl}/tenant/${tenantId}/change-plan`, dto);
    }

    getSubscription(tenantId: string): Observable<Subscription | null> {
        return this.http.get<Subscription | null>(`${this.apiUrl}/tenant/${tenantId}`);
    }

    getSubscriptionHistory(tenantId: string): Observable<Subscription[]> {
        return this.http.get<Subscription[]>(`${this.apiUrl}/tenant/${tenantId}/history`);
    }

    renewSubscription(subscriptionId: string): Observable<Subscription> {
        return this.http.patch<Subscription>(`${this.apiUrl}/${subscriptionId}/renew`, {});
    }

    getAllSubscriptions(): Observable<Subscription[]> {
        return this.http.get<Subscription[]>(this.apiUrl);
    }
}
