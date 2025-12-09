<script lang="ts">
    import { onMount } from 'svelte';
    import DelayMap from '../Map/DelayMap.svelte';

    export let routeId: string; // Passed from parent

    let rawData: any[] = [];
    let filterStatus = 'All'; // 'All', 'Late', 'Early'
    let loading = true;

    // Reactive: Update displayed points when filter or data changes
    $: displayedPoints = rawData.filter(p => {
        if (filterStatus === 'All') return true;
        return p.status === filterStatus;
    });

    // Reactive: Refetch if routeId changes
    $: if (routeId) fetchRouteData();

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
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
    <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-slate-800 text-lg">Route {routeId} Geospatial Analysis</h3>
        
        <div class="flex bg-slate-100 p-1 rounded-lg">
            {#each ['All', 'Late', 'Early'] as type}
                <button 
                    on:click={() => filterStatus = type}
                    class="px-4 py-1.5 text-sm font-medium rounded-md transition-all {filterStatus === type ? 'bg-white shadow text-teal-700' : 'text-slate-500 hover:text-slate-700'}"
                >
                    {type}
                </button>
            {/each}
        </div>
    </div>

    <div class="h-[500px] w-full">
        {#if !loading}
            <DelayMap points={displayedPoints} mapId="map-route-single" />
        {:else}
            <div class="h-full w-full flex items-center justify-center bg-slate-50 text-slate-400">Loading map...</div>
        {/if}
    </div>
</div>