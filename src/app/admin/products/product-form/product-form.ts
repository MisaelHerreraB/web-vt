import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ProductService } from '../../../services/product.service';
import { CategoryService, Category } from '../../../services/category.service';
import { StickyActionBarComponent } from '../../components/sticky-action-bar/sticky-action-bar.component';
import { tap } from 'rxjs/operators';

interface VariantOptionValueDraft {
    name: string;
    price: number;
}

interface VariantOptionDraft {
    name: string; // e.g. "Tipo de Masa"
    values: VariantOptionValueDraft[];
}

interface VariantDraft {
    name: string; // e.g., "Size", "Color"
    value: string; // e.g., "M", "Red"
    price: number;
    stock: number;
    imageIndexes?: number[]; // Indexes of images assigned to this variant
    options?: VariantOptionDraft[]; // Nested options
}

@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [CommonModule, FormsModule, StickyActionBarComponent],
    template: `
    <form (ngSubmit)="onSubmit()">
        <app-sticky-action-bar
            [title]="isEditing ? 'Editar Producto' : 'Nuevo Producto'"
            [subtitle]="title || 'Completa la información del producto'"
            [saveLabel]="isEditing ? 'Actualizar Producto' : 'Guardar Producto'"
            [disabled]="!title || !price"
            [loading]="uploading"
            backRoute="../"
            (onSave)="onSubmit()"
            (onCancel)="navigateBack()">
        </app-sticky-action-bar>

        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 py-8 space-y-8">
            <!-- Basic Info -->
            <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <h3 class="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">Información Básica</h3>
                
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto</label>
                        <input type="text" [(ngModel)]="title" name="title" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-terra focus:ring-2 focus:ring-terra/20 outline-none transition-all">
                    </div>

                    <div class="col-span-2">
                         <label class="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                         <select [(ngModel)]="categoryId" name="categoryId" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-terra focus:ring-2 focus:ring-terra/20 outline-none transition-all">
                             <option value="" disabled selected>Selecciona una categoría</option>
                             @for (cat of categories; track cat.id) {
                                 <option [value]="cat.id">{{ cat.name }}</option>
                             }
                         </select>
                    </div>

                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                        <textarea [(ngModel)]="description" name="description" rows="4" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-terra focus:ring-2 focus:ring-terra/20 outline-none transition-all"></textarea>
                        
                        <!-- Formatting Help -->
                        <div class="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <div class="flex items-start gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600 flex-shrink-0 mt-0.5">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 16v-4"/>
                                    <path d="M12 8h.01"/>
                                </svg>
                                <div class="flex-1">
                                    <p class="text-xs font-bold text-blue-900 mb-1">💡 Formato de texto disponible:</p>
                                    <div class="text-xs text-blue-700 space-y-0.5">
                                        <div class="flex flex-wrap gap-x-4 gap-y-1">
                                            <span><code class="bg-blue-100 px-1.5 py-0.5 rounded text-[11px]">**texto**</code> = <strong>negrita</strong></span>
                                            <span><code class="bg-blue-100 px-1.5 py-0.5 rounded text-[11px]">__texto__</code> = <u>subrayado</u></span>
                                            <span><code class="bg-blue-100 px-1.5 py-0.5 rounded text-[11px]">*texto*</code> = <em>cursiva</em></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Precio Base ($)</label>
                        <input type="number" [(ngModel)]="price" name="price" required min="0" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-terra focus:ring-2 focus:ring-terra/20 outline-none transition-all">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Stock General</label>
                        <input type="number" [(ngModel)]="stock" name="stock" required min="0" class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-terra focus:ring-2 focus:ring-terra/20 outline-none transition-all">
                        <p class="text-xs text-gray-500 mt-1">Si usas variantes, este stock es el fallback.</p>
                    </div>

                    <!-- Visibility Settings -->
                    <div class="col-span-2 pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-6">
                        <div class="flex items-center">
                            <input type="checkbox" [(ngModel)]="urgencyOverride" name="urgencyOverride" id="urgencyOverride" class="w-5 h-5 text-terra rounded border-gray-300 focus:ring-terra">
                            <label for="urgencyOverride" class="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
                                🔔 Forzar Modo "Urgencia"
                                <p class="text-xs text-gray-500 font-normal">Muestra "Pocas Unidades" aunque haya stock.</p>
                            </label>
                        </div>
                        <div class="flex items-center">
                            <input type="checkbox" [(ngModel)]="ignoreStock" name="ignoreStock" id="ignoreStock" class="w-5 h-5 text-terra rounded border-gray-300 focus:ring-terra">
                            <label for="ignoreStock" class="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
                                ∞ Venta Ilimitada (Ignorar Stock)
                                <p class="text-xs text-gray-500 font-normal">Este producto se podrá vender siempre, sin importar el stock.</p>
                            </label>
                        </div>
                        
                        <!-- Show Stock Quantity -->
                         <div class="flex items-center">
                            <input type="checkbox" [(ngModel)]="showStockQuantity" name="showStockQuantity" id="showStockQuantity" class="w-5 h-5 text-terra rounded border-gray-300 focus:ring-terra">
                            <label for="showStockQuantity" class="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
                                📊 Mostrar Cantidad en Urgencia
                                <p class="text-xs text-gray-500 font-normal">Muestra "Solo quedan X unidades" en la alerta.</p>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Multi-Image Gallery -->
            <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div class="flex justify-between items-center border-b border-gray-100 pb-2">
                    <h3 class="text-lg font-bold text-gray-900">Imágenes del Producto</h3>
                    <span class="text-sm text-gray-500">{{ productImages.length + selectedImages.length }}/20</span>
                </div>

                <!-- Existing Images (from server) -->
                @if (productImages.length > 0) {
                    <div>
                        <p class="text-sm font-medium text-gray-700 mb-3">Imágenes Actuales</p>
                        <div class="grid grid-cols-4 md:grid-cols-6 gap-4">
                            @for (img of productImages; track img) {
                                <div class="relative group aspect-square">
                                    <img [src]="img" class="w-full h-full object-cover rounded-lg border border-gray-200">
                                    <button type="button" 
                                            (click)="removeProductImage($index)"
                                            class="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                    @if ($index === 0) {
                                        <div class="absolute bottom-1 left-1 bg-terra text-white text-xs px-2 py-0.5 rounded-full z-10">Principal</div>
                                    } @else {
                                        <button type="button" 
                                                (click)="setAsMainImage($index)"
                                                class="absolute bottom-1 left-1 bg-white/90 hover:bg-white text-gray-800 text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                            Principal
                                        </button>
                                    }
                                </div>
                            }
                        </div>
                    </div>
                }

                <!-- Selected New Images (preview before upload) -->
                @if (selectedImages.length > 0) {
                    <div>
                        <p class="text-sm font-medium text-gray-700 mb-3">Nuevas Imágenes ({{ selectedImages.length }})</p>
                        <div class="grid grid-cols-4 md:grid-cols-6 gap-4">
                            @for (preview of imagePreviews; track $index) {
                                <div class="relative group aspect-square">
                                    <img [src]="preview" class="w-full h-full object-cover rounded-lg border border-gray-200">
                                    <button type="button"
                                            (click)="removeSelectedImage($index)"
                                            class="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                    </button>
                                </div>
                            }
                        </div>
                    </div>
                }

                <!-- Upload Button -->
                <div>
                    <input type="file" 
                           #fileInput
                           (change)="onMultipleFilesSelected($event)" 
                           accept="image/*" 
                           multiple 
                           class="hidden">
                    
                    <button type="button"
                            (click)="fileInput.click()"
                            [disabled]="(productImages.length + selectedImages.length) >= 20"
                            class="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-terra hover:bg-terra/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                        <span class="text-sm font-medium text-gray-700">Click para seleccionar imágenes</span>
                        <span class="text-xs text-gray-500">JPG, PNG, WEBP - Max 5MB c/u - Hasta 20 total</span>
                    </button>
                </div>

                <!-- Upload Progress -->
                @if (uploadProgress > 0 && uploadProgress < 100) {
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium text-blue-900">Subiendo imágenes...</span>
                            <span class="text-sm text-blue-700">{{ uploadProgress }}%</span>
                        </div>
                        <div class="w-full bg-blue-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" [style.width.%]="uploadProgress"></div>
                        </div>
                    </div>
                }

                <!-- Upload New Images Button -->
                @if (selectedImages.length > 0 && isEditing) {
                    <button type="button"
                            (click)="uploadNewImages()"
                            [disabled]="uploading"
                            class="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        {{ uploading ? 'Subiendo...' : 'Subir ' + selectedImages.length + ' Nueva(s) Imagen(es)' }}
                    </button>
                }
            </div>


            <!-- Variants -->
            <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div class="flex justify-between items-center border-b border-gray-100 pb-2">
                    <h3 class="text-lg font-bold text-gray-900">Variantes (Opcional)</h3>
                    <button type="button" (click)="addVariant()" class="text-sm text-terra font-bold hover:underline">+ Agregar Variante</button>
                </div>

                <div class="space-y-6">
                    @for (variant of variants; track $index; let variantIndex = $index) {
                        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <!-- Variant Fields -->
                            <div class="grid grid-cols-12 gap-4 items-end">
                                <div class="col-span-3">
                                    <label class="block text-xs font-bold text-gray-500 mb-1">Nombre</label>
                                    <input type="text" [(ngModel)]="variant.name" [name]="'v_name_'+variantIndex" placeholder="Talla" class="w-full px-3 py-2 rounded border border-gray-300 text-sm">
                                </div>
                                <div class="col-span-3">
                                    <label class="block text-xs font-bold text-gray-500 mb-1">Valor</label>
                                    <input type="text" [(ngModel)]="variant.value" [name]="'v_val_'+variantIndex" placeholder="M" class="w-full px-3 py-2 rounded border border-gray-300 text-sm">
                                </div>
                                <div class="col-span-2">
                                    <label class="block text-xs font-bold text-gray-500 mb-1">Precio (Opcional)</label>
                                    <input type="number" [(ngModel)]="variant.price" [name]="'v_price_'+variantIndex" placeholder="0 = Heredado" class="w-full px-3 py-2 rounded border border-gray-300 text-sm">
                                    <p class="text-[10px] text-gray-400 mt-0.5">Si se deja en 0, usa el precio base.</p>
                                </div>
                                <div class="col-span-2">
                                    <label class="block text-xs font-bold text-gray-500 mb-1">Stock</label>
                                    <input type="number" [(ngModel)]="variant.stock" [name]="'v_st_'+variantIndex" class="w-full px-3 py-2 rounded border border-gray-300 text-sm">
                                </div>
                                <div class="col-span-2 flex justify-end">
                                    <button type="button" (click)="removeVariant(variantIndex)" class="text-red-500 hover:text-red-700 p-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                    </button>
                                </div>
                            </div>

                            <!-- Image Selection for Variant -->
                            @if (getAllProductImages().length > 0) {
                                <div class="border-t border-gray-200 pt-4">
                                    <div class="flex items-center justify-between mb-3">
                                        <label class="block text-xs font-bold text-gray-700">
                                            Imágenes para esta variante
                                            @if (variant.imageIndexes && variant.imageIndexes.length > 0) {
                                                <span class="ml-2 text-terra">({{ variant.imageIndexes.length }} seleccionadas)</span>
                                            } @else {
                                                <span class="ml-2 text-gray-400">(todas)</span>
                                            }
                                        </label>
                                        @if (variant.imageIndexes && variant.imageIndexes.length > 0) {
                                            <button type="button" 
                                                    (click)="clearVariantImages(variantIndex)"
                                                    class="text-xs text-gray-500 hover:text-terra">
                                                Limpiar selección
                                            </button>
                                        }
                                    </div>
                                    <div class="grid grid-cols-6 md:grid-cols-8 gap-2">
                                        @for (img of getAllProductImages(); track imgIndex; let imgIndex = $index) {
                                            <div class="relative group">
                                                <label class="cursor-pointer block">
                                                    <div class="aspect-square rounded-lg overflow-hidden border-2 transition-all"
                                                         [class.border-terra]="isImageSelectedForVariant(variantIndex, imgIndex)"
                                                         [class.border-gray-200]="!isImageSelectedForVariant(variantIndex, imgIndex)"
                                                         [class.opacity-50]="!isImageSelectedForVariant(variantIndex, imgIndex)">
                                                        <img [src]="img" class="w-full h-full object-cover">
                                                    </div>
                                                    <input type="checkbox"
                                                           [checked]="isImageSelectedForVariant(variantIndex, imgIndex)"
                                                           (change)="toggleImageForVariant(variantIndex, imgIndex)"
                                                           class="absolute top-1 right-1 w-4 h-4 rounded border-2 border-white shadow-lg accent-terra">
                                                </label>
                                            </div>
                                        }
                                    </div>
                                    <p class="text-xs text-gray-500 mt-2 italic">
                                        💡 Si no seleccionas ninguna imagen, se mostrarán todas las del producto
                                    </p>
                                </div>
                            }

                            <!-- Nested Options (Sub-variants) -->
                            <div class="border-t border-gray-200 pt-4 mt-4">
                                <div class="flex justify-between items-center mb-3">
                                    <h4 class="text-xs font-bold text-gray-700 uppercase tracking-wider">Opciones de Variante</h4>
                                    <button type="button" (click)="addOptionToVariant(variantIndex)" class="text-xs text-blue-600 font-bold hover:underline">+ Nueva Opción</button>
                                </div>

                                @if (variant.options && variant.options.length > 0) {
                                    <div class="space-y-4">
                                        @for (option of variant.options; track optIndex; let optIndex = $index) {
                                            <div class="bg-white rounded border border-gray-200 p-3">
                                                <!-- Option Header -->
                                                <div class="flex items-center gap-2 mb-3">
                                                    <div class="flex-1">
                                                        <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nombre de la Opción</label>
                                                        <input type="text" 
                                                               [(ngModel)]="option.name" 
                                                               [name]="'v_'+variantIndex+'_opt_'+optIndex+'_name'" 
                                                               placeholder="Ej: Tipo de Masa" 
                                                               class="w-full px-2 py-1.5 rounded border border-gray-300 text-sm">
                                                    </div>
                                                    <button type="button" (click)="removeOptionFromVariant(variantIndex, optIndex)" class="text-red-500 hover:text-red-700 p-1 self-end">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                                    </button>
                                                </div>

                                                <!-- Option Values -->
                                                <div class="pl-4 border-l-2 border-gray-100 space-y-2">
                                                    <label class="block text-[10px] font-bold text-gray-400 uppercase">Valores Seleccionables</label>
                                                    @for (val of option.values; track valIndex; let valIndex = $index) {
                                                        <div class="flex items-center gap-2">
                                                            <input type="text" 
                                                                   [(ngModel)]="val.name" 
                                                                   [name]="'v_'+variantIndex+'_opt_'+optIndex+'_val_'+valIndex+'_name'"
                                                                   placeholder="Valor (ej: Gruesa)" 
                                                                   class="flex-1 px-2 py-1 rounded border border-gray-300 text-sm">
                                                                    <div class="flex flex-col flex-1 pl-2">
                                                                        <div class="relative">
                                                                            <span class="absolute left-2 top-1.5 text-gray-400 text-xs">$</span>
                                                                            <input type="number" 
                                                                                [(ngModel)]="val.price" 
                                                                                [name]="'v_'+variantIndex+'_opt_'+optIndex+'_val_'+valIndex+'_price'"
                                                                                placeholder="0" 
                                                                                class="w-full pl-5 pr-2 py-1 rounded border border-gray-300 text-sm">
                                                                        </div>
                                                                        <p class="text-[9px] text-gray-400 mt-0.5 leading-tight">Reemplaza otros precios. 0/Vacío = Heredado.</p>
                                                                    </div>
                                                                    <button type="button" (click)="removeValueFromOption(variantIndex, optIndex, valIndex)" class="text-gray-400 hover:text-red-500 self-start mt-1.5">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                                                    </button>
                                                        </div>
                                                    }
                                                    <button type="button" (click)="addValueToOption(variantIndex, optIndex)" class="text-xs text-green-600 font-medium hover:underline mt-1">+ Agregar Valor</button>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                } @else {
                                    <p class="text-xs text-gray-400 italic">No hay opciones adicionales configuradas.</p>
                                }
                            </div>
                        </div>
                    }
                    @if (variants.length === 0) {
                        <p class="text-sm text-gray-500 italic text-center py-4">Sin variantes. El producto usará el precio y stock base.</p>
                    }
                </div>
            </div>
            <!-- Delete Zone -->
             @if (isEditing) {
                <div class="pt-8 border-t border-gray-200">
                    <div class="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 class="text-sm font-bold text-red-900">Zona de Peligro</h3>
                            <p class="text-xs text-red-700 mt-1">Eliminar este producto borrará permanentemente sus datos e imágenes.</p>
                        </div>
                        <button type="button" 
                                (click)="deleteProduct()"
                                [disabled]="uploading"
                                class="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-50">
                            {{ uploading ? 'Procesando...' : 'Eliminar Producto' }}
                        </button>
                    </div>
                </div>
            }
        </div>

        @if (uploading) {
            <!-- Loading Overlay -->
            <div class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div class="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-sm w-full text-center space-y-4">
                    <!-- Spinner -->
                    <div class="relative w-16 h-16 mx-auto">
                        <div class="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                        <div class="absolute inset-0 border-4 border-terra border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    
                    <div>
                        <h3 class="text-lg font-bold text-gray-900">Guardando cambios...</h3>
                        <p class="text-sm text-gray-500 mt-1">Por favor espera mientras procesamos los datos e imágenes.</p>
                    </div>

                    @if (uploadProgress > 0 && uploadProgress < 100) {
                         <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div class="bg-terra h-full transition-all duration-300" [style.width.%]="uploadProgress"></div>
                         </div>
                         <p class="text-xs text-gray-400">Subiendo imágenes {{ uploadProgress }}%</p>
                    }
                </div>
            </div>
        }
    </form>
  `
})
export class ProductFormComponent implements OnInit {
    // fields
    title = '';
    description = '';
    price: number | null = null;
    stock: number | null = null;
    categoryId = '';

    // settings
    // settings
    urgencyOverride = false;
    ignoreStock = false;
    showStockQuantity = false;

    // image
    selectedFile: File | null = null;
    previewUrl: string | null = null;

    // multi-image gallery
    productImages: string[] = [];  // Existing images from server
    selectedImages: File[] = [];  // New images selected
    imagePreviews: string[] = [];  // Preview URLs for selected images
    uploading = false;
    uploadProgress = 0;

    // variants
    variants: VariantDraft[] = [];

    // deps
    categories: Category[] = [];
    private productService = inject(ProductService);
    private categoryService = inject(CategoryService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private cdr = inject(ChangeDetectorRef);

    isEditing = false;
    productId: string | null = null;
    // ... fields ...

    ngOnInit() {
        // 1. Load Categories
        this.categoryService.getCategories().subscribe(data => this.categories = data);

        // 2. Check for Edit Mode
        this.route.paramMap.subscribe(params => {
            this.productId = params.get('productId');
            if (this.productId) {
                this.isEditing = true;
                this.loadProduct(this.productId);
            }
        });
    }

    navigateBack() {
        this.router.navigate(['../'], { relativeTo: this.route });
    }

    loadProduct(id: string) {
        console.log('ProductFormComponent: Loading product with ID:', id);
        this.productService.getProduct(id).subscribe({
            next: (product) => {
                console.log('ProductFormComponent: API Response:', product);

                if (!product) {
                    console.error('ProductFormComponent: Product is null/undefined');
                    return;
                }

                // Basic fields
                this.title = product.title || '';
                this.description = product.description || '';
                this.price = product.price != null ? Number(product.price) : null;
                this.stock = product.stock != null ? Number(product.stock) : 0;

                console.log('ProductFormComponent: Set fields -', {
                    title: this.title,
                    price: this.price,
                    stock: this.stock
                });

                // Extract categoryId from the category object if it exists
                if ((product as any).category && (product as any).category.id) {
                    this.categoryId = (product as any).category.id;
                } else {
                    // Fallback for direct categoryId field
                    this.categoryId = (product as any).categoryId || (product as any).category_id || '';
                }

                // Images
                this.previewUrl = product.imageUrl || null;

                // Reset arrays first
                this.productImages = [];

                // Load existing images
                if (product.images && Array.isArray(product.images) && product.images.length > 0) {
                    this.productImages = [...product.images]; // Copy array
                } else if (product.imageUrl) {
                    // Backwards compatibility: use imageUrl as first image
                    this.productImages = [product.imageUrl];
                }

                console.log('ProductFormComponent: Images loaded -', this.productImages);

                if (product.variants) {
                    this.variants = product.variants.map(v => ({
                        ...v,
                        price: v.price != null ? Number(v.price) : 0,
                        stock: v.stock != null ? Number(v.stock) : 0,
                        imageIndexes: v.imageIndexes ? v.imageIndexes.map(i => Number(i)) : []
                    }));
                }

                // Urgency / Stock settings
                // Force boolean conversion
                if ((product as any).urgencyOverride) this.urgencyOverride = String((product as any).urgencyOverride) === 'true' || (product as any).urgencyOverride === true;
                if ((product as any).ignoreStock) this.ignoreStock = String((product as any).ignoreStock) === 'true' || (product as any).ignoreStock === true;
                if ((product as any).showStockQuantity) this.showStockQuantity = String((product as any).showStockQuantity) === 'true' || (product as any).showStockQuantity === true;

                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading product', err);
                alert('Error cargando datos del producto. Revisa la consola.');
            }
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            // Create preview
            const reader = new FileReader();
            reader.onload = (e: any) => this.previewUrl = e.target.result;
            reader.readAsDataURL(file);
        }
    }

    addVariant() {
        this.variants.push({ name: 'Talla', value: '', price: 0, stock: 0 });
    }

    removeVariant(index: number) {
        this.variants.splice(index, 1);
    }

    // Image selection for variants
    getAllProductImages(): string[] {
        return [...this.productImages, ...this.imagePreviews];
    }

    isImageSelectedForVariant(variantIndex: number, imageIndex: number): boolean {
        const variant = this.variants[variantIndex];
        if (!variant.imageIndexes || variant.imageIndexes.length === 0) {
            return false;
        }
        return variant.imageIndexes.includes(imageIndex);
    }

    toggleImageForVariant(variantIndex: number, imageIndex: number): void {
        const variant = this.variants[variantIndex];

        if (!variant.imageIndexes) {
            variant.imageIndexes = [];
        }

        const index = variant.imageIndexes.indexOf(imageIndex);
        if (index > -1) {
            // Remove if already selected
            variant.imageIndexes.splice(index, 1);
        } else {
            // Add if not selected
            variant.imageIndexes.push(imageIndex);
        }

        // Sort to keep indexes in order
        variant.imageIndexes.sort((a, b) => a - b);
    }

    clearVariantImages(variantIndex: number): void {
        const variant = this.variants[variantIndex];
        variant.imageIndexes = [];
    }

    // Sub-variants (Options)
    addOptionToVariant(variantIndex: number) {
        if (!this.variants[variantIndex].options) {
            this.variants[variantIndex].options = [];
        }
        this.variants[variantIndex].options!.push({
            name: '',
            values: [{ name: '', price: 0 }]
        });
    }

    removeOptionFromVariant(variantIndex: number, optionIndex: number) {
        this.variants[variantIndex].options!.splice(optionIndex, 1);
    }

    addValueToOption(variantIndex: number, optionIndex: number) {
        this.variants[variantIndex].options![optionIndex].values.push({
            name: '',
            price: 0
        });
    }

    removeValueFromOption(variantIndex: number, optionIndex: number, valueIndex: number) {
        this.variants[variantIndex].options![optionIndex].values.splice(valueIndex, 1);
    }

    onSubmit() {
        if (this.uploading) return;

        if (!this.title || !this.price) return;

        // Helper to proceed with save
        const proceedToSave = () => {
            this.uploading = true; // Ensure loading state is active
            const formData = new FormData();
            formData.append('title', this.title);
            formData.append('description', this.description);
            formData.append('price', this.price!.toString());
            formData.append('stock', (this.stock || 0).toString());
            if (this.categoryId) formData.append('categoryId', this.categoryId);

            formData.append('urgencyOverride', this.urgencyOverride.toString());
            formData.append('ignoreStock', this.ignoreStock.toString());
            formData.append('showStockQuantity', this.showStockQuantity.toString());

            // DON'T send images here - they are managed separately via:
            // - removeProductImage()
            // - setAsMainImage()
            // - uploadNewImages()
            // Sending here would overwrite those changes!

            if (this.selectedFile) {
                formData.append('image', this.selectedFile);
            }

            // Always send variants, even if empty, to allow deletion of all variants
            const variantsToSend = this.variants.map(v => ({
                ...v,
                price: v.price || 0, // Ensure empty/null becomes 0
                options: v.options?.map(o => ({
                    ...o,
                    values: o.values.map(val => ({
                        ...val,
                        price: val.price || 0 // Ensure empty/null becomes 0
                    }))
                })),
                imageIndexes: v.imageIndexes || []
            }));
            formData.append('variants', JSON.stringify(variantsToSend));

            if (this.isEditing && this.productId) {
                this.productService.updateProduct(this.productId, formData).subscribe({
                    next: () => this.router.navigate(['../../products'], { relativeTo: this.route }),
                    error: (err) => {
                        console.error('Update error:', err);
                        alert('Error updating product: ' + (err.error?.message || err.message || 'Unknown error'));
                        this.uploading = false;
                    }
                });
            } else {
                this.productService.createProduct(formData).subscribe({
                    next: (newProduct) => {
                        // If we have selected images, upload them now using the new product ID
                        if (this.selectedImages.length > 0 && newProduct.id) {
                            this.uploadNewImagesInternal(newProduct.id).subscribe({
                                next: () => {
                                    this.router.navigate(['../'], { relativeTo: this.route });
                                },
                                error: (err) => {
                                    console.error('Error uploading images for new product:', err);
                                    alert('Producto creado correctamente, pero hubo un error al subir las imágenes.');
                                    this.router.navigate(['../'], { relativeTo: this.route });
                                }
                            });
                        } else {
                            this.router.navigate(['../'], { relativeTo: this.route });
                        }
                    },
                    error: (err) => {
                        console.error('Create error:', err);
                        alert('Error creating product');
                        this.uploading = false;
                    }
                });
            }
        };

        // If there are selected images to upload, do it first
        if (this.selectedImages.length > 0 && this.productId) {
            this.uploadNewImagesInternal(this.productId).subscribe({
                next: (response) => {
                    // Update local state is handled in internal method
                    // Now proceed to save product (which updates variants with correct indexes)
                    proceedToSave();
                },
                error: (err) => {
                    console.error('Upload error:', err);
                    alert('Error subiendo imágenes. El producto no se guardó.');
                    this.uploading = false;
                }
            });
        } else {
            proceedToSave();
        }
    }

    deleteProduct() {
        if (!this.productId) return;

        if (!confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer y borrará también las imágenes asociadas.')) {
            return;
        }

        this.uploading = true; // Show loading state

        this.productService.deleteProduct(this.productId).subscribe({
            next: () => {
                alert('Producto eliminado correctamente.');
                this.router.navigate(['../../products'], { relativeTo: this.route });
            },
            error: (err) => {
                console.error('Error deleting product:', err);
                alert('Hubo un error al eliminar el producto: ' + (err.error?.message || err.message));
                this.uploading = false;
            }
        });
    }

    // Multi-Image Methods
    onMultipleFilesSelected(event: any) {
        const files: FileList = event.target.files;
        if (!files || files.length === 0) return;

        const maxTotal = 20;
        const currentTotal = this.productImages.length + this.selectedImages.length;
        const availableSlots = maxTotal - currentTotal;

        if (availableSlots <= 0) {
            alert('Ya tienes 20 imágenes. Elimina algunas para agregar más.');
            return;
        }

        const filesToAdd = Math.min(files.length, availableSlots);

        for (let i = 0; i < filesToAdd; i++) {
            const file = files[i];

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} excede el tamaño máximo de 5MB`);
                continue;
            }

            this.selectedImages.push(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imagePreviews.push(e.target.result);
                this.cdr.detectChanges();
            };
            reader.readAsDataURL(file);
        }

        if (filesToAdd < files.length) {
            alert(`Solo se agregaron ${filesToAdd} de ${files.length} imágenes debido al límite de 20.`);
        }

        // Reset input
        event.target.value = '';
    }

    removeSelectedImage(index: number) {
        this.selectedImages.splice(index, 1);
        this.imagePreviews.splice(index, 1);

        // Adjust variant indexes: removed index from preview means shifting indexes?
        // Actually indexes are productImages + imagePreviews. 
        // If we remove an image from previews, any variant pointing to that index or higher needs update?
        // For simplicity, let's warn or clear variant selection if complex.
        // But since this is preview, we haven't saved indexes yet? 
        // Variants point to positions. If I remove preview at index 0 (global index N), 
        // variants pointing to global index N+1 should now point to N.

        // This is complex. For now, let's just leave it relying on user to re-select if they delete.
    }

    removeProductImage(index: number) {
        if (!confirm('¿Eliminar esta imagen? Esta acción no se puede rehacer.')) {
            return;
        }

        const slug = this.route.parent?.snapshot.paramMap.get('slug');
        if (!slug || !this.productId) {
            alert('Error: No se pudo identificar el producto');
            return;
        }

        const imageUrlToDelete = this.productImages[index];

        this.uploading = true;

        // First, delete the image from R2 storage
        this.productService.deleteImage(imageUrlToDelete).subscribe({
            next: (deleteResponse: any) => {
                // Then update the local array
                const updatedImages = [...this.productImages];
                updatedImages.splice(index, 1);

                // Update the product in the database with the new images array
                this.productService.updateProductImages(this.productId!, { images: updatedImages }).subscribe({
                    next: (response: any) => {
                        this.productImages = response.images || updatedImages;
                        this.uploading = false;
                        this.cdr.detectChanges();
                    },
                    error: (err: any) => {
                        this.uploading = false;
                        console.error('Error updating product images in database:', err);
                        alert('La imagen fue eliminada de R2 pero hubo un error al actualizar la base de datos: ' + (err.error?.message || 'Desconocido'));
                    }
                });
            },
            error: (err: any) => {
                this.uploading = false;
                console.error('Error deleting image from R2:', err);
                alert('Error al eliminar la imagen de R2: ' + (err.error?.message || 'Desconocido'));
            }
        });
    }

    setAsMainImage(index: number) {
        if (index === 0) return;

        const slug = this.route.parent?.snapshot.paramMap.get('slug');
        if (!slug || !this.productId) {
            alert('Error: No se pudo identificar el producto');
            return;
        }

        // 1. Optimistic Update (Immediate Visual Change)
        const originalImages = [...this.productImages];
        const updatedImages = [...this.productImages];

        // Move image at index to 0
        const imageToMain = updatedImages.splice(index, 1)[0];
        updatedImages.unshift(imageToMain);

        // Update UI immediately without waiting for server
        this.productImages = updatedImages;

        // 2. Background Sync
        this.productService.updateProductImages(this.productId, { images: updatedImages }).subscribe({
            next: (response: any) => {
                // Confirm sync (usually matches optimistic state)
                if (response.images) {
                    this.productImages = response.images;
                }
            },
            error: (err: any) => {
                // Revert on failure
                this.productImages = originalImages;
                console.error('Error updating main image:', err);
                alert('No se pudo cambiar la imagen principal. Deshaciendo cambios.');
                this.cdr.detectChanges();
            }
        });
    }

    // Returns observable to be used in onSubmit
    private uploadNewImagesInternal(productId: string): Observable<unknown> {
        this.uploading = true;
        this.uploadProgress = 0;

        // Progress simulation
        const progressInterval = setInterval(() => {
            if (this.uploadProgress < 90) this.uploadProgress += 10;
        }, 200);

        return this.productService.uploadProductImages(productId, this.selectedImages).pipe(
            // Use tap to manage side effects (state updates)
            tap({
                next: (response) => {
                    clearInterval(progressInterval);
                    this.uploadProgress = 100;
                    this.productImages = [...response.images];
                    this.selectedImages = [];
                    this.imagePreviews = [];
                    this.cdr.detectChanges();
                },
                error: () => {
                    clearInterval(progressInterval);
                    this.uploadProgress = 0;
                }
            })
        );
    }

    uploadNewImages() {
        if (this.selectedImages.length === 0 || !this.productId) return;
        const slug = this.route.parent?.snapshot.paramMap.get('slug');
        if (!slug) return;

        this.uploadNewImagesInternal(this.productId).subscribe({
            next: (response) => {
                setTimeout(() => {
                    this.uploading = false;
                    this.uploadProgress = 0;
                    this.cdr.detectChanges(); // Ensure UI updates
                }, 500);
            },
            error: (err) => {
                this.uploading = false;
                alert('Error subiendo imágenes: ' + (err.error?.message || 'Desconocido'));
            }
        });
    }
}
