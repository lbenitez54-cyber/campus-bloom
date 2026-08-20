import React, { useState } from 'react';
import { X, BookOpen, UserCheck, MapPin, Award, Calendar, Save, CheckCircle2 } from 'lucide-react';
import { Subject } from '../../types';

interface SubjectDetailModalProps {
  subject: Subject | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSubject: (updated: Subject) => void;
}

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  subject,
  isOpen,
  onClose,
  onUpdateSubject,
}) => {
  if (!isOpen || !subject) return null;

  const [grade, setGrade] = useState<number>(subject.grade);
  const [professor, setProfessor] = useState<string>(subject.professor);
  const [classroom, setClassroom] = useState<string>(subject.classroom);
  const [saved, setSaved] = useState<boolean>(false);

  const attendancePercent = Math.round(
    (subject.attendedClasses / (subject.totalClasses || 1)) * 100
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSubject({
      ...subject,
      grade,
      professor,
      classroom,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-[28px] glass-card p-6 sm:p-7 shadow-2xl border border-white flex flex-col gap-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#864e5a] text-white flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-[#ffb7c5]" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-[#1b1c1c]">
                {subject.name}
              </h3>
              <p className="text-xs text-[#514345]/80">
                Detalles de Cátedra & Calificación
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#514345] hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saved ? (
          <div className="p-6 rounded-2xl bg-[#cde9ac]/80 border border-[#4e6535] text-center flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-[#4e6535]" />
            <h4 className="font-heading font-bold text-base text-[#1b1c1c]">
              ¡Materia Actualizada!
            </h4>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl glass-inner border border-white/80">
                <span className="text-[11px] text-[#514345] font-semibold">Calificación Actual</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Award className="w-4 h-4 text-[#4e6535]" />
                  <span className="font-heading text-lg font-extrabold text-[#4e6535]">
                    {grade.toFixed(1)} / {subject.maxGrade}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl glass-inner border border-white/80">
                <span className="text-[11px] text-[#514345] font-semibold">Asistencia en Cátedra</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Calendar className="w-4 h-4 text-[#864e5a]" />
                  <span className="font-heading text-lg font-extrabold text-[#1b1c1c]">
                    {attendancePercent}% ({subject.attendedClasses}/{subject.totalClasses})
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Grade Slider */}
            <div className="p-3.5 rounded-2xl bg-white/60 border border-white space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#1b1c1c]">
                <label>Ajustar Nota Promedio:</label>
                <span className="text-sm font-extrabold text-[#4e6535]">{grade.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                value={grade}
                onChange={(e) => setGrade(parseFloat(e.target.value))}
                className="w-full accent-[#4e6535] h-1.5 bg-black/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Professor & Classroom inputs */}
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-[#1b1c1c] mb-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-[#514345]" /> Docente a Cargo
                </label>
                <input
                  type="text"
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-inner text-xs border border-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#1b1c1c] mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#864e5a]" /> Ubicación / Aula
                </label>
                <input
                  type="text"
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-inner text-xs border border-white outline-none"
                  required
                />
              </div>
            </div>

            {subject.upcomingExam && (
              <div className="p-3 rounded-xl bg-[#ffd9df]/50 border border-[#ffb7c5] text-[11px] text-[#6b3743]">
                <strong>Próxima Evaluación:</strong> {subject.upcomingExam} ({subject.examDate})
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl font-bold text-[#514345] hover:bg-black/5"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#4e6535] text-white font-bold flex items-center gap-1.5 shadow-md hover:bg-[#3d5029]"
              >
                <Save className="w-3.5 h-3.5" /> Guardar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
