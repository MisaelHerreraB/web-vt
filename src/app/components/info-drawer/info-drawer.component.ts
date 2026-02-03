import { Component, Input, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Tenant } from '../../services/tenant.service';

@Component({
    selector: 'app-info-drawer',
    standalone: true,
    imports: [CommonModule],
    providers: [DatePipe],
    template: `
    @if (isOpen()) {
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity"
             (click)="close()">
        </div>

        <!-- Drawer Panel -->
        <div class="fixed inset-y-0 left-0 w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col h-full animate-slide-in-left">
            
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                <h2 class="text-xl font-bold text-gray-900">Información</h2>
                <button (click)="close()" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-6 space-y-8">
                
                <!-- Branding -->
                <div class="text-center">
                    @if (tenant?.logoUrl) {
                        <img [src]="tenant?.logoUrl" class="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-gray-50 shadow-sm">
                    }
                    <h3 class="text-2xl font-bold text-gray-900">{{ tenant?.name }}</h3>
                    @if (tenant?.bio) {
                        <p class="text-gray-500 mt-2 text-sm leading-relaxed">{{ tenant?.bio }}</p>
                    }
                </div>

                <!-- Contact Info -->
                <div class="space-y-4">
                    <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400">Contacto</h4>
                    
                    @if (tenant?.address) {
                        <div class="flex items-start gap-3 text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-terra mt-0.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            <span class="text-sm font-medium">{{ tenant?.address }}</span>
                        </div>
                    }
                    
                    @if (tenant?.whatsapp || tenant?.phone) {
                        <div class="flex items-center gap-3 text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-600"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            <span class="text-sm font-medium">{{ tenant?.whatsapp || tenant?.phone }}</span>
                        </div>
                    }
                </div>

                <!-- Schedule -->
                @if (tenant?.openingHours && tenant?.openingHours?.length) {
                    <div class="space-y-4">
                        <div class="flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                             <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400">Horario Tienda Física</h4>
                        </div>
                        <div class="bg-gray-50 rounded-xl p-4 space-y-2">
                             @for (day of sortedDays; track day) {
                                 <div class="flex justify-between text-sm" [class.font-bold]="isToday(day.slug)">
                                     <span class="capitalize" [class.text-terra]="isToday(day.slug)" [class.text-gray-600]="!isToday(day.slug)">{{ day.label }}</span>
                                     @if (getSchedule(day.slug); as schedule) {
                                         <span class="text-gray-900">{{ formatTime(schedule.open) }} - {{ formatTime(schedule.close) }}</span>
                                     } @else {
                                         <span class="text-gray-400 italic">Cerrado</span>
                                     }
                                 </div>
                             }
                        </div>
                    </div>
                }

                <!-- Socials -->
                <div class="pt-6 border-t border-gray-100 flex justify-center gap-6">
                    @if (tenant?.socialFacebook) { <a [href]="tenant!.socialFacebook" target="_blank" class="text-gray-400 hover:text-blue-600 transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a> }
                    @if (tenant?.socialInstagram) { <a [href]="tenant!.socialInstagram" target="_blank" class="text-gray-400 hover:text-pink-600 transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a> }
                    @if (tenant?.socialTiktok) { <a [href]="tenant!.socialTiktok" target="_blank" class="text-gray-400 hover:text-black transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg></a> }
                </div>
            </div>
            
        </div>
    }
  `,
    styles: [`
    @keyframes slideInLeft {
        from { transform: translateX(-100%); }
        to { transform: translateX(0); }
    }
    .animate-slide-in-left {
        animation: slideInLeft 0.3s ease-out forwards;
    }
  `]
})
export class InfoDrawerComponent {
    @Input() tenant: Tenant | null = null;

    isOpen = signal(false);
    private datePipe = inject(DatePipe);

    // Helper for Schedule Display
    sortedDays = [
        { slug: 'monday', label: 'Lunes' },
        { slug: 'tuesday', label: 'Martes' },
        { slug: 'wednesday', label: 'Miércoles' },
        { slug: 'thursday', label: 'Jueves' },
        { slug: 'friday', label: 'Viernes' },
        { slug: 'saturday', label: 'Sábado' },
        { slug: 'sunday', label: 'Domingo' }
    ];

    open() {
        this.isOpen.set(true);
    }

    close() {
        this.isOpen.set(false);
    }

    toggle() {
        this.isOpen.update(v => !v);
    }

    getSchedule(daySlug: string) {
        if (!this.tenant || !this.tenant.openingHours) return null;
        return this.tenant.openingHours.find(h => h.day.toLowerCase() === daySlug && h.isOpen);
    }

    isToday(daySlug: string): boolean {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const now = new Date();
        return days[now.getDay()] === daySlug;
    }

    formatTime(timeStr: string): string {
        if (!timeStr) return '';
        // Format "09:00" to "9:00 AM" if desired, for now simpler
        const [hours, minutes] = timeStr.split(':');
        const date = new Date();
        date.setHours(Number(hours));
        date.setMinutes(Number(minutes));
        return this.datePipe.transform(date, 'shortTime') || timeStr;
    }
}
