import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Plan {
    id: string;
    name: string;
    displayName: string;
    priceMonthly: number;
    priceAnnual: number;
    maxProducts: number | null;
    maxBandwidth: number | null;
    hasPremiumFeatures: boolean;
    features: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable({
    providedIn: 'root'
})
export class PlanService {
    private apiUrl = `${environment.apiUrl}/plans`;

    constructor(private http: HttpClient) { }

    getAllPlans(): Observable<Plan[]> {
        return this.http.get<Plan[]>(`${this.apiUrl}/all`);
    }

    getActivePlans(): Observable<Plan[]> {
        return this.http.get<Plan[]>(this.apiUrl);
    }

    getPlan(id: string): Observable<Plan> {
        return this.http.get<Plan>(`${this.apiUrl}/${id}`);
    }

    createPlan(plan: Partial<Plan>): Observable<Plan> {
        return this.http.post<Plan>(this.apiUrl, plan);
    }

    updatePlan(id: string, plan: Partial<Plan>): Observable<Plan> {
        return this.http.patch<Plan>(`${this.apiUrl}/${id}`, plan);
    }

    togglePlanStatus(id: string): Observable<Plan> {
        return this.http.patch<Plan>(`${this.apiUrl}/${id}/toggle`, {});
    }

    deletePlan(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
