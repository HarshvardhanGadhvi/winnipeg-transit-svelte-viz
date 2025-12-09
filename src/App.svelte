<script lang="ts">
    import { onMount } from 'svelte';
    import { TrendingUp, Users, Activity, Zap } from 'lucide-svelte';
    import { otpStore, fetchOtpData } from './stores/otpStore'; 
    import RouteList from './components/OTP/RouteList.svelte';
    import OTP_Scorecard from './components/OTP/OTP_Scorecard.svelte';
    import DailyTrendChart from './components/OTP/DailyTrendChart.svelte';
    import SeasonalRidershipChart from './components/Ridership/SeasonalRidershipChart.svelte';
    
    // NEW: Import the specialized map views
    import SystemMapOverview from './components/OTP/SystemMapOverview.svelte';
    import RouteMapViewer from './components/OTP/RouteMapViewer.svelte';
    
    $: ({ routes, metadata, loading, error } = $otpStore as any);

    let selectedRouteId = 'ALL';
    // Removed 'MAP' tab since it's now integrated
    let currentTab: 'OTP' | 'RIDERSHIP' = 'OTP'; 
    
    $: displayData = selectedRouteId === 'ALL' 
        ? null 
        : (routes || []).find((r: any) => r.route_number === selectedRouteId);

    $: currentOTP = displayData 
        ? displayData.otp_percentage 
        : (metadata?.overall_otp_percentage || 0);

    onMount(() => fetchOtpData());
</script>

<div class="flex h-screen bg-gray-50 font-sans text-slate-800 overflow-hidden">
    
    {#if currentTab === 'OTP'}
        <aside class="w-80 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col z-20 transition-all duration-300">
            <div class="h-16 flex items-center px-6 border-b border-gray-100">
                <div class="flex items-center gap-2 text-teal-700">
                    <div class="p-1.5 bg-teal-50 rounded-md">
                        <Activity size={20} class="text-teal-600" />
                    </div>
                    <span class="font-bold text-lg tracking-tight text-slate-900">TransitPulse</span>
                </div>
            </div>
            <RouteList bind:selectedRouteId />
        </aside>
    {/if}

    <main class="flex-1 flex flex-col h-screen min-w-0">
        
        <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10 flex-shrink-0">
            <div class="flex p-1 bg-slate-100/80 rounded-lg border border-slate-200/50">
                <button 
                    on:click={() => currentTab = 'OTP'}
                    class="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 {currentTab === 'OTP' ? 'bg-white text-teal-700 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}"
                >
                    <TrendingUp size={16}/> On-Time Performance
                </button>
                <button 
                    on:click={() => currentTab = 'RIDERSHIP'}
                    class="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 {currentTab === 'RIDERSHIP' ? 'bg-white text-teal-700 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700'}"
                >
                    <Users size={16}/> Ridership
                </button>
            </div>

            <div class="flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                <Zap size={12} class="text-amber-500 fill-amber-500" />
                <span>Synced: {metadata?.processed_at ? new Date(metadata.processed_at).toLocaleTimeString() : '...'}</span>
            </div>
        </header>

        <div class="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 bg-gray-50">
            <div class="max-w-7xl mx-auto space-y-6">
                
                {#if loading}
                    <div class="flex flex-col items-center justify-center h-96 gap-4 text-slate-400">
                        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
                        <p class="text-sm font-medium animate-pulse">Fetching live analytics...</p>
                    </div>
                {:else if error}
                    <div class="p-6 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3">
                        ⚠️ <span class="font-semibold">Connection Error:</span> {error}
                    </div>
                {:else}
                    {#if currentTab === 'OTP'}
                        <div class="flex items-baseline justify-between">
                            <div>
                                <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
                                    {selectedRouteId === 'ALL' ? 'System Overview' : `Route ${selectedRouteId} Report`}
                                </h1>
                                <p class="text-slate-500 text-sm mt-1">Real-time performance metrics against schedule.</p>
                            </div>
                            {#if selectedRouteId !== 'ALL'}
                                <span class="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                    Selected Route
                                </span>
                            {/if}
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <OTP_Scorecard title="On-Time Score" value="{currentOTP.toFixed(1)}%" color="teal" trend="Improving" />
                            <OTP_Scorecard title="Routes Monitored" value={(routes || []).length} color="gray" />
                            <OTP_Scorecard title="Total Trips Analyzed" value={metadata?.total_trips_analyzed?.toLocaleString()} color="blue" />
                            <OTP_Scorecard title="Avg. Deviation" value="1.7 min" color="orange" trend="Worse" />
                        </div>

                        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-[450px]">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="font-semibold text-slate-800">Performance Trend (Last 30 Days)</h3>
                            </div>
                            <div class="h-[380px] w-full">
                                <DailyTrendChart selectedRouteId={selectedRouteId} />
                            </div>
                        </div>

                        {#if selectedRouteId === 'ALL'}
                            <SystemMapOverview />
                        {:else}
                            <RouteMapViewer routeId={selectedRouteId} />
                        {/if}

                    {:else}
                        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
                            <SeasonalRidershipChart />
                        </div>
                    {/if} 
                {/if}
            </div>
        </div>
    </main>
</div>