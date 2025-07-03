// GPSMap.tsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Define border cities in counter-clockwise order for patrol
const borderPatrolPath = [
  { name: 'Srinagar', lat: 34.08, lon: 74.79 },
  { name: 'Uri', lat: 34.08, lon: 74.05 },
  { name: 'Baramulla', lat: 34.21, lon: 74.36 },
  { name: 'Kupwara', lat: 34.53, lon: 74.26 },
  { name: 'Kargil', lat: 34.56, lon: 76.13 },
  { name: 'Leh', lat: 34.16, lon: 77.58 },
  { name: 'Demchok', lat: 32.67, lon: 79.77 },
  { name: 'Tawang', lat: 27.58, lon: 91.86 },
  { name: 'Bomdila', lat: 27.26, lon: 92.40 },
  { name: 'Along', lat: 28.17, lon: 94.80 },
  { name: 'Pasighat', lat: 28.07, lon: 95.33 },
  { name: 'Tezu', lat: 27.92, lon: 96.17 },
  { name: 'Changlang', lat: 27.12, lon: 95.72 },
  { name: 'Dibrugarh', lat: 27.47, lon: 94.91 },
  { name: 'Tinsukia', lat: 27.49, lon: 95.36 },
  { name: 'Dhemaji', lat: 27.48, lon: 94.57 },
  { name: 'Gangtok', lat: 27.33, lon: 88.62 },
  { name: 'Darjeeling', lat: 27.04, lon: 88.26 },
  { name: 'Cooch Behar', lat: 26.32, lon: 89.45 },
  { name: 'Alipurduar', lat: 26.48, lon: 89.53 },
  { name: 'Imphal', lat: 24.82, lon: 93.95 },
  { name: 'Aizawl', lat: 23.73, lon: 92.72 },
  { name: 'Agartala', lat: 23.83, lon: 91.28 },
  { name: 'Kolkata', lat: 22.57, lon: 88.36 },
  { name: 'Sundarbans', lat: 21.94, lon: 89.18 },
  { name: 'Digha', lat: 21.68, lon: 87.55 },
  { name: 'Puri', lat: 19.81, lon: 85.83 },
  { name: 'Visakhapatnam', lat: 17.68, lon: 83.22 },
  { name: 'Chennai', lat: 13.08, lon: 80.27 },
  { name: 'Rameswaram', lat: 9.28, lon: 79.31 },
  { name: 'Kanyakumari', lat: 8.08, lon: 77.56 },
  { name: 'Kochi', lat: 9.93, lon: 76.26 },
  { name: 'Alappuzha', lat: 9.49, lon: 76.33 },
  { name: 'Kollam', lat: 8.88, lon: 76.61 },
  { name: 'Thiruvananthapuram', lat: 8.52, lon: 76.93 },
  { name: 'Mangalore', lat: 12.91, lon: 74.85 },
  { name: 'Goa', lat: 15.49, lon: 73.82 },
  { name: 'Ratnagiri', lat: 16.99, lon: 73.31 },
  { name: 'Mumbai', lat: 19.08, lon: 72.88 },
  { name: 'Daman', lat: 20.42, lon: 72.85 },
  { name: 'Porbandar', lat: 21.64, lon: 69.61 },
  { name: 'Okha', lat: 22.47, lon: 69.07 },
  { name: 'Bhuj', lat: 23.25, lon: 69.67 },
  { name: 'Jaisalmer', lat: 26.91, lon: 70.91 },
  { name: 'Bikaner', lat: 28.02, lon: 73.31 },
  { name: 'Amritsar', lat: 31.63, lon: 74.87 },
  { name: 'Pathankot', lat: 32.27, lon: 75.65 },
  { name: 'Jammu', lat: 32.73, lon: 74.87 },
  { name: 'Srinagar', lat: 34.08, lon: 74.79 }
];

interface GPSMapProps {
  lat?: number;
  lon?: number;
}

const GPSMap: React.FC<GPSMapProps> = ({ lat = borderPatrolPath[0].lat, lon = borderPatrolPath[0].lon }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const pathRef = useRef<L.Polyline | null>(null);
  const gridLayerRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  // Only initialize map once
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('gps-map', {
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false
      });
      // Fit bounds to all border cities (India)
      const bounds = L.latLngBounds(borderPatrolPath.map(p => [p.lat, p.lon]));
      mapRef.current.fitBounds(bounds.pad(0.05), { animate: false });
      L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        attribution: '',
        minZoom: 4,
        maxZoom: 7
      }).addTo(mapRef.current);
      // Add grid overlay
      const gridLines = [];
      for (let lat = 8; lat <= 36; lat += 2) {
        gridLines.push(L.polyline([[lat, 68], [lat, 97]], { color: '#0f0', weight: 1, opacity: 0.3, dashArray: '2, 8' }));
      }
      for (let lon = 68; lon <= 97; lon += 2) {
        gridLines.push(L.polyline([[8, lon], [36, lon]], { color: '#0f0', weight: 1, opacity: 0.3, dashArray: '2, 8' }));
      }
      gridLines.forEach(line => line.addTo(mapRef.current!));
      // Add border patrol path (densified)
      const pathCoordinates = borderPatrolPath.map(point => [point.lat, point.lon]);
      L.polyline(pathCoordinates as L.LatLngExpression[], {
        color: '#00ff00',
        weight: 2,
        opacity: 0.7,
        dashArray: '5, 10'
      }).addTo(mapRef.current);
      // Add markers for each city
      borderPatrolPath.forEach(point => {
        L.circleMarker([point.lat, point.lon], {
          radius: 5,
          color: '#0f0',
          fillColor: '#111',
          fillOpacity: 1,
          weight: 2
        })
          .bindPopup(point.name)
          .addTo(mapRef.current!);
      });
    }
  }, []);

  // Animate jet counterclockwise along the full border path, updating marker and trajectory
  useEffect(() => {
    if (!mapRef.current) return;
    let idx = 0;
    let prog = 0;
    const speedKmh = 1800; // F-16 cruise speed in km/h (increased)
    const updateInterval = 8; // ms (reduced)
    let lastTimestamp = Date.now();
    let jetPath: [number, number][] = [];
    let jetPolyline: L.Polyline | null = null;
    function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
      const R = 6371; // km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(a));
    }
    function animate() {
      const now = Date.now();
      const dt = (now - lastTimestamp) / 3600000; // hours
      lastTimestamp = now;
      // Counterclockwise: follow borderPatrolPath in order
      const from = borderPatrolPath[idx];
      const to = borderPatrolPath[(idx + 1) % borderPatrolPath.length];
      const dist = haversine(from.lat, from.lon, to.lat, to.lon); // km
      const segTime = dist / speedKmh; // hours
      prog += dt / segTime;
      if (prog >= 1) {
        prog = 0;
        idx = (idx + 1) % (borderPatrolPath.length - 1);
      }
      // Interpolate only between consecutive border cities
      const lat = from.lat + (to.lat - from.lat) * prog;
      const lon = from.lon + (to.lon - from.lon) * prog;
      jetPath.push([lat, lon]);
      if (jetPath.length > 100) jetPath.shift();
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
        // Rotate the plane icon to align with the direction of travel
        const angle = Math.atan2(to.lon - from.lon, to.lat - from.lat) * (180 / Math.PI);
        markerRef.current.setIcon(L.divIcon({
          className: 'fighter-jet-marker',
          html: `<span style="font-size:28px;color:#0f0;transform:rotate(${angle}deg);display:inline-block;">✈</span>`,
          iconSize: [30, 30]
        }));
      } else {
        markerRef.current = L.marker([lat, lon], {
          icon: L.divIcon({
            className: 'fighter-jet-marker',
            html: '<span style="font-size:28px;color:#0f0;">✈</span>',
            iconSize: [30, 30]
          })
        }).addTo(mapRef.current!);
      }
      // Draw jet trajectory polyline
      if (jetPolyline && mapRef.current) mapRef.current.removeLayer(jetPolyline);
      jetPolyline = L.polyline(jetPath as L.LatLngExpression[], {
        color: '#0ff',
        weight: 2,
        opacity: 0.7
      }).addTo(mapRef.current!);
      animationRef.current = window.setTimeout(animate, updateInterval);
    }
    animationRef.current = window.setTimeout(animate, updateInterval);
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
      if (jetPolyline && mapRef.current) {
        mapRef.current.removeLayer(jetPolyline);
      }
    };
  }, []);

  return <div id="gps-map" style={{ height: '100%', width: '100%', background: '#111' }} />;
};

export default GPSMap;