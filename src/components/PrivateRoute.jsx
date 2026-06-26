import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function PrivateRoute() {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f8" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}