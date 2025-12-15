
<script lang="ts">
    import { onMount, onDestroy } from 'svelte'; // <-- ADDED onDestroy
    import DelayMap from '../Map/DelayMap.svelte';

    export let routeId: string;
    
    let rawData: any[] = [];
    let filterStatus = 'All'; 
    let loading = true;
    
    // [NEW] Bind the Map Component instance here
    let delayMapInstance: DelayMap | null = null; 

    // Reactive fetching when routeId changes
    $: if (routeId) fetchRouteData();

    // [CRITICAL HANG FIX] Manually destroy map instance when the route changes
    onDestroy(() => {
        // This is necessary because DelayMap holds a heavy Leaflet/Mapbox object
        // that must be explicitly destroyed on unmount to prevent memory/thread block.
        if (delayMapInstance && typeof (delayMapInstance as any).destroyMap === 'function') {
            (delayMapInstance as any).destroyMap();
        } else {
            // A small delay as a fallback, just in case the map instance isn't ready
            setTimeout(() => {
                 if (delayMapInstance && typeof (delayMapInstance as any).destroyMap === 'function') {
                    (delayMapInstance as any).destroyMap();
                }
            }, 100);
        }
    });

    async function fetchRouteData() {
        loading = true;
        try {
            const res = await fetch(`http://localhost:5001/api/v1/otp/map?route=${routeId}`);
            rawData = await res.json();
        } catch (e) {
            console.error("Route Map Error:", e);
        } finally {
            loading = false;
        }
    }
    // Reactive filtering remains the same
    $: displayedPoints = rawData.filter(p => {
        if (filterStatus === 'All') return true;
        return p.status === filterStatus;
    });
</script>

<div class="fluent-card p-6 mt-6">
    <div class="flex items-center justify-between mb-4">
        <div>
            <h3 class="font-bold text-[var(--text-main)] text-lg">Route {routeId} Analysis</h3>
            <p class="text-xs text-[var(--text-muted)]">Geospatial performance breakdown</p>
        </div>
        
        <div class="flex bg-[var(--bg-main)] p-1 rounded-lg border border-[var(--border-subtle)]">
            {#each ['All', 'Late', 'Early'] as type}
                <button 
                    on:click={() => filterStatus = type}
                    class="px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 
                    {filterStatus === type 
                        ? 'bg-[var(--bg-card)] text-[var(--color-brand-600)] shadow-sm' 
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}"
                >
                    {type}
                </button>
            {/each}
        </div>
    </div>

    <div class="h-[500px] w-full rounded-xl overflow-hidden border border-[var(--border-subtle)] shadow-inner relative">
        {#if !loading}
            <DelayMap bind:this={delayMapInstance} points={displayedPoints} mapId="map-route-single" />
            
            {#if displayedPoints.length === 0}
                <div class="absolute inset-0 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm pointer-events-none">
                    <span class="font-bold text-[var(--text-muted)]">No {filterStatus === 'All' ? '' : filterStatus.toLowerCase()} stops found for this route.</span>
                    <span class="text-xs text-[var(--text-muted)] opacity-70 mt-1">Try selecting a different filter.</span>
                </div>
            {/if}
        {:else}
            <div class="h-full w-full flex items-center justify-center bg-[var(--bg-subtle)] text-[var(--text-muted)]">
                <span class="loading loading-spinner text-[var(--color-brand-500)]"></span>
            </div>
        {/if}
    </div>
</div>