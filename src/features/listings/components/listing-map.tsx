'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type MapPin = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  rent: number;
};

type ListingMapProps = {
  pins: MapPin[];
  centerLat?: number;
  centerLng?: number;
  onPinClick?: (id: string) => void;
  className?: string;
};

export function ListingMap({
  pins,
  centerLat,
  centerLng,
  onPinClick,
  className,
}: ListingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const defaultCenter = pins.length > 0
      ? [pins[0].lng, pins[0].lat]
      : [centerLng ?? -114.0719, centerLat ?? 51.0447];

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: defaultCenter as [number, number],
      zoom: 12,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    pins.forEach((pin) => {
      const el = document.createElement('div');
      el.className = 'listing-map-pin';
      el.style.cssText = `
        background: #1a1a1a;
        color: white;
        padding: 4px 8px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;
      el.textContent = `$${pin.rent.toLocaleString()}`;
      el.addEventListener('click', () => onPinClick?.(pin.id));

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([pin.lng, pin.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<p style="font-weight:600;margin:0">${pin.label}</p><p style="margin:0;color:#666">CAD ${pin.rent.toLocaleString()}/mo</p>`,
          ),
        )
        .addTo(map);

      markersRef.current.push(marker);
    });

    if (pins.length > 0) {
      const lngs = pins.map((p) => p.lng);
      const lats = pins.map((p) => p.lat);
      map.fitBounds(
        [
          [Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01],
          [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01],
        ],
        { padding: 60, maxZoom: 14, animate: false },
      );
    }
  }, [pins, onPinClick]);

  return <div ref={containerRef} className={className} style={{ minHeight: 400 }} />;
}
