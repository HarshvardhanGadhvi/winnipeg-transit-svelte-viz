import { writable } from 'svelte/store';

export const passupStore = writable({
    summary: [],
    trends: {}, // [NEW] Add trends object to state
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
        
        passupStore.update(s => ({ 
            ...s, 
            summary: data.passups_by_month || [], 
            trends: data.trends || {}, // [NEW] Save trends
            loading: false 
        }));
    } catch (e) {
        console.error("Passup Store Error:", e);
        passupStore.update(s => ({ ...s, loading: false, error: e.message }));
    }
}