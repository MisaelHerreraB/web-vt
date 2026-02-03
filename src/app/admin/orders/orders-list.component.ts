import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { CsvExportService } from '../../services/csv-export.service';

@Component({
    selector: 'app-orders-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900">📦 Gestión de Pedidos</h1>
                <p class="mt-2 text-sm text-gray-600">Administra y revisa todos los pedidos de tus clientes</p>
            </div>

            <!-- Filters & Actions -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <!-- Status Filter -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                        <select [(ngModel)]="statusFilter" (change)="applyFilters()" 
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-terra focus:ring-2 focus:ring-terra/20 outline-none">
                            <option value="">Todos</option>
                            <option value="PENDING">Pendiente</option>
                            <option value="CONFIRMED">Confirmado</option>
                            <option value="COMPLETED">Completado</option>
                            <option value="CANCELLED">Cancelado</option>
                        </select>
                    </div>

                    <!-- Search -->
                    <div class="md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                        <input type="text" [(ngModel)]="searchTerm" (input)="applyFilters()" 
                               placeholder="Nombre, DNI o ID de pedido..."
                               class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-terra focus:ring-2 focus:ring-terra/20 outline-none">
                    </div>

                    <!-- Export Button -->
                    <div class="flex items-end">
                        <button (click)="exportToCSV()" 
                                class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                            📥 Exportar CSV
                        </button>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            @if (loading()) {
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-terra border-t-transparent"></div>
                    <p class="mt-4 text-gray-600">Cargando pedidos...</p>
                </div>
            }

            <!-- Empty State -->
            @else if (filteredOrders().length === 0) {
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div class="text-6xl mb-4">📦</div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">No hay pedidos</h3>
                    <p class="text-gray-600">
                        @if (statusFilter || searchTerm) {
                            No se encontraron pedidos con los filtros aplicados.
                        } @else {
                            Aún no has recibido ningún pedido.
                        }
                    </p>
                </div>
            }

            <!-- Orders Table -->
            @else {
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Pedido</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                @for (order of filteredOrders(); track order.id) {
                                    <tr class="hover:bg-gray-50 transition-colors">
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{{ order.id.substring(0, 8) }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {{ formatDate(order.createdAt) }}
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-900">
                                            <div class="font-medium">{{ order.customerName }}</div>
                                            <div class="text-gray-500">{{ order.customerPhone }}</div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            @if (order.deliveryMethod === 'PICKUP') {
                                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    🏪 Recojo
                                                </span>
                                            } @else {
                                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    🛵 Delivery
                                                </span>
                                            }
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                            S/ {{ order.total }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span [class]="getStatusBadgeClass(order.status)">
                                                {{ translateStatus(order.status) }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                                            <a [routerLink]="[order.id]" 
                                               class="text-terra hover:text-terra/80 font-medium">
                                                Ver detalles →
                                            </a>
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination Info -->
                    <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
                        <p class="text-sm text-gray-600">
                            Mostrando <span class="font-medium">{{ filteredOrders().length }}</span> pedido(s)
                        </p>
                    </div>
                </div>
            }
        </div>
    </div>
    `,
    styles: []
})
export class OrdersListComponent implements OnInit {
    private orderService = inject(OrderService);
    private csvService = inject(CsvExportService);
    private router = inject(Router);

    orders = signal<any[]>([]);
    filteredOrders = signal<any[]>([]);
    loading = signal(false);

    statusFilter = '';
    searchTerm = '';

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.loading.set(true);
        this.orderService.getOrders().subscribe({
            next: (data) => {
                this.orders.set(data);
                this.applyFilters();
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading orders:', err);
                alert('Error al cargar pedidos');
                this.loading.set(false);
            }
        });
    }

    applyFilters() {
        let filtered = [...this.orders()];

        // Status filter
        if (this.statusFilter) {
            filtered = filtered.filter(order => order.status === this.statusFilter);
        }

        // Search filter
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(order =>
                order.customerName?.toLowerCase().includes(term) ||
                order.customerDni?.toLowerCase().includes(term) ||
                order.id?.toLowerCase().includes(term)
            );
        }

        this.filteredOrders.set(filtered);
    }

    exportToCSV() {
        const filename = `pedidos_${new Date().toISOString().split('T')[0]}.csv`;
        this.csvService.exportOrders(this.filteredOrders(), filename);
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'short',
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
        const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium';
        const statusClasses: { [key: string]: string } = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'CONFIRMED': 'bg-blue-100 text-blue-800',
            'COMPLETED': 'bg-green-100 text-green-800',
            'CANCELLED': 'bg-red-100 text-red-800'
        };
        return `${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`;
    }
}
