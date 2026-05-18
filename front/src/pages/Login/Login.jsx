import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { loginUsuario } from '../../services/auth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setCargando(true);

        try {
            const data = await loginUsuario(username, password);
            // 'data' trae el access_token y el rol desde FastAPI
            login(data.access_token, data.rol);
        } catch (err) {
            setError('Credenciales incorrectas. Verifique su usuario y contraseña.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">

                <div className="p-8 text-center bg-gray-800/50 border-b border-gray-800">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Muni Asistencia</h2>
                    <p className="text-sm text-gray-400 mt-1">Ingresa tus credenciales para continuar</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-400 bg-red-900/30 border border-red-800/50 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Usuario"
                        id="username"
                        placeholder="Ej: administracion"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <Input
                        label="Contraseña"
                        type="password"
                        id="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" variant="primary" className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-sm font-bold tracking-wide" disabled={cargando}>
                        {cargando ? 'Verificando...' : 'Iniciar Sesión'}
                    </Button>
                </form>
            </div>

            {/* --- TU FIRMA DE DESARROLLADOR --- */}
            <div className="absolute bottom-6 text-center w-full">
                <p className="text-xs text-gray-600">
                    Sistema de Control Operativo y Asistencia<br />
                    Desarrollado por <a href="https://github.com/ortisec" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-500 hover:text-blue-500 transition-colors duration-300">ortisec</a>
                </p>
            </div>
        </div>
    );
}