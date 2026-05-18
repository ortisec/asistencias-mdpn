import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // Si no está logueado, lo mandamos al Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si está logueado pero su rol no está en la lista de permitidos
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <svg className="w-20 h-20 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h1 className="text-3xl font-bold text-white mb-2">Acceso Restringido</h1>
        <p className="text-gray-400 max-w-md">Tu rol actual ({user.rol}) no tiene los privilegios necesarios para acceder a este módulo.</p>
      </div>
    );
  }

  return children;
}