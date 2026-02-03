import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TenantService } from '../services/tenant.service';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  coverUrl?: string;
}

@Component({
  selector: 'app-tenant-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <!-- Simple Header -->
      <header class="bg-white border-b border-gray-200 py-4 px-6">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span class="text-white font-bold text-xl">TC</span>
            </div>
            <span class="text-xl font-bold text-gray-900">Tu Catálogo</span>
          </div>
          <a routerLink="/" class="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Volver al Inicio
          </a>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 flex items-center justify-center px-6 py-12">
        <div class="max-w-2xl w-full text-center">
          
          <!-- 404 Illustration -->
          <div class="mb-8">
            <div class="relative inline-block">
              <!-- Animated Store Icon -->
              <svg class="w-32 h-32 mx-auto text-gray-300 animate-bounce-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              <!-- 404 Badge -->
              <div class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                404
              </div>
            </div>
          </div>

          <!-- Main Message -->
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🏪 Esta tienda no existe... <span class="text-blue-600">¡Todavía!</span>
          </h1>
          
          <p class="text-lg text-gray-600 mb-8">
            Lo sentimos, no pudimos encontrar la tienda 
            <span class="font-semibold text-gray-900">"{{ attemptedSlug }}"</span>. <br>
            Puede que el nombre haya cambiado o la tienda aún no existe.
          </p>

          <!-- Search Box -->
          <div class="mb-8">
            <div class="max-w-md mx-auto">
              <div class="relative">
                <input 
                  type="text" 
                  [(ngModel)]="searchQuery"
                  (keyup.enter)="searchStore()"
                  placeholder="Buscar otra tienda por nombre..."
                  class="w-full px-6 py-4 pr-12 text-gray-700 bg-white border-2 border-gray-300 rounded-full focus:outline-none focus:border-blue-500 transition-colors text-lg shadow-sm"
                >
                <button 
                  (click)="searchStore()"
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button 
              (click)="goToActiveStores()"
              class="px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 hover:shadow-xl transition-all active:scale-95 text-lg">
              🛍️ Ver Tiendas Activas
            </button>
            <a 
              href="https://wa.me/50769965566?text=Hola,%20quiero%20crear%20mi%20tienda%20online"
              target="_blank"
              class="px-8 py-4 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 hover:shadow-lg transition-all active:scale-95 text-lg">
              ✨ Crear Mi Tienda
            </a>
          </div>

          <!-- Popular Stores Section -->
          @if (popularStores.length > 0) {
            <div class="mt-16">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">
                Tiendas que te pueden interesar
              </h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                @for (store of popularStores; track store.id) {
                  <a 
                    [routerLink]="['/', store.slug]"
                    class="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-gray-200 hover:border-blue-600">
                    <!-- Store Cover -->
                    @if (store.coverUrl) {
                      <div class="aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
                        <img 
                          [src]="store.coverUrl" 
                          [alt]="store.name"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                      </div>
                    } @else {
                      <div class="aspect-[16/9] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <span class="text-4xl text-white font-bold">{{ store.name.charAt(0) }}</span>
                      </div>
                    }
                    
                    <!-- Store Info -->
                    <div class="p-4">
                      <div class="flex items-center gap-3 mb-2">
                        @if (store.logoUrl) {
                          <img 
                            [src]="store.logoUrl" 
                            [alt]="store.name"
                            class="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md">
                        }
                        <div class="flex-1 min-w-0">
                          <h3 class="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {{ store.name }}
                          </h3>
                          <p class="text-sm text-gray-500">@{{ store.slug }}</p>
                        </div>
                      </div>
                      <div class="text-sm text-blue-600 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Visitar tienda
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </div>
                  </a>
                }
              </div>
            </div>
          }

          <!-- Help Section -->
          <div class="mt-16 p-6 bg-white rounded-2xl shadow-sm border border-gray-200 max-w-md mx-auto">
            <h3 class="font-semibold text-gray-900 mb-2">¿Necesitas ayuda?</h3>
            <p class="text-gray-600 text-sm mb-4">
              Si crees que esta tienda debería existir o necesitas más información
            </p>
            <a 
              href="https://wa.me/50769965566?text=Hola,%20tengo%20una%20consulta%20sobre%20una%20tienda"
              target="_blank"
              class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contactar Soporte
            </a>
          </div>

        </div>
      </main>

      <!-- Simple Footer -->
      <footer class="bg-white border-t border-gray-200 py-6 mt-auto">
        <div class="max-w-7xl mx-auto px-6 text-center text-sm text-gray-600">
          <p>&copy; {{ currentYear }} Tu Catálogo. Plataforma de tiendas online.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    @keyframes bounce-slow {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-20px);
      }
    }

    .animate-bounce-slow {
      animation: bounce-slow 3s infinite;
    }

    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-slide-in {
      animation: slide-in 0.5s ease-out;
    }
  `]
})
export class TenantNotFoundComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tenantService = inject(TenantService);

  attemptedSlug: string = '';
  searchQuery: string = '';
  popularStores: Tenant[] = [];
  currentYear = new Date().getFullYear();

  ngOnInit() {
    // Get the attempted slug from route
    this.route.params.subscribe(params => {
      this.attemptedSlug = params['slug'] || 'desconocido';
      this.searchQuery = this.attemptedSlug;
    });

    // Don't load popular stores to avoid 401 errors for anonymous users
    // The page works fine without suggestions
    // TODO: In future, create a public endpoint for fetching active tenant slugs
  }

  searchStore() {
    if (!this.searchQuery.trim()) return;

    // Navigate to the searched slug
    const slug = this.searchQuery.trim().toLowerCase().replace(/\s+/g, '-');
    this.router.navigate([slug]);
  }

  goToActiveStores() {
    // Navigate to a page listing all active stores
    // For now, go to home which should show stores
    this.router.navigate(['/']);
  }
}
