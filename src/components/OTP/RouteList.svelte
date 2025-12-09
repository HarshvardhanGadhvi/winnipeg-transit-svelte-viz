<script lang="ts">
    import { otpStore } from '../../stores/otpStore';
    export let selectedRouteId: string;

    let searchTerm = "";

    // Filter routes based on search term
    $: filteredRoutes = $otpStore.routes.filter(r => 
        r.route_number.toString().includes(searchTerm)
    );
</script>

<div class="flex flex-col h-full bg-white border-r">
    <div class="p-4 border-b">
        <h2 class="font-bold mb-2">Routes Explorer</h2>
        <input 
            type="text" 
            bind:value={searchTerm} 
            placeholder="Search Route #" 
            class="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-teal-500"
        />
    </div>

    <div class="overflow-y-auto flex-1">
        <button 
            class="w-full text-left p-3 hover:bg-gray-100 {selectedRouteId === 'ALL' ? 'bg-teal-50 border-r-4 border-teal-500 font-bold' : ''}"
            on:click={() => selectedRouteId = 'ALL'}
        >
            System Overview
        </button>

        {#each filteredRoutes as route}
            <button 
                class="w-full text-left p-3 flex justify-between hover:bg-teal-50 border-b {selectedRouteId === route.route_number ? 'bg-teal-50 border-r-4 border-teal-500 font-bold text-teal-700' : ''}"
                on:click={() => selectedRouteId = route.route_number}
            >
                <span>#{route.route_number}</span>
                <span class="text-sm">{route.otp_percentage}%</span>
            </button>
        {/each}
    </div>
</div>