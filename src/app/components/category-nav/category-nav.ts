import { Component, EventEmitter, Input, OnInit, OnChanges, SimpleChanges, Output, inject, ChangeDetectorRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService, Category } from '../../services/category.service';
import { TenantService } from '../../services/tenant.service';
import { FASHION_ICONS } from '../../admin/components/icon-picker/icon-picker';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-category-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative z-[5] bg-white/95 backdrop-blur-sm shadow-sm overflow-hidden border-b border-gray-100">
      <div class="container mx-auto px-1 sm:px-4 py-4 overflow-x-auto no-scrollbar flex gap-4 sm:gap-6 snap-x items-start min-h-[120px]">
        
        <!-- Skeleton Loading -->
        @if (loading) {
            @for (item of [1,2,3,4,5]; track item) {
                <div class="flex flex-col items-center gap-2 shrink-0 animate-pulse">
                    <div class="w-[72px] h-[72px] rounded-full bg-gray-200"></div>
                    <div class="w-12 h-3 bg-gray-200 rounded"></div>
                </div>
            }
        }
        <!-- Always show content if we have categories or if not loading -->
        @if (!loading || categories.length > 0) {
            <!-- ALL Categories Option -->
            <button (click)="selectCategory(null)"
                    [class.active-cat]="selectedId === null"
                    class="flex flex-col items-center gap-2 group snap-center shrink-0 transition-transform duration-300 mt-2 p-1">
                 <div class="w-[72px] h-[72px] rounded-full p-[2px] transition-all duration-300 shadow-sm group-hover:shadow-md"
                      [class.bg-gradient-to-tr]="selectedId === null"
                      [class.from-terra]="selectedId === null"
                      [class.to-orange-400]="selectedId === null"
                      [class.scale-110]="selectedId === null"
                      [class.bg-gray-200]="selectedId !== null">
                    <div class="w-full h-full bg-white rounded-full p-[3px] flex items-center justify-center">
                        <div class="w-full h-full bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                             <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Todos</span>
                        </div>
                    </div>
                 </div>
                 <span class="text-xs font-medium text-gray-700 truncate max-w-[74px] transition-colors mt-1"
                       [class.font-bold]="selectedId === null"
                       [class.text-terra]="selectedId === null">
                     Ver Todo
                 </span>
            </button>

            @for (cat of categories; track cat.id) {
              <button (click)="selectCategory(cat.id)"
                      [class.active-cat]="selectedId === cat.id"
                      class="flex flex-col items-center gap-2 group snap-center shrink-0 transition-transform duration-300 mt-2 p-1">
                   <!-- Ring Container -->
                   <div class="w-[72px] h-[72px] rounded-full p-[2px] transition-all duration-300 shadow-sm group-hover:shadow-md"
                        [class.bg-gradient-to-tr]="selectedId === cat.id"
                        [class.from-terra]="selectedId === cat.id"
                        [class.to-orange-400]="selectedId === cat.id"
                        [class.scale-110]="selectedId === cat.id"
                        [class.bg-gray-200]="selectedId !== cat.id">
                      
                      <!-- White Border gap -->
                      <div class="w-full h-full bg-white rounded-full p-[3px] flex items-center justify-center">
                          <!-- Inner Circle with Icon/Image -->
                          <div class="w-full h-full bg-gray-50 rounded-full flex items-center justify-center overflow-hidden relative group-hover:bg-gray-100 transition-colors">
                               @if (cat.imageUrl && !cat.imageUrl.startsWith('M')) {
                                   <img [src]="cat.imageUrl" class="w-full h-full object-cover" [alt]="cat.name">
                               } @else {
                                   <!-- SVG Icon -->
                                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
                                        [class.text-terra]="selectedId === cat.id"
                                        [class.text-gray-400]="selectedId !== cat.id"
                                        class="transition-colors group-hover:text-terra">
                                       <path [attr.d]="getIconPath(cat.iconName)"/>
                                   </svg>
                               }
                          </div>
                      </div>
                   </div>
                   
                   <span class="text-xs font-medium text-gray-700 truncate max-w-[74px] text-center leading-tight transition-colors mt-1"
                         [class.font-bold]="selectedId === cat.id"
                         [class.text-terra]="selectedId === cat.id">
                       {{ cat.name }}
                   </span>
              </button>
            }
        }
      </div>
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .active-cat {
        transform: scale(1.05);
    }
  `]
})
export class CategoryNavComponent implements OnChanges {
  @Input() slug!: string;
  @Output() categorySelected = new EventEmitter<string | undefined>();

  categories: Category[] = [];
  selectedId: string | null = null;
  iconsMap = new Map<string, string>();
  loading = false;

  private categoryService = inject(CategoryService);
  private tenantService = inject(TenantService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    FASHION_ICONS.forEach(i => this.iconsMap.set(i.name, i.path));

    // Re-fetch categories when tenant changes and is available
    effect(() => {
      const tenant = this.tenantService.tenant();
      // Check if tenant is loaded and we have a slug (though fetching normally relies on tenant context)
      if (tenant && this.slug) {
        this.fetchCategories();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['slug'] && this.slug && this.tenantService.tenant()) {
      this.fetchCategories();
    }
  }

  fetchCategories() {
    // Guard: Ensure tenant is loaded so request headers can be populated
    if (!this.tenantService.tenant()) return;

    this.loading = true;
    this.cdr.detectChanges();

    this.categoryService.getCategories()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.categories = data;
        },
        error: (err) => console.error(err)
      });
  }

  getIconPath(name?: string): string {
    if (!name) return this.iconsMap.get('tag')!;
    return this.iconsMap.get(name) || this.iconsMap.get('tag')!;
  }

  selectCategory(id: string | null) {
    this.selectedId = id;
    this.categorySelected.emit(id || undefined);

    // Auto-center active element
    setTimeout(() => {
      const activeBtn = document.querySelector('.snap-start.active-cat');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 100);
  }
}
