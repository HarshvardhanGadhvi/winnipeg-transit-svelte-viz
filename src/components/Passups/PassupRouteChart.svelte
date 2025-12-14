<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';

    export let routeData = [];
    let canvas;
    let chart;

    $: if (chart && routeData.length > 0) updateChart();

    onMount(() => {
        const ctx = canvas.getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Pass-ups',
                    data: [],
                    backgroundColor: '#f59e0b',
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y', // Horizontal Bar Chart
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { grid: { display: true } }, y: { grid: { display: false } } }
            }
        });
        updateChart();
    });

    function updateChart() {
        if(!chart) return;
        chart.data.labels = routeData.map(r => `Route ${r.route_number}`);
        chart.data.datasets[0].data = routeData.map(r => r.count);
        chart.update();
    }
</script>

<div class="w-full h-full">
    <canvas bind:this={canvas}></canvas>
</div>