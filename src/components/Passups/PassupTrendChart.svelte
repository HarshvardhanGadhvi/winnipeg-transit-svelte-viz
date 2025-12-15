<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    export let chartData: any[] = []; 

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

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Wheelchair Denials',
                        data: [],
                        // Soft Teal (Brand Color)
                        backgroundColor: '#2dd4bf', 
                        borderRadius: 4,
                        barPercentage: 0.6,
                    },
                    {
                        label: 'Full Bus Pass-ups',
                        data: [],
                        // Soft Amber (Warning Color)
                        backgroundColor: '#fbbf24', 
                        borderRadius: 4,
                        barPercentage: 0.6,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        position: 'top',
                        labels: { color: '#94a3b8' } // Slate-400
                    },
                    tooltip: { 
                        mode: 'index', 
                        intersect: false,
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#f8fafc',
                        bodyColor: '#f8fafc',
                        callbacks: {
    footer: (tooltipItems: any[]) => {
        let total = 0;
        tooltipItems.forEach(t => {
            // Check if parsed.y exists before adding
            if (t.parsed && t.parsed.y) {
                total += t.parsed.y;
            }
        });
        return 'Total: ' + total;
    }
}
                    }
                },
                scales: {
                    x: { 
                        stacked: true, 
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    },
                    y: { 
                        stacked: true, 
                        beginAtZero: true, 
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
        updateChart();
    }

    function updateChart() {
        if (!chartInstance || !chartData) return;
        
        // Sort by date string YYYY-MM
        const sortedData = [...chartData].sort((a, b) => a.month.localeCompare(b.month));

        chartInstance.data.labels = sortedData.map(d => {
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