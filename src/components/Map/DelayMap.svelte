<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import 'leaflet/dist/leaflet.css';
    import type { Map, LayerGroup } from 'leaflet';

    // 1. Accept Data from Parent
    export let points: any[] = [];
    export let mapId: string = 'map'; 

    let mapElement: HTMLElement;
    let map: Map;
    let markersLayer: LayerGroup;

    // Winnipeg Coordinates
    const CENTER = [49.8951, -97.1384];

    // 2. Reactivity: Update markers whenever 'points' prop changes
    $: if (map && markersLayer && points) {
        updateMarkers();
    }

    onMount(async () => {
        // Dynamic import for SSR compatibility
        const L = await import('leaflet');

        if (!mapElement) return;

        // Initialize Map
        map = L.map(mapElement).setView(CENTER, 12);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        markersLayer = L.layerGroup().addTo(map);
        updateMarkers();
    });

    async function updateMarkers() {
        if (!points || !map) return;
        const L = await import('leaflet');
        markersLayer.clearLayers();

        points.forEach(stop => {
            let color = '#10b981'; // Green
            if (stop.status === 'Late') color = '#ef4444'; // Red
            if (stop.status === 'Early') color = '#3b82f6'; // Blue

            const radius = Math.max(4, Math.log(stop.count || 1) * 2);

            const marker = L.circleMarker([stop.lat, stop.lng], {
                color: color,
                fillColor: color,
                fillOpacity: 0.6,
                radius: radius,
                weight: 1
            });

            // FIXED: Using string concatenation for the HTML to avoid Svelte parser confusion
            const popupContent = 
                '<div class="text-sm font-sans">' +
                    '<strong>' + (stop.name || 'Stop') + '</strong><br/>' +
                    '<span style="color:' + color + '; font-weight:bold">' + stop.status + '</span> ' +
                    '(' + Math.round(stop.avg_delay_seconds || 0) + 's deviation)' +
                '</div>';

            marker.bindPopup(popupContent);
            marker.addTo(markersLayer);
        });
    }

    onDestroy(() => {
        if (map) map.remove();
    });
</script>

<div class="w-full h-full rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
    <div id={mapId} bind:this={mapElement} class="w-full h-full bg-slate-100"></div>
</div>