<script>
    import { onMount } from 'svelte';
    import L from 'leaflet';
    import 'leaflet/dist/leaflet.css';

    export let mapData = [];

    let map;
    let mapContainer;

    $: if (map && mapData.length > 0) {
        drawPoints();
    }

    onMount(() => {
        if (!mapContainer) return;

        map = L.map(mapContainer).setView([49.8951, -97.1384], 11); // Winnipeg Center

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        drawPoints();
    });

    function drawPoints() {
        if (!map) return;

        // Clear existing layers if any (optional)
        map.eachLayer((layer) => {
            if (layer instanceof L.CircleMarker) {
                map.removeLayer(layer);
            }
        });

        mapData.forEach(point => {
            if (point.lat && point.lng) {
                // Determine color based on type
                const color = point.pass_up_type.includes('Wheelchair') ? '#3b82f6' : '#f59e0b';
                L.circleMarker([point.lat, point.lng], {
                    radius: 3,        // Slightly smaller
                    fillColor: color,
                    color: null,
                    weight: 0,
                    opacity: 1,
                    fillOpacity: 0.4  // More transparent to show density overlaps
                }).addTo(map);
            }
        });
    }
</script>

<div class="w-full h-full rounded-xl overflow-hidden shadow-inner border border-slate-200" bind:this={mapContainer}></div>

<style>
    /* Ensure Leaflet container has size */
    div { min-height: 400px; }
</style>