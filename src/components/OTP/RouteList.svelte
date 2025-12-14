<script lang="ts">
    import { otpStore } from '../../stores/otpStore';
    
    export let selectedRouteId: string;

    interface Route {
        route_number: string;
        otp_percentage: number;
        color: string;
        text_color: string;
        route_name?: string;
    }

    $: storeData = $otpStore as { routes: Route[] };
    $: routes = storeData.routes || [];

    // --- SERVICE LEVEL SORTING ---
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

    $: sortedRoutes = [...routes].sort((a, b) => {
        const pA = getPriority(a.route_number);
        const pB = getPriority(b.route_number);
        return pA - pB || parseInt(a.route_number) - parseInt(b.route_number);
    });

    // --- SMART NAME FORMATTER ---
    // Turns "Route 220 Crestview - Westwood" into "Crestview - Westwood"
    function getDisplayName(route: Route): string {
        if (!route.route_name) return `Route ${route.route_number}`;

        let name = route.route_name.trim();
        const num = route.route_number.trim();

        // 1. Remove "Route {number}" prefix if it exists (case insensitive)
        // e.g. "Route 11 Portage" -> "Portage"
        const prefixRegex = new RegExp(`^Route\\s+${num}\\s*[-:]?\\s*`, 'i');
        name = name.replace(prefixRegex, '');

        // 2. Remove just the number if it starts with it
        // e.g. "11 Portage" -> "Portage"
        const numRegex = new RegExp(`^${num}\\s*[-:]?\\s*`, 'i');
        name = name.replace(numRegex, '');

        // 3. Special Case: If the name is now empty (e.g. name was just "BLUE"), use original
        if (!name) return route.route_name;

        return name;
    }
</script>

<div class="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scroll-smooth">
    
    <button 
        class="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 border group
        {selectedRouteId === 'ALL' 
            ? 'bg-[var(--color-brand-50)] border-[var(--color-brand-200)] shadow-sm' 
            : 'bg-[var(--bg-card)] border-transparent hover:border-[var(--color-brand-200)] hover:bg-[var(--bg-main)]'}"
        on:click={() => selectedRouteId = 'ALL'}
    >
        <span class="font-bold text-sm {selectedRouteId === 'ALL' ? 'text-[var(--color-brand-700)]' : 'text-[var(--text-muted)]'}">
            System Overview
        </span>
        
        <div class="w-2.5 h-2.5 rounded-full transition-all duration-300 
            {selectedRouteId === 'ALL' 
                ? 'bg-[var(--color-brand-500)] scale-100 shadow-[0_0_8px_var(--color-brand-400)]' 
                : 'bg-[var(--border-subtle)] scale-75 group-hover:bg-[var(--color-brand-300)]'}">
        </div>
    </button>

    <div class="h-px bg-[var(--border-subtle)] my-3 mx-2 opacity-50"></div>

    {#each sortedRoutes as route}
      <button 
        class="w-full group flex items-center gap-3 p-2 rounded-xl transition-all duration-200 border relative overflow-hidden
        {selectedRouteId === route.route_number 
            ? 'bg-[var(--color-brand-50)] border-[var(--color-brand-200)] shadow-sm' 
            : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] hover:shadow-sm'}"
        on:click={() => selectedRouteId = route.route_number}
    >
        {#if selectedRouteId === route.route_number}
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-brand-500)]"></div>
        {/if}

        <div 
            class="w-10 h-8 flex items-center justify-center rounded-lg font-bold text-xs shadow-sm flex-shrink-0 transition-transform group-hover:scale-105"
            style="
                background-color: {route.color || '#334155'}; 
                color: {route.text_color || 'white'};
            "
        >
            {route.route_number}
        </div>
        
        <div class="flex flex-col items-start overflow-hidden min-w-0">
            <span class="font-bold text-sm truncate w-full transition-colors text-left
                {selectedRouteId === route.route_number ? 'text-[var(--color-brand-900)]' : ''}">
                {getDisplayName(route)}
            </span>
        </div>

        {#if selectedRouteId === route.route_number}
            <div class="ml-auto flex-shrink-0 text-[var(--color-brand-600)]">
                <div class="w-2 h-2 rounded-full bg-current shadow-[0_0_6px_currentColor]"></div>
            </div>
        {/if}
    </button>
    {/each}
</div>