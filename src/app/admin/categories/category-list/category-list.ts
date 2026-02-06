import { Component, inject, OnInit, ChangeDetectorRef, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService, Category } from '../../../services/category.service';
import { FASHION_ICONS } from '../../components/icon-picker/icon-picker';
import { TenantService } from '../../../services/tenant.service'; // Assuming TenantService is needed for the effect

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Categorías</h1>
      <a routerLink="new" class="px-4 py-2 bg-terra text-white rounded-lg hover:bg-terra-800 transition-colors flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nueva Categoría
      </a>
    </div>

    <!-- Loading State -->
    @if (loading()) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center mb-6">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-terra border-t-transparent"></div>
            <p class="mt-4 text-gray-600">Cargando categorías...</p>
        </div>
    }

    <!-- Empty State -->
    @else if (categories().length === 0) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div class="text-6xl mb-4">🏷️</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">No hay categorías</h3>
            <p class="text-gray-600 mb-6">Aún no has creado ninguna categoría.</p>
            <a routerLink="new" class="inline-flex items-center px-4 py-2 bg-terra text-white rounded-lg hover:bg-terra-800 transition-colors">
                Crear primera categoría
            </a>
        </div>
    }

    <!-- Category List -->
    @else {
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
        <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">Icono</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          @for (category of paginatedCategories(); track category.id) {
            <tr class="hover:bg-gray-50/50 transition-colors">
              <td class="px-6 py-4 text-gray-400">
                @if (category.imageUrl) {
                  <div class="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                    <img [src]="category.imageUrl" [alt]="category.name" class="w-full h-full object-cover">
                  </div>
                } @else if (category.iconName) {
                  <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-terra">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path [attr.d]="getIconPath(category.iconName)"/>
                    </svg>
                  </div>
                } @else {
                  <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                    <span class="text-xs">-</span>
                  </div>
                }
              </td>
              <td class="px-6 py-4 font-medium text-gray-900">{{ category.name }}</td>
              <td class="px-6 py-4 text-gray-500">{{ category.slug }}</td>
              <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                  <button 
                    (click)="editCategory(category.id)"
                    class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                  </button>
                  <button
                    (click)="deleteCategory(category)"
                    class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          }
          @if (categories.length === 0) {
            <tr>
              <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                No hay categorías creadas.
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
                        Mostrando <span class="font-medium">{{ startIndex() + 1 }}</span> a <span class="font-medium">{{ endIndex() }}</span> de <span class="font-medium">{{ categories().length }}</span> resultados
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
export class CategoryListComponent implements OnInit {
  categories = signal<Category[]>([]);
  loading = signal(false);
  currentPage = signal(1);
  itemsPerPage = signal(10);

  // Computed Values
  totalPages = computed(() => Math.ceil(this.categories().length / this.itemsPerPage()));

  paginatedCategories = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.categories().slice(start, end);
  });

  startIndex = computed(() => (this.currentPage() - 1) * this.itemsPerPage());

  endIndex = computed(() => {
    const end = this.startIndex() + this.itemsPerPage();
    const total = this.categories().length;
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

  private categoryService = inject(CategoryService);
  private tenantService = inject(TenantService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    // Use effect to watch for tenant changes and load categories when tenant is available
    effect(() => {
      const tenant = this.tenantService.tenant();
      if (tenant) {
        this.loadCategories();
      }
    });
  }

  ngOnInit() {
    // Categories will be loaded by effect when tenant is available
  }

  loadCategories() {
    const slug = this.route.parent?.snapshot.paramMap.get('slug');

    if (slug) {
      this.loading.set(true);
      this.categoryService.getCategories().subscribe({
        next: (data) => {
          this.categories.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('CategoryListComponent: Error', err);
          this.loading.set(false);
        }
      });
    }
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  getIconPath(iconName: string): string {
    const icon = FASHION_ICONS.find(i => i.name === iconName);
    return icon ? icon.path : '';
  }

  editCategory(categoryId: string) {
    this.router.navigate([categoryId], { relativeTo: this.route });
  }

  deleteCategory(category: Category) {
    if (!confirm(`¿Estás seguro de que deseas eliminar la categoría "${category.name}" ?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    const slug = this.route.parent?.snapshot.paramMap.get('slug');
    if (slug) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          // Remove category from list
          this.categories.update(current => current.filter(c => c.id !== category.id));

          alert('Categoría eliminada correctamente');
        },
        error: (err) => {
          console.error('Error deleting category:', err);
          alert('Error al eliminar la categoría');
        }
      });
    }
  }
}
