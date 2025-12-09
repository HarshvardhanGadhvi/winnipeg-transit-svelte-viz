<script lang="ts">
    import { onMount, afterUpdate } from 'svelte';
    import Chart from 'chart.js/auto';

    // 1. Accept data from parent instead of fetching it
    export let chartData: any[] = []; 
    export let label: string = "System OTP";

    let canvas: HTMLCanvasElement;
    let chartInstance: Chart;

    // 2. Reactivity: Update chart when data changes
    $: if (chartInstance && chartData) {
        updateChart();
    }

    onMount(() => {
        initChart();
    });

    function initChart() {
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'On-Time Performance',
                    data: [],
                    borderColor: '#0d9488', // Teal-600
                    backgroundColor: 'rgba(13, 148, 136, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointRadius: 2,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (ctx) => `OTP: ${ctx.parsed.y}%`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 0,
                        max: 100,
                        grid: { color: '#f3f4f6' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
        
        // Load initial data
        updateChart();
    }

    function updateChart() {
        if (!chartInstance || !chartData) return;

        // Map the data props to ChartJS format
        chartInstance.data.labels = chartData.map(d => {
            // Format 2025-12-09 -> Dec 09
            const date = new Date(d.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        chartInstance.data.datasets[0].data = chartData.map(d => d.otp);
        chartInstance.data.datasets[0].label = label;
        
        chartInstance.update();
    }
</script>

<div class="relative w-full h-full">
    <canvas bind:this={canvas}></canvas>
</div>