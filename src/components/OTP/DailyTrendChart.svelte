<script lang="ts">
    import { onMount } from 'svelte';
    import { Chart, registerables } from 'chart.js';
    import { otpStore, fetchRouteHistory, fetchSystemHistory } from '../../stores/otpStore';

    Chart.register(...registerables);

    let { selectedRouteId = 'ALL' } = $props();
    let canvas: HTMLCanvasElement;
    let chartInstance: Chart;

    // Trigger Fetches based on selection
    $effect(() => {
        const store = $otpStore as any;
        
        if (selectedRouteId === 'ALL') {
            // If we don't have system history yet, fetch it!
            if (!store.systemHistory && !store.historyLoading) {
                fetchSystemHistory();
            }
            // Clear active route to avoid confusion
            if (store.activeRouteHistory) {
                otpStore.update(s => ({ ...s, activeRouteHistory: null }));
            }
        } else {
            // Fetch specific route
            fetchRouteHistory(selectedRouteId);
        }
    });

    // Compute Data for Chart
    function getTrendData() {
        const store = $otpStore as any;
        let trend = [];
        let label = '';

        if (selectedRouteId === 'ALL') {
            trend = store.systemHistory || [];
            label = 'System Average (Post-July 2025)';
        } else {
            trend = store.activeRouteHistory || [];
            label = `Route #${selectedRouteId} Trend`;
        }

        return {
            labels: trend.map((t: any) => t.date),
            data: trend.map((t: any) => t.otp),
            label
        };
    }

    // Update Chart Visuals
    $effect(() => {
        const store = $otpStore as any;
        const isLoading = store.historyLoading;
        const hasData = (selectedRouteId === 'ALL' && store.systemHistory) || 
                        (selectedRouteId !== 'ALL' && store.activeRouteHistory);

        if (chartInstance && hasData && !isLoading) {
            const { labels, data, label } = getTrendData();
            
            chartInstance.data.labels = labels;
            chartInstance.data.datasets[0].data = data;
            chartInstance.data.datasets[0].label = label;
            
            const isSystem = selectedRouteId === 'ALL';
            chartInstance.data.datasets[0].borderColor = isSystem ? '#0d9488' : '#2563eb';
            chartInstance.data.datasets[0].backgroundColor = isSystem ? 'rgba(13, 148, 136, 0.1)' : 'rgba(37, 99, 235, 0.1)';
            
            chartInstance.update();
        }
    });

    onMount(() => {
        chartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Loading...',
                    data: [],
                    borderColor: '#0d9488',
                    borderWidth: 2,
                    pointRadius: 0, // Cleaner look for high density data
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
        return () => chartInstance.destroy();
    });
</script>

<div class="relative h-full w-full p-4">
    {#if ($otpStore as any).historyLoading}
        <div class="absolute inset-0 flex items-center justify-center bg-white/80 z-10 transition-opacity">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
    {/if}
    <canvas bind:this={canvas}></canvas>
</div>