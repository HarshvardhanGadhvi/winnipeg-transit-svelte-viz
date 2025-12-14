import { writable } from 'svelte/store';

export const passupStore = writable({
    summary: [],
    loading: false,
    error: null
});

const API_BASE = 'http://localhost:5001/api/v1';

export async function fetchPassupData() {
    passupStore.update(s => ({ ...s, loading: true }));
    try {
        const response = await fetch(`${API_BASE}/passups/summary`);
        if (!response.ok) throw new Error("Failed to fetch passups");
        
        const data = await response.json();
        
        // The processor returns { passups_by_month: [...] }
        passupStore.update(s => ({ 
            ...s, 
            summary: data.passups_by_month || [], 
            loading: false 
        }));
    } catch (e) {
        console.error("Passup Store Error:", e);
        passupStore.update(s => ({ ...s, loading: false, error: e.message }));
    }
}