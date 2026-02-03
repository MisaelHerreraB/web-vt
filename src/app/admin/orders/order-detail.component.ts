import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Back Button -->
            <div class="mb-6">
                <a routerLink="../" class="inline-flex items-center text-terra hover:text-terra/80 font-medium">
                    ← Volver a pedidos
                </a>
            </div>

            @if (loading()) {
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-terra border-t-transparent"></div>
                    <p class="mt-4 text-gray-600">Cargando pedido...</p>
                </div>
            } @else if (order()) {
                <!-- Order Header -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div class="flex justify-between items-start">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">Pedido #{{ order()!.id.substring(0, 8) }}</h1>
                            <p class="text-sm text-gray-600 mt-1">{{ formatDate(order()!.createdAt) }}</p>
                        </div>
                        <span [class]="getStatusBadgeClass(order()!.status)">
                            {{ translateStatus(order()!.status) }}
                        </span>
                    </div>

                    <!-- Status Management -->
                    <div class="mt-6 pt-6 border-t border-gray-200">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Actualizar Estado</label>
                        <div class="flex gap-3">
                            <select [(ngModel)]="newStatus" class="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-terra focus:ring-2 focus:ring-terra/20 outline-none">
                                <option value="PENDING">Pendiente</option>
                                <option value="CONFIRMED">Confirmado</option>
                                <option value="COMPLETED">Completado</option>
                                <option value="CANCELLED">Cancelado</option>
                            </select>
                            <button (click)="updateStatus()" 
                                    [disabled]="updatingStatus()"
                                    class="px-6 py-2 bg-terra text-white rounded-lg hover:bg-terra/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                @if (updatingStatus()) {
                                    Actualizando...
                                } @else {
                                    Actualizar
                                }
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Customer Information -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 class="text-lg font-bold text-gray-900 mb-4">👤 Información del Cliente</h2>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-600">Nombre</p>
                            <p class="font-medium text-gray-900">{{ order()!.customerName }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">DNI</p>
                            <p class="font-medium text-gray-900">{{ order()!.customerDni }}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Teléfono</p>
                            <p class="font-medium text-gray-900">{{ order()!.customerPhone }}</p>
                        </div>
                    </div>
                    @if (order()!.customerNotes) {
                        <div class="mt-4 pt-4 border-t border-gray-200">
                            <p class="text-sm text-gray-600">Notas del cliente</p>
                            <p class="text-gray-900 mt-1">{{ order()!.customerNotes }}</p>
                        </div>
                    }
                </div>

                <!-- Delivery Information -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 class="text-lg font-bold text-gray-900 mb-4">
                        @if (order()!.deliveryMethod === 'PICKUP') {
                            🏪 Recojo en Tienda
                        } @else {
                            🛵 Delivery
                        }
                    </h2>
                    @if (order()!.deliveryMethod === 'DELIVERY') {
                        <div class="space-y-3">
                            <div>
                                <p class="text-sm text-gray-600">Dirección de entrega</p>
                                <p class="font-medium text-gray-900">{{ order()!.deliveryAddress }}</p>
                            </div>
                            @if (order()!.deliveryReference) {
                                <div>
                                    <p class="text-sm text-gray-600">Referencia</p>
                                    <p class="text-gray-900">{{ order()!.deliveryReference }}</p>
                                </div>
                            }
                        </div>
                    } @else {
                        <p class="text-gray-600">El cliente recogerá el pedido en la tienda.</p>
                    }
                </div>

                <!-- Order Items -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 class="text-lg font-bold text-gray-900 mb-4">📦 Productos</h2>
                    <div class="space-y-3">
                        @for (item of order()!.items; track item.id) {
                            <div class="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                                <div class="flex-1">
                                    <p class="font-medium text-gray-900">{{ item.productTitle }}</p>
                                    <p class="text-sm text-gray-600">Cantidad: {{ item.quantity }} × S/ {{ item.productPrice }}</p>
                                </div>
                                <p class="font-bold text-gray-900">S/ {{ item.subtotal }}</p>
                            </div>
                        }
                    </div>
                </div>

                <!-- Pricing Summary -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 class="text-lg font-bold text-gray-900 mb-4">💰 Resumen de Pago</h2>
                    <div class="space-y-2">
                        <div class="flex justify-between text-gray-700">
                            <span>Subtotal</span>
                            <span>S/ {{ order()!.subtotal }}</span>
                        </div>
                        @if (order()!.discount > 0) {
                            <div class="flex justify-between text-green-600">
                                <span>Descuento @if (order()!.coupon) { ({{ order()!.coupon.code }}) }</span>
                                <span>- S/ {{ order()!.discount }}</span>
                            </div>
                        }
                        <div class="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                            <span>Total</span>
                            <span>S/ {{ order()!.total }}</span>
                        </div>
                    </div>
                </div>
            } @else {
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div class="text-6xl mb-4">❌</div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">Pedido no encontrado</h3>
                    <p class="text-gray-600 mb-6">El pedido solicitado no existe o no tienes acceso a él.</p>
                    <a routerLink="../" class="text-terra hover:text-terra/80 font-medium">
                        ← Volver a pedidos
                    </a>
                </div>
            }
        </div>
    </div>
    `,
    styles: []
})
export class OrderDetailComponent implements OnInit {
    private orderService = inject(OrderService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    order = signal<any | null>(null);
    loading = signal(false);
    updatingStatus = signal(false);
    newStatus = '';

    ngOnInit() {
        const orderId = this.route.snapshot.paramMap.get('id');
        if (orderId) {
            this.loadOrder(orderId);
        }
    }

    loadOrder(id: string) {
        this.loading.set(true);
        this.orderService.getOrder(id).subscribe({
            next: (data) => {
                this.order.set(data);
                this.newStatus = data.status;
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading order:', err);
                this.loading.set(false);
            }
        });
    }

    updateStatus() {
        const currentOrder = this.order();
        if (!currentOrder || this.newStatus === currentOrder.status) return;

        this.updatingStatus.set(true);
        this.orderService.updateOrderStatus(currentOrder.id, this.newStatus).subscribe({
            next: (updatedOrder) => {
                this.order.set(updatedOrder);
                this.updatingStatus.set(false);
                alert('Estado actualizado correctamente');
            },
            error: (err) => {
                console.error('Error updating status:', err);
                alert('Error al actualizar el estado');
                this.updatingStatus.set(false);
            }
        });
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    translateStatus(status: string): string {
        const translations: { [key: string]: string } = {
            'PENDING': 'Pendiente',
            'CONFIRMED': 'Confirmado',
            'COMPLETED': 'Completado',
            'CANCELLED': 'Cancelado'
        };
        return translations[status] || status;
    }

    getStatusBadgeClass(status: string): string {
        const baseClasses = 'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium';
        const statusClasses: { [key: string]: string } = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'CONFIRMED': 'bg-blue-100 text-blue-800',
            'COMPLETED': 'bg-green-100 text-green-800',
            'CANCELLED': 'bg-red-100 text-red-800'
        };
        return `${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
    }
}
