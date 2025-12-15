<script lang="ts">
    import { otpStore } from '../../stores/otpStore';
    import type { Route } from '../../types';
    
    export let selectedRouteId: string;

    $: storeData = $otpStore as any; 
    $: routes = (storeData.routes || []) as Route[];

    // --- SERVICE LEVEL SORTING ---
    function getPriority(routeNum: string) {
        const r = routeNum.toUpperCase();
        if (r === 'BLUE') return 1;
        if (r.startsWith('FX')) return 2;
        if (r.startsWith('F')) return 3;
        if (r.startsWith('D')) return 4;
        const n = parseInt(r);
        return !isNaN(n) ? (n < 100 ? 5 : 6) : 7;
    }

    $: sortedRoutes = [...routes].sort((a, b) => {
        const pA = getPriority(a.route_number);
        const pB = getPriority(b.route_number);
        return pA - pB || parseInt(a.route_number) - parseInt(b.route_number);
    });

    function getDisplayName(route: Route): string {
        if (!route.route_name) return `Route ${route.route_number}`;
        let name = route.route_name.trim();
        const num = route.route_number.trim();
        name = name.replace(new RegExp(`^Route\\s+${num}\\s*[-:]?\\s*`, 'i'), '');
        name = name.replace(new RegExp(`^${num}\\s*[-:]?\\s*`, 'i'), '');
        return name || route.route_name;
    }
</script>

<div class="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 scroll-smooth">
    
    <button 
        class="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 border group
        {selectedRouteId === 'ALL' 
            ? 'bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)] border-[var(--color-brand-200)] dark:border-[var(--color-brand-700)] shadow-sm' 
            : 'bg-[var(--bg-card)] border-transparent hover:border-[var(--color-brand-200)] hover:bg-[var(--bg-main)]'}"
        on:click={() => selectedRouteId = 'ALL'}
    >
        <span class="font-bold text-sm {selectedRouteId === 'ALL' ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}">
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
            ? 'bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)] border-[var(--color-brand-200)] dark:border-[var(--color-brand-700)] shadow-sm' 
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
            <span class="font-bold text-sm truncate w-full transition-colors text-left">
                {getDisplayName(route)}
            </span>
        </div>

        {#if selectedRouteId === route.route_number}
            <div class="ml-auto flex-shrink-0 text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
                <div class="w-2 h-2 rounded-full bg-current shadow-[0_0_6px_currentColor]"></div>
            </div>
        {/if}
    </button>
    {/each}
</div>