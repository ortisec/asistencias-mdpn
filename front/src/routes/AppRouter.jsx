import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/layout/Layout';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Personas from '../pages/Personas/Personas';
import Asistencias from '../pages/Asistencias/Asistencias';
import Reportes from '../pages/Reportes/Reportes';
import Configuraciones from '../pages/Configuraciones/Configuraciones';
import Usuarios from '../pages/Usuarios/Usuarios';

export default function AppRouter() {
  return (
    <BrowserRouter>
      {/* AuthProvider DEBE ir dentro del BrowserRouter porque usa useNavigate */}
      <AuthProvider>
        <Routes>

          {/* --- RUTA PÚBLICA --- */}
          <Route path="/login" element={<Login />} />

          {/* --- RUTAS PRIVADAS (Envuelta en Layout) --- */}
          {/* El Layout en sí mismo requiere estar logueado (cualquier rol) */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>

            <Route index element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin', 'rrhh']}>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="personas" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin', 'rrhh']}>
                <Personas />
              </ProtectedRoute>
            } />

            <Route path="asistencias" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <Asistencias />
              </ProtectedRoute>
            } />

            <Route path="reportes" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin', 'rrhh']}>
                <Reportes />
              </ProtectedRoute>
            } />

            <Route path="configuraciones" element={
              <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                <Configuraciones />
              </ProtectedRoute>
            } />

            <Route path="usuarios" element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <Usuarios />
              </ProtectedRoute>
            } />

          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}