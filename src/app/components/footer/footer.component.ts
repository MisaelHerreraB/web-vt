import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [CommonModule],
    template: `
    <footer class="bg-gray-50 border-t border-gray-100 pt-12 pb-8 mt-auto w-full">
      <div class="container mx-auto px-4 md:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          
          <!-- Brand & Bio -->
          <div class="flex flex-col items-center md:items-start max-w-sm text-center md:text-left">
            @if (tenant?.logoUrl) {
              <img [src]="tenant.logoUrl" [alt]="tenant.name" class="h-12 w-auto mb-4 object-contain">
            } @else {
              <h2 class="text-2xl font-black tracking-tight text-gray-900 mb-4">{{ tenant?.name }}</h2>
            }
            @if (tenant?.bio) {
              <p class="text-gray-500 text-sm leading-relaxed">{{ tenant.bio }}</p>
            } @else {
              <p class="text-gray-500 text-sm leading-relaxed">Descubre nuestra exclusiva colección de productos pensados para ti. Calidad y diseño en cada detalle.</p>
            }
          </div>

          <!-- Social Links -->
          <div class="flex flex-col items-center md:items-end w-full md:w-auto">
            <h3 class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Síguenos</h3>
            <div class="flex items-center gap-4">
              
              <!-- Facebook -->
              @if (tenant?.socialFacebookEnabled && tenant?.socialFacebook) {
                <a [href]="tenant.socialFacebook" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                   class="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#1877F2] hover:border-[#1877F2] hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              }

              <!-- Instagram -->
              @if (tenant?.socialInstagramEnabled && tenant?.socialInstagram) {
                <a [href]="tenant.socialInstagram" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                   class="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#E4405F] hover:border-[#E4405F] hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              }

              <!-- TikTok -->
              @if (tenant?.socialTiktokEnabled && tenant?.socialTiktok) {
                <a [href]="tenant.socialTiktok" target="_blank" rel="noopener noreferrer" aria-label="TikTok"
                   class="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                </a>
              }

              <!-- YouTube -->
              @if (tenant?.socialYoutubeEnabled && tenant?.socialYoutube) {
                <a [href]="tenant.socialYoutube" target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                   class="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#FF0000] hover:border-[#FF0000] hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48L15.5 11.75l-5.75 3.27z"/></svg>
                </a>
              }

              <!-- WhatsApp -->
              @if (tenant?.socialWhatsappEnabled && tenant?.socialWhatsapp) {
                <a [href]="'https://wa.me/' + tenant.socialWhatsapp" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
                   class="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#25D366] hover:border-[#25D366] hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </a>
              }

            </div>
          </div>

        </div>

        <div class="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-xs text-gray-400 text-center md:text-left">
            &copy; {{ currentYear }} {{ tenant?.name }}. Todos los derechos reservados.
          </p>
          <div class="flex items-center gap-4 text-xs text-gray-400">
            <!-- reCAPTCHA compliance -->
            <p class="text-center md:text-right">
              Protegido por reCAPTCHA. 
              <a href="https://policies.google.com/privacy" target="_blank" class="hover:text-gray-600 hover:underline">Privacidad</a> y 
              <a href="https://policies.google.com/terms" target="_blank" class="hover:text-gray-600 hover:underline">Términos</a>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
    @Input() tenant: any = null;
    currentYear = new Date().getFullYear();
}
