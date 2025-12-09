// src/stores/ridershipStore.js
import { writable } from 'svelte/store';

const API_URL = 'http://localhost:5001/api/v1/ridership-summary';

export const ridershipStore = writable({
    data: [],
    loading: false,
    error: null,
});

export async function fetchRidershipData() {
    ridershipStore.update(state => ({ ...state, loading: true, error: null }));
    
    try {
        const response = await fetch(API_URL);
        const json = await response.json();

        if (json.ridership_by_season) {
            ridershipStore.set({ 
                data: json.ridership_by_season, 
                loading: false, 
                error: null,
            });
        } else {
            throw new Error(json.error || 'Invalid ridership data structure.');
        }

    } catch (e) {
        ridershipStore.update(state => ({ ...state, loading: false, error: "Failed to load ridership data." }));
    }
}