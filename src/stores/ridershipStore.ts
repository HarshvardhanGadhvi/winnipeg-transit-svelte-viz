import { writable } from 'svelte/store';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/ridership`;

// --- TYPES (Exported so components can use them) ---
export interface RidershipSeason {
    season: string;
    total_boardings: number;
}

export interface RidershipRoute {
    route_number: string;
    total_boardings: number;
}

export interface RidershipHeatPoint {
    lat: number;
    lng: number;
    boardings: number;
    stop_name?: string;
    stop_number?: string;
}

export interface RidershipTrends {
    boardings_change: number;
    stops_change: number;
}

// This is the interface your component was looking for!
export interface RidershipState {
    summary: RidershipSeason[];
    routes: RidershipRoute[];
    heatmap: RidershipHeatPoint[];
    trends: RidershipTrends;
    loading: boolean;
    error: string | null;
}
export interface RidershipTrends {
    boardings_change: number;
    prev_top_route: string; // [NEW] String for route name
}
// --- STORE ---
export const ridershipStore = writable<RidershipState>({
    summary: [],
    routes: [],
    heatmap: [],
    trends: { boardings_change: 0, prev_top_route: 'N/A' }, // Default
    loading: false,
    error: null,
});

export async function fetchRidershipData() {
    ridershipStore.update(s => ({ ...s, loading: true }));
    try {
        const [summaryRes, routesRes, mapRes] = await Promise.all([
            fetch(`${API_BASE}/summary`),
            fetch(`${API_BASE}/routes`),
            fetch(`${API_BASE}/map`)
        ]);

        const summaryData = await summaryRes.json();
        const routesData = await routesRes.json();
        const mapData = await mapRes.json();

        ridershipStore.set({ 
            summary: summaryData.ridership_by_season || [], 
            trends: summaryData.trends || { boardings_change: 0, prev_top_route: 'N/A' },
            routes: routesData || [],
            heatmap: mapData || [],
            loading: false, 
            error: null,
        });
    } catch (e: any) {
        ridershipStore.update(s => ({ ...s, loading: false, error: e.message }));
    }
}