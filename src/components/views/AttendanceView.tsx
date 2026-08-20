import React, { useState } from 'react';
import { CalendarCheck2, AlertTriangle, CheckCircle2, XCircle, Plus, Calculator, ShieldCheck } from 'lucide-react';
import { Subject, StudentProfile } from '../../types';

interface AttendanceViewProps {
  profile: StudentProfile;
  subjects: Subject[];
  onUpdateAttendance: (subjectId: string, deltaAttended: number, deltaTotal: number) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  profile,
  subjects,
  onUpdateAttendance,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [simulatedAbsences, setSimulatedAbsences] = useState<number>(1);
  const [justificationNote, setJustificationNote] = useState<string>('');
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const totalPercentage = Math.round(
    (profile.attendedClasses / (profile.totalClasses || 1)) * 100
  );

  const handleQuickLog = (subjectId: string, isPresent: boolean) => {
    if (isPresent) {
      onUpdateAttendance(subjectId, 1, 1);
      setSuccessMessage('¡Asistencia registrada con éxito (+1)!');
    } else {
      onUpdateAttendance(subjectId, 0, 1);
      setSuccessMessage('Inasistencia registrada.');
    }
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Absence simulator calculations
  const simSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const simTotal = simSubject ? simSubject.totalClasses + simulatedAbsences : 0;
  const simAttended = simSubject ? simSubject.attendedClasses : 0;
  const simProjectedPercent = simTotal > 0 ? Math.round((simAttended / simTotal) * 100) : 0;
  const isRegularSafe = simProjectedPercent >= 80;

  return (
    <div id="attendance-view-screen" className="w-full flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Top Banner Alert / Success Toast */}
      {successMessage && (
        <div className="p-3 rounded-2xl bg-[#cde9ac] text-[#374d20] font-bold text-xs border border-[#b4cf95] flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#4e6535]" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* Main Metric Banner */}
      <div className="rounded-[28px] glass-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-[#864e5a]/10 border border-white/80">
        <div className="flex items-center gap-5">
          {/* Circular Metric */}
          <div className="w-24 h-24 rounded-full p-2 bg-gradient-to-tr from-[#cde9ac] to-[#4e6535] flex items-center justify-center text-white shadow-lg shadow-[#4e6535]/20 flex-shrink-0">
            <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center text-[#1b1c1c]">
              <span className="font-heading text-2xl font-extrabold">{totalPercentage}%</span>
              <span className="text-[10px] text-[#514345] font-bold uppercase tracking-wider">Total</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffd9df] text-[#6b3743] border border-[#ffb7c5]">
                Reglamento FCM
              </span>
              <span className="text-xs text-[#514345] font-semibold">Mínimo Requerido: 80%</span>
            </div>
            <h2 className="font-heading text-2xl font-bold text-[#1b1c1c] tracking-tight mt-1">
              Control de Asistencia Universitaria
            </h2>
            <p className="text-xs sm:text-sm text-[#514345]/80 mt-0.5">
              Has asistido a <strong className="text-[#4e6535]">{profile.attendedClasses}</strong> de{' '}
              <strong className="text-[#1b1c1c]">{profile.totalClasses}</strong> clases dictadas.
            </p>
          </div>
        </div>

        <button
          id="open-register-attendance-modal-btn"
          onClick={() => setShowLogModal(true)}
          className="w-full md:w-auto px-5 py-3 rounded-2xl bg-[#4e6535] hover:bg-[#3d5029] text-white text-xs font-bold shadow-md shadow-[#4e6535]/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Asistencia Hoy</span>
        </button>
      </div>

      {/* Grid: Subject Breakdown on Left + Simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Subject Breakdown Cards (8 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3.5">
          <h3 className="font-heading text-lg font-bold text-[#1b1c1c] px-1 flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-[#864e5a]" />
            Asistencia por Cátedra
          </h3>

          <div className="space-y-3">
            {subjects.map((sub) => {
              const percent = Math.round((sub.attendedClasses / (sub.totalClasses || 1)) * 100);
              const isWarning = percent < 75;
              const isBorderline = percent >= 75 && percent < 80;

              return (
                <div
                  key={sub.id}
                  id={`attendance-card-${sub.id}`}
                  className={`rounded-[22px] p-4 sm:p-5 border transition-all duration-200 shadow-sm ${
                    isWarning
                      ? 'bg-[#fadadd]/80 border-[#9e6b6e]/30'
                      : isBorderline
                      ? 'glass-card border-[#ffd9df]'
                      : 'glass-card border-white/80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading text-[15px] font-bold text-[#1b1c1c]">
                          {sub.name}
                        </h4>
                        {isWarning && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#ba1a1a] text-white flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Riesgo de Regularidad
                          </span>
                        )}
                        {isBorderline && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ffd9df] text-[#7b4551]">
                            En límite (80%)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#514345]/80 mt-0.5">
                        {sub.classroom} • {sub.professor}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <span className={`text-base font-extrabold ${isWarning ? 'text-[#9e6b6e]' : 'text-[#4e6535]'}`}>
                          {percent}%
                        </span>
                        <p className="text-[11px] text-[#514345]">
                          {sub.attendedClasses}/{sub.totalClasses} asistidas
                        </p>
                      </div>

                      {/* Quick Action buttons */}
                      <div className="flex items-center gap-1 bg-white/60 p-1 rounded-xl border border-white/80">
                        <button
                          onClick={() => handleQuickLog(sub.id, true)}
                          title="Marcar Presente"
                          className="p-1 rounded-lg text-[#4e6535] hover:bg-[#cde9ac]/80 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleQuickLog(sub.id, false)}
                          title="Marcar Ausente"
                          className="p-1 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6]/80 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-black/5 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isWarning ? 'bg-[#9e6b6e]' : isBorderline ? 'bg-[#d97706]' : 'bg-[#6ca561]'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Absence Simulator & Regulations (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Simulator Card */}
          <div className="rounded-[24px] glass-card p-5 sm:p-6 shadow-md shadow-[#864e5a]/10 border border-white/80 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#cde9ac] text-[#374d20] flex items-center justify-center font-bold">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-[15px] text-[#1b1c1c]">
                  Simulador de Inasistencias
                </h4>
                <p className="text-[11px] text-[#514345]/80">
                  Calcula el impacto antes de faltar a una clase
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#1b1c1c] mb-1">Seleccionar Materia</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-inner text-xs border border-white/90 outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.attendedClasses}/{s.totalClasses})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1b1c1c] mb-1">
                  Si falto a las próximas: <span className="text-[#864e5a]">{simulatedAbsences} clases</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={simulatedAbsences}
                  onChange={(e) => setSimulatedAbsences(Number(e.target.value))}
                  className="w-full accent-[#864e5a] h-1.5 bg-black/10 rounded-lg cursor-pointer"
                />
              </div>

              {/* Simulation Result Box */}
              <div
                className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                  isRegularSafe
                    ? 'bg-[#cde9ac]/40 border-[#b4cf95] text-[#283818]'
                    : 'bg-[#fadadd] border-[#9e6b6e]/30 text-[#6b3743]'
                }`}
              >
                {isRegularSafe ? (
                  <ShieldCheck className="w-5 h-5 text-[#4e6535] flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-[#ba1a1a] flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold text-[13px]">
                    Porcentaje Proyectado: {simProjectedPercent}%
                  </p>
                  <p className="text-[11px] mt-0.5 leading-relaxed">
                    {isRegularSafe
                      ? 'Mantendrías la condición de alumna regular (mayor al 80%).'
                      : '¡Cuidado! Caerías por debajo del 80% reglamentario y podrías perder el derecho a examen final directo.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FCM Academic Regulation Card */}
          <div className="rounded-[22px] glass-inner p-4 border border-white/90 text-xs text-[#514345] space-y-2">
            <h5 className="font-bold text-[#1b1c1c] text-[13px] flex items-center gap-1.5">
              <span>📋</span> Reglamento de Cursado FCM
            </h5>
            <ul className="space-y-1.5 text-[11px] list-disc list-inside text-[#514345]/90 leading-relaxed">
              <li>
                <strong>Teoría y Laboratorio:</strong> 80% mínimo de asistencia requerida.
              </li>
              <li>
                <strong>Justificaciones médicas:</strong> Deben presentarse en secretaría dentro de las 72 horas hábiles.
              </li>
              <li>
                <strong>Pérdida de regularidad:</strong> Menos del 75% requiere recursar la materia al año siguiente.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal for Full Register */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[24px] glass-card p-6 shadow-2xl border border-white">
            <h3 className="font-heading text-lg font-bold text-[#1b1c1c] mb-1">
              Registrar Asistencia del Día
            </h3>
            <p className="text-xs text-[#514345]/80 mb-4">
              Selecciona la materia que cursaste hoy para actualizar tus estadísticas.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1">Materia</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-inner text-xs border border-white/90 outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1">Nota o Observación (Opcional)</label>
                <input
                  type="text"
                  value={justificationNote}
                  onChange={(e) => setJustificationNote(e.target.value)}
                  placeholder="Ej: Clase de anatomía cardíaca / Presentado certificado"
                  className="w-full p-2.5 rounded-xl glass-inner text-xs border border-white/90 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleQuickLog(selectedSubjectId, true);
                    setShowLogModal(false);
                  }}
                  className="py-3 px-4 rounded-xl bg-[#4e6535] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:bg-[#3f532a]"
                >
                  <CheckCircle2 className="w-4 h-4" /> Presente (+1)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleQuickLog(selectedSubjectId, false);
                    setShowLogModal(false);
                  }}
                  className="py-3 px-4 rounded-xl bg-[#ba1a1a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:bg-[#93000a]"
                >
                  <XCircle className="w-4 h-4" /> Ausente (+1 falta)
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="w-full py-2 text-center text-xs font-bold text-[#514345] hover:bg-black/5 rounded-xl mt-1"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
