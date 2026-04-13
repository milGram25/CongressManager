 import { useEffect } from "react";

export default function Modal({ abierto, onClose, children }) {
    
    useEffect(() => {
        document.body.style.overflow = abierto ? "hidden" : "auto";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [abierto]);

    if (!abierto) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
            
            {/*Fondo oscuro*/}
            <div
                className="w-full absolute inset-0 bg-black opacity-50"
                onClick={onClose}
            />

            {/*Contenido*/}
            
            <div className="w-310 overflow-y-auto relative max-h-[85vh] rounded-xl mr-5">
                {children}
                
            </div>
                

            
            
        </div>
    );
}