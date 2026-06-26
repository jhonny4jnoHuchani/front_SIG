import { useEffect, useState } from "react";
import { 
  FaClock, FaCalendarAlt, FaMapMarkerAlt, FaUsers,
  FaFlask, FaHospital, FaPlus, FaTimes, FaSave, FaArrowRight,
  FaSearch, FaFilter, FaRegClock, FaHourglassHalf,
  FaBook, FaChalkboardTeacher, FaInfoCircle, FaLayerGroup
} from 'react-icons/fa';
import { MdSchedule } from 'react-icons/md';
import { HiClock } from 'react-icons/hi';
import { BiCalendar } from 'react-icons/bi';
import api from "../api/client";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const TIPOS = {
  clase: { 
    label: "Clase", 
    icon: FaBook, 
    color: "#2563eb",
    bgColor: "#eff6ff"
  },
  laboratorio: { 
    label: "Laboratorio", 
    icon: FaFlask, 
    color: "#7c3aed",
    bgColor: "#f5f3ff"
  },
  rote: { 
    label: "Rotación Hospital", 
    icon: FaHospital, 
    color: "#dc2626",
    bgColor: "#fef2f2"
  }
};

// Funciones helper para obtener iconos
const getTipoIcon = (tipoActividad, size = 28) => {
  const tipo = TIPOS[tipoActividad] || TIPOS.clase;
  const IconComponent = tipo.icon;
  return <IconComponent size={size} color={tipo.color} />;
};

const getTipoIconLarge = (tipoActividad, size = 48) => {
  const tipo = TIPOS[tipoActividad] || TIPOS.clase;
  const IconComponent = tipo.icon;
  return <IconComponent size={size} />;
};

const getTipoIconSmall = (tipoActividad, size = 14) => {
  const tipo = TIPOS[tipoActividad] || TIPOS.clase;
  const IconComponent = tipo.icon;
  return <IconComponent size={size} color={tipo.color} />;
};

export default function Horarios() {
  const [horarios, setHorarios] = useState([]);
  const [paralelos, setParalelos] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [form, setForm] = useState({
    paraleloId: "",
    diaSemana: 0,
    horaInicio: "08:00",
    horaFin: "10:00",
    ubicacionId: "",
    tipoActividad: "clase",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDia, setFilterDia] = useState("todos");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [vistaCalendario, setVistaCalendario] = useState(false);

  const cargarDatos = () => {
    api.get("/horarios").then((r) => setHorarios(r.data.data || r.data));
    api.get("/paralelos").then((r) => setParalelos(r.data.data || r.data));
    api.get("/ubicaciones").then((r) => setUbicaciones(r.data.data || r.data));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/horarios", {
        paraleloId: form.paraleloId,
        diaSemana: parseInt(form.diaSemana),
        horaInicio: form.horaInicio,
        horaFin: form.horaFin,
        ubicacionId: form.ubicacionId,
        tipoActividad: form.tipoActividad,
      });
      setShowModal(false);
      setForm({ paraleloId: "", diaSemana: 0, horaInicio: "08:00", horaFin: "10:00", ubicacionId: "", tipoActividad: "clase" });
      cargarDatos();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Error al crear"));
    }
    setIsSubmitting(false);
  };

  const handleOpenModal = () => {
    setForm({ paraleloId: "", diaSemana: 0, horaInicio: "08:00", horaFin: "10:00", ubicacionId: "", tipoActividad: "clase" });
    setShowModal(true);
  };

  const getParaleloInfo = (id) => {
    const p = paralelos.find((x) => x.id === id);
    return p ? p.numero : "—";
  };

  const getUbicacionNombre = (id) => ubicaciones.find((u) => u.id === id)?.nombre || "—";

  // Filtrado
  const filteredHorarios = horarios.filter(h => {
    const matchesSearch = 
      TIPOS[h.tipoActividad]?.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      DIAS[h.diaSemana].toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUbicacionNombre(h.ubicacionId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDia = filterDia === "todos" || h.diaSemana === parseInt(filterDia);
    const matchesTipo = filterTipo === "todos" || h.tipoActividad === filterTipo;
    return matchesSearch && matchesDia && matchesTipo;
  });

  // Agrupar horarios por día para vista calendario
  const horariosPorDia = DIAS.map((dia, index) => ({
    dia,
    index: index + 1,
    horarios: filteredHorarios.filter(h => h.diaSemana === index)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
  }));

  // Calcular duración en horas
  const calcularDuracion = (inicio, fin) => {
    const [hIni, mIni] = inicio.split(":").map(Number);
    const [hFin, mFin] = fin.split(":").map(Number);
    const duracionMin = (hFin * 60 + mFin) - (hIni * 60 + mIni);
    const horas = Math.floor(duracionMin / 60);
    const minutos = duracionMin % 60;
    return `${horas}h${minutos > 0 ? ` ${minutos}m` : ''}`;
  };

  return (
    <div>
      {/* Header mejorado */}
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
              <FaClock size={32} />
              Horarios
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9, fontSize: "0.95rem" }}>
              <MdSchedule style={{ marginRight: "0.5rem" }} />
              {horarios.length} horario{horarios.length !== 1 ? 's' : ''} programado{horarios.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={() => setVistaCalendario(!vistaCalendario)}
              style={{
                padding: "0.75rem 1.5rem",
                background: vistaCalendario ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                color: "#fff", border: "2px solid rgba(255,255,255,0.3)",
                borderRadius: "12px", cursor: "pointer",
                fontWeight: 600, fontSize: "0.95rem",
                transition: "all 0.3s",
                display: "flex", alignItems: "center", gap: "0.5rem"
              }}
            >
              {vistaCalendario ? <FaLayerGroup /> : <FaCalendarAlt />}
              {vistaCalendario ? "Vista Lista" : "Vista Calendario"}
            </button>
            <button
              onClick={handleOpenModal}
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
              <FaPlus /> Nuevo Horario
            </button>
          </div>
        </div>
      </div>

      {/* Buscador y filtros */}
      <div style={{
        display: "flex", gap: "1rem", marginBottom: "1.5rem",
        flexWrap: "wrap", alignItems: "center"
      }}>
        <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
          <FaSearch style={{
            position: "absolute", left: "1rem", top: "50%",
            transform: "translateY(-50%)", color: "#64748b",
            fontSize: "1.1rem"
          }} />
          <input
            type="text"
            placeholder="Buscar por tipo, día o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%", padding: "0.75rem 1rem 0.75rem 3rem",
              borderRadius: "12px", border: "2px solid #e2e8f0",
              fontSize: "0.9rem", boxSizing: "border-box",
              transition: "border-color 0.2s",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.borderColor = "#2563eb"}
            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>
        
        <div style={{ position: "relative", minWidth: "180px" }}>
          <FaCalendarAlt style={{
            position: "absolute", left: "1rem", top: "50%",
            transform: "translateY(-50%)", color: "#64748b",
            zIndex: 1, fontSize: "0.9rem"
          }} />
          <select
            value={filterDia}
            onChange={(e) => setFilterDia(e.target.value)}
            style={{
              padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "12px",
              border: "2px solid #e2e8f0", fontSize: "0.9rem",
              background: "#fff", cursor: "pointer",
              outline: "none", minWidth: "180px"
            }}
            onFocus={(e) => e.target.style.borderColor = "#2563eb"}
            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
          >
            <option value="todos">Todos los días</option>
            {DIAS.map((dia, i) => (
              <option key={i} value={i}>{dia}</option>
            ))}
          </select>
        </div>

        <div style={{ position: "relative", minWidth: "200px" }}>
          <FaLayerGroup style={{
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
            {Object.entries(TIPOS).map(([key, tipo]) => (
              <option key={key} value={key}>{tipo.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Modal Nuevo Horario */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(5px)", padding: "1rem"
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: "#fff", borderRadius: "20px", width: "100%",
            maxWidth: "800px", maxHeight: "90vh", overflow: "auto",
            boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
            animation: "slideUp 0.3s ease-out"
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Header del modal */}
            <div style={{
              background: "linear-gradient(135deg, #1a2744 0%, #2d4a7a 100%)",
              padding: "1.5rem 2rem", borderRadius: "20px 20px 0 0",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h3 style={{ 
                  margin: 0, color: "#fff", fontSize: "1.3rem", fontWeight: 700,
                  display: "flex", alignItems: "center", gap: "0.75rem"
                }}>
                  <HiClock size={24} />
                  Nuevo Horario
                </h3>
                <p style={{ margin: "0.25rem 0 0 0", color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>
                  Programa una actividad en el calendario académico
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{
                  background: "rgba(255,255,255,0.2)", border: "none",
                  color: "#fff", fontSize: "1.3rem", cursor: "pointer",
                  width: "36px", height: "36px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.3)"}
                onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
              >
                <FaTimes />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleCreate} style={{ padding: "2rem" }}>
              
              {/* Vista previa del horario */}
              <div style={{
                background: "linear-gradient(135deg, #f0f9ff, #faf5ff)",
                borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem",
                border: "2px dashed #c4b5fd"
              }}>
                <div style={{ 
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexWrap: "wrap", gap: "1rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{
                      width: "60px", height: "60px", borderRadius: "50%",
                      background: TIPOS[form.tipoActividad]?.bgColor || "#f0f9ff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.5rem"
                    }}>
                      {getTipoIcon(form.tipoActividad, 28)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: "#1a2744", fontSize: "1.1rem" }}>
                        {TIPOS[form.tipoActividad]?.label || "Actividad"}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        {DIAS[form.diaSemana]} • {form.horaInicio}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    background: "#fff", padding: "0.75rem 1rem", borderRadius: "8px",
                    display: "flex", alignItems: "center", gap: "0.5rem"
                  }}>
                    <FaHourglassHalf size={16} color="#2563eb" />
                    <span style={{ fontWeight: 600, color: "#1a2744" }}>
                      {calcularDuracion(form.horaInicio, form.horaFin)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Campos */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={labelStyle}>
                    <FaUsers size={14} style={{ marginRight: "0.3rem" }} />
                    Paralelo
                  </label>
                  <select
                    value={form.paraleloId}
                    onChange={(e) => setForm({ ...form, paraleloId: e.target.value })}
                    required
                    style={inputStyle}
                  >
                    <option value="">Seleccionar paralelo...</option>
                    {paralelos.map((p) => (
                      <option key={p.id} value={p.id}>
                        Paralelo {p.numero} {p.materia ? `- ${p.materia.nombre}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    <FaLayerGroup size={14} style={{ marginRight: "0.3rem" }} />
                    Tipo de Actividad
                  </label>
                  <select
                    value={form.tipoActividad}
                    onChange={(e) => setForm({ ...form, tipoActividad: e.target.value })}
                    required
                    style={inputStyle}
                  >
                    {Object.entries(TIPOS).map(([key, tipo]) => (
                      <option key={key} value={key}>{tipo.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    <FaCalendarAlt size={14} style={{ marginRight: "0.3rem" }} />
                    Día
                  </label>
                  <select
                    value={form.diaSemana}
                    onChange={(e) => setForm({ ...form, diaSemana: e.target.value })}
                    required
                    style={inputStyle}
                  >
                    {DIAS.map((dia, i) => (
                      <option key={i} value={i}>{dia}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    <FaMapMarkerAlt size={14} style={{ marginRight: "0.3rem" }} />
                    Ubicación
                  </label>
                  <select
                    value={form.ubicacionId}
                    onChange={(e) => setForm({ ...form, ubicacionId: e.target.value })}
                    required
                    style={inputStyle}
                  >
                    <option value="">Seleccionar ubicación...</option>
                    {ubicaciones.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre} ({u.tipo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    <FaRegClock size={14} style={{ marginRight: "0.3rem" }} />
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    value={form.horaInicio}
                    onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    <FaHourglassHalf size={14} style={{ marginRight: "0.3rem" }} />
                    Hora Fin
                  </label>
                  <input
                    type="time"
                    value={form.horaFin}
                    onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Botones */}
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "0.75rem 1.5rem", background: "#f1f5f9",
                    color: "#64748b", border: "1px solid #e2e8f0",
                    borderRadius: "10px", cursor: "pointer", fontWeight: 600,
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: "0.5rem"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#e2e8f0"}
                  onMouseLeave={(e) => e.target.style.background = "#f1f5f9"}
                >
                  <FaTimes size={14} />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "0.75rem 2rem",
                    background: isSubmitting ? "#94a3b8" : "linear-gradient(135deg, #1a2744, #2d4a7a)",
                    color: "#fff", border: "none", borderRadius: "10px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    fontWeight: 600, fontSize: "0.95rem",
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    transition: "all 0.2s", boxShadow: "0 4px 6px rgba(26,39,68,0.2)"
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) e.target.style.transform = "translateY(0)";
                  }}
                >
                  {isSubmitting ? (
                    <>⏳ Guardando...</>
                  ) : (
                    <><FaSave size={16} /> Guardar Horario</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {selectedHorario && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(5px)", padding: "1rem"
        }} onClick={() => setSelectedHorario(null)}>
          <div style={{
            background: "#fff", borderRadius: "20px", width: "100%",
            maxWidth: "500px", overflow: "hidden",
            boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
            animation: "slideUp 0.3s ease-out"
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Header con gradiente */}
            <div style={{
              background: `linear-gradient(135deg, ${TIPOS[selectedHorario.tipoActividad]?.color || "#1a2744"} 0%, ${TIPOS[selectedHorario.tipoActividad]?.color || "#2d4a7a"}dd 100%)`,
              padding: "2rem", textAlign: "center", color: "#fff",
              position: "relative"
            }}>
              <button 
                onClick={() => setSelectedHorario(null)}
                style={{
                  position: "absolute", top: "1rem", right: "1rem",
                  background: "rgba(255,255,255,0.2)", border: "none",
                  color: "#fff", fontSize: "1.2rem", cursor: "pointer",
                  width: "32px", height: "32px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <FaTimes />
              </button>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                {getTipoIconLarge(selectedHorario.tipoActividad, 48)}
              </div>
              <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>
                {TIPOS[selectedHorario.tipoActividad]?.label}
              </h3>
              <div style={{
                display: "inline-block", marginTop: "0.5rem",
                padding: "0.3rem 1rem", borderRadius: "999px",
                background: "rgba(255,255,255,0.2)", fontSize: "0.9rem"
              }}>
                {DIAS[selectedHorario.diaSemana]}
              </div>
            </div>

            {/* Detalles */}
            <div style={{ padding: "2rem" }}>
              {/* Horario */}
              <div style={{
                background: "#f8fafc", padding: "1.25rem",
                borderRadius: "12px", textAlign: "center",
                border: "2px solid #e2e8f0", marginBottom: "1rem"
              }}>
                <FaClock size={32} style={{ color: "#0891b2", marginBottom: "0.5rem" }} />
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#1a2744" }}>
                  {selectedHorario.horaInicio} - {selectedHorario.horaFin}
                </div>
                <div style={{ 
                  fontSize: "0.9rem", color: "#0891b2", marginTop: "0.25rem",
                  fontWeight: 600
                }}>
                  <FaHourglassHalf style={{ marginRight: "0.5rem" }} />
                  {calcularDuracion(selectedHorario.horaInicio, selectedHorario.horaFin)}
                </div>
              </div>

              {/* Info adicional */}
              <div style={{
                background: "#f8fafc", padding: "1rem", borderRadius: "12px",
                border: "2px solid #e2e8f0", marginBottom: "1.5rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <FaUsers size={16} style={{ color: "#2563eb" }} />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Paralelo</div>
                    <div style={{ fontWeight: 600, color: "#1a2744" }}>
                      Paralelo {getParaleloInfo(selectedHorario.paraleloId)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <FaMapMarkerAlt size={16} style={{ color: "#dc2626" }} />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Ubicación</div>
                    <div style={{ fontWeight: 600, color: "#1a2744" }}>
                      {getUbicacionNombre(selectedHorario.ubicacionId)}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedHorario(null)}
                style={{
                  width: "100%", padding: "0.75rem", background: "#f1f5f9",
                  color: "#64748b", border: "1px solid #e2e8f0",
                  borderRadius: "10px", cursor: "pointer", fontWeight: 600,
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "0.5rem"
                }}
                onMouseEnter={(e) => e.target.style.background = "#e2e8f0"}
                onMouseLeave={(e) => e.target.style.background = "#f1f5f9"}
              >
                <FaTimes size={14} />
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista Calendario */}
      {vistaCalendario ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
          {horariosPorDia.map(({ dia, index, horarios }) => (
            <div key={index} style={{
              background: "#fff", borderRadius: "16px", overflow: "hidden",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              border: "2px solid #f1f5f9"
            }}>
              <div style={{
                background: "linear-gradient(135deg, #0891b2, #06b6d4)",
                color: "#fff", padding: "1rem", textAlign: "center",
                fontWeight: 700, fontSize: "1rem"
              }}>
                {dia}
              </div>
              <div style={{ padding: "1rem", minHeight: "100px" }}>
                {horarios.length === 0 ? (
                  <div style={{ 
                    textAlign: "center", color: "#94a3b8", 
                    padding: "2rem 0", fontSize: "0.9rem" 
                  }}>
                    Sin horarios
                  </div>
                ) : (
                  horarios.map(h => (
                    <div
                      key={h.id}
                      onClick={() => setSelectedHorario(h)}
                      style={{
                        background: TIPOS[h.tipoActividad]?.bgColor || "#f0f9ff",
                        padding: "0.75rem", borderRadius: "8px",
                        marginBottom: "0.5rem", cursor: "pointer",
                        border: `1px solid ${TIPOS[h.tipoActividad]?.color || "#2563eb"}30`,
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateX(4px)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateX(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        {getTipoIconSmall(h.tipoActividad, 14)}
                        <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1a2744" }}>
                          {h.horaInicio} - {h.horaFin}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {getUbicacionNombre(h.ubicacionId)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vista Lista */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
          {filteredHorarios.map((h) => {
            const tipoColor = TIPOS[h.tipoActividad]?.color || "#0891b2";
            
            return (
              <div 
                key={h.id} 
                onClick={() => setSelectedHorario(h)}
                style={{
                  background: "#fff", borderRadius: "16px", padding: "1.5rem",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                  border: "2px solid #f1f5f9",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
                  e.currentTarget.style.borderColor = tipoColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)";
                  e.currentTarget.style.borderColor = "#f1f5f9";
                }}
              >
                {/* Badge del día */}
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  background: `linear-gradient(135deg, ${tipoColor}, ${tipoColor}dd)`,
                  color: "#fff", padding: "0.4rem 1rem",
                  borderRadius: "0 16px 0 16px",
                  fontSize: "0.8rem", fontWeight: 600,
                  display: "flex", alignItems: "center", gap: "0.3rem"
                }}>
                  <FaCalendarAlt size={12} />
                  {DIAS[h.diaSemana]}
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "start", gap: "0.75rem" }}>
                    <div style={{
                      width: "50px", height: "50px", borderRadius: "12px",
                      background: TIPOS[h.tipoActividad]?.bgColor || "#f0f9ff",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {getTipoIcon(h.tipoActividad, 28)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        margin: 0, fontSize: "1.05rem", fontWeight: 700,
                        color: "#1a2744", lineHeight: "1.3"
                      }}>
                        {TIPOS[h.tipoActividad]?.label}
                      </h3>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: "0.3rem",
                        marginTop: "0.25rem", padding: "0.2rem 0.6rem",
                        borderRadius: "999px", background: "#f0f9ff",
                        color: "#0891b2", fontSize: "0.8rem", fontWeight: 600
                      }}>
                        <FaClock size={10} />
                        {h.horaInicio} - {h.horaFin}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem", padding: "1rem",
                  background: "#f8fafc", borderRadius: "12px",
                  marginBottom: "0.75rem"
                }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ 
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: "0.3rem", fontSize: "1rem", fontWeight: 600, color: "#2563eb"
                    }}>
                      <FaUsers size={14} />
                      P. {getParaleloInfo(h.paraleloId)}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.25rem" }}>
                      Paralelo
                    </div>
                  </div>
                  <div style={{ textAlign: "center", borderLeft: "1px solid #e2e8f0" }}>
                    <div style={{ 
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: "0.3rem", fontSize: "1rem", fontWeight: 600, color: "#dc2626"
                    }}>
                      <FaMapMarkerAlt size={14} />
                    </div>
                    <div style={{ 
                      fontSize: "0.7rem", color: "#64748b", marginTop: "0.25rem",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                    }}>
                      {getUbicacionNombre(h.ubicacionId)}
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: "0.5rem", textAlign: "right",
                  fontSize: "0.85rem", color: tipoColor, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "flex-end",
                  gap: "0.3rem"
                }}>
                  <FaHourglassHalf size={12} />
                  {calcularDuracion(h.horaInicio, h.horaFin)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Estados vacíos */}
      {filteredHorarios.length === 0 && horarios.length > 0 && (
        <div style={{
          textAlign: "center", padding: "3rem", color: "#64748b",
          background: "#fff", borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
        }}>
          <FaSearch size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
          <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            No se encontraron horarios
          </p>
          <p style={{ fontSize: "0.9rem" }}>
            Intenta con otros filtros o busca otro término
          </p>
        </div>
      )}

      {horarios.length === 0 && (
        <div style={{
          textAlign: "center", padding: "4rem", color: "#64748b",
          background: "#fff", borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
        }}>
          <FaClock size={64} style={{ marginBottom: "1rem", color: "#0891b2", opacity: 0.5 }} />
          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a2744", marginBottom: "0.5rem" }}>
            No hay horarios programados
          </h3>
          <p style={{ fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            Comienza programando tu primer horario de clases
          </p>
          <button
            onClick={handleOpenModal}
            style={{
              padding: "0.75rem 2rem",
              background: "linear-gradient(135deg, #1a2744, #2d4a7a)",
              color: "#fff", border: "none", borderRadius: "12px",
              cursor: "pointer", fontWeight: 600, fontSize: "0.95rem",
              display: "inline-flex", alignItems: "center", gap: "0.5rem"
            }}
          >
            <FaPlus /> Crear Primer Horario
          </button>
        </div>
      )}

      {/* Animación CSS */}
      <style>{`
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
      `}</style>
    </div>
  );
}

const labelStyle = {
  fontSize: "0.85rem", fontWeight: 600, color: "#374151",
  display: "flex", alignItems: "center", marginBottom: "0.35rem"
};

const inputStyle = {
  width: "100%", padding: "0.7rem 1rem",
  borderRadius: "10px", border: "2px solid #e2e8f0",
  fontSize: "0.9rem", boxSizing: "border-box",
  transition: "all 0.2s", outline: "none"
};