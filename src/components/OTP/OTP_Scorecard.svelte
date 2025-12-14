<script lang="ts">
    import { TrendingUp, TrendingDown, Minus } from 'lucide-svelte';
    
    export let title: string;
    export let value: string | number;
    // Expanded color options
    export let color: 'brand' | 'success' | 'warning' | 'danger' | 'slate' | 'blue' | 'orange' | 'rose' = 'slate';
    export let trendValue: number = 0; 
    export let trendLabel: string = "vs last 30 days";
    export let inverse: boolean = false; 

    // Dynamic Color Maps (Using Variables for better Dark Mode contrast)
    const colorMap = {
        brand:  'bg-[var(--color-brand-50)] text-[var(--color-brand-700)] ring-[var(--color-brand-100)]',
        blue:   'bg-blue-50 text-blue-700 ring-blue-100',
        orange: 'bg-orange-50 text-orange-700 ring-orange-100',
        slate:  'bg-slate-100 text-slate-700 ring-slate-200',
        rose:   'bg-rose-50 text-rose-700 ring-rose-100',
        success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        warning: 'bg-amber-50 text-amber-700 ring-amber-100',
        danger:  'bg-red-50 text-red-700 ring-red-100',
    };

    $: themeClass = colorMap[color] || colorMap.slate;

    // Trend Logic
    $: isGood = inverse ? trendValue < 0 : trendValue > 0;
    $: isNeutral = Math.abs(trendValue) < 0.1;
    $: trendColor = isNeutral ? 'text-[var(--text-muted)]' : (isGood ? 'text-emerald-600 bg-emerald-50/50' : 'text-rose-600 bg-rose-50/50');
    $: TrendIcon = isNeutral ? Minus : (trendValue > 0 ? TrendingUp : TrendingDown);
    $: formattedTrend = (trendValue > 0 ? '+' : '') + trendValue.toFixed(1);
</script>

<div class="fluent-card p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
    
    <h3 class="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 relative z-10">{title}</h3>
    
    <div class="flex justify-between items-start relative z-10 mt-2">
        <div class="text-3xl font-extrabold text-[var(--text-main)] tracking-tight">{value}</div>
        
        <div class="p-2 rounded-xl {themeClass} ring-1 ring-inset shadow-sm">
            <div class="w-5 h-5 bg-current opacity-20 rounded-full"></div> 
        </div>
    </div>

    <div class="mt-4 flex items-center gap-2 relative z-10">
        <div class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold {trendColor}">
            <svelte:component this={TrendIcon} size={12} strokeWidth={3} />
            <span>{formattedTrend}%</span>
        </div>
        <span class="text-xs font-medium text-[var(--text-muted)] opacity-80">{trendLabel}</span>
    </div>
</div>