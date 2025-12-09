<script lang="ts">
    import { otpStore } from '../../stores/otpStore';
    import { Search, MapPin } from 'lucide-svelte';

    let { selectedRouteId = $bindable() } = $props();
    let searchTerm = $state("");

    // Filter logic
    let filteredRoutes = $derived(
        ($otpStore as any).routes
            ? ($otpStore as any).routes.filter((r: any) => 
                r.route_number && r.route_number.toString().includes(searchTerm)
              )
            : []
    );
</script>

<div class="flex flex-col h-full bg-white">
    <div class="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} class="text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            </div>
            <input 
                type="text" 
                bind:value={searchTerm} 
                placeholder="Find a route..." 
                class="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all sm:text-sm"
            />
        </div>
    </div>

    <div class="overflow-y-auto flex-1 p-2 space-y-0.5 custom-scrollbar">
        <button 
            onclick={() => selectedRouteId = 'ALL'}
            class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-3
            {selectedRouteId === 'ALL' 
                ? 'bg-teal-50 text-teal-800 ring-1 ring-teal-200' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}"
        >
            <div class="flex items-center justify-center w-6 h-6 rounded bg-teal-100/50">
                <MapPin size={14} class={selectedRouteId === 'ALL' ? 'text-teal-600' : 'text-slate-400'}/>
            </div>
            <span>System Overview</span>
        </button>

        <div class="h-px bg-slate-100 my-2 mx-2"></div>

        {#each filteredRoutes as route}
            <button 
                onclick={() => selectedRouteId = route.route_number}
                class="w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 flex justify-between items-center group
                {selectedRouteId === route.route_number 
                    ? 'bg-slate-100 text-slate-900 font-semibold shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}"
            >
                <div class="flex items-center gap-3">
                    <span class="font-mono text-xs bg-slate-200/50 px-1.5 py-0.5 rounded text-slate-600 group-hover:bg-slate-200 transition-colors">
                        #{route.route_number}
                    </span>
                    </div>
                
                <span class="{route.otp_percentage >= 80 ? 'text-emerald-600' : (route.otp_percentage >= 70 ? 'text-amber-600' : 'text-rose-600')} font-medium text-xs">
                    {route.otp_percentage}%
                </span>
            </button>
        {/each}

        {#if filteredRoutes.length === 0}
            <div class="p-4 text-center text-xs text-slate-400 italic">
                No routes found matching "{searchTerm}"
            </div>
        {/if}
    </div>
</div>

<style>
    /* Optional: Custom slim scrollbar for the list */
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: #e2e8f0;
        border-radius: 20px;
    }
</style>