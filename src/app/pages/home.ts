import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router'; // Added imports
import { ProductService, Product } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { TenantService, Tenant } from '../services/tenant.service';
import { getCurrencySymbol } from '../constants/currencies';
import { CartSummaryComponent } from '../components/cart-summary/cart-summary';
import { CartDrawerComponent } from '../components/cart-drawer/cart-drawer.component';
import { CategoryNavComponent } from '../components/category-nav/category-nav';
import { HeaderCompactComponent } from '../components/headers/header-compact';
import { HeaderOverlayComponent } from '../components/headers/header-overlay';
import { HeaderMinimalComponent } from '../components/headers/header-minimal';



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CartSummaryComponent, CategoryNavComponent, HeaderCompactComponent, HeaderOverlayComponent, HeaderMinimalComponent, CartDrawerComponent],
  // ... template unchanged ...
  template: `
    <div class="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      
      <!-- STORE HEADER - Configurable Layout -->
      @switch(tenant?.headerLayout || 'compact') {
        @case ('overlay') {
          <app-header-overlay 
            [tenant]="tenant" 
            [slug]="slug"
            [searchQuery]="searchQuery"
            [onCategorySelected]="onCategorySelected.bind(this)"
            [onSearch]="onSearch.bind(this)"
            [onSearchInput]="onSearchInput.bind(this)"
            [onClearSearch]="clearSearch.bind(this)"
            [onInfoClick]="openInfoDrawer">
          </app-header-overlay>
        }
        @case ('minimal') {
          <app-header-minimal 
            [tenant]="tenant" 
            [slug]="slug"
            [searchQuery]="searchQuery"
            [onCategorySelected]="onCategorySelected.bind(this)"
            [onSearch]="onSearch.bind(this)"
            [onSearchInput]="onSearchInput.bind(this)"
            [onClearSearch]="clearSearch.bind(this)"
            [onInfoClick]="openInfoDrawer">
          </app-header-minimal>
        }
        @default {
          <app-header-compact 
            [tenant]="tenant" 
            [slug]="slug"
            [searchQuery]="searchQuery"
            [onCategorySelected]="onCategorySelected.bind(this)"
            [onSearch]="onSearch.bind(this)"
            [onSearchInput]="onSearchInput.bind(this)"
            [onClearSearch]="clearSearch.bind(this)"
            [onInfoClick]="openInfoDrawer">
          </app-header-compact>
        }
      }

      <!-- OLD HEADER - Kept as fallback, can be removed after testing -->
      <header class="bg-white shadow-sm relative z-20" style="display: none;">
        <!-- Cover Image -->
        <div class="h-56 md:h-80 w-full bg-gray-200 overflow-hidden relative">
           @if (tenant?.coverUrl) {
             <img [src]="tenant?.coverUrl" alt="Cover" class="w-full h-full object-cover">
             <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
           } @else {
             <div class="w-full h-full flex items-center justify-center bg-gradient-to-r from-terra to-terra-800 text-white opacity-90">
                <span class="text-5xl font-extralight tracking-[0.2em] uppercase">{{ tenant?.name }}</span>
             </div>
           }
        </div>

        <!-- Info Bar (Logo overlapping) -->
        <div class="container mx-auto px-4 relative -mt-16 md:-mt-20 pb-6 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
           
           <!-- Logo -->
           <div class="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white flex-shrink-0 z-10">
              @if (tenant?.logoUrl) {
                <img [src]="tenant?.logoUrl" [alt]="tenant?.name" class="w-full h-full object-cover">
              } @else {
                <div class="w-full h-full flex items-center justify-center bg-terra text-white text-4xl font-bold">
                    {{ tenant?.name?.charAt(0) }}
                </div>
              }
           </div>

           <!-- Text Info -->
           <div class="text-center md:text-left flex-1 mb-2">
              <h1 class="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">{{ tenant?.name || slug }}</h1>
              @if (tenant?.bio) {
                <p class="text-gray-600 mt-2 font-medium text-lg">{{ tenant?.bio }}</p>
              }
              
              <div class="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-4 text-sm text-gray-600">
                @if (tenant?.address) {
                   <span class="flex items-center gap-1.5">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                     {{ tenant?.address }}
                   </span>
                }
                @if (tenant?.phoneNumber) {
                    <span class="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-terra" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {{ tenant?.phoneNumber }}
                    </span>
                }
              </div>
           </div>

           <!-- Socials & Search -->
           <div class="flex flex-col items-center md:items-end gap-4 w-full md:w-auto mt-4 md:mt-0">
              <div class="flex gap-4">
                  @if (tenant?.socialFacebook) { <a [href]="tenant!.socialFacebook" target="_blank" class="text-gray-400 hover:text-[#1877F2] transition-colors hover:scale-110 transform duration-200"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a> }
                  @if (tenant?.socialInstagram) { <a [href]="tenant!.socialInstagram" target="_blank" class="text-gray-400 hover:text-[#E4405F] transition-colors hover:scale-110 transform duration-200"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a> }
                  @if (tenant?.socialTiktok) { <a [href]="tenant!.socialTiktok" target="_blank" class="text-gray-400 hover:text-[#000000] transition-colors hover:scale-110 transform duration-200"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg></a> }
              </div>

              <div class="flex items-center gap-3 w-full">
                 <!-- Search Info -->
                 <div class="flex items-center bg-gray-100 rounded-full px-5 py-3 w-full md:w-auto flex-1 hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-200 group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 group-hover:text-terra transition-colors"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" 
                           placeholder="Buscar productos..." 
                           class="bg-transparent border-none outline-none text-sm ml-3 w-full md:w-64 placeholder:text-gray-400 text-gray-700"
                           [value]="searchQuery"
                           (keyup.enter)="onSearch($event)"
                           (input)="onSearchInput($event)">
                 </div>

                 <div class="relative bg-white rounded-full p-3 hover:bg-terra hover:text-white transition-all cursor-pointer shadow-sm border border-gray-100 group" (click)="cart.open()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-700 group-hover:text-white transition-colors"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    @if (cart.count() > 0) {
                      <span class="absolute -top-1 -right-1 bg-terra text-white text-[11px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">{{ cart.count() }}</span>
                    }
                 </div>
               </div>
           </div>
        </div>

        <!-- Sticky Category Nav -->
        <app-category-nav [slug]="slug" (categorySelected)="onCategorySelected($event)"></app-category-nav>
      </header>

      <main class="container mx-auto px-4 py-8 md:py-12">
        @if (products.length === 0) {
            <div class="flex flex-col items-center justify-center py-32 text-gray-500">
                <div class="p-6 bg-gray-50 rounded-full mb-6 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-300"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                </div>
                <h3 class="text-xl font-medium text-gray-900 mb-2">No se encontraron productos</h3>
                <p class="text-gray-400">Intenta buscar con otros términos o categorías.</p>
            </div>
        }

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          @for (product of products; track product.id) {
            <div class="group relative flex flex-col h-full bg-white rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1">
              <!-- Card Image -->
              <div class="aspect-[3/4] bg-gray-100 overflow-hidden relative rounded-2xl mx-2 mt-2">
                 <img [src]="product.images?.[0] || product.imageUrl || 'https://placehold.co/400x500/f4e1d2/b24343?text=NO+IMAGE'" 
                     [alt]="product.title"
                     class="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110">
                 
                 <!-- Badges: Top Left (Variety) -->
                 <div class="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    @if (product.variants && product.variants.length > 0) {
                        <span class="bg-black/30 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider border border-white/10 uppercase">
                            Variedad
                        </span>
                    }
                 </div>

                 <!-- Badges: Bottom Left (Urgency - Moved to avoid covering faces) -->
                 <div class="absolute bottom-3 left-3 flex flex-col gap-2 z-10">
                     @if (product.stock < 5 && product.stock > 0 && !product.ignoreStock) {
                          <span class="bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider border border-white/10 uppercase animate-pulse shadow-sm">
                             ¡Últimos!
                         </span>
                     }
                     @if (product.urgencyOverride || (tenant?.lowStockThreshold && product.stock <= (tenant?.lowStockThreshold || 0) && product.stock > 0 && !product.ignoreStock)) {
                        <span class="bg-orange-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider border border-white/10 uppercase flex items-center gap-1 shadow-sm animate-pulse">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                            ¡Se Agota!
                        </span>
                     }
                 </div>
                 
                 <!-- Desktop Quick Actions Overlay -->
                 <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-center justify-center gap-3 backdrop-blur-[2px] z-10 pointer-events-none">
                    <button (click)="addToCart(product); $event.stopPropagation()" 
                            class="h-12 w-12 bg-white rounded-full flex items-center justify-center text-gray-900 hover:bg-terra hover:text-white transition-all transform scale-0 group-hover:scale-100 duration-300 delay-75 shadow-lg pointer-events-auto">
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </button>
                    <a [routerLink]="['p', product.id]" 
                       class="h-12 w-12 bg-white rounded-full flex items-center justify-center text-gray-900 hover:bg-terra hover:text-white transition-all transform scale-0 group-hover:scale-100 duration-300 delay-100 shadow-lg pointer-events-auto">
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </a>
                 </div>
              </div>

              <!-- Mobile Quick Add -->
              <button (click)="addToCart(product); $event.stopPropagation()" 
                     class="md:hidden absolute top-4 right-4 h-9 w-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-800 shadow-sm border border-gray-100 active:bg-terra active:text-white z-10">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>

              <!-- Info -->
              <div class="p-5 flex flex-col flex-1">
                <div class="flex-1">
                    <h3 class="font-bold text-gray-900 text-sm md:text-[15px] leading-tight uppercase tracking-wider line-clamp-2 md:group-hover:text-terra transition-colors">{{ product.title }}</h3>
                    <p class="text-gray-500 text-xs mt-2 line-clamp-2 leading-relaxed font-light">{{ product.description }}</p>
                </div>
                
                <div class="flex items-end justify-between mt-4 border-t border-gray-50 pt-3">
                    <div class="flex flex-col">
                        <span class="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-0.5">Precio</span>
                        <p class="font-bold text-gray-900 text-lg md:text-xl">{{ product.price | currency : getSymbol(tenant?.currency) }}</p>
                    </div>
                </div>
              </div>

              <!-- Full Click Area -->
              <a [routerLink]="['p', product.id]" class="absolute inset-0 z-0"></a>
            </div>
          }
        </div>
      </main>

      <app-cart-summary [tenant]="tenant"></app-cart-summary>
      
      <!-- Cart Drawer -->
      <app-cart-drawer></app-cart-drawer>
    </div>
  `
})
export class HomeComponent implements OnInit {
  slug: string = '';
  products: Product[] = [];
  tenant: Tenant | null = null;

  cart = inject(CartService);
  private productService = inject(ProductService);
  private tenantService = inject(TenantService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  searchQuery: string = '';

  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    // Get slug and query params
    this.route.params.subscribe(params => {
      this.slug = params['slug'];
      if (this.slug) {
        // Check for search query param within the same subscription flow to ensure slug is set
        this.route.queryParams.subscribe(queryParams => {
          const search = queryParams['search'];
          this.searchQuery = search || '';
          this.loadData(search);
        });
      }
    });
  }

  loadData(searchQuery?: string) {
    console.log('HomeComponent: Loading data for slug:', this.slug, 'search:', searchQuery);

    // Defensive check: If slug looks like an SVG path or has spaces, ignore it
    if (this.slug.includes(' ') || this.slug.length > 50) {
      console.warn('HomeComponent: Invalid slug detected (likely an SVG path), redirecting to 404.');
      this.router.navigate(['/tenant-not-found', 'invalid']);
      return;
    }

    // 1. Optimistic UI: Check if we already have this tenant in service memory
    const cachedTenant = this.tenantService.tenant();
    let isCached = false;

    if (cachedTenant && cachedTenant.slug === this.slug) {
      console.log('HomeComponent: Using cached tenant data');
      this.tenant = cachedTenant;
      isCached = true;
      // Optimistic load: Load products immediately
      this.loadProducts(undefined, searchQuery);
    }

    // 2. Refresh data in background (Stale-While-Revalidate)
    this.tenantService.getTenant(this.slug).subscribe({
      next: (data) => {
        // Only update if data actually changed to avoid unnecessary repaints, 
        // but for now simple assignment is fine as it confirms freshness.
        console.log('HomeComponent: Tenant data refreshed:', data);
        this.tenant = data;
        this.cdr.detectChanges();

        // If we didn't have cached data, load products now.
        // If we DID have cached data, we can optionally reload products here to ensure freshness,
        // but since ProductService now has cache, it won't hit the network unless needed.
        // Let's reload to be safe and let the service handle the caching.
        this.loadProducts(undefined, searchQuery);
      },
      error: (err) => {
        console.error('HomeComponent: Error loading tenant:', err);
        if (err.status === 404) {
          this.router.navigate(['/tenant-not-found', this.slug]);
        }
      }
    });
  }

  loadProducts(categoryId?: string, search?: string) {
    console.log('HomeComponent: Loading products...', { categoryId, search });
    this.productService.getProducts(categoryId, search).subscribe({
      next: (data) => {
        console.log('HomeComponent: Products received:', data);
        this.products = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('HomeComponent: Error loading products:', err)
    });
  }

  onCategorySelected(categoryId: string | undefined) {
    this.loadProducts(categoryId);
  }

  onSearch(event: any) {
    const value = event.target.value;
    this.loadProducts(undefined, value);
  }

  onSearchInput(event: any) {
    const query = event.target.value;
    // Real-time update of the property
    this.searchQuery = query;
  }

  clearSearch() {
    this.searchQuery = '';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: null },
      queryParamsHandling: 'merge'
    });
    this.loadProducts(undefined, '');
  }

  addToCart(product: Product) {
    if (product.variants && product.variants.length > 0) {
      this.router.navigate(['p', product.id], { relativeTo: this.route });
    } else {
      this.cart.addToCart(product);
      this.cart.open(); // Open cart to show feedback
    }
  }

  getSymbol(code: string | undefined): string {
    return getCurrencySymbol(code);
  }

  openInfoDrawer() {
    (window as any).openInfoDrawer?.();
  }
}
