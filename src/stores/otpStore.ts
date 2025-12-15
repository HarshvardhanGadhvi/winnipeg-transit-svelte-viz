import { writable } from 'svelte/store';
import type { Route, OTPMetadata } from '../types';

const API_BASE = 'http://localhost:5001/api/v1';

// Define the shape of the store
export interface OtpStoreState {
    routes: Route[];
    metadata: OTPMetadata | {};
    systemHistory: any[] | null;
    activeRouteHistory: any[] | null;
    loading: boolean;
    historyLoading: boolean;
    error: string | null;
}

export const otpStore = writable<OtpStoreState>({
    routes: [],
    metadata: {},
    systemHistory: null,
    activeRouteHistory: null,
    loading: true,
    historyLoading: false,
    error: null,
});

// 1. Initial Load
export async function fetchOtpData() {
    try {
        const response = await fetch(`${API_BASE}/otp-summary`);
        if (!response.ok) throw new Error("Server Error");
        const data = await response.json();
        
        otpStore.update(s => ({
            ...s,
            routes: data.routes || [],
            metadata: data.metadata || {},
            loading: false
        }));
    } catch (e: any) { // Explicitly type error
        otpStore.update(s => ({ ...s, loading: false, error: e.message }));
    }
}
