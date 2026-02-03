import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <span class="text-xs font-bold text-terra uppercase tracking-wider">Productos</span>
              <p class="text-3xl font-light text-gray-900 mt-2">--</p>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <span class="text-xs font-bold text-terra uppercase tracking-wider">Categorías</span>
              <p class="text-3xl font-light text-gray-900 mt-2">--</p>
          </div>
          <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <span class="text-xs font-bold text-terra uppercase tracking-wider">Ventas (WhatsApp)</span>
              <p class="text-3xl font-light text-gray-900 mt-2">N/A</p>
          </div>
      </div>
      
      <div class="mt-8 bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <div>
          <p class="font-bold">Bienvenido al Admin V2</p>
          <p class="text-sm mt-1">Desde aquí podrás gestionar tu catálogo. Comienza creando Categorías y luego agrega Productos.</p>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent { }
