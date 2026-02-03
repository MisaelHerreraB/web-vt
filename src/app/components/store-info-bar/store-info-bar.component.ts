import { Component, Input, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Tenant } from '../../services/tenant.service';

@Component({
    selector: 'app-store-info-bar',
    standalone: true,
    imports: [CommonModule],
    providers: [DatePipe],
    template: `
    @if (tenant) {
      <div class="bg-gray-900 text-white text-xs md:text-sm py-2 px-4 relative z-50">
        <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          
          <!-- Left: Address & Status -->
          <div class="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
             @if (tenant.address) {
               <div class="hidden md:flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity cursor-help" [title]="tenant.address">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span class="truncate max-w-[200px]">{{ tenant.address }}</span>
               </div>
             }

             <!-- Open Status Indicator -->
             <div class="flex items-center gap-2">
                @if (isOpen()) {
                  <span class="relative flex h-2.5 w-2.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <span class="font-bold text-green-400">Abierto</span>
                  @if (closingTime(); as close) {
                     <span class="text-gray-400 hidden sm:inline">• Cierra a las {{ close }}</span>
                  }
                } @else {
                   <span class="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                   <span class="font-bold text-red-400">Cerrado</span>
                   @if (openingTime(); as open) {
                      <span class="text-gray-400 hidden sm:inline">• Abre a las {{ open }}</span>
                   }
                }
             </div>
          </div>

          <!-- Right: Contact Actions -->
          <div class="flex items-center gap-4">
             @if (tenant.whatsapp || tenant.phone) {
                <a [href]="getWhatsappLink()" target="_blank" class="flex items-center gap-1.5 hover:text-green-400 transition-colors font-medium">
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                   <span class="hidden sm:inline">{{ tenant.whatsapp || tenant.phone }}</span>
                   <span class="sm:hidden">WhatsApp</span>
                </a>
             }
          </div>
        </div>
      </div>
    }
  `
})
export class StoreInfoBarComponent {
    @Input() tenant: Tenant | null = null;

    private datePipe = inject(DatePipe);

    isOpen = computed(() => {
        if (!this.tenant || !this.tenant.openingHours) return false; // Default closed if no hours
        return this.checkIsOpen(this.tenant.openingHours);
    });

    closingTime = computed(() => {
        if (!this.tenant || !this.tenant.openingHours) return null;
        const today = this.getTodaySchedule(this.tenant.openingHours);
        return today ? this.formatTime(today.close) : null;
    });

    openingTime = computed(() => {
        if (!this.tenant || !this.tenant.openingHours) return null;
        const today = this.getTodaySchedule(this.tenant.openingHours);
        return today ? this.formatTime(today.open) : null;
    });

    private getTodaySchedule(hours: any[]) {
        if (!Array.isArray(hours)) return null;
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const now = new Date();
        const dayName = days[now.getDay()];
        return hours.find(h => h.day.toLowerCase() === dayName && h.isOpen);
    }

    private checkIsOpen(hours: any[]): boolean {
        const schedule = this.getTodaySchedule(hours);
        if (!schedule) return false;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const [openHour, openMinute] = schedule.open.split(':').map(Number);
        const [closeHour, closeMinute] = schedule.close.split(':').map(Number);

        const openTime = openHour * 60 + openMinute;
        const closeTime = closeHour * 60 + closeMinute;

        return currentTime >= openTime && currentTime < closeTime;
    }

    private formatTime(timeStr: string): string {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const date = new Date();
        date.setHours(Number(hours));
        date.setMinutes(Number(minutes));
        return this.datePipe.transform(date, 'shortTime') || timeStr;
    }

    getWhatsappLink(): string {
        if (!this.tenant) return '#';
        const phone = this.tenant.whatsapp || this.tenant.phone;
        if (!phone) return '#';
        return `https://wa.me/${phone}`;
    }
}
