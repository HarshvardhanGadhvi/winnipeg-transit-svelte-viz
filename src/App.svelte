<script lang="ts">
    import { onMount } from 'svelte';
    import { Users, Activity, BarChart3, Trophy, AlertTriangle, Medal } from 'lucide-svelte';
    import { otpStore, fetchOtpData } from './stores/otpStore'; 
    import RouteList from './components/OTP/RouteList.svelte';
    import OTP_Scorecard from './components/OTP/OTP_Scorecard.svelte';
    import DailyTrendChart from './components/OTP/DailyTrendChart.svelte';
    import SeasonalRidershipChart from './components/Ridership/SeasonalRidershipChart.svelte';
    import SystemMapOverview from './components/OTP/SystemMapOverview.svelte';
    import RouteMapViewer from './components/OTP/RouteMapViewer.svelte';
    import PassupDashboard from './components/Passups/PassupDashboard.svelte';
    import ThemeToggle from './components/ThemeToggle.svelte';

    // Get Store Data
    $: ({ routes, metadata, loading, error } = $otpStore as any);

    // Local State
    let selectedRouteId = 'ALL';
    let currentTab: 'OTP' | 'RIDERSHIP' | 'PASSUPS' = 'OTP'; 
    let timeRange: 30 | 60 = 30; 
    
    let currentTrends = { otp_change: 0, trip_change: 0, deviation_change: 0 };
    let chartHistory: any[] = []; 

    // Reactive Helpers
    $: displayData = selectedRouteId === 'ALL' 
        ? null 
        : (routes || []).find((r: any) => r.route_number === selectedRouteId);

    $: currentOTP = displayData 
        ? displayData.otp_percentage 
        : (metadata?.overall_otp_percentage || 0);

    // [NEW] Calculate "Delay Probability" (Inverse of OTP)
    $: delayProb = (100 - currentOTP);
    $: delayTrend = (currentTrends.otp_change * -1); // If OTP goes down, Delay Chance goes up (Bad)

    // Leaderboard Calculations
    $: sortedByOTP = [...(routes || [])].sort((a: any, b: any) => b.otp_percentage - a.otp_percentage);
    $: bestRoutes = sortedByOTP.slice(0, 10);
    $: worstRoutes = [...sortedByOTP].reverse().slice(0, 10);

    // Watch for changes in Route OR Time Range
    $: loadDashboardData(selectedRouteId, metadata, timeRange);

    async function loadDashboardData(routeId: string, meta: any, range: number) {
        if (!meta) return;
        try {
            if (routeId === 'ALL') {
                currentTrends = meta.trends || {};
                const res = await fetch(`http://localhost:5001/api/v1/otp/system-history?days=${range}`);
                chartHistory = await res.json(); 
            } else {
                const res = await fetch(`http://localhost:5001/api/v1/otp/route/${routeId}?days=${range}`);
                const data = await res.json();
                if (data.history) chartHistory = data.history;
                if (data.stats) currentTrends = data.stats;
            }
        } catch (e) { console.error("Data Error:", e); }
    }

    onMount(() => fetchOtpData());
</script>

<div class="flex h-screen overflow-hidden font-sans text-[var(--text-main)] selection:bg-[var(--color-brand-200)] selection:text-[var(--color-brand-900)]">
    
    {#if currentTab === 'OTP'}
        <aside class="w-80 bg-[var(--bg-glass)] backdrop-blur-xl border-r border-[var(--border-subtle)] shadow-fluent flex-shrink-0 flex flex-col z-30 transition-colors duration-300">
            <div class="h-20 flex items-center px-6">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] rounded-xl shadow-lg shadow-[var(--color-brand-500)]/30">
                        <Activity size={22} class="text-white" />
                    </div>
                    <div>
                        <h1 class="font-bold text-xl tracking-tight leading-none">Winnipeg</h1>
                        <span class="text-xs font-bold text-[var(--color-brand-600)] tracking-widest uppercase">TransitPulse</span>
                    </div>
                </div>
            </div>
            <RouteList bind:selectedRouteId />
        </aside>
    {/if}

    <main class="flex-1 flex flex-col h-screen min-w-0 relative">
        
        <header class="h-20 flex items-center justify-between px-8 z-20 flex-shrink-0">
            <div class="flex p-1.5 bg-[var(--bg-card)] backdrop-blur-md rounded-2xl border border-[var(--border-subtle)] shadow-sm">
                {#each ['OTP', 'RIDERSHIP', 'PASSUPS'] as tab}
                    <button 
                        on:click={() => currentTab = tab}
                        class="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 
                        {currentTab === tab 
                            ? 'bg-[var(--color-brand-500)] text-white shadow-md shadow-[var(--color-brand-500)]/20 scale-100' 
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-glass)]'}"
                    >
                        {#if tab === 'OTP'} <BarChart3 size={18}/> Performance {/if}
                        {#if tab === 'RIDERSHIP'} <Users size={18}/> Ridership {/if}
                        {#if tab === 'PASSUPS'} <Activity size={18}/> Pass-ups {/if}
                    </button>
                {/each}
            </div>
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] bg-[var(--bg-card)] px-4 py-2 rounded-full border border-[var(--border-subtle)] shadow-sm">
                    <div class="relative flex h-2.5 w-2.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-400)] opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-brand-500)]"></span>
                    </div>
                    <span>Live</span>
                </div>
                <ThemeToggle />
            </div>
        </header>

        <div class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 scroll-smooth">
            <div class="max-w-7xl mx-auto space-y-8 pb-10">
                
                {#if loading}
                    <div class="flex flex-col items-center justify-center h-[60vh] gap-6">
                        <div class="loading loading-spinner loading-lg text-[var(--color-brand-600)]"></div>
                        <p class="text-[var(--text-muted)] animate-pulse font-medium">Connecting to Transit Network...</p>
                    </div>
                {:else if error}
                    <div class="alert alert-error shadow-lg rounded-2xl border border-red-200 bg-red-50 text-red-800">
                        <span>{error}</span>
                    </div>
                {:else}
                    
                    {#if currentTab === 'OTP'}
                        
                        <div class="flex items-end justify-between">
                            <div>
                                <h2 class="text-3xl font-bold tracking-tight">
                                    {selectedRouteId === 'ALL' ? 'System Overview' : `Route ${selectedRouteId} Analysis`}
                                </h2>
                                <p class="text-[var(--text-muted)] mt-1 font-medium">
                                    {selectedRouteId === 'ALL' ? 'Monitoring real-time performance across the entire network.' : 'Detailed breakdown of schedule adherence and stops.'}
                                </p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <OTP_Scorecard 
                                title="On-Time Score" 
                                value="{currentOTP.toFixed(1)}%" 
                                color="brand" 
                                trendValue={currentTrends.otp_change} 
                            />
                            
                            <OTP_Scorecard 
                                title="Delay Probability" 
                                value="{delayProb.toFixed(1)}%" 
                                color={delayProb > 50 ? 'danger' : (delayProb > 25 ? 'orange' : 'success')} 
                                trendValue={delayTrend} 
                                trendLabel="Risk Level"
                                inverse={true}
                            />
                            
                            <OTP_Scorecard 
                                title="Trips Analyzed" 
                                value={selectedRouteId === 'ALL' ? metadata?.total_trips_analyzed?.toLocaleString() : displayData?.total_trips?.toLocaleString()} 
                                color="blue" 
                                trendValue={currentTrends.trip_change} 
                                trendLabel="vs last 30d" 
                            />
                            
                            <OTP_Scorecard 
                                title="Avg Deviation" 
                                value="1.7 min" 
                                color="orange" 
                                trendValue={currentTrends.deviation_change} 
                                inverse={true} 
                            />
                        </div>

                        <div class="fluent-card p-6 h-[480px] relative overflow-hidden group">
                            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-brand-300)] to-[var(--color-brand-500)]"></div>
                            <div class="flex justify-between items-center mb-6">
                                <h3 class="text-lg font-bold flex items-center gap-2">Performance Trend</h3>
                                <div class="flex items-center gap-1 bg-[var(--bg-main)] p-1 rounded-lg border border-[var(--border-subtle)]">
                                    {#each [30, 60] as range}
                                        <button on:click={() => timeRange = range} class="px-3 py-1 text-xs font-bold rounded-md transition-all duration-200 {timeRange === range ? 'bg-[var(--color-brand-100)] text-[var(--color-brand-700)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'}">{range}d</button>
                                    {/each}
                                </div>
                            </div>
                            <div class="h-[380px] w-full">
                                <DailyTrendChart chartData={chartHistory} label={selectedRouteId === 'ALL' ? 'System OTP' : `Route ${selectedRouteId} OTP`} />
                            </div>
                        </div>

                        {#if selectedRouteId === 'ALL'}
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div class="fluent-card p-6">
                                    <div class="flex items-center justify-between mb-6">
                                        <h3 class="font-bold flex items-center gap-2 text-[var(--color-success-600)] text-lg">
                                            <Trophy size={20} class="text-amber-400" /> 
                                            Top 10 Routes (On-Time)
                                        </h3>
                                    </div>
                                    <div class="space-y-3">
                                        {#each bestRoutes as route, i (route.route_number)}
                                            <div class="flex items-center justify-between p-3 rounded-xl transition-all border border-[var(--border-subtle)] hover:border-[var(--color-success-200)] 
                                                {i === 0 ? 'bg-amber-50/50 border-amber-200' : 
                                                 i === 1 ? 'bg-slate-50/80 border-slate-200' : 
                                                 i === 2 ? 'bg-orange-50/50 border-orange-200' : 'bg-[var(--bg-card)]'}">
                                                
                                                <div class="flex items-center gap-4">
                                                    <div class="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm
                                                        {i === 0 ? 'bg-amber-100 text-amber-700' : 
                                                         i === 1 ? 'bg-slate-200 text-slate-700' : 
                                                         i === 2 ? 'bg-orange-100 text-orange-800' : 'bg-[var(--bg-main)] text-[var(--text-muted)]'}">
                                                        #{i+1}
                                                    </div>
                                                    <div class="flex flex-col">
                                                        <span class="font-bold text-sm">Route {route.route_number}</span>
                                                    </div>
                                                </div>
                                                <div class="flex items-center gap-3">
                                                    <div class="h-2 w-24 bg-[var(--bg-main)] rounded-full overflow-hidden hidden sm:block">
                                                        <div class="h-full bg-[var(--color-success-500)] rounded-full" style="width: {route.otp_percentage}%"></div>
                                                    </div>
                                                    <span class="font-bold text-[var(--color-success-600)] w-12 text-right">{route.otp_percentage}%</span>
                                                </div>
                                            </div>
                                        {/each}
                                    </div>
                                </div>

                                <div class="fluent-card p-6">
                                    <div class="flex items-center justify-between mb-6">
                                        <h3 class="font-bold flex items-center gap-2 text-[var(--color-danger-600)] text-lg">
                                            <AlertTriangle size={20} /> 
                                            Late Routes (Needs Attention)
                                        </h3>
                                    </div>
                                    <div class="space-y-3">
                                        {#each worstRoutes as route, i (route.route_number)}
                                            <div class="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--color-danger-200)] transition-all">
                                                <div class="flex items-center gap-4">
                                                    <div class="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm bg-[var(--color-danger-50)] text-[var(--color-danger-600)]">
                                                        #{i+1}
                                                    </div>
                                                    <span class="font-bold text-sm">Route {route.route_number}</span>
                                                </div>
                                                <div class="flex items-center gap-3">
                                                    <div class="h-2 w-24 bg-[var(--bg-main)] rounded-full overflow-hidden hidden sm:block">
                                                        <div class="h-full bg-[var(--color-danger-500)] rounded-full" style="width: {route.otp_percentage}%"></div>
                                                    </div>
                                                    <span class="font-bold text-[var(--color-danger-600)] w-12 text-right">{route.otp_percentage}%</span>
                                                </div>
                                            </div>
                                        {/each}
                                    </div>
                                </div>
                            </div>
                        {/if}

                        <div class="fluent-card p-2 min-h-[400px]">
                            {#key selectedRouteId}
                                {#if selectedRouteId === 'ALL'}
                                    <SystemMapOverview />
                                {:else}
                                    <RouteMapViewer routeId={selectedRouteId} />
                                {/if}
                            {/key}
                        </div>

                    {:else if currentTab === 'PASSUPS'}
                        <div class="fluent-card p-8 min-h-[500px]">
                            <PassupDashboard />
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