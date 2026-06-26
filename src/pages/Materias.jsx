import { useEffect, useState } from "react";
import { 
  FaBook, FaGraduationCap, FaStar, FaCalendar, FaSearch, 
  FaPlus, FaTimes, FaArrowRight, FaCode, FaLayerGroup,
  FaCheckCircle, FaInfoCircle, FaFilter
} from 'react-icons/fa';
import { MdSchool, MdCreditCard, MdDateRange } from 'react-icons/md';
import { HiAcademicCap, HiBookOpen } from 'react-icons/hi';
import { BiBookContent, BiSearchAlt2 } from 'react-icons/bi';
import { BsBookmarkStar, BsCalendarCheck } from 'react-icons/bs';
import api from "../api/client";

export default function Materias() {
  const [materias, setMaterias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    codigo: "",
    creditos: 5,
    semestre: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSemestre, setFilterSemestre] = useState("todos");

  const cargarMaterias = () => {
    api.get("/materias").then((r) => setMaterias(r.data.data || r.data));
  };

  useEffect(() => {
    cargarMaterias();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/materias", {
        nombre: form.nombre,
        codigo: form.codigo,
        creditos: parseInt(form.creditos),
        semestre: parseInt(form.semestre),
      });
      setShowModal(false);
      setForm({ nombre: "", codigo: "", creditos: 5, semestre: 1 });
      cargarMaterias();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Error al crear"));
    }
    setIsSubmitting(false);
  };

  const handleOpenModal = () => {
    setForm({ nombre: "", codigo: "", creditos: 5, semestre: 1 });
    setShowModal(true);
  };

  // Filtrado de materias
  const filteredMaterias = materias.filter(m => {
    const matchesSearch = m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemestre = filterSemestre === "todos" || m.semestre === parseInt(filterSemestre);
    return matchesSearch && matchesSemestre;
  });

  // Obtener semestres únicos para el filtro
  const semestresUnicos = [...new Set(materias.map(m => m.semestre))].sort((a, b) => a - b);

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
              <FaBook style={{ fontSize: "2rem" }} />
              Materias
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9, fontSize: "0.95rem" }}>
              <FaGraduationCap style={{ marginRight: "0.5rem" }} />
              {materias.length} materia{materias.length !== 1 ? 's' : ''} registrada{materias.length !== 1 ? 's' : ''}
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
            <FaPlus /> Nueva Materia
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
            placeholder="Buscar por nombre o código..."
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
          <FaFilter style={{
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
              outline: "none", minWidth: "200px"
            }}
            onFocus={(e) => e.target.style.borderColor = "#2563eb"}
            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
          >
            <option value="todos">
              <FaCalendar style={{ marginRight: "0.5rem" }} />
              Todos los semestres
            </option>
            {semestresUnicos.map(sem => (
              <option key={sem} value={sem}>Semestre {sem}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de materias mejorada */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
        {filteredMaterias.map((m) => (
          <div 
            key={m.id} 
            onClick={() => setSelectedMateria(m)}
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
              e.currentTarget.style.borderColor = "#2563eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)";
              e.currentTarget.style.borderColor = "#f1f5f9";
            }}
          >
            {/* Indicador de semestre */}
            <div style={{
              position: "absolute", top: 0, right: 0,
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "#fff", padding: "0.4rem 1rem",
              borderRadius: "0 16px 0 16px",
              fontSize: "0.8rem", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "0.3rem"
            }}>
              <FaCalendar size={12} />
              Sem {m.semestre}
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "start", gap: "0.75rem" }}>
                <div style={{
                  width: "50px", height: "50px", borderRadius: "12px",
                  background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.5rem"
                }}>
                  <HiBookOpen size={28} color="#2563eb" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    margin: 0, fontSize: "1.1rem", fontWeight: 700,
                    color: "#1a2744", lineHeight: "1.3"
                  }}>
                    {m.nombre}
                  </h3>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "0.3rem",
                    marginTop: "0.25rem", padding: "0.2rem 0.6rem",
                    borderRadius: "999px", background: "#eff6ff",
                    color: "#2563eb", fontSize: "0.75rem", fontWeight: 600
                  }}>
                    <FaCode size={10} />
                    {m.codigo}
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem", padding: "1rem",
              background: "#f8fafc", borderRadius: "12px"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ 
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "0.3rem", fontSize: "1.3rem", fontWeight: 700, color: "#2563eb"
                }}>
                  <FaStar size={18} />
                  {m.creditos}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
                  Créditos
                </div>
              </div>
              <div style={{ textAlign: "center", borderLeft: "1px solid #e2e8f0" }}>
                <div style={{ 
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "0.3rem", fontSize: "1.3rem", fontWeight: 700, color: "#7c3aed"
                }}>
                  <BsCalendarCheck size={18} />
                  {m.semestre}°
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>
                  Semestre
                </div>
              </div>
            </div>

            <div style={{
              marginTop: "1rem", textAlign: "right",
              fontSize: "0.8rem", color: "#2563eb", fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "flex-end",
              gap: "0.3rem"
            }}>
              Ver detalles <FaArrowRight size={12} />
            </div>
          </div>
        ))}
      </div>

      {/* Estado vacío */}
      {filteredMaterias.length === 0 && materias.length > 0 && (
        <div style={{
          textAlign: "center", padding: "3rem", color: "#64748b",
          background: "#fff", borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
        }}>
          <BiSearchAlt2 size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
          <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            No se encontraron materias
          </p>
          <p style={{ fontSize: "0.9rem" }}>
            Intenta con otros filtros o busca otro término
          </p>
        </div>
      )}

      {materias.length === 0 && (
        <div style={{
          textAlign: "center", padding: "4rem", color: "#64748b",
          background: "#fff", borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
        }}>
          <HiAcademicCap size={64} style={{ marginBottom: "1rem", color: "#2563eb", opacity: 0.5 }} />
          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a2744", marginBottom: "0.5rem" }}>
            No hay materias registradas
          </h3>
          <p style={{ fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            Comienza agregando tu primera materia al sistema
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
            <FaPlus /> Crear Primera Materia
          </button>
        </div>
      )}

      {/* MODAL PARA NUEVA MATERIA */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(5px)", padding: "1rem"
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: "#fff", borderRadius: "20px", width: "100%",
            maxWidth: "600px", maxHeight: "90vh", overflow: "auto",
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
                  <FaBook size={24} />
                  Nueva Materia
                </h3>
                <p style={{ margin: "0.25rem 0 0 0", color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>
                  Completa los datos para registrar una materia
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
              
              {/* Vista previa de la materia */}
              <div style={{
                background: "linear-gradient(135deg, #eff6ff, #f0f9ff)",
                borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem",
                border: "2px dashed #93c5fd", textAlign: "center"
              }}>
                <div style={{ marginBottom: "0.5rem" }}>
                  {form.nombre ? (
                    <HiBookOpen size={32} color="#2563eb" />
                  ) : (
                    <BiBookContent size={32} color="#94a3b8" />
                  )}
                </div>
                <div style={{ fontWeight: 700, color: "#1a2744", fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                  {form.nombre || "Nombre de la materia"}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  {form.codigo ? (
                    <><FaCode size={12} style={{ marginRight: "0.3rem" }} />{form.codigo}</>
                  ) : "Sin código"} • {form.creditos} créditos • Semestre {form.semestre}
                </div>
              </div>

              {/* Campos */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={labelStyle}>
                    <FaBook size={14} style={{ marginRight: "0.3rem" }} />
                    Nombre de la materia
                  </label>
                  <input
                    type="text" required
                    value={form.nombre}
                    onChange={(e) => setForm({...form, nombre: e.target.value})}
                    style={inputStyle}
                    placeholder="Ej: Anatomía Humana"
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    <FaCode size={14} style={{ marginRight: "0.3rem" }} />
                    Código
                  </label>
                  <input
                    type="text" required
                    value={form.codigo}
                    onChange={(e) => setForm({...form, codigo: e.target.value})}
                    style={inputStyle}
                    placeholder="Ej: MED-101"
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    <FaStar size={14} style={{ marginRight: "0.3rem" }} />
                    Créditos
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number" required min="1" max="20"
                      value={form.creditos}
                      onChange={(e) => setForm({...form, creditos: e.target.value})}
                      style={{ ...inputStyle, paddingRight: "3rem" }}
                    />
                    <span style={{
                      position: "absolute", right: "1rem", top: "50%",
                      transform: "translateY(-50%)", color: "#2563eb",
                      fontWeight: 600, fontSize: "0.85rem"
                    }}>
                      cr.
                    </span>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>
                    <FaCalendar size={14} style={{ marginRight: "0.3rem" }} />
                    Semestre
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number" required min="1" max="12"
                      value={form.semestre}
                      onChange={(e) => setForm({...form, semestre: e.target.value})}
                      style={{ ...inputStyle, paddingRight: "3rem" }}
                    />
                    <span style={{
                      position: "absolute", right: "1rem", top: "50%",
                      transform: "translateY(-50%)", color: "#7c3aed",
                      fontWeight: 600, fontSize: "0.85rem"
                    }}>
                      sem.
                    </span>
                  </div>
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
                    <><FaTimes size={14} /> Guardando...</>
                  ) : (
                    <><BsBookmarkStar size={16} /> Guardar Materia</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLE */}
      {selectedMateria && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(5px)", padding: "1rem"
        }} onClick={() => setSelectedMateria(null)}>
          <div style={{
            background: "#fff", borderRadius: "20px", width: "100%",
            maxWidth: "450px", overflow: "hidden",
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
                onClick={() => setSelectedMateria(null)}
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
              <HiAcademicCap size={48} style={{ marginBottom: "1rem" }} />
              <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>
                {selectedMateria.nombre}
              </h3>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "0.3rem",
                marginTop: "0.5rem", padding: "0.3rem 1rem",
                borderRadius: "999px", background: "rgba(255,255,255,0.2)",
                fontSize: "0.85rem"
              }}>
                <FaCode size={12} />
                {selectedMateria.codigo}
              </div>
            </div>

            {/* Detalles */}
            <div style={{ padding: "2rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{
                  background: "#f8fafc", padding: "1.25rem",
                  borderRadius: "12px", textAlign: "center",
                  border: "2px solid #e2e8f0"
                }}>
                  <FaStar size={24} style={{ color: "#2563eb", marginBottom: "0.5rem" }} />
                  <div style={{ fontSize: "2rem", fontWeight: 700, color: "#2563eb" }}>
                    {selectedMateria.creditos}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>
                    Créditos
                  </div>
                </div>
                <div style={{
                  background: "#f8fafc", padding: "1.25rem",
                  borderRadius: "12px", textAlign: "center",
                  border: "2px solid #e2e8f0"
                }}>
                  <FaCalendar size={24} style={{ color: "#7c3aed", marginBottom: "0.5rem" }} />
                  <div style={{ fontSize: "2rem", fontWeight: 700, color: "#7c3aed" }}>
                    {selectedMateria.semestre}°
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>
                    Semestre
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedMateria(null)}
                style={{
                  marginTop: "1.5rem", width: "100%",
                  padding: "0.75rem", background: "#f1f5f9",
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