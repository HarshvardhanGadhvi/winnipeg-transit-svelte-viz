<script lang="ts">
    import { TrendingUp, TrendingDown, Minus } from 'lucide-svelte';
    export let title: string;
    export let value: string | number;
    export let color: string = 'slate';
    export let trendValue: number = 0; 
    export let trendLabel: string = "vs last 30 days";
    export let inverse: boolean = false; 

    $: isGood = inverse ? trendValue < 0 : trendValue > 0;
    $: isNeutral = Math.abs(trendValue) < 0.1;
    $: trendColor = isNeutral ? 'text-slate-400' : (isGood ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50');
    $: trendIcon = isNeutral ? Minus : (trendValue > 0 ? TrendingUp : TrendingDown);
    $: formattedTrend = (trendValue > 0 ? '+' : '') + trendValue.toFixed(1);
</script>

<div class="fluent-card p-5 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
    <div class="absolute -right-4 -top-4 w-24 h-24 bg-{color}-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wide relative z-10">{title}</h3>
    
    <div class="mt-2 flex items-baseline gap-2 relative z-10">
        <span class="text-4xl font-bold text-slate-900 tracking-tight">{value}</span>
    </div>

    <div class="mt-4 flex items-center gap-2 relative z-10">
        <div class={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md ${trendColor}`}>
            <svelte:component this={trendIcon} size={14} />
            <span>{formattedTrend}{title.includes('Score') ? '%' : ''}</span>
        </div>
        <span class="text-xs font-medium text-slate-400">{trendLabel}</span>
    </div>
</div>