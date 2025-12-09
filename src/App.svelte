<script lang="ts">
    import { onMount } from 'svelte';
    import { TrendingUp, Users } from 'lucide-svelte'; // Removed unused Clock icon
    
    // Store & Component Imports
    import { otpStore, fetchOtpData } from './stores/otpStore'; 
    import RouteList from './components/OTP/RouteList.svelte';
    import OTP_Scorecard from './components/OTP/OTP_Scorecard.svelte';
    import DailyTrendChart from './components/OTP/DailyTrendChart.svelte';
    import SeasonalRidershipChart from './components/Ridership/SeasonalRidershipChart.svelte';
    
    // Svelte Store Subscription: Define all variables used from the store immediately
    $: ({ routes, metadata, loading, error } = $otpStore);

    // --- State Initialization ---
    let selectedRouteId = 'ALL';
    let currentTab: 'OTP' | 'RIDERSHIP' = 'OTP'; // Initialize currentTab
    
    // --- Reactive Calculations (Filtered Data & KPIs) ---
    
    // Find the specific route data if one is selected
    $: displayData = selectedRouteId === 'ALL' 
        ? null 
        : routes.find(r => r.route_number === selectedRouteId);

    // Calculate the current OTP % to display on the scorecard
    $: currentOTP = displayData 
        ? displayData.otp_percentage 
        : (metadata?.overall_otp_percentage || 0);

    // Calculate total number of routes analyzed
    $: routesTracked = routes.length || 0;

    // --- Lifecycle Hook ---
    onMount(() => {
        // Fetch data when the component first mounts
        fetchOtpData();
    });
</script>

<div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="p-4 bg-white shadow-lg sticky top-0 border-b z-20">
        <div class="flex justify-between items-center mb-3">
            <h1 class="text-3xl font-extrabold text-teal-700">Transit Performance Navigator</h1>
            <span class="text-sm text-gray-400">
                Updated: {metadata.processed_at ? new Date(metadata.processed_at).toLocaleTimeString() : '...'}
            </span>
        </div>
        
        <div class="flex space-x-4">
            <button 
                on:click={() => currentTab = 'OTP'}
                class="flex items-center space-x-2 px-4 py-2 font-semibold {currentTab === 'OTP' ? 'text-teal-600 border-b-4 border-teal-600' : 'text-gray-400'} transition"
            >
                <TrendingUp size={18} /><span>On-Time Performance</span>
            </button>
            <button 
                on:click={() => currentTab = 'RIDERSHIP'}
                class="flex items-center space-x-2 px-4 py-2 font-semibold {currentTab === 'RIDERSHIP' ? 'text-teal-600 border-b-4 border-teal-600' : 'text-gray-400'} transition"
            >
                <Users size={18} /><span>Ridership</span>
            </button>
        </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
        <aside class="w-64 bg-white border-r overflow-y-auto hidden md:block">
            <RouteList bind:selectedRouteId />
        </aside>

        <main class="flex-1 p-6 overflow-y-auto">
            <div class="max-w-7xl mx-auto">
                <h2 class="text-2xl font-bold mb-6 text-gray-700">
                    {currentTab === 'OTP' 
                        ? (selectedRouteId === 'ALL' ? 'System Overview' : `Route #${selectedRouteId} Performance`)
                        : 'Seasonal Ridership Analysis'}
                </h2>

                {#if loading}
                    <div class="text-center p-20 text-teal-600 animate-pulse font-bold text-xl">Loading transit data systems...</div>
                {:else if error}
                    <div class="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">Error: {error}</div>
                {:else}
                    {#if currentTab === 'OTP'}
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <OTP_Scorecard 
                                title="Current OTP" 
                                value="{currentOTP.toFixed(1)}%" 
                                color="teal" 
                            />
                            <OTP_Scorecard 
                                title="Routes Tracked" 
                                value="{routesTracked}" 
                                color="gray" 
                            />
                            <OTP_Scorecard 
                                title="Total Trips (Analyzed)" 
                                value="{metadata?.total_trips_analyzed?.toLocaleString() || 'N/A'}" 
                                color="gray" 
                            />
                             <OTP_Scorecard 
                                title="Average Delay" 
                                value="1.7 min" 
                                color="orange" 
                            />
                        </div>
                        
                        <div class="grid grid-cols-1 gap-8">
                            <div class="bg-white p-6 rounded-xl shadow-lg h-96">
                                <DailyTrendChart bind:selectedRouteId={selectedRouteId} />
                            </div>
                        </div>
                        
                    {:else if currentTab === 'RIDERSHIP'}
                        <div class="bg-white p-6 rounded-xl shadow-lg h-[500px]">
                            <SeasonalRidershipChart />
                        </div>
                    {/if}
                {/if}
            </div>
        </main>
    </div>
</div>

<style global>
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
</style>