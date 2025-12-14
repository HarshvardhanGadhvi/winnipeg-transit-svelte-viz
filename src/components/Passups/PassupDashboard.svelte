<script>
    import { onMount } from 'svelte';
    import { passupStore, fetchPassupData } from '../../stores/passupStore';
    import PassupTrendChart from './PassupTrendChart.svelte';
    import PassupHeatmap from './PassupHeatmap.svelte';
    import PassupRouteChart from './PassupRouteChart.svelte';
    import OTP_Scorecard from '../OTP/OTP_Scorecard.svelte';

    let heatmapData = [];
    let routeRankData = [];

    // Access the full store object
    $: storeData = $passupStore;
    $: summary = storeData.summary || [];
    $: trends = storeData.trends || { total_change: 0, full_bus_change: 0, wheelchair_change: 0 };
    $: loading = storeData.loading;
    
    // Calculate All-Time totals from the summary chart data
    $: totalPassups = summary.reduce((acc, curr) => acc + curr.total_passups, 0);
    $: fullBusTotal = summary.reduce((acc, curr) => acc + curr.full_bus_total, 0);
    $: wheelchairTotal = summary.reduce((acc, curr) => acc + curr.wheelchair_total, 0);

    onMount(async () => {
        // Fetch the summary + trends
        fetchPassupData(); 
        
        // Fetch Maps/Routes
        const [mapRes, routeRes] = await Promise.all([
            fetch('http://localhost:5001/api/v1/passups/map'),
            fetch('http://localhost:5001/api/v1/passups/routes')
        ]);
        heatmapData = await mapRes.json();
        routeRankData = await routeRes.json();
    });
</script>

<div class="space-y-6 pb-12">
    <div class="flex items-end justify-between">
        <div>
            <h2 class="text-3xl font-bold tracking-tight text-[var(--text-main)]">Pass-up Analysis</h2>
            <p class="text-[var(--text-muted)] mt-1 font-medium">Monitoring capacity hotspots and top offender routes.</p>
        </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <OTP_Scorecard 
            title="Total Pass-ups" 
            value={totalPassups.toLocaleString()} 
            color="slate" 
            trendValue={trends.total_change} 
            inverse={true}
        />
        
        <OTP_Scorecard 
            title="Due to Full Bus" 
            value={fullBusTotal.toLocaleString()} 
            color="warning" 
            trendValue={trends.full_bus_change} 
            inverse={true}
        />
        
        <OTP_Scorecard 
            title="Wheelchair Denials" 
            value={wheelchairTotal.toLocaleString()} 
            color="brand" 
            trendValue={trends.wheelchair_change} 
            inverse={true}
        />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        <div class="lg:col-span-2 fluent-card p-1 overflow-hidden relative group">
            <div class="absolute top-4 left-4 z-[400] bg-[var(--bg-card)] backdrop-blur px-3 py-1 rounded-lg shadow-sm border border-[var(--border-subtle)]">
                <span class="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Capacity Hotspots</span>
            </div>
            <PassupHeatmap mapData={heatmapData} />
        </div>

        <div class="fluent-card p-6 flex flex-col">
            <h3 class="text-lg font-bold text-[var(--text-main)] mb-4">Top Routes</h3>
            <div class="flex-1 min-h-0">
                <PassupRouteChart routeData={routeRankData} />
            </div>
        </div>
    </div>

    <div class="fluent-card p-6 h-[400px]">
        <h3 class="text-lg font-bold text-[var(--text-main)] mb-4">Monthly Trend</h3>
        <div class="h-[320px] w-full">
            <PassupTrendChart chartData={summary} />
        </div>
    </div>
</div>