import { Injectable, Inject, PLATFORM_ID, signal, computed, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from './product.service';
import { TenantService } from './tenant.service';

export interface CartItem {
    product: Product;
    quantity: number;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartKey = 'shopping_cart'; // Default, will be updated
    items = signal<CartItem[]>([]);
    isOpen = signal(false);

    total = computed(() => this.items().reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0));
    count = computed(() => this.items().reduce((acc, item) => acc + item.quantity, 0));

    open() {
        this.isOpen.set(true);
    }

    close() {
        this.isOpen.set(false);
    }

    toggle() {
        this.isOpen.update(v => !v);
    }

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private tenantService: TenantService
    ) {
        // Automatically load cart when tenant changes
        effect(() => {
            const tenant = this.tenantService.tenant();
            if (tenant) {
                this.cartKey = `shopping_cart_${tenant.slug}`;
                this.loadCart();
            } else {
                this.items.set([]); // Clear cart if no tenant active
            }
        });
    }

    private loadCart() {
        if (isPlatformBrowser(this.platformId)) {
            const stored = localStorage.getItem(this.cartKey);
            if (stored) {
                try {
                    this.items.set(JSON.parse(stored));
                } catch (e) {
                    console.error('Error loading cart', e);
                    this.items.set([]);
                }
            } else {
                this.items.set([]);
            }
        }
    }

    private saveCart() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(this.cartKey, JSON.stringify(this.items()));
        }
    }

    addToCart(product: Product) {
        this.addWithQuantity(product, 1);
    }

    addWithQuantity(product: Product, quantity: number = 1) {
        this.items.update(current => {
            const existing = current.find(i => i.product.id === product.id);
            if (existing) {
                return current.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
            }
            return [...current, { product, quantity }];
        });
        this.saveCart();
    }

    updateQuantity(productId: string, quantity: number) {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }
        this.items.update(current =>
            current.map(i => i.product.id === productId ? { ...i, quantity } : i)
        );
        this.saveCart();
    }

    removeFromCart(id: string) {
        this.items.update(current => current.filter(i => i.product.id !== id));
        this.saveCart();
    }

    clearCart() {
        this.items.set([]);
        this.saveCart();
    }
}
