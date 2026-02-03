import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-super-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    template: `
    <div class="flex h-screen bg-gray-100 font-sans relative">
      <!-- Mobile Header -->
      <header class="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-20 h-16">
          <button (click)="toggleSidebar()" class="text-gray-600 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span class="font-bold text-gray-900">Super Admin</span>
          <div class="w-6"></div> <!-- Spacer -->
      </header>

      <!-- Sidebar Overlay -->
      <div *ngIf="isSidebarOpen" (click)="toggleSidebar()" class="fixed inset-0 bg-black/50 z-30 md:hidden animate-fade-in"></div>

      <!-- Sidebar -->
      <aside [class.translate-x-0]="isSidebarOpen" [class.-translate-x-full]="!isSidebarOpen" class="fixed inset-y-0 left-0 z-40 w-64 bg-indigo-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen pt-16 md:pt-0">
         <div class="p-6 border-b border-indigo-800 hidden md:block">
             <h2 class="text-xl font-bold tracking-wider">SUPER ADMIN</h2>
             <span class="text-xs text-indigo-300 uppercase tracking-widest">{{ userEmail }}</span>
         </div>
         
         <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
             <a routerLink="dashboard" (click)="closeSidebar()"
                routerLinkActive="bg-indigo-800 text-white" 
                class="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 hover:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                 Dashboard
             </a>
             <a routerLink="tenants" (click)="closeSidebar()"
                routerLinkActive="bg-indigo-800 text-white" 
                class="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 hover:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M17 21v-8H7v8"/></svg>
                 Stores
             </a>
             <a routerLink="users" (click)="closeSidebar()"
                routerLinkActive="bg-indigo-800 text-white" 
                class="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 hover:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                 Users
             </a>
             <a routerLink="plans" (click)="closeSidebar()"
                routerLinkActive="bg-indigo-800 text-white" 
                class="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-800 hover:text-white transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                 Plans
             </a>
         </nav>

         <div class="p-4 border-t border-indigo-800">
             <button (click)="logout()" class="flex items-center gap-2 text-sm text-indigo-300 hover:text-white transition-colors w-full">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                 Logout
             </button>
         </div>
      </aside>

      <!-- Content -->
      <main class="flex-1 overflow-auto bg-gray-50 p-4 md:p-8 pt-20 md:pt-8 text-gray-900">
          <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class SuperAdminLayoutComponent {
    isSidebarOpen = false;
    userEmail = '';
    private authService = inject(AuthService);

    constructor() {
        this.userEmail = this.authService.getCurrentUser()?.email || '';
    }

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    closeSidebar() {
        this.isSidebarOpen = false;
    }

    logout() {
        this.authService.logout();
    }
}
