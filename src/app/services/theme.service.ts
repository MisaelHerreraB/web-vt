import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Tenant } from './tenant.service';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private isBrowser: boolean;

    constructor(@Inject(PLATFORM_ID) platformId: Object) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    applyTheme(tenant: Tenant) {
        if (!this.isBrowser) return;

        const root = document.documentElement;

        // Apply Primary Color Palette
        const primary = tenant.themePrimaryColor || '#b24343'; // Default 'terra'
        this.applyPalette(root, 'primary', primary);

        // Apply Secondary Color Palette
        const secondary = tenant.themeSecondaryColor || '#f4e1d2'; // Default 'beige'
        this.applyPalette(root, 'secondary', secondary);
    }

    private applyPalette(root: HTMLElement, name: string, hex: string) {
        const palette = this.generatePalette(hex);

        // Set root variable (e.g. --color-primary)
        root.style.setProperty(`--color-${name}`, hex);

        // Set shades (e.g. --color-primary-100)
        Object.keys(palette).forEach(key => {
            root.style.setProperty(`--color-${name}-${key}`, palette[key]);
        });
    }

    // Simple palette generator (can be enhanced with a proper library later)
    private generatePalette(hex: string): { [key: string]: string } {
        // This is a simplified version. Ideally we use a color manipulation library.
        // For now, we will just replicate the base color for all shades to ensure consistency
        // or implement a basic lighten/darken logic.

        return {
            '50': this.adjustBrightness(hex, 0.95), // lightest
            '100': this.adjustBrightness(hex, 0.90),
            '200': this.adjustBrightness(hex, 0.80),
            '300': this.adjustBrightness(hex, 0.60),
            '400': this.adjustBrightness(hex, 0.30),
            '500': hex, // Base
            '600': this.adjustBrightness(hex, -0.10),
            '700': this.adjustBrightness(hex, -0.20),
            '800': this.adjustBrightness(hex, -0.30),
            '900': this.adjustBrightness(hex, -0.40),
            '950': this.adjustBrightness(hex, -0.50), // darkest
        };
    }

    private adjustBrightness(col: string, amt: number) {

        let usePound = false;

        if (col[0] == "#") {
            col = col.slice(1);
            usePound = true;
        }

        let num = parseInt(col, 16);

        let r = (num >> 16);
        let b = ((num >> 8) & 0x00FF);
        let g = (num & 0x0000FF);

        if (amt > 0) {
            // Lighten
            r = r + (255 - r) * amt;
            b = b + (255 - b) * amt;
            g = g + (255 - g) * amt;
        } else {
            // Darken
            // amt is negative, e.g. -0.2
            // newColor = color * (1 - abs(amt))
            // or just add (which subtracts)
            const factor = 1 + amt; // e.g. 0.8
            r = r * factor;
            b = b * factor;
            g = g * factor;
        }

        // Clamp
        if (r > 255) r = 255; else if (r < 0) r = 0;
        if (b > 255) b = 255; else if (b < 0) b = 0;
        if (g > 255) g = 255; else if (g < 0) g = 0;

        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
    }

    extractColorsFromImage(imageUrl: string): Promise<{ primary: string, secondary: string }> {
        return new Promise((resolve, reject) => {
            if (!this.isBrowser) {
                resolve({ primary: '#b24343', secondary: '#f4e1d2' });
                return;
            }

            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = imageUrl;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve({ primary: '#b24343', secondary: '#f4e1d2' });
                    return;
                }

                canvas.width = img.width;
                canvas.height = img.height;
                // Resize for performance if needed
                if (canvas.width > 200) {
                    const scale = 200 / canvas.width;
                    canvas.width = 200;
                    canvas.height = img.height * scale;
                }

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                try {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                    const colorCounts: { [key: string]: number } = {};
                    let maxCount = 0;
                    let primaryRGB = { r: 0, g: 0, b: 0 };
                    let primary = '#b24343'; // Default fallback

                    // First pass: Find dominant color (ignoring white/black/transparent)
                    for (let i = 0; i < imageData.length; i += 40) {
                        const r = imageData[i];
                        const g = imageData[i + 1];
                        const b = imageData[i + 2];
                        const a = imageData[i + 3];

                        if (a < 128) continue; // Ignore transparent

                        // Ignore near white and near black for primary
                        const brightness = (r + g + b) / 3;
                        if (brightness > 240 || brightness < 15) continue;

                        const rQ = Math.round(r / 20) * 20;
                        const gQ = Math.round(g / 20) * 20;
                        const bQ = Math.round(b / 20) * 20;

                        const key = `${rQ},${gQ},${bQ}`;
                        colorCounts[key] = (colorCounts[key] || 0) + 1;

                        if (colorCounts[key] > maxCount) {
                            maxCount = colorCounts[key];
                            primaryRGB = { r: rQ, g: gQ, b: bQ };
                            primary = this.rgbToHex(rQ, gQ, bQ);
                        }
                    }

                    // If no dominant color found (e.g. all white logo), fall back to black or default
                    if (maxCount === 0) {
                        primary = '#000000';
                        primaryRGB = { r: 0, g: 0, b: 0 };
                    }

                    // Second pass: Find secondary color (contrasting or second most frequent)
                    let secondary = '#f4e1d2';
                    let maxSecCount = 0;

                    for (const key in colorCounts) {
                        if (colorCounts[key] < maxCount * 0.1) continue; // Must be significant

                        const [r, g, b] = key.split(',').map(Number);

                        // Calculate color distance to ensure contrast/difference
                        const dist = Math.sqrt(
                            Math.pow(r - primaryRGB.r, 2) +
                            Math.pow(g - primaryRGB.g, 2) +
                            Math.pow(b - primaryRGB.b, 2)
                        );

                        if (dist > 60 && colorCounts[key] > maxSecCount) {
                            maxSecCount = colorCounts[key];
                            secondary = this.rgbToHex(r, g, b);
                        }
                    }

                    // If no suitable secondary found, generate a monochromatic one
                    if (maxSecCount === 0) {
                        const p = primaryRGB;
                        // A lighter verison of primary
                        secondary = this.rgbToHex(
                            Math.min(255, p.r + 40),
                            Math.min(255, p.g + 40),
                            Math.min(255, p.b + 40)
                        );
                    }

                    resolve({ primary, secondary });

                } catch (e) {
                    console.error('Error extracting colors', e);
                    resolve({ primary: '#b24343', secondary: '#f4e1d2' });
                }
            };

            img.onerror = (e) => {
                console.error('Error loading image for color extraction', e);
                resolve({ primary: '#b24343', secondary: '#f4e1d2' });
            };
        });
    }

    private rgbToHex(r: number, g: number, b: number) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
}
