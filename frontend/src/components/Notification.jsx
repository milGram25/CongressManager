import React, { useEffect } from 'react';
import { MdCheckCircle, MdError, MdInfo, MdClose } from 'react-icons/md';

const Notification = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <MdCheckCircle className="text-success" size={24} />,
    error: <MdError className="text-error" size={24} />,
    info: <MdInfo className="text-info" size={24} />,
  };

  const bgColors = {
    success: 'border-success/20 bg-success/5',
    error: 'border-error/20 bg-error/5',
    info: 'border-info/20 bg-info/5',
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100] animate-in fade-in slide-in-from-right-10 duration-300">
      <div className={`flex items-center gap-4 p-4 rounded-2xl border-2 shadow-xl bg-white ${bgColors[type]} min-w-[300px]`}>
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">{type === 'success' ? 'Éxito' : 'Mensaje'}</p>
          <p className="text-xs text-slate-600">{message}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <MdClose size={20} />
        </button>
      </div>
    </div>
  );
};

export default Notification;
