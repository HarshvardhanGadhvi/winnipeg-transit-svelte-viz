<script>
    import { onMount } from 'svelte';
    import { passupStore, fetchPassupData } from '../../stores/passupStore';
    import PassupTrendChart from './PassupTrendChart.svelte';
    import PassupHeatmap from './PassupHeatmap.svelte'; // [NEW]
    import PassupRouteChart from './PassupRouteChart.svelte'; // [NEW]
    import OTP_Scorecard from '../OTP/OTP_Scorecard.svelte';

    // [NEW] Local state for extra data
    let heatmapData = [];
    let routeRankData = [];

    $: ({ summary, loading, error } = $passupStore);
    
    // Aggregates
    $: totalPassups = summary.reduce((acc, curr) => acc + curr.total_passups, 0);
    $: fullBusTotal = summary.reduce((acc, curr) => acc + curr.full_bus_total, 0);

    onMount(async () => {
        fetchPassupData(); // Fetches the summary
        
        // [NEW] Fetch the Map and Route data separately
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
            <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Pass-up Analysis</h2>
            <p class="text-slate-500 mt-1 font-medium">Monitoring capacity hotspots and top offender routes.</p>
        </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <OTP_Scorecard title="Total Pass-ups" value={totalPassups.toLocaleString()} color="slate" />
        <OTP_Scorecard title="Due to Full Bus" value={fullBusTotal.toLocaleString()} color="orange" />
        <OTP_Scorecard title="Top Offender" value={routeRankData[0] ? `Rte ${routeRankData[0].route_number}` : '-'} color="rose" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
        
        <div class="lg:col-span-2 fluent-card p-1 overflow-hidden relative group">
            <div class="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-3 py-1 rounded-lg shadow-sm">
                <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Pass-up Hotspots</span>
            </div>
            <PassupHeatmap mapData={heatmapData} />
        </div>

        <div class="fluent-card p-6 flex flex-col">
            <h3 class="text-lg font-bold text-slate-800 mb-4">Top Routes</h3>
            <div class="flex-1 min-h-0">
                <PassupRouteChart routeData={routeRankData} />
            </div>
        </div>
    </div>

    <div class="fluent-card p-6 h-[400px]">
        <h3 class="text-lg font-bold text-slate-800 mb-4">Monthly Trend</h3>
        <div class="h-[320px] w-full">
            <PassupTrendChart chartData={summary} />
        </div>
    </div>
</div>