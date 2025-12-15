<script lang="ts">
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import type { PassupRoute } from '../../types';

    // Apply Type
    export let routeData: PassupRoute[] = [];
    
    let canvas: HTMLCanvasElement;
    let chart: Chart; // Explicit Chart type

    $: if (chart && routeData.length > 0) updateChart();

    onMount(() => {
        const ctx = canvas.getContext('2d');
        if(!ctx) return; // Null check

        const gradient = ctx.createLinearGradient(0, 0, 300, 0);
        gradient.addColorStop(0, '#fcd34d'); 
        gradient.addColorStop(1, '#fbbf24'); 

        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Pass-ups',
                    data: [],
                    backgroundColor: gradient,
                    borderRadius: 4,
                    barThickness: 20
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    x: { 
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        ticks: { color: '#94a3b8' }
                    }, 
                    y: { 
                        grid: { display: false },
                        ticks: { color: '#64748b', font: { weight: 'bold' } }
                    } 
                }
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