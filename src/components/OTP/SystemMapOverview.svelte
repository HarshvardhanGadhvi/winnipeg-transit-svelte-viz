<script lang="ts">
    import { onMount } from 'svelte';
    import DelayMap from '../Map/DelayMap.svelte';

    let lateStops: any[] = [];
    let earlyStops: any[] = [];
    let loading = true;

    onMount(async () => {
        try {
            // Fetch ALL data
            const res = await fetch('http://localhost:5001/api/v1/otp/map');
            const allStops = await res.json();

            // Split into two buckets
            lateStops = allStops.filter((s: any) => s.status === 'Late');
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
        <h3 class="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
            🔴 Chronically Late Stops
        </h3>
        <div class="h-[400px]">
            {#if !loading}
                <DelayMap points={lateStops} mapId="map-late-system" />
            {/if}
        </div>
    </div>

    <div class="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
        <h3 class="text-lg font-bold text-blue-700 mb-2 flex items-center gap-2">
             🔵 Chronically Early Stops
        </h3>
        <div class="h-[400px]">
            {#if !loading}
                <DelayMap points={earlyStops} mapId="map-early-system" />
            {/if}
        </div>
    </div>
</div>