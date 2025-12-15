import { writable } from 'svelte/store';
import type { PassupMonth, PassupTrends } from '../types';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/passups`;

interface PassupState {
    summary: PassupMonth[];
    trends: PassupTrends;
    loading: boolean;
    error: string | null;
}

export const passupStore = writable<PassupState>({
    summary: [],
    trends: { total_change: 0, full_bus_change: 0, wheelchair_change: 0 },
    loading: false,
    error: null
});

export async function fetchPassupData() {
    passupStore.update(s => ({ ...s, loading: true }));
    try {
        const response = await fetch(`${API_BASE}/summary`);
        if (!response.ok) throw new Error("Failed to fetch passups");
        
        const data = await response.json();
        
        passupStore.update(s => ({ 
            ...s, 
            summary: data.passups_by_month || [], 
            trends: data.trends || { total_change: 0, full_bus_change: 0, wheelchair_change: 0 },
            loading: false 
        }));
    } catch (e: any) {
        console.error("Passup Store Error:", e);
        passupStore.update(s => ({ ...s, loading: false, error: e.message }));
    }
}