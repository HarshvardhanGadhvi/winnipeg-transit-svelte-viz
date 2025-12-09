<script lang="ts">
    import { onMount } from 'svelte';
    import { TrendingUp, Users, Activity } from 'lucide-svelte';
    import { otpStore, fetchOtpData } from './stores/otpStore'; 
    import RouteList from './components/OTP/RouteList.svelte';
    import OTP_Scorecard from './components/OTP/OTP_Scorecard.svelte';
    import DailyTrendChart from './components/OTP/DailyTrendChart.svelte';
    import SeasonalRidershipChart from './components/Ridership/SeasonalRidershipChart.svelte';
    
    $: ({ routes, metadata, loading, error } = $otpStore as any);

    let selectedRouteId = 'ALL';
    let currentTab: 'OTP' | 'RIDERSHIP' = 'OTP';
    
    $: displayData = selectedRouteId === 'ALL' 
        ? null 
        : (routes || []).find((r: any) => r.route_number === selectedRouteId);

    $: currentOTP = displayData 
        ? displayData.otp_percentage 
        : (metadata?.overall_otp_percentage || 0);

    onMount(() => fetchOtpData());
</script>

<div class="flex h-screen bg-slate-50 font-sans text-slate-800">
    
    {#if currentTab === 'OTP'}
        <aside class="w-72 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col shadow-sm z-10">
            <div class="p-5 border-b border-slate-100">
                <div class="flex items-center gap-2 mb-1 text-teal-700">
                    <Activity size={24} />
                    <span class="font-bold text-lg tracking-tight">TransitPulse</span>
                </div>
                <p class="text-xs text-slate-400">Winnipeg Transit Analytics</p>
            </div>
            <RouteList bind:selectedRouteId />
        </aside>
    {/if}

    <main class="flex-1 flex flex-col h-screen overflow-hidden">
        
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
            <div class="flex gap-1 bg-slate-100 p-1 rounded-lg">
                <button 
                    onclick={() => currentTab = 'OTP'}
                    class="px-4 py-1.5 rounded-md text-sm font-medium transition-all {currentTab === 'OTP' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
                >
                    <div class="flex items-center gap-2"><TrendingUp size={16}/> On-Time Performance</div>
                </button>
                <button 
                    onclick={() => currentTab = 'RIDERSHIP'}
                    class="px-4 py-1.5 rounded-md text-sm font-medium transition-all {currentTab === 'RIDERSHIP' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}"
                >
                    <div class="flex items-center gap-2"><Users size={16}/> Ridership</div>
                </button>
            </div>
            <div class="text-xs text-slate-400">
                Last Sync: {metadata?.processed_at ? new Date(metadata.processed_at).toLocaleDateString() : '...'}
            </div>
        </header>

        <div class="flex-1 overflow-y-auto p-8">
            <div class="max-w-6xl mx-auto space-y-8">
                
                {#if loading}
                    <div class="flex flex-col items-center justify-center h-96 gap-4 text-slate-400">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                        <p>Loading dataset...</p>
                    </div>
                {:else if error}
                    <div class="p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
                        ⚠️ <span>Connection Error: {error}</span>
                    </div>
                {:else}
                    {#if currentTab === 'OTP'}
                        <div>
                            <h1 class="text-2xl font-bold text-slate-800">
                                {selectedRouteId === 'ALL' ? 'System Overview' : `Route ${selectedRouteId} Analysis`}
                            </h1>
                            <p class="text-slate-500">Performance metrics based on the Primary Transit Network.</p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <OTP_Scorecard title="On-Time Score" value="{currentOTP.toFixed(1)}%" color="teal" />
                            <OTP_Scorecard title="Routes Active" value={(routes || []).length} color="gray" />
                            <OTP_Scorecard title="Total Trips" value={metadata?.total_trips_analyzed?.toLocaleString()} color="gray" />
                            <OTP_Scorecard title="Avg Deviation" value="1.7 min" color="orange" />
                        </div>

                        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 h-[400px]">
                            <DailyTrendChart selectedRouteId={selectedRouteId} />
                        </div>

                    {:else}
                        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <SeasonalRidershipChart />
                        </div>
                    {/if}
                {/if}
            </div>
        </div>
    </main>
</div>

<style global>
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
</style>