import { Component, Input, OnInit, OnChanges, ChangeDetectorRef, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface Advisor {
  name: string;
  phone: string;
  role?: string;
}

@Component({
  selector: 'app-whatsapp-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isBrowser && advisors.length > 0) {

      <!-- Backdrop: full-screen overlay, z-40, BEHIND the popup (z-50) but above page content -->
      @if (open && advisors.length > 1) {
        <div class="fixed inset-0 z-40" (click)="open = false"></div>
      }

      <div class="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3">

        <!-- Advisor popup panel -->
        @if (advisors.length > 1) {
          <div
            class="transition-all duration-300 ease-out origin-bottom-right"
            [style.opacity]="open ? '1' : '0'"
            [style.transform]="open ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(8px)'"
            [style.pointer-events]="open ? 'auto' : 'none'">
            <div class="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-72">
              <!-- Header -->
              <div class="px-4 py-3" style="background-color: #25D366;">
                <p class="text-white font-bold text-sm">¿Con quién quieres hablar?</p>
                <p class="text-white text-xs" style="opacity: 0.8;">Elige un asesor para continuar</p>
              </div>

              <!-- Advisor list -->
              <div class="divide-y divide-gray-50">
                @for (advisor of advisors; track advisor.phone) {
                  <button type="button"
                     (click)="openAdvisor(advisor)"
                     class="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group cursor-pointer text-left">
                    <!-- Avatar -->
                    <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                         style="background-color: rgba(37,211,102,0.15);">
                      <span class="font-bold text-sm" style="color: #25D366;">{{ getInitials(advisor.name) }}</span>
                    </div>
                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-gray-900 text-sm truncate">{{ advisor.name }}</p>
                      <p class="text-gray-400 text-xs truncate">{{ advisor.role || 'Asesor de ventas' }}</p>
                    </div>
                    <!-- Arrow -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2.5"
                         class="text-gray-300 group-hover:text-green-500 transition-colors flex-shrink-0">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                }
              </div>
            </div>
          </div>
        }

        <!-- Floating button -->
        <button
          type="button"
          (click)="onButtonClick()"
          class="relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95"
          style="background-color: #25D366;"
          [attr.aria-label]="advisors.length === 1 ? 'Contactar por WhatsApp' : 'Ver asesores de WhatsApp'">

          <!-- Pulse ring animation -->
          <span class="absolute inset-0 rounded-full animate-ping" style="background-color: rgba(37,211,102,0.4);"></span>

          <!-- WhatsApp Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="w-8 h-8 relative z-10" fill="white">
            <path d="M16 2C8.28 2 2 8.28 2 16c0 2.48.68 4.8 1.86 6.8L2 30l7.42-1.84A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.4a11.54 11.54 0 0 1-5.98-1.66l-.42-.26-4.4 1.1 1.12-4.28-.28-.44A11.4 11.4 0 0 1 4.6 16C4.6 9.72 9.72 4.6 16 4.6S27.4 9.72 27.4 16 22.28 27.4 16 27.4zm6.36-8.46c-.34-.18-2.02-1-2.34-1.1-.32-.12-.56-.18-.8.18-.24.34-.92 1.1-1.12 1.34-.2.22-.42.26-.76.08-.34-.18-1.44-.52-2.74-1.66-.98-.9-1.66-2-1.86-2.34-.2-.34 0-.52.14-.7.14-.16.34-.42.52-.62.18-.2.22-.36.34-.6.12-.22.06-.42-.02-.6-.08-.18-.8-1.9-1.08-2.6-.28-.68-.56-.58-.8-.58h-.68c-.22 0-.6.08-.92.42-.32.34-1.22 1.2-1.22 2.9s1.24 3.36 1.42 3.6c.18.22 2.44 3.72 5.9 5.22.82.36 1.46.56 1.96.72.82.26 1.56.22 2.16.14.66-.1 2.02-.82 2.3-1.62.28-.8.28-1.48.2-1.62-.08-.14-.3-.22-.64-.4z"/>
          </svg>
        </button>
      </div>
    }
  `,
  styles: [`
    @keyframes ping {
      75%, 100% { transform: scale(2); opacity: 0; }
    }
    .animate-ping {
      animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
  `]
})
export class WhatsappButtonComponent implements OnInit, OnChanges {
  @Input() tenant: any = null;

  open = false;
  advisors: Advisor[] = [];
  isBrowser = false;

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.advisors = this.parseAdvisors(this.tenant?.advisors);
  }

  ngOnChanges() {
    this.advisors = this.parseAdvisors(this.tenant?.advisors);
  }

  private parseAdvisors(raw: any): Advisor[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(a => a.name && a.phone);
    if (typeof raw === 'string') {
      try { return JSON.parse(raw).filter((a: any) => a.name && a.phone); } catch { return []; }
    }
    return [];
  }

  onButtonClick() {
    if (this.advisors.length === 1) {
      window.open(this.getWhatsAppUrl(this.advisors[0]), '_blank', 'noopener,noreferrer');
    } else {
      this.open = !this.open;
    }
  }

  openAdvisor(advisor: Advisor) {
    window.open(this.getWhatsAppUrl(advisor), '_blank', 'noopener,noreferrer');
    this.open = false;
  }

  getWhatsAppUrl(advisor: Advisor): string {
    const phone = advisor.phone.replace(/\D/g, '');
    return `https://wa.me/${phone}`;
  }

  getInitials(name: string): string {
    return name.trim().split(/\s+/).slice(0, 2).map(n => n[0].toUpperCase()).join('');
  }
}
