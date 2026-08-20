import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Play, Pause, RotateCcw, Sparkles, BookOpen, Layers, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Exam, Subject } from '../../types';
import { soundEngine } from '../../utils/audioSynthesizer';

interface ExamsViewProps {
  exams: Exam[];
  subjects: Subject[];
  onAddExam: (exam: Exam) => void;
}

interface Flashcard {
  id: string;
  subject: string;
  question: string;
  answer: string;
  hint: string;
}

const MEDICAL_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    subject: 'Anatomía Humana',
    question: '¿Cuáles son las ramas terminales del Plexo Braquial?',
    answer: 'Nervio Musculocutáneo, Nervio Axilar, Nervio Radial, Nervio Mediano y Nervio Cubital (Ulnar).',
    hint: 'Mnemotecnia: MARMU (Musculocutáneo, Axilar, Radial, Mediano, Ulnar)',
  },
  {
    id: 'fc-2',
    subject: 'Histología',
    question: '¿Qué tipo de epitelio reviste la tráquea y los bronquios principales?',
    answer: 'Epitelio pseudoestratificado cilíndrico ciliado con células caliciformes.',
    hint: 'Conocido como el "epitelio respiratorio" por excelencia.',
  },
  {
    id: 'fc-3',
    subject: 'Fisiología I',
    question: '¿Qué genera el primer ruido cardíaco (R1) y en qué fase ocurre?',
    answer: 'El cierre de las válvulas auriculoventriculares (Mitral y Tricúspide) al inicio de la sístole ventricular (contracción isovolumétrica).',
    hint: 'Corresponde al "LUB" del ciclo cardíaco.',
  },
  {
    id: 'fc-4',
    subject: 'Bioquímica',
    question: '¿Cuál es la enzima reguladora clave y limitante de la Glucólisis?',
    answer: 'La Fosfofructoquinasa-1 (PFK-1), estimulada por Fructosa-2,6-bisfosfato y AMP.',
    hint: 'Cataliza la conversión irreversible de Fructosa-6-P a Fructosa-1,6-BP.',
  },
  {
    id: 'fc-5',
    subject: 'Biología Celular',
    question: '¿Cuál es la función principal de la proteína p53 en el ciclo celular?',
    answer: 'Guardián del genoma: detecta daño en el ADN, detiene el ciclo celular en G1/S mediante p21, o induce apoptosis si el daño es irreparable.',
    hint: 'Gen supresor de tumores fundamental.',
  },
];

export const ExamsView: React.FC<ExamsViewProps> = ({ exams, subjects, onAddExam }) => {
  // Pomodoro Timer State
  const [pomodoroMode, setPomodoroMode] = useState<'study' | 'break'>('study');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 min
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [pomodoroCycles, setPomodoroCycles] = useState<number>(0);

  // Flashcards state
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [masteredCards, setMasteredCards] = useState<string[]>([]);

  // Add exam modal state
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSubjectId, setNewSubjectId] = useState<string>(subjects[0]?.id || '');
  const [newDate, setNewDate] = useState<string>('2026-09-15');
  const [newTime, setNewTime] = useState<string>('08:00');
  const [newClassroom, setNewClassroom] = useState<string>('Aula Magna');
  const [newWeight, setNewWeight] = useState<string>('30% Parcial');

  useEffect(() => {
    let interval: number;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer complete: switch mode
            if (pomodoroMode === 'study') {
              setPomodoroMode('break');
              setPomodoroCycles((c) => c + 1);
              return 5 * 60; // 5 min break
            } else {
              setPomodoroMode('study');
              return 25 * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroMode]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
    if (!isTimerRunning && pomodoroMode === 'study') {
      soundEngine.play('lofi-beats');
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(pomodoroMode === 'study' ? 25 * 60 : 5 * 60);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find((s) => s.id === newSubjectId);
    if (!subj) return;

    const newEx: Exam = {
      id: `ex-${Date.now()}`,
      subjectId: subj.id,
      subjectName: subj.name,
      title: newTitle,
      date: newDate,
      time: newTime,
      classroom: newClassroom,
      weight: newWeight,
      status: 'upcoming',
      topics: ['Temas del programa semestral'],
    };

    onAddExam(newEx);
    setIsAddOpen(false);
    setNewTitle('');
  };

  const currentCard = MEDICAL_FLASHCARDS[cardIndex];
  const isMastered = masteredCards.includes(currentCard.id);

  return (
    <div id="exams-view-screen" className="w-full flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-[28px] glass-card p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-[#864e5a]/10 border border-white/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffd9df] text-[#6b3743] border border-[#ffb7c5]">
              Calendario de Evaluaciones
            </span>
            <span className="text-xs text-[#514345] font-semibold">Facultad de Ciencias Médicas</span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-[#1b1c1c] tracking-tight">
            Exámenes, Parciales & Sala de Estudio
          </h2>
          <p className="text-xs sm:text-sm text-[#514345]/80">
            Monitorea fechas clave, practica con flashcards y enfócate con el temporizador Sakura.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-[#864e5a] hover:bg-[#6b3743] text-white text-xs font-bold shadow-md shadow-[#864e5a]/25 transition-all"
        >
          + Agregar Fecha de Examen
        </button>
      </div>

      {/* Main Grid: Left = Exams List, Right = Sakura Pomodoro & Flashcards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upcoming Exams Timeline (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <h3 className="font-heading text-lg font-bold text-[#1b1c1c] flex items-center gap-2 px-1">
            <Calendar className="w-5 h-5 text-[#864e5a]" />
            Próximas Evaluaciones Semestrales
          </h3>

          <div className="space-y-3.5">
            {exams.map((ex) => {
              const examDate = new Date(ex.date);
              const today = new Date();
              const diffTime = examDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={ex.id}
                  id={`exam-card-${ex.id}`}
                  className="rounded-[22px] glass-card p-5 border border-white/80 shadow-md hover:shadow-lg transition-all flex flex-col gap-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#ffb7c5]/30 text-[#864e5a] border border-[#ffb7c5]/60">
                          {ex.subjectName}
                        </span>
                        <span className="text-[11px] font-semibold text-[#514345]/80">
                          {ex.weight}
                        </span>
                      </div>
                      <h4 className="font-heading text-[16px] font-bold text-[#1b1c1c] group-hover:text-[#864e5a] transition-colors">
                        {ex.title}
                      </h4>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#cde9ac] text-[#374d20] border border-[#b4cf95]">
                        {diffDays > 0 ? `En ${diffDays} días` : '¡Hoy!'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#514345] pt-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#4e6535]" />
                      <span>
                        Fecha: <strong>{ex.date}</strong> a las <strong>{ex.time} hs</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#864e5a]" />
                      <span>{ex.classroom}</span>
                    </div>
                  </div>

                  {ex.topics && ex.topics.length > 0 && (
                    <div className="mt-1 pt-2 border-t border-black/5 flex flex-wrap gap-1.5">
                      {ex.topics.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium bg-white/70 px-2 py-0.5 rounded-lg text-[#514345] border border-white"
                        >
                          • {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Sakura Pomodoro & Medical Flashcards (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Sakura Pomodoro Timer Card */}
          <div className="rounded-[26px] glass-card p-5 sm:p-6 shadow-xl shadow-[#864e5a]/10 border border-white/80 flex flex-col items-center text-center gap-4 relative overflow-hidden">
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-bold text-[#864e5a] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#ffb7c5]" /> Sala de Enfoque Pomodoro
              </span>
              <span className="text-[11px] font-semibold text-[#514345] bg-white/60 px-2 py-0.5 rounded-full">
                Ciclo #{pomodoroCycles}
              </span>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 p-1 rounded-2xl glass-inner">
              <button
                onClick={() => {
                  setPomodoroMode('study');
                  setTimeLeft(25 * 60);
                  setIsTimerRunning(false);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  pomodoroMode === 'study'
                    ? 'bg-[#864e5a] text-white shadow-sm'
                    : 'text-[#514345] hover:bg-white/60'
                }`}
              >
                Estudio (25m)
              </button>
              <button
                onClick={() => {
                  setPomodoroMode('break');
                  setTimeLeft(5 * 60);
                  setIsTimerRunning(false);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  pomodoroMode === 'break'
                    ? 'bg-[#4e6535] text-white shadow-sm'
                    : 'text-[#514345] hover:bg-white/60'
                }`}
              >
                Pausa Té (5m)
              </button>
            </div>

            {/* Timer Display with circular glowing border */}
            <div className="w-40 h-40 rounded-full border-4 border-[#ffb7c5]/60 bg-white/50 flex flex-col items-center justify-center glow-pink my-1">
              <span className="font-heading text-4xl font-extrabold text-[#1b1c1c] tracking-tight">
                {formatTimer(timeLeft)}
              </span>
              <span className="text-[11px] font-semibold text-[#864e5a] mt-1 capitalize">
                {pomodoroMode === 'study' ? 'Tiempo de Estudio' : 'Descanso & Hidratación'}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                id="pomodoro-toggle-btn"
                onClick={toggleTimer}
                className={`px-6 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-md transition-all ${
                  isTimerRunning
                    ? 'bg-[#ba1a1a] text-white hover:bg-[#93000a]'
                    : 'bg-[#4e6535] text-white hover:bg-[#3d5029]'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Iniciar Sesión
                  </>
                )}
              </button>

              <button
                onClick={resetTimer}
                title="Reiniciar temporizador"
                className="p-2.5 rounded-2xl glass-inner text-[#514345] hover:bg-white/80 transition-all border border-white"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Medical Flashcard Card */}
          <div className="rounded-[26px] glass-card p-5 sm:p-6 shadow-xl shadow-[#864e5a]/10 border border-white/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#4e6535]" />
                <h4 className="font-heading font-bold text-sm text-[#1b1c1c]">
                  Tarjetas de Repaso Médico
                </h4>
              </div>
              <span className="text-xs font-semibold text-[#514345]">
                {cardIndex + 1} / {MEDICAL_FLASHCARDS.length}
              </span>
            </div>

            {/* Flip Card */}
            <div
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="min-h-[140px] p-4 rounded-[20px] bg-white/70 hover:bg-white/90 border border-white cursor-pointer transition-all flex flex-col justify-between shadow-sm relative group"
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-[#864e5a]">
                <span>{currentCard.subject}</span>
                <span className="text-[10px] text-[#514345]/70 bg-black/5 px-2 py-0.5 rounded-full">
                  {isCardFlipped ? 'Respuesta' : 'Pregunta (Click para voltear)'}
                </span>
              </div>

              <div className="my-2">
                {isCardFlipped ? (
                  <p className="text-xs sm:text-[13px] font-bold text-[#4e6535] leading-relaxed">
                    {currentCard.answer}
                  </p>
                ) : (
                  <p className="text-xs sm:text-[13px] font-semibold text-[#1b1c1c] leading-relaxed">
                    {currentCard.question}
                  </p>
                )}
              </div>

              <p className="text-[10px] text-[#514345]/80 italic">
                {isCardFlipped ? currentCard.hint : 'Pista: Toca para ver la respuesta completa'}
              </p>
            </div>

            {/* Flashcard navigation */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsCardFlipped(false);
                    setCardIndex((prev) => (prev > 0 ? prev - 1 : MEDICAL_FLASHCARDS.length - 1));
                  }}
                  className="p-2 rounded-xl glass-inner text-[#514345] hover:bg-white/80 transition-all"
                  aria-label="Anterior tarjeta"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsCardFlipped(false);
                    setCardIndex((prev) => (prev + 1) % MEDICAL_FLASHCARDS.length);
                  }}
                  className="p-2 rounded-xl glass-inner text-[#514345] hover:bg-white/80 transition-all"
                  aria-label="Siguiente tarjeta"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  if (isMastered) {
                    setMasteredCards(masteredCards.filter((id) => id !== currentCard.id));
                  } else {
                    setMasteredCards([...masteredCards, currentCard.id]);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isMastered
                    ? 'bg-[#cde9ac] text-[#374d20] border border-[#b4cf95]'
                    : 'glass-inner text-[#514345] hover:bg-white/80'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isMastered ? '¡Dominada!' : 'Marcar Dominada'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Exam Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[24px] glass-card p-6 shadow-2xl border border-white">
            <h3 className="font-heading text-lg font-bold text-[#1b1c1c] mb-1">
              Programar Nueva Evaluación
            </h3>
            <p className="text-xs text-[#514345]/80 mb-4">
              Añade exámenes parciales, prácticos o finales a tu calendario.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1">Materia</label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
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
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1">Título / Tipo</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: 1er Parcial Práctico de Microscopía"
                  className="w-full p-2.5 rounded-xl glass-inner text-xs border border-white/90 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1">Fecha</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-inner text-xs border border-white/90 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1">Hora</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-inner text-xs border border-white/90 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1">Lugar / Aula</label>
                  <input
                    type="text"
                    value={newClassroom}
                    onChange={(e) => setNewClassroom(e.target.value)}
                    className="w-full p-2.5 rounded-xl glass-inner text-xs border border-white/90 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1">Ponderación</label>
                  <input
                    type="text"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    placeholder="30% Semestre"
                    className="w-full p-2.5 rounded-xl glass-inner text-xs border border-white/90 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#514345] hover:bg-black/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#864e5a] text-white text-xs font-bold shadow-md hover:bg-[#6b3743]"
                >
                  Guardar Examen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
