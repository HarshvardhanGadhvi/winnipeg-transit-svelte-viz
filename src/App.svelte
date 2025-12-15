<script lang="ts">
    import { onMount } from 'svelte';
    import { Users, Activity, BarChart3, Trophy, AlertTriangle, Bus } from 'lucide-svelte';
    
    // Stores & Data
    import { otpStore, fetchOtpData } from './stores/otpStore'; 
    
    // Components
    import RouteList from './components/OTP/RouteList.svelte';
    import OTP_Scorecard from './components/OTP/OTP_Scorecard.svelte';
    import DailyTrendChart from './components/OTP/DailyTrendChart.svelte';
    import SystemMapOverview from './components/OTP/SystemMapOverview.svelte';
    import RouteMapViewer from './components/OTP/RouteMapViewer.svelte';
    import PassupDashboard from './components/Passups/PassupDashboard.svelte';
    import SeasonalRidershipChart from './components/Ridership/SeasonalRidershipChart.svelte'; 
    import ThemeToggle from './components/ThemeToggle.svelte';

    // --- TYPES ---
    type TabOption = 'OTP' | 'RIDERSHIP' | 'PASSUPS';

    interface Route {
        route_number: string;
        route_name?: string;
        otp_percentage: number;
        total_trips: number;
        color?: string;
        text_color?: string;
    }

    interface OtpMetadata {
        overall_otp_percentage: number;
        total_trips_analyzed: number;
        average_deviation: number;
        trends?: {
            otp_change: number;
            trip_change: number;
            deviation_change: number;
            current_avg_deviation: number;
        };
    }

    interface OtpStoreData {
        routes: Route[];
        metadata: OtpMetadata;
        loading: boolean;
        error: string | null;
    }

    // --- STATE ---
    $: storeData = $otpStore as unknown as OtpStoreData;
    $: ({ routes, metadata, loading, error } = storeData);

    let selectedRouteId = 'ALL';
    let currentTab: TabOption = 'OTP'; 
    
    // Default trends (prevent 0.0% flash if loading)
    let currentTrends = { 
        otp_change: 0, 
        trip_change: 0, 
        deviation_change: 0,
        current_avg_deviation: 0 
    };

    // [NEW STATE] Dedicated loading state for the dynamic dashboard data
    let dashboardLoading = false; 

    // [FINAL HANG FIX] State to delay rendering the complex dashboard elements
    let renderContent = false; 

    // --- REACTIVE TRIGGER ---
    // Whenever the Route or Metadata changes, fetch the specific stats
    $: if (selectedRouteId && metadata) {
        loadDashboardData(selectedRouteId, metadata);
    }

    // --- CALCULATIONS ---
    $: displayData = selectedRouteId === 'ALL' 
        ? null 
        : (routes || []).find((r) => r.route_number === selectedRouteId);

    $: currentOTP = displayData 
        ? displayData.otp_percentage 
        : (metadata?.overall_otp_percentage || 0);

    $: delayProb = (100 - currentOTP);
    $: delayTrend = (currentTrends.otp_change * -1);

    $: sortedByOTP = [...(routes || [])].sort((a, b) => b.otp_percentage - a.otp_percentage);
    $: bestRoutes = sortedByOTP.slice(0, 10);
    $: worstRoutes = [...sortedByOTP].reverse().slice(0, 10);

    // --- FETCHING ---
    async function loadDashboardData(routeId: string, meta: any) {
        if (!meta) return;

        // [CRITICAL FIX] Set loading flag when a new dashboard fetch starts
        dashboardLoading = true;

        try {
            if (routeId === 'ALL') {
                // For System: Use the metadata we already fetched from the store
                if (meta.trends) {
                    currentTrends = meta.trends;
                }
            } else {
                // For Single Route: We must fetch fresh stats
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/otp/route/${routeId}`);
                const data = await res.json();
                
                if (data.stats) {
                    currentTrends = data.stats;
                }
            }
        } catch (e) { 
            console.error("Data Error:", e); 
        } finally {
            // [CRITICAL FIX] Clear loading flag when the fetch is complete
            dashboardLoading = false;
        }
    }

    onMount(() => {
        fetchOtpData();
        // [FINAL FIX] Delay main content rendering to ensure the thread is clear
        setTimeout(() => {
            renderContent = true;
        }, 50); 
    });
</script>

<div class="flex flex-col h-screen overflow-hidden font-sans text-[var(--text-main)] selection:bg-[var(--color-brand-200)] selection:text-[var(--color-brand-900)]">
    
    <header class="h-20 flex-shrink-0 z-50 flex items-center justify-between px-6 bg-[var(--bg-glass)] backdrop-blur-md border-b border-[var(--border-subtle)] shadow-sm">
        
        <div class="flex items-center gap-3 w-64">
            <div class="p-2 bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-accent-600)] rounded-xl shadow-lg shadow-[var(--color-brand-500)]/20 ring-1 ring-white/20">
                <Bus size={20} class="text-white" />
            </div>
            <div>
                <h1 class="font-extrabold text-lg tracking-tight leading-none text-gradient">Winnipeg</h1>
                <span class="text-[10px] font-bold text-[var(--text-muted)] tracking-[0.2em] uppercase opacity-80">TransitPulse</span>
            </div>
        </div>

        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div class="flex p-1 bg-[var(--bg-card)]/80 backdrop-blur-sm rounded-xl border border-[var(--border-subtle)] shadow-sm">
                {#each ['OTP', 'RIDERSHIP', 'PASSUPS'] as tab}
                    <button 
                        on:click={() => currentTab = tab as TabOption}
                        class="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 
                        {currentTab === tab 
                            ? 'bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-500)] text-white shadow-md shadow-[var(--color-brand-500)]/25 scale-[1.02]' 
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-glass)]'}"
                    >
                        {#if tab === 'OTP'} <BarChart3 size={16} strokeWidth={2.5} /> Performance {/if}
                        {#if tab === 'RIDERSHIP'} <Users size={16} strokeWidth={2.5} /> Ridership {/if}
                        {#if tab === 'PASSUPS'} <Activity size={16} strokeWidth={2.5} /> Pass-ups {/if}
                    </button>
                {/each}
            </div>
        </div>

        <div class="flex items-center gap-4 w-64 justify-end">
            <div class="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] bg-[var(--bg-card)] px-3 py-1.5 rounded-full border border-[var(--border-subtle)] shadow-sm">
                <div class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-brand-400)] opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-brand-500)]"></span>
                </div>
                <span>Live Data</span>
            </div>
            <ThemeToggle />
        </div>
    </header>

    {#if renderContent}
    <div class="flex flex-1 overflow-hidden relative">
        
        {#if currentTab === 'OTP'}
            <aside class="w-80 bg-[var(--bg-glass)]/50 backdrop-blur-xl border-r border-[var(--border-subtle)] shadow-fluent flex-shrink-0 flex flex-col z-40 transition-all duration-300">
                <div class="p-4 pb-2">
                    <h3 class="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider px-2">Select Route</h3>
                </div>
                <RouteList bind:selectedRouteId />
            </aside>
        {/if}

        <main class="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 scroll-smooth relative w-full">
            <div class="max-w-7xl mx-auto space-y-8 pb-20">
                
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
                        <div class="relative transition-opacity duration-300" 
                             class:pointer-events-none={dashboardLoading}
                             class:opacity-50={dashboardLoading}>

                            <div class="flex items-end justify-between">
                                <div>
                                    <h2 class="text-3xl font-extrabold tracking-tight text-[var(--text-main)]">
                                        {selectedRouteId === 'ALL' ? 'System Overview' : `Route ${selectedRouteId} Analysis`}
                                    </h2>
                                    <p class="text-[var(--text-muted)] mt-1 font-medium text-lg">
                                        {selectedRouteId === 'ALL' ? 'Real-time performance across the entire network.' : 'Detailed breakdown of schedule adherence.'}
                                    </p>
                                </div>
                            </div>

                              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <OTP_Scorecard 
        title="On-Time Score" 
        value="{currentOTP.toFixed(1)}%" 
        color="brand" 
        trendValue={currentTrends.otp_change ?? 0} 
    />
    <OTP_Scorecard 
        title="Delay Probability" 
        value="{delayProb.toFixed(1)}%" 
        color={delayProb > 50 ? 'danger' : (delayProb > 25 ? 'orange' : 'success')} 
        trendValue={delayTrend ?? 0} 
        trendLabel="Risk Level" 
        inverse={true} 
    />
    <OTP_Scorecard 
        title="Trips Analyzed" 
        value={(selectedRouteId === 'ALL' ? metadata?.total_trips_analyzed : displayData?.total_trips)?.toLocaleString() ?? '0'} 
        color="blue" 
        trendValue={currentTrends.trip_change ?? 0} 
        trendLabel="vs last 30d" 
    />
    <OTP_Scorecard 
        title="Avg Deviation" 
        value="{selectedRouteId === 'ALL' 
            ? metadata?.average_deviation?.toFixed(1) 
            : (currentTrends.current_avg_deviation ?? 0).toFixed(1)} min" 
        color="orange" 
        trendValue={currentTrends.deviation_change ?? 0} 
        inverse={true}
        description="The average time (in minutes) that buses deviate from the schedule. Lower is better."
    />
</div>

                            <div class="fluent-card p-8 h-[500px] relative overflow-hidden group">
                                <div class="absolute -top-24 -right-24 w-64 h-64 bg-[var(--color-brand-500)] rounded-full blur-[100px] opacity-10 dark:opacity-20 pointer-events-none"></div>
                                <div class="flex justify-between items-center mb-4 relative z-10">
                                    <h3 class="text-xl font-bold flex items-center gap-3 text-[var(--text-main)]">
                                        <Activity class="text-[var(--color-brand-500)]" /> Performance Trend
                                    </h3>
                                </div>
                                <div class="h-[380px] w-full relative z-10">
                                    {#key selectedRouteId} 
                                        <DailyTrendChart routeId={selectedRouteId} />
                                    {/key}
                                </div>
                            </div>

                            {#if selectedRouteId === 'ALL'}
                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div class="fluent-card p-6">
                                        <div class="flex items-center justify-between mb-6">
                                            <h3 class="font-bold flex items-center gap-2 text-[var(--color-success-600)] dark:text-[var(--color-success-400)] text-lg"><Trophy size={20} class="text-amber-400" /> Top 10 Routes (On-Time)</h3>
                                        </div>
                                        <div class="space-y-3">
                                            {#each bestRoutes as route, i (route.route_number)}
                                                <div class="flex items-center justify-between p-3 rounded-xl transition-all border border-[var(--border-subtle)] hover:border-[var(--color-success-200)] {i === 0 ? 'bg-amber-500/10 border-amber-500/30' : i === 1 ? 'bg-slate-500/10 border-slate-500/30' : i === 2 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-[var(--bg-card)]'}">
                                                    <div class="flex items-center gap-4">
                                                        <div class="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm {i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-700' : i === 2 ? 'bg-orange-100 text-orange-800' : 'bg-[var(--bg-main)] text-[var(--text-muted)]'}">#{i+1}</div>
                                                        <span class="font-bold text-sm">Route {route.route_number}</span>
                                                    </div>
                                                    <span class="font-bold text-[var(--color-success-600)] dark:text-[var(--color-success-400)] w-12 text-right">{route.otp_percentage}%</span>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                    <div class="fluent-card p-6">
                                        <div class="flex items-center justify-between mb-6">
                                            <h3 class="font-bold flex items-center gap-2 text-[var(--color-danger-600)] dark:text-[var(--color-danger-400)] text-lg"><AlertTriangle size={20} /> Late Routes (Needs Attention)</h3>
                                        </div>
                                        <div class="space-y-3">
                                            {#each worstRoutes as route, i (route.route_number)}
                                                <div class="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--color-danger-200)] transition-all">
                                                    <div class="flex items-center gap-4">
                                                        <div class="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm bg-[var(--color-danger-50)] text-[var(--color-danger-600)]">#{i+1}</div>
                                                        <span class="font-bold text-sm">Route {route.route_number}</span>
                                                    </div>
                                                    <span class="font-bold text-[var(--color-danger-600)] dark:text-[var(--color-danger-400)] w-12 text-right">{route.otp_percentage}%</span>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                </div>
                            {/if}

                            <div class="fluent-card p-2 min-h-[400px]">
                                {#key selectedRouteId}
                                    {#if selectedRouteId === 'ALL'} <SystemMapOverview /> {:else} <RouteMapViewer routeId={selectedRouteId} /> {/if}
                                {/key}
                            </div>
                            
                            {#if dashboardLoading}
                                <div class="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                                    <div class="loading loading-spinner loading-lg text-[var(--color-brand-600)]"></div>
                                </div>
                            {/if}
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
        </main>
    </div>
    {:else}
        <div class="flex flex-1 items-center justify-center">
            <span class="loading loading-spinner loading-lg text-[var(--color-brand-600)]"></span>
        </div>
    {/if}
</div>