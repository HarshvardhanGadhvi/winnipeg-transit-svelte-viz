<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import Chart from 'chart.js/auto';

    // 1. INPUT: Only accept the Route ID
    export let routeId: string | null = null; 
    
    let chartData: any[] = [];
    let loading = true;
    let canvas: HTMLCanvasElement;
    let chartInstance: Chart | null = null;
    
    let latestRequestId = 0;
    let selectedDays = 30;

    // 2. STABILITY: The key generator for the chart's structural key block
    $: chartKey = `${routeId}-${selectedDays}`; 

    // 3. LIFECYCLE: Reactivity is based on the route ID changing
    $: if (routeId !== undefined && routeId !== null) {
        // Reset to 30d on route switch for consistency
        if (routeId !== 'ALL' && selectedDays !== 30) selectedDays = 30;
        fetchHistory();
    }

    onMount(() => {
        // The initial fetch
        fetchHistory();
    });

    // 4. CLEANUP: Asynchronously destroy Chart.js instance (Hang Fix)
    onDestroy(() => {
        // Destroy the Chart instance after a small delay to prevent the synchronous lock-up
        setTimeout(() => {
            if (chartInstance) {
                chartInstance.destroy();
                chartInstance = null;
            }
        }, 100); 
    });

    function setRange(days: number) {
        if (selectedDays === days) return;
        selectedDays = days;
        fetchHistory();
    }

    // --- Core Fetch Logic ---
   async function fetchHistory() {
        const requestId = ++latestRequestId;
        loading = true;

        const safetyTimeout = setTimeout(() => {
            if (requestId === latestRequestId) loading = false;
        }, 5000);

        try {
            // [FIX] Ensure the baseUrl correctly detects a single route ID
            const isSingleRoute = (routeId && routeId !== 'ALL');
            
            const baseUrl = isSingleRoute
                ? `http://localhost:5001/api/v1/otp/route/${routeId}` // Endpoint 3 (Single Route)
                : `http://localhost:5001/api/v1/otp/system-history`; // Endpoint 2 (System)

            const url = `${baseUrl}?days=${selectedDays}`;
            
            // Log the actual URL being requested for debugging
            console.log(`📡 Fetching Chart: ${url}`);
            
            const res = await fetch(url);
            
            if (requestId !== latestRequestId) return;

            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
            
            const json = await res.json();

            // Handle response structure: array for system, {history: [...]} for single route
            if (isSingleRoute) {
                if (json.history) chartData = json.history; 
                else chartData = [];
            } else {
                if (Array.isArray(json)) chartData = json;        
                else chartData = [];
            }
            
            initChart(); 

        } catch (e) {
            if (requestId === latestRequestId) {
                console.error("Chart Fetch Error:", e);
                chartData = [];
            }
        } finally {
            clearTimeout(safetyTimeout);
            if (requestId === latestRequestId) {
                loading = false;
            }
        }
    }
    // --- Core Chart Drawing ---
    function initChart() {
        if (!canvas) return;
        
        // Destroying here is technically redundant due to the {#key} block, 
        // but it's good defensive programming.
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const sortedData = [...chartData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (sortedData.length === 0) return;

        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(20, 184, 166, 0.4)'); 
        gradient.addColorStop(1, 'rgba(20, 184, 166, 0.0)');

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedData.map(d => {
                    const date = new Date(d.date);
                    return isNaN(date.getTime()) ? d.date : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }),
                datasets: [{
                    label: 'On-Time Performance',
                    data: sortedData.map(d => d.otp),
                    borderColor: '#0d9488',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#f0fdfa',
                    pointBorderColor: '#0f766e',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 0 }, 
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { display: false } },
                scales: {
                    y: { 
                        beginAtZero: true, min: 0, max: 100, 
                        ticks: { color: '#94a3b8', stepSize: 20 }, 
                        grid: { color: 'rgba(148,163,184,0.1)', tickLength: 0 } 
                    },
                    x: { 
                        grid: { display: false }, 
                        ticks: { color: '#94a3b8', maxTicksLimit: 8, autoSkip: true } 
                    }
                }
            }
        });
    }
</script>

<div class="relative w-full h-full flex flex-col">
    <div class="absolute top-0 right-0 z-50 flex bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-[var(--border-subtle)] p-0.5">
        {#each [30, 60] as days}
            <button 
                on:click|stopPropagation={() => setRange(days)}
                class="px-3 py-1 text-xs font-bold rounded-md transition-all duration-200 cursor-pointer 
                {selectedDays === days 
                    ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)] shadow-sm' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'}"
            >
                {days}d
            </button>
        {/each}
    </div>

    {#key chartKey}
    <div class="flex-1 relative min-h-0 mt-8 group"> 
        <canvas bind:this={canvas} class="transition-opacity duration-300 {loading ? 'opacity-30' : 'opacity-100'}"></canvas>
        
        {#if loading}
            <div class="absolute inset-0 flex flex-col items-center justify-center z-40 pointer-events-none">
                <div class="loading loading-spinner loading-lg text-[var(--color-brand-600)] mb-3"></div>
            </div>
        {/if}

        {#if !loading && chartData.length === 0}
            <div class="absolute inset-0 flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm z-10 pointer-events-none rounded-xl">
                <span class="text-[var(--text-muted)] font-medium text-sm">No trend data available</span>
            </div>
        {/if}
    </div>
    {/key}
</div>