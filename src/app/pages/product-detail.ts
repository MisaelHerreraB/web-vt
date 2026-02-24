import { Component, Input, OnInit, OnChanges, SimpleChanges, inject, ChangeDetectorRef, PLATFORM_ID, HostListener } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';


import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, ProductVariant } from '../services/product.service';
import { TenantService, Tenant } from '../services/tenant.service';
import { getCurrencySymbol } from '../constants/currencies';
import { CartService } from '../services/cart.service';
import { CartDrawerComponent } from '../components/cart-drawer/cart-drawer.component';
import { CartSummaryComponent } from '../components/cart-summary/cart-summary';
import { FormatDescriptionPipe } from '../pipes/format-description.pipe';
import { WhatsappButtonComponent } from '../components/whatsapp-button/whatsapp-button';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CartDrawerComponent, CartSummaryComponent, FormatDescriptionPipe, WhatsappButtonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 font-sans text-gray-800 pb-32">
      <!-- Consistent Header with Home -->
      <header class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div class="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <!-- Logo + Store Name -->
          <a [routerLink]="['/', slug]" class="flex items-center gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
            @if (tenant?.logoUrl) {
              <img [src]="tenant?.logoUrl" [alt]="tenant?.name" class="h-10 w-10 rounded-full object-cover">
            } @else {
              <div class="h-10 w-10 rounded-full bg-terra text-white flex items-center justify-center font-bold">
                {{ tenant?.name?.charAt(0) || 'T' }}
              </div>
            }
            <span class="hidden md:inline-block font-bold text-gray-900 text-lg">{{ tenant?.name || slug }}</span>
          </a>

          <!-- Search Bar (Desktop) -->
          <div class="hidden md:flex flex-1 max-w-md">
            <input type="text" 
                   placeholder="Buscar productos..." 
                   (keyup.enter)="onSearch($event)"
                   class="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-terra">
          </div>

          <!-- Mini Cart -->
          <button (click)="cart.open()" class="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors">
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              @if (cart.count() > 0) {
                <span class="absolute -top-2 -right-2 bg-terra text-white text-xs font-bold h-5 w-5 rounded-full flex items-center justify-center">{{ cart.count() }}</span>
              }
            </div>
            <div class="hidden sm:flex flex-col text-xs text-left">
              <span class="text-gray-500">{{ cart.count() }} items</span>
              <span class="font-bold text-gray-900">{{ cart.total() | currency: getSymbol(tenant?.currency) }}</span>
            </div>
          </button>
        </div>

        <!-- Breadcrumbs -->
        <div class="border-t border-gray-100 bg-gray-50">
          <div class="container mx-auto px-4 py-2.5">
            <nav class="flex items-center gap-2 text-sm">
              <a [routerLink]="['/', slug]" class="text-gray-600 hover:text-terra transition-colors">Inicio</a>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400"><polyline points="9 18 15 12 9 6"/></svg>
              @if (product?.category) {
                <span class="text-gray-600">{{ getCategoryName(product?.category) }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400"><polyline points="9 18 15 12 9 6"/></svg>
              }
              <span class="text-gray-900 font-medium truncate">{{ product?.title }}</span>
            </nav>
          </div>
        </div>
      </header>

      <main class="container mx-auto p-4 md:py-8 lg:py-12 max-w-6xl">
        @if (product) {
            <div class="grid md:grid-cols-2 gap-8 lg:gap-16 items-start">
                <!-- Image Gallery Column -->
                <div class="md:sticky md:top-24 space-y-4">
                    <!-- Main Image Display -->
                    <div class="bg-white rounded-lg shadow-sm overflow-hidden aspect-[3/4] md:aspect-[4/5] relative group"
                         (touchstart)="onTouchStart($event)"
                         (touchend)="onTouchEnd($event)">
                        <img [src]="getCurrentImage()" 
                             [alt]="product.title"
                             class="w-full h-full object-cover"
                             draggable="false">
                        
                        @if (selectedVariant) {
                           <div class="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-medium z-10">
                             {{ selectedVariant.value }}
                           </div>
                        }

                        <!-- Navigation Arrows (Desktop) -->
                        @if (getProductImages().length > 1) {
                            <!-- Zoom Button (New UX) -->
                    <button (click)="openZoom()" 
                            class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-sm text-gray-700 hover:text-terra hover:shadow-md transition-all z-20 group"
                            title="Ampliar imagen">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="group-hover:scale-110 transition-transform">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            <line x1="11" y1="8" x2="11" y2="14"></line>
                            <line x1="8" y1="11" x2="14" y2="11"></line>
                        </svg>
                    </button>

                    <!-- Previous Button -->
                    <button (click)="previousImage()"
                                    class="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                            </button>

                            <!-- Next Button -->
                            <button (click)="nextImage()"
                                    class="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                            </button>

                            <!-- Dots Indicator (Mobile) -->
                            <div class="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                @for (img of getProductImages(); track $index) {
                                    <button (click)="currentImageIndex = $index"
                                            [class.bg-white]="currentImageIndex === $index"
                                            [class.bg-white/50]="currentImageIndex !== $index"
                                            class="w-2 h-2 rounded-full transition-all">
                                    </button>
                                }
                            </div>
                        }
                    </div>

                    <!-- Thumbnails (Desktop) -->
                    @if (getProductImages().length > 1) {
                        <div class="hidden md:grid grid-cols-5 gap-2">
                            @for (img of getProductImages(); track $index) {
                                <button (click)="currentImageIndex = $index"
                                        [class.ring-2]="currentImageIndex === $index"
                                        [class.ring-terra]="currentImageIndex === $index"
                                        [class.opacity-60]="currentImageIndex !== $index"
                                        class="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:opacity-100 transition-all">
                                    <img [src]="img" [alt]="product.title" class="w-full h-full object-cover">
                                </button>
                            }
                        </div>
                    }
                </div>
                
                <!-- Info Column -->
                <div class="flex flex-col md:sticky md:top-24 pt-4">
                    
                    <div class="mb-4">
                        <div class="flex items-start justify-between">
                            <!-- Category Badge -->
                            @if (product.category) {
                                <a [routerLink]="['/', slug]" [queryParams]="{category: getCategoryId(product.category)}" 
                                   class="inline-block px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-full mb-2 transition-colors">
                                    {{ getCategoryName(product.category) }}
                                </a>
                            }
                            
                            <!-- Share Buttons (Moved Top) -->
                             <div class="flex items-center gap-2 relative z-10">
                                <button (click)="shareWhatsApp()" 
                                        class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-[#25D366] hover:text-white transition-all duration-300"
                                        title="WhatsApp">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                </button>
                                <button (click)="copyLink()" 
                                        [class.text-green-600]="linkCopied"
                                        [class.bg-green-50]="linkCopied"
                                        class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-200 transition-all duration-300"
                                        title="Copiar Enlace">
                                    @if (linkCopied) { <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> } 
                                    @else { <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> }
                                </button>
                             </div>
                        </div>

                        <span class="text-terra text-xs font-bold tracking-[0.2em] uppercase block mb-1">Nuevo Ingreso</span>
                        <h1 class="text-3xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-none">{{ product.title }}</h1>
                    </div>
            
                    <!-- Price Section with Label -->
                    <div class="mb-4 pb-4 border-b border-gray-100">
                        @if (tenant?.wholesaleEnabled && tenant?.showRetailPriceLabel) {
                            <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Precio Minorista</span>
                        }
                        <div class="flex items-baseline gap-4">
                            <p class="text-3xl lg:text-4xl font-light text-gray-900">
                                {{ currentPrice | currency : getSymbol(tenant?.currency) }}
                            </p>
                            @if (selectedVariant && currentPrice !== product.price) {
                                <span class="text-sm text-gray-400 line-through">
                                    {{ product.price | currency : getSymbol(tenant?.currency) }}
                                </span>
                            }
                        </div>
                    </div>

                    <!-- Wholesale Inquiry Banner - Compact Version -->
                    @if (tenant?.wholesaleEnabled) {
                        <button (click)="contactForWholesale()" 
                                class="w-full mb-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 transition-all group flex items-center justify-between">
                            <div class="flex items-center gap-2.5">
                                <div class="bg-gray-800 p-2 rounded-lg group-hover:scale-105 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                        <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                </div>
                                <div class="text-left">
                                    <p class="text-xs font-bold text-gray-900 leading-tight">¿Compras al por mayor? <span class="text-gray-600 font-medium">Consultar aquí</span></p>
                                </div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0">
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        </button>
                    }

                    <!-- Urgency Alert -->
                    @if (product.urgencyOverride || (tenant?.lowStockThreshold && product.stock <= (tenant?.lowStockThreshold || 0) && product.stock > 0 && !product.ignoreStock)) {
                        <div class="mb-8 bg-orange-50 border border-orange-100 rounded-lg p-3 flex items-center gap-3 animate-pulse">
                            <div class="bg-orange-100 p-1.5 rounded-full text-orange-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                            </div>
                            <div>
                                <p class="text-orange-800 font-bold text-sm uppercase tracking-wide">¡Alta Demanda!</p>
                                <p class="text-orange-600 text-xs">
                                    @if (product.showStockQuantity && currentStock > 0) {
                                        Solo quedan {{ currentStock }} unidades.
                                    } @else {
                                        Pocas unidades disponibles.
                                    }
                                    ¡Compra antes que se agote!
                                </p>
                            </div>
                        </div>
                    }

                    <!-- Variants -->
                    @if (product.variants && product.variants.length > 0) {
                        <div class="mb-6" id="variant-selector">
                            <!-- Label row -->
                            <div class="flex items-center justify-between mb-3">
                                <h3 class="text-xs font-bold uppercase text-gray-400 tracking-widest">Opción</h3>
                                @if (showVariantAlert) {
                                    <span class="text-xs font-semibold text-red-500 flex items-center gap-1 animate-fade-in">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                        Selecciona una opción
                                    </span>
                                }
                            </div>

                            <!-- Variant buttons -->
                            <div class="flex flex-wrap gap-2"
                                 [class.variant-shake]="showVariantAlert">
                                @for (variant of product.variants; track variant.id) {
                                    <button (click)="selectVariant(variant)"
                                            class="relative h-10 px-5 rounded-md text-sm font-semibold transition-all duration-150 border-2 select-none"
                                            [class.border-gray-900]="selectedVariant?.id === variant.id"
                                            [class.text-gray-900]="selectedVariant?.id === variant.id"
                                            [class.bg-white]="selectedVariant?.id === variant.id"
                                            [class.border-gray-200]="selectedVariant?.id !== variant.id && !showVariantAlert"
                                            [class.border-red-300]="showVariantAlert && selectedVariant?.id !== variant.id"
                                            [class.text-gray-500]="selectedVariant?.id !== variant.id"
                                            [class.bg-white]="selectedVariant?.id !== variant.id"
                                            [class.hover:border-gray-400]="selectedVariant?.id !== variant.id"
                                            [class.hover:text-gray-800]="selectedVariant?.id !== variant.id">
                                        <!-- Selected checkmark dot -->
                                        @if (selectedVariant?.id === variant.id) {
                                            <span class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center shadow-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                            </span>
                                        }
                                        {{ variant.value }}
                                    </button>
                                }
                            </div>
                        </div>

                        <!-- Sub-options -->
                        @if (selectedVariant?.options && selectedVariant!.options!.length > 0) {
                            <div class="mb-6 space-y-5">
                                @for (option of selectedVariant?.options; track option.id) {
                                    <div>
                                        <div class="flex items-center gap-2 mb-2.5">
                                            <p class="text-xs font-bold uppercase text-gray-400 tracking-widest">{{ option.name }}</p>
                                            @if (selectedOptions[option.name]) {
                                                <span class="text-xs text-gray-600 font-medium">— {{ selectedOptions[option.name].name }}</span>
                                            }
                                        </div>
                                        <div class="flex flex-wrap gap-2">
                                            @for (val of option.values; track val.id) {
                                                <button (click)="selectOption(option.name, val)"
                                                        class="relative h-9 px-4 rounded-md text-sm font-medium transition-all duration-150 border-2 select-none"
                                                        [class.border-gray-900]="selectedOptions[option.name]?.id === val.id"
                                                        [class.text-gray-900]="selectedOptions[option.name]?.id === val.id"
                                                        [class.font-semibold]="selectedOptions[option.name]?.id === val.id"
                                                        [class.border-gray-200]="selectedOptions[option.name]?.id !== val.id"
                                                        [class.text-gray-500]="selectedOptions[option.name]?.id !== val.id"
                                                        [class.hover:border-gray-400]="selectedOptions[option.name]?.id !== val.id"
                                                        [class.hover:text-gray-800]="selectedOptions[option.name]?.id !== val.id">
                                                    @if (selectedOptions[option.name]?.id === val.id) {
                                                        <span class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center shadow-sm">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                        </span>
                                                    }
                                                    {{ val.name }}
                                                    @if (val.price > 0) {
                                                        <span class="ml-1 text-xs opacity-60">(+{{ val.price | currency: getSymbol(tenant?.currency) }})</span>
                                                    }
                                                </button>
                                            }
                                        </div>
                                    </div>
                                }
                            </div>
                        }
                    }


                    <!-- Actions Area -->
                    <div class="space-y-4 mb-4">
                         <!-- Quantity Selector (Simplified) -->
                        <div class="flex items-center gap-4">
                             <div class="flex items-center border border-gray-200 rounded-full h-12 w-32 px-2 bg-white">
                                <button (click)="decreaseQuantity()" class="w-8 h-full flex items-center justify-center text-gray-500 hover:text-black">-</button>
                                <input type="number" [(ngModel)]="quantity" class="flex-1 w-full text-center font-bold text-gray-900 border-none focus:outline-none p-0" min="1" readonly>
                                <button (click)="increaseQuantity()" class="w-8 h-full flex items-center justify-center text-gray-500 hover:text-black">+</button>
                             </div>
                             
                             <!-- Stock Status Badge (UX Best Practice) -->
                             @if (!isOutOfStock) {
                                <span class="text-xs text-green-700 font-bold bg-green-100 px-3 py-1.5 rounded-full border border-green-200 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    Disponible
                                </span>
                             } @else {
                                <span class="text-xs text-red-700 font-bold bg-red-100 px-3 py-1.5 rounded-full border border-red-200 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                                    Agotado
                                </span>
                             }
                        </div>

                        <!-- Main Action Button -->
                        <button (click)="addToCart()" 
                                [disabled]="isOutOfStock"
                                [class.bg-gray-300]="isOutOfStock"
                                [class.border-gray-300]="isOutOfStock"
                                [class.text-gray-400]="isOutOfStock"
                                [class.cursor-not-allowed]="isOutOfStock"
                                [class.bg-gray-900]="!isOutOfStock"
                                [class.text-white]="!isOutOfStock"
                                [class.hover:bg-black]="!isOutOfStock"
                                [class.hover:shadow-xl]="!isOutOfStock"
                                class="w-full py-4 rounded-full font-bold uppercase tracking-[0.1em] text-sm transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-gray-200 flex items-center justify-center gap-2">
                            @if (isOutOfStock) {
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                                <span>Agotado</span>
                            } @else {
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                                <span>Agregar al carrito</span>
                            }
                        </button>

                        <!-- WhatsApp Consultation Block (UX Highlight) -->
                        <button (click)="consultWhatsApp()" 
                                class="w-full mt-4 bg-green-50 hover:bg-green-100 border border-green-100 text-green-800 rounded-xl p-4 flex items-center justify-center gap-3 transition-colors group">
                            <div class="bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                            </div>
                            <div class="text-left">
                                <p class="text-sm font-bold text-gray-900">¿Tienes dudas sobre este producto?</p>
                                <p class="text-xs text-green-700 font-medium">Chatea con un asesor experto ahora</p>
                            </div>
                        </button>
                    </div>

                    <!-- Trust Badges (Moved Here) -->
                    <div class="mb-8 grid grid-cols-2 gap-3 pb-8 border-b border-gray-100">
                        <div class="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-600"><path d="M20 7h-3a2 2 0 0 1-2-2V2"/><path d="M9 18v-6"/><path d="M15 18v-6"/><path d="M3 9h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7.5L7.5 2h9L21 7.5"/></svg>
                            <span class="font-medium">Envío a todo el país</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            <span class="font-medium">Compra Protegida</span>
                        </div>
                    </div>
                    
                    <!-- Description (Moved Bottom) -->
                    <div>
                        <h3 class="text-sm font-bold uppercase text-gray-900 tracking-wider mb-3">Detalles</h3>
                        <div class="prose prose-sm text-gray-600 leading-relaxed overflow-hidden"
                             style="white-space: pre-line;"
                             [class.line-clamp-4]="!showFullDescription"
                             [innerHTML]="product.description | formatDescription">
                        </div>
                        @if (product.description && product.description.length > 200) {
                            <button (click)="toggleDescription()" 
                                    class="mt-2 text-sm font-bold text-gray-900 underline hover:text-terra transition-colors">
                                {{ showFullDescription ? 'Ver menos' : 'Leer descripción completa' }}
                            </button>
                        }
                    </div>

                    <div class="mt-8">
                         <p class="text-center md:text-left text-xs text-gray-400 flex items-center gap-1.5 opacity-80">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            Pago 100% Seguro cifrado con SSL
                        </p>
                    </div>

                </div>
            </div>

            <!-- Related Products Section -->
            @if (relatedProducts.length > 0) {
            <section class="mt-16 pt-12 border-t border-gray-200">
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Te puede interesar</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    @for (related of relatedProducts; track related.id) {
                        <div class="group bg-white rounded-md shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer" 
                             [routerLink]="['../', related.id]"
                             (click)="$event.stopPropagation()">
                            <div class="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                                <img [src]="related.images?.[0] || related.imageUrl || 'https://placehold.co/400x500?text=No+Image'" 
                                     [alt]="related.title"
                                     class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                            </div>
                            <div class="p-4">
                                <h3 class="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{{ related.title }}</h3>
                                <p class="text-gray-500 text-sm mb-2 font-medium">{{ related.price | currency : (tenant?.currency === 'USD' ? '$' : 'S/.') }}</p>
                            </div>
                        </div>
                    }
                </div>
            </section>
            }
        } @else {
            <div class="text-center py-20 text-gray-500">Loading product...</div>
        }
      </main>

      <!-- Lightbox / Fullscreen Zoom Modal -->
      @if (isZoomOpen) {
        <div class="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-fade-in"
             (click)="closeZoom()">
             
            <!-- Close Button -->
            <button class="absolute top-4 right-4 z-[110] text-white/70 hover:text-white p-4 transition-colors"
                    (click)="closeZoom()">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <!-- Image Container -->
            <div class="w-full h-full flex items-center justify-center overflow-hidden"
                 [class.cursor-zoom-in]="zoomLevel === 1"
                 [class.cursor-grab]="zoomLevel > 1 && !isDragging"
                 [class.cursor-grabbing]="isDragging"
                 (click)="$event.stopPropagation(); toggleZoomLevel($event)">
                
                <img [src]="getCurrentImage()" 
                     [alt]="product?.title"
                     class="max-w-[95%] max-h-[95vh] object-contain transition-transform duration-0 ease-linear select-none"
                     [class.duration-300]="!isDragging"
                     [style.transform]="'translate(' + panX + 'px, ' + panY + 'px) scale(' + zoomLevel + ')'"
                     
                     (mousedown)="startDrag($event)"
                     (touchstart)="startDrag($event)"
                     
                     (mousemove)="onDrag($event)"
                     (touchmove)="onDrag($event)"
                     
                     (mouseup)="endDrag()"
                     (mouseleave)="endDrag()"
                     (touchend)="endDrag()"
                     
                     draggable="false">
            </div>

            <!-- Navigation in Modal -->
            @if (getProductImages().length > 1) {
                <button (click)="$event.stopPropagation(); previousImage()"
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-colors z-[110]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button (click)="$event.stopPropagation(); nextImage()"
                        class="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-colors z-[110]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                
                <!-- Indicators -->
                 <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-[110]">
                    @for (img of getProductImages(); track $index) {
                        <div class="w-2 h-2 rounded-full transition-all"
                             [class.bg-white]="currentImageIndex === $index"
                             [class.bg-white/30]="currentImageIndex !== $index">
                        </div>
                    }
                </div>
            }
        </div>
      }

      <!-- Cart Drawer -->
      <app-cart-drawer></app-cart-drawer>
      
      <!-- Sticky Cart Summary -->
      <app-cart-summary [tenant]="tenant"></app-cart-summary>

      <!-- WhatsApp Floating Button -->
      <app-whatsapp-button [tenant]="tenant"></app-whatsapp-button>

    </div>
  `,
  styles: [`
    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fade-in {
      animation: fade-in 0.2s ease-out forwards;
    }
    @keyframes variant-shake {
      0%, 100% { transform: translateX(0); }
      15%       { transform: translateX(-8px); }
      30%       { transform: translateX(7px); }
      45%       { transform: translateX(-6px); }
      60%       { transform: translateX(5px); }
      75%       { transform: translateX(-3px); }
      90%       { transform: translateX(2px); }
    }
    .variant-shake {
      animation: variant-shake 0.55s cubic-bezier(.36,.07,.19,.97) both;
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  @Input() slug!: string;
  @Input() productId!: string;

  product: Product | null = null;
  relatedProducts: Product[] = []; // Store related products
  tenant: Tenant | null = null;
  selectedVariant: ProductVariant | null = null;
  quantity: number = 1;
  linkCopied: boolean = false;
  showFullDescription: boolean = false;
  showVariantAlert: boolean = false;
  private variantAlertTimer: any = null;
  currentImageIndex: number = 0;

  // Zoom / Lightbox State
  isZoomOpen = false;
  zoomLevel = 1;

  // Pan State
  isDragging = false;
  wasDragging = false; // New flag to distinguish click from drag
  panX = 0;
  panY = 0;
  private startX = 0;
  private startY = 0;
  private lastPanX = 0;
  private lastPanY = 0;
  private dragStartClientX = 0;
  private dragStartClientY = 0;

  private touchStartX: number = 0;
  private touchEndX: number = 0;

  cart = inject(CartService);
  private router = inject(Router);
  private productService = inject(ProductService);
  private tenantService = inject(TenantService);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private meta = inject(Meta);
  private titleService = inject(Title);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo(0, 0);
    }
    this.loadAllData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productId'] && !changes['productId'].isFirstChange()) {
      if (isPlatformBrowser(this.platformId)) {
        window.scrollTo(0, 0);
      }
      this.loadProductData();
    }
  }

  loadAllData() {
    if (this.slug) {
      this.tenantService.getTenant(this.slug).subscribe({
        next: (data) => {
          this.tenant = data;
          this.loadProductData();
        },
        error: (err) => console.error('Error loading tenant:', err)
      });
    }
  }

  loadProductData() {
    if (!this.productId) return;

    this.productService.getProduct(this.productId).subscribe({
      next: (productData) => {
        this.product = productData;

        // Sort variants and nested options by saved order (defensive — API already sorts, but guarantees client-side too)
        if (this.product?.variants) {
          this.product.variants.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
          this.product.variants.forEach((v: any) => {
            if (v.options) v.options.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
          });
        }

        // Reset state for new product
        this.selectedVariant = null;
        this.selectedOptions = {};
        this.quantity = 1;
        this.currentImageIndex = 0;

        // Set Open Graph + Twitter meta tags for WhatsApp / social previews
        this.setOgTags();

        this.cdr.detectChanges();

        if (this.product.category) {
          const categoryId = typeof this.product.category === 'string'
            ? this.product.category
            : (this.product.category as any).id;

          if (categoryId) {
            this.loadRelatedProducts(categoryId, this.product.id);
          }
        }
      },
      error: (err) => console.error('Error loading product:', err)
    });
  }

  private setOgTags() {
    if (!this.product) return;

    const title = this.product.title;
    const description = (this.product.description || title).replace(/<[^>]*>/g, '').slice(0, 160);
    const image = this.product.images?.[0] || (this.product as any).imageUrl || '';
    const url = `https://www.vertienda.app/${this.slug}/p/${this.product.id}`;

    // Page title
    this.titleService.setTitle(title);

    // Open Graph tags (Facebook, WhatsApp, LinkedIn, Telegram)
    this.meta.updateTag({ property: 'og:type', content: 'product' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:image:width', content: '800' });
    this.meta.updateTag({ property: 'og:image:height', content: '800' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:site_name', content: this.tenant?.name || 'Vertienda' });

    // Twitter / WhatsApp fallback
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    // Standard description
    this.meta.updateTag({ name: 'description', content: description });
  }

  loadRelatedProducts(category: string, currentProductId: string) {
    this.productService.getProducts(category).subscribe({
      next: (products) => {
        // Filter out current product and limit to 4
        this.relatedProducts = products
          .filter(p => p.id !== currentProductId)
          .slice(0, 4);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading related products', err)
    });
  }

  // Selected sub-options state
  selectedOptions: { [optionName: string]: any } = {};

  get currentPrice(): number {
    if (!this.product) return 0;

    let price = Number(this.product.price);

    // Add variant modifier
    // Variant price override
    if (this.selectedVariant) {
      if (Number(this.selectedVariant.price) > 0) {
        price = Number(this.selectedVariant.price);
      }

      // Options price override
      if (this.selectedVariant.options) {
        for (const option of this.selectedVariant.options) {
          const selectedValue = this.selectedOptions[option.name];
          if (selectedValue && Number(selectedValue.price) > 0) {
            price = Number(selectedValue.price);
          }
        }
      }
    }

    return price;
  }

  get currentStock(): number {
    if (!this.product) return 0;

    // If variant is selected, use variant stock
    if (this.selectedVariant && this.selectedVariant.stock !== undefined) {
      return Number(this.selectedVariant.stock);
    }

    // Otherwise use product stock
    return this.product.stock !== undefined ? Number(this.product.stock) : 0;
  }

  get isOutOfStock(): boolean {
    // If tenant has disabled stock control globally, never out of stock
    if (this.tenant?.useStockControl === false) {
      return false;
    }

    // If this specific product ignores stock, never out of stock
    if (this.product?.ignoreStock === true) {
      return false;
    }

    // Otherwise check actual stock
    return this.currentStock === 0;
  }

  get isUnlimited(): boolean {
    return this.tenant?.useStockControl === false || this.product?.ignoreStock === true;
  }

  selectVariant(variant: ProductVariant) {
    this.selectedVariant = variant;
    // Dismiss validation alert
    this.showVariantAlert = false;
    if (this.variantAlertTimer) { clearTimeout(this.variantAlertTimer); }
    // Reset image index when changing variant
    this.currentImageIndex = 0;
    // Reset options
    this.selectedOptions = {};
  }

  selectOption(optionName: string, value: any) {
    this.selectedOptions[optionName] = value;
    this.showVariantAlert = false;
    if (this.variantAlertTimer) { clearTimeout(this.variantAlertTimer); }
  }

  triggerVariantAlert() {
    // Scroll to the variant selector
    if (isPlatformBrowser(this.platformId)) {
      const el = document.getElementById('variant-selector');
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }
    // Show the alert state (triggers shake + red rings + label)
    this.showVariantAlert = true;
    // Force re-trigger shake animation by toggling
    if (this.variantAlertTimer) { clearTimeout(this.variantAlertTimer); }
    // Auto-dismiss after 3 seconds
    this.variantAlertTimer = setTimeout(() => {
      this.showVariantAlert = false;
      this.cdr.markForCheck();
    }, 3000);
  }

  toggleDescription() {
    this.showFullDescription = !this.showFullDescription;
  }

  increaseQuantity() {
    if (this.isUnlimited || this.quantity < this.currentStock) {
      this.quantity++;
    }
  }

  onSearch(event: any) {
    const query = event.target.value;
    if (this.slug) {
      this.router.navigate(['/', this.slug], { queryParams: { search: query } });
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  validateQuantity() {
    if (this.quantity < 1) {
      this.quantity = 1;
    }
    if (!this.isUnlimited && this.currentStock > 0 && this.quantity > this.currentStock) {
      this.quantity = this.currentStock;
    }
  }

  addToCart() {
    if (this.product) {
      if (this.product.variants?.length && !this.selectedVariant) {
        this.triggerVariantAlert();
        return;
      }

      // Validate sub-options
      if (this.selectedVariant && this.selectedVariant.options) {
        for (const option of this.selectedVariant.options) {
          if (!this.selectedOptions[option.name]) {
            this.triggerVariantAlert();
            return;
          }
        }
      }

      if (this.isOutOfStock) {
        return;
      }

      const productToAdd = { ...this.product, price: this.currentPrice };

      // Build title with options
      let variantTitle = '';
      if (this.selectedVariant) {
        variantTitle = ` (${this.selectedVariant.value}`;

        // Append selected options to title
        const optionKeys = Object.keys(this.selectedOptions);
        if (optionKeys.length > 0) {
          const optionsStr = optionKeys.map(key => `${key}: ${this.selectedOptions[key].name}`).join(', ');
          variantTitle += ` - ${optionsStr}`;
        }
        variantTitle += ')';

        productToAdd.title = `${this.product.title}${variantTitle}`;
        // Generate a pseudo-unique ID based on variant and options 
        // Note: For a robust cart, we should store option IDs, but for this simple version string concat is fine
        const optionsId = Object.values(this.selectedOptions).map((v: any) => v.id).join('-');
        productToAdd.id = `${this.product.id}-${this.selectedVariant.id}-${optionsId}`;
      }

      this.cart.addWithQuantity(productToAdd, this.quantity);

      // Open drawer
      this.cart.open();

      // Reset quantity
      this.quantity = 1;
    }
  }



  shareWhatsApp() {
    if (this.product) {
      const url = window.location.href;
      const text = `¡Mira este producto! ${this.product.title} - ${this.getSymbol(this.tenant?.currency)}${this.currentPrice}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
      window.open(whatsappUrl, '_blank');
    }
  }



  consultWhatsApp() {
    if (!this.product || !this.tenant?.whatsapp && !this.tenant?.phone) return;

    const phone = this.tenant.whatsapp || this.tenant.phone;
    const url = window.location.href;
    const message = `Hola, estoy viendo el producto *${this.product.title}* y tengo algunas dudas. ¿Me podrían asesorar?\n\nLink: ${url}`;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  contactForWholesale() {
    if (!this.product || !this.tenant?.whatsapp && !this.tenant?.phone) return;

    const phone = this.tenant.whatsapp || this.tenant.phone;
    const url = window.location.href;
    const currencySymbol = this.getSymbol(this.tenant.currency);
    const price = this.currentPrice;

    const message = `*Hola! Consulta de Pedido al por Mayor*\\n\\n` +
      `📦 Producto: *${this.product.title}*\\n` +
      `💵 Precio Unitario: ${currencySymbol}${price}\\n\\n` +
      `Estoy interesado en realizar un pedido al por mayor. ¿Me podrían brindar información sobre precios especiales, cantidades mínimas y condiciones de pago?\\n\\n` +
      `🔗 Link del producto: ${url}`;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.linkCopied = true;
      setTimeout(() => {
        this.linkCopied = false;
      }, 2000);
    });
  }

  getSymbol(code: string | undefined): string {
    return getCurrencySymbol(code);
  }

  // Helper methods for category (could be string or object)
  getCategoryName(category: any): string {
    if (!category) return '';
    if (typeof category === 'string') return category;
    return category.name || '';
  }

  getCategoryId(category: any): string {
    if (!category) return '';
    if (typeof category === 'string') return category;
    return category.id || category.name || '';
  }

  // Image Gallery Methods
  getProductImages(): string[] {
    if (!this.product) return [];

    // Get base images (use images array if available, otherwise fallback to imageUrl)
    let allImages: string[] = [];
    if (this.product.images && this.product.images.length > 0) {
      allImages = this.product.images;
    } else if (this.product.imageUrl) {
      allImages = [this.product.imageUrl];
    }

    // If a variant is selected and has specific image indexes, filter images
    if (this.selectedVariant && this.selectedVariant.imageIndexes && this.selectedVariant.imageIndexes.length > 0) {
      const filteredImages = this.selectedVariant.imageIndexes
        .map(index => allImages[index])
        .filter(img => img !== undefined); // Filter out invalid indexes

      // Return filtered images if any are valid, otherwise return all
      return filteredImages.length > 0 ? filteredImages : allImages;
    }

    // No variant selected or variant has no specific images - return all
    return allImages;
  }

  getCurrentImage(): string {
    const images = this.getProductImages();
    if (images.length === 0) return 'https://via.placeholder.com/800x1000?text=Sin+Imagen';
    return images[this.currentImageIndex] || images[0];
  }

  openZoom() {
    this.isZoomOpen = true;
    this.zoomLevel = 1;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  closeZoom() {
    this.isZoomOpen = false;
    this.zoomLevel = 1;
    document.body.style.overflow = ''; // Restore scrolling
  }

  toggleZoomLevel(event: MouseEvent) {
    if (this.wasDragging) {
      this.wasDragging = false;
      event.stopPropagation();
      return;
    }

    if (this.zoomLevel === 1) {
      this.zoomLevel = 2;
    } else {
      this.zoomLevel = 1;
      // Reset pan when zooming out
      this.panX = 0;
      this.panY = 0;
      this.lastPanX = 0;
      this.lastPanY = 0;
    }
    event.stopPropagation();
  }

  // Pan / Drag Events
  startDrag(event: MouseEvent | TouchEvent) {
    if (this.zoomLevel <= 1) return;

    this.isDragging = true;
    this.wasDragging = false;

    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

    this.dragStartClientX = clientX;
    this.dragStartClientY = clientY;

    this.startX = clientX - this.lastPanX;
    this.startY = clientY - this.lastPanY;

    // Prevent default drag behavior
    if (event instanceof MouseEvent) {
      event.preventDefault();
    }
  }

  onDrag(event: MouseEvent | TouchEvent) {
    if (!this.isDragging || this.zoomLevel <= 1) return;

    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

    // Check threshold
    if (!this.wasDragging) {
      const moveX = Math.abs(clientX - this.dragStartClientX);
      const moveY = Math.abs(clientY - this.dragStartClientY);
      if (moveX > 5 || moveY > 5) {
        this.wasDragging = true;
      }
    }

    this.panX = clientX - this.startX;
    this.panY = clientY - this.startY;

    event.preventDefault(); // Prevent scrolling while dragging
  }

  endDrag() {
    this.isDragging = false;
    this.lastPanX = this.panX;
    this.lastPanY = this.panY;
  }

  @HostListener('window:keydown.esc')
  onEsc() {
    if (this.isZoomOpen) {
      this.closeZoom();
    }
  }

  nextImage() {
    const images = this.getProductImages();
    if (images.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
    }
  }

  previousImage() {
    const images = this.getProductImages();
    if (images.length > 1) {
      this.currentImageIndex = this.currentImageIndex === 0 ? images.length - 1 : this.currentImageIndex - 1;
    }
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent) {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe() {
    const swipeThreshold = 50; // minimum distance for a swipe
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next image
        this.nextImage();
      } else {
        // Swipe right - previous image
        this.previousImage();
      }
    }
  }
}
