import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService, Product } from '../../../services/product.service';
import { TenantService, Tenant } from '../../../services/tenant.service';
import { getCurrencySymbol } from '../../../constants/currencies';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Productos</h1>
        <a routerLink="new" class="px-4 py-2 bg-terra text-white rounded-lg hover:bg-terra-800 transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Producto
        </a>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                @for (product of products; track product.id) {
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
                @if (products.length === 0) {
                    <tr>
                        <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                            No hay productos creados.
                        </td>
                    </tr>
                }
            </tbody>
        </table>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  tenant: Tenant | null = null;
  private productService = inject(ProductService);
  private tenantService = inject(TenantService);
  private route = inject(ActivatedRoute);

  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    const slug = this.route.parent?.snapshot.paramMap.get('slug');
    console.log('ProductListComponent: Checking slug from parent route:', slug);

    if (slug) {
      console.log('ProductListComponent: Fetching products for slug:', slug);
      this.tenantService.getTenant(slug).subscribe({
        next: (data) => {
          this.tenant = data;
          console.log('ProductListComponent: Tenant loaded, fetching products...');

          this.productService.getProducts().subscribe({
            next: (products) => {
              console.log('ProductListComponent: Received products:', products);
              this.products = products;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('ProductListComponent: Error fetching products:', err);
            }
          });

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('ProductListComponent: Error loading tenant', err);
        }
      });
    } else {
      console.error('ProductListComponent: No slug found in route params');
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
        this.products = this.products.filter(p => p.id !== id);
        this.cdr.detectChanges();
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
