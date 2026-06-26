import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import L from "leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { 
  FaHospital, FaSchool, FaFlask, FaSearch, FaPlus, FaTimes,
  FaMapMarkerAlt, FaCompass, FaSave, FaArrowRight, FaSatelliteDish,
  FaCrosshairs, FaFilter, FaLayerGroup, FaInfoCircle, FaExclamationTriangle,
  FaCheckCircle, FaGlobeAmericas, FaRuler, FaLocationArrow
} from 'react-icons/fa';
import { MdLocationOn, MdRadioButtonChecked, MdMyLocation } from 'react-icons/md';
import { HiMap, HiLocationMarker } from 'react-icons/hi';
import { BiCurrentLocation } from 'react-icons/bi';
import { BsGeoAlt, BsBullseye } from 'react-icons/bs';
import api from "../api/client";

// Corregir iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Componente para el círculo que SÍ se actualiza
function RadioCircle({ center, radius }) {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !radius || isNaN(radius)) return;
    
    // Eliminar círculos viejos
    map.eachLayer((layer) => {
      if (layer._isRadioCircle) {
        map.removeLayer(layer);
      }
    });
    
    // Crear círculo nuevo con el radio actual
    const circle = L.circle(center, {
      radius: Number(radius),
      color: "#2563eb",
      fillColor: "#60a5fa",
      fillOpacity: 0.15,
      weight: 2,
    });
    circle._isRadioCircle = true;
    circle.addTo(map);
    
  }, [map, center.lat, center.lng, radius]);
  
  return null;
}

const TYPE_COLORS = {
  hospital: "#dc2626",
  aula: "#2563eb",
  laboratorio: "#7c3aed",
};

const TYPE_ICONS = {
  hospital: FaHospital,
  aula: FaSchool,
  laboratorio: FaFlask,
};

const TYPE_NAMES = {
  hospital: "Hospital",
  aula: "Aula",
  laboratorio: "Laboratorio",
};

const BOLIVIA_BOUNDS = [
  [-9.5, -69.5],
  [-23.0, -57.5],
];

// ─── Componentes auxiliares del mapa ───
function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 17);
  }, [position, map]);
  return null;
}

function MapClickHandler({ onClick }) {
  useMapEvents({ click: (e) => onClick(e.latlng) });
  return null;
}

// ─── Modal de Vista Previa ───
function PreviewMap({ ubicacion, onClose }) {
  const lat = parseFloat(ubicacion?.latitud);
  const lng = parseFloat(ubicacion?.longitud);
  const radius = parseInt(ubicacion?.radioValidacion);
  const TipoIcon = TYPE_ICONS[ubicacion?.tipo] || FaMapMarkerAlt;

  if (!ubicacion || isNaN(lat) || isNaN(lng)) {
    return (
      <div style={modalOverlay} onClick={onClose}>
        <div style={modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <FaExclamationTriangle size={48} style={{ color: "#dc2626", marginBottom: "1rem" }} />
            <h3 style={{ color: "#1a2744", marginBottom: "0.5rem" }}>Error de datos</h3>
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>Datos de ubicación inválidos</p>
            <button onClick={onClose} style={btnSecondary}>
              <FaTimes style={{ marginRight: "0.5rem" }} />
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={modalOverlay} onClick={onClose}>
      <div style={{ ...modalContent, maxWidth: "900px" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={modalHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "12px",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <TipoIcon size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
                {ubicacion.nombre}
              </h3>
              <span style={badgeStyle(TYPE_COLORS[ubicacion.tipo], true)}>
                {TYPE_NAMES[ubicacion.tipo]}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={closeBtn}>
            <FaTimes />
          </button>
        </div>

        {/* Mapa */}
        <div style={{ height: "450px", position: "relative" }}>
          <MapContainer center={[lat, lng]} zoom={17} style={{ height: "100%" }} zoomControl={false}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RadioCircle center={{ lat, lng }} radius={radius} />
            <Marker position={[lat, lng]} />
          </MapContainer>
          
          {/* Overlay informativo */}
          <div style={{
            position: "absolute", bottom: "1rem", left: "1rem",
            background: "rgba(255,255,255,0.95)", padding: "0.75rem 1rem",
            borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)"
          }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a2744" }}>
              <MdRadioButtonChecked style={{ marginRight: "0.5rem", color: TYPE_COLORS[ubicacion.tipo] }} />
              Radio: {radius}m
            </div>
          </div>
        </div>

        {/* Info detallada */}
        <div style={{ padding: "1.5rem" }}>
          <div style={{ 
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "1rem", marginBottom: "1.5rem" 
          }}>
            <InfoCard 
              icon={<FaMapMarkerAlt size={20} />}
              label="Latitud" 
              value={lat.toFixed(6)} 
              color="#2563eb"
            />
            <InfoCard 
              icon={<FaGlobeAmericas size={20} />}
              label="Longitud" 
              value={lng.toFixed(6)} 
              color="#059669"
            />
            <InfoCard 
              icon={<FaRuler size={20} />}
              label="Radio de validación" 
              value={`${radius} metros`} 
              color="#7c3aed"
            />
          </div>
          
          <div style={{
            background: "#f0f9ff", padding: "1rem", borderRadius: "12px",
            border: "1px solid #bae6fd", display: "flex", alignItems: "center", gap: "0.75rem"
          }}>
            <FaInfoCircle size={20} style={{ color: "#0ea5e9" }} />
            <div style={{ fontSize: "0.85rem", color: "#0c4a6e" }}>
              Los usuarios deben estar dentro de este radio para validar su asistencia en esta ubicación.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: "#f8fafc", padding: "1.25rem", borderRadius: "12px",
      border: "2px solid #e2e8f0", transition: "all 0.2s"
    }}>
      <div style={{ color, marginBottom: "0.5rem" }}>
        {icon}
      </div>
      <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.25rem" }}>
        {label}
      </div>
      <div style={{ fontWeight: 700, color: "#1a2744", fontSize: "1.1rem" }}>
        {value}
      </div>
    </div>
  );
}

// ─── Componente Principal ───
export default function Ubicaciones() {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUbicacion, setSelectedUbicacion] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    tipo: "",
    latitud: "",
    longitud: "",
    radio_validacion: 300,
  });
  const [position, setPosition] = useState({ lat: -16.5, lng: -68.15 });
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("idle"); // idle | loading | granted | denied
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterTipo, setFilterTipo] = useState("todos");

  const cargarUbicaciones = useCallback(() => {
    api.get("/ubicaciones").then((r) => setUbicaciones(r.data.data || r.data));
  }, []);

  useEffect(() => {
    cargarUbicaciones();
  }, [cargarUbicaciones]);

  // Filtrado
  const filteredUbicaciones = ubicaciones.filter(u => 
    filterTipo === "todos" || u.tipo === filterTipo
  );

  // ─── GPS ───
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }
    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setPosition({ lat: parseFloat(lat), lng: parseFloat(lng) });
        setForm((f) => ({ ...f, latitud: lat, longitud: lng }));
        setGpsStatus("granted");
      },
      () => {
        setGpsStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const openNewModal = () => {
    setForm({ nombre: "", tipo: "", latitud: "", longitud: "", radio_validacion: 300 });
    setPosition({ lat: -16.5, lng: -68.15 });
    setSearchQuery("");
    setGpsStatus("idle");
    setShowModal(true);
  };

  // ─── Buscador ───
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const provider = new OpenStreetMapProvider();
      const results = await provider.search({ query: `${searchQuery}, Bolivia` });
      const boliviaResults = results.filter((r) =>
        r.raw.display_name.toLowerCase().includes("bolivia")
      );
      if (boliviaResults.length > 0) {
        const { x, y } = boliviaResults[0];
        const lat = parseFloat(y).toFixed(6);
        const lng = parseFloat(x).toFixed(6);
        setPosition({ lat: parseFloat(lat), lng: parseFloat(lng) });
        setForm((f) => ({ ...f, latitud: lat, longitud: lng }));
      } else {
        alert("📍 No encontrado en Bolivia. Prueba: Hospital La Paz, UPEA...");
      }
    } catch {
      alert("Error al buscar.");
    }
    setSearching(false);
  };

  const handleMapClick = (latlng) => {
    const lat = latlng.lat.toFixed(6);
    const lng = latlng.lng.toFixed(6);
    setPosition({ lat: parseFloat(lat), lng: parseFloat(lng) });
    setForm((f) => ({ ...f, latitud: lat, longitud: lng }));
  };

  const handleMarkerDrag = (e) => {
    const lat = e.target.getLatLng().lat.toFixed(6);
    const lng = e.target.getLatLng().lng.toFixed(6);
    setPosition({ lat: parseFloat(lat), lng: parseFloat(lng) });
    setForm((f) => ({ ...f, latitud: lat, longitud: lng }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // ✅ Mismos datos, sin modificar
      await api.post("/ubicaciones", {
        nombre: form.nombre,
        tipo: form.tipo,
        latitud: parseFloat(form.latitud),
        longitud: parseFloat(form.longitud),
        radioValidacion: parseInt(form.radio_validacion),
      });
      setShowModal(false);
      cargarUbicaciones();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Error al crear"));
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a2744 0%, #2d4a7a 100%)",
        borderRadius: "16px", padding: "2rem", marginBottom: "1.5rem",
        color: "#fff", boxShadow: "0 10px 30px rgba(26,39,68,0.2)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ 
              margin: 0, fontSize: "1.8rem", fontWeight: 700,
              display: "flex", alignItems: "center", gap: "0.75rem"
            }}>
              <HiLocationMarker size={32} />
              Ubicaciones
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9, fontSize: "0.95rem" }}>
              <FaGlobeAmericas style={{ marginRight: "0.5rem" }} />
              {ubicaciones.length} ubicación{ubicaciones.length !== 1 ? 'es' : ''} en Bolivia
            </p>
          </div>
          <button
            onClick={openNewModal}
            style={{
              padding: "0.75rem 1.5rem",
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              color: "#fff", border: "2px solid rgba(255,255,255,0.3)",
              borderRadius: "12px", cursor: "pointer",
              fontWeight: 600, fontSize: "0.95rem",
              transition: "all 0.3s",
              display: "flex", alignItems: "center", gap: "0.5rem"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <FaPlus /> Nueva Ubicación
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{
        display: "flex", gap: "1rem", marginBottom: "1.5rem",
        flexWrap: "wrap", alignItems: "center"
      }}>
        <div style={{ position: "relative", minWidth: "200px" }}>
          <FaFilter style={{
            position: "absolute", left: "1rem", top: "50%",
            transform: "translateY(-50%)", color: "#64748b",
            zIndex: 1, fontSize: "0.9rem"
          }} />
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            style={{
              padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "12px",
              border: "2px solid #e2e8f0", fontSize: "0.9rem",
              background: "#fff", cursor: "pointer",
              outline: "none", minWidth: "200px"
            }}
            onFocus={(e) => e.target.style.borderColor = "#2563eb"}
            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
          >
            <option value="todos">Todos los tipos</option>
            {Object.keys(TYPE_ICONS).map(tipo => {
              const Icon = TYPE_ICONS[tipo];
              return (
                <option key={tipo} value={tipo}>
                  {TYPE_NAMES[tipo]}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Modal Nuevo */}
      {showModal && (
        <div style={modalOverlay} onClick={() => setShowModal(false)}>
          <div style={{ ...modalContent, maxWidth: "1000px" }} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <div>
                <h3 style={{ 
                  margin: 0, fontSize: "1.3rem", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: "0.75rem"
                }}>
                  <HiLocationMarker size={24} />
                  Nueva Ubicación
                </h3>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", opacity: 0.9 }}>
                  Define un punto de validación geográfica
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={closeBtn}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: "2rem" }}>
              {/* GPS Status */}
              {gpsStatus === "granted" && (
                <div style={alertBox("#f0fdf4", "#86efac", "#166534")}>
                  <FaCheckCircle style={{ marginRight: "0.5rem" }} />
                  Ubicación detectada correctamente
                </div>
              )}
              {gpsStatus === "denied" && (
                <div style={alertBox("#fef2f2", "#fca5a5", "#991b1b")}>
                  <FaExclamationTriangle style={{ marginRight: "0.5rem" }} />
                  GPS no disponible. Usa el buscador o haz clic en el mapa.
                  <button 
                    type="button" 
                    onClick={getUserLocation} 
                    style={{...btnSmall, marginLeft: "0.75rem"}}
                  >
                    <FaCrosshairs style={{ marginRight: "0.3rem" }} />
                    Reintentar
                  </button>
                </div>
              )}
              {gpsStatus === "loading" && (
                <div style={alertBox("#fefce8", "#fde047", "#854d0e")}>
                  <FaSatelliteDish style={{ marginRight: "0.5rem" }} />
                  Obteniendo ubicación...
                </div>
              )}
              {gpsStatus === "idle" && (
                <button 
                  type="button" 
                  onClick={getUserLocation} 
                  style={{
                    ...btnSecondary, marginBottom: "1.5rem",
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.75rem 1.5rem"
                  }}
                >
                  <FaCrosshairs size={18} />
                  Usar mi ubicación actual
                </button>
              )}

              {/* Campos */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <InputField 
                  label={<><FaMapMarkerAlt size={14} /> Nombre</>}
                  value={form.nombre} 
                  onChange={(v) => setForm({ ...form, nombre: v })} 
                  placeholder="Hospital General" 
                />
                <SelectField 
                  label={<><FaLayerGroup size={14} /> Tipo</>}
                  value={form.tipo} 
                  onChange={(v) => setForm({ ...form, tipo: v })} 
                />
                <InputField 
                  label={<><FaRuler size={14} /> Radio (m)</>}
                  value={form.radio_validacion} 
                  onChange={(v) => setForm({ ...form, radio_validacion: v })} 
                  type="number" 
                />
              </div>

              {/* Buscador */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <FaSearch style={{
                    position: "absolute", left: "1rem", top: "50%",
                    transform: "translateY(-50%)", color: "#64748b"
                  }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Buscar: Hospital La Paz, UPEA..."
                    style={{ ...inputStyle, paddingLeft: "2.5rem" }}
                  />
                </div>
                <button 
                  type="button" 
                  onClick={handleSearch} 
                  disabled={searching} 
                  style={{
                    ...btnPrimary,
                    display: "flex", alignItems: "center", gap: "0.5rem"
                  }}
                >
                  <FaSearch size={14} />
                  {searching ? "Buscando..." : "Buscar"}
                </button>
              </div>

              {/* Mapa */}
              <div style={{ 
                borderRadius: "12px", overflow: "hidden", 
                border: "2px solid #e5e7eb", marginBottom: "1rem" 
              }}>
                <MapContainer 
                  center={position} 
                  zoom={17} 
                  style={{ height: "400px" }} 
                  maxBounds={BOLIVIA_BOUNDS} 
                  maxBoundsViscosity={1.0}
                >
                  <TileLayer 
                    attribution='&copy; OpenStreetMap' 
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                  />
                  <RadioCircle 
                    center={position} 
                    radius={form.radio_validacion} 
                  />
                  <Marker 
                    position={position} 
                    draggable 
                    eventHandlers={{ dragend: handleMarkerDrag }} 
                  />
                  <MapClickHandler onClick={handleMapClick} />
                  <MapUpdater position={position} />
                </MapContainer>
              </div>

              {/* Coordenadas */}
              <div style={{ 
                display: "flex", gap: "1rem", padding: "1rem", 
                background: "#f0f9ff", borderRadius: "12px", 
                marginBottom: "1rem", flexWrap: "wrap",
                border: "1px solid #bae6fd"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                  <BsGeoAlt style={{ color: "#2563eb" }} />
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Latitud</div>
                    <div style={{ fontWeight: 600, color: "#1a2744" }}>{form.latitud || "—"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                  <BsGeoAlt style={{ color: "#059669" }} />
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Longitud</div>
                    <div style={{ fontWeight: 600, color: "#1a2744" }}>{form.longitud || "—"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                  <MdRadioButtonChecked style={{ color: "#7c3aed" }} />
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "#64748b" }}>Radio</div>
                    <div style={{ fontWeight: 600, color: "#1a2744" }}>{form.radio_validacion}m</div>
                  </div>
                </div>
                <div style={{ 
                  fontSize: "0.75rem", color: "#64748b", 
                  display: "flex", alignItems: "center", gap: "0.3rem" 
                }}>
                  <FaLocationArrow size={12} />
                  Arrastra el marcador
                </div>
              </div>

              {/* Botones */}
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  style={{
                    ...btnSecondary,
                    display: "flex", alignItems: "center", gap: "0.5rem"
                  }}
                >
                  <FaTimes size={14} />
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  style={{
                    ...btnPrimary,
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? (
                    <>⏳ Guardando...</>
                  ) : (
                    <><FaSave size={16} /> Guardar Ubicación</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vista Previa */}
      {selectedUbicacion && (
        <PreviewMap 
          ubicacion={selectedUbicacion} 
          onClose={() => setSelectedUbicacion(null)} 
        />
      )}

      {/* Lista */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
        {filteredUbicaciones.map((u) => {
          const TipoIcon = TYPE_ICONS[u.tipo] || FaMapMarkerAlt;
          return (
            <div
              key={u.id}
              onClick={() => setSelectedUbicacion(u)}
              style={cardStyle(u.tipo)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)";
              }}
            >
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "12px",
                  background: `${TYPE_COLORS[u.tipo]}15`,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <TipoIcon size={24} color={TYPE_COLORS[u.tipo]} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#1a2744", fontSize: "1.05rem" }}>
                    {u.nombre}
                  </div>
                  <span style={badgeStyle(TYPE_COLORS[u.tipo])}>
                    {TYPE_NAMES[u.tipo]}
                  </span>
                </div>
              </div>
              
              <div style={{
                borderTop: "1px solid #f1f5f9", paddingTop: "0.75rem",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  <BsGeoAlt style={{ marginRight: "0.3rem", color: "#2563eb" }} />
                  {parseFloat(u.latitud).toFixed(4)}, {parseFloat(u.longitud).toFixed(4)}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  <MdRadioButtonChecked style={{ marginRight: "0.3rem", color: "#7c3aed" }} />
                  {u.radioValidacion}m
                </div>
              </div>
              
              <div style={{ 
                marginTop: "1rem", textAlign: "right", 
                fontSize: "0.85rem", color: "#2563eb", fontWeight: 600,
                display: "flex", alignItems: "center", justifyContent: "flex-end",
                gap: "0.3rem"
              }}>
                Ver en mapa <FaArrowRight size={12} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Estado vacío */}
      {ubicaciones.length === 0 && (
        <div style={{
          textAlign: "center", padding: "4rem", color: "#64748b",
          background: "#fff", borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
        }}>
          <HiMap size={64} style={{ marginBottom: "1rem", color: "#2563eb", opacity: 0.5 }} />
          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a2744", marginBottom: "0.5rem" }}>
            No hay ubicaciones registradas
          </h3>
          <p style={{ fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            Comienza agregando tu primera ubicación de validación
          </p>
          <button
            onClick={openNewModal}
            style={{
              ...btnPrimary,
              display: "inline-flex", alignItems: "center", gap: "0.5rem"
            }}
          >
            <FaPlus /> Crear Primera Ubicación
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Componentes reutilizables ───
function InputField({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label style={{
        fontSize: "0.85rem", fontWeight: 600, color: "#374151",
        display: "flex", alignItems: "center", gap: "0.4rem",
        marginBottom: "0.35rem"
      }}>
        {label}
      </label>
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder} 
        required
        style={inputStyle} 
      />
    </div>
  );
}

function SelectField({ label, value, onChange }) {
  return (
    <div>
      <label style={{
        fontSize: "0.85rem", fontWeight: 600, color: "#374151",
        display: "flex", alignItems: "center", gap: "0.4rem",
        marginBottom: "0.35rem"
      }}>
        {label}
      </label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        required
        style={inputStyle}
      >
        <option value="">Seleccionar...</option>
        {Object.keys(TYPE_ICONS).map((tipo) => (
          <option key={tipo} value={tipo}>
            {TYPE_NAMES[tipo]}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Estilos ───
const inputStyle = {
  width: "100%", padding: "0.7rem 1rem", borderRadius: "10px", 
  border: "2px solid #e2e8f0", fontSize: "0.9rem", 
  boxSizing: "border-box", outline: "none",
  transition: "border-color 0.2s"
};

const modalOverlay = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000,
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "1rem", backdropFilter: "blur(5px)"
};

const modalContent = {
  background: "#fff", borderRadius: "16px", width: "100%", maxHeight: "90vh",
  overflow: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
  animation: "slideUp 0.3s ease-out"
};

const modalHeader = {
  background: "linear-gradient(135deg, #1a2744, #2d4a7a)", color: "#fff",
  padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between",
  alignItems: "center", position: "sticky", top: 0, zIndex: 10
};

const closeBtn = {
  background: "rgba(255,255,255,0.2)", border: "none", color: "#fff",
  fontSize: "1.3rem", cursor: "pointer", width: "36px", height: "36px",
  borderRadius: "50%", display: "flex", alignItems: "center", 
  justifyContent: "center", transition: "all 0.2s"
};

const btnPrimary = {
  padding: "0.75rem 1.5rem", 
  background: "linear-gradient(135deg, #1a2744, #2d4a7a)",
  color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer",
  fontWeight: 600, fontSize: "0.9rem", transition: "all 0.2s",
  boxShadow: "0 4px 6px rgba(26,39,68,0.2)"
};

const btnSecondary = {
  padding: "0.6rem 1.2rem", background: "#f1f5f9", color: "#64748b",
  border: "1px solid #e2e8f0", borderRadius: "10px", cursor: "pointer", 
  fontWeight: 600, transition: "all 0.2s"
};

const btnSmall = { 
  ...btnSecondary, padding: "0.25rem 0.75rem", fontSize: "0.8rem" 
};

const badgeStyle = (color, isWhite = false) => ({
  display: "inline-flex", alignItems: "center", gap: "0.3rem",
  padding: "0.2rem 0.6rem", borderRadius: "999px",
  background: isWhite ? "rgba(255,255,255,0.2)" : `${color}15`,
  color: isWhite ? "#fff" : color, 
  fontSize: "0.75rem", fontWeight: 600, marginTop: "0.25rem"
});

const alertBox = (bg, border, color) => ({
  background: bg, border: `1px solid ${border}`, 
  padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", 
  color, fontSize: "0.9rem", display: "flex", alignItems: "center",
  flexWrap: "wrap"
});

const cardStyle = (tipo) => ({
  background: "#fff", borderRadius: "16px", padding: "1.5rem",
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)", cursor: "pointer",
  borderLeft: `5px solid ${TYPE_COLORS[tipo] || "#64748b"}`,
  border: `2px solid #f1f5f9`,
  transition: "all 0.3s",
  position: "relative"
});

// Agregar animación
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(styleSheet);