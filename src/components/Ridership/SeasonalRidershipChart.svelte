<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import { ridershipStore, fetchRidershipData } from '../../stores/ridershipStore';
    import type { RidershipState } from '../../stores/ridershipStore';
    import { Users, TrendingUp, MapPin, Activity } from 'lucide-svelte';
    import OTP_Scorecard from '../OTP/OTP_Scorecard.svelte';

    // --- STATE ---
    $: storeData = $ridershipStore as RidershipState;
    $: ({ summary, routes, heatmap, trends, loading, error } = storeData);

    // --- METRICS FIX ---
    // 1. Total Activity: Should be the LATEST season, not the sum of all history!
    $: latestSeason = summary.length > 0 ? summary[summary.length - 1] : null;
    $: currentTotalBoardings = latestSeason ? latestSeason.total_boardings : 0;

    // 2. Rankings (New Network Only)
    $: topRoutes = (routes || []).slice(0, 10);
    $: bottomRoutes = (routes || []).slice().reverse().slice(0, 10);

    // 3. Trends
    $: safeTrends = trends || { boardings_change: 0, stops_change: 0, prev_top_route: 'N/A' };

    // 4. Network Density
    $: activeStopsCount = heatmap ? heatmap.length : 1;
    $: networkDensity = currentTotalBoardings > 0 
        ? (currentTotalBoardings / activeStopsCount).toFixed(1) 
        : '0.0';

    // --- CHART & MAP ---
    let canvas: HTMLCanvasElement;
    let mapContainer: HTMLElement;
    let chartInstance: Chart;

    $: if (summary && summary.length > 0 && canvas) initChart();
    $: if (heatmap && heatmap.length > 0 && mapContainer) initMap();

    onMount(() => { fetchRidershipData(); });

    // --- CHART LOGIC ---
    function initChart() {
        if (!canvas || chartInstance) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(20, 184, 166, 0.4)'); 
        gradient.addColorStop(1, 'rgba(20, 184, 166, 0.0)');

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: summary.map(d => d.season),
                datasets: [{
                    label: 'Avg Daily Boardings',
                    data: summary.map(d => d.total_boardings),
                    borderColor: '#14b8a6', 
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#f0fdfa',
                    pointBorderColor: '#0d9488',
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(148, 163, 184, 0.1)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }

    // --- MAP LOGIC ---
    async function initMap() {
        if (!mapContainer || (mapContainer as any)._leaflet_id) return; 
        
        const L = await import('leaflet');
        import('leaflet/dist/leaflet.css');

        const map = L.map(mapContainer).setView([49.8951, -97.1384], 11);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        (mapContainer as any)._leaflet_id = true;

        heatmap.forEach(p => {
            const intensity = Math.min(p.boardings / 150, 1);
            const color = intensity > 0.8 ? '#ef4444' : (intensity > 0.4 ? '#f59e0b' : '#3b82f6');
            
            L.circleMarker([p.lat, p.lng], {
                radius: 2 + (intensity * 8),
                color: '', 
                fillColor: color,
                fillOpacity: 0.6
            })
            .bindPopup(`
                <div class="text-sm font-sans p-1">
                    <strong class="text-slate-700 block text-base">${p.stop_name || 'Stop #' + p.stop_number}</strong>
                    <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">Stop #${p.stop_number}</span>
                    <div class="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                        <span class="text-slate-600">Daily Boardings:</span>
                        <span class="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">${Math.round(p.boardings)}</span>
                    </div>
                </div>
            `)
            .addTo(map);
        });
    }
</script>

<div class="space-y-8 pb-12">
    <div class="flex items-end justify-between">
        <div>
            <h2 class="text-3xl font-bold tracking-tight text-[var(--text-main)]">Ridership Overview</h2>
            <p class="text-[var(--text-muted)] mt-1 font-medium">Analyzing passenger volume and stop activity.</p>
        </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <OTP_Scorecard 
            title="Total Daily Activity" 
            value={currentTotalBoardings.toLocaleString()} 
            color="brand" 
            trendValue={safeTrends.boardings_change} 
            trendLabel="vs previous season" 
        />
        
        <OTP_Scorecard 
            title="Busiest Route" 
            value={topRoutes[0] ? `Rte ${topRoutes[0].route_number}` : '-'} 
            color="slate" 
            trendText={safeTrends.prev_top_route !== 'N/A' ? `Prev: ${safeTrends.prev_top_route}` : 'New Record'}
            trendLabel="Top Performer"
        />
        
        <OTP_Scorecard 
            title="Network Density" 
            value={networkDensity} 
            color="blue" 
            trendValue={0}
            showTrend={false} 
            trendLabel="Avg Boardings / Stop"
            description="Average daily passenger boardings per active bus stop. Higher values indicate higher efficiency."
        />
    </div>

    <div class="fluent-card p-8 h-[500px] relative overflow-hidden group">
        <div class="absolute -top-24 -right-24 w-64 h-64 bg-[var(--color-brand-500)] rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
        <div class="flex justify-between items-center mb-6 relative z-10">
            <h3 class="text-xl font-bold flex items-center gap-3 text-[var(--text-main)]">
                <Activity class="text-[var(--color-brand-500)]" /> 
                Historical Ridership Trend
            </h3>
            <span class="text-xs font-bold px-3 py-1 bg-[var(--bg-main)] text-[var(--text-muted)] rounded-full border border-[var(--border-subtle)]">2020 - Present</span>
        </div>
        <div class="h-[400px] w-full relative z-10"><canvas bind:this={canvas}></canvas></div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="fluent-card p-6">
            <h3 class="font-bold flex items-center gap-2 text-[var(--color-brand-600)] mb-4 text-lg"><TrendingUp size={20} /> Highest Ridership Routes</h3>
            <div class="space-y-2">
                {#each topRoutes as route, i}
                    <div class="flex justify-between items-center p-3 rounded-lg bg-[var(--bg-main)] border border-transparent hover:border-[var(--color-brand-200)] transition-colors">
                        <div class="flex items-center gap-3">
                            <span class="w-6 h-6 flex items-center justify-center bg-[var(--color-brand-100)] text-[var(--color-brand-700)] rounded font-bold text-xs">#{i+1}</span>
                            <span class="font-bold text-sm text-[var(--text-main)]">Route {route.route_number}</span>
                        </div>
                        <span class="font-mono text-sm font-bold text-[var(--text-muted)]">{Math.round(route.total_boardings).toLocaleString()}</span>
                    </div>
                {/each}
            </div>
        </div>
        <div class="fluent-card p-6">
            <h3 class="font-bold flex items-center gap-2 text-[var(--text-muted)] mb-4 text-lg"><Users size={20} /> Lowest Ridership Routes</h3>
            <div class="space-y-2">
                {#each bottomRoutes as route, i}
                    <div class="flex justify-between items-center p-3 rounded-lg bg-[var(--bg-main)] border border-transparent hover:border-slate-200 transition-colors">
                        <div class="flex items-center gap-3">
                            <span class="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-500 rounded font-bold text-xs">#{i+1}</span>
                            <span class="font-bold text-sm text-[var(--text-main)]">Route {route.route_number}</span>
                        </div>
                        <span class="font-mono text-sm font-bold text-[var(--text-muted)]">{Math.round(route.total_boardings).toLocaleString()}</span>
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <div class="fluent-card p-1 h-[600px] relative overflow-hidden">
        <div class="absolute top-4 left-4 z-[400] bg-[var(--bg-card)] backdrop-blur px-4 py-2 rounded-xl shadow-lg border border-[var(--border-subtle)]">
            <h4 class="text-sm font-bold text-[var(--text-main)] flex items-center gap-2"><MapPin size={16} class="text-red-500"/> Activity Hotspots</h4>
            <span class="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-bold">New Network Only</span>
        </div>
        <div class="w-full h-full rounded-xl" bind:this={mapContainer}></div>
    </div>
</div>
