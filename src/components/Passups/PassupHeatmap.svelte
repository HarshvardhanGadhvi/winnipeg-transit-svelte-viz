<script>
    import { onMount } from 'svelte';
    import 'leaflet/dist/leaflet.css';

    export let mapData = [];
    let map;
    let mapContainer;

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

        map.eachLayer((layer) => {
            if (layer instanceof L.CircleMarker) map.removeLayer(layer);
        });

        mapData.forEach(point => {
            if (point.lat && point.lng) {
                // Pastel Colors
                // Wheelchair = Soft Teal (#2dd4bf), Full Bus = Soft Amber (#fbbf24)
                const color = point.pass_up_type.includes('Wheelchair') ? '#2dd4bf' : '#fbbf24';
                
                L.circleMarker([point.lat, point.lng], {
                    radius: 5,
                    fillColor: color,
                    color: null,
                    weight: 0,
                    opacity: 1,
                    fillOpacity: 0.5 
                }).addTo(map);
            }
        });
    }
</script>

<div class="w-full h-full rounded-xl overflow-hidden shadow-inner border border-[var(--border-subtle)]" bind:this={mapContainer}></div>