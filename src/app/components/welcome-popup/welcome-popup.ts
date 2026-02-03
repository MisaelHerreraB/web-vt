import { Component, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TenantService } from '../../services/tenant.service';

@Component({
  selector: 'app-welcome-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen() && tenant()?.welcomePopupEnabled) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="close()"></div>
        
        <!-- Modal Content -->
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden transform transition-all animate-bounce-in">
          
          <!-- Header -->
          <div class="bg-terra px-6 py-4 flex justify-between items-center">
            <h3 class="text-white font-bold text-lg">{{ tenant()?.welcomePopupTitle || '¡Bienvenido!' }}</h3>
            <button (click)="close()" class="text-white/80 hover:text-white transition-colors bg-white/20 hover:bg-white/30 rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6">
            @if (tenant()?.logoUrl) {
                <div class="flex justify-center mb-4">
                    <img [src]="tenant()?.logoUrl" class="h-16 w-16 rounded-full object-cover shadow-sm border border-gray-100">
                </div>
            }
            <div class="prose prose-sm max-w-none text-gray-600 text-center whitespace-pre-wrap">
              {{ tenant()?.welcomePopupContent }}
            </div>
          </div>

          <!-- Footer/Action -->
          <div class="p-4 bg-gray-50 flex justify-center">
            <button (click)="close()" class="bg-terra text-white px-6 py-2 rounded-full font-medium hover:bg-terra-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Entendido
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes bounce-in {
      0% { opacity: 0; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1.02); }
      100% { opacity: 1; transform: scale(1); }
    }
    .animate-bounce-in {
      animation: bounce-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
  `]
})
export class WelcomePopupComponent {
  tenantService = inject(TenantService);
  tenant = this.tenantService.tenant; // Expose signal to template

  isOpen = signal(false);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    effect(() => {
      const t = this.tenant();
      console.log('[WelcomePopup] Effect triggered, tenant:', t?.id, 'enabled:', t?.welcomePopupEnabled);
      if (t) {
        this.checkPopup(t);
      }
    });
  }

  private checkPopup(t: any) {
    if (!isPlatformBrowser(this.platformId)) return;

    // Check if valid and not previously closed in this session
    if (t.welcomePopupEnabled && !this.isOpen()) {
      const hasSeenPopup = sessionStorage.getItem(`seen_popup_${t.id}`);
      console.log('[WelcomePopup] checkPopup - hasSeenPopup:', hasSeenPopup);

      if (!hasSeenPopup) {
        console.log('[WelcomePopup] Scheduling popup open in 1s...');
        // Small delay for better UX
        setTimeout(() => {
          console.log('[WelcomePopup] Opening popup now!');
          this.isOpen.set(true);
        }, 1000);
      }
    }
  }

  close() {
    this.isOpen.set(false);
    const t = this.tenant();
    if (t?.id && isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(`seen_popup_${t.id}`, 'true');
    }
  }
}
