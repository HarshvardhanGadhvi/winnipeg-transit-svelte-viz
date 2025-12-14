<script lang="ts">
    import { onMount } from 'svelte';
    import 'leaflet/dist/leaflet.css';
    import type { Map, LayerGroup, LatLngTuple } from 'leaflet';

    export let points: any[] = [];
    export let mapId: string = 'map'; 

    let mapElement: HTMLElement;
    let map: Map;
    let markersLayer: LayerGroup;
    const CENTER: LatLngTuple = [49.8951, -97.1384];

    $: if (map && markersLayer && points) {
        updateMarkers();
    }

    onMount(async () => {
        const L = await import('leaflet');
        if (!mapElement) return;

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
            let color = '#10b981'; // Green (On Time)
            let radius = 4;        

            if (stop.status === 'Late') {
                color = '#ef4444'; // Red
                // Late stops stay prominent (Base 4 + up to 12px extra)
                radius = 4 + (stop.severity * 12); 
            } 
            else if (stop.status === 'Early') {
                color = '#3b82f6'; // Blue
                // [FIX] Make Early circles MUCH smaller/subtler
                // Base 3 + only up to 4px extra. 
                // They will now be 3px-7px instead of 4px-16px.
                radius = 3 + (stop.severity * 4);
            }

            const marker = L.circleMarker([stop.lat, stop.lng], {
                color: color,
                fillColor: color,
                fillOpacity: 0.6, // Slightly more transparent
                radius: radius,
                weight: 0 // Remove border stroke for cleaner look
            });

            const popupContent = 
                '<div class="text-sm font-sans p-1">' +
                    '<strong class="text-slate-700">' + (stop.name || 'Stop') + '</strong><br/>' +
                    '<span style="color:' + color + '; font-weight:bold">' + stop.status + '</span><br/>' +
                    '<div class="text-xs text-slate-500 mt-1">' +
                        'Late Freq: ' + stop.late_pct + '%<br/>' +
                        'Early Freq: ' + stop.early_pct + '%' +
                    '</div>' +
                '</div>';

            marker.bindPopup(popupContent);
            marker.addTo(markersLayer);
        });
    }
</script>

<div class="w-full h-full rounded-xl overflow-hidden border border-[var(--border-subtle)] shadow-sm relative z-0">
    <div id={mapId} bind:this={mapElement} class="w-full h-full bg-slate-100"></div>
</div>