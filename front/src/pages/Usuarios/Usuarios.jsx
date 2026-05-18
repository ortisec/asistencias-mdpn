import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { getUsuarios, createUsuario, updateUsuario } from '../../services/usuarios';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({ id: null, username: '', password: '', rol: 'rrhh', is_active: true });

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError('Error al cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const abrirModalCrear = () => {
    setFormData({ id: null, username: '', password: '', rol: 'rrhh', is_active: true });
    setModoEdicion(false);
    setIsModalOpen(true);
    setError(null);
  };

  const abrirModalEditar = (usuario) => {
    setFormData({ id: usuario.id, username: usuario.username, password: '', rol: usuario.rol, is_active: usuario.is_active });
    setModoEdicion(true);
    setIsModalOpen(true);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);

    try {
      if (modoEdicion) {
        // Al editar, si la contraseña está vacía, la eliminamos del payload para no sobrescribirla
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        
        await updateUsuario(formData.id, payload);
        setMensajeExito('Usuario actualizado correctamente.');
      } else {
        await createUsuario(formData);
        setMensajeExito('Usuario creado exitosamente.');
      }
      setIsModalOpen(false);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar el usuario.');
    }
  };

  const formatearRol = (rol) => {
    if (rol === 'superadmin') return 'Super Administrador';
    if (rol === 'admin') return 'Administrador (Alcaldía/Gerencia)';
    if (rol === 'rrhh') return 'Recursos Humanos';
    return rol;
  };

  return (
    <div className="space-y-6 relative">
      
      {/* --- MODAL CREAR/EDITAR --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md flex flex-col">
            <div className="p-5 border-b border-gray-700 bg-gray-900/80 rounded-t-xl">
              <h2 className="text-xl font-bold text-white">
                {modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
            </div>
            
            <div className="p-6 space-y-5 bg-gray-800">
              {error && <div className="p-3 text-sm text-red-400 bg-red-900/30 border border-red-800/50 rounded-lg">{error}</div>}
              
              <Input label="Nombre de Usuario (Login)" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required autoFocus />
              
              <div>
                <Input label={modoEdicion ? "Nueva Contraseña (Opcional)" : "Contraseña"} type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required={!modoEdicion} />
                {modoEdicion && <p className="text-xs text-gray-500 mt-1">Déjalo en blanco si no quieres cambiar la clave actual.</p>}
              </div>
              
              <Select label="Rol en el Sistema" value={formData.rol} onChange={(e) => setFormData({...formData, rol: e.target.value})} options={[
                { value: 'rrhh', label: 'Recursos Humanos' },
                { value: 'admin', label: 'Administrador (Alcaldía)' },
                { value: 'superadmin', label: 'Super Administrador (TI)' }
              ]} required />

              {modoEdicion && (
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-sm font-medium text-gray-300">Estado de la cuenta:</span>
                  <button type="button" onClick={() => setFormData({...formData, is_active: !formData.is_active})} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.is_active ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className={`text-xs font-bold ${formData.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formData.is_active ? 'ACTIVO' : 'SUSPENDIDO'}
                  </span>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-700 bg-gray-900/80 rounded-b-xl flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-700">Guardar Usuario</Button>
            </div>
          </form>
        </div>
      )}

      {/* --- CABECERA --- */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-400 mt-1">Administra los accesos y privilegios del sistema.</p>
        </div>
        <Button variant="primary" onClick={abrirModalCrear} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Usuario
        </Button>
      </div>

      {mensajeExito && <div className="p-4 text-sm text-emerald-400 bg-emerald-900/30 border border-emerald-800/50 rounded-lg">{mensajeExito}</div>}

      {/* --- TABLA DE USUARIOS --- */}
      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700">
        {loading ? <div className="p-8 text-gray-400 text-center">Cargando cuentas...</div> : (
          <table className="min-w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-gray-700 bg-gray-900/50 text-gray-400 text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Usuario</th>
                <th className="px-6 py-4 font-semibold">Rol</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-gray-300">
              {usuarios.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-blue-400 font-bold uppercase">
                      {user.username.charAt(0)}
                    </div>
                    {user.username}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide ${user.rol === 'superadmin' ? 'bg-purple-900/40 text-purple-400 border border-purple-800' : user.rol === 'admin' ? 'bg-amber-900/40 text-amber-400 border border-amber-800' : 'bg-sky-900/40 text-sky-400 border border-sky-800'}`}>
                      {formatearRol(user.rol)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${user.is_active ? 'text-emerald-500' : 'text-red-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      {user.is_active ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => abrirModalEditar(user)} className="text-blue-400 hover:text-blue-300 bg-blue-900/20 hover:bg-blue-900/40 px-3 py-1.5 rounded transition-colors text-xs font-semibold">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}