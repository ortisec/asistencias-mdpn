import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/Dashboard/Dashboard';
import Personas from '../pages/Personas/Personas';
import Asistencias from '../pages/Asistencias/Asistencias';
import Reportes from '../pages/Reportes/Reportes';
import Configuraciones from '../pages/Configuraciones/Configuraciones';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="personas" element={<Personas />} />
          <Route path="asistencias" element={<Asistencias />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="configuraciones" element={<Configuraciones />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}