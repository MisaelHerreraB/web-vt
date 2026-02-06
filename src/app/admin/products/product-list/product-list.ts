import { Component, inject, OnInit, ChangeDetectorRef, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../services/product.service';
import { TenantService, Tenant } from '../../../services/tenant.service';
import { getCurrencySymbol } from '../../../constants/currencies';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Productos</h1>
        <a routerLink="new" class="px-4 py-2 bg-terra text-white rounded-lg hover:bg-terra-800 transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Producto
        </a>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Buscar Producto</label>
        <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
            </div>
            <input type="text" 
                   [ngModel]="searchTerm()" 
                   (ngModelChange)="updateSearch($event)"
                   placeholder="Buscar por nombre o descripción..."
                   class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-terra focus:border-terra sm:text-sm transition duration-150 ease-in-out">
        </div>
    </div>

    <!-- Loading State -->
    @if (loading()) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-terra border-t-transparent"></div>
            <p class="mt-4 text-gray-600">Cargando productos...</p>
        </div>
    } 
    
    <!-- Empty State -->
    @else if (products().length === 0) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div class="text-6xl mb-4">🛍️</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">No hay productos</h3>
            <p class="text-gray-600 mb-6">Aún no has creado ningún producto para tu tienda.</p>
            <a routerLink="new" class="inline-flex items-center px-4 py-2 bg-terra text-white rounded-lg hover:bg-terra-800 transition-colors">
                Crear primer producto
            </a>
        </div>
    }

    <!-- Product List -->
    @else {
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Precio</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                        <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    @for (product of paginatedProducts(); track product.id) {
                        <tr class="hover:bg-gray-50/50 transition-colors">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded bg-gray-100 flex-shrink-0 overflow-hidden">
                                       @if (product.images?.[0] || product.imageUrl) {
                                           <img [src]="product.images?.[0] || product.imageUrl" class="w-full h-full object-cover">
                                       } @else {
                                           <div class="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-50">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                           </div>
                                       }
                                    </div>
                                    <div>
                                        <p class="font-medium text-gray-900">{{ product.title }}</p>
                                        <p class="text-xs text-gray-500 truncate max-w-[200px]">{{ product.description }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-gray-600">{{ product.price | currency : getSymbol(tenant?.currency) }}</td>
                            <td class="px-6 py-4 text-gray-600">
                               @if (product.variants?.length) {
                                 <span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">{{ getTotalVariantStock(product) }} (Var)</span>
                               } @else {
                                 {{ product.stock }}
                               }
                            </td>
                            <td class="px-6 py-4 text-right">
                               <div class="flex items-center justify-end gap-2">
                                   <a [routerLink]="['../products', product.id]" title="Editar" class="text-gray-400 hover:text-terra transition-colors p-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                   </a>
                                   <button (click)="deleteProduct(product.id)" title="Eliminar" class="text-gray-400 hover:text-red-600 transition-colors p-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                   </button>
                               </div>
                            </td>
                        </tr>
                    }
                    @if (products().length === 0) {
                        <tr>
                            <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                                No hay productos creados.
                            </td>
                        </tr>
                    } @else if (paginatedProducts().length === 0) {
                        <tr>
                            <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                                No se encontraron productos con el filtro actual.
                            </td>
                        </tr>
                    }
                </tbody>
            </table>
        </div>


        <!-- Pagination Controls -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between mt-auto">
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
                        Mostrando <span class="font-medium">{{ startIndex() + 1 }}</span> a <span class="font-medium">{{ endIndex() }}</span> de <span class="font-medium">{{ filteredProducts().length }}</span> resultados
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
  `
})
export class ProductListComponent implements OnInit {
  // Signals State
  products = signal<Product[]>([]);
  searchTerm = signal('');
  currentPage = signal(1);

  itemsPerPage = signal(10);
  loading = signal(false);

  tenant: Tenant | null = null;
  private productService = inject(ProductService);
  private tenantService = inject(TenantService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef); // Still useful for manual triggers if needed, though signals handle most

  // Computed Values
  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.products();

    return this.products().filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term)
    );
  });

  totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.itemsPerPage()));

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredProducts().slice(start, end);
  });

  startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage());

  endIndex = computed(() => {
    const end = this.startIndex() + this.itemsPerPage();
    const total = this.filteredProducts().length;
    return end > total ? total : end;
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

  ngOnInit() {
    const slug = this.route.parent?.snapshot.paramMap.get('slug');
    console.log('ProductListComponent: Checking slug from parent route:', slug);

    if (slug) {
      this.tenantService.getTenant(slug).subscribe({
        next: (data) => {
          this.tenant = data;
          this.loadProducts();
        },
        error: (err) => {
          console.error('ProductListComponent: Error loading tenant', err);
        }
      });
    } else {
      console.error('ProductListComponent: No slug found in route params');
    }
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (products) => {
        console.log('ProductListComponent: Received products:', products);
        this.products.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('ProductListComponent: Error fetching products:', err);
        this.loading.set(false);
      }
    });
  }

  updateSearch(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1); // Reset to first page on search
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getTotalVariantStock(product: Product): number {
    if (!product.variants) return 0;
    return product.variants.reduce((acc, v) => acc + v.stock, 0);
  }

  deleteProduct(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        // Update signal
        this.products.update(current => current.filter(p => p.id !== id));
      },
      error: (err) => {
        console.error('Error deleting product', err);
        alert('Error al eliminar producto');
      }
    });
  }

  getSymbol(code: string | undefined): string {
    return getCurrencySymbol(code);
  }
}
