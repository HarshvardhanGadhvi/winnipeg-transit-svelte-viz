<script lang="ts">
    import { onMount } from 'svelte';
    import 'leaflet/dist/leaflet.css';
    import type { PassupHeatPoint } from '../../types'; // Import the type

    // Apply Type
    export let mapData: PassupHeatPoint[] = [];
    
    // Explicitly type the map variables (as any for Leaflet simplicity, or specific if you want)
    let map: any;
    let mapContainer: HTMLElement;

    $: if (map && mapData.length > 0) {
        drawPoints();
    }

    onMount(async () => {
        const L = await import('leaflet');
        if (!mapContainer) return;

        map = L.map(mapContainer).setView([49.8951, -97.1384], 11);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        drawPoints();
    });

    async function drawPoints() {
        const L = await import('leaflet');
        if (!map) return;

        map.eachLayer((layer: any) => { // Type 'layer' as any
            if (layer instanceof L.CircleMarker) map.removeLayer(layer);
        });

        mapData.forEach(point => {
            if (point.lat && point.lng) {
                const color = point.pass_up_type.includes('Wheelchair') ? '#2dd4bf' : '#fbbf24';
                
               L.circleMarker([point.lat, point.lng], {
    radius: 3,
    fillColor: color,
    color: '', // Use empty string instead of null to remove border
    weight: 0,
    opacity: 1,
    fillOpacity: 0.5 
}).addTo(map);
            }
        });
    }
</script>

<div class="w-full h-full rounded-xl overflow-hidden shadow-inner border border-[var(--border-subtle)]" bind:this={mapContainer}></div>