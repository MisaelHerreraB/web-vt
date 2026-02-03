import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tenant } from '../../services/tenant.service';

@Component({
   selector: 'app-announcement-bar',
   standalone: true,
   imports: [CommonModule],
   template: `
    @if (tenant && tenant.announcementEnabled && tenant.announcementText) {
      <div [ngStyle]="{
            'background-color': tenant.announcementBgColor || '#111827',
            'color': tenant.announcementTextColor || '#FFFFFF'
           }" 
           class="text-xs md:text-sm py-2.5 overflow-hidden relative z-50">
         <div class="marquee-container flex whitespace-nowrap">
            <!-- Content duplicated for seamless loop -->
            <div class="marquee-content flex gap-8 px-4">
               <span>{{ tenant.announcementText }}</span>
               <span class="mx-4 opacity-30">•</span>
               <span>{{ tenant.announcementText }}</span>
               <span class="mx-4 opacity-30">•</span>
               <span>{{ tenant.announcementText }}</span>
               <span class="mx-4 opacity-30">•</span>
               <span>{{ tenant.announcementText }}</span>
               <span class="mx-4 opacity-30">•</span>
            </div>
            <!-- Duplicate for flow -->
            <div class="marquee-content flex gap-8 px-4" aria-hidden="true">
               <span>{{ tenant.announcementText }}</span>
               <span class="mx-4 opacity-30">•</span>
               <span>{{ tenant.announcementText }}</span>
               <span class="mx-4 opacity-30">•</span>
               <span>{{ tenant.announcementText }}</span>
               <span class="mx-4 opacity-30">•</span>
               <span>{{ tenant.announcementText }}</span>
               <span class="mx-4 opacity-30">•</span>
            </div>
         </div>
      </div>
    }
  `,
   styles: [`
    .marquee-container {
       align-items: center;
    }
    .marquee-content {
       animation: scroll 20s linear infinite;
    }
    @keyframes scroll {
       0% { transform: translateX(0); }
       100% { transform: translateX(-100%); }
    }
    /* Pause on hover */
    .marquee-container:hover .marquee-content {
        animation-play-state: paused;
    }
  `]
})
export class AnnouncementBarComponent {
   @Input() tenant: Tenant | null = null;
}
