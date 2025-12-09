<script lang="ts">
    import { onMount } from 'svelte';
    import DelayMap from '../Map/DelayMap.svelte';

    let lateStops: any[] = [];
    let earlyStops: any[] = [];
    let loading = true;

    onMount(async () => {
        try {
            const res = await fetch('http://localhost:5001/api/v1/otp/map');
            const allStops = await res.json();

            // FIX: Be less strict. 
            // Map 1: Show Late stops AND On-Time stops (for context)
            lateStops = allStops.filter((s: any) => s.status === 'Late' || s.status === 'On-Time');
            
            // Map 2: Only show Early stops
            earlyStops = allStops.filter((s: any) => s.status === 'Early');
        } catch (e) {
            console.error("System Map Error:", e);
        } finally {
            loading = false;
        }
    });
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
    <div class="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
        <h3 class="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
            <span class="text-red-600">●</span> Late Hotspots
        </h3>
        <p class="text-xs text-slate-500 mb-2">Red = Late (>5% freq), Green = Reliable</p>
        <div class="h-[400px]">
            {#if !loading}
                <DelayMap points={lateStops} mapId="map-late-system" />
            {/if}
        </div>
    </div>

    <div class="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
        <h3 class="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
             <span class="text-blue-600">●</span> Early Departures
        </h3>
        <p class="text-xs text-slate-500 mb-2">Blue = Early (>5% freq)</p>
        <div class="h-[400px]">
            {#if !loading}
                <DelayMap points={earlyStops} mapId="map-early-system" />
            {/if}
        </div>
    </div>
</div>