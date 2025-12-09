<script lang="ts">
    import { otpStore } from '../../stores/otpStore';
    
    export let selectedRouteId: string;

    // 1. Define what a Route looks like so TypeScript stops complaining
    interface Route {
        route_number: string;
        otp_percentage: number;
        color: string;
        text_color: string;
    }

    // 2. Cast the store data so TS knows 'routes' is a list of Route objects
    $: storeData = $otpStore as { routes: Route[] };
    $: routes = storeData.routes || [];

    // --- SORTING LOGIC ---
    function getPriority(routeNum: string) {
        const r = routeNum.toUpperCase();
        if (r === 'BLUE') return 1;
        if (r.startsWith('FX')) return 2;
        if (r.startsWith('F')) return 3;
        if (r.startsWith('D')) return 4;
        
        const n = parseInt(r);
        if (!isNaN(n)) {
            if (n < 100) return 5; 
            return 6;              
        }
        return 7;
    }

    // 3. Now 'a' and 'b' are correctly typed as 'Route', so no more red squiggly lines!
    $: sortedRoutes = [...routes].sort((a, b) => {
        const pA = getPriority(a.route_number);
        const pB = getPriority(b.route_number);
        
        if (pA !== pB) return pA - pB;
        
        return a.route_number.localeCompare(b.route_number, undefined, { numeric: true });
    });
</script>

<div class="flex-1 overflow-y-auto p-4 space-y-2">
    <button 
        class="w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 
        {selectedRouteId === 'ALL' 
            ? 'bg-slate-800 text-white border-slate-900 shadow-md transform scale-[1.02]' 
            : 'bg-white text-slate-600 border-gray-200 hover:border-teal-400 hover:shadow-sm'}"
        on:click={() => selectedRouteId = 'ALL'}
    >
        <span class="font-bold tracking-tight">Show All System</span>
        <div class="w-2 h-2 rounded-full {selectedRouteId === 'ALL' ? 'bg-teal-400' : 'bg-slate-300'}"></div>
    </button>

    <div class="h-px bg-gray-100 my-2"></div>

    {#each sortedRoutes as route}
      <button 
    class="w-full group flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 mb-1
    {selectedRouteId === route.route_number 
        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' 
        : 'text-slate-600 hover:bg-slate-100'}"
    on:click={() => selectedRouteId = route.route_number}
>
    <div 
        class="w-10 h-8 flex items-center justify-center rounded-lg font-bold text-xs shadow-sm"
        style="
            background-color: {selectedRouteId === route.route_number ? 'white' : (route.color || '#334155')}; 
            color: {selectedRouteId === route.route_number ? '#0284c7' : (route.text_color || '#ffffff')};
        "
    >
        {route.route_number}
    </div>

    <div class="flex-1 text-left">
        <div class="text-[10px] font-bold opacity-70 uppercase tracking-wider">OTP</div>
        <div class="font-bold text-base leading-none">
            {route.otp_percentage}%
        </div>
    </div>
</button>
    {/each}
</div>