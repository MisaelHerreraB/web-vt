import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sticky-action-bar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Left: Back button + Title -->
          <div class="flex items-center gap-4 min-w-0 flex-1">
            <a [routerLink]="backRoute" 
               class="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </a>
            <div class="min-w-0 flex-1">
              <h1 class="text-lg font-semibold text-gray-900 truncate">{{ title }}</h1>
              @if (subtitle) {
                <p class="text-sm text-gray-500 truncate">{{ subtitle }}</p>
              }
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="flex items-center gap-3 ml-4">
            @if (showUnsavedIndicator) {
              <span class="text-sm text-orange-600 font-medium hidden sm:inline-flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-pulse">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Cambios sin guardar
              </span>
            }
            
            <button type="button"
                    (click)="onCancel.emit()"
                    class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            
            <button [type]="submitButton ? 'submit' : 'button'"
                    [disabled]="disabled || loading"
                    (click)="handleSave()"
                    class="px-6 py-2 bg-terra text-white rounded-lg font-medium hover:bg-terra-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm">
              @if (loading) {
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Guardando...</span>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <span>{{ saveLabel }}</span>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StickyActionBarComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() backRoute = '../';
  @Input() saveLabel = 'Guardar';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() showUnsavedIndicator = false;
  @Input() submitButton = true; // Default to true for form integration

  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  handleSave() {
    // Only emit event if NOT a submit button (to avoid double submit with ngSubmit)
    if (!this.submitButton) {
      this.onSave.emit();
    }
  }
}
