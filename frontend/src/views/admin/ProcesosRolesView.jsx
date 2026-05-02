import { useState, useEffect, useMemo } from "react";
import { MdSearch, MdManageAccounts, MdPerson } from "react-icons/md";
import { getCongresosApi, getAllUsersApi } from "../../api/adminApi";
import UserRolesModal from "./Componentes/UserRolesModal";

const ROLE_COLORS = {
  dictaminador:  'badge-primary',
  evaluador:     'badge-secondary',
  administrador: 'badge-accent',
};

const ROLE_LABELS = {
  dictaminador:  'Dictaminador',
  evaluador:     'Evaluador',
  administrador: 'Admin',
};

export default function ProcesosRolesView() {
  const [congresos, setCongresos] = useState([]);
  const [selectedCongreso, setSelectedCongreso] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const token = localStorage.getItem('congress_access');

  useEffect(() => {
    getCongresosApi(token)
      .then(setCongresos)
      .catch(() => setFetchError('Error al cargar los congresos.'));
  }, []);

  useEffect(() => {
    if (!selectedCongreso) { setUsers([]); return; }
    setLoadingUsers(true);
    setSearchTerm('');
    getAllUsersApi(token, selectedCongreso.id_congreso)
      .then(data => { setUsers(data); setFetchError(null); })
      .catch(() => setFetchError('Error al cargar los usuarios.'))
      .finally(() => setLoadingUsers(false));
  }, [selectedCongreso]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(u => u.nombre_completo.toLowerCase().includes(term));
  }, [users, searchTerm]);

  const handleRolesUpdated = (idPersona, newRoles) => {
    setUsers(prev => prev.map(u => u.id_persona === idPersona ? { ...u, roles: newRoles } : u));
    setSelectedUser(prev => prev?.id_persona === idPersona ? { ...prev, roles: newRoles } : prev);
  };

  const activeRoles = user =>
    Object.entries(user.roles ?? {}).filter(([, v]) => v).map(([k]) => k);

  return (
    <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-sm">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <MdManageAccounts className="text-2xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Gestión de Roles</h2>
          <p className="text-xs text-base-content/50">Asigna roles a usuarios por congreso</p>
        </div>
      </div>

      {/* Selector de congreso */}
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-1 text-base-content/70">Congreso</label>
        <select
          className="select select-bordered w-full max-w-sm"
          value={selectedCongreso?.id_congreso ?? ''}
          onChange={e => {
            const found = congresos.find(c => String(c.id_congreso) === e.target.value);
            setSelectedCongreso(found || null);
          }}
        >
          <option value="">Selecciona un congreso...</option>
          {congresos.map(c => (
            <option key={c.id_congreso} value={c.id_congreso}>{c.nombre_congreso}</option>
          ))}
        </select>
      </div>

      {fetchError && (
        <div className="alert alert-error mb-4 text-sm">{fetchError}</div>
      )}

      {/* Buscador */}
      {selectedCongreso && !loadingUsers && (
        <div className="relative mb-6 max-w-sm">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 text-xl" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input input-bordered pl-10 w-full"
          />
        </div>
      )}

      {/* Sin congreso seleccionado */}
      {!selectedCongreso && (
        <div className="text-center py-20 text-base-content/40">
          <MdManageAccounts className="text-5xl mx-auto mb-3" />
          <p>Selecciona un congreso para gestionar roles</p>
        </div>
      )}

      {/* Loading */}
      {loadingUsers && (
        <div className="flex justify-center py-20">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      )}

      {/* Lista de usuarios */}
      {!loadingUsers && selectedCongreso && (
        <>
          <p className="text-xs text-base-content/40 mb-4">{filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredUsers.map(user => {
              const roles = activeRoles(user);
              return (
                <div
                  key={user.id_persona}
                  className="flex items-center justify-between p-4 bg-base-200 rounded-2xl hover:bg-base-300/50 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                      <MdPerson className="text-lg" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{user.nombre_completo}</p>
                      <p className="text-xs text-base-content/50 truncate">{user.correo_electronico}</p>
                      {roles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {roles.map(r => (
                            <span key={r} className={`badge badge-sm ${ROLE_COLORS[r]}`}>
                              {ROLE_LABELS[r]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="btn btn-ghost btn-sm ml-2 flex-shrink-0"
                  >
                    Gestionar
                  </button>
                </div>
              );
            })}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-16 text-base-content/40">
              <MdPerson className="text-4xl mx-auto mb-2" />
              <p>No se encontraron usuarios</p>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {selectedUser && (
        <UserRolesModal
          user={selectedUser}
          congreso={selectedCongreso}
          onClose={() => setSelectedUser(null)}
          onRolesUpdated={handleRolesUpdated}
        />
      )}
    </div>
  );
}
