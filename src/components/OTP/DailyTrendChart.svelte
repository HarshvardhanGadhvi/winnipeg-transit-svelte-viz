<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import { otpStore } from '../../stores/otpStore';

	Chart.register(...registerables);

	let canvas: HTMLCanvasElement;
	let chartInstance: Chart;

	// Svelte 5 Runes: Watch for store changes and update chart
	$effect(() => {
		if ($otpStore.routes.length > 0 && chartInstance) {
			chartInstance.data.labels = $otpStore.routes.map(r => `Route ${r.route_number}`);
			chartInstance.data.datasets[0].data = $otpStore.routes.map(r => r.otp_percentage);
			chartInstance.update();
		}
	});

	onMount(() => {
		chartInstance = new Chart(canvas, {
			type: 'line',
			data: {
				labels: [],
				datasets: [{
					label: 'OTP %',
					data: [],
					borderColor: '#0d9488', // Teal
					backgroundColor: 'rgba(13, 148, 136, 0.1)',
					fill: true,
					tension: 0.4 // Smooth fluent curves
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					y: { min: 0, max: 100 }
				}
			}
		});

		return () => chartInstance.destroy();
	});
</script>

<div class="h-full w-full">
	<canvas bind:this={canvas}></canvas>
</div>