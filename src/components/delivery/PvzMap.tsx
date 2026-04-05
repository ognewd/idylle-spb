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

/** Выбранный ПВЗ — круглая метка, без тени от стандартного pin (чтобы отличаться от остальных) */
const selectedPvzIcon = L.divIcon({
  className: 'pvz-map-marker-selected',
  html: '<div style="width:26px;height:26px;border-radius:50%;background:#16a34a;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.35);box-sizing:border-box;" aria-hidden="true"></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -12],
});

interface PvzMapProps {
  points: PvzMapPoint[];
  selectedCode?: string | null;
  onSelect?: (code: string) => void;
  className?: string;
  /** Фиксированная высота в px. Если не задано — заполняет родителя (задайте родителю `h-*` или `flex-1 min-h-0`). */
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

export function PvzMap({ points, selectedCode, onSelect, className = '', height }: PvzMapProps) {
  const [openedPopupCode, setOpenedPopupCode] = useState<string | null>(null);
  const pointsWithCoords = useMemo(
    () => points.filter((p) => typeof p.latitude === 'number' && typeof p.longitude === 'number'),
    [points]
  );
  const openedPoint = openedPopupCode ? pointsWithCoords.find((p) => p.code === openedPopupCode) : null;
  const fillParent = height === undefined;
  const boxStyle = typeof height === 'number' ? { height } : undefined;
  const boxClass =
    `relative flex flex-col rounded-lg border overflow-hidden ${fillParent ? 'h-full min-h-[240px]' : ''} ${className}`.trim();

  if (pointsWithCoords.length === 0) {
    return (
      <div
        className={`rounded-lg border bg-muted/30 flex items-center justify-center text-sm text-muted-foreground ${fillParent ? 'h-full min-h-[240px]' : ''} ${className}`}
        style={boxStyle}
      >
        У пунктов выдачи нет координат для отображения на карте
      </div>
    );
  }

  return (
    <div className={boxClass} style={boxStyle}>
      {openedPoint && onSelect && (
        <div className="flex flex-col gap-2 px-3 py-2 bg-muted/50 border-b text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="min-w-0 truncate text-muted-foreground">
            {openedPoint.name}
            {openedPoint.address && ` · ${openedPoint.address}`}
          </span>
          <button
            type="button"
            onClick={() => onSelect(openedPoint.code)}
            className="shrink-0 rounded-md bg-primary px-3 py-2 text-primary-foreground text-xs font-semibold hover:bg-primary/90 sm:py-1.5"
          >
            Выбрать
          </button>
        </div>
      )}
      <div className={`relative flex-1 min-h-[200px] ${fillParent ? 'min-h-0' : ''}`}>
        <MapContainer
        center={[pointsWithCoords[0].latitude, pointsWithCoords[0].longitude]}
        zoom={12}
        className="absolute inset-0 z-0 h-full w-full"
        scrollWheelZoom={true}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds points={pointsWithCoords} />
        {pointsWithCoords.map((p) => {
          const isSelected = selectedCode != null && p.code === selectedCode;
          return (
          <Marker
            key={p.code}
            position={[p.latitude, p.longitude]}
            icon={isSelected ? selectedPvzIcon : defaultIcon}
            zIndexOffset={isSelected ? 1000 : 0}
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
                  <span className="mt-2 inline-block text-primary text-xs font-semibold">
                    Выбрать этот пункт
                  </span>
                )}
              </div>
            </Popup>
          </Marker>
        );
        })}
      </MapContainer>
      </div>
      <AttributionText />
    </div>
  );
}
