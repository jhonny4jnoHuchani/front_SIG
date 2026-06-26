import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUserTie, FaEnvelope, FaIdCard, FaBuilding, FaPlus, 
  FaTimes, FaSave, FaSearch,
  FaUserGraduate, FaChalkboardTeacher, FaUserCheck,
  FaUsers
} from 'react-icons/fa';
import api from "../api/client";

const DEPT_COLORS = {
  "Anatomía": "#dc2626",
  "Fisiologia": "#0891b2", 
  "Cirugia": "#7c3aed",
  default: "#64748b"
};

const DEPT_ICONS = {
  "Anatomía": FaUserTie,
  "Fisiologia": FaUserGraduate,
  "Cirugia": FaChalkboardTeacher,
  default: FaUserTie
};

const DEPT_GRADIENTS = {
  "Anatomía": "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
  "Fisiologia": "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
  "Cirugia": "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
  default: "linear-gradient(135deg, #64748b 0%, #94a3b8 100%)"
};

export default function Docentes() {
  const [docentes, setDocentes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [form, setForm] = useState({
    nombreCompleto: "",
    email: "",
    cedula: "",
    departamento: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepto, setFilterDepto] = useState("todos");
  const navigate = useNavigate();

  // Cargar docentes
  const cargarDocentes = () => {
    api.get("/docentes").then((r) => setDocentes(r.data.data || r.data));
  };

  useEffect(() => {
    cargarDocentes();
  }, []);

  // Crear docente
  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/docentes", form);
      setShowModal(false);
      setForm({ nombreCompleto: "", email: "", cedula: "", departamento: "" });
      cargarDocentes();
    } catch (error) {
      alert("Error al crear docente");
    }
    setIsSubmitting(false);
  };

  const handleOpenModal = () => {
    setForm({ nombreCompleto: "", email: "", cedula: "", departamento: "" });
    setShowModal(true);
  };

  // Filtrado
  const filteredDocentes = docentes.filter(d => {
    const matchesSearch = 
      d.nombreCompleto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.cedula?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepto = filterDepto === "todos" || d.departamento === filterDepto;
    return matchesSearch && matchesDepto;
  });

  // Obtener departamentos únicos
  const deptosUnicos = [...new Set(docentes.map(d => d.departamento).filter(Boolean))].sort();

  // Función helper para obtener el icono del departamento
  const getDeptIcon = (departamento) => {
    const IconComponent = DEPT_ICONS[departamento] || DEPT_ICONS.default;
    return <IconComponent size={32} />;
  };

  const getDeptIconSmall = (departamento) => {
    const IconComponent = DEPT_ICONS[departamento] || DEPT_ICONS.default;
    return <IconComponent size={40} />;
  };

  const getDeptIconCard = (departamento) => {
    const IconComponent = DEPT_ICONS[departamento] || DEPT_ICONS.default;
    const color = DEPT_COLORS[departamento] || DEPT_COLORS.default;
    return <IconComponent size={28} color={color} />;
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
              <FaChalkboardTeacher size={32} />
              Docentes
            </h2>
            <p style={{ margin: "0.5rem 0 0 0", opacity: 0.9, fontSize: "0.95rem" }}>
              <FaUsers style={{ marginRight: "0.5rem" }} />
              {docentes.length} docente{docentes.length !== 1 ? 's' : ''} registrado{docentes.length !== 1 ? 's' : ''}
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
            <FaPlus /> Nuevo Docente
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
            placeholder="Buscar por nombre, email o cédula..."
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
          <FaBuilding style={{
            position: "absolute", left: "1rem", top: "50%",
            transform: "translateY(-50%)", color: "#64748b",
            zIndex: 1, fontSize: "0.9rem"
          }} />
          <select
            value={filterDepto}
            onChange={(e) => setFilterDepto(e.target.value)}
            style={{
              padding: "0.75rem 1rem 0.75rem 2.5rem", borderRadius: "12px",
              border: "2px solid #e2e8f0", fontSize: "0.9rem",
              background: "#fff", cursor: "pointer",
              outline: "none", minWidth: "200px"
            }}
            onFocus={(e) => e.target.style.borderColor = "#2563eb"}
            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
          >
            <option value="todos">Todos los departamentos</option>
            {deptosUnicos.map(depto => (
              <option key={depto} value={depto}>{depto}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Modal Nuevo Docente */}
      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(5px)", padding: "1rem"
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: "#fff", borderRadius: "20px", width: "100%",
            maxWidth: "650px", maxHeight: "90vh", overflow: "auto",
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
                  <FaUserTie size={24} />
                  Nuevo Docente
                </h3>
                <p style={{ margin: "0.25rem 0 0 0", color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>
                  Registra un nuevo docente en el sistema
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
              
              {/* Vista previa del docente */}
              <div style={{
                background: "linear-gradient(135deg, #eff6ff, #f0f9ff)",
                borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem",
                border: "2px dashed #93c5fd", display: "flex",
                alignItems: "center", gap: "1.5rem"
              }}>
                <div style={{
                  width: "70px", height: "70px", borderRadius: "50%",
                  background: DEPT_GRADIENTS[form.departamento] || DEPT_GRADIENTS.default,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.8rem", color: "#fff", flexShrink: 0
                }}>
                  {getDeptIcon(form.departamento)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#1a2744", fontSize: "1.2rem", marginBottom: "0.25rem" }}>
                    {form.nombreCompleto || "Nombre del docente"}
                  </div>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.85rem", color: "#64748b" }}>
                    {form.email && (
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <FaEnvelope size={12} /> {form.email}
                      </span>
                    )}
                    {form.cedula && (
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <FaIdCard size={12} /> CI: {form.cedula}
                      </span>
                    )}
                    {form.departamento && (
                      <span style={{ 
                        display: "flex", alignItems: "center", gap: "0.3rem",
                        color: DEPT_COLORS[form.departamento] || DEPT_COLORS.default,
                        fontWeight: 600
                      }}>
                        <FaBuilding size={12} /> {form.departamento}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Campos */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>
                    <FaUserTie size={14} style={{ marginRight: "0.3rem" }} />
                    Nombre Completo
                  </label>
                  <input
                    type="text" required
                    value={form.nombreCompleto}
                    onChange={(e) => setForm({ ...form, nombreCompleto: e.target.value })}
                    placeholder="Ej: Dr. Juan Pérez"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    <FaEnvelope size={14} style={{ marginRight: "0.3rem" }} />
                    Email
                  </label>
                  <input
                    type="email" required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="juan.perez@example.com"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    <FaIdCard size={14} style={{ marginRight: "0.3rem" }} />
                    Cédula
                  </label>
                  <input
                    type="text" required
                    value={form.cedula}
                    onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                    placeholder="12345678"
                    style={inputStyle}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>
                    <FaBuilding size={14} style={{ marginRight: "0.3rem" }} />
                    Departamento
                  </label>
                  <select
                    value={form.departamento}
                    onChange={(e) => setForm({ ...form, departamento: e.target.value })}
                    required
                    style={inputStyle}
                  >
                    <option value="">Seleccionar departamento...</option>
                    <option value="Anatomía">Anatomía</option>
                    <option value="Fisiologia">Fisiología</option>
                    <option value="Cirugia">Cirugía</option>
                  </select>
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
                    <><FaSave size={16} /> Guardar Docente</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {selectedDocente && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(5px)", padding: "1rem"
        }} onClick={() => setSelectedDocente(null)}>
          <div style={{
            background: "#fff", borderRadius: "20px", width: "100%",
            maxWidth: "500px", overflow: "hidden",
            boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
            animation: "slideUp 0.3s ease-out"
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Header con gradiente del departamento */}
            <div style={{
              background: DEPT_GRADIENTS[selectedDocente.departamento] || DEPT_GRADIENTS.default,
              padding: "2rem", textAlign: "center", color: "#fff",
              position: "relative"
            }}>
              <button 
                onClick={() => setSelectedDocente(null)}
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
              <div style={{
                width: "80px", height: "80px", borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1rem"
              }}>
                {getDeptIconSmall(selectedDocente.departamento)}
              </div>
              <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>
                {selectedDocente.nombreCompleto}
              </h3>
              <div style={{
                display: "inline-block", marginTop: "0.5rem",
                padding: "0.3rem 1rem", borderRadius: "999px",
                background: "rgba(255,255,255,0.2)", fontSize: "0.9rem"
              }}>
                {selectedDocente.departamento}
              </div>
            </div>

            {/* Detalles */}
            <div style={{ padding: "2rem" }}>
              <div style={{
                background: "#f8fafc", padding: "1.5rem", borderRadius: "12px",
                border: "2px solid #e2e8f0", marginBottom: "1.5rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <FaEnvelope size={18} style={{ color: "#2563eb" }} />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Email</div>
                    <div style={{ fontWeight: 600, color: "#1a2744" }}>{selectedDocente.email}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <FaIdCard size={18} style={{ color: "#059669" }} />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Cédula</div>
                    <div style={{ fontWeight: 600, color: "#1a2744" }}>{selectedDocente.cedula}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  onClick={() => setSelectedDocente(null)}
                  style={{
                    flex: 1, padding: "0.75rem", background: "#f1f5f9",
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
                <button
                  onClick={() => {
                    setSelectedDocente(null);
                    navigate(`/asistencias?docenteId=${selectedDocente.id}&nombre=${selectedDocente.nombreCompleto}`);
                  }}
                  style={{
                    flex: 1, padding: "0.75rem",
                    background: "linear-gradient(135deg, #1a2744, #2d4a7a)",
                    color: "#fff", border: "none", borderRadius: "10px",
                    cursor: "pointer", fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: "0.5rem", transition: "all 0.2s"
                  }}
                >
                  <FaUserCheck size={14} />
                  Ver Asistencias
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de docentes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
        {filteredDocentes.map((d) => {
          const deptColor = DEPT_COLORS[d.departamento] || DEPT_COLORS.default;
          
          return (
            <div 
              key={d.id} 
              onClick={() => setSelectedDocente(d)}
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
                e.currentTarget.style.borderColor = deptColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)";
                e.currentTarget.style.borderColor = "#f1f5f9";
              }}
            >
              {/* Badge del departamento */}
              <div style={{
                position: "absolute", top: 0, right: 0,
                background: DEPT_GRADIENTS[d.departamento] || DEPT_GRADIENTS.default,
                color: "#fff", padding: "0.4rem 1rem",
                borderRadius: "0 16px 0 16px",
                fontSize: "0.75rem", fontWeight: 600,
                display: "flex", alignItems: "center", gap: "0.3rem"
              }}>
                <FaBuilding size={11} />
                {d.departamento}
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "start", gap: "0.75rem" }}>
                  <div style={{
                    width: "55px", height: "55px", borderRadius: "14px",
                    background: `${deptColor}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0
                  }}>
                    {getDeptIconCard(d.departamento)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ 
                      margin: 0, fontSize: "1.05rem", fontWeight: 700,
                      color: "#1a2744", lineHeight: "1.3",
                      overflow: "hidden", textOverflow: "ellipsis"
                    }}>
                      {d.nombreCompleto}
                    </h3>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "0.3rem",
                      marginTop: "0.25rem", padding: "0.2rem 0.6rem",
                      borderRadius: "999px", background: "#f0f9ff",
                      color: deptColor, fontSize: "0.75rem", fontWeight: 600
                    }}>
                      <FaIdCard size={10} />
                      CI: {d.cedula}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de contacto */}
              <div style={{
                padding: "1rem", background: "#f8fafc",
                borderRadius: "12px", marginBottom: "0.75rem"
              }}>
                <div style={{ 
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  fontSize: "0.85rem", color: "#64748b",
                  overflow: "hidden"
                }}>
                  <FaEnvelope size={14} style={{ color: "#2563eb", flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {d.email}
                  </span>
                </div>
              </div>

              {/* Botón de acción */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/asistencias?docenteId=${d.id}&nombre=${d.nombreCompleto}`);
                  }}
                  style={{
                    flex: 1, padding: "0.6rem", 
                    background: "linear-gradient(135deg, #1a2744, #2d4a7a)",
                    color: "#fff", border: "none", borderRadius: "8px",
                    cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: "0.5rem", transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.transform = "translateY(-1px)"}
                  onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                >
                  <FaUserCheck size={14} />
                  Ver Asistencias
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estados vacíos */}
      {filteredDocentes.length === 0 && docentes.length > 0 && (
        <div style={{
          textAlign: "center", padding: "3rem", color: "#64748b",
          background: "#fff", borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
        }}>
          <FaSearch size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
          <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            No se encontraron docentes
          </p>
          <p style={{ fontSize: "0.9rem" }}>
            Intenta con otros filtros o busca otro término
          </p>
        </div>
      )}

      {docentes.length === 0 && (
        <div style={{
          textAlign: "center", padding: "4rem", color: "#64748b",
          background: "#fff", borderRadius: "16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
        }}>
          <FaChalkboardTeacher size={64} style={{ marginBottom: "1rem", color: "#2563eb", opacity: 0.5 }} />
          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a2744", marginBottom: "0.5rem" }}>
            No hay docentes registrados
          </h3>
          <p style={{ fontSize: "0.95rem", marginBottom: "1.5rem" }}>
            Comienza agregando al primer docente del sistema
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
            <FaPlus /> Registrar Primer Docente
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