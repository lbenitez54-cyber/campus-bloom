import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, UserCheck, Plus, Filter, Download, FileUp } from 'lucide-react';
import { ClassScheduleItem, Subject } from '../../types';

interface ScheduleViewProps {
  schedule: ClassScheduleItem[];
  subjects: Subject[];
  onOpenPdfModal: () => void;
  onAddClass: (newItem: ClassScheduleItem) => void;
}

const DAYS: Array<'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado'> = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedule,
  subjects,
  onOpenPdfModal,
  onAddClass,
}) => {
  const [selectedDay, setSelectedDay] = useState<'Todos' | 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado'>('Todos');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New class form state
  const [newSubjectId, setNewSubjectId] = useState<string>(subjects[0]?.id || '');
  const [newDay, setNewDay] = useState<'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado'>('Lunes');
  const [newStartTime, setNewStartTime] = useState<string>('08:00');
  const [newEndTime, setNewEndTime] = useState<string>('10:00');
  const [newLocation, setNewLocation] = useState<string>('Pabellón Central A-101');
  const [newType, setNewType] = useState<'Teoría' | 'Práctica' | 'Laboratorio' | 'Seminario'>('Teoría');

  const filteredSchedule = schedule.filter((item) => {
    const matchesDay = selectedDay === 'Todos' || item.dayOfWeek === selectedDay;
    const matchesSub = filterSubject === 'all' || item.subjectId === filterSubject;
    return matchesDay && matchesSub;
  });

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find((s) => s.id === newSubjectId);
    if (!subj) return;

    const newItem: ClassScheduleItem = {
      id: `sch-${Date.now()}`,
      subjectId: subj.id,
      subjectName: subj.name,
      dayOfWeek: newDay,
      startTime: newStartTime,
      endTime: newEndTime,
      location: newLocation,
      professor: subj.professor,
      type: newType,
      color: subj.color,
    };

    onAddClass(newItem);
    setIsAddModalOpen(false);
  };

  const handleExportSchedule = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Día,Horario,Materia,Tipo,Aula,Docente\n' +
      schedule
        .map((s) => `${s.dayOfWeek},${s.startTime}-${s.endTime},"${s.subjectName}",${s.type},"${s.location}","${s.professor}"`)
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Cronograma_Medicina_CampusBloom.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="schedule-view-screen" className="w-full flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="rounded-[28px] glass-card p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md shadow-[#864e5a]/10 border border-white/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#cde9ac] text-[#374d20] border border-[#b4cf95]">
              Horario Semestral 2026
            </span>
            <span className="text-xs text-[#514345] font-medium">Medicina • 2do Año</span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-[#1b1c1c] tracking-tight">
            Cronograma de Clases y Laboratorios
          </h2>
          <p className="text-xs sm:text-sm text-[#514345]/80">
            Gestiona tus horas de clases teóricas, prácticas de microscopía y pabellones anatómicos.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="schedule-upload-pdf-btn"
            onClick={onOpenPdfModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl glass-inner text-xs font-bold text-[#514345] hover:bg-white/80 transition-all border border-white/80 shadow-sm"
          >
            <FileUp className="w-4 h-4 text-[#864e5a]" />
            <span>Subir PDF</span>
          </button>

          <button
            id="schedule-export-btn"
            onClick={handleExportSchedule}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl glass-inner text-xs font-bold text-[#514345] hover:bg-white/80 transition-all border border-white/80 shadow-sm"
          >
            <Download className="w-4 h-4 text-[#4e6535]" />
            <span>Descargar</span>
          </button>

          <button
            id="schedule-add-class-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#4e6535] hover:bg-[#3d5029] text-white text-xs font-bold shadow-md shadow-[#4e6535]/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Clase</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs by Day & Subject */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 px-1">
        {/* Day Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedDay('Todos')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedDay === 'Todos'
                ? 'bg-[#864e5a] text-white shadow-sm'
                : 'glass-inner text-[#514345] hover:bg-white/70'
            }`}
          >
            Toda la Semana
          </button>
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                selectedDay === day
                  ? 'bg-[#4e6535] text-white shadow-sm'
                  : 'glass-inner text-[#514345] hover:bg-white/70'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Subject Filter Dropdown */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Filter className="w-3.5 h-3.5 text-[#514345]" />
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="glass-inner px-3 py-1.5 rounded-xl text-xs font-medium text-[#1b1c1c] border border-white/90 outline-none cursor-pointer"
          >
            <option value="all">Todas las Materias</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule Items Grid */}
      {filteredSchedule.length === 0 ? (
        <div className="rounded-[24px] glass-card p-12 text-center text-[#514345]">
          <CalendarIcon className="w-12 h-12 text-[#864e5a]/40 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-lg text-[#1b1c1c]">No hay clases programadas</h3>
          <p className="text-xs text-[#514345]/70 mt-1 max-w-sm mx-auto">
            No encontramos horarios con los filtros seleccionados. Puedes agregar una nueva clase o subir tu PDF oficial.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchedule.map((item) => {
            const badgeBg =
              item.type === 'Laboratorio'
                ? 'bg-[#cde9ac] text-[#374d20]'
                : item.type === 'Práctica'
                ? 'bg-[#ffd9df] text-[#6b3743]'
                : 'bg-white/80 text-[#514345]';

            return (
              <div
                key={item.id}
                id={`schedule-card-${item.id}`}
                className="rounded-[22px] glass-card p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-md hover:shadow-lg transition-all border border-white/80 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#864e5a] bg-[#ffb7c5]/30 px-2 py-0.5 rounded-md">
                      {item.dayOfWeek}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border border-black/5 ${badgeBg}`}>
                      {item.type}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-[16px] text-[#1b1c1c] group-hover:text-[#4e6535] transition-colors leading-snug">
                    {item.subjectName}
                  </h3>

                  <div className="mt-2.5 space-y-1.5 text-xs text-[#514345]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#4e6535]" />
                      <span className="font-semibold text-[#1b1c1c]">
                        {item.startTime} - {item.endTime} hs
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#864e5a]" />
                      <span>{item.location}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#514345]/70" />
                      <span className="truncate">{item.professor}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px] text-[#864e5a] font-semibold">
                  <span>Facultad de Ciencias Médicas</span>
                  <span className="group-hover:translate-x-1 transition-transform">Detalles →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal to add class */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[24px] glass-card p-6 shadow-2xl border border-white">
            <h3 className="font-heading text-lg font-bold text-[#1b1c1c] mb-1">
              Agregar Clase al Cronograma
            </h3>
            <p className="text-xs text-[#514345]/80 mb-4">
              Ingresa los detalles del horario semanal para Medicina.
            </p>

            <form onSubmit={handleCreateClass} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1">Materia</label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-inner text-xs border border-white/90 outline-none"
                  required
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1">Día</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value as typeof newDay)}
                    className="w-full p-2.5 rounded-xl glass-inner text-xs border border-white/90 outline-none"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1">Tipo de Clase</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as typeof newType)}
                    className="w-full p-2.5 rounded-xl glass-inner text-xs border border-white/90 outline-none"
                  >
                    <option value="Teoría">Teoría</option>
                    <option value="Práctica">Práctica</option>
                    <option value="Laboratorio">Laboratorio</option>
                    <option value="Seminario">Seminario</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-inner text-xs border border-white/90 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-inner text-xs border border-white/90 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1">Aula / Pabellón</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-inner text-xs border border-white/90 outline-none"
                  placeholder="Ej: Pabellón Anatómico A-102"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#514345] hover:bg-black/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#4e6535] text-white text-xs font-bold shadow-md hover:bg-[#3d5029]"
                >
                  Guardar Clase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
