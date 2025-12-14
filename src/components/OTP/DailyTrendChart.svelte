<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    export let chartData: any[] = []; 
    export let label: string = "System OTP";

    let canvas: HTMLCanvasElement;
    let chartInstance: Chart;

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

        // --- THE GRADIENT MAGIC ---
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(20, 184, 166, 0.4)'); // Teal-500 at top
        gradient.addColorStop(1, 'rgba(20, 184, 166, 0.0)'); // Transparent at bottom

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'On-Time Performance',
                    data: [],
                    borderColor: '#14b8a6', // Solid Teal Line
                    backgroundColor: gradient, // The Gradient Fill
                    borderWidth: 3,
                    tension: 0.4, // Smooth curves
                    fill: true,
                    pointBackgroundColor: '#f0fdfa', // Teal-50
                    pointBorderColor: '#0d9488', // Teal-600
                    pointRadius: 4,
                    pointHoverRadius: 6
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
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', // Slate-900 tooltip
                        titleColor: '#f8fafc',
                        bodyColor: '#f8fafc',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: (ctx) => `OTP: ${ctx.parsed.y}%`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true, // Start at 0
                        min: 0,            // Force minimum 0
                        max: 100,          // Force maximum 100
                        grid: { 
                            color: 'rgba(148, 163, 184, 0.1)', // Very subtle grid
                            tickLength: 0
                        },
                        ticks: { 
                            color: '#94a3b8', // Slate-400 text
                            stepSize: 10     
                        } 
                    },
                   x: {
        grid: { display: false },
        ticks: { 
            color: '#94a3b8',
            maxTicksLimit: 12, // <--- THIS FIXES IT
            // This forces Chart.js to only show roughly 12 labels max (e.g., 1 per week for 90 days)
            // regardless of how many data points exist.
            maxRotation: 0,
            autoSkip: true
        }
    },
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
        updateChart();
    }

    function updateChart() {
        if (!chartInstance || !chartData) return;

        chartInstance.data.labels = chartData.map(d => {
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