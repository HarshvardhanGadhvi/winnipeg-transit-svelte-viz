// src/stores/otpStore.js
import { writable } from 'svelte/store';

export const otpStore = writable({
    routes: [],
    metadata: {},
    loading: true, // Start as true to show initial state
    error: null,
});

export async function fetchOtpData() {
    try {
        const response = await fetch('http://localhost:5001/api/v1/otp-summary', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        
        const data = await response.json();
        
        otpStore.set({
            routes: data.routes || [],
            metadata: data.metadata || {},
            loading: false,
            error: null
        });
    } catch (e) {
        console.error("Fetch error:", e);
        otpStore.update(s => ({ ...s, loading: false, error: e.message }));
    }
}