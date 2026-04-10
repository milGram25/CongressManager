

function Modal({ abierto, onClose, children }) {
    if (!abierto) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            
            {/*Fondo oscuro*/}
            <div
                className="absolute inset-0 bg-black opacity-50"
                onClick={onClose}
            />

            {/*Contenido*/}
            <div className="relative p-6 z-10">
                {children}
            </div>
        </div>
    );
}