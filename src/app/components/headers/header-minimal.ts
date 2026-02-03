import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Tenant } from '../../services/tenant.service';
import { CategoryNavComponent } from '../category-nav/category-nav';
import { CompactStickyNavComponent } from '../compact-sticky-nav/compact-sticky-nav.component';

@Component({
    selector: 'app-header-minimal',
    standalone: true,
    imports: [CommonModule, CategoryNavComponent, CompactStickyNavComponent],
    template: `
    <!-- Compact Sticky Nav on Scroll -->
    <app-compact-sticky-nav 
      [tenant]="tenant"
      [searchQuery]="searchQuery"
      [onSearch]="onSearch"
      [onSearchInput]="onSearchInput"
      [onClearSearch]="onClearSearch"
      [onInfoClick]="onInfoClick">
    </app-compact-sticky-nav>

    <header class="bg-white shadow-sm relative z-20">
      <!-- Single Row - Clean Amazon Style -->
      <div class="border-b border-gray-200">
          <div class="container mx-auto px-4 py-3 flex items-center gap-6">
              
              <!-- Logo - Small -->
              <div class="h-14 w-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                  @if (tenant?.logoUrl) {
                      <img [src]="tenant?.logoUrl" [alt]="tenant?.name" class="w-full h-full object-cover">
                  } @else {
                      <div class="w-full h-full flex items-center justify-center bg-terra text-white text-xl font-bold">
                          {{ tenant?.name?.charAt(0) }}
                      </div>
                  }
              </div>

              <!-- Name -->
              <div class="hidden sm:block">
                  <h1 class="text-xl font-bold text-gray-900">{{ tenant?.name || slug }}</h1>
              </div>

              <!-- Location - Compact -->
              @if (tenant?.address) {
                  <div class="hidden md:flex items-center gap-1.5 text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      <span class="line-clamp-1 max-w-[200px]">{{ tenant?.address }}</span>
                  </div>
              }

              <!-- Spacer -->
              <div class="flex-1"></div>

              <!-- Search -->
              <div class="relative flex-1 max-w-md hidden md:block">
                  <input type="text" 
                         placeholder="Buscar productos..." 
                         class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-terra/30 focus:bg-white"
                         [value]="searchQuery"
                         (keyup.enter)="onSearch($event)"
                         (input)="onSearchInput($event)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-3 top-3 text-gray-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  @if (searchQuery) {
                    <button (click)="onClearSearch()" class="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  }
              </div>

              <!-- Social Icons - Compact -->
              <div class="hidden lg:flex gap-2">
                  @if (tenant?.socialFacebookEnabled && tenant?.socialFacebook) { 
                      <a [href]="tenant!.socialFacebook" target="_blank" class="text-gray-400 hover:text-[#1877F2] p-1 transition-colors">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </a>
                  }
                  @if (tenant?.socialInstagramEnabled && tenant?.socialInstagram) { 
                      <a [href]="tenant!.socialInstagram" target="_blank" class="text-gray-400 hover:text-[#E4405F] p-1 transition-colors">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M18,5A1.25,1.25 0 0,1 19.25,6.25A1.25,1.25 0 0,1 18,7.5A1.25,1.25 0 0,1 16.75,6.25A1.25,1.25 0 0,1 18,5Z" /></svg>
                      </a>
                  }
                  @if (tenant?.socialTiktokEnabled && tenant?.socialTiktok) { 
                      <a [href]="tenant!.socialTiktok" target="_blank" class="text-gray-400 hover:text-black p-1 transition-colors">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                      </a>
                  }
                  @if (tenant?.socialYoutubeEnabled && tenant?.socialYoutube) { 
                      <a [href]="tenant!.socialYoutube" target="_blank" class="text-gray-400 hover:text-[#FF0000] p-1 transition-colors">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      </a>
                  }
                  @if (tenant?.socialWhatsappEnabled && tenant?.socialWhatsapp) { 
                      <a [href]="'https://wa.me/' + tenant!.socialWhatsapp" target="_blank" class="text-gray-400 hover:text-[#25D366] p-1 transition-colors">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      </a>
                  }
              </div>

              <!-- Cart -->
              <button (click)="onInfoClick()" class="relative bg-gray-100 text-gray-600 rounded-lg px-2.5 py-2.5 hover:bg-gray-200 transition-colors flex items-center gap-2" title="Información">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  <span class="text-sm font-medium hidden md:inline">Info</span>
              </button>
              <button (click)="cart.open()" class="relative bg-terra text-white rounded-lg px-4 py-2.5 hover:bg-gray-900 transition-colors flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                 @if (cart.count() > 0) {
                     <span class="text-sm font-medium">{{ cart.count() }}</span>
                 }
              </button>
          </div>
      </div>

      <!-- Mobile Search -->
      <div class="md:hidden container mx-auto px-4 py-2 bg-gray-50">
          <div class="relative">
              <input type="text" 
                     placeholder="Buscar..." 
                     class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                     (keyup.enter)="onSearch($event)"
                     (input)="onSearchInput($event)">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-3 top-2.5 text-gray-400"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
      </div>

      <!-- Categories -->
      <div class="border-t border-gray-100">
           <app-category-nav [slug]="slug" (categorySelected)="onCategorySelected($event)"></app-category-nav>
      </div>
    </header>
  `
})
export class HeaderMinimalComponent {
    @Input() tenant: Tenant | null = null;
    @Input() slug: string = '';
    @Input() searchQuery: string = '';
    @Input() onCategorySelected!: (categoryId: string | undefined) => void;
    @Input() onSearch!: (event: any) => void;
    @Input() onSearchInput!: (event: any) => void;
    @Input() onClearSearch: () => void = () => { };
    @Input() onInfoClick!: () => void;

    cart = inject(CartService);
}
