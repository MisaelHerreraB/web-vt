import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { TenantService, Tenant } from '../../services/tenant.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="flex h-screen bg-gray-100 font-sans relative">
      <!-- Mobile Header -->
      <header class="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-20 h-16">
          <button (click)="toggleSidebar()" class="text-gray-600 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span class="font-bold text-gray-900">{{ (tenant$ | async)?.name }}</span>
          <div class="w-6"></div> <!-- Spacer -->
      </header>

      <!-- Sidebar Overlay -->
      <div *ngIf="isSidebarOpen" (click)="toggleSidebar()" class="fixed inset-0 bg-black/50 z-30 md:hidden animate-fade-in"></div>

      <!-- Sidebar -->
      <aside [class.translate-x-0]="isSidebarOpen" [class.-translate-x-full]="!isSidebarOpen" class="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen pt-16 md:pt-0">
         <div class="p-6 border-b border-gray-100 hidden md:block">
             <h2 class="text-xl font-bold text-terra uppercase tracking-wider">{{ (tenant$ | async)?.name }}</h2>
             <span class="text-xs text-gray-400 uppercase tracking-widest">Admin Panel</span>
         </div>
         
         <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
             <a routerLink="dashboard" (click)="closeSidebar()"
                routerLinkActive="bg-terra/5 text-terra font-medium" 
                class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                 Dashboard
             </a>
             <a routerLink="categories" (click)="closeSidebar()"
             routerLinkActive="bg-terra/5 text-terra font-medium" 
                class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>
                 Categorías
             </a>
             <a routerLink="products" (click)="closeSidebar()"
             routerLinkActive="bg-terra/5 text-terra font-medium" 
                class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22v-9"/></svg>
                 Productos
             </a>
             <a routerLink="orders" (click)="closeSidebar()"
             routerLinkActive="bg-terra/5 text-terra font-medium" 
                class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                 Pedidos
             </a>
             <a routerLink="promotions" (click)="closeSidebar()"
             routerLinkActive="bg-terra/5 text-terra font-medium" 
                class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                 Promociones
             </a>
             <a routerLink="settings" (click)="closeSidebar()"
             routerLinkActive="bg-terra/5 text-terra font-medium" 
                class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.18-.08a2 2 0 0 0-2 0l-.45.45a2 2 0 0 0 0 2l.08.18a2 2 0 0 1 0 2l-.25.43a2 2 0 0 1-1.73 1H2a2 2 0 0 0-2 2v.45a2 2 0 0 0 2 2h.18a2 2 0 0 1 1.73 1l.25.43a2 2 0 0 1 0 2l-.08.18a2 2 0 0 0 0 2l.45.45a2 2 0 0 0 2 0l.18-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.18.08a2 2 0 0 0 2 0l.45-.45a2 2 0 0 0 0-2l-.08-.18a2 2 0 0 1 0-2l.25-.43a2 2 0 0 1 1.73-1H22a2 2 0 0 0 2-2v-.45a2 2 0 0 0-2-2h-.18a2 2 0 0 1-1.73-1l-.25-.43a2 2 0 0 1 0-2l.08-.18a2 2 0 0 0 0-2l-.45-.45a2 2 0 0 0-2 0l-.18.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                 Configuración
             </a>
         </nav>

         <div class="p-4 border-t border-gray-100 flex flex-col gap-2">
             <a [routerLink]="['/', slug]" class="flex items-center gap-2 text-sm text-gray-500 hover:text-terra transition-colors px-2 py-1">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v18h-6M10 17l5-5-5-5M13.8 12H3"/></svg>
                 Ir a la Tienda
             </a>
             <button (click)="logout()" class="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors w-full text-left px-2 py-1">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                 Cerrar Sesión
             </button>
         </div>
      </aside>

      <!-- Content -->
      <main class="flex-1 overflow-auto bg-gray-50 p-4 md:p-8 pt-20 md:pt-8">
          <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  @Input() slug!: string;
  isSidebarOpen = false;
  tenant$!: Observable<Tenant>;
  private tenantService = inject(TenantService);
  private authService = inject(AuthService);

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  logout() {
    this.authService.logout();
  }

  ngOnInit() {
    if (this.slug) {
      this.tenant$ = this.tenantService.getTenant(this.slug);
    }
  }
}
