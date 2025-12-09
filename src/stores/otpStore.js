import { writable } from 'svelte/store';

export const otpStore = writable({
    routes: [],
    metadata: {},
    systemHistory: null,      // NEW: Stores the lazy-loaded system chart
    activeRouteHistory: null, // Stores specific route chart
    loading: true, 
    historyLoading: false,    // Loading state for charts
    error: null,
});

const API_BASE = 'http://localhost:5001/api/v1';

// 1. Initial Load (Fast)
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
    } catch (e) {
        otpStore.update(s => ({ ...s, loading: false, error: e.message }));
    }
}

// 2. Fetch System History (Lazy)
export async function fetchSystemHistory() {
    otpStore.update(s => ({ ...s, historyLoading: true }));
    try {
        const response = await fetch(`${API_BASE}/otp/system-history`);
        const data = await response.json();
        otpStore.update(s => ({ ...s, systemHistory: data, historyLoading: false }));
    } catch (e) {
        console.error(e);
        otpStore.update(s => ({ ...s, historyLoading: false }));
    }
}

// 3. Fetch Route History (Lazy)
export async function fetchRouteHistory(routeId) {
    otpStore.update(s => ({ ...s, historyLoading: true, activeRouteHistory: null }));
    try {
        const response = await fetch(`${API_BASE}/otp/route/${routeId}`);
        const data = await response.json();
        otpStore.update(s => ({ ...s, activeRouteHistory: data.trend, historyLoading: false }));
    } catch (e) {
        console.error(e);
        otpStore.update(s => ({ ...s, historyLoading: false }));
    }
}