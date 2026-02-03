import { Component, signal, inject, effect, ViewChild, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs';
import { CartDrawerComponent } from './components/cart-drawer/cart-drawer.component';
import { AnnouncementBarComponent } from './components/announcement-bar/announcement-bar.component';
import { InfoDrawerComponent } from './components/info-drawer/info-drawer.component';
import { WelcomePopupComponent } from './components/welcome-popup/welcome-popup';
import { TenantService } from './services/tenant.service';

import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CartDrawerComponent, AnnouncementBarComponent, InfoDrawerComponent, WelcomePopupComponent],
  template: `
    @if (!isAdminRoute() && !isLoginRoute()) {
        <app-announcement-bar [tenant]="tenantService.tenant()" />
        <app-info-drawer #infoDrawer [tenant]="tenantService.tenant()" />
    }
    <router-outlet (activate)="onActivate($event)" />
    
    @if (!isAdminRoute() && !isLoginRoute()) {
        <app-cart-drawer />
        <app-welcome-popup />
    }
  `,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('web');
  protected readonly tenantService = inject(TenantService);
  protected readonly themeService = inject(ThemeService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  protected isAdminRoute = signal(false);
  protected isLoginRoute = signal(false);

  @ViewChild('infoDrawer') infoDrawer!: InfoDrawerComponent;

  constructor() {
    // Monitor router events to detect if we are in admin panel
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminRoute.set(event.urlAfterRedirects.includes('/admin') || event.urlAfterRedirects.includes('/super-admin'));
      this.isLoginRoute.set(event.urlAfterRedirects.includes('/login'));
    });

    effect((onCleanup) => {
      if (isPlatformBrowser(this.platformId)) {
        // Only expose openInfoDrawer if NOT in admin route
        if (!this.isAdminRoute()) {
          (window as any).openInfoDrawer = () => this.infoDrawer?.open();
        }

        // Handle Tenant Data Updates
        const tenant = this.tenantService.tenant();
        if (tenant) {
          // Apply Dynamic Theme
          this.themeService.applyTheme(tenant);

          // Handle Favicon
          if (tenant.logoUrl) {
            this.updateFavicon(tenant.logoUrl);
          } else {
            this.updateFavicon('favicon.ico');
          }
        } else {
          this.updateFavicon('favicon.ico');
        }

        onCleanup(() => {
          if (isPlatformBrowser(this.platformId)) {
            // Safe delete
            try {
              delete (window as any).openInfoDrawer;
            } catch (e) { }
          }
        });
      }
    });
  }

  onActivate(event: any) {
    // Optional
  }

  private updateFavicon(url: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    let link = this.document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'icon';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }
}
