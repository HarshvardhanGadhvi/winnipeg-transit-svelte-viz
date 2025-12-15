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

            // [FIXED] Strict filtering: ONLY show Late stops in the red map
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
    <div class="fluent-card p-4 rounded-xl border border-red-100/10 shadow-sm relative overflow-hidden">
        <h3 class="text-lg font-bold text-[var(--text-main)] mb-2 flex items-center gap-2 relative z-10">
            <span class="text-red-500 flex h-3 w-3 rounded-full bg-red-500 box-shadow-glow"></span> 
            Late Hotspots
        </h3>
        <p class="text-xs text-[var(--text-muted)] mb-3">Stops with frequent delays (>2 mins late)</p>
        
        <div class="h-[400px] rounded-lg overflow-hidden border border-[var(--border-subtle)]">
            {#if !loading}
                <DelayMap points={lateStops} mapId="map-late-system" />
            {/if}
        </div>
    </div>

    <div class="fluent-card p-4 rounded-xl border border-blue-100/10 shadow-sm relative overflow-hidden">
        <h3 class="text-lg font-bold text-[var(--text-main)] mb-2 flex items-center gap-2 relative z-10">
             <span class="text-cyan-500 flex h-3 w-3 rounded-full bg-cyan-500 box-shadow-glow"></span> 
             Early Departures
        </h3>
        <p class="text-xs text-[var(--text-muted)] mb-3">Stops leaving before schedule (>1 min early)</p>
        
        <div class="h-[400px] rounded-lg overflow-hidden border border-[var(--border-subtle)]">
            {#if !loading}
                <DelayMap points={earlyStops} mapId="map-early-system" />
            {/if}
        </div>
    </div>
</div>