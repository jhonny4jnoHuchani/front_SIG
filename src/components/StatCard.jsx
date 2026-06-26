export default function StatCard({ label, value, color = "#2d4a8a", icon }) {
  return (
    <div style={{
      background: "#fff", borderRadius: "10px", padding: "1.5rem",
      borderTop: `4px solid ${color}`, boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
    }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{icon}</div>
      <div style={{ fontSize: "2rem", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>{label}</div>
    </div>
  );
}