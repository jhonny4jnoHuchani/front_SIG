import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaEnvelope, FaLock, FaSignInAlt, FaUserMd, 
  FaSpinner, FaExclamationCircle, FaEye, FaEyeSlash,
  FaHeartbeat, FaStethoscope, FaMicroscope, FaPills,
  FaBrain, FaTooth, FaBone, FaLungs, FaStarOfLife
} from 'react-icons/fa';
import api from "../api/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fase, setFase] = useState(0); // 0=inicio, 1=saltando, 2=armado, 3=completo
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const navigate = useNavigate();

  // Secuencia de animación
  useEffect(() => {
    // Fase 0: Todo vacío por 0.5s
    const t0 = setTimeout(() => setFase(1), 500);
    // Fase 1: Card salta desde abajo (1s)
    const t1 = setTimeout(() => setFase(2), 1500);
    // Fase 2: Piezas se arman una por una (1.5s)
    const t2 = setTimeout(() => setFase(3), 3000);
    
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Calcular visibilidad de cada pieza
  const piezaVisible = (index) => {
    if (fase < 2) return false;
    if (fase === 2) {
      const delays = [0, 200, 400, 600, 800];
      return Date.now() - startTimeRef.current > delays[index];
    }
    return true;
  };

  const startTimeRef = { current: Date.now() };
  const [piezasVisibles, setPiezasVisibles] = useState([false, false, false, false, false]);

  useEffect(() => {
    if (fase === 2) {
      startTimeRef.current = Date.now();
      const delays = [0, 250, 500, 750, 1000];
      const timers = delays.map((delay, i) => 
        setTimeout(() => {
          setPiezasVisibles(prev => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, delay)
      );
      return () => timers.forEach(clearTimeout);
    }
    if (fase === 3) {
      setPiezasVisibles([true, true, true, true, true]);
    }
  }, [fase]);

  const handleMouseMove = (e) => {
    const card = document.getElementById('loginCard');
    if (card) {
      const rect = card.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height
      });
    }
  };

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.data.usuario));
      navigate("/dashboard");
    } catch {
      setError("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  }

  // Piezas flotantes del fondo
  const piezasFondo = [
    { icon: FaStethoscope, color: "#ef4444", x: "5%", y: "8%", delay: "0s", size: 26 },
    { icon: FaHeartbeat, color: "#dc2626", x: "92%", y: "12%", delay: "0.4s", size: 22 },
    { icon: FaMicroscope, color: "#2563eb", x: "8%", y: "85%", delay: "0.8s", size: 30 },
    { icon: FaBrain, color: "#f59e0b", x: "90%", y: "80%", delay: "1.2s", size: 24 },
    { icon: FaPills, color: "#7c3aed", x: "3%", y: "45%", delay: "0.6s", size: 20 },
    { icon: FaTooth, color: "#06b6d4", x: "95%", y: "48%", delay: "1s", size: 28 },
    { icon: FaBone, color: "#84cc16", x: "15%", y: "92%", delay: "0.3s", size: 22 },
    { icon: FaLungs, color: "#ec4899", x: "88%", y: "15%", delay: "0.9s", size: 26 },
  ];

  return (
    <div style={styles.fondo} onMouseMove={handleMouseMove}>
      {/* Grid de fondo */}
      <div style={styles.grid} />

      {/* Piezas flotantes - aparecen después */}
      <div style={{ ...styles.floatingContainer, opacity: fase >= 2 ? 1 : 0, transition: "opacity 1s ease 1s" }}>
        {piezasFondo.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x, top: p.y,
              animation: `floatPiece 7s ease-in-out ${p.delay} infinite`,
              zIndex: 1, pointerEvents: "none",
              filter: "drop-shadow(0 0 10px rgba(255,255,255,0.08))"
            }}
          >
            <p.icon size={p.size} color={p.color} style={{ opacity: 0.25 }} />
          </div>
        ))}
      </div>

      {/* Card que salta desde abajo */}
      <div
        id="loginCard"
        style={{
          ...styles.card,
          // Animación de salto desde abajo
          transform: fase === 0
            ? "translateY(120vh) scale(0.5) rotate(10deg)"
            : fase === 1
            ? "translateY(0) scale(1) rotate(0deg)"
            : `perspective(1200px) rotateY(${(mousePos.x - 0.5) * 4}deg) rotateX(${(0.5 - mousePos.y) * 4}deg)`,
          opacity: fase === 0 ? 0 : 1,
          transition: fase === 1 
            ? "all 1s cubic-bezier(0.34, 1.56, 0.64, 1)" 
            : "transform 0.15s ease-out, box-shadow 0.3s ease",
          boxShadow: fase >= 2
            ? `
              0 0 0 3px rgba(96, 165, 250, 0.1),
              0 0 60px rgba(37, 99, 235, 0.08),
              0 30px 80px rgba(0, 0, 0, 0.6),
              inset 0 1px 0 rgba(255,255,255,0.03)
            `
            : "0 30px 80px rgba(0, 0, 0, 0.6)"
        }}
      >
        {/* Conectores tipo puzzle */}
        {fase >= 2 && (
          <>
            <div style={{ ...styles.conector, top: "-14px", left: "20%" }}>
              <div style={styles.conectorInner} />
            </div>
            <div style={{ ...styles.conector, top: "-14px", right: "25%", transform: "rotate(180deg)" }}>
              <div style={styles.conectorInner} />
            </div>
            <div style={{ ...styles.conector, bottom: "-14px", left: "30%", transform: "rotate(180deg)" }}>
              <div style={styles.conectorInner} />
            </div>
            <div style={{ ...styles.conector, bottom: "-14px", right: "20%" }}>
              <div style={styles.conectorInner} />
            </div>
            <div style={{ ...styles.conector, left: "-14px", top: "25%", transform: "rotate(90deg)" }}>
              <div style={styles.conectorInner} />
            </div>
            <div style={{ ...styles.conector, right: "-14px", top: "30%", transform: "rotate(-90deg)" }}>
              <div style={styles.conectorInner} />
            </div>
            <div style={styles.hexGlow} />
            <div style={{ ...styles.hexSmall, top: "10px", left: "15px" }} />
            <div style={{ ...styles.hexSmall, top: "10px", right: "15px" }} />
            <div style={{ ...styles.hexSmall, bottom: "10px", left: "15px" }} />
            <div style={{ ...styles.hexSmall, bottom: "10px", right: "15px" }} />
          </>
        )}

        {/* Pieza 1: Logo - Cae desde arriba */}
        <div style={{
          ...styles.piece,
          opacity: piezasVisibles[0] ? 1 : 0,
          transform: piezasVisibles[0] ? "translateY(0)" : "translateY(-60px)",
          transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}>
          <div style={styles.logoWrapper}>
            <div style={styles.logoAnillo} />
            <div style={styles.logoHex}>
              <FaStarOfLife size={14} color="rgba(255,255,255,0.5)" style={{ position: "absolute", top: "-8px" }} />
              <FaUserMd size={30} color="#fff" />
            </div>
          </div>
          <h1 style={styles.title}>MediCheck</h1>
          <div style={styles.badge}>
            <FaHeartbeat size={10} color="#ef4444" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
            <span>UPEA · Medicina</span>
          </div>
        </div>

        {/* Pieza 2: Input Email */}
        <div style={{
          ...styles.piece,
          opacity: piezasVisibles[1] ? 1 : 0,
          transform: piezasVisibles[1] ? "translateX(0)" : "translateX(-40px)",
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FaEnvelope size={11} /> Email institucional
            </label>
            <div style={styles.inputWrapper}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@medicina.edu.bo"
                required
                style={styles.input}
              />
            </div>
          </div>
        </div>

        {/* Pieza 3: Input Password */}
        <div style={{
          ...styles.piece,
          opacity: piezasVisibles[2] ? 1 : 0,
          transform: piezasVisibles[2] ? "translateX(0)" : "translateX(40px)",
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <FaLock size={11} /> Contraseña
            </label>
            <div style={{ ...styles.inputWrapper, position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ ...styles.input, paddingRight: "3rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Pieza 4: Error */}
        <div style={{
          ...styles.piece,
          opacity: piezasVisibles[3] ? 1 : 0,
          transition: "all 0.5s ease",
          minHeight: error ? "auto" : "0px"
        }}>
          {error && (
            <div style={styles.error}>
              <FaExclamationCircle size={13} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Pieza 5: Botón */}
        <div style={{
          ...styles.piece,
          opacity: piezasVisibles[4] ? 1 : 0,
          transform: piezasVisibles[4] ? "translateY(0)" : "translateY(40px)",
          transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}>
          <form onSubmit={handleLogin}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                transform: loading ? "scale(0.98)" : "scale(1)"
              }}
            >
              {loading ? (
                <>
                  <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                  Verificando...
                </>
              ) : (
                <>
                  <FaSignInAlt />
                  Ingresar al Sistema
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={styles.footerContainer}>
          <p style={styles.footer}>© 2026 Facultad de Medicina — UPEA</p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes floatPiece {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-15px) rotate(5deg) scale(1.05); }
          50% { transform: translateY(-8px) rotate(-3deg) scale(0.95); }
          75% { transform: translateY(-20px) rotate(2deg) scale(1.02); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
        
        @keyframes hexGlowAnim {
          0%, 100% { opacity: 0.3; transform: rotate(0deg); }
          50% { opacity: 0.6; transform: rotate(180deg); }
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Inter', 'Segoe UI', sans-serif;
          background: #060b14;
        }
      `}</style>
    </div>
  );
}

const styles = {
  fondo: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(ellipse at 50% 0%, #1a2744 0%, #0a0f1a 70%)",
    padding: "2rem",
    position: "relative",
    overflow: "hidden"
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(96, 165, 250, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(96, 165, 250, 0.02) 1px, transparent 1px)
    `,
    backgroundSize: "50px 50px",
    zIndex: 0
  },
  floatingContainer: {
    position: "absolute",
    inset: 0,
    zIndex: 1
  },
  card: {
    background: "linear-gradient(160deg, rgba(20,35,60,0.95) 0%, rgba(10,18,30,0.98) 100%)",
    border: "2px solid rgba(96, 165, 250, 0.12)",
    borderRadius: "28px",
    padding: "2.2rem 1.8rem 1.5rem",
    width: "100%",
    maxWidth: "410px",
    position: "relative",
    zIndex: 10,
    clipPath: `polygon(
      8% 0%, 92% 0%, 
      100% 8%, 100% 92%, 
      92% 100%, 8% 100%, 
      0% 92%, 0% 8%
    )`
  },
  conector: {
    position: "absolute",
    width: "28px",
    height: "16px",
    background: "linear-gradient(135deg, #1e3a5f, #2563eb)",
    borderRadius: "10px",
    zIndex: 3,
    boxShadow: "0 3px 12px rgba(37, 99, 235, 0.4)",
    border: "2px solid rgba(96, 165, 250, 0.4)"
  },
  conectorInner: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#0a0f1a",
    margin: "1px auto",
    border: "1px solid rgba(96, 165, 250, 0.3)"
  },
  hexGlow: {
    position: "absolute",
    inset: "-2px",
    borderRadius: "30px",
    background: "transparent",
    border: "1px solid rgba(96, 165, 250, 0.06)",
    animation: "hexGlowAnim 8s linear infinite",
    pointerEvents: "none",
    zIndex: -1
  },
  hexSmall: {
    position: "absolute",
    width: "12px",
    height: "12px",
    background: "rgba(96, 165, 250, 0.15)",
    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
  },
  piece: {
    marginBottom: "0.3rem"
  },
  logoWrapper: {
    position: "relative",
    display: "inline-block",
    marginBottom: "0.8rem",
    textAlign: "center",
    width: "100%"
  },
  logoAnillo: {
    position: "absolute",
    inset: "-7px",
    borderRadius: "50%",
    border: "2px solid rgba(96, 165, 250, 0.15)",
    animation: "pulse 2.5s ease-in-out infinite",
    left: "50%",
    transform: "translateX(-50%)",
    width: "82px",
    height: "82px"
  },
  logoHex: {
    width: "68px",
    height: "68px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #1a2744, #2563eb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 35px rgba(37, 99, 235, 0.35)",
    position: "relative",
    margin: "0 auto"
  },
  title: {
    fontSize: "1.4rem",
    fontWeight: 800,
    color: "#e2e8f0",
    marginBottom: "0.4rem",
    letterSpacing: "-0.5px",
    textAlign: "center"
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.2rem 0.8rem",
    borderRadius: "999px",
    background: "rgba(96, 165, 250, 0.08)",
    border: "1px solid rgba(96, 165, 250, 0.15)",
    fontSize: "0.68rem",
    color: "#93c5fd",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "1rem"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    marginBottom: "0.5rem"
  },
  label: {
    fontSize: "0.73rem",
    fontWeight: 600,
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  inputWrapper: {
    position: "relative",
    width: "100%"
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: "14px",
    border: "2px solid rgba(96, 165, 250, 0.12)",
    fontSize: "0.88rem",
    color: "#e2e8f0",
    background: "rgba(10, 16, 28, 0.5)",
    outline: "none",
    transition: "all 0.3s",
    fontFamily: "'Inter', sans-serif"
  },
  eyeBtn: {
    position: "absolute",
    right: "0.6rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#64748b",
    cursor: "pointer",
    padding: "0.4rem",
    borderRadius: "6px",
    zIndex: 2
  },
  error: {
    background: "rgba(220, 38, 38, 0.08)",
    color: "#f87171",
    padding: "0.7rem 1rem",
    borderRadius: "10px",
    fontSize: "0.78rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    border: "1px solid rgba(220, 38, 38, 0.25)"
  },
  button: {
    width: "100%",
    padding: "0.8rem",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    fontSize: "0.9rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 6px 25px rgba(37, 99, 235, 0.3)",
    fontFamily: "'Inter', sans-serif",
    marginTop: "0.8rem"
  },
  footerContainer: {
    textAlign: "center",
    marginTop: "1rem",
    opacity: 0.5
  },
  footer: {
    fontSize: "0.65rem",
    color: "#64748b",
    letterSpacing: "0.3px"
  }
};