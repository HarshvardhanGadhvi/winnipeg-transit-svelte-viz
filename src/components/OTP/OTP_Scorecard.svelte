<script lang="ts">
    import { ArrowUp, ArrowDown, Minus } from 'lucide-svelte';
    
    export let title: string;
    export let value: string | number;
    export let trend: 'Improving' | 'Worse' | 'Stable' | 'None' = 'None';
    export let color: 'teal' | 'red' | 'orange' | 'gray' = 'gray';

    // Reactive styles based on props
    $: baseColor = {
        teal: 'text-teal-600 border-l-4 border-teal-500',
        red: 'text-red-600 border-l-4 border-red-500',
        orange: 'text-orange-600 border-l-4 border-orange-500',
        gray: 'text-gray-600 border-l-4 border-gray-300',
    }[color];

    $: trendColor = trend === 'Improving' ? 'text-green-500' : (trend === 'Worse' ? 'text-red-500' : 'text-gray-500');
    $: TrendIcon = trend === 'Improving' ? ArrowUp : (trend === 'Worse' ? ArrowDown : Minus);

    // Format large numbers
    function formatValue(val: string | number) {
        if (typeof val === 'number') {
            return val.toLocaleString();
        }
        return val;
    }
</script>

<div class="bg-white p-5 rounded-xl shadow-lg transition duration-300 hover:shadow-xl {baseColor}">
    <div class="text-lg font-medium text-gray-500 mb-2">
        {title}
    </div>
    <div class="flex items-end justify-between">
        <div class="text-4xl font-extrabold text-gray-900">
            {formatValue(value)}
        </div>
        {#if trend !== 'None'}
            <div class="flex items-center space-x-1">
                <svelte:component this={TrendIcon} class="w-4 h-4 {trendColor}" />
                <span class="text-sm font-semibold {trendColor}">
                    {trend}
                </span>
            </div>
        {/if}
    </div>
    <p class="text-xs text-gray-400 mt-2">vs. last month's average (placeholder)</p>
</div>