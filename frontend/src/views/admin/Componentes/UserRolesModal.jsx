import { useState } from "react";
import { MdClose, MdLock, MdPerson, MdEmail, MdPhone, MdPublic, MdWc } from "react-icons/md";
import { assignRoleApi, removeRoleApi } from "../../../api/adminApi";

const ROLES = [
  { key: 'dictaminador',  label: 'Dictaminador' },
  { key: 'evaluador',     label: 'Evaluador' },
  { key: 'administrador', label: 'Administrador' },
];

export default function UserRolesModal({ user, congreso, onClose, onRolesUpdated }) {
  const [pendingAction, setPendingAction] = useState(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const token = localStorage.getItem('congress_access');

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleToggle = (rol, currentValue) => {
    if (pendingAction) return;
    setPendingAction({ rol, action: currentValue ? 'remove' : 'assign' });
    setPassword('');
  };

  const handleCancel = () => {
    setPendingAction(null);
    setPassword('');
  };

  const handleConfirm = async () => {
    if (!pendingAction) return;
    const { rol, action } = pendingAction;
    const needsPassword = rol === 'administrador';

    if (needsPassword && !password) {
      showFeedback('error', 'Ingresa tu contraseña para continuar.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        rol,
        idCongreso: rol !== 'administrador' ? congreso?.id_congreso : undefined,
        password: needsPassword ? password : undefined,
      };
      const updatedRoles = action === 'assign'
        ? await assignRoleApi(token, user.id_persona, payload)
        : await removeRoleApi(token, user.id_persona, payload);

      onRolesUpdated(user.id_persona, updatedRoles);
      showFeedback('success', `Rol de ${ROLES.find(r => r.key === rol)?.label} ${action === 'assign' ? 'asignado' : 'quitado'} correctamente.`);
    } catch (err) {
      showFeedback('error', err.message);
    } finally {
      setLoading(false);
      setPendingAction(null);
      setPassword('');
    }
  };

  const isAdmin = pendingAction?.rol === 'administrador';
  const confirmLabel = pendingAction?.action === 'assign' ? 'Asignar' : 'Quitar';

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box max-w-lg">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <MdPerson className="text-2xl" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">{user.nombre_completo}</h3>
              <p className="text-xs text-base-content/50">Gestión de roles</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <MdClose className="text-lg" />
          </button>
        </div>

        {/* Datos del usuario */}
        <div className="grid grid-cols-1 gap-2 mb-6 bg-base-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm">
            <MdEmail className="text-base-content/40 flex-shrink-0" />
            <span className="truncate">{user.correo_electronico}</span>
          </div>
          {user.num_telefono && (
            <div className="flex items-center gap-2 text-sm">
              <MdPhone className="text-base-content/40 flex-shrink-0" />
              <span>{user.num_telefono}</span>
            </div>
          )}
          {user.genero && (
            <div className="flex items-center gap-2 text-sm">
              <MdWc className="text-base-content/40 flex-shrink-0" />
              <span className="capitalize">{user.genero}</span>
            </div>
          )}
          {user.pais && (
            <div className="flex items-center gap-2 text-sm">
              <MdPublic className="text-base-content/40 flex-shrink-0" />
              <span>{user.pais}</span>
            </div>
          )}
        </div>

        {/* Contexto de congreso */}
        {congreso && (
          <p className="text-xs text-base-content/50 mb-3 font-semibold uppercase tracking-wider">
            Roles en: {congreso.nombre_congreso}
          </p>
        )}

        {/* Toggles de roles */}
        <div className="space-y-3 mb-6">
          {ROLES.map(({ key, label }) => {
            const active = user.roles[key];
            const isPending = pendingAction?.rol === key;
            return (
              <div
                key={key}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isPending ? 'border-primary bg-primary/5' : 'border-base-300 bg-base-100'
                }`}
              >
                <span className="font-medium text-sm">{label}</span>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => handleToggle(key, active)}
                  className="toggle toggle-primary"
                  disabled={!!pendingAction && !isPending}
                />
              </div>
            );
          })}
        </div>

        {/* Panel de confirmación */}
        {pendingAction && (
          <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4 mb-4">
            {isAdmin ? (
              <>
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <MdLock className="text-warning" />
                  {pendingAction.action === 'assign'
                    ? 'Ingresa tu contraseña para otorgar el rol de Administrador'
                    : 'Ingresa tu contraseña para quitar el rol de Administrador'}
                </p>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleConfirm()}
                  placeholder="Tu contraseña"
                  className="input input-bordered input-sm w-full mb-3"
                  autoFocus
                />
              </>
            ) : (
              <p className="text-sm font-semibold mb-3">
                ¿Confirmar{' '}
                <span className="text-primary">
                  {pendingAction.action === 'assign' ? 'asignar' : 'quitar'}
                </span>{' '}
                rol de{' '}
                <span className="text-primary">
                  {ROLES.find(r => r.key === pendingAction.rol)?.label}
                </span>?
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <button onClick={handleCancel} className="btn btn-ghost btn-sm" disabled={loading}>
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="btn btn-primary btn-sm"
                disabled={loading || (isAdmin && !password)}
              >
                {loading ? <span className="loading loading-spinner loading-xs" /> : confirmLabel}
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'} py-2 text-sm`}>
            {feedback.msg}
          </div>
        )}

      </div>
      <div className="modal-backdrop" onClick={!loading ? onClose : undefined} />
    </dialog>
  );
}
