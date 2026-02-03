import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { IconPickerComponent } from '../../components/icon-picker/icon-picker';
import { StickyActionBarComponent } from '../../components/sticky-action-bar/sticky-action-bar.component';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule, IconPickerComponent, StickyActionBarComponent],
  template: `
    <form (ngSubmit)="onSubmit()">
      <app-sticky-action-bar
        [title]="isEditMode ? 'Editar Categoría' : 'Nueva Categoría'"
        [subtitle]="name || 'Completa la información de la categoría'"
        [saveLabel]="isEditMode ? 'Actualizar Categoría' : 'Guardar Categoría'"
        [loading]="loading"
        [disabled]="!name"
        backRoute="../"
        (onSave)="onSubmit()"
        (onCancel)="navigateBack()">
      </app-sticky-action-bar>

      <div class="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 py-8">
        <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          @if (initialLoading) {
              <div class="animate-pulse space-y-6">
                  <div>
                      <div class="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                      <div class="h-12 w-full bg-gray-200 rounded-lg"></div>
                  </div>
                  <div>
                      <div class="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                      <div class="h-48 w-full bg-gray-200 rounded-lg"></div>
                  </div>
              </div>
          } @else {
              <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Nombre de la Categoría</label>
                  <input type="text" 
                         [(ngModel)]="name" 
                         name="name"
                         required
                         class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-terra focus:ring-2 focus:ring-terra/20 outline-none transition-all"
                         placeholder="Ej. Sneakers, Camisetas...">
              </div>

              <!-- Image Upload Section -->
              <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Imagen de la Categoría</label>
                  <p class="text-xs text-gray-400 mb-3">Sube una imagen personalizada o selecciona un ícono más abajo.</p>
                  
                  @if (imagePreview) {
                      <!-- Image Preview -->
                      <div class="mb-4">
                          <div class="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-200">
                              <img [src]="imagePreview" alt="Preview" class="w-full h-full object-cover">
                          </div>
                          <button type="button"
                                  (click)="removeImage()"
                                  class="mt-2 text-sm text-red-600 hover:text-red-700 font-medium">
                              ✕ Eliminar imagen
                          </button>
                      </div>
                  }
                  
                  <!-- File Input -->
                  <label class="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span class="text-sm font-medium">{{ imagePreview ? 'Cambiar imagen' : 'Subir imagen' }}</span>
                      <input type="file" 
                             accept="image/*" 
                             (change)="onImageSelected($event)"
                             class="hidden">
                  </label>
              </div>

              <div class="mb-8">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Ícono (Opcional)</label>
                  <p class="text-xs text-gray-400 mb-3">Selecciona un ícono si no subes una imagen personalizada.</p>
                  <app-icon-picker 
                      [selectedIcon]="iconName"
                      (iconSelected)="iconName = $event">
                  </app-icon-picker>
              </div>
          }
        </div>
      </div>
    </form>
  `
})
export class CategoryFormComponent implements OnInit {
  name = '';
  iconName = '';
  imageUrl: string | null = null;
  imagePreview: string | null = null;
  selectedImage: File | null = null;
  categoryId: string | null = null;
  isEditMode = false;
  loading = false;
  initialLoading = false;

  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    // Check if we're in edit mode (route has categoryId parameter)
    this.categoryId = this.route.snapshot.paramMap.get('categoryId');
    this.isEditMode = !!this.categoryId;

    if (this.isEditMode && this.categoryId) {
      this.loadCategory();
    }
  }

  loadCategory() {
    const slug = this.route.parent?.snapshot.paramMap.get('slug');
    console.log('CategoryFormComponent: loadCategory', { slug, categoryId: this.categoryId });

    if (slug && this.categoryId) {
      this.initialLoading = true;
      console.log('CategoryFormComponent: calling getCategory');
      this.categoryService.getCategory(this.categoryId).subscribe({
        next: (category) => {
          console.log('CategoryFormComponent: loaded', category);
          this.name = category.name;
          this.iconName = category.iconName || '';
          this.imageUrl = category.imageUrl || null;
          this.imagePreview = this.imageUrl; // Show existing image
          this.initialLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading category:', err);
          alert('Error al cargar la categoría');
          this.initialLoading = false;
          this.cdr.detectChanges();
          this.router.navigate(['../'], { relativeTo: this.route });
        }
      });
    } else {
      console.warn('CategoryFormComponent: Missing slug or categoryId', { slug, categoryId: this.categoryId });
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
    this.imageUrl = null;
  }

  navigateBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onSubmit() {
    const slug = this.route.parent?.snapshot.paramMap.get('slug');
    if (!slug || !this.name) return;

    this.loading = true;

    // Create FormData
    const formData = new FormData();
    formData.append('name', this.name);
    if (this.iconName) {
      formData.append('iconName', this.iconName);
    }
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    const operation = this.isEditMode && this.categoryId
      ? this.categoryService.updateCategory(this.categoryId, formData)
      : this.categoryService.createCategory(formData);

    operation.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (err) => {
        this.loading = false;
        console.error('Error:', err);
        alert(`Error al ${this.isEditMode ? 'actualizar' : 'crear'} la categoría`);
      }
    });
  }
}
