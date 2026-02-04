import { inject, InjectionToken, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
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
 * State key for transferring API URL from server to client
 */
const API_URL_KEY = makeStateKey<string>('api-url');

/**
 * Factory function to provide runtime configuration
 * This reads from process.env on the server side and transfers it to the client via TransferState
 */
export function provideRuntimeConfig(): RuntimeConfig {
    const platformId = inject(PLATFORM_ID);
    const transferState = inject(TransferState);

    let apiUrl: string;

    if (isPlatformServer(platformId)) {
        // Server side: try to get API_URL from environment variable
        try {
            if (typeof process !== 'undefined' && process.env && process.env['API_URL']) {
                apiUrl = process.env['API_URL'];
                console.log('[RuntimeConfig] Server: Using API_URL from environment:', apiUrl);
            } else {
                apiUrl = environment.apiUrl;
                console.log('[RuntimeConfig] Server: Using API_URL from compiled environment:', apiUrl);
            }
        } catch (error) {
            console.warn('[RuntimeConfig] Server: Error accessing process.env:', error);
            apiUrl = environment.apiUrl;
        }

        // Transfer the API URL to the client
        transferState.set(API_URL_KEY, apiUrl);
    } else {
        // Client side: get API_URL from transfer state (set by server)
        apiUrl = transferState.get(API_URL_KEY, environment.apiUrl);
        console.log('[RuntimeConfig] Client: Using API_URL from transfer state:', apiUrl);
    }

    return { apiUrl };
}
