<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    export let chartData: any[] = []; 

    let canvas: HTMLCanvasElement;
    let chartInstance: Chart;

    // Watch for data changes and update
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
            type: 'bar',
            data: {
                labels: [],
                datasets: [
    {
        label: 'Wheelchair Denials',
        data: [],
        backgroundColor: '#818cf8', // Soft Indigo (instead of harsh blue)
        borderRadius: 4,
    },
    {
        label: 'Full Bus Pass-ups',
        data: [],
        backgroundColor: '#fbbf24', // Soft Amber (instead of harsh orange)
        borderRadius: 4,
    }

                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: { 
                        mode: 'index', 
                        intersect: false,
                        callbacks: {
                            // Add a total to the tooltip for clarity
                            footer: (tooltipItems) => {
                                let total = 0;
                                tooltipItems.forEach(t => total += t.parsed.y);
                                return 'Total: ' + total;
                            }
                        }
                    }
                },
                scales: {
                    x: { 
                        stacked: true, // <--- CRITICAL: Stacks columns horizontally
                        grid: { display: false } 
                    },
                    y: { 
                        stacked: true, // <--- CRITICAL: Stacks values vertically
                        beginAtZero: true, 
                        grid: { color: '#f3f4f6' } 
                    }
                }
            }
        });
        updateChart();
    }

    function updateChart() {
        if (!chartInstance || !chartData) return;

        // Ensure we sort by date so the chart reads left-to-right correctly
        // Assuming 'month' is "YYYY-MM" string, string sort works fine.
        const sortedData = [...chartData].sort((a, b) => a.month.localeCompare(b.month));

        chartInstance.data.labels = sortedData.map(d => {
            // Convert "2025-07" -> "July"
            const date = new Date(d.month + '-01'); 
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });

        chartInstance.data.datasets[0].data = sortedData.map(d => d.wheelchair_total);
        chartInstance.data.datasets[1].data = sortedData.map(d => d.full_bus_total);
        
        chartInstance.update();
    }
</script>

<div class="relative w-full h-full">
    <canvas bind:this={canvas}></canvas>
</div>