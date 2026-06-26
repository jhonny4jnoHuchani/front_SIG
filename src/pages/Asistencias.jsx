import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { 
  FaClipboardCheck, FaMapMarkerAlt, FaUserCheck, FaUserClock,
  FaCalendarCheck, FaClock, FaHourglassHalf, FaCheckCircle,
  FaTimesCircle, FaExclamationTriangle, FaSearch, FaFilter,
  FaList, FaMap, FaChartBar, FaUserGraduate, FaCalendarAlt,
  FaClock as FaClockIcon, FaCheck, FaTimes, FaCrosshairs,
  FaUser, FaUsers, FaSignInAlt, FaSignOutAlt, FaExclamationCircle,
  FaSatelliteDish, FaLayerGroup
} from 'react-icons/fa';
import { 
  MdAccessTime, MdLocationOn, MdPerson, MdPeople,
  MdCheckCircle, MdCancel, MdWarning, MdTimeline,
  MdGpsFixed, MdGpsOff
} from 'react-icons/md';
import { HiUserGroup, HiClock, HiLocationMarker } from 'react-icons/hi';
import { BsPersonCheck, BsPersonX, BsClockHistory } from 'react-icons/bs';
import { BiTimeFive, BiMap } from 'react-icons/bi';
import api from "../api/client";

// Iconos para el mapa
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const iconEntrada = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const iconSalida = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const ESTADO_COLORS = { 
  confirmado: "#16a34a", 
  validando: "#f59e0b", 
  rechazado: "#dc2626" 
};

const ESTADO_ICONS = {
  confirmado: FaCheckCircle,
  validando: FaExclamationCircle,
  rechazado: FaTimesCircle
};

const TIPO_COLORS = {
  entrada: "#16a34a",
  salida: "#dc2626",
  tardanza: "#f59e0b",
  ausencia: "#64748b"
};

const TIPO_ICONS = {
  entrada: FaSignInAlt,
  salida: FaSignOutAlt,
  tardanza: FaExclamationTriangle,
  ausencia: FaTimesCircle
};

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Componente para los marcadores del mapa
function MapMarkers({ marcados, getDocenteNombre, formatHora }) {
  const marcadosConGPS = marcados.filter((m) => m.latitud && m.longitud);
  
  console.log("📍 Marcados con GPS:", marcadosConGPS.length, marcadosConGPS);
  
  return (
    <>
      {marcadosConGPS.map((m) => {
        const lat = parseFloat(m.latitud);
        const lng = parseFloat(m.longitud);
        
        console.log("📍 Marcador:", m.id, lat, lng, m.tipoMarcado);
        
        return (
          <Marker
            key={m.id}
            position={[lat, lng]}
            icon={m.tipoMarcado === "salida" ? iconSalida : iconEntrada}
          >
            <Popup>
              <div style={{ fontSize: "0.85rem", minWidth: "180px" }}>
                <div style={{ 
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  marginBottom: "0.5rem", fontWeight: 700, color: "#1a2744"
                }}>
                  <FaUser size={14} />
                  {getDocenteNombre(m.docenteId)}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <FaCalendarAlt size={12} color="#64748b" />
                  {new Date(m.fecha).toLocaleDateString("es-BO")} — {DIAS[new Date(m.fecha).getDay()]}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <FaClock size={12} color="#64748b" />
                  {formatHora(m.horaInicio)} {m.horaFin ? `→ ${formatHora(m.horaFin)}` : "(activo)"}
                </div>
                <div style={{ 
                  display: "flex", gap: "0.5rem", marginTop: "0.5rem",
                  flexWrap: "wrap"
                }}>
                  <span style={{
                    padding: "0.2rem 0.5rem", borderRadius: "999px",
                    background: `${TIPO_COLORS[m.tipoMarcado]}15`,
                    color: TIPO_COLORS[m.tipoMarcado],
                    fontSize: "0.75rem", fontWeight: 600
                  }}>
                    {m.tipoMarcado}
                  </span>
                  <span style={{
                    padding: "0.2rem 0.5rem", borderRadius: "999px",
                    background: `${ESTADO_COLORS[m.estado]}15`,
                    color: ESTADO_COLORS[m.estado],
                    fontSize: "0.75rem", fontWeight: 600
                  }}>
                    {m.estado}
                  </span>
                </div>
                {m.minutosRetraso > 0 && (
                  <div style={{ 
                    color: "#dc2626", marginTop: "0.5rem", 
                    fontWeight: 600, fontSize: "0.8rem"
                  }}>
                    <FaExclamationTriangle size={12} /> {m.minutosRetraso} min tarde
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default function Asistencias() {
  const [searchParams] = useSearchParams();
  const docenteId = searchParams.get("docenteId");
  const docenteNombre = searchParams.get("nombre") || "";

  const [marcados, setMarcados] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [filtroDocente, setFiltroDocente] = useState(docenteId || "");
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState("resumen");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    api.get("/docentes").then((r) => setDocentes(r.data.data || r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const endpoint = filtroDocente
      ? `/marcados/docente/${filtroDocente}`
      : "/marcados";
    api.get(endpoint)
      .then((r) => {
        const data = r.data.data || r.data;
        console.log("📦 Datos recibidos:", data.length, "registros");
        setMarcados(data);
        setMapKey(prev => prev + 1);
      })
      .finally(() => setLoading(false));
  }, [filtroDocente]);

  const getDocenteNombre = (id) => docentes.find((d) => d.id === id)?.nombreCompleto || "—";

  const filteredMarcados = marcados.filter(m => {
    const matchesSearch = 
      getDocenteNombre(m.docenteId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.tipoMarcado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.estado?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === "todos" || m.estado === filterEstado;
    const matchesTipo = filterTipo === "todos" || m.tipoMarcado === filterTipo;
    return matchesSearch && matchesEstado && matchesTipo;
  });

  const totalMarcados = marcados.length;
  const entradas = marcados.filter((m) => m.tipoMarcado === "entrada").length;
  const salidas = marcados.filter((m) => m.tipoMarcado === "salida").length;
  const tardanzas = marcados.filter((m) => m.minutosRetraso > 0).length;
  const justificados = marcados.filter((m) => m.justificado).length;
  const conGPS = marcados.filter((m) => m.latitud && m.longitud).length;
  const confirmados = marcados.filter(m => m.estado === "confirmado").length;
  const porcentajeAsistencia = totalMarcados > 0 
    ? Math.round((entradas / (entradas + salidas || 1)) * 100) 
    : 0;

  console.log("🔍 Estado actual:", { totalMarcados, conGPS, vista, mapKey });

  return (
    <div>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a2744 0%, #2d4a7a 100%)",
        borderRadius: "16px", padding: "2rem", marginBottom: "1.5rem",
        color: "#fff", boxShadow: "0 10px 30px rgba(26,39,68,0.2)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 style={{ 
              margin: 0, fontSize: "1.8rem", fontWeight: 700,
              display: "flex", alignItems: "center", gap: "0.75rem"
            }}>
              <FaClipboardCheck size={32} />
              Asistencias
            </h2>
            {docenteNombre && (
              <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9, fontSize: "0.95rem" }}>
                <FaUserGraduate style={{ marginRight: "0.5rem" }} />
                {docenteNombre}
              </p>
            )}
            <p style={{ margin: "0.25rem 0 0 0", opacity: 0.8, fontSize: "0.85rem" }}>
              <FaUsers style={{ marginRight: "0.5rem" }} />
              {totalMarcados} registros | {conGPS} con GPS
            </p>
          </div>
          
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <select
              value={filtroDocente}
              onChange={(e) => setFiltroDocente(e.target.value)}
              style={{
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                color: "#fff",
                border: "2px solid rgba(255,255,255,0.2)",
                borderRadius: "10px",
                fontSize: "0.9rem",
                cursor: "pointer",
                outline: "none",
                minWidth: "220px"
              }}
            >
              <option value="" style={{ color: "#1a2744" }}>Todos los docentes</option>
              {docentes.map((d) => (
                <option key={d.id} value={d.id} style={{ color: "#1a2744" }}>
                  {d.nombreCompleto}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: "flex", gap: "0.5rem", marginTop: "1.5rem",
          background: "rgba(0,0,0,0.2)", borderRadius: "12px",
          padding: "0.4rem", width: "fit-content"
        }}>
          <button onClick={() => setVista("resumen")} style={tabStyleActive(vista === "resumen")}>
            <FaList size={16} /> Tabla
          </button>
          <button onClick={() => setVista("mapa")} style={tabStyleActive(vista === "mapa")}>
            <FaMap size={16} /> Mapa GPS
          </button>
          <button onClick={() => setVista("estadisticas")} style={tabStyleActive(vista === "estadisticas")}>
            <FaChartBar size={16} /> Estadísticas
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#64748b", background: "#fff", borderRadius: "16px" }}>
          <FaSatelliteDish size={48} style={{ marginBottom: "1rem", color: "#2563eb" }} />
          <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Cargando registros...</p>
        </div>
      ) : (
        <>
          {/* VISTA RESUMEN (TABLA) */}
          {vista === "resumen" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                <StatCard icon={<FaClipboardCheck size={24} />} label="Total" value={totalMarcados} color="#2563eb" />
                <StatCard icon={<FaSignInAlt size={24} />} label="Entradas" value={entradas} color="#16a34a" />
                <StatCard icon={<FaSignOutAlt size={24} />} label="Salidas" value={salidas} color="#dc2626" />
                <StatCard icon={<FaExclamationTriangle size={24} />} label="Tardanzas" value={tardanzas} color="#f59e0b" />
                <StatCard icon={<FaCheckCircle size={24} />} label="Confirmados" value={confirmados} color="#8b5cf6" />
                <StatCard icon={<MdGpsFixed size={24} />} label="Con GPS" value={conGPS} color="#0891b2" />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
                  <FaSearch style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                  <input
                    type="text" placeholder="Buscar..."
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 3rem", borderRadius: "12px", border: "2px solid #e2e8f0", fontSize: "0.9rem", boxSizing: "border-box", outline: "none" }}
                  />
                </div>
                <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} style={filterSelectStyle}>
                  <option value="todos">Todos los tipos</option>
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                  <option value="tardanza">Tardanza</option>
                </select>
                <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} style={filterSelectStyle}>
                  <option value="todos">Todos los estados</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="validando">Validando</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>

              {filteredMarcados.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "#64748b", background: "#fff", borderRadius: "16px" }}>
                  <FaClipboardCheck size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
                  <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>No se encontraron registros</p>
                </div>
              ) : (
                <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                      <thead>
                        <tr style={{ background: "linear-gradient(135deg, #f8fafc, #eff6ff)", borderBottom: "2px solid #e2e8f0" }}>
                          <th style={thStyle}><FaUser size={12} /> Docente</th>
                          <th style={thStyle}><FaCalendarAlt size={12} /> Fecha</th>
                          <th style={thStyle}><FaLayerGroup size={12} /> Tipo</th>
                          <th style={thStyle}><FaClock size={12} /> Entrada</th>
                          <th style={thStyle}><FaClock size={12} /> Salida</th>
                          <th style={thStyle}><FaHourglassHalf size={12} /> Retraso</th>
                          <th style={thStyle}><MdTimeline size={12} /> Trabajado</th>
                          <th style={thStyle}><FaCheckCircle size={12} /> Estado</th>
                          <th style={thStyle}><FaCheck size={12} /> Just.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMarcados.map((m, index) => {
                          const TipoIcon = TIPO_ICONS[m.tipoMarcado] || FaUserCheck;
                          const EstadoIcon = ESTADO_ICONS[m.estado] || FaCheckCircle;
                          return (
                            <tr key={m.id} style={{ borderBottom: "1px solid #f1f5f9", background: index % 2 === 0 ? "#fff" : "#fafbfc" }}>
                              <td style={tdStyle}><strong>{getDocenteNombre(m.docenteId)}</strong></td>
                              <td style={tdStyle}>{new Date(m.fecha).toLocaleDateString("es-BO", { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                              <td style={tdStyle}><span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.25rem 0.5rem", borderRadius: "999px", background: `${TIPO_COLORS[m.tipoMarcado]}15`, color: TIPO_COLORS[m.tipoMarcado], fontSize: "0.8rem", fontWeight: 600 }}><TipoIcon size={12} />{m.tipoMarcado}</span></td>
                              <td style={tdStyle}>{formatHora(m.horaInicio)}</td>
                              <td style={tdStyle}>{formatHora(m.horaFin)}</td>
                              <td style={tdStyle}>{m.minutosRetraso > 0 ? <span style={{ color: "#dc2626", fontWeight: 600 }}>⏰ {m.minutosRetraso} min</span> : "—"}</td>
                              <td style={tdStyle}>{m.minutosTrabajados > 0 ? `${Math.floor(m.minutosTrabajados / 60)}h ${m.minutosTrabajados % 60}m` : "—"}</td>
                              <td style={tdStyle}><span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.25rem 0.5rem", borderRadius: "999px", background: `${ESTADO_COLORS[m.estado]}15`, color: ESTADO_COLORS[m.estado], fontSize: "0.8rem", fontWeight: 600 }}><EstadoIcon size={12} />{m.estado}</span></td>
                              <td style={tdStyle}>{m.justificado ? <FaCheckCircle size={16} color="#16a34a" /> : <FaTimesCircle size={16} color="#94a3b8" />}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* VISTA MAPA */}
          {vista === "mapa" && (
            <>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center", background: "#fff", padding: "1rem", borderRadius: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FaSignInAlt size={14} color="#16a34a" />
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Entrada</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FaSignOutAlt size={14} color="#dc2626" />
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Salida</span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.5rem", marginLeft: "auto" }}>
                  <MdGpsFixed size={16} color="#0891b2" />
                  {conGPS} de {totalMarcados} marcados con GPS
                </div>
              </div>

              <div style={{ borderRadius: "16px", overflow: "hidden", border: "2px solid #e5e7eb", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <MapContainer
                  key={mapKey}
                  center={[-16.5, -68.15]}
                  zoom={13}
                  style={{ height: "550px", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapMarkers 
                    marcados={marcados} 
                    getDocenteNombre={getDocenteNombre} 
                    formatHora={formatHora} 
                  />
                </MapContainer>
              </div>

              {conGPS === 0 && (
                <div style={{ textAlign: "center", padding: "3rem", color: "#64748b", background: "#fff", borderRadius: "16px", marginTop: "1rem" }}>
                  <MdGpsOff size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
                  <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>No hay marcados con coordenadas GPS</p>
                </div>
              )}
            </>
          )}

          {/* VISTA ESTADÍSTICAS */}
          {vista === "estadisticas" && (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              <div style={{ background: "#fff", borderRadius: "16px", padding: "2rem" }}>
                <h3 style={{ margin: "0 0 1.5rem", color: "#1a2744", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FaChartBar size={20} /> Resumen de Asistencia
                </h3>
                <div style={{ display: "grid", gap: "1rem" }}>
                  <BarraProgreso label="Entradas" value={entradas} total={totalMarcados} color="#16a34a" icon={<FaSignInAlt />} />
                  <BarraProgreso label="Salidas" value={salidas} total={totalMarcados} color="#dc2626" icon={<FaSignOutAlt />} />
                  <BarraProgreso label="Tardanzas" value={tardanzas} total={totalMarcados} color="#f59e0b" icon={<FaExclamationTriangle />} />
                  <BarraProgreso label="Confirmados" value={confirmados} total={totalMarcados} color="#8b5cf6" icon={<FaCheckCircle />} />
                  <BarraProgreso label="Justificados" value={justificados} total={totalMarcados} color="#0891b2" icon={<FaCheck />} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", textAlign: "center" }}>
                  <HiClock size={32} color="#2563eb" style={{ marginBottom: "1rem" }} />
                  <div style={{ fontSize: "2rem", fontWeight: 700, color: "#1a2744" }}>{porcentajeAsistencia}%</div>
                  <div style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "0.5rem" }}>Tasa de Entradas</div>
                </div>
                <div style={{ background: "#fff", borderRadius: "16px", padding: "1.5rem", textAlign: "center" }}>
                  <MdGpsFixed size={32} color="#0891b2" style={{ marginBottom: "1rem" }} />
                  <div style={{ fontSize: "2rem", fontWeight: 700, color: "#1a2744" }}>{totalMarcados > 0 ? Math.round((conGPS / totalMarcados) * 100) : 0}%</div>
                  <div style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "0.5rem" }}>Cobertura GPS</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Componentes ───
function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: "#fff", borderRadius: "16px", padding: "1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", textAlign: "center", borderTop: `4px solid ${color}` }}>
      <div style={{ color, marginBottom: "0.5rem" }}>{icon}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#1a2744" }}>{value}</div>
      <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>{label}</div>
    </div>
  );
}

function BarraProgreso({ label, value, total, color, icon }) {
  const porcentaje = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", fontWeight: 600, color: "#374151" }}>
          <span style={{ color }}>{icon}</span> {label}
        </span>
        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a2744" }}>{value} ({porcentaje}%)</span>
      </div>
      <div style={{ width: "100%", height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ width: `${porcentaje}%`, height: "100%", background: color, borderRadius: "4px", transition: "width 1s ease-out" }} />
      </div>
    </div>
  );
}

function formatHora(fecha) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" });
}

// ─── Estilos ───
const tabStyleActive = (activo) => ({
  padding: "0.6rem 1.2rem", border: "none", cursor: "pointer",
  fontWeight: 600, fontSize: "0.85rem",
  background: activo ? "#fff" : "transparent",
  color: activo ? "#1a2744" : "rgba(255,255,255,0.7)",
  borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.5rem",
  transition: "all 0.2s"
});

const filterSelectStyle = {
  padding: "0.75rem 1rem", borderRadius: "12px",
  border: "2px solid #e2e8f0", fontSize: "0.9rem",
  background: "#fff", cursor: "pointer", outline: "none", minWidth: "150px"
};

const thStyle = {
  padding: "0.85rem 1rem", textAlign: "left", fontWeight: 600,
  color: "#475569", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.5px"
};

const tdStyle = {
  padding: "0.85rem 1rem", color: "#334155"
};