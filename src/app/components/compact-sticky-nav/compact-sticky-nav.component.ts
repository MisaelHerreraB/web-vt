import { Component, Input, inject, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Tenant } from '../../services/tenant.service';

@Component({
  selector: 'app-compact-sticky-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class.visible]="isVisible()" 
         class="compact-nav fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-200 transition-transform duration-300">
      <div class="container mx-auto px-4 md:px-6 lg:px-8 h-14 md:h-16 flex items-center gap-3 md:gap-6">
        
        <!-- Mini Logo -->
        <div class="h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-terra/30 transition-all"
             (click)="scrollToTop()">
          @if (tenant?.logoUrl) {
            <img [src]="tenant?.logoUrl" [alt]="tenant?.name" class="w-full h-full object-cover">
          } @else {
            <div class="w-full h-full flex items-center justify-center bg-terra text-white text-sm md:text-base font-bold">
              {{ tenant?.name?.charAt(0) }}
            </div>
          }
        </div>

        <!-- Store Name (hidden on mobile) -->
        <div class="hidden md:block text-sm lg:text-base font-semibold text-gray-900 truncate max-w-[150px] lg:max-w-[200px]">
          {{ tenant?.name }}
        </div>

        <!-- Compact Search -->
        <div class="relative flex-1 max-w-md lg:max-w-xl">
          <input type="text" 
                 placeholder="Buscar..." 
                 class="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-terra/30 focus:bg-white focus:ring-2 focus:ring-terra/10 transition-all"
                 [value]="searchQuery"
                 (keyup.enter)="onSearch($event)"
                 (input)="onSearchInput($event)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="absolute left-3 top-2.5 md:top-3 text-gray-400">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          @if (searchQuery) {
            <button (click)="onClearSearch()" class="absolute right-3 top-2.5 md:top-3 text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          }
        </div>

        <!-- Actions -->
        <div class="flex gap-2 md:gap-3 items-center ml-auto">
          <!-- Info Button -->
          <button (click)="onInfoClick()" 
                  class="flex items-center gap-1.5 bg-gray-100 text-gray-700 rounded-lg px-3 md:px-4 py-2 md:py-2.5 hover:bg-gray-200 transition-colors"
                  title="Información de la tienda">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            <span class="text-xs md:text-sm font-medium hidden lg:inline">Info</span>
          </button>

          <!-- Cart Button -->
          <button (click)="cart.open()" 
                  class="relative bg-terra text-white rounded-lg px-3 md:px-4 py-2 md:py-2.5 hover:bg-terra-700 transition-colors flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            @if (cart.count() > 0) {
              <span class="text-xs md:text-sm font-bold">{{ cart.count() }}</span>
            }
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .compact-nav {
      transform: translateY(-100%);
    }
    .compact-nav.visible {
      transform: translateY(0);
    }
  `]
})
export class CompactStickyNavComponent {
  @Input() tenant: Tenant | null = null;
  @Input() searchQuery: string = '';
  @Input() onSearch: (event: any) => void = () => { };
  @Input() onSearchInput: (event: any) => void = () => { };
  @Input() onClearSearch: () => void = () => { };
  @Input() onInfoClick: () => void = () => { };

  cart = inject(CartService);
  isVisible = signal(false);
  private lastScrollY = 0;

  @HostListener('window:scroll')
  onScroll() {
    const currentScrollY = window.scrollY;

    // Show when scrolled down > 200px
    // Hide when scrolled up < 100px (hysteresis)
    if (currentScrollY > 200) {
      this.isVisible.set(true);
    } else if (currentScrollY < 100) {
      this.isVisible.set(false);
    }

    this.lastScrollY = currentScrollY;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
