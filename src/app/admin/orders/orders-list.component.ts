import { Component, OnInit, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
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
                                @for (order of paginatedOrders(); track order.id) {
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
                                        <td class="px-6 py-4 whitespace-nowrap text-sm flex items-center gap-3">
                                            <a [routerLink]="[order.id]" 
                                               class="text-terra hover:text-terra/80 font-medium">
                                                Ver detalles
                                            </a>
                                            <button (click)="deleteOrder(order.id)" 
                                                    class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                                    title="Eliminar Pedido">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                            </button>
                                        </td>
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination Controls -->
                    <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div class="flex-1 flex justify-between sm:hidden">
                            <button (click)="changePage(currentPage() - 1)" 
                                    [disabled]="currentPage() === 1"
                                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                Anterior
                            </button>
                            <button (click)="changePage(currentPage() + 1)" 
                                    [disabled]="currentPage() === totalPages()"
                                    class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                Siguiente
                            </button>
                        </div>
                        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p class="text-sm text-gray-700">
                                    Mostrando <span class="font-medium">{{ startIndex() + 1 }}</span> a <span class="font-medium">{{ endIndex() }}</span> de <span class="font-medium">{{ filteredOrders().length }}</span> resultados
                                </p>
                            </div>
                            <div>
                                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button (click)="changePage(currentPage() - 1)" 
                                            [disabled]="currentPage() === 1"
                                            class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <span class="sr-only">Anterior</span>
                                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                                        </svg>
                                    </button>
                                    
                                    <!-- Simple logic: just show 1..totalPages for now, scrolling if needed or just numbers -->
                                    <!-- For improved UX we could limit visible pages, but for 'hundreds' (e.g. 50 pages) we might want a limit. Let's keep it simple first or add a basic slice -->
                                    @for (page of visiblePages(); track page) {
                                        <button (click)="changePage(page)" 
                                                [class.bg-terra-50]="currentPage() === page"
                                                [class.text-terra]="currentPage() === page"
                                                [class.border-terra]="currentPage() === page"
                                                [class.bg-white]="currentPage() !== page"
                                                [class.text-gray-500]="currentPage() !== page"
                                                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium hover:bg-gray-50 z-10">
                                            {{ page }}
                                        </button>
                                    }

                                    <button (click)="changePage(currentPage() + 1)" 
                                            [disabled]="currentPage() === totalPages()"
                                            class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <span class="sr-only">Siguiente</span>
                                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
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
    private platformId = inject(PLATFORM_ID);

    orders = signal<any[]>([]);
    filteredOrders = signal<any[]>([]);
    loading = signal(false);

    // Pagination Signals
    currentPage = signal(1);
    itemsPerPage = signal(10);

    // Computed Pagination
    totalPages = computed(() => Math.ceil(this.filteredOrders().length / this.itemsPerPage()));

    paginatedOrders = computed(() => {
        const start = (this.currentPage() - 1) * this.itemsPerPage();
        const end = start + this.itemsPerPage();
        return this.filteredOrders().slice(start, end);
    });

    startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage());

    endIndex = computed(() => {
        const end = this.startIndex() + this.itemsPerPage();
        return end > this.filteredOrders().length ? this.filteredOrders().length : end;
    });

    visiblePages = computed(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        const maxVisible = 5;

        let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
        let endPage = Math.min(total, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    });

    statusFilter = '';
    searchTerm = '';

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.loading.set(true);
        this.orderService.getOrders().subscribe({
            next: (data: any) => {
                this.orders.set(data);
                this.applyFilters();
                this.loading.set(false);
            },
            error: (err: any) => {
                console.error('Error loading orders:', err);
                if (isPlatformBrowser(this.platformId)) {
                    alert('Error al cargar pedidos');
                }
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
        this.currentPage.set(1); // Reset to first page on filter change
    }

    changePage(page: number) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
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

    deleteOrder(id: string) {
        if (!isPlatformBrowser(this.platformId)) return;

        if (!confirm('¿Estás seguro de que deseas eliminar este pedido permanentemente?')) {
            return;
        }

        // Double confirmation for safety
        const verification = prompt('Escribe "ELIMINAR" para confirmar la acción:');
        if (verification !== 'ELIMINAR') {
            alert('Acción cancelada. El texto no coincide.');
            return;
        }

        this.loading.set(true);
        this.orderService.deleteOrder(id).subscribe({
            next: () => {
                const message = 'Pedido eliminado correctamente';
                if (isPlatformBrowser(this.platformId)) alert(message);
                this.loadOrders(); // Refresh list
            },
            error: (err: any) => {
                console.error('Error deleting order:', err);
                const message = 'Error al eliminar el pedido: ' + (err.error?.message || err.message);
                if (isPlatformBrowser(this.platformId)) alert(message);
                this.loading.set(false);
            }
        });
    }
}
