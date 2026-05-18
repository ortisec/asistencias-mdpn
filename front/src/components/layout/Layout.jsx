import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth(); // Extraemos el usuario actual y la función logout

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* MENÚ LATERAL (Sidebar) */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white tracking-wider">MuniAsistencia</h1>
          <p className="text-xs text-blue-400 mt-1 uppercase">Rol: {user?.rol}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {/* Aquí aplicas la lógica visual para ocultar botones según el rol */}
          <Link to="/" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded">Dashboard</Link>
          
          <Link to="/personas" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded">Personal</Link>
          
          {user?.rol === 'superadmin' && (
            <Link to="/asistencias" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded">Asistencias</Link>
          )}
          
          <Link to="/reportes" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded">Reportes</Link>
          
          {['superadmin', 'admin'].includes(user?.rol) && (
            <Link to="/configuraciones" className="block px-4 py-2 text-gray-300 hover:bg-gray-800 rounded">Configuraciones</Link>
          )}
        </nav>

        {/* BOTÓN DE CERRAR SESIÓN AL FINAL DEL MENÚ */}
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 bg-red-900/10 border border-red-900/50 rounded hover:bg-red-900/30 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}