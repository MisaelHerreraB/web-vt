import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { Tenant } from '../../services/tenant.service';
import { getCurrencySymbol } from '../../constants/currencies';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (cart.count() > 0) {
      <div class="fixed bottom-0 left-0 right-0 z-50 animate-slideUp">
        <!-- Glassmorphism Container -->
        <div class="bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-safe">
            <div class="container mx-auto px-4 py-3 md:py-4">
                <div class="flex items-center justify-between gap-4 max-w-4xl mx-auto">
                    
                    <!-- Total Price Section -->
                    <div class="flex flex-col">
                        <span class="text-xs text-gray-500 font-medium uppercase tracking-wide">Total a Pagar</span>
                        <div class="flex items-baseline gap-1">
                            <span class="text-xl md:text-2xl font-bold text-gray-900">
                                {{ cart.total() | currency: getSymbol(tenant?.currency) }}
                            </span>
                            <span class="text-sm font-medium text-gray-400">
                                ({{ cart.count() }})
                            </span>
                        </div>
                    </div>

                    <!-- Main Action Button -->
                    <button (click)="cart.open()" 
                            class="flex-1 max-w-xs bg-terra text-white px-6 py-3.5 rounded-full font-bold shadow-lg shadow-terra/30 hover:shadow-terra/50 hover:bg-terra-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group">
                        
                        <span>Ver Pedido</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:translate-x-1 transition-transform">
                            <path d="M5 12h14"/>
                            <path d="m12 5 7 7-7 7"/>
                        </svg>
                    </button>
                    
                </div>
            </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .pb-safe {
        padding-bottom: env(safe-area-inset-bottom, 20px);
    }
    @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    .animate-slideUp {
        animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class CartSummaryComponent {
  @Input() tenant: Tenant | null = null;
  cart = inject(CartService);

  getSymbol(code: string | undefined): string {
    return getCurrencySymbol(code);
  }
}
