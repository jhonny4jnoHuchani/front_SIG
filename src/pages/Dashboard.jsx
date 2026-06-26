import { useEffect, useState } from "react";
import api from "../api/client";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/dashboard").then((r) => setData(r.data.data));
  }, []);

  if (!data) return <p style={{ color: "#64748b" }}>Cargando...</p>;

  return (
    <div>
      <h2 style={{ color: "#1a2744", marginBottom: "1.5rem" }}>Dashboard</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        <StatCard icon="👨‍⚕️" label="Docentes" value={data.totalDocentes} color="#2d4a8a" />
        <StatCard icon="📚" label="Materias" value={data.totalMaterias} color="#0891b2" />
        <StatCard icon="✅" label="Asistencias válidas" value={data.validos} color="#16a34a" />
        <StatCard icon="❌" label="Rechazados" value={data.rechazados} color="#dc2626" />
        <StatCard icon="⚠️" label="Abandonos" value={data.abandonos} color="#d97706" />
        <StatCard icon="📊" label="% Global" value={`${data.porcentajeGlobal}%`} color="#7c3aed" />
      </div>
    </div>
  );
}