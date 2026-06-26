import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { 
  FaThLarge, FaMapMarkerAlt, FaBook, FaUserMd, 
  FaUsers, FaClock, FaClipboardCheck, FaSignOutAlt,
  FaHospital, FaGraduationCap, FaChalkboardTeacher,
  FaUserGraduate, FaCalendarAlt, FaClinicMedical,
  FaStethoscope, FaHeartbeat
} from 'react-icons/fa';
import { 
  MdDashboard, MdLocationOn, MdMenuBook, 
  MdPerson, MdGroup, MdSchedule, MdAssignment,
  MdLogout, MdSchool, MdLocalHospital
} from 'react-icons/md';
import { 
  HiAcademicCap, HiClock, HiUserGroup,
  HiLocationMarker, HiBookOpen, HiClipboardList
} from 'react-icons/hi';
import { useState, useEffect } from "react";

const links = [
  { 
    to: "/dashboard", 
    label: "Dashboard", 
    icon: MdDashboard,
    color: "#60a5fa",
    description: "Panel principal"
  },
  { 
    to: "/ubicaciones", 
    label: "Ubicaciones", 
    icon: HiLocationMarker,
    color: "#34d399",
    description: "Puntos de validación"
  },
  { 
    to: "/materias", 
    label: "Materias", 
    icon: HiBookOpen,
    color: "#fbbf24",
    description: "Plan de estudios"
  },
  { 
    to: "/docentes", 
    label: "Docentes", 
    icon: FaUserMd,
    color: "#f472b6",
    description: "Personal académico"
  },
  { 
    to: "/paralelos", 
    label: "Paralelos", 
    icon: HiUserGroup,
    color: "#a78bfa",
    description: "Grupos y asignaciones"
  },
  { 
    to: "/horarios", 
    label: "Horarios", 
    icon: HiClock,
    color: "#38bdf8",
    description: "Programación académica"
  },
  { 
    to: "/asistencias", 
    label: "Asistencias", 
    icon: HiClipboardList,
    color: "#fb923c",
    description: "Control de asistencia"
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
  }, []);

  function cerrarSesion() {
    localStorage.clear();
    navigate("/login");
  }

  const isActive = (path) => location.pathname === path;

  return (
    <aside style={{
      width: collapsed ? "80px" : "260px",
      background: "linear-gradient(180deg, #0f172a 0%, #1a2744 50%, #1e3a5f 100%)",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      padding: "1.5rem 0",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      boxShadow: "4px 0 20px rgba(0,0,0,0.3)",
      minHeight: "100vh"
    }}>
      
      {/* Botón de colapsar */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: "absolute",
          top: "1rem",
          right: "-12px",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: "#60a5fa",
          border: "2px solid #fff",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.8rem",
          zIndex: 10,
          transition: "all 0.3s",
          transform: collapsed ? "rotate(180deg)" : "rotate(0deg)"
        }}
        onMouseEnter={(e) => e.target.style.background = "#3b82f6"}
        onMouseLeave={(e) => e.target.style.background = "#60a5fa"}
      >
        {collapsed ? "→" : "←"}
      </button>

      {/* Header / Logo */}
      <div style={{
        padding: collapsed ? "0 1rem 2rem" : "0 1.5rem 2rem",
        textAlign: collapsed ? "center" : "left",
        transition: "all 0.3s"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: collapsed ? "0" : "0.75rem",
          marginBottom: "0.75rem",
          justifyContent: collapsed ? "center" : "flex-start"
        }}>
          <div style={{
            width: collapsed ? "40px" : "45px",
            height: collapsed ? "40px" : "45px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: collapsed ? "1.2rem" : "1.3rem",
            transition: "all 0.3s",
            flexShrink: 0
          }}>
            <FaStethoscope size={collapsed ? 20 : 22} />
          </div>
          {!collapsed && (
            <div>
              <div style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "#60a5fa",
                letterSpacing: "0.5px"
              }}>
                Medicina UPEA
              </div>
              <div style={{
                fontSize: "0.65rem",
                color: "#94a3b8",
                marginTop: "0.15rem",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}>
                Sistema de Asistencia
              </div>
            </div>
          )}
        </div>

        {/* Perfil de usuario */}
        {!collapsed && user.nombreCompleto && (
          <div style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "10px",
            padding: "0.75rem",
            marginTop: "1rem",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f472b6, #ec4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                fontWeight: 700
              }}>
                {user.nombreCompleto?.charAt(0) || "U"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#e2e8f0",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                  {user.nombreCompleto}
                </div>
                <div style={{
                  fontSize: "0.65rem",
                  color: "#64748b",
                  marginTop: "0.1rem"
                }}>
                  Administrador
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navegación */}
      <nav style={{ 
        flex: 1, 
        padding: collapsed ? "0 0.5rem" : "0 0.75rem",
        transition: "all 0.3s"
      }}>
        {links.map((l) => {
          const active = isActive(l.to);
          const hovered = hoveredLink === l.to;
          
          return (
            <NavLink 
              key={l.to} 
              to={l.to}
              onMouseEnter={() => setHoveredLink(l.to)}
              onMouseLeave={() => setHoveredLink(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: collapsed ? "0" : "0.85rem",
                padding: collapsed ? "0.75rem" : "0.75rem 1rem",
                marginBottom: "0.3rem",
                textDecoration: "none",
                color: active ? "#fff" : "#94a3b8",
                background: active 
                  ? `linear-gradient(135deg, ${l.color}30, ${l.color}15)` 
                  : hovered 
                    ? "rgba(255,255,255,0.05)" 
                    : "transparent",
                borderRadius: "10px",
                borderLeft: active ? `3px solid ${l.color}` : "3px solid transparent",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                justifyContent: collapsed ? "center" : "flex-start"
              }}
            >
              {/* Indicador activo */}
              {active && !collapsed && (
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "3px",
                  height: "60%",
                  background: l.color,
                  borderRadius: "0 3px 3px 0"
                }} />
              )}

              {/* Icono */}
              <div style={{
                width: collapsed ? "36px" : "38px",
                height: collapsed ? "36px" : "38px",
                borderRadius: "10px",
                background: active 
                  ? `${l.color}25` 
                  : "rgba(255,255,255,0.03)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                flexShrink: 0
              }}>
                <l.icon 
                  size={collapsed ? 20 : 18} 
                  color={active ? l.color : "#94a3b8"}
                  style={{ transition: "all 0.2s" }}
                />
              </div>

              {/* Label */}
              {!collapsed && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: "0.85rem",
                    fontWeight: active ? 600 : 500,
                    color: active ? "#fff" : "#cbd5e1",
                    transition: "all 0.2s"
                  }}>
                    {l.label}
                  </div>
                  {active && (
                    <div style={{
                      fontSize: "0.65rem",
                      color: l.color,
                      marginTop: "0.1rem",
                      fontWeight: 500
                    }}>
                      {l.description}
                    </div>
                  )}
                </div>
              )}

              {/* Indicador de activo */}
              {active && collapsed && (
                <div style={{
                  position: "absolute",
                  right: "0.5rem",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: l.color
                }} />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sección de ayuda */}
      {!collapsed && (
        <div style={{
          margin: "0 0.75rem 1rem",
          padding: "1rem",
          background: "linear-gradient(135deg, rgba(96,165,250,0.1), rgba(59,130,246,0.05))",
          borderRadius: "12px",
          border: "1px solid rgba(96,165,250,0.2)"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.5rem"
          }}>
            <FaHeartbeat size={16} color="#60a5fa" />
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#e2e8f0" }}>
              ¿Necesitas ayuda?
            </span>
          </div>
          <p style={{
            fontSize: "0.7rem",
            color: "#94a3b8",
            margin: "0 0 0.5rem 0",
            lineHeight: "1.4"
          }}>
            Consulta el manual de uso o contacta al administrador del sistema.
          </p>
        </div>
      )}

      {/* Botón de cerrar sesión */}
      <div style={{
        padding: collapsed ? "0 0.5rem" : "0 0.75rem",
        transition: "all 0.3s"
      }}>
        <button 
          onClick={cerrarSesion} 
          style={{
            width: "100%",
            padding: collapsed ? "0.65rem" : "0.7rem 1rem",
            background: "rgba(220,38,38,0.15)",
            color: "#fca5a5",
            border: "1px solid rgba(220,38,38,0.3)",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: collapsed ? "0" : "0.65rem",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(220,38,38,0.25)";
            e.target.style.borderColor = "rgba(220,38,38,0.5)";
            e.target.style.color = "#fecaca";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(220,38,38,0.15)";
            e.target.style.borderColor = "rgba(220,38,38,0.3)";
            e.target.style.color = "#fca5a5";
          }}
        >
          <FaSignOutAlt size={collapsed ? 18 : 16} />
          {!collapsed && "Cerrar sesión"}
        </button>
      </div>

      {/* Versión */}
      {!collapsed && (
        <div style={{
          textAlign: "center",
          padding: "1rem 0 0",
          fontSize: "0.65rem",
          color: "#475569"
        }}>
          v1.0.0 · UPEA 2026
        </div>
      )}
    </aside>
  );
}