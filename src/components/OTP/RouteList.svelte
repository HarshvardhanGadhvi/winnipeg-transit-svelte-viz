<script lang="ts">
    import { otpStore } from '../../stores/otpStore';
    
    // 1. Handle Props
    let { selectedRouteId = $bindable() } = $props();

    let searchTerm = $state("");

    // 2. FORCE CASTING: (store as any) silences the "type never" errors
    let filteredRoutes = $derived(
        ($otpStore as any).routes
            ? ($otpStore as any).routes.filter((r: any) => 
                r.route_number && r.route_number.toString().includes(searchTerm)
              )
            : []
    );
</script>

<div class="flex flex-col h-full bg-white border-r">
    <div class="p-4 border-b">
        <h2 class="font-bold mb-2">Routes Explorer</h2>
        <input 
            type="text" 
            bind:value={searchTerm} 
            placeholder="Search Route #" 
            class="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-teal-500 outline-none"
        />
    </div>

    <div class="overflow-y-auto flex-1">
        <button 
            class="w-full text-left p-3 border-b transition-colors duration-200
            {selectedRouteId === 'ALL' 
                ? 'bg-teal-600 text-white font-bold' 
                : 'hover:bg-gray-100 text-gray-700'}"
            onclick={() => selectedRouteId = 'ALL'}
        >
            System Overview
        </button>

        {#each filteredRoutes as route}
            <button 
                class="w-full text-left p-3 flex justify-between border-b transition-colors duration-200
                {selectedRouteId === route.route_number 
                    ? 'bg-teal-50 border-r-4 border-teal-500 font-bold text-teal-700' 
                    : 'hover:bg-teal-50 text-gray-600'}"
                onclick={() => selectedRouteId = route.route_number}
            >
                <span>#{route.route_number}</span>
                <span class="text-sm font-medium">{route.otp_percentage}%</span>
            </button>
        {/each}
    </div>
</div>