<script lang="ts">
    import { onMount } from 'svelte';
    import { Chart, registerables } from 'chart.js';
    import { otpStore, fetchRouteHistory, fetchSystemHistory } from '../../stores/otpStore';

    Chart.register(...registerables);

    let { selectedRouteId = 'ALL' } = $props();
    let canvas: HTMLCanvasElement;
    let chartInstance: Chart;

    // --- 1. DATA FETCHER ---
    $effect(() => {
        if (selectedRouteId === 'ALL') {
            fetchSystemHistory();
        } else {
            fetchRouteHistory(selectedRouteId);
        }
    });

    // --- 2. CHART RENDERER ---
    $effect(() => {
        // Read the store dependencies
        const store = $otpStore as any;
        const isLoading = store.historyLoading;
        
        // Determine which data to show
        let currentData = [];
        let currentLabel = 'Loading...';

        if (selectedRouteId === 'ALL') {
            currentData = store.systemHistory || [];
            currentLabel = 'System Average (Post-July 2025)';
        } else {
            // If loading, currentData remains [], clearing the chart immediately
            if (!isLoading && store.activeRouteHistory) {
                currentData = store.activeRouteHistory;
                currentLabel = `Route #${selectedRouteId} Trend`;
            }
        }

        // UPDATE THE CHART
        if (chartInstance) {
            // 1. Update Labels & Data
            chartInstance.data.labels = currentData.map((t: any) => t.date);
            chartInstance.data.datasets[0].data = currentData.map((t: any) => t.otp);
            chartInstance.data.datasets[0].label = currentLabel;

            // 2. Visuals (Grey out if loading)
            if (isLoading) {
                chartInstance.data.datasets[0].borderColor = '#e2e8f0'; // Light Grey
                chartInstance.data.datasets[0].backgroundColor = 'transparent';
            } else {
                const isSystem = selectedRouteId === 'ALL';
                chartInstance.data.datasets[0].borderColor = isSystem ? '#0d9488' : '#2563eb'; // Teal vs Blue
                chartInstance.data.datasets[0].backgroundColor = isSystem ? 'rgba(13, 148, 136, 0.1)' : 'rgba(37, 99, 235, 0.1)';
            }

            chartInstance.update();
        }
    });

    onMount(() => {
        chartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Initializing...',
                    data: [],
                    borderWidth: 2,
                    pointRadius: 0, 
                    pointHoverRadius: 6,
                    tension: 0.2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { display: true } },
                scales: {
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
                    y: { min: 0, max: 100, grid: { color: '#f1f5f9' } }
                }
            }
        });

        return () => {
            if (chartInstance) chartInstance.destroy();
        };
    });
</script>

<div class="relative w-full h-96 p-4">
    
    {#if ($otpStore as any).historyLoading}
        <div class="absolute inset-0 flex items-center justify-center bg-white/60 z-10 backdrop-blur-sm transition-all rounded-lg">
            <div class="flex flex-col items-center gap-2">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span class="text-xs font-semibold text-blue-600">Fetching History...</span>
            </div>
        </div>
    {/if}

    <canvas bind:this={canvas}></canvas>
</div>