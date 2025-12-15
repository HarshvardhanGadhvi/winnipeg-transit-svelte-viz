<script lang="ts">
    import { TrendingUp, TrendingDown, Minus, ArrowRight, Info } from 'lucide-svelte';
    
    export let title: string;
    export let value: string | number;
    // [FIX] This prop was unused before; now we map it to classes
    export let color: 'brand' | 'success' | 'warning' | 'danger' | 'slate' | 'blue' | 'orange' | 'rose' = 'slate';
    export let trendValue: number = 0; 
    export let trendLabel: string = "vs last 30 days";
    export let inverse: boolean = false; 
    export let showTrend: boolean = true;
    export let trendText: string | null = null;
    export let description: string = ""; 

    // [NEW] Color Mapping
    const colorMap = {
        brand:   'text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]',
        success: 'text-[var(--color-success-600)] dark:text-[var(--color-success-400)]',
        warning: 'text-amber-600 dark:text-amber-400',
        danger:  'text-[var(--color-danger-600)] dark:text-[var(--color-danger-400)]',
        blue:    'text-blue-600 dark:text-blue-400',
        orange:  'text-orange-600 dark:text-orange-400',
        rose:    'text-rose-600 dark:text-rose-400',
        slate:   'text-[var(--text-main)]'
    };

    $: themeClass = colorMap[color] || colorMap.slate;

    $: isGood = inverse ? trendValue < 0 : trendValue > 0;
    $: isNeutral = Math.abs(trendValue) < 0.1;

    const neutralClass = 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-500/10';
    const goodClass = 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/20';
    const badClass = 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/20';

    $: trendColor = (trendText) ? neutralClass : (isNeutral ? neutralClass : (isGood ? goodClass : badClass));
    $: TrendIcon = trendText ? ArrowRight : (isNeutral ? Minus : (trendValue > 0 ? TrendingUp : TrendingDown));
    $: formattedTrend = trendText || ((trendValue > 0 ? '+' : '') + trendValue.toFixed(1) + '%');
</script>

<div class="fluent-card p-6 relative overflow-visible group hover:-translate-y-1 transition-transform duration-300">
    
    <div class="flex items-center gap-2 mb-1 relative z-10">
        <h3 class="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">{title}</h3>
        {#if description}
            <div class="relative group/info">
                <Info size={14} class="text-[var(--text-muted)] cursor-help opacity-50 hover:opacity-100 transition-opacity" />
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 z-50 pointer-events-none text-center leading-relaxed font-medium">
                    {description}
                    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
            </div>
        {/if}
    </div>
    
    <div class="flex justify-between items-start relative z-10 mt-2">
        <div class="text-4xl font-extrabold tracking-tight {themeClass}">{value}</div>
    </div>

    {#if showTrend}
        <div class="mt-4 flex items-center gap-2 relative z-10">
            <div class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold {trendColor} transition-colors">
                <svelte:component this={TrendIcon} size={14} strokeWidth={3} />
                <span>{formattedTrend}</span>
            </div>
            <span class="text-xs font-medium text-[var(--text-muted)] opacity-80">{trendLabel}</span>
        </div>
    {/if}
</div>