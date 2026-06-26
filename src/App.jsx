import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Docentes from "./pages/Docentes";
import Asistencias from "./pages/Asistencias";
import Ubicaciones from "./pages/Ubicaciones";   // ← NUEVO
import Materias from "./pages/Materias";
import Paralelos from "./pages/Paralelos";
import Horarios from "./pages/Horarios";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="docentes" element={<Docentes />} />
          <Route path="materias" element={<Materias />} /> 
          <Route path="ubicaciones" element={<Ubicaciones />} />  {/* ← NUEVO */}
          <Route path="asistencias" element={<Asistencias />} />
          <Route path="paralelos" element={<Paralelos />} />
          <Route path="horarios" element={<Horarios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}