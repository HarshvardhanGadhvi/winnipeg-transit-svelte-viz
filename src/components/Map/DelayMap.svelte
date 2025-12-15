<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    export let points: any[] = [];
    export let mapId: string = "map-container";

    let map: any;
    let L: any;
    let currentZoom = 11; // Track zoom

    $: if (map && points) {
        drawPoints();
    }

    onMount(async () => {
        const leaflet = await import('leaflet');
        L = leaflet.default;
        await import('leaflet/dist/leaflet.css');
        initMap();
    });

    onDestroy(() => {
        if (map) {
            map.off('zoomend'); 
            map.remove();
        }
    });

    function initMap() {
        const container = document.getElementById(mapId);
        if (!container || (container as any)._leaflet_id) return;

        map = L.map(mapId).setView([49.8951, -97.1384], 11);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // Listen for zoom changes
        map.on('zoomend', () => {
            currentZoom = map.getZoom();
            drawPoints();
        });

        drawPoints();
        
    }

    function drawPoints() {
        if (!map || !L) return;

        // Clear existing markers
        map.eachLayer((layer: any) => {
            if (layer instanceof L.CircleMarker) {
                map.removeLayer(layer);
            }
        });

        if (points.length === 0) return;

        // [FIXED] Exponential Scaling Formula
        // Zoom 10 -> (10-9)^1.8 = 1px (Tiny) -> clamped to 3px
        // Zoom 13 -> (13-9)^1.8 = ~12px -> clamped to 8px
        // This ensures they stay small at city level but pop at street level.
        
        let baseRadius = 3; 
        if (currentZoom >= 13) baseRadius = 6;
        if (currentZoom >= 15) baseRadius = 10;
        if (currentZoom >= 17) baseRadius = 14;

        points.forEach((p) => {
            const lat = p.lat || p.latitude;
            const lng = p.lng || p.longitude;
            const status = p.status || "On Time";

            if (!lat || !lng) return;

            let color = '#3b82f6'; // Blue
            if (status === 'Late') color = '#ef4444'; // Red
            if (status === 'On Time') color = '#10b981'; // Green

            // Subtle boost for Late stops so they stand out in the clutter
            const sizeBoost = (status === 'Late') ? 1.5 : 0;
            const radius = baseRadius + sizeBoost;

            L.circleMarker([lat, lng], {
                radius: radius,
                fillColor: color,
                color: '#fff', 
                weight: 1, // Thin border
                fillOpacity: 0.8
            })
            .bindPopup(`
                <div class="font-sans text-sm p-2">
                    <strong class="block text-slate-800 text-base mb-1">${p.name}</strong>
                    <div class="flex items-center justify-between gap-4 text-xs mb-1">
                        <span class="text-slate-500">Status:</span>
                        <span class="font-bold px-2 py-0.5 rounded-full text-white" style="background-color: ${color}">${status}</span>
                    </div>
                    <div class="flex justify-between gap-4 text-xs">
                        <span class="text-slate-500">Avg Deviation:</span>
                        <span class="font-mono text-slate-700 font-bold">${p.avg_deviation} min</span>
                    </div>
                </div>
            `)
            .addTo(map);
        });
    }
</script>

<div id={mapId} class="w-full h-full z-0"></div>

<style>
    div {
        min-height: 100%;
        width: 100%;
        border-radius: inherit; 
    }
</style>