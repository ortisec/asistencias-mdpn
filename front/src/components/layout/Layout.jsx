import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  // Estado para controlar si el menú está abierto o cerrado en versión móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return location.pathname === path 
      ? 'bg-gray-800 text-white border-l-4 border-blue-500' 
      : 'text-gray-400 hover:bg-gray-800 hover:text-white border-l-4 border-transparent';
  };

  // Función para cerrar el menú móvil al hacer clic en un enlace
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    // Contenedor principal: Altura fija de la pantalla, sin scroll general (h-screen, overflow-hidden)
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      
      {/* ========================================
        MENÚ MÓVIL: FONDO OSCURO (Overlay)
        ========================================
      */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* ========================================
        MENÚ LATERAL (Sidebar)
        ========================================
        En desktop (lg): Ancho fijo, siempre visible (static).
        En móvil: Posición absoluta, se desliza desde la izquierda (-translate-x-full a translate-x-0).
      */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        
        {/* Cabecera del Menú (Fija arriba) */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wider leading-tight">Muni<span className="text-blue-500">Asistencia</span></h1>
              <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-widest mt-0.5">{user?.rol}</p>
            </div>
          </div>
          {/* Botón de cerrar (solo visible en móvil) */}
          <button onClick={closeMobileMenu} className="lg:hidden text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Navegación (Scroll independiente) */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          
          <Link to="/" onClick={closeMobileMenu} className={`flex items-center gap-3 px-4 py-2.5 rounded-r-lg transition-colors group ${isActive('/')}`}>
            <svg className={`w-5 h-5 transition-colors shrink-0 ${location.pathname === '/' ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="font-medium text-sm truncate">Dashboard</span>
          </Link>
          
          <Link to="/personas" onClick={closeMobileMenu} className={`flex items-center gap-3 px-4 py-2.5 rounded-r-lg transition-colors group ${isActive('/personas')}`}>
            <svg className={`w-5 h-5 transition-colors shrink-0 ${location.pathname === '/personas' ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-medium text-sm truncate">Personal</span>
          </Link>
          
          {user?.rol === 'superadmin' && (
            <Link to="/asistencias" onClick={closeMobileMenu} className={`flex items-center gap-3 px-4 py-2.5 rounded-r-lg transition-colors group ${isActive('/asistencias')}`}>
              <svg className={`w-5 h-5 transition-colors shrink-0 ${location.pathname === '/asistencias' ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-sm truncate">Control de Asistencia</span>
            </Link>
          )}
          
          <Link to="/reportes" onClick={closeMobileMenu} className={`flex items-center gap-3 px-4 py-2.5 rounded-r-lg transition-colors group ${isActive('/reportes')}`}>
            <svg className={`w-5 h-5 transition-colors shrink-0 ${location.pathname === '/reportes' ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium text-sm truncate">Reportes y Ranking</span>
          </Link>
          
          {['superadmin', 'admin'].includes(user?.rol) && (
            <Link to="/configuraciones" onClick={closeMobileMenu} className={`flex items-center gap-3 px-4 py-2.5 rounded-r-lg transition-colors group ${isActive('/configuraciones')}`}>
              <svg className={`w-5 h-5 transition-colors shrink-0 ${location.pathname === '/configuraciones' ? 'text-blue-400' : 'text-gray-500 group-hover:text-blue-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium text-sm truncate">Configuraciones</span>
            </Link>
          )}

          {user?.rol === 'superadmin' && (
            <div className="pt-4 mt-4 border-t border-gray-800/50">
              <Link to="/usuarios" onClick={closeMobileMenu} className={`flex items-center gap-3 px-4 py-2.5 rounded-r-lg transition-colors group ${isActive('/usuarios')}`}>
                <svg className={`w-5 h-5 transition-colors shrink-0 ${location.pathname === '/usuarios' ? 'text-purple-400' : 'text-gray-500 group-hover:text-purple-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-medium text-sm truncate">Gestión de Cuentas</span>
              </Link>
            </div>
          )}

        </nav>

        {/* Zona Inferior: Cierre de sesión y Firmas Dobles (Fija abajo) */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/50 shrink-0">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-400 bg-red-900/10 border border-red-900/50 rounded-lg hover:bg-red-900/40 hover:border-red-500/50 transition-all duration-200 mb-5 group"
          >
            <svg className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="truncate">Cerrar Sesión</span>
          </button>
          
          <div className="text-center pb-1">
            <p className="text-[9px] text-gray-600 uppercase tracking-widest font-semibold">
              Desarrollado por
            </p>
            <div className="flex items-center justify-center gap-2.5 mt-1">
              <a href="https://ortisec.site" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1" title="Visitar Sitio Web Profesional">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
                </svg>
                Sitio Web
              </a>
              <span className="text-gray-800 text-xs select-none">|</span>
              <a href="https://github.com/ortisec" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1" title="Ver Repositorios en GitHub">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================
        ÁREA DE CONTENIDO (Main Content)
        ========================================
        Ocupa el resto del espacio (flex-1).
        Tiene su propio scroll interno (overflow-y-auto).
      */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Barra superior (Topbar) - Solo visible en móvil para abrir el menú */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-gray-950 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h1 className="text-base font-bold text-white">Muni<span className="text-blue-500">Asistencia</span></h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -mr-2 text-gray-400 hover:text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </header>

        {/* El Outlet donde se renderizan tus páginas (Personas, Asistencias, etc.) */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-4 md:p-6 lg:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>

    </div>
  );
}