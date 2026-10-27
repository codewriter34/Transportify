import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Point = { lat?: number; lng?: number } | null | undefined;

type RouteMapProps = {
  origin?: Point;
  current?: Point;
  destination?: Point;
};

function asLatLng(point: Point): [number, number] | null {
  if (point == null || typeof point.lat !== 'number' || typeof point.lng !== 'number') return null;
  if (Number.isNaN(point.lat) || Number.isNaN(point.lng)) return null;
  return [point.lat, point.lng];
}

const RouteMap = ({ origin, current, destination }: RouteMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const originPoint = asLatLng(origin);
  const currentPoint = asLatLng(current);
  const destinationPoint = asLatLng(destination);
  const hasPoints = Boolean(originPoint || currentPoint || destinationPoint);

  useEffect(() => {
    if (!containerRef.current || !hasPoints) return;

    const map = L.map(containerRef.current, { scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const markers: [number, number][] = [];
    const add = (point: [number, number] | null, color: string, label: string) => {
      if (!point) return;
      markers.push(point);
      L.circleMarker(point, {
        radius: 8,
        color,
        fillColor: color,
        fillOpacity: 0.9,
        weight: 2,
      }).addTo(map).bindTooltip(label);
    };

    add(originPoint, '#16a34a', 'Origin');
    add(currentPoint, '#ca8a04', 'Current location');
    add(destinationPoint, '#2563eb', 'Destination');

    if (markers.length > 1) {
      L.polyline(markers, { color: '#1d4ed8', weight: 3, opacity: 0.8 }).addTo(map);
      map.fitBounds(markers, { padding: [28, 28] });
    } else if (markers.length === 1) {
      map.setView(markers[0], 6);
    }

    const frame = window.requestAnimationFrame(() => map.invalidateSize());
    return () => {
      window.cancelAnimationFrame(frame);
      map.remove();
    };
  }, [hasPoints, originPoint?.[0], originPoint?.[1], currentPoint?.[0], currentPoint?.[1], destinationPoint?.[0], destinationPoint?.[1]]);

  if (!hasPoints) {
    return (
      <div className="h-72 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center px-6 text-center">
        A map appears when this shipment has location coordinates.
      </div>
    );
  }

  return (
    <div className="h-72 rounded-xl overflow-hidden border border-gray-200">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
};

export default RouteMap;
