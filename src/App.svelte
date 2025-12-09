<script lang="ts">
    import { onMount } from 'svelte';
    import { TrendingUp, Users, Activity, Zap, BarChart3, Map } from 'lucide-svelte';
    import { otpStore, fetchOtpData } from './stores/otpStore'; 
    import RouteList from './components/OTP/RouteList.svelte';
    import OTP_Scorecard from './components/OTP/OTP_Scorecard.svelte';
    import DailyTrendChart from './components/OTP/DailyTrendChart.svelte';
    import SeasonalRidershipChart from './components/Ridership/SeasonalRidershipChart.svelte';
    import SystemMapOverview from './components/OTP/SystemMapOverview.svelte';
    import RouteMapViewer from './components/OTP/RouteMapViewer.svelte';
    
    $: ({ routes, metadata, loading, error } = $otpStore as any);

    let selectedRouteId = 'ALL';
    let currentTab: 'OTP' | 'RIDERSHIP' = 'OTP'; 
    let currentTrends = { otp_change: 0, trip_change: 0, deviation_change: 0 };
    let chartHistory: any[] = []; 

    $: displayData = selectedRouteId === 'ALL' 
        ? null 
        : (routes || []).find((r: any) => r.route_number === selectedRouteId);

    $: currentOTP = displayData 
        ? displayData.otp_percentage 
        : (metadata?.overall_otp_percentage || 0);

    $: loadDashboardData(selectedRouteId, metadata);

    async function loadDashboardData(routeId: string, meta: any) {
        if (!meta) return;
        try {
            if (routeId === 'ALL') {
                currentTrends = meta.trends || {};
                const res = await fetch('http://localhost:5001/api/v1/otp/system-history');
                chartHistory = await res.json(); 
            } else {
                const res = await fetch(`http://localhost:5001/api/v1/otp/route/${routeId}`);
                const data = await res.json();
                if (data.history) chartHistory = data.history;
                if (data.stats) currentTrends = data.stats;
            }
        } catch (e) { console.error("Data Error:", e); }
    }

    onMount(() => fetchOtpData());
</script>

<div class="flex h-screen overflow-hidden font-sans selection:bg-brand-100 selection:text-brand-900">
    
    {#if currentTab === 'OTP'}
        <aside class="w-80 bg-white/70 backdrop-blur-xl border-r border-white/20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex-shrink-0 flex flex-col z-30">
            <div class="h-20 flex items-center px-6">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl shadow-lg shadow-brand-500/30">
                        <Activity size={22} class="text-white" />
                    </div>
                    <div>
                        <h1 class="font-bold text-xl tracking-tight text-slate-900 leading-none">Winnipeg</h1>
                        <span class="text-xs font-semibold text-brand-600 tracking-widest uppercase">TransitPulse</span>
                    </div>
                </div>
            </div>
            <RouteList bind:selectedRouteId />
        </aside>
    {/if}

    <main class="flex-1 flex flex-col h-screen min-w-0 relative">
        
        <header class="h-20 flex items-center justify-between px-8 z-20">
            <div class="flex p-1.5 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm">
                <button 
                    on:click={() => currentTab = 'OTP'}
                    class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 {currentTab === 'OTP' ? 'bg-white text-brand-700 shadow-md scale-100' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}"
                >
                    <BarChart3 size={18}/> Performance
                </button>
                <button 
                    on:click={() => currentTab = 'RIDERSHIP'}
                    class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 {currentTab === 'RIDERSHIP' ? 'bg-white text-brand-700 shadow-md scale-100' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}"
                >
                    <Users size={18}/> Ridership
                </button>
            </div>

            <div class="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white/50 px-4 py-2 rounded-full border border-white/60 shadow-sm">
                <div class="relative flex h-2.5 w-2.5">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </div>
                <span>Live Data Synced</span>
            </div>
        </header>

        <div class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
            <div class="max-w-7xl mx-auto space-y-8 pb-10">
                
                {#if loading}
                    <div class="flex flex-col items-center justify-center h-[60vh] gap-6">
                        <div class="loading loading-spinner loading-lg text-brand-600"></div>
                        <p class="text-slate-400 animate-pulse font-medium">Connecting to Transit Network...</p>
                    </div>
                {:else if error}
                    <div class="alert alert-error shadow-lg rounded-2xl">
                        <span>Error loading data. Is the server running?</span>
                    </div>
                {:else}
                    {#if currentTab === 'OTP'}
                        
                        <div class="flex items-end justify-between">
                            <div>
                                <h2 class="text-3xl font-bold text-slate-900 tracking-tight">
                                    {selectedRouteId === 'ALL' ? 'System Overview' : `Route ${selectedRouteId} Analysis`}
                                </h2>
                                <p class="text-slate-500 mt-1 font-medium">
                                    {selectedRouteId === 'ALL' ? 'Monitoring real-time performance across the entire network.' : 'Detailed breakdown of schedule adherence and stops.'}
                                </p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <OTP_Scorecard title="On-Time Score" value="{currentOTP.toFixed(1)}%" color="brand" trendValue={currentTrends.otp_change} />
                            <OTP_Scorecard title="Active Routes" value={(routes || []).length} color="slate" trendValue={0} trendLabel="Operational" />
                            <OTP_Scorecard title="Trips Analyzed" value={selectedRouteId === 'ALL' ? metadata?.total_trips_analyzed?.toLocaleString() : displayData?.total_trips?.toLocaleString()} color="blue" trendValue={currentTrends.trip_change} trendLabel="vs last 30d" />
                            <OTP_Scorecard title="Avg Deviation" value="1.7 min" color="orange" trendValue={currentTrends.deviation_change} inverse={true} />
                        </div>

                        <div class="fluent-card p-6 h-[480px] relative overflow-hidden group">
                            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-brand-600"></div>
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-lg font-bold text-slate-800">Performance Trend</h3>
                                <div class="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                                    30 Day History
                                </div>
                            </div>
                            <div class="h-[380px] w-full">
                                <DailyTrendChart 
                                    chartData={chartHistory} 
                                    label={selectedRouteId === 'ALL' ? 'System OTP' : `Route ${selectedRouteId} OTP`} 
                                />
                            </div>
                        </div>

                        <div class="fluent-card p-2">
                            {#key selectedRouteId}
                                {#if selectedRouteId === 'ALL'}
                                    <SystemMapOverview />
                                {:else}
                                    <RouteMapViewer routeId={selectedRouteId} />
                                {/if}
                            {/key}
                        </div>

                    {:else}
                        <div class="fluent-card p-8 min-h-[500px]">
                            <SeasonalRidershipChart />
                        </div>
                    {/if} 
                {/if}
            </div>
        </div>
    </main>
</div>