import { Component, OnInit, ChangeDetectorRef, signal, computed } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TenantService, Tenant } from '../../../services/tenant.service';
import { StickyActionBarComponent } from '../../components/sticky-action-bar/sticky-action-bar.component';
import { CURRENCIES } from '../../../constants/currencies';
import { catchError, debounceTime, take } from 'rxjs/operators';
import { of, Subject } from 'rxjs';

const PAYMENT_PROVIDERS = [
  { id: 'YAPE', name: 'Yape' },
  { id: 'PLIN', name: 'Plin' },
  { id: 'BCP', name: 'BCP' },
  { id: 'BBVA', name: 'BBVA' },
  { id: 'INTERBANK', name: 'Interbank' },
  { id: 'SCOTIABANK', name: 'Scotiabank' },
  { id: 'CASH', name: 'Efectivo / Contraentrega' },
  { id: 'OTHER', name: 'Otro' }
];

@Component({
  selector: 'app-tenant-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StickyActionBarComponent],
  template: `
  <form [formGroup]="form" (ngSubmit)="onSubmit()">
    <app-sticky-action-bar
        title="Configuración de la Tienda"
        subtitle="Gestiona la información general, apariencia y métodos de pago"
        [loading]="saving()"
        [disabled]="form.invalid || slugChecking"
        [showUnsavedIndicator]="form.dirty"
        saveLabel="Guardar Cambios"
        (onSave)="onSubmit()"
        (onCancel)="navigateBack()">
    </app-sticky-action-bar>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-8">

      <!-- Loading State -->
      @if (loading()) {
        <div class="animate-pulse space-y-8">
          <div class="h-48 bg-gray-200 rounded-xl"></div>
          <div class="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      } @else {

        <!-- General Info -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-terra"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Información General
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Branding Section (Logo & Cover) -->
            <div class="md:col-span-2 grid md:grid-cols-[auto_1fr] gap-8 mb-4">
              <!-- Logo Upload -->
              <div class="flex flex-col gap-3">
                 <label class="block text-sm font-medium text-gray-700">Logo de la Tienda</label>
                 <div class="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-gray-300 hover:border-terra bg-gray-50 flex items-center justify-center transition-all"
                      (click)="logoInput.click()">
                    @if (logoPreview) {
                        <img [src]="logoPreview" class="w-full h-full object-cover">
                    } @else {
                        <div class="text-center p-2 text-gray-400 group-hover:text-terra transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto mb-1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <span class="text-xs font-medium">Subir Logo</span>
                        </div>
                    }
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span class="text-white text-xs font-bold">Cambiar</span>
                    </div>
                 </div>
                 <input #logoInput type="file" (change)="onLogoSelected($event)" accept="image/*" class="hidden">
                 <p class="text-xs text-gray-500 text-center">Recomendado: 500x500px</p>
              </div>

              <!-- Cover Upload -->
              <div class="flex flex-col gap-3 flex-1">
                 <label class="block text-sm font-medium text-gray-700">Portada de la Tienda</label>
                 <div class="relative group cursor-pointer w-full h-32 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-terra bg-gray-50 flex items-center justify-center transition-all"
                      (click)="coverInput.click()">
                    @if (coverPreview) {
                        <img [src]="coverPreview" class="w-full h-full object-cover">
                    } @else {
                        <div class="text-center p-4 text-gray-400 group-hover:text-terra transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <span class="text-sm font-medium">Subir imagen de portada</span>
                        </div>
                    }
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <span class="text-white text-sm font-bold">Cambiar Portada</span>
                    </div>
                 </div>
                 <input #coverInput type="file" (change)="onCoverSelected($event)" accept="image/*" class="hidden">
                 <p class="text-xs text-gray-500">Se mostrará en la parte superior de tu catálogo.</p>
              </div>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Nombre de la Tienda <span class="text-red-500">*</span></label>
              <input type="text" formControlName="name" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-terra focus:border-terra outline-none transition-all"
                     [class.border-red-300]="form.get('name')?.invalid && form.get('name')?.touched">
              @if (form.get('name')?.invalid && form.get('name')?.touched) {
                <p class="text-red-500 text-xs mt-1">El nombre es requerido</p>
              }
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                Link de la Tienda (Slug)
                @if (slugChecking) { <span class="text-xs text-blue-500 ml-2 animate-pulse">Verificando...</span> }
              </label>
               <div class="flex rounded-lg shadow-sm">
                  <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    mifiesta.com/
                  </span>
                  <input type="text" formControlName="slug"
                         class="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-terra focus:border-terra sm:text-sm"
                         [class.border-red-300]="(form.get('slug')?.invalid || !slugAvailable) && !slugChecking"
                         [class.border-green-300]="slugAvailable && form.get('slug')?.valid && !slugChecking">
               </div>
               @if (form.get('slug')?.hasError('pattern')) {
                  <p class="text-red-500 text-xs">Solo letras minúsculas, números y guiones</p>
               }
               @if (!slugAvailable && !slugChecking) {
                   <p class="text-red-500 text-xs">Este link ya está en uso</p>
               }
            </div>

            <div class="space-y-2 md:col-span-2">
               <label class="block text-sm font-medium text-gray-700">Descripción / Bio</label>
               <textarea formControlName="bio" rows="3" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-terra focus:border-terra outline-none transition-all resize-none"></textarea>
               <p class="text-xs text-gray-500">Breve descripción de tu negocio que aparecerá en el perfil.</p>
            </div>
            
            <div class="space-y-2">
               <label class="block text-sm font-medium text-gray-700">Moneda</label>
               <select formControlName="currency" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-terra focus:border-terra outline-none bg-white">
                  @for (currency of currencies; track currency.code) {
                      <option [value]="currency.code">{{ currency.name }} ({{ currency.symbol }})</option>
                  }
               </select>
            </div>
          </div>
        </div>

        <!-- Appearance Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-terra"><circle cx="12" cy="12" r="10"/><path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83M16.62 12l-5.74 9.94"/></svg>
                Apariencia de la Tienda
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <!-- Header Layout -->
                 <div class="space-y-2 md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700">Diseño de Cabecera</label>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <!-- Compact -->
                        <label class="relative cursor-pointer">
                            <input type="radio" formControlName="headerLayout" value="compact" class="peer sr-only">
                            <div class="p-4 border rounded-xl hover:border-terra peer-checked:border-terra peer-checked:bg-terra/5 transition-all text-center">
                                <span class="block font-bold text-gray-900 mb-1">Compacto</span>
                                <span class="text-xs text-gray-500">Logo e info optimizados</span>
                            </div>
                        </label>
                         <!-- Minimal -->
                        <label class="relative cursor-pointer">
                            <input type="radio" formControlName="headerLayout" value="minimal" class="peer sr-only">
                            <div class="p-4 border rounded-xl hover:border-terra peer-checked:border-terra peer-checked:bg-terra/5 transition-all text-center">
                                <span class="block font-bold text-gray-900 mb-1">Minimalista</span>
                                <span class="text-xs text-gray-500">Enfoque en productos</span>
                            </div>
                        </label>
                        <!-- Image -->
                         <label class="relative cursor-pointer">
                            <input type="radio" formControlName="headerLayout" value="overlay" class="peer sr-only">
                            <div class="p-4 border rounded-xl hover:border-terra peer-checked:border-terra peer-checked:bg-terra/5 transition-all text-center">
                                <span class="block font-bold text-gray-900 mb-1">Imagen Full</span>
                                <span class="text-xs text-gray-500">Portada como fondo</span>
                            </div>
                        </label>
                    </div>
                 </div>

                 <!-- Theme Colors -->
                 <div class="md:col-span-2 border-t pt-6 mt-2">
                    <div class="flex items-center justify-between mb-4">
                        <label class="text-base font-bold text-gray-900">Paleta de Colores</label>
                        <button type="button" (click)="extractColorsFromLogo()" [disabled]="!logoPreview || extractingColors()"
                                class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1.5 px-3 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                            @if (extractingColors()) {
                                <svg class="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Analizando...
                            } @else {
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                                Extraer del Logo
                            }
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Primary Color -->
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Color Primario (Botones, Títulos)</label>
                            <div class="flex items-center gap-3">
                                <div class="relative w-12 h-12 rounded-full overflow-hidden shadow-sm border border-gray-200 shrink-0 group">
                                    <input type="color" formControlName="themePrimaryColor" class="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0">
                                </div>
                                <div class="flex-1">
                                    <input type="text" formControlName="themePrimaryColor" class="w-full px-3 py-2 border rounded-lg text-sm font-mono uppercase focus:ring-terra focus:border-terra outline-none">
                                    <p class="text-xs text-gray-400 mt-1">Recomendado: Color fuerte de tu marca</p>
                                </div>
                            </div>
                        </div>

                        <!-- Secondary Color -->
                        <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Color Secundario (Fondos, Detalles)</label>
                            <div class="flex items-center gap-3">
                                <div class="relative w-12 h-12 rounded-full overflow-hidden shadow-sm border border-gray-200 shrink-0 group">
                                    <input type="color" formControlName="themeSecondaryColor" class="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0">
                                </div>
                                <div class="flex-1">
                                    <input type="text" formControlName="themeSecondaryColor" class="w-full px-3 py-2 border rounded-lg text-sm font-mono uppercase focus:ring-terra focus:border-terra outline-none">
                                    <p class="text-xs text-gray-400 mt-1">Recomendado: Color suave o complementario</p>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>

                 <!-- Announcement Bar -->
                 <div class="md:col-span-2 border-t pt-6 mt-2">
                    <div class="flex items-center justify-between mb-4">
                        <label class="text-base font-bold text-gray-900">Barra de Anuncios</label>
                        <div class="flex items-center gap-2">
                             <span class="text-sm text-gray-500 mr-2">Mostrar barra superior</span>
                             <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" formControlName="announcementEnabled" class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-terra/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terra"></div>
                             </label>
                        </div>
                    </div>

                    @if (form.get('announcementEnabled')?.value) {
                         <div class="space-y-4 animate-fadeIn">
                            <div class="space-y-2">
                               <label class="block text-sm font-medium text-gray-700">Mensaje del Anuncio</label>
                               <input type="text" formControlName="announcementText" placeholder="Ej: ¡Envío gratis por compras mayores a S/100!" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-terra focus:border-terra outline-none transition-all">
                            </div>
                            
                            <div class="space-y-2">
                               <label class="block text-sm font-medium text-gray-700">Velocidad de Animación</label>
                               <div class="grid grid-cols-3 gap-3">
                                   <label class="cursor-pointer relative">
                                       <input type="radio" formControlName="announcementSpeed" value="slow" class="peer sr-only">
                                       <div class="text-center px-3 py-2 border rounded-lg text-sm font-medium text-gray-600 peer-checked:bg-terra peer-checked:text-white peer-checked:border-terra hover:border-terra/50 hover:bg-gray-50 transition-all">
                                           Lenta
                                       </div>
                                   </label>
                                   <label class="cursor-pointer relative">
                                       <input type="radio" formControlName="announcementSpeed" value="normal" class="peer sr-only">
                                       <div class="text-center px-3 py-2 border rounded-lg text-sm font-medium text-gray-600 peer-checked:bg-terra peer-checked:text-white peer-checked:border-terra hover:border-terra/50 hover:bg-gray-50 transition-all">
                                           Normal
                                       </div>
                                   </label>
                                   <label class="cursor-pointer relative">
                                       <input type="radio" formControlName="announcementSpeed" value="fast" class="peer sr-only">
                                       <div class="text-center px-3 py-2 border rounded-lg text-sm font-medium text-gray-600 peer-checked:bg-terra peer-checked:text-white peer-checked:border-terra hover:border-terra/50 hover:bg-gray-50 transition-all">
                                           Rápida
                                       </div>
                                   </label>
                               </div>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-2">
                                     <label class="block text-sm font-medium text-gray-700">Color de Fondo</label>
                                     <div class="flex items-center gap-2">
                                         <input type="color" formControlName="announcementBgColor" class="h-10 w-20 rounded cursor-pointer">
                                         <input type="text" formControlName="announcementBgColor" class="flex-1 px-3 py-2 border rounded-lg text-sm bg-gray-50">
                                     </div>
                                </div>
                                <div class="space-y-2">
                                     <label class="block text-sm font-medium text-gray-700">Color de Texto</label>
                                      <div class="flex items-center gap-2">
                                         <input type="color" formControlName="announcementTextColor" class="h-10 w-20 rounded cursor-pointer">
                                         <input type="text" formControlName="announcementTextColor" class="flex-1 px-3 py-2 border rounded-lg text-sm bg-gray-50">
                                     </div>
                                </div>
                            </div>
                         </div>
                    }
                 </div>
            </div>
        </div>

        <!-- Contact Info -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
           <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-terra"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Contacto y Pedidos
           </h2>
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                 <label class="block text-sm font-medium text-gray-700">WhatsApp para Pedidos <span class="text-red-500">*</span></label>
                 <input type="text" formControlName="whatsapp" placeholder="51999999999" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-terra focus:border-terra outline-none transition-all">
                 <p class="text-xs text-gray-500">Aquí llegarán los pedidos. Incluye el código de país (ej: 51).</p>
                 @if (form.get('whatsapp')?.invalid && form.get('whatsapp')?.touched) {
                    <p class="text-red-500 text-xs">Este campo es obligatorio para recibir pedidos</p>
                 }
              </div>
              <div class="space-y-2">
                 <label class="block text-sm font-medium text-gray-700">Teléfono Adicional</label>
                 <input type="text" formControlName="phoneNumber" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-terra focus:border-terra outline-none transition-all">
              </div>
              <div class="space-y-2 md:col-span-2">
                 <label class="block text-sm font-medium text-gray-700">Dirección del Local</label>
                 <input type="text" formControlName="address" class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-terra focus:border-terra outline-none transition-all">
              </div>
           </div>
        </div>
        
        <!-- Payment Methods Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-terra"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    Métodos de Pago
                </h2>
                <button type="button" (click)="addPaymentMethod()" 
                    class="text-sm font-bold text-terra hover:text-terra-800 flex items-center gap-1 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Añadir Método
                </button>
            </div>

            <div formArrayName="paymentMethods" class="space-y-4">
                @for (method of paymentMethods.controls; track $index) {
                    <div [formGroupName]="$index" class="border border-gray-200 rounded-xl p-4 bg-gray-50 relative group">
                        <!-- Remove Button -->
                        <button type="button" (click)="removePaymentMethod($index)"
                                class="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                            <!-- Type Selector -->
                            <div class="space-y-1">
                                <label class="text-xs font-semibold text-gray-500 uppercase">Tipo</label>
                                <select formControlName="type" class="w-full px-3 py-2 bg-white border rounded-lg text-sm focus:ring-terra focus:border-terra outline-none">
                                    @for (provider of paymentProviders; track provider.id) {
                                        <option [value]="provider.id">{{ provider.name }}</option>
                                    }
                                </select>
                            </div>

                            <!-- Display Name -->
                            <div class="space-y-1">
                                <label class="text-xs font-semibold text-gray-500 uppercase">Nombre a mostrar</label>
                                <input type="text" formControlName="name" class="w-full px-3 py-2 bg-white border rounded-lg text-sm focus:ring-terra focus:border-terra outline-none" placeholder="Ej: Yape de Juan">
                            </div>

                            <!-- Number/Account -->
                            <div class="space-y-1">
                                <label class="text-xs font-semibold text-gray-500 uppercase">Número / Cuenta</label>
                                <input type="text" formControlName="number" class="w-full px-3 py-2 bg-white border rounded-lg text-sm focus:ring-terra focus:border-terra outline-none font-mono" placeholder="999 999 999">
                            </div>

                             <!-- Instructions -->
                             <div class="space-y-1 md:col-span-2">
                                <label class="text-xs font-semibold text-gray-500 uppercase">Instrucciones (Opcional)</label>
                                <input type="text" formControlName="instruction" class="w-full px-3 py-2 bg-white border rounded-lg text-sm focus:ring-terra focus:border-terra outline-none" placeholder="Ej: Enviar captura por WhatsApp">
                            </div>
                        </div>
                    </div>
                }
                @if (paymentMethods.length === 0) {
                    <div class="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                        <p class="text-sm">No tienes métodos de pago configurados.</p>
                        <button type="button" (click)="addPaymentMethod()" class="text-terra font-bold text-sm mt-2 hover:underline">Agregar uno ahora</button>
                    </div>
                }
            </div>
            
        </div>

        <!-- Wholesale Configuration -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
           <h2 class="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-terra"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Ventas al por Mayor
           </h2>
           <p class="text-sm text-gray-600 mb-6">Activa esta opción para mostrar un botón en cada producto que permita a mayoristas contactarte directamente por WhatsApp.</p>
           
           <div class="flex items-center justify-between p-4 border rounded-lg hover:border-terra/30 transition-colors mb-4">
               <div>
                   <label class="block text-sm font-bold text-gray-900">Habilitar Ventas al por Mayor</label>
                   <p class="text-xs text-gray-500 mt-1">Los clientes verán un botón "Pedido al por Mayor" en la página de productos</p>
               </div>
               <div class="flex items-center">
                    <input type="checkbox" formControlName="wholesaleEnabled" class="w-5 h-5 text-terra rounded focus:ring-terra">
               </div>
           </div>

           @if (form.get('wholesaleEnabled')?.value) {
                <div class="flex items-center justify-between p-4 border rounded-lg hover:border-terra/30 transition-colors animate-fadeIn ml-4 bg-gray-50/50">
                    <div>
                        <label class="block text-sm font-bold text-gray-900">Mostrar etiqueta "Precio Minorista"</label>
                        <p class="text-xs text-gray-500 mt-1">Muestra un texto aclaratorio sobre el precio normal del producto</p>
                    </div>
                    <div class="flex items-center">
                            <input type="checkbox" formControlName="showRetailPriceLabel" class="w-5 h-5 text-terra rounded focus:ring-terra">
                    </div>
                </div>
           }
        </div>

        <!-- Stock Control Configuration -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
           <h2 class="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-terra"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              Control de Inventario
           </h2>
           <p class="text-sm text-gray-600 mb-6">Controla si tu tienda debe validar la disponibilidad de stock. Útil para servicios digitales, dropshipping o pre-órdenes.</p>
           
           <div class="flex items-center justify-between p-4 border rounded-lg hover:border-terra/30 transition-colors">
               <div>
                   <label class="block text-sm font-bold text-gray-900">Activar Validación de Stock</label>
                   <p class="text-xs text-gray-500 mt-1">Cuando está desactivado, todos los productos pueden venderse sin límite de cantidad</p>
               </div>
               <div class="flex items-center">
                    <input type="checkbox" formControlName="useStockControl" class="w-5 h-5 text-terra rounded focus:ring-terra">
               </div>
           </div>
        </div>

        <!-- Social Media -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
           <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-terra"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              Redes Sociales
           </h2>
           <!-- Facebook -->
           <div class="space-y-4">
              <div class="flex items-center gap-4 p-4 border rounded-lg hover:border-terra/30 transition-colors">
                  <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </div>
                  <div class="flex-1">
                      <label class="block text-sm font-bold text-gray-900">Facebook</label>
                      <input type="text" formControlName="socialFacebook" placeholder="Link de tu página" class="w-full text-sm border-none p-0 focus:ring-0 text-gray-600 placeholder:text-gray-300">
                  </div>
                  <div class="flex items-center">
                       <input type="checkbox" formControlName="socialFacebookEnabled" class="w-5 h-5 text-terra rounded focus:ring-terra">
                  </div>
              </div>

               <!-- Instagram -->
              <div class="flex items-center gap-4 p-4 border rounded-lg hover:border-terra/30 transition-colors">
                  <div class="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  </div>
                  <div class="flex-1">
                      <label class="block text-sm font-bold text-gray-900">Instagram</label>
                      <input type="text" formControlName="socialInstagram" placeholder="Link de tu perfil" class="w-full text-sm border-none p-0 focus:ring-0 text-gray-600 placeholder:text-gray-300">
                  </div>
                  <div class="flex items-center">
                       <input type="checkbox" formControlName="socialInstagramEnabled" class="w-5 h-5 text-terra rounded focus:ring-terra">
                  </div>
              </div>

               <!-- TikTok -->
              <div class="flex items-center gap-4 p-4 border rounded-lg hover:border-terra/30 transition-colors">
                  <div class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-900">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                  </div>
                  <div class="flex-1">
                      <label class="block text-sm font-bold text-gray-900">TikTok</label>
                      <input type="text" formControlName="socialTiktok" placeholder="Link de tu usuario" class="w-full text-sm border-none p-0 focus:ring-0 text-gray-600 placeholder:text-gray-300">
                  </div>
                  <div class="flex items-center">
                       <input type="checkbox" formControlName="socialTiktokEnabled" class="w-5 h-5 text-terra rounded focus:ring-terra">
                  </div>
              </div>

               <!-- WhatsApp Community -->
              <div class="flex items-center gap-4 p-4 border rounded-lg hover:border-terra/30 transition-colors">
                  <div class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  </div>
                  <div class="flex-1">
                      <label class="block text-sm font-bold text-gray-900">Grupo/Canal de WhatsApp</label>
                      <input type="text" formControlName="socialWhatsapp" placeholder="Link de invitación" class="w-full text-sm border-none p-0 focus:ring-0 text-gray-600 placeholder:text-gray-300">
                      <p class="text-xs text-gray-500 mt-1">Número completo con código de país, sin espacios ni signos</p>
                  </div>
                  <div class="flex items-center">
                       <input type="checkbox" formControlName="socialWhatsappEnabled" class="w-5 h-5 text-terra rounded focus:ring-terra">
                  </div>
              </div>
           </div>
        </div>

        <!-- Success Modal -->
      @if (showSuccessModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-slideUp">
            <!-- Success Icon -->
            <div class="flex justify-center mb-4">
              <div class="bg-green-100 rounded-full p-3">
                <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>

            <!-- Message -->
            <h3 class="text-xl font-bold text-gray-900 text-center mb-2">¡Configuración Guardada!</h3>
            <p class="text-gray-600 text-center mb-6">Los cambios se han aplicado correctamente. Reinicia la aplicación para ver los cambios en horarios.</p>

            <!-- Close Button -->
            <button type="button" (click)="showSuccessModal.set(false)" 
                    class="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
              Entendido
            </button>
          </div>
        </div>
      }
    }
  </div>
  </form>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
    .animate-slideUp {
      animation: slideUp 0.3s ease-out;
    }
  `]
})
export class TenantSettingsComponent implements OnInit {
  tenant: Tenant | null = null;
  form: FormGroup;
  slug: string | null = null;
  currencies = CURRENCIES;
  paymentProviders = PAYMENT_PROVIDERS;

  loading = signal(true);
  saving = signal(false);
  showSuccessModal = signal(false);

  logoPreview: string | null = null;
  coverPreview: string | null = null;
  selectedLogo: File | null = null;
  selectedCover: File | null = null;

  // Slug validation
  slugChecking = false;
  slugAvailable = true;
  private slugCheckSubject = new Subject<string>();

  extractingColors = signal(false);

  constructor(
    private fb: FormBuilder,
    private tenantService: TenantService,
    private themeService: ThemeService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      address: [''],
      phoneNumber: [''],
      whatsapp: ['', [Validators.required]],
      bio: [''],
      socialFacebook: [''],
      socialInstagram: [''],
      socialTiktok: [''],
      socialYoutube: [''],
      socialWhatsapp: [''],
      socialFacebookEnabled: [false],
      socialInstagramEnabled: [false],
      socialTiktokEnabled: [false],
      socialYoutubeEnabled: [false],
      socialWhatsappEnabled: [false],
      currency: ['PEN'],
      headerLayout: ['compact'],
      announcementEnabled: [false],
      announcementText: [''],
      announcementBgColor: ['#000000'],
      announcementTextColor: ['#ffffff'],
      announcementSpeed: ['normal'],
      themePrimaryColor: ['#b24343'],
      themeSecondaryColor: ['#f4e1d2'],
      wholesaleEnabled: [false],
      showRetailPriceLabel: [true],
      useStockControl: [true], // Stock control enabled by default
      paymentMethods: this.fb.array([])
    });

    // Slug validation debounce
    this.slugCheckSubject.pipe(
      debounceTime(500)
    ).subscribe(slug => {
      this.checkSlugAvailability(slug);
    });
  }

  get paymentMethods() {
    return this.form.get('paymentMethods') as FormArray;
  }

  ngOnInit() {
    this.route.parent?.params.subscribe(params => {
      this.slug = params['slug'];
      if (this.slug) {
        this.loadTenant();
      }
    });

    this.form.get('slug')?.valueChanges.subscribe(value => {
      if (value && this.form.get('slug')?.valid) {
        this.slugChecking = true;
        this.slugCheckSubject.next(value);
      } else {
        this.slugChecking = false;
      }
    });
  }

  loadTenant() {
    if (!this.slug) return;
    this.loading.set(true);

    this.tenantService.getTenant(this.slug).subscribe({
      next: (tenant: Tenant) => {
        this.tenant = tenant;
        this.initForm(tenant);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading tenant', err);
        this.loading.set(false);
        // Handle error (e.g. redirect to 404)
      }
    });
  }

  initForm(tenant: Tenant) {
    this.form.patchValue({
      name: tenant.name,
      slug: tenant.slug,
      address: tenant.address,
      phoneNumber: tenant.phone,
      whatsapp: tenant.whatsapp,
      bio: tenant.bio,
      socialFacebook: tenant.socialFacebook,
      socialInstagram: tenant.socialInstagram,
      socialTiktok: tenant.socialTiktok,
      socialYoutube: tenant.socialYoutube,
      socialWhatsapp: tenant.socialWhatsapp,
      socialFacebookEnabled: !!tenant.socialFacebook,
      socialInstagramEnabled: !!tenant.socialInstagram,
      socialTiktokEnabled: !!tenant.socialTiktok,
      socialYoutubeEnabled: !!tenant.socialYoutube,
      socialWhatsappEnabled: !!tenant.socialWhatsapp,
      currency: tenant.currency || 'PEN',
      headerLayout: tenant.headerLayout || 'compact',
      announcementEnabled: tenant.announcementEnabled || false,
      announcementText: tenant.announcementText || '',
      announcementBgColor: tenant.announcementBgColor || '#000000',
      announcementTextColor: tenant.announcementTextColor || '#ffffff',
      announcementSpeed: tenant.announcementSpeed || 'normal',
      themePrimaryColor: tenant.themePrimaryColor || '#b24343',
      themeSecondaryColor: tenant.themeSecondaryColor || '#f4e1d2',
      wholesaleEnabled: tenant.wholesaleEnabled || false,
      showRetailPriceLabel: tenant.showRetailPriceLabel !== undefined ? tenant.showRetailPriceLabel : true,
      useStockControl: tenant.useStockControl !== undefined ? tenant.useStockControl : true // Default to true
    });

    // Init Payment Methods
    this.initPaymentMethods(tenant.paymentMethods || []);

    this.logoPreview = tenant.logoUrl || null;
    this.coverPreview = tenant.coverUrl || null;

    // Store initial slug to avoid checking if it hasn't changed
  }

  createPaymentMethodGroup(data?: any): FormGroup {
    return this.fb.group({
      type: [data?.type || 'YAPE', Validators.required],
      name: [data?.name || '', Validators.required],
      number: [data?.number || ''],
      instruction: [data?.instruction || ''],
      isActive: [data?.isActive ?? true]
    });
  }

  initPaymentMethods(methods: any[] | string) {
    const formArray = this.paymentMethods;
    formArray.clear();

    let methodArray: any[] = [];

    if (typeof methods === 'string') {
      try {
        methodArray = JSON.parse(methods);
      } catch (e) {
        console.error('Error parsing paymentMethods JSON:', e);
        methodArray = [];
      }
    } else if (Array.isArray(methods)) {
      methodArray = methods;
    }

    if (methodArray && methodArray.length > 0) {
      methodArray.forEach(method => {
        formArray.push(this.createPaymentMethodGroup(method));
      });
    }
  }

  addPaymentMethod() {
    this.paymentMethods.push(this.createPaymentMethodGroup());
    this.form.markAsDirty();
  }

  removePaymentMethod(index: number) {
    this.paymentMethods.removeAt(index);
    this.form.markAsDirty();
  }

  checkSlugAvailability(slug: string) {
    if (this.tenant && slug === this.tenant.slug) {
      this.slugAvailable = true;
      this.slugChecking = false;
      return;
    }

    this.tenantService.checkSlugAvailability(slug).subscribe({
      next: (result) => {
        this.slugAvailable = result.available;
        this.slugChecking = false;
      },
      error: () => {
        this.slugAvailable = false;
        this.slugChecking = false;
      }
    });
  }

  onLogoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedLogo = file;
      this.form.markAsDirty();

      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onCoverSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedCover = file;
      this.form.markAsDirty();

      const reader = new FileReader();
      reader.onload = () => {
        this.coverPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  extractColorsFromLogo() {
    if (!this.logoPreview) return;

    this.extractingColors.set(true);

    this.themeService.extractColorsFromImage(this.logoPreview).then(colors => {
      this.form.patchValue({
        themePrimaryColor: colors.primary,
        themeSecondaryColor: colors.secondary
      });
      this.extractingColors.set(false);
    }).catch(() => {
      this.extractingColors.set(false);
    });
  }

  onSubmit() {
    if (this.form.invalid || !this.tenant) return;

    this.saving.set(true);
    const formValue = this.form.value;

    // Create FormData for file uploads
    const formData = new FormData();
    formData.append('name', formValue.name);
    formData.append('slug', formValue.slug);
    if (formValue.address) formData.append('address', formValue.address);
    if (formValue.phoneNumber) formData.append('phoneNumber', formValue.phoneNumber);
    formData.append('whatsapp', formValue.whatsapp);
    if (formValue.bio) formData.append('bio', formValue.bio);

    // Social media
    if (formValue.socialFacebookEnabled && formValue.socialFacebook) {
      formData.append('socialFacebook', formValue.socialFacebook);
    }
    if (formValue.socialInstagramEnabled && formValue.socialInstagram) {
      formData.append('socialInstagram', formValue.socialInstagram);
    }
    if (formValue.socialTiktokEnabled && formValue.socialTiktok) {
      formData.append('socialTiktok', formValue.socialTiktok);
    }
    if (formValue.socialWhatsappEnabled && formValue.socialWhatsapp) {
      formData.append('socialWhatsapp', formValue.socialWhatsapp);
    }

    formData.append('currency', formValue.currency);
    formData.append('headerLayout', formValue.headerLayout);

    // Announcement
    formData.append('announcementEnabled', String(formValue.announcementEnabled));
    if (formValue.announcementText) formData.append('announcementText', formValue.announcementText);
    if (formValue.announcementBgColor) formData.append('announcementBgColor', formValue.announcementBgColor);
    if (formValue.announcementTextColor) formData.append('announcementTextColor', formValue.announcementTextColor);
    if (formValue.announcementSpeed) formData.append('announcementSpeed', formValue.announcementSpeed);

    // Theme
    formData.append('themePrimaryColor', formValue.themePrimaryColor);
    formData.append('themeSecondaryColor', formValue.themeSecondaryColor);

    // Wholesale
    formData.append('wholesaleEnabled', String(formValue.wholesaleEnabled));
    formData.append('showRetailPriceLabel', String(formValue.showRetailPriceLabel));

    // Stock Control
    formData.append('useStockControl', String(formValue.useStockControl));

    // Payment methods as JSON string
    formData.append('paymentMethods', JSON.stringify(formValue.paymentMethods));

    // Add files if selected
    if (this.selectedLogo) {
      formData.append('logo', this.selectedLogo);
    }
    if (this.selectedCover) {
      formData.append('cover', this.selectedCover);
    }

    this.tenantService.updateTenant(this.tenant.id, formData)
      .subscribe({
        next: (updatedTenant: Tenant) => {
          this.tenant = updatedTenant;
          this.saving.set(false);
          this.form.markAsPristine();
          this.showSuccessModal.set(true);

          // Reset file selections
          this.selectedLogo = null;
          this.selectedCover = null;

          // If slug changed, we might need to navigate
          if (updatedTenant.slug !== this.slug) {
            // Handle navigation or reload
          }
        },
        error: (err: any) => {
          console.error('Error updating tenant', err);
          this.saving.set(false);
          alert('Error al guardar los cambios. Por favor, intenta de nuevo.');
        }
      });
  }

  navigateBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
