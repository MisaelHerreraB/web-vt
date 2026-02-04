import { inject, InjectionToken, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { environment } from '../../environments/environment';

/**
 * Runtime configuration interface
 */
export interface RuntimeConfig {
    apiUrl: string;
}

/**
 * Injection token for runtime configuration
 */
export const RUNTIME_CONFIG = new InjectionToken<RuntimeConfig>('RUNTIME_CONFIG');

/**
 * Factory function to provide runtime configuration
 * This reads from process.env on the server side and falls back to environment files
 */
export function provideRuntimeConfig(): RuntimeConfig {
    const platformId = inject(PLATFORM_ID);

    // On server side, try to get API_URL from environment variable
    if (isPlatformServer(platformId)) {
        const apiUrl = typeof process !== 'undefined' && process.env?.['API_URL'];
        if (apiUrl) {
            console.log('[RuntimeConfig] Using API_URL from environment:', apiUrl);
            return { apiUrl };
        }
    }

    // Fallback to compiled environment configuration
    console.log('[RuntimeConfig] Using API_URL from compiled environment:', environment.apiUrl);
    return { apiUrl: environment.apiUrl };
}
