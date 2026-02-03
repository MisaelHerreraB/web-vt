import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { TenantService } from '../../services/tenant.service';
import { CouponService } from '../../services/coupon.service';
import { OrderService } from '../../services/order.service';
import { getCurrencySymbol } from '../../constants/currencies';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-cart-drawer',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    @if (cart.isOpen()) {
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity"
             (click)="cart.close()">
        </div>

        <!-- Drawer Panel -->
        <div class="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col h-full">
            
            <!-- Header -->
            <div class="flex items-center justify-between p-5 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div class="flex items-center gap-3">
                    <h2 class="text-xl font-bold text-gray-900">Tu Pedido</h2>
                    <span class="bg-terra text-white text-xs font-bold px-2 py-0.5 rounded-full">{{ cart.count() }}</span>
                </div>
                <button (click)="cart.close()" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>

            <!-- Body (Scrollable) -->
            <div class="flex-1 overflow-y-auto p-5 space-y-6">
                
                <!-- Empty State -->
                @if (cart.items().length === 0) {
                    <div class="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-gray-300"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                        <div>
                            <p class="text-lg font-medium text-gray-900">Tu carrito está vacío</p>
                            <p class="text-sm text-gray-500">¡Agrega algunos productos deliciosos!</p>
                        </div>
                        <button (click)="cart.close()" class="mt-4 text-terra font-bold hover:underline">
                            Seguir explorando
                        </button>
                    </div>
                }

                <!-- Cart Items -->
                @if (cart.items().length > 0) {
                    <div class="space-y-4">
                        @for (item of cart.items(); track item.product.id) {
                            <div class="flex gap-4 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors bg-white">
                                <!-- Image -->
                                <div class="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
                                    <img [src]="item.product.images?.[0] || item.product.imageUrl || 'assets/placeholder.png'" 
                                         [alt]="item.product.title"
                                         class="w-full h-full object-cover">
                                </div>
                                
                                <!-- Details -->
                                <div class="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <h3 class="font-bold text-gray-900 text-sm leading-tight truncate pr-4">{{ item.product.title }}</h3>
                                        @if (getVariantDetails(item.product.title)) {
                                            <p class="text-xs text-gray-500 mt-1 line-clamp-1">{{ getVariantDetails(item.product.title) }}</p>
                                        }
                                    </div>
                                    
                                    <div class="flex items-center justify-between mt-2">
                                        <div class="flex flex-col">
                                            <span class="text-xs text-gray-500 font-medium">
                                                {{ item.product.price | currency: getCurrency() }} x {{ item.quantity }}
                                            </span>
                                            <span class="font-bold text-terra text-sm">
                                                {{ item.product.price * item.quantity | currency: getCurrency() }}
                                            </span>
                                        </div>
                                        
                                        <!-- Quantity Controls -->
                                        <div class="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-200">
                                            <button (click)="decreaseQuantity(item)" 
                                                    class="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white rounded transition-all">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                            </button>
                                            <span class="text-xs font-bold w-4 text-center">{{ item.quantity }}</span>
                                            <button (click)="increaseQuantity(item)"
                                                    class="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white rounded transition-all">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Remove Actions -->
                                <button (click)="removeItem(item)" class="text-gray-300 hover:text-red-500 self-start -mt-1 -mr-1 p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                        }
                    </div>

                    <!-- Discount / Coupon Section -->
                    <div class="border-t border-gray-100 pt-4 mt-2">
                         @if (!showCouponInput && !couponService.appliedCoupon()) {
                             <button (click)="showCouponInput = true" class="text-sm font-medium text-terra hover:underline flex items-center gap-1">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                                 ¿Tienes un cupón de descuento?
                             </button>
                         }

                         @if (showCouponInput && !couponService.appliedCoupon()) {
                             <div class="flex gap-2 animate-fade-in">
                                 <input type="text" 
                                        [(ngModel)]="couponCode" 
                                        placeholder="Ingresa tu código" 
                                        class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-terra focus:ring-1 focus:ring-terra outline-none uppercase"
                                        (keyup.enter)="applyCoupon()">
                                 <button (click)="applyCoupon()" 
                                         [disabled]="isValidatingCoupon"
                                         class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors disabled:opacity-50">
                                     {{ isValidatingCoupon ? '...' : 'Aplicar' }}
                                 </button>
                             </div>
                             @if (couponError) {
                                 <p class="text-xs text-red-500 mt-1">{{ couponError }}</p>
                             }
                         }

                         @if (couponService.appliedCoupon()) {
                             <div class="bg-green-50 text-green-700 px-3 py-2 rounded-lg flex justify-between items-center text-sm border border-green-100">
                                 <div class="flex items-center gap-2">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                     <span class="font-medium">Cupón: {{ couponService.appliedCoupon()?.code }}</span>
                                 </div>
                                 <button (click)="removeCoupon()" class="text-green-600 hover:text-green-800 p-1">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                 </button>
                             </div>
                         }
                    </div>

                    <!-- Checkout Form -->
                    <div class="border-t border-gray-100 pt-6 mt-4">
                         <h3 class="text-sm font-bold uppercase text-gray-900 tracking-wider mb-4">Datos de Envío</h3>
                         
                         <!-- Delivery Method Switch -->
                         <div class="bg-gray-100 p-1 rounded-lg flex mb-4">
                             <button (click)="deliveryMethod = 'PICKUP'"
                                     [class.bg-white]="deliveryMethod === 'PICKUP'"
                                     [class.shadow-sm]="deliveryMethod === 'PICKUP'"
                                     [class.text-gray-900]="deliveryMethod === 'PICKUP'"
                                     class="flex-1 py-1.5 text-xs font-bold rounded text-gray-500 transition-all flex items-center justify-center gap-1">
                                 <span>🏪</span> Recojo en Tienda
                             </button>
                             <button (click)="deliveryMethod = 'DELIVERY'"
                                     [class.bg-white]="deliveryMethod === 'DELIVERY'"
                                     [class.shadow-sm]="deliveryMethod === 'DELIVERY'"
                                     [class.text-gray-900]="deliveryMethod === 'DELIVERY'"
                                     class="flex-1 py-1.5 text-xs font-bold rounded text-gray-500 transition-all flex items-center justify-center gap-1">
                                 <span>🛵</span> Delivery
                             </button>
                         </div>

                         <!-- Store Info for Pickup -->
                         @if (deliveryMethod === 'PICKUP' && tenantService.tenant()) {
                             <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 text-sm text-blue-800 animate-fade-in">
                                 <div class="font-bold flex items-center gap-1 mb-1">
                                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                     Ubicación de Tienda
                                 </div>
                                 <p class="mb-2">{{ tenantService.tenant()?.address || 'Dirección no configurada' }}</p>
                                 
                                 @if (tenantService.tenant()?.openingHours) {
                                     <div class="flex items-start gap-1 text-xs text-blue-600 mb-2">
                                         <svg class="mt-0.5" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                         <span>{{ tenantService.tenant()?.openingHours }}</span>
                                     </div>
                                 }

                                 <a [href]="getGoogleMapsUrl()" target="_blank" 
                                    class="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors shadow-sm">
                                    Ver en Google Maps
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                 </a>
                             </div>
                         }

                         <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-500 mb-1">DNI / Identificación <span class="text-red-500">*</span></label>
                                <input type="text" [(ngModel)]="customerDni" placeholder="Número de documento" 
                                       class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-terra focus:ring-0 transition-all text-sm">
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 mb-1">Nombre <span class="text-red-500">*</span></label>
                                    <input type="text" [(ngModel)]="customerName" placeholder="Tu nombre" 
                                           class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-terra focus:ring-0 transition-all text-sm">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-500 mb-1">Celular <span class="text-red-500">*</span></label>
                                    <input type="tel" [(ngModel)]="customerPhone" placeholder="Tu número" 
                                           class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-terra focus:ring-0 transition-all text-sm">
                                </div>
                            </div>
                            
                            @if (deliveryMethod === 'DELIVERY') {
                                <div class="animate-fade-in space-y-4">
                                    <div>
                                        <label class="block text-xs font-bold text-gray-500 mb-1">Dirección de Entrega <span class="text-red-500">*</span></label>
                                        <input type="text" [(ngModel)]="deliveryAddress" placeholder="Calle, número, distrito..." 
                                               class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-terra focus:ring-0 transition-all text-sm">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-gray-500 mb-1">Referencia</label>
                                        <input type="text" [(ngModel)]="deliveryReference" placeholder="Frente al parque, casa azul..." 
                                               class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-terra focus:ring-0 transition-all text-sm">
                                    </div>
                                </div>
                            }

                            <div>
                                <label class="block text-xs font-bold text-gray-500 mb-1">Notas Adicionales</label>
                                <textarea [(ngModel)]="customerNotes" placeholder="Instrucciones especiales para el pedido..." rows="2"
                                          class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-terra focus:ring-0 transition-all text-sm resize-none"></textarea>
                            </div>
                         </div>
                    </div>

                    <!-- Payment Methods Section -->
                    @if (paymentMethods().length > 0) {
                        <div class="border-t border-gray-100 pt-6 mt-4">
                            <h3 class="text-sm font-bold uppercase text-gray-900 tracking-wider mb-4">Método de Pago <span class="text-red-500">*</span></h3>
                            <div class="space-y-3">
                                @for (method of paymentMethods(); track method.type) {
                                    <div (click)="selectedPaymentMethod = method"
                                         [class.border-terra]="selectedPaymentMethod === method"
                                         [class.bg-terra-50]="selectedPaymentMethod === method"
                                         [class.border-gray-200]="selectedPaymentMethod !== method"
                                         class="border rounded-xl p-3 cursor-pointer transition-all hover:border-terra/50 flex items-start gap-3">
                                        <div [class.bg-terra]="selectedPaymentMethod === method"
                                             [class.border-gray-300]="selectedPaymentMethod !== method"
                                             class="w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 transition-colors">
                                            @if (selectedPaymentMethod === method) {
                                                <div class="w-2 h-2 bg-white rounded-full"></div>
                                            }
                                        </div>
                                        <div class="flex-1">
                                            <div class="flex items-center justify-between">
                                                <span class="font-bold text-sm text-gray-900">{{ method.name }}</span>
                                                @if (method.type !== 'CASH') {
                                                    <span class="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{{ method.type }}</span>
                                                }
                                            </div>
                                            @if (method.number) {
                                                <p class="text-xs text-gray-600 font-mono mt-0.5">{{ method.number }}</p>
                                            }
                                            @if (method.instruction) {
                                                <p class="text-xs text-gray-500 mt-1 italic">{{ method.instruction }}</p>
                                            }
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    }
                }
            </div>

            <!-- Footer (Sticky) -->
            @if (cart.items().length > 0) {
                <div class="p-5 border-t border-gray-100 bg-white/90 backdrop-blur-md pb-8">
                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between items-end text-sm text-gray-500">
                             <span>Subtotal:</span>
                             <span>{{ cart.total() | currency: getCurrency() }}</span>
                        </div>
                        
                        @if (couponService.appliedCoupon()) {
                            <div class="flex justify-between items-end text-sm text-green-600 font-medium">
                                 <span>Descuento ({{ couponService.appliedCoupon()?.code }}):</span>
                                 <span>-{{ couponService.appliedCoupon()?.discountAmount | currency: getCurrency() }}</span>
                            </div>
                        }

                        <div class="flex justify-between items-end pt-2 border-t border-gray-100">
                             <div class="flex flex-col">
                                 <span class="text-base text-gray-900 font-bold">Total a pagar</span>
                                 @if (deliveryMethod === 'DELIVERY') {
                                     <span class="text-[10px] text-gray-400 font-normal">+ Costo de envío según zona</span>
                                 }
                             </div>
                             <div class="text-right">
                                  <div class="text-2xl font-bold text-gray-900">
                                      {{ (couponService.appliedCoupon() ? couponService.appliedCoupon()?.finalTotal : cart.total()) | currency: getCurrency() }}
                                  </div>
                             </div>
                        </div>
                    </div>

                    <button (click)="sendToWhatsApp()" 
                            [disabled]="!isValidForm()"
                            class="w-full py-4 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white rounded-xl font-bold shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        <span>Enviar Pedido por WhatsApp</span>
                    </button>
                    <p class="text-center text-[10px] text-gray-400 mt-3">Al enviar serás redirigido a WhatsApp para coordinar el pago</p>
                </div>
            }
        </div>
    }
    `,
    styles: [`
        .animate-fade-in {
            animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `]
})
export class CartDrawerComponent {
    cart = inject(CartService);
    tenantService = inject(TenantService);
    couponService = inject(CouponService);
    orderService = inject(OrderService);
    recaptchaV3Service = inject(ReCaptchaV3Service);

    // Form fields
    customerName = '';
    customerDni = '';
    customerPhone = '';
    customerNotes = '';
    deliveryMethod: 'PICKUP' | 'DELIVERY' = 'DELIVERY';
    deliveryAddress = '';
    deliveryReference = '';

    // Payment
    selectedPaymentMethod: any = null;

    // Coupon
    couponCode = '';
    couponError = '';
    showCouponInput = false;
    isValidatingCoupon = false;

    // Order submission state
    isSubmittingOrder = false;

    getCurrency() {
        return getCurrencySymbol(this.tenantService.tenant()?.currency);
    }

    // Extracts variant details from title (e.g. "Pizza (Grande - Masa: Fina)")
    getVariantDetails(title: string): string {
        const match = title.match(/\((.*?)\)$/);
        return match ? match[1] : '';
    }

    increaseQuantity(item: CartItem) {
        this.cart.addWithQuantity(item.product, 1);
        if (this.couponService.appliedCoupon()) {
            this.validateAppliedCoupon(); // Re-validate on change
        }
    }

    decreaseQuantity(item: CartItem) {
        if (item.quantity > 1) {
            this.cart.updateQuantity(item.product.id, item.quantity - 1);
        } else {
            this.removeItem(item);
        }
        if (this.couponService.appliedCoupon()) {
            this.validateAppliedCoupon(); // Re-validate on change
        }
    }

    removeItem(item: CartItem) {
        if (confirm('¿Eliminar este producto?')) {
            this.cart.removeFromCart(item.product.id);
            if (this.cart.items().length === 0) {
                this.removeCoupon();
            } else if (this.couponService.appliedCoupon()) {
                this.validateAppliedCoupon();
            }
        }
    }

    isValidForm(): boolean {
        const basicValid = this.customerName.trim().length > 0 &&
            this.customerPhone.trim().length > 0 &&
            this.customerDni.trim().length > 0;

        const paymentValid = this.paymentMethods().length === 0 || !!this.selectedPaymentMethod;

        if (this.deliveryMethod === 'DELIVERY') {
            return basicValid && paymentValid && this.deliveryAddress.trim().length > 0;
        }

        return basicValid && paymentValid;
    }

    // Computed payment methods to ensure stable references
    paymentMethods = computed(() => {
        const methods = this.tenantService.tenant()?.paymentMethods;
        let parsedMethods: any[] = [];

        if (Array.isArray(methods)) {
            parsedMethods = methods;
        } else if (typeof methods === 'string') {
            try {
                parsedMethods = JSON.parse(methods);
            } catch (e) {
                console.error('Error parsing paymentMethods in cart:', e);
                parsedMethods = [];
            }
        }

        return parsedMethods.filter((m: any) => m.isActive) || [];
    });

    getGoogleMapsUrl(): string {
        const address = this.tenantService.tenant()?.address;
        if (!address) return '#';
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }

    applyCoupon() {
        if (!this.couponCode.trim()) return;

        this.isValidatingCoupon = true;
        this.couponError = '';

        this.couponService.validateCoupon(this.couponCode, this.cart.total()).subscribe({
            next: (result: any) => {
                this.couponService.applyCouponResult(result);
                this.isValidatingCoupon = false;
                this.couponCode = '';
                this.showCouponInput = false;
            },
            error: (err: any) => {
                console.error(err);
                this.couponError = err.error?.message || 'Cupón inválido';
                this.isValidatingCoupon = false;
            }
        });
    }

    validateAppliedCoupon() {
        const currentCode = this.couponService.appliedCoupon()?.code;
        if (currentCode) {
            this.couponService.validateCoupon(currentCode, this.cart.total()).subscribe({
                next: (result: any) => this.couponService.applyCouponResult(result),
                error: (err: any) => this.removeCoupon() // Remove if no longer valid (e.g. total too low)
            });
        }
    }

    removeCoupon() {
        this.couponService.removeCoupon();
        this.showCouponInput = false;
        this.couponCode = '';
        this.couponError = '';
    }

    sendToWhatsApp() {
        if (!this.isValidForm() || this.isSubmittingOrder) return;

        const tenant = this.tenantService.tenant();
        if (!tenant) return;

        this.isSubmittingOrder = true;

        // Check if using the V2 Test Key (incompatible with V3)
        // If so, bypass execution to allow testing
        if (environment.recaptchaSiteKey === '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI') {
            console.warn('ReCaptcha V2 Test Key detected in V3 Service. Bypassing validation for testing.');
            this.submitOrder('TEST_TOKEN_BYPASS');
            return;
        }

        // Execute reCAPTCHA and submit order
        this.recaptchaV3Service.execute('submit_order').subscribe({
            next: (captchaToken: string) => {
                this.submitOrder(captchaToken);
            },
            error: (err: any) => {
                console.error('CAPTCHA failed', err);
                alert('Error de verificación de seguridad. Por favor, intenta de nuevo.');
                this.isSubmittingOrder = false;
            }
        });
    }

    private submitOrder(captchaToken: string) {
        const tenant = this.tenantService.tenant();
        if (!tenant) return;

        const currencySymbol = getCurrencySymbol(tenant.currency);
        const appliedCoupon = this.couponService.appliedCoupon();

        // Prepare order data
        const orderData = {
            customerName: this.customerName,
            customerDni: this.customerDni,
            customerPhone: this.customerPhone,
            customerNotes: this.customerNotes,
            deliveryMethod: this.deliveryMethod,
            deliveryAddress: this.deliveryMethod === 'DELIVERY' ? this.deliveryAddress : undefined,
            deliveryReference: this.deliveryMethod === 'DELIVERY' ? this.deliveryReference : undefined,
            items: this.cart.items().map(item => ({
                productTitle: item.product.title,
                productPrice: Number(item.product.price),
                quantity: item.quantity,
                subtotal: Number(item.product.price) * item.quantity
            })),
            subtotal: this.cart.total(),
            discount: appliedCoupon ? appliedCoupon.discountAmount : 0,
            total: appliedCoupon ? appliedCoupon.finalTotal : this.cart.total(),
            couponCode: appliedCoupon?.code,
            captchaToken: captchaToken
        };

        // Submit to backend
        this.orderService.createOrder(orderData).subscribe({
            next: (createdOrder: any) => {
                console.log('Order created:', createdOrder);

                // Redeem coupon if applied
                if (appliedCoupon) {
                    this.couponService.redeemCoupon(appliedCoupon.code).subscribe({
                        next: () => console.log('Coupon redeemed'),
                        error: (err: any) => console.error('Coupon redemption failed', err)
                    });
                }

                // Open WhatsApp
                this.openWhatsApp();

                // Clear cart and form
                this.cart.clearCart();
                this.couponService.removeCoupon();
                this.resetForm();
                this.isSubmittingOrder = false;

                // Close drawer
                setTimeout(() => this.cart.close(), 1000);
            },
            error: (err: any) => {
                console.error('Order creation failed', err);
                const errorMsg = err.error?.message || 'Error al crear el pedido. Por favor, intenta de nuevo.';
                alert(errorMsg);
                this.isSubmittingOrder = false;
            }
        });
    }

    private openWhatsApp() {
        const tenant = this.tenantService.tenant();
        if (!tenant) return;

        const currencySymbol = getCurrencySymbol(tenant.currency);
        const appliedCoupon = this.couponService.appliedCoupon();

        // Get the base URL for products
        const baseUrl = environment.production
            ? `https://vercatalogo.com/${tenant.slug}/p`
            : `http://localhost:4200/${tenant.slug}/p`;

        const itemsList = this.cart.items().map(item => {
            // Extract base product ID (UUIDs have 5 segments: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
            // For variant products, ID is like: "productUUID-variantUUID-optionsUUID"
            const idParts = item.product.id.split('-');
            const baseProductId = idParts.slice(0, 5).join('-'); // First 5 segments = base product UUID
            const productUrl = `${baseUrl}/${baseProductId}`;
            return `• ${item.quantity}x ${item.product.title}%0A  ${currencySymbol}${item.product.price * item.quantity}%0A  🔗 ${productUrl}`;
        }).join('%0A%0A');

        const subtotal = this.cart.total();

        // Build the message
        let message = `*¡Hola! Quiero realizar un pedido:*%0A%0A` +
            `*MÉTODO DE ENTREGA:* ${this.deliveryMethod === 'PICKUP' ? '🏪 Recojo en Tienda' : '🛵 Delivery'}%0A%0A` +
            `*DATOS DEL CLIENTE:*%0A` +
            `Nombre: ${this.customerName}%0A` +
            `DNI/ID: ${this.customerDni}%0A` +
            `Teléfono: ${this.customerPhone}%0A`;

        if (this.deliveryMethod === 'DELIVERY') {
            message += `Dirección: ${this.deliveryAddress}%0A` +
                (this.deliveryReference ? `Referencia: ${this.deliveryReference}%0A` : '');
        }

        if (this.customerNotes) {
            message += `Notas: ${this.customerNotes}%0A`;
        }

        if (this.selectedPaymentMethod) {
            message += `%0A*MÉTODO DE PAGO:*%0A` +
                `${this.selectedPaymentMethod.name} (${this.selectedPaymentMethod.type})%0A`;

            if (this.selectedPaymentMethod.number) {
                message += `Número/Cuenta: ${this.selectedPaymentMethod.number}%0A`;
            }
        }

        message += `%0A*DETALLE DEL PEDIDO:*%0A${itemsList}%0A%0A`;

        // Pricing section
        if (appliedCoupon) {
            message += `*Subtotal:* ${currencySymbol}${subtotal}%0A` +
                `*Descuento (${appliedCoupon.code}):* -${currencySymbol}${appliedCoupon.discountAmount}%0A` +
                `*TOTAL A PAGAR: ${currencySymbol}${appliedCoupon.finalTotal}*`;
        } else {
            message += `*TOTAL A PAGAR: ${currencySymbol}${subtotal}*`;
        }

        if (this.deliveryMethod === 'DELIVERY') {
            message += `%0A_(No incluye costo de envío)_`;
        }

        const targetPhone = tenant.whatsapp || tenant.phone || '51987654321';
        const waUrl = `https://wa.me/${targetPhone}?text=${message}`;

        window.open(waUrl, '_blank');
    }

    private resetForm() {
        this.customerName = '';
        this.customerDni = '';
        this.customerPhone = '';
        this.customerNotes = '';
        this.deliveryMethod = 'DELIVERY';
        this.deliveryAddress = '';
        this.deliveryReference = '';
        this.couponCode = '';
        this.couponError = '';
        this.showCouponInput = false;
        this.selectedPaymentMethod = null;
    }
}
