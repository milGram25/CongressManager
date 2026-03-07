// export default function AgendaView() {
//   return <div className="flex h-full items-center justify-center text-2xl opacity-50">Agenda View</div>;
// }
import { useState } from 'react';

export default function AgendaView() {
  // State to handle the toggle between 'hoy' (list) and 'general' (calendar)
  const [activeView, setActiveView] = useState('general');

  // Mock data for the calendar
  const mockCalendar = {
    month: "Febrero 2026",
    days: Array.from({ length: 28 }, (_, i) => ({
      day: i + 1,
      // Just tossing some random mock events in to match your screenshot
      type: i === 15 ? 'taller' : i === 27 ? 'ponencia' : 'none'
    }))
  };

  // Mock data for the daily list view
  const mockSchedule = [
    { id: 1, title: 'Inteligencia Artificial y su Impacto en la Sociedad Digital', session: 'Sesión 1', time: '09:00 hrs' },
    { id: 2, title: 'Desarrollo Sostenible: Tecnologías Verdes del Futuro', session: 'Sesión 2', time: '11:00 hrs' },
    { id: 3, title: 'Blockchain y Criptomonedas: Revolución Financiera', session: 'Sesión 3', time: '13:00 hrs' },
    { id: 4, title: 'Computación Cuántica: El Siguiente Salto Tecnológico', session: 'Sesión 4', time: '15:00 hrs' },
    { id: 5, title: 'Ciberseguridad en la Era de la Información', session: 'Sesión 5', time: '17:00 hrs' },
  ];

  return (
    <div className="w-full flex flex-col items-center pt-2">
      
      {/* Top Toggle Switch */}
      <div className="bg-base-200 rounded-full p-1 inline-flex mb-10 shadow-inner">
        <button
          onClick={() => setActiveView('hoy')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            activeView === 'hoy' ? 'bg-base-100 shadow text-primary' : 'text-base-content opacity-60 hover:opacity-100'
          }`}
        >
          Hoy
        </button>
        <button
          onClick={() => setActiveView('general')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
            activeView === 'general' ? 'bg-base-100 shadow text-primary' : 'text-base-content opacity-60 hover:opacity-100'
          }`}
        >
          General
        </button>
      </div>

      {/* CONDITIONAL RENDERING based on the toggle */}
      <div className="w-full transition-all duration-300">
        
        {/* --- VIEW 1: GENERAL (CALENDAR) --- */}
        {activeView === 'general' && (
          <div className="max-w-2xl mx-auto w-full bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-primary text-white p-4 flex items-center justify-between">
              <button className="p-2 hover:bg-white/10 rounded transition-colors">&lt;</button>
              <h3 className="text-white font-medium">{mockCalendar.month}</h3>
              <button className="p-2 hover:bg-white/10 rounded transition-colors">&gt;</button>
            </div>

            {/* Calendar Grid */}
            <div className="p-6"> 
              <div className="grid grid-cols-7 gap-2 mb-2 border-b border-base-200 pb-2">
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium opacity-60 py-1">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2 pt-2">
                {/* Empty days padding for February 2026 (Starts on a Sunday) */}
                {mockCalendar.days.map((dayInfo, index) => (
                  <div
                    key={index}
                    className={`
                      aspect-square flex items-center justify-center rounded-lg text-sm
                      transition-all duration-200 cursor-pointer border border-transparent
                      ${
                        dayInfo.type === "taller"
                          ? "bg-base-300/80 hover:bg-base-300"
                          : dayInfo.type === "ponencia"
                          ? "bg-accent/80 text-base-content hover:bg-accent"
                          : "hover:border-base-300 hover:bg-base-200"
                      }
                    `}
                  >
                    {dayInfo.day}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-6 mt-8 pt-4 border-t border-base-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-base-300"></div>
                  <span className="text-sm opacity-80">Taller</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent"></div>
                  <span className="text-sm opacity-80">Ponencia</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW 2: HOY (LIST) --- */}
        {activeView === 'hoy' && (
          <div className="max-w-3xl mx-auto w-full bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
            
            {/* List Header */}
            <div className="bg-primary text-white p-6 md:p-8">
              <div className="flex items-center gap-2 text-sm opacity-80 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <span>MI AGENDA</span>
              </div>
              <h2 className="text-2xl font-bold">Congreso Internacional de Tecnología e Innovación 2026</h2>
              <p className="opacity-80 mt-1">28 de febrero de 2026</p>
            </div>

            {/* List Body */}
            <div className="p-6 md:p-8">
              <h3 className="font-medium text-lg mb-6">Ponencias Inscritas</h3>
              
              <div className="space-y-0">
                {mockSchedule.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`flex justify-between items-center py-4 ${index !== mockSchedule.length - 1 ? 'border-b border-base-200' : ''}`}
                  >
                    {/* Left border accent line like in your mockup */}
                    <div className="flex items-center gap-4">
                      <div className="w-1 h-10 bg-base-300 rounded-full"></div>
                      <div>
                        <h4 className="font-medium text-base-content">{item.title}</h4>
                        <p className="text-sm opacity-60">{item.session}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-primary">{item.time.split(' ')[0]}</span>
                      <span className="text-xs opacity-60 block">{item.time.split(' ')[1]}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-4 border-t border-base-200 text-center text-sm opacity-50">
                Total de ponencias: {mockSchedule.length}
              </div>
            </div>

          </div>
        )}
        
      </div>
    </div>
  );
}
