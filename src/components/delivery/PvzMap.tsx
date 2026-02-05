'use client';

import { useMemo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface PvzMapPoint {
  code: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  work_time?: string;
}

// Иконка маркера по умолчанию (Leaflet теряет путь к картинкам в бандлерах)
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface PvzMapProps {
  points: PvzMapPoint[];
  selectedCode?: string | null;
  onSelect?: (code: string) => void;
  className?: string;
  height?: number;
}

function FitBounds({ points }: { points: PvzMapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].latitude, points[0].longitude], 14);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.latitude, p.longitude]));
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 });
  }, [map, points]);
  return null;
}

function AttributionText() {
  return (
    <div
      className="absolute bottom-2 right-2 z-[1000] rounded bg-white/90 px-2 py-1 text-[10px] text-gray-600 shadow leaflet-attribution"
      aria-hidden
    >
      Leaflet | © OpenStreetMap
    </div>
  );
}

export function PvzMap({ points, selectedCode, onSelect, className = '', height = 320 }: PvzMapProps) {
  const [openedPopupCode, setOpenedPopupCode] = useState<string | null>(null);
  const pointsWithCoords = useMemo(
    () => points.filter((p) => typeof p.latitude === 'number' && typeof p.longitude === 'number'),
    [points]
  );
  const openedPoint = openedPopupCode ? pointsWithCoords.find((p) => p.code === openedPopupCode) : null;

  if (pointsWithCoords.length === 0) {
    return (
      <div className={`rounded-lg border bg-muted/30 flex items-center justify-center text-sm text-muted-foreground ${className}`} style={{ height }}>
        У пунктов выдачи нет координат для отображения на карте
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg border overflow-hidden ${className}`} style={{ height }}>
      {openedPoint && onSelect && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/50 border-b text-sm">
          <span className="truncate text-muted-foreground">
            {openedPoint.name}
            {openedPoint.address && ` · ${openedPoint.address}`}
          </span>
          <button
            type="button"
            onClick={() => onSelect(openedPoint.code)}
            className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-primary-foreground text-xs font-medium hover:bg-primary/90"
          >
            Вы выбрали этот пункт
          </button>
        </div>
      )}
      <MapContainer
        center={[pointsWithCoords[0].latitude, pointsWithCoords[0].longitude]}
        zoom={12}
        className="h-full w-full"
        scrollWheelZoom={true}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds points={pointsWithCoords} />
        {pointsWithCoords.map((p) => (
          <Marker
            key={p.code}
            position={[p.latitude, p.longitude]}
            icon={defaultIcon}
            eventHandlers={
              onSelect
                ? {
                    click: () => onSelect(p.code),
                  }
                : undefined
            }
          >
            <Popup
              interactive
              eventHandlers={{
                add: () => setOpenedPopupCode(p.code),
                remove: () => setOpenedPopupCode(null),
              }}
            >
              <div
                role={onSelect ? 'button' : undefined}
                tabIndex={onSelect ? 0 : undefined}
                className={`text-sm ${onSelect ? 'cursor-pointer select-none' : ''}`}
                onClick={onSelect ? (e) => { e.stopPropagation(); e.preventDefault(); onSelect(p.code); } : undefined}
                onMouseDown={onSelect ? (e) => e.stopPropagation() : undefined}
                onKeyDown={onSelect ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(p.code); } } : undefined}
              >
                <div className="font-medium">{p.name}</div>
                {p.address && <div className="text-muted-foreground mt-0.5">{p.address}</div>}
                {p.work_time && <div className="text-xs mt-1">{p.work_time}</div>}
                {onSelect && (
                  <span className="mt-2 inline-block text-primary text-xs font-medium underline">
                    Вы выбрали этот пункт
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <AttributionText />
    </div>
  );
}
