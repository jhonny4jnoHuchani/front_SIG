import { useEffect, useState } from "react";
import { 
  FaUsers, FaBook, FaChalkboardTeacher, FaHashtag, 
  FaUserGraduate, FaCalendar, FaPlus, FaTimes, 
  FaSave, FaArrowRight, FaUserFriends, FaLayerGroup,
  FaSearch, FaFilter, FaGraduationCap, FaIdBadge,
  FaInfoCircle, FaClipboardList
} from 'react-icons/fa';
import { MdClass, MdPerson, MdGroup, MdDateRange } from 'react-icons/md';
import { HiUserGroup, HiAcademicCap } from 'react-icons/hi';
import { BsPersonBadge, BsCalendarCheck } from 'react-icons/bs';
import { BiGroup, BiBookContent } from 'react-icons/bi';
import api from "../api/client";

export default function Paralelos() {
  const [paralelos, setParalelos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedParalelo, setSelectedParalelo] = useState(null);
  const [form, setForm] = useState({
    materiaId: "",
    docenteId: "",
    numero: "",
    capacidad: 30,
    semestreAcademico: "2026-1",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMateria, setFilterMateria] = useState("todos");
  const [filterSemestre, setFilterSemestre] = useState("todos");

  const cargarDatos = () => {
    api.get("/paralelos").then((r) => setParalelos(r.data.data || r.data));
    api.get("/materias").then((r) => setMaterias(r.data.data || r.data));
    api.get("/docentes").then((r) => setDocentes(r.data.data || r.data));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // ✅ Mismos datos, sin modificar
      await api.post("/paralelos", {
        materiaId: form.materiaId,
        docenteId: form.docenteId,
        numero: form.numero,
        capacidad: parseInt(form.capacidad),
        semestreAcademico: form.semestreAcademico,
      });
      setShowModal(false);
      setForm({ materiaId: "", docenteId: "", numero: "", capacidad: 30, semestreAcademico: "2026-1" });
      cargarDatos();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Error al crear"));
    }
    setIsSubmitting(false);
  };

  const handleOpenModal = () => {
    setForm({ materiaId: "", docenteId: "", numero: "", capacidad: 30, semestreAcademico: "2026-1" });
    setShowModal(true);
  };

  // Funciones para obtener nombres
  const getMateriaNombre = (id) => materias.find((m) => m.id === id)?.nombre || "—";
  const getMateriaCodigo = (id) => materias.find((m) => m.id === id)?.codigo || "—";
  const getDocenteNombre = (id) => docentes.find((d) => d.id === id)?.nombreCompleto || "—";
  const getDocenteEmail = (id) => docentes.find((d) => d.id === id)?.email || "—";

  // Filtrado
  const filteredParalelos = paralelos.filter(p => {
    const matchesSearch = 
      getMateriaNombre(p.materiaId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDocenteNombre(p.docenteId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.numero.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMateria = filterMateria === "todos" || p.materiaId === filterMateria;
    const matchesSemestre = filterSemestre === "todos" || p.semestreAcademico === filterSemestre;
    return matchesSearch && matchesMateria && matchesSemestre;
  });

  // Semestres únicos para filtro
  const semestresUnicos = [...new Set(paralelos.map(p => p.semestreAcademico))].sort().reverse();

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
              <HiUserGroup size={32} />
              Paralelos
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9, fontSize: "0.95rem" }}>
              <FaUserGraduate style={{ marginRight: "0.5rem" }} />
              {paralelos.length} paralelo{paralelos.length !== 1 ? 's' : ''} configurado{paralelos.length !== 1 ? 's' : ''}
            </p>
          </div>
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
            <FaPlus /> Nuevo Paralelo
          </button>
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
            placeholder="Buscar por materia, docente o número..."
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
        
        <div style={{ position: "relative", minWidth: "200px" }}>
          <FaBook style={{
            position: "absolute", left: "1rem", top: "50%",
            transform: "translateY(-50%)", color: "#64748b",
            zIndex: 1, fontSize: "0.9rem"
          }} />
          <select
            value={filterMateria}
            onChange={(e) => setFilterMateria(e.target.value)}
            style={{
              padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "12px",
              border: "2px solid #e2e8f0", fontSize: "0.9rem",
              background: "#fff", cursor: "pointer",
              outline: "none", minWidth: "200px"
            }}
            onFocus={(e) => e.target.style.borderColor = "#2563eb"}
            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
          >
            <option value="todos">Todas las materias</option>
            {materias.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>

        <div style={{ position: "relative", minWidth: "180px" }}>
          <FaCalendar style={{
            position: "absolute", left: "1rem", top: "50%",
            transform: "translateY(-50%)", color: "#64748b",
            zIndex: 1, fontSize: "0.9rem"
          }} />
          <select
            value={filterSemestre}
            onChange={(e) => setFilterSemestre(e.target.value)}
            style={{
              padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "12px",
              border: "2px solid #e2e8f0", fontSize: "0.9rem",
              background: "#fff", cursor: "pointer",
              outline: "none", minWidth: "180px"
            }}
            onFocus={(e) => e.target.style.borderColor = "#2563eb"}
            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
          >
            <option value="todos">Todos los semestres</option>
            {semestresUnicos.map(sem => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Modal Nueva Paralelo */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(5px)", padding: "1rem"
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: "#fff", borderRadius: "20px", width: "100%",
            maxWidth: "700px", maxHeight: "90vh", overflow: "auto",
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
                  <HiUserGroup size={24} />
                  Nuevo Paralelo
                </h3>
                <p style={{ margin: "0.25rem 0 0 0", color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>
                  Asigna una materia a un docente con su grupo
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
              
              {/* Vista previa */}
              <div style={{
                background: "linear-gradient(135deg, #f0f9ff, #faf5ff)",
                borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem",
                border: "2px dashed #c4b5fd", textAlign: "center"
              }}>
                <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "center", gap: "1rem" }}>
                  <HiAcademicCap size={32} color="#2563eb" />
                  <FaChalkboardTeacher size={32} color="#7c3aed" />
                </div>
                <div style={{ fontWeight: 700, color: "#1a2744", fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                  {form.materiaId ? getMateriaNombre(form.materiaId) : "Materia"} — Paralelo {form.numero || "?"}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  {form.docenteId ? `Docente: ${getDocenteNombre(form.docenteId)}` : "Sin docente asignado"} • 
                  {form.capacidad} estudiantes • {form.semestreAcademico}
                </div>
              </div>

              {/* Campos */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={labelStyle}>
                    <FaBook size={14} style={{ marginRight: "0.3rem" }} />
                    Materia
                  </label>
                  <select
                    value={form.materiaId}
                    onChange={(e) => setForm({ ...form, materiaId: e.target.value })}
                    required
                    style={inputStyle}
                  >
                    <option value="">Seleccionar materia...</option>
                    {materias.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre} ({m.codigo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    <FaChalkboardTeacher size={14} style={{ marginRight: "0.3rem" }} />
                    Docente
                  </label>
                  <select
                    value={form.docenteId}
                    onChange={(e) => setForm({ ...form, docenteId: e.target.value })}
                    required
                    style={inputStyle}
                  >
                    <option value="">Seleccionar docente...</option>
                    {docentes.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombreCompleto}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    <FaHashtag size={14} style={{ marginRight: "0.3rem" }} />
                    Número/Grupo
                  </label>
                  <input
                    type="text"
                    value={form.numero}
                    onChange={(e) => setForm({ ...form, numero: e.target.value })}
                    placeholder="Ej: A, B, 1, 2..."
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    <FaUsers size={14} style={{ marginRight: "0.3rem" }} />
                    Capacidad
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number"
                      value={form.capacidad}
                      onChange={(e) => setForm({ ...form, capacidad: e.target.value })}
                      min="1"
                      max="200"
                      style={{ ...inputStyle, paddingRight: "3rem" }}
                    />
                    <span style={{
                      position: "absolute", right: "1rem", top: "50%",
                      transform: "translateY(-50%)", color: "#7c3aed",
                      fontWeight: 600, fontSize: "0.85rem"
                    }}>
                      est.
                    </span>
                  </div>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>
                    <FaCalendar size={14} style={{ marginRight: "0.3rem" }} />
                    Semestre Académico
                  </label>
                  <input
                    type="text"
                    value={form.semestreAcademico}
                    onChange={(e) => setForm({ ...form, semestreAcademico: e.target.value })}
                    placeholder="Ej: 2026-1"
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
                    <><FaSave size={16} /> Guardar Paralelo</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {selectedParalelo && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(5px)", padding: "1rem"
        }} onClick={() => setSelectedParalelo(null)}>
          <div style={{
            background: "#fff", borderRadius: "20px", width: "100%",
            maxWidth: "500px", overflow: "hidden",
            boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
            animation: "slideUp 0.3s ease-out"
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Header con gradiente */}
            <div style={{
              background: "linear-gradient(135deg, #1a2744 0%, #2d4a7a 100%)",
              padding: "2rem", textAlign: "center", color: "#fff",
              position: "relative"
            }}>
              <button 
                onClick={() => setSelectedParalelo(null)}
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
              <HiUserGroup size={48} style={{ marginBottom: "1rem" }} />
              <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>
                {getMateriaNombre(selectedParalelo.materiaId)}
              </h3>
              <div style={{
                display: "inline-block", marginTop: "0.5rem",
                padding: "0.3rem 1rem", borderRadius: "999px",
                background: "rgba(255,255,255,0.2)", fontSize: "0.9rem"
              }}>
                Paralelo {selectedParalelo.numero}
              </div>
            </div>

            {/* Detalles */}
            <div style={{ padding: "2rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{
                  background: "#f8fafc", padding: "1.25rem",
                  borderRadius: "12px", textAlign: "center",
                  border: "2px solid #e2e8f0"
                }}>
                  <FaUsers size={24} style={{ color: "#2563eb", marginBottom: "0.5rem" }} />
                  <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#2563eb" }}>
                    {selectedParalelo.capacidad || 0}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>
                    Capacidad
                  </div>
                </div>
                <div style={{
                  background: "#f8fafc", padding: "1.25rem",
                  borderRadius: "12px", textAlign: "center",
                  border: "2px solid #e2e8f0"
                }}>
                  <FaCalendar size={24} style={{ color: "#7c3aed", marginBottom: "0.5rem" }} />
                  <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#7c3aed" }}>
                    {selectedParalelo.semestreAcademico}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>
                    Semestre
                  </div>
                </div>
              </div>

              <div style={{
                background: "#f8fafc", padding: "1rem", borderRadius: "12px",
                border: "2px solid #e2e8f0", marginBottom: "1.5rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <FaBook size={16} style={{ color: "#2563eb" }} />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Materia</div>
                    <div style={{ fontWeight: 600, color: "#1a2744" }}>
                      {getMateriaNombre(selectedParalelo.materiaId)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <FaChalkboardTeacher size={16} style={{ color: "#7c3aed" }} />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Docente</div>
                    <div style={{ fontWeight: 600, color: "#1a2744" }}>
                      {getDocenteNombre(selectedParalelo.docenteId)}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedParalelo(null)}
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

      {/* Lista de paralelos */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
        {filteredParalelos.map((p) => (
          <div 
            key={p.id} 
            onClick={() => setSelectedParalelo(p)}
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
              e.currentTarget.style.borderColor = "#7c3aed";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)";
              e.currentTarget.style.borderColor = "#f1f5f9";
            }}
          >
            {/* Badge de semestre */}
            <div style={{
              position: "absolute", top: 0, right: 0,
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "#fff", padding: "0.4rem 1rem",
              borderRadius: "0 16px 0 16px",
              fontSize: "0.8rem", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "0.3rem"
            }}>
              <FaCalendar size={12} />
              {p.semestreAcademico}
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "start", gap: "0.75rem" }}>
                <div style={{
                  width: "50px", height: "50px", borderRadius: "12px",
                  background: "linear-gradient(135deg, #f0f9ff, #e0e7ff)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <HiAcademicCap size={28} color="#7c3aed" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: 0, fontSize: "1.05rem", fontWeight: 700,
                    color: "#1a2744", lineHeight: "1.3"
                  }}>
                    {getMateriaNombre(p.materiaId)}
                  </h3>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "0.3rem",
                    marginTop: "0.25rem", padding: "0.2rem 0.6rem",
                    borderRadius: "999px", background: "#f0f9ff",
                    color: "#7c3aed", fontSize: "0.8rem", fontWeight: 600
                  }}>
                    <FaHashtag size={10} />
                    Paralelo {p.numero}
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
                  gap: "0.3rem", fontSize: "1.1rem", fontWeight: 700, color: "#2563eb"
                }}>
                  <FaUsers size={16} />
                  {p.capacidad || 0}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
                  Capacidad
                </div>
              </div>
              <div style={{ textAlign: "center", borderLeft: "1px solid #e2e8f0" }}>
                <div style={{ 
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "0.3rem", fontSize: "1.1rem", fontWeight: 700, color: "#059669"
                }}>
                  <FaChalkboardTeacher size={16} />
                </div>
                <div style={{ 
                  fontSize: "0.7rem", color: "#64748b", marginTop: "0.25rem",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                }}>
                  {getDocenteNombre(p.docenteId)}
                </div>
              </div>
            </div>

            <div style={{
              marginTop: "0.5rem", textAlign: "right",
              fontSize: "0.85rem", color: "#7c3aed", fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "flex-end",
              gap: "0.3rem"
            }}>
              Ver detalles <FaArrowRight size={12} />
            </div>
          </div>
        ))}
      </div>

      {/* Estados vacíos */}
      {filteredParalelos.length === 0 && paralelos.length > 0 && (
        <div style={{
          textAlign: "center", padding: "3rem", color: "#64748b",
          background: "#fff", borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
        }}>
          <FaSearch size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
          <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            No se encontraron paralelos
          </p>
          <p style={{ fontSize: "0.9rem" }}>
            Intenta con otros filtros o busca otro término
          </p>
        </div>
      )}

      {paralelos.length === 0 && (
        <div style={{
          textAlign: "center", padding: "4rem", color: "#64748b",
          background: "#fff", borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
        }}>
          <HiUserGroup size={64} style={{ marginBottom: "1rem", color: "#7c3aed", opacity: 0.5 }} />
          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a2744", marginBottom: "0.5rem" }}>
            No hay paralelos configurados
          </h3>
          <p style={{ fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            Crea tu primer paralelo asignando materias a docentes
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
            <FaPlus /> Crear Primer Paralelo
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