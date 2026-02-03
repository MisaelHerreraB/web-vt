import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CouponService, Coupon, CouponType } from '../../../services/coupon.service';
import { TenantService } from '../../../services/tenant.service';

@Component({
    selector: 'app-promotions',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-900">Promociones y Cupones</h1>
            <button (click)="openCreateModal()" class="px-4 py-2 bg-terra text-white rounded-lg hover:bg-terra-800 transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Crear Cupón
            </button>
        </div>

        <!-- Coupons List -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table class="w-full text-left">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Código</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Descuento</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Restricciones</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Uso</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @for (coupon of coupons(); track coupon.id) {
                        <tr class="hover:bg-gray-50/50 transition-colors">
                            <td class="px-6 py-4">
                                <span class="font-mono font-bold text-terra bg-terra/10 px-2 py-1 rounded">{{ coupon.code }}</span>
                            </td>
                            <td class="px-6 py-4">
                                @if (coupon.type === 'PERCENTAGE') {
                                    <span class="font-medium">{{ coupon.value }}% OFF</span>
                                } @else {
                                    <span class="font-medium">\${{ coupon.value }} OFF</span>
                                }
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">
                                <div *ngIf="coupon.minPurchaseAmount">Mín: \${{ coupon.minPurchaseAmount }}</div>
                                <div *ngIf="coupon.usageLimit">Límite: {{ coupon.usageLimit }} usos</div>
                                <div *ngIf="coupon.endDate">Vence: {{ coupon.endDate | date }}</div>
                                <div *ngIf="!coupon.minPurchaseAmount && !coupon.usageLimit && !coupon.endDate" class="text-gray-400 italic">Sin restricciones</div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600">
                                {{ coupon.usageCount }} veces
                            </td>
                            <td class="px-6 py-4">
                                <button (click)="toggleStatus(coupon)" 
                                        [class]="coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                                        class="px-2 py-1 rounded-full text-xs font-medium transition-colors">
                                    {{ coupon.isActive ? 'Activo' : 'Inactivo' }}
                                </button>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <button (click)="deleteCoupon(coupon)" class="text-gray-400 hover:text-red-500 p-1 transition-colors" title="Eliminar">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                </button>
                            </td>
                        </tr>
                    }
                    @if (coupons().length === 0) {
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center text-gray-400">
                                No hay cupones creados aún.
                            </td>
                        </tr>
                    }
                </tbody>
            </table>
        </div>
    </div>

    <!-- Create Coupon Modal -->
    @if (showModal) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
                <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 class="font-bold text-lg text-gray-900">Crear Nuevo Cupón</h3>
                    <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                
                <div class="p-6 space-y-4">
                    <!-- Code -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Código del Cupón</label>
                        <input [(ngModel)]="newCoupon.code" type="text" placeholder="Ej. VERANO2026" class="uppercase w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terra/20 focus:border-terra outline-none">
                    </div>

                    <!-- Type & Value -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select [(ngModel)]="newCoupon.type" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terra/20 focus:border-terra outline-none">
                                <option value="PERCENTAGE">Porcentaje (%)</option>
                                <option value="FIXED_AMOUNT">Monto Fijo ($)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                            <input [(ngModel)]="newCoupon.value" type="number" min="0" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-terra/20 focus:border-terra outline-none">
                        </div>
                    </div>

                    <!-- Restrictions -->
                    <div class="space-y-3 pt-2 border-t border-gray-100">
                        <p class="text-xs font-bold text-gray-500 uppercase tracking-wide">Restricciones (Opcional)</p>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs text-gray-600 mb-1">Compra Mínima ($)</label>
                                <input [(ngModel)]="newCoupon.minPurchaseAmount" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            </div>
                            <div>
                                <label class="block text-xs text-gray-600 mb-1">Límite de Usos</label>
                                <input [(ngModel)]="newCoupon.usageLimit" type="number" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs text-gray-600 mb-1">Fecha de Expiración</label>
                            <input [(ngModel)]="newCoupon.endDate" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        </div>
                    </div>
                </div>

                <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                    <button (click)="closeModal()" class="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors">Cancelar</button>
                    <button (click)="createCoupon()" 
                            [disabled]="!isValidForm() || loading"
                            class="px-6 py-2 bg-terra text-white rounded-lg font-bold hover:bg-terra-800 transition-colors disabled:opacity-50 flex items-center gap-2">
                        @if (loading) {
                            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        }
                        {{ loading ? 'Guardando...' : 'Crear Cupón' }}
                    </button>
                </div>
            </div>
        </div>
    }
  `,
    styles: [`
    .animate-fade-in {
        animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class PromotionsComponent {
    couponService = inject(CouponService);
    tenantService = inject(TenantService);
    coupons = signal<Coupon[]>([]);

    showModal = false;
    loading = false;

    newCoupon = {
        code: '',
        type: 'PERCENTAGE',
        value: 0,
        minPurchaseAmount: null,
        usageLimit: null,
        endDate: null
    };

    constructor() {
        effect(() => {
            const tenant = this.tenantService.tenant();
            if (tenant) {
                this.loadCoupons();
            }
        });
    }

    loadCoupons() {
        this.couponService.getCoupons().subscribe({
            next: (data: Coupon[]) => this.coupons.set(data),
            error: (err: any) => console.error('Error loading coupons', err)
        });
    }

    openCreateModal() {
        this.resetForm();
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    resetForm() {
        this.newCoupon = {
            code: '',
            type: CouponType.PERCENTAGE, // Keep as enum
            value: 0,
            minPurchaseAmount: null,
            usageLimit: null,
            endDate: null
        };
    }

    isValidForm() {
        return this.newCoupon.code.length >= 3 && this.newCoupon.value > 0;
    }

    createCoupon() {
        if (!this.isValidForm()) return;

        this.loading = true;
        this.couponService.createCoupon(this.newCoupon).subscribe({
            next: (coupon: Coupon) => {
                this.coupons.update(list => [coupon, ...list]);
                this.closeModal();
                this.loading = false;
                alert('Cupón creado exitosamente');
            },
            error: (err: any) => {
                console.error('Error creating coupon', err);
                alert(err.error?.message || 'Error al crear el cupón');
                this.loading = false;
            }
        });
    }

    toggleStatus(coupon: Coupon) {
        this.couponService.toggleStatus(coupon.id).subscribe({
            next: (updated: Coupon) => {
                this.coupons.update(list => list.map(c => c.id === updated.id ? updated : c));
            },
            error: (err: any) => alert('Error al cambiar estado')
        });
    }

    deleteCoupon(coupon: Coupon) {
        if (confirm(`¿Eliminar cupón "${coupon.code}"?`)) {
            this.couponService.deleteCoupon(coupon.id).subscribe({
                next: () => {
                    this.coupons.update(list => list.filter(c => c.id !== coupon.id));
                },
                error: (err: any) => alert('Error al eliminar cupón')
            });
        }
    }
}
