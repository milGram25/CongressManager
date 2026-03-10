import { useState } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays 
} from 'date-fns';
import { es } from 'date-fns/locale';
import TodayEventsModal from './TodayEventsModal';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1));
  const [selectedDate, setSelectedDate] = useState(null);

  const mockEvents = [
    { 
      date: new Date(2026, 1, 15), 
      type: 'taller', 
      title: 'Taller de Redes', 
      time: '10:00 AM',
      description: 'Aprende a configurar infraestructuras de red escalables y seguras para aplicaciones empresariales modernas.'
    },
    { 
      date: new Date(2026, 1, 15), 
      type: 'ponencia', 
      title: 'IA en Agricultura', 
      time: '02:00 PM',
      description: 'Exploración de sistemas de monitoreo y riego inteligente para optimizar el rendimiento en zonas agrícolas.'
    },
    { 
      date: new Date(2026, 2, 13), 
      type: 'taller', 
      title: 'IA en Agricultura', 
      time: '02:00 PM',
      description: 'Exploración de sistemas de monitoreo y riego inteligente para optimizar el rendimiento en zonas agrícolas.'
    },
    { 
      date: new Date(2026, 1, 17), 
      type: 'ponencia', 
      title: 'IA en Agricultura', 
      time: '02:00 PM',
      description: 'Exploración de sistemas de monitoreo y riego inteligente para optimizar el rendimiento en zonas agrícolas.'
    },
    { 
      date: new Date(2026, 1, 27), 
      type: 'ponencia', 
      title: 'Clausura', 
      time: '05:00 PM',
      description: 'Ceremonia de clausura del congreso, entrega de reconocimientos y networking final.'
    },
  ];

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); 
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = [];
  let day = startDate;
  while (day <= endDate) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  const handleDayClick = (clickedDate) => {
    setSelectedDate(clickedDate);
    document.getElementById('events_modal').showModal();
  };

  const selectedEvents = selectedDate 
    ? mockEvents.filter(e => isSameDay(e.date, selectedDate)) 
    : [];

  return (
    <div className="max-w-3xl mx-auto w-full bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
      
      <div className="bg-primary text-white p-4 flex items-center justify-between">
        <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded transition-colors">&lt;</button>
        <h3 className="text-white font-medium capitalize text-lg">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h3>
        <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded transition-colors">&gt;</button>
      </div>

      <div className="p-6"> 
        <div className="grid grid-cols-7 gap-2 mb-2 border-b border-base-200 pb-2">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
            <div key={d} className="text-center text-sm font-medium opacity-60 py-1">{d}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2 pt-2">
          {calendarDays.map((calDay, index) => {
            const dayEvents = mockEvents.filter(e => isSameDay(e.date, calDay));
            const hasTaller = dayEvents.some(e => e.type === 'taller');
            const hasPonencia = dayEvents.some(e => e.type === 'ponencia');
            const isCurrentMonth = isSameMonth(calDay, currentMonth);

            return (
              <div
                key={index}
                onClick={() => handleDayClick(calDay)}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-lg text-sm
                  transition-all duration-200 cursor-pointer border border-transparent relative
                  ${!isCurrentMonth ? 'opacity-30' : 'hover:border-base-300 hover:bg-base-200'}
                  ${hasTaller && !hasPonencia ? 'bg-base-300/80 hover:bg-base-300' : ''}
                  ${!hasTaller && hasPonencia ? 'bg-accent/80 hover:bg-accent' : ''}
                  ${hasTaller && hasPonencia ? 'bg-gradient-to-br from-base-300/80 to-accent/80 text-base-content hover:from-base-300 hover:to-accent' : ''}
                `}
              >
                <span className="font-medium">{format(calDay, 'd')}</span>
                
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-1 flex gap-1">
                    {hasTaller && <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>}
                    {hasPonencia && <div className="w-1.5 h-1.5 rounded-full bg-base-content"></div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-6 mt-8 pt-4 border-t border-base-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
            <span className="text-sm opacity-80">Taller</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent"></div>
            <span className="text-sm opacity-80">Ponencia</span>
          </div>
        </div>
      </div>

      <TodayEventsModal selectedDate={selectedDate} events={selectedEvents} />

    </div>
  );
}
