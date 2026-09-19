import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Navigation,
  GraduationCap,
  Home,
  Footprints,
  Bike,
  Car,
  ExternalLink,
  Compass,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

// Known reference coordinates for Bihar / North India campus hubs
const CAMPUS_COORDS = {
  Kumarbagh: [26.8524, 84.4485],
  "GEC West Champaran": [26.853, 84.4492],
  Bettiah: [26.8028, 84.5029],
  Chanpatia: [26.9387, 84.5321],
  Narkatiaganj: [27.0988, 84.4756],
  Delhi: [28.6904, 77.2131],
  Dharamshala: [32.219, 76.3234],
};

function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(distKm) {
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m`;
  }
  return `${distKm.toFixed(1)} km`;
}

function estimateTime(distKm, speedKmh) {
  const minutes = Math.round((distKm / speedKmh) * 60);
  if (minutes < 1) return "< 1 min";
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const rem = minutes % 60;
    return `${hrs}h ${rem > 0 ? `${rem}m` : ""}`;
  }
  return `${minutes} min`;
}

export default function DualDistanceMap({ room }) {
  const { t } = useLanguage();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef(null);

  const [userCoords, setUserCoords] = useState(null);
  const [gpsStatus, setGpsStatus] = useState("idle"); // idle | locating | active | denied
  const [gpsError, setGpsError] = useState("");

  // Determine Room Coordinates
  const roomLat =
    room?.location?.coordinates && room.location.coordinates[1]
      ? room.location.coordinates[1]
      : (room?.city && CAMPUS_COORDS[room.city] ? CAMPUS_COORDS[room.city][0] : 26.8524);

  const roomLng =
    room?.location?.coordinates && room.location.coordinates[0]
      ? room.location.coordinates[0]
      : (room?.city && CAMPUS_COORDS[room.city] ? CAMPUS_COORDS[room.city][1] : 84.4485);

  // Determine College Gate Coordinates
  const collegeName = room?.campus || room?.nearbyCollege || "University Gate";
  const collegeCoordMatch = Object.entries(CAMPUS_COORDS).find(([key]) =>
    collegeName.toLowerCase().includes(key.toLowerCase())
  );

  const collegeLat = collegeCoordMatch
    ? collegeCoordMatch[1][0]
    : roomLat + (room?.distanceToCampusKm ? (room.distanceToCampusKm / 111) * 0.7 : 0.0035);

  const collegeLng = collegeCoordMatch
    ? collegeCoordMatch[1][1]
    : roomLng + (room?.distanceToCampusKm ? (room.distanceToCampusKm / 111) * 0.7 : 0.0035);

  // Distances
  const roomToCollegeKm =
    room?.distanceToCampusKm || getHaversineDistanceKm(roomLat, roomLng, collegeLat, collegeLng);

  const userToRoomKm = userCoords
    ? getHaversineDistanceKm(userCoords.lat, userCoords.lng, roomLat, roomLng)
    : null;

  // Request User GPS Location
  function requestLiveLocation() {
    if (!navigator.geolocation) {
      setGpsStatus("denied");
      setGpsError("Geolocation is not supported by your browser");
      return;
    }

    setGpsStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setGpsStatus("active");
        setGpsError("");
      },
      (err) => {
        setGpsStatus("denied");
        setGpsError(err.message || "GPS permission denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  // Automatically attempt to fetch GPS location on mount
  useEffect(() => {
    requestLiveLocation();
  }, []);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map if not exists
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [roomLat, roomLng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      layersGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const layerGroup = layersGroupRef.current;
    layerGroup.clearLayers();

    const boundsPoints = [];

    // 1. Room Marker (Coral Orange)
    const roomIcon = L.divIcon({
      className: "custom-map-icon",
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="background: #FD701E; color: white; padding: 5px 8px; border-radius: 9999px; font-weight: bold; font-size: 11px; box-shadow: 0 4px 12px rgba(253, 112, 30, 0.4); display: flex; align-items: center; gap: 4px; border: 2px solid white; white-space: nowrap;">
            <span>🏠</span>
            <span>${room?.title ? room.title.slice(0, 16) : "Room"}</span>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #FD701E;"></div>
        </div>
      `,
      iconSize: [120, 42],
      iconAnchor: [60, 42],
    });

    const roomMarker = L.marker([roomLat, roomLng], { icon: roomIcon })
      .bindPopup(
        `<div style="font-family: inherit; padding: 4px;">
          <strong style="color: #FD701E; font-size: 13px;">${room?.title || "Room"}</strong>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">₹${room?.rent?.toLocaleString("en-IN")}/mo • Zero Brokerage</div>
        </div>`
      );
    layerGroup.addLayer(roomMarker);
    boundsPoints.push([roomLat, roomLng]);

    // 2. College / University Gate Marker (Blue/Indigo)
    const collegeIcon = L.divIcon({
      className: "custom-map-icon",
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="background: #2563EB; color: white; padding: 5px 8px; border-radius: 9999px; font-weight: bold; font-size: 11px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4); display: flex; align-items: center; gap: 4px; border: 2px solid white; white-space: nowrap;">
            <span>🎓</span>
            <span>${collegeName.slice(0, 18)}</span>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #2563EB;"></div>
        </div>
      `,
      iconSize: [130, 42],
      iconAnchor: [65, 42],
    });

    const collegeMarker = L.marker([collegeLat, collegeLng], { icon: collegeIcon })
      .bindPopup(
        `<div style="font-family: inherit; padding: 4px;">
          <strong style="color: #2563EB; font-size: 13px;">🎓 ${collegeName}</strong>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">Campus Gate • ${formatDistance(roomToCollegeKm)} to Room</div>
        </div>`
      );
    layerGroup.addLayer(collegeMarker);
    boundsPoints.push([collegeLat, collegeLng]);

    // Draw dashed line between Room and College
    const collegePolyline = L.polyline(
      [
        [roomLat, roomLng],
        [collegeLat, collegeLng],
      ],
      {
        color: "#2563EB",
        weight: 3,
        dashArray: "6, 8",
        opacity: 0.85,
      }
    );
    layerGroup.addLayer(collegePolyline);

    // 3. User Live Marker if GPS available (Emerald Pulsing Radar)
    if (userCoords) {
      const userIcon = L.divIcon({
        className: "custom-map-icon",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="position: absolute; top: -4px; width: 28px; height: 28px; border-radius: 50%; background: rgba(5, 150, 105, 0.25); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="background: #059669; color: white; padding: 5px 8px; border-radius: 9999px; font-weight: bold; font-size: 11px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4); display: flex; align-items: center; gap: 4px; border: 2px solid white; z-index: 10; white-space: nowrap;">
              <span>📍</span>
              <span>${t("live_location", "You Are Here")}</span>
            </div>
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #059669;"></div>
          </div>
        `,
        iconSize: [120, 42],
        iconAnchor: [60, 42],
      });

      const userMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
        .bindPopup(
          `<div style="font-family: inherit; padding: 4px;">
            <strong style="color: #059669; font-size: 13px;">📍 ${t("live_location", "Your Live Location")}</strong>
            <div style="font-size: 11px; color: #475569; margin-top: 2px;">${formatDistance(userToRoomKm)} to this Room</div>
          </div>`
        );
      layerGroup.addLayer(userMarker);
      boundsPoints.push([userCoords.lat, userCoords.lng]);

      // Connect User to Room with Emerald Dashed Polyline
      const userPolyline = L.polyline(
        [
          [userCoords.lat, userCoords.lng],
          [roomLat, roomLng],
        ],
        {
          color: "#059669",
          weight: 3.5,
          dashArray: "8, 8",
          opacity: 0.9,
        }
      );
      layerGroup.addLayer(userPolyline);
    }

    // Auto fit bounds so all points fit in the viewport
    if (boundsPoints.length > 1) {
      map.fitBounds(boundsPoints, { padding: [45, 45], maxZoom: 16 });
    } else {
      map.setView([roomLat, roomLng], 15);
    }

    // Leaflet resize invalidate
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [roomLat, roomLng, collegeLat, collegeLng, userCoords, collegeName, room?.title, t]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Google Maps navigation links
  const googleMapsRoomUrl = userCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${roomLat},${roomLng}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=${roomLat},${roomLng}`;

  const googleMapsCampusUrl = `https://www.google.com/maps/dir/?api=1&origin=${roomLat},${roomLng}&destination=${collegeLat},${collegeLng}&travelmode=walking`;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-colors">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/90 dark:to-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-[#FD701E] border border-orange-200/50">
            <Compass size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t("live_map_title", "Live GPS Route & Distance Map")}</span>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                Interactive
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live distance from your current position & walking distance to {collegeName}
            </p>
          </div>
        </div>

        {/* GPS Status & Refresh Button */}
        <div className="flex items-center gap-2">
          {gpsStatus === "active" ? (
            <button
              onClick={requestLiveLocation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors"
              title="Refresh GPS"
            >
              <CheckCircle2 size={13} />
              <span>{t("gps_active", "Live GPS Active")}</span>
              <RefreshCw size={12} className="ml-1 opacity-70" />
            </button>
          ) : gpsStatus === "locating" ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-medium animate-pulse">
              <RefreshCw size={13} className="animate-spin" />
              <span>{t("gps_locating", "Locating...")}</span>
            </div>
          ) : (
            <button
              onClick={requestLiveLocation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-[#FD701E] border border-orange-200 dark:border-orange-800 text-xs font-bold hover:bg-orange-100 transition-colors shadow-2xs"
            >
              <Navigation size={13} />
              <span>{t("gps_enable", "Enable Live GPS")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Dual Distance Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
        {/* Metric 1: Live Location -> Room */}
        <div className="p-4 sm:p-5 flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
            <Navigation size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("distance_you_to_room", "Live GPS to Room")}
              </span>
              {userCoords && (
                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatDistance(userToRoomKm)}
                </span>
              )}
            </div>

            {userCoords ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Car size={13} className="text-slate-500" />
                  {estimateTime(userToRoomKm, 25)} by Auto/Bike
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Footprints size={13} className="text-slate-500" />
                  {estimateTime(userToRoomKm, 5)} walking
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {gpsStatus === "denied"
                  ? "Allow location permission to see live distance from your position."
                  : "Detecting distance from your live device location..."}
              </p>
            )}

            <div className="mt-2.5">
              <a
                href={googleMapsRoomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition-colors"
              >
                <span>{t("to_room_directions", "Directions to Room")}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Metric 2: Room -> College Gate */}
        <div className="p-4 sm:p-5 flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
            <GraduationCap size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("distance_room_to_campus", "Room to Campus Gate")}
              </span>
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                {formatDistance(roomToCollegeKm)}
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Footprints size={13} className="text-emerald-600" />
                {room?.walkingTimeMinutes || estimateTime(roomToCollegeKm, 5)} {t("walking_time", "walking")}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Bike size={13} className="text-blue-600" />
                {room?.cyclingTimeMinutes || estimateTime(roomToCollegeKm, 15)} {t("cycling_time", "bicycle")}
              </span>
            </div>

            <div className="mt-2.5">
              <a
                href={googleMapsCampusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400 hover:text-blue-800 transition-colors"
              >
                <span>{t("to_campus_directions", "Campus Walking Route")}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div className="relative w-full h-[320px] sm:h-[380px] bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl p-2.5 shadow-md border border-slate-200 dark:border-slate-700 text-[11px] space-y-1.5 hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#FD701E] border border-white"></span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {room?.title ? room.title.slice(0, 18) : "Selected Room"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-600 border border-white"></span>
            <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
              🎓 {collegeName}
            </span>
          </div>
          {userCoords && (
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-600 border border-white animate-pulse"></span>
              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                📍 {t("live_location", "Your Live Location")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
