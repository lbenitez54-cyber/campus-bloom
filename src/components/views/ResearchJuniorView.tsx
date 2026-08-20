import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Clock,
  Plus,
  Trash2,
  Calendar,
  ExternalLink,
  Edit3,
  CheckCircle2,
  AlertCircle,
  FolderSync,
  X,
  Play,
  Square,
  Sparkles,
  ChevronRight,
  GraduationCap,
  FileCheck,
  Award,
  CalendarDays,
  Bookmark,
  UserCheck,
  Save,
  Check,
  FileText,
} from 'lucide-react';
import { ResearchHourLog, ResearchProject, DefenseConfig } from '../../types';

interface ActiveSessionState {
  isActive: boolean;
  startTime: string | null;
  topic: string;
}

const DEFAULT_REQUIRED_HOURS = 15;
const DEFAULT_TUTOR = 'Dra. Gladys';

const DEFAULT_DEFENSE_CONFIG: DefenseConfig = {
  ordinaryDate: '15 Nov 2026',
  ordinaryNotes: 'Cierre de entrega de manuscritos: 31 de Octubre.',
  extraordinaryDate: '10 Dic 2026',
  extraordinaryNotes: 'Período complementario de defensas teóricas.',
  manuscriptApprovalStatus: 'Pendiente',
  customNotes: 'Defensa oral de 20 min ante el Tribunal de la FCM • UNCA.',
};

const INITIAL_HOUR_LOGS: ResearchHourLog[] = [
  {
    id: 'log-1',
    date: '2026-08-18',
    topic: 'Revisión bibliográfica sistemática en PubMed y Scopus',
    hours: 3,
    status: 'Culminado',
    notes: 'Selección de 15 artículos teóricos indexados sobre farmacología clínica.',
  },
  {
    id: 'log-2',
    date: '2026-08-16',
    topic: 'Tutoría: Estructuración del marco teórico y antecedentes',
    hours: 2,
    status: 'Culminado',
    notes: 'Ajustes en los antecedentes y delimitación de las preguntas de investigación.',
  },
  {
    id: 'log-3',
    date: '2026-08-14',
    topic: 'Redacción del marco conceptual y justificación académica',
    hours: 2,
    status: 'Culminado',
    notes: 'Capítulo 1 completado en formato Vancouver.',
  },
  {
    id: 'log-4',
    date: '2026-08-12',
    topic: 'Revisión y síntesis de literatura sobre guías de práctica clínica',
    hours: 1,
    status: 'En proceso',
    notes: 'Lectura en curso sobre consensos médicos internacionales.',
  },
];

const INITIAL_PROJECTS: ResearchProject[] = [
  {
    id: 'proj-1',
    title: 'Revisión Sistemática: Terapias Biológicas en Enfermedades Autoinmunes',
    description: 'Análisis documental y síntesis de evidencia clínica en publicaciones de los últimos 5 años.',
    advisor: 'Dra. Gladys',
    status: 'En proceso',
    lastUpdated: '18 Ago 2026',
    dueDate: '30 Oct 2026',
    linkUrl: 'https://drive.google.com',
  },
  {
    id: 'proj-2',
    title: 'Monografía Teórica: Ética y Bioética en la Práctica Médica Contemporánea',
    description: 'Estudio reflexivo sobre el consentimiento informado y la relación médico-paciente.',
    advisor: 'Dra. Gladys',
    status: 'Pendiente',
    lastUpdated: '10 Ago 2026',
    dueDate: '15 Nov 2026',
  },
  {
    id: 'proj-3',
    title: 'Protocolo de Investigación Académica: Marco Teórico y Justificación',
    description: 'Documento base con planteamiento del problema, hipótesis conceptuales y bibliografía.',
    advisor: 'Dra. Gladys',
    status: 'Culminado',
    lastUpdated: '05 Ago 2026',
    dueDate: '01 Ago 2026',
    linkUrl: 'https://drive.google.com',
  },
];

interface ResearchJuniorViewProps {
  userEmail?: string;
}

export const ResearchJuniorView: React.FC<ResearchJuniorViewProps> = ({
  userEmail = 'lbenitez54@fcmunca.edu.py',
}) => {
  const normalizedEmail = (userEmail || 'default').toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
  const targetHoursKey = `campusbloom_${normalizedEmail}_research_target_hours`;
  const tutorKey = `campusbloom_${normalizedEmail}_research_tutor`;
  const defenseConfigKey = `campusbloom_${normalizedEmail}_research_defense_config`;
  const logsKey = `campusbloom_${normalizedEmail}_research_junior_logs`;
  const projectsKey = `campusbloom_${normalizedEmail}_research_junior_projects`;
  const driveConfigKey = `campusbloom_${normalizedEmail}_research_drive_config`;
  const timerKey = `campusbloom_${normalizedEmail}_research_timer`;

  // 1. Dynamic Tutor Name (Editable, default 'Dra. Gladys')
  const [tutorName, setTutorName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(tutorKey);
      return saved ? saved : DEFAULT_TUTOR;
    } catch {
      return DEFAULT_TUTOR;
    }
  });
  const [isEditTutorOpen, setIsEditTutorOpen] = useState<boolean>(false);
  const [tutorInput, setTutorInput] = useState<string>(tutorName);

  // 2. Configurable Target Hours (Default 15 hours, editable to any number)
  const [targetHours, setTargetHours] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(targetHoursKey) || localStorage.getItem('campusbloom_research_target_hours');
      return saved ? Math.max(1, Number(saved) || DEFAULT_REQUIRED_HOURS) : DEFAULT_REQUIRED_HOURS;
    } catch {
      return DEFAULT_REQUIRED_HOURS;
    }
  });

  // Modal for editing Target Hours & Direct Hours Adjustment
  const [isEditTargetHoursOpen, setIsEditTargetHoursOpen] = useState<boolean>(false);
  const [editTargetInput, setEditTargetInput] = useState<number>(targetHours);
  const [directHourAdjustment, setDirectHourAdjustment] = useState<number>(0);

  // 3. Defense Config (Ordinary & Extraordinary dates, manuscript approval, notes)
  const [defenseConfig, setDefenseConfig] = useState<DefenseConfig>(() => {
    try {
      const saved = localStorage.getItem(defenseConfigKey);
      return saved ? JSON.parse(saved) : DEFAULT_DEFENSE_CONFIG;
    } catch {
      return DEFAULT_DEFENSE_CONFIG;
    }
  });
  const [isEditDefenseOpen, setIsEditDefenseOpen] = useState<boolean>(false);
  const [editDefenseForm, setEditDefenseForm] = useState<DefenseConfig>(defenseConfig);

  // 4. Persistence for Hour Logs
  const [logs, setLogs] = useState<ResearchHourLog[]>(() => {
    try {
      const saved = localStorage.getItem(logsKey) || localStorage.getItem('campusbloom_research_junior_logs');
      return saved ? JSON.parse(saved) : INITIAL_HOUR_LOGS;
    } catch {
      return INITIAL_HOUR_LOGS;
    }
  });

  // Modal for editing an existing log or adding a new log
  const [isAddLogOpen, setIsAddLogOpen] = useState<boolean>(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [logTopic, setLogTopic] = useState<string>('');
  const [logHours, setLogHours] = useState<number>(2);
  const [logStatus, setLogStatus] = useState<'En proceso' | 'Culminado'>('Culminado');
  const [logNotes, setLogNotes] = useState<string>('');

  // 5. Persistence for Projects & Project Modal
  const [projects, setProjects] = useState<ResearchProject[]>(() => {
    try {
      const saved = localStorage.getItem(projectsKey) || localStorage.getItem('campusbloom_research_junior_projects');
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projTitle, setProjTitle] = useState<string>('');
  const [projDesc, setProjDesc] = useState<string>('');
  const [projAdvisor, setProjAdvisor] = useState<string>(tutorName);
  const [projStatus, setProjStatus] = useState<'Pendiente' | 'En proceso' | 'Culminado'>('En proceso');
  const [projDueDate, setProjDueDate] = useState<string>('');
  const [projLinkUrl, setProjLinkUrl] = useState<string>('');

  // 6. Google Drive folder URL and title
  const [driveConfig, setDriveConfig] = useState<{ url: string; folderName: string }>(() => {
    try {
      const saved = localStorage.getItem(driveConfigKey) || localStorage.getItem('campusbloom_research_drive_config');
      return saved
        ? JSON.parse(saved)
        : {
            url: 'https://drive.google.com/drive/folders/campusbloom-investigacion-fcm',
            folderName: 'Tesis & Documentos Teóricos',
          };
    } catch {
      return {
        url: 'https://drive.google.com/drive/folders/campusbloom-investigacion-fcm',
        folderName: 'Tesis & Documentos Teóricos',
      };
    }
  });

  const [isDriveEditOpen, setIsDriveEditOpen] = useState<boolean>(false);
  const [driveFormUrl, setDriveFormUrl] = useState<string>(driveConfig.url);
  const [driveFormName, setDriveFormName] = useState<string>(driveConfig.folderName);

  // 7. Optional live timer state
  const [activeTimer, setActiveTimer] = useState<ActiveSessionState>(() => {
    try {
      const saved = localStorage.getItem(timerKey) || localStorage.getItem('campusbloom_research_timer');
      return saved ? JSON.parse(saved) : { isActive: false, startTime: null, topic: '' };
    } catch {
      return { isActive: false, startTime: null, topic: '' };
    }
  });
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Filters & Toast
  const [projectFilter, setProjectFilter] = useState<'todos' | 'En proceso' | 'Pendiente' | 'Culminado'>('todos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Reload when user email changes
  useEffect(() => {
    try {
      const savedTutor = localStorage.getItem(tutorKey);
      if (savedTutor) {
        setTutorName(savedTutor);
        setTutorInput(savedTutor);
      }

      const savedTarget = localStorage.getItem(targetHoursKey);
      if (savedTarget) setTargetHours(Math.max(1, Number(savedTarget)));

      const savedDefense = localStorage.getItem(defenseConfigKey);
      if (savedDefense) {
        setDefenseConfig(JSON.parse(savedDefense));
        setEditDefenseForm(JSON.parse(savedDefense));
      }

      const savedLogs = localStorage.getItem(logsKey);
      if (savedLogs) setLogs(JSON.parse(savedLogs));

      const savedProjects = localStorage.getItem(projectsKey);
      if (savedProjects) setProjects(JSON.parse(savedProjects));

      const savedDrive = localStorage.getItem(driveConfigKey);
      if (savedDrive) setDriveConfig(JSON.parse(savedDrive));
    } catch (err) {
      console.error('Error reloading user scoped research data', err);
    }
  }, [tutorKey, targetHoursKey, defenseConfigKey, logsKey, projectsKey, driveConfigKey]);

  // Save to user-scoped localStorage
  useEffect(() => {
    localStorage.setItem(tutorKey, tutorName);
  }, [tutorKey, tutorName]);

  useEffect(() => {
    localStorage.setItem(targetHoursKey, String(targetHours));
  }, [targetHoursKey, targetHours]);

  useEffect(() => {
    localStorage.setItem(defenseConfigKey, JSON.stringify(defenseConfig));
  }, [defenseConfigKey, defenseConfig]);

  useEffect(() => {
    localStorage.setItem(logsKey, JSON.stringify(logs));
  }, [logsKey, logs]);

  useEffect(() => {
    localStorage.setItem(projectsKey, JSON.stringify(projects));
  }, [projectsKey, projects]);

  useEffect(() => {
    localStorage.setItem(driveConfigKey, JSON.stringify(driveConfig));
  }, [driveConfigKey, driveConfig]);

  useEffect(() => {
    localStorage.setItem(timerKey, JSON.stringify(activeTimer));
  }, [timerKey, activeTimer]);

  // Live timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer.isActive && activeTimer.startTime) {
      const updateTime = () => {
        const start = new Date(activeTimer.startTime!).getTime();
        const diff = Math.max(0, Math.floor((Date.now() - start) / 1000));
        setElapsedSeconds(diff);
      };
      updateTime();
      interval = setInterval(updateTime, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer.isActive, activeTimer.startTime]);

  // Calculations
  const completedHoursTotal = logs.reduce((sum, item) => sum + (Number(item.hours) || 0), 0);
  const liveTimerHours = activeTimer.isActive ? +(elapsedSeconds / 3600).toFixed(1) : 0;
  const grandTotalHours = +(completedHoursTotal + liveTimerHours).toFixed(1);

  const effectiveTarget = Math.max(1, targetHours);
  const progressPercentage = Math.min(100, Math.round((grandTotalHours / effectiveTarget) * 100));
  const hoursRemaining = Math.max(0, +(effectiveTarget - grandTotalHours).toFixed(1));
  const isEligibleForDefense = grandTotalHours >= effectiveTarget;

  // Tutor Save Handler
  const handleSaveTutor = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTutor = tutorInput.trim() || DEFAULT_TUTOR;
    setTutorName(cleanTutor);
    setIsEditTutorOpen(false);
    showToast(`Tutor/a actualizado a "${cleanTutor}"`);
  };

  // Defense Save Handler
  const handleSaveDefenseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setDefenseConfig(editDefenseForm);
    setIsEditDefenseOpen(false);
    showToast('¡Fechas y notas de defensas actualizadas con éxito!');
  };

  // Add or Edit Log Handler
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTopic.trim()) return;

    if (editingLogId) {
      // Edit existing log
      setLogs((prev) =>
        prev.map((l) =>
          l.id === editingLogId
            ? {
                ...l,
                date: logDate,
                topic: logTopic.trim(),
                hours: Number(logHours) || 1,
                status: logStatus,
                notes: logNotes.trim() || undefined,
              }
            : l
        )
      );
      setEditingLogId(null);
      showToast('Registro de horas modificado correctamente.');
    } else {
      // Create new log
      const newLog: ResearchHourLog = {
        id: `log-${Date.now()}`,
        date: logDate,
        topic: logTopic.trim(),
        hours: Number(logHours) || 1,
        status: logStatus,
        notes: logNotes.trim() || undefined,
      };
      setLogs((prev) => [newLog, ...prev]);
      showToast(`+${newLog.hours}h añadidas al registro de investigación.`);
    }

    setIsAddLogOpen(false);
    setLogTopic('');
    setLogNotes('');
    setLogHours(2);
  };

  const handleOpenEditLog = (log: ResearchHourLog) => {
    setEditingLogId(log.id);
    setLogDate(log.date);
    setLogTopic(log.topic);
    setLogHours(log.hours);
    setLogStatus(log.status as 'En proceso' | 'Culminado');
    setLogNotes(log.notes || '');
    setIsAddLogOpen(true);
  };

  // Delete Log
  const handleDeleteLog = (id: string) => {
    if (window.confirm('¿Segura que deseas eliminar este registro de horas?')) {
      setLogs((prev) => prev.filter((l) => l.id !== id));
      showToast('Registro de horas eliminado.');
    }
  };

  // Toggle log status directly
  const handleToggleLogStatus = (id: string) => {
    setLogs((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const nextStatus = l.status === 'Culminado' ? 'En proceso' : 'Culminado';
          return { ...l, status: nextStatus };
        }
        return l;
      })
    );
  };

  // Open Project Modal for Create or Edit
  const handleOpenCreateProject = () => {
    setEditingProjectId(null);
    setProjTitle('');
    setProjDesc('');
    setProjAdvisor(tutorName);
    setProjStatus('En proceso');
    setProjDueDate('');
    setProjLinkUrl('');
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (project: ResearchProject) => {
    setEditingProjectId(project.id);
    setProjTitle(project.title);
    setProjDesc(project.description);
    setProjAdvisor(project.advisor || tutorName);
    setProjStatus(project.status);
    setProjDueDate(project.dueDate || '');
    setProjLinkUrl(project.linkUrl || '');
    setIsProjectModalOpen(true);
  };

  // Save Project (Create or Edit)
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;

    if (editingProjectId) {
      // Update existing project
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProjectId
            ? {
                ...p,
                title: projTitle.trim(),
                description: projDesc.trim() || 'Proyecto de investigación teórica.',
                advisor: projAdvisor.trim() || tutorName,
                status: projStatus,
                dueDate: projDueDate.trim() || undefined,
                linkUrl: projLinkUrl.trim() || undefined,
                lastUpdated: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
              }
            : p
        )
      );
      showToast('Proyecto actualizado con éxito.');
    } else {
      // Create new project
      const newProject: ResearchProject = {
        id: `proj-${Date.now()}`,
        title: projTitle.trim(),
        description: projDesc.trim() || 'Proyecto de investigación teórica.',
        advisor: projAdvisor.trim() || tutorName,
        status: projStatus,
        dueDate: projDueDate.trim() || undefined,
        linkUrl: projLinkUrl.trim() || undefined,
        lastUpdated: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
      setProjects((prev) => [newProject, ...prev]);
      showToast('Nuevo proyecto de investigación creado.');
    }

    setIsProjectModalOpen(false);
  };

  // Toggle Project Status Cycle
  const handleCycleProjectStatus = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          let next: 'Pendiente' | 'En proceso' | 'Culminado' = 'En proceso';
          if (p.status === 'Pendiente') next = 'En proceso';
          else if (p.status === 'En proceso') next = 'Culminado';
          else next = 'Pendiente';
          return { ...p, status: next };
        }
        return p;
      })
    );
  };

  // Delete Project
  const handleDeleteProject = (id: string) => {
    if (window.confirm('¿Segura que deseas eliminar este proyecto de investigación?')) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      showToast('Proyecto eliminado.');
    }
  };

  // Direct Hours Adjustment
  const handleApplyHoursAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const nextTarget = Math.max(1, Number(editTargetInput) || DEFAULT_REQUIRED_HOURS);
    setTargetHours(nextTarget);

    if (directHourAdjustment !== 0) {
      const adjustmentLog: ResearchHourLog = {
        id: `log-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        topic: `Ajuste manual de horas de investigación (${directHourAdjustment > 0 ? '+' : ''}${directHourAdjustment}h)`,
        hours: directHourAdjustment,
        status: 'Culminado',
        notes: `Ajuste directo aplicado por el usuario con ${tutorName}.`,
      };
      setLogs((prev) => [adjustmentLog, ...prev]);
    }

    setIsEditTargetHoursOpen(false);
    setDirectHourAdjustment(0);
    showToast(`Meta de ${nextTarget}h guardada.`);
  };

  // Live Timer Check-in / Check-out
  const handleStartTimer = () => {
    setActiveTimer({
      isActive: true,
      startTime: new Date().toISOString(),
      topic: `Sesión de lectura y tutoría con ${tutorName}`,
    });
    showToast(`Cronómetro de investigación iniciado con ${tutorName}`);
  };

  const handleStopTimer = () => {
    if (!activeTimer.startTime) return;
    const startMs = new Date(activeTimer.startTime).getTime();
    const nowMs = Date.now();
    const hoursSpent = Math.max(0.5, Math.round(((nowMs - startMs) / (1000 * 3600)) * 10) / 10);

    const newLog: ResearchHourLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      topic: activeTimer.topic.trim() || `Sesión de investigación con ${tutorName}`,
      hours: hoursSpent,
      status: 'Culminado',
      notes: `Registrado automáticamente (${Math.round((nowMs - startMs) / 60000)} min de sesión).`,
    };

    setLogs((prev) => [newLog, ...prev]);
    setActiveTimer({ isActive: false, startTime: null, topic: '' });
    showToast(`+${hoursSpent}h registradas en tu historial de ${tutorName}`);
  };

  const filteredProjects = projects.filter((p) => {
    if (projectFilter === 'todos') return true;
    return p.status === projectFilter;
  });

  return (
    <div id="research-junior-container" className="space-y-6 sm:space-y-8 animate-fadeIn text-[#1b1c1c] pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-[#283818] text-[#cde9ac] text-xs font-bold shadow-2xl flex items-center gap-2 border border-[#8cb86d] animate-bounce">
          <Sparkles className="w-4 h-4 text-[#ffd9df]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-7 rounded-[30px] bloom-glass border border-white/90 shadow-lg shadow-[#4e6535]/10 bg-gradient-to-r from-white/95 via-white/85 to-[#f4faf0]/80">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#cde9ac] to-[#a8cf7a] text-[#374d20] shadow-md shadow-[#4e6535]/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#1b1c1c] tracking-tight">
                Investigación
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#ffd9df] text-[#864e5a] border border-[#ffccd5]">
                Investigadora Junior
              </span>

              {/* Editable Tutor Badge with discreet pencil */}
              <button
                id="research-header-tutor-btn"
                onClick={() => {
                  setTutorInput(tutorName);
                  setIsEditTutorOpen(true);
                }}
                className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#cde9ac] hover:bg-[#bde096] text-[#374d20] border border-[#b4cf95] flex items-center gap-1.5 transition-all shadow-2xs group cursor-pointer"
                title="Hacer clic para editar el nombre del Tutor/a"
              >
                <span>Tutoría: {tutorName}</span>
                <Edit3 className="w-3 h-3 text-[#374d20] opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-[#514345] font-medium mt-0.5">
              Control de horas requeridas, registro de temas y seguimiento de proyectos con {tutorName}.
            </p>
          </div>
        </div>

        {/* Highlighted Google Drive Button & Edit Action */}
        <div className="flex items-center gap-2">
          <a
            id="research-open-drive-btn"
            href={driveConfig.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#ffd9df] via-[#ffccd5] to-[#fedbc7] hover:from-[#ffccd5] hover:to-[#facbb2] text-[#6b3743] border border-[#ffb7c5] shadow-md shadow-[#864e5a]/15 font-bold text-xs sm:text-sm transition-all group hover:scale-[1.02]"
            title="Abrir carpeta de investigación en Google Drive"
          >
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
              </svg>
            </div>
            <div className="text-left overflow-hidden">
              <span className="block text-[10px] text-[#864e5a] uppercase tracking-wider font-black">
                📁 Carpeta de Investigación (Google Drive)
              </span>
              <span className="block text-xs font-black truncate max-w-[150px] sm:max-w-[200px] text-[#514345]">
                {driveConfig.folderName} ({tutorName})
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-[#864e5a] group-hover:translate-x-0.5 transition-transform" />
          </a>

          <button
            onClick={() => {
              setDriveFormUrl(driveConfig.url);
              setDriveFormName(driveConfig.folderName);
              setIsDriveEditOpen(true);
            }}
            className="p-3 rounded-2xl bloom-inner text-[#514345] hover:text-[#1b1c1c] hover:bg-white transition-all shadow-2xs border border-white"
            title="Editar enlace y nombre de la carpeta Google Drive"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: 3D Visual Hours Cylinder & Defense Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): 3D Translucent Glass Cylinder Visualizer & Defensas */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card 1: 3D Cylinder Visualizer */}
          <div
            id="research-3d-hours-cylinder-card"
            className="p-5 sm:p-6 rounded-[28px] bloom-glass border border-white/90 shadow-xl shadow-[#4e6535]/15 bg-gradient-to-b from-white/95 via-white/85 to-[#f4faf0]/85 relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#cde9ac] text-[#374d20] shadow-xs">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading text-sm sm:text-base font-extrabold text-[#1b1c1c]">
                    Contador de Horas
                  </h3>
                  <button
                    onClick={() => {
                      setTutorInput(tutorName);
                      setIsEditTutorOpen(true);
                    }}
                    className="text-[11px] text-[#514345] font-medium hover:text-[#374d20] hover:underline flex items-center gap-1 group"
                    title="Editar Tutor/a"
                  >
                    <span>Tutoría con {tutorName}</span>
                    <Edit3 className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                  </button>
                </div>
              </div>

              {/* Editable Target Hours Badge */}
              <button
                id="research-edit-target-hours-btn"
                onClick={() => {
                  setEditTargetInput(targetHours);
                  setDirectHourAdjustment(0);
                  setIsEditTargetHoursOpen(true);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-[#ffd9df] hover:bg-[#ffccd5] text-[#864e5a] border border-[#ffb7c5] flex items-center gap-1.5 transition-all shadow-xs group cursor-pointer"
                title="Hacer clic para personalizar la meta y las horas completadas"
              >
                <span>Meta: {targetHours}h</span>
                <Edit3 className="w-3 h-3 text-[#864e5a] group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* 3D Glass Cylinder Container Component */}
            <div className="py-4 flex flex-col items-center justify-center">
              <div className="relative w-52 sm:w-56 h-72 flex items-center justify-center">
                {/* 3D Cylindrical Glass Vessel */}
                <div
                  className="relative w-36 h-64 rounded-[32px] border-4 border-white/95 shadow-2xl bg-gradient-to-r from-white/40 via-white/10 to-white/40 backdrop-blur-md overflow-hidden flex flex-col justify-end"
                  style={{
                    boxShadow:
                      'inset 0 0 25px rgba(255, 255, 255, 0.9), inset -4px 0 10px rgba(0, 0, 0, 0.05), 0 20px 40px -10px rgba(78, 101, 53, 0.25)',
                  }}
                >
                  {/* Graduated markings dynamically rendered based on targetHours */}
                  <div className="absolute left-2.5 top-0 bottom-0 flex flex-col justify-between py-6 z-20 pointer-events-none opacity-75">
                    <div className="flex items-center gap-1">
                      <span className="w-3 border-b-2 border-[#374d20]/60" />
                      <span className="text-[10px] font-mono font-extrabold text-[#374d20]">
                        {targetHours}h
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 border-b border-[#374d20]/50" />
                      <span className="text-[9px] font-mono font-bold text-[#374d20]/80">
                        {Math.round(targetHours * 0.66)}h
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 border-b border-[#374d20]/50" />
                      <span className="text-[9px] font-mono font-bold text-[#374d20]/80">
                        {Math.round(targetHours * 0.33)}h
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 border-b border-[#374d20]/40" />
                      <span className="text-[9px] font-mono font-bold text-[#374d20]/60">0h</span>
                    </div>
                  </div>

                  {/* Top Cylinder Rim Accent */}
                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/90 to-white/40 border-b border-white/90 rounded-t-2xl z-20 shadow-xs" />

                  {/* 3D Glass Light Glare / Highlights */}
                  <div className="absolute top-2 left-2 bottom-2 w-2 rounded-full bg-gradient-to-b from-white/95 via-white/30 to-transparent z-20 pointer-events-none" />
                  <div className="absolute top-4 right-2 bottom-4 w-1 rounded-full bg-gradient-to-b from-white/80 via-white/20 to-transparent z-20 pointer-events-none" />

                  {/* Matcha / Sakura Fluid Dynamic Fill */}
                  <motion.div
                    initial={{ height: '0%' }}
                    animate={{ height: `${Math.max(8, progressPercentage)}%` }}
                    transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full relative overflow-hidden bg-gradient-to-t from-[#4e6535] via-[#6ba539] to-[#a3db74] flex items-center justify-center shadow-inner"
                  >
                    {/* Glowing meniscus line at the surface */}
                    <div className="absolute -top-2.5 left-0 right-0 h-5 bg-[#d4f8b6]/90 rounded-[50%] blur-[1px] animate-pulse" />

                    {/* Sakura subtle particles / soft pattern */}
                    <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:10px_10px]" />

                    {/* Inner light glow */}
                    <div className="absolute bottom-2 left-3 right-3 h-5 rounded-full bg-white/20 blur-xs pointer-events-none" />
                  </motion.div>

                  {/* Central Progress Number Badge */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none text-center px-2">
                    <div className="px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-white text-[#1b1c1c]">
                      <div className="font-extrabold text-2xl font-mono tracking-tight text-[#2d4019]">
                        {grandTotalHours}{' '}
                        <span className="text-xs text-[#514345] font-sans">/ {targetHours}h</span>
                      </div>
                      <span className="text-[10px] font-extrabold text-[#864e5a] uppercase tracking-wider block">
                        {progressPercentage}% Completado
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status text under cylinder */}
              <div className="mt-2 text-center space-y-1.5 w-full">
                <div className="text-base font-extrabold text-[#1b1c1c]">
                  {grandTotalHours} / {targetHours} Horas Completadas
                </div>

                {hoursRemaining > 0 ? (
                  <p className="text-xs font-semibold text-[#864e5a] bg-[#ffd9df]/70 px-3 py-1 rounded-full inline-block border border-[#ffccd5]">
                    🌸 Faltan {hoursRemaining} horas con {tutorName} para la meta
                  </p>
                ) : (
                  <p className="text-xs font-extrabold text-[#374d20] bg-[#cde9ac] px-3 py-1 rounded-full inline-block border border-[#b4cf95]">
                    🎉 ¡Completaste las {targetHours} horas requeridas con {tutorName}!
                  </p>
                )}
              </div>
            </div>

            {/* Quick Live Session (Optional simple timer) & Direct Edit Hours */}
            <div className="mt-4 pt-4 border-t border-black/5">
              {activeTimer.isActive ? (
                <div className="p-3.5 rounded-2xl bg-[#ffd9df]/60 border border-[#ffccd5] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#864e5a]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-ping" />
                      Sesión en curso con {tutorName}
                    </span>
                    <span className="font-mono text-sm">{Math.floor(elapsedSeconds / 60)} min</span>
                  </div>
                  <button
                    onClick={handleStopTimer}
                    className="w-full py-2 px-3 rounded-xl bg-[#864e5a] hover:bg-[#703d48] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" /> Detener y Guardar Horas
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingLogId(null);
                      setLogDate(new Date().toISOString().split('T')[0]);
                      setLogTopic(`Tutoría y revisión con ${tutorName}`);
                      setLogHours(2);
                      setLogStatus('Culminado');
                      setLogNotes('');
                      setIsAddLogOpen(true);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#4e6535] hover:bg-[#3d5029] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Sumar Horas
                  </button>

                  <button
                    onClick={() => {
                      setEditTargetInput(targetHours);
                      setDirectHourAdjustment(0);
                      setIsEditTargetHoursOpen(true);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-white/80 hover:bg-white text-[#864e5a] text-xs font-bold border border-[#ffccd5] transition-all flex items-center gap-1.5 shadow-2xs"
                    title="Editar meta y ajustar horas"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Ajustar Meta
                  </button>

                  <button
                    onClick={handleStartTimer}
                    className="p-2.5 rounded-xl bg-white/80 hover:bg-white text-[#4e6535] hover:text-[#1b1c1c] text-xs font-bold border border-black/10 transition-all flex items-center justify-center shadow-2xs"
                    title={`Iniciar cronómetro con ${tutorName}`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Recordatorio de Defensas y Fechas Importantes (100% Personalizable) */}
          <div
            id="research-defense-reminder-card"
            className="p-5 sm:p-6 rounded-[28px] bloom-glass border border-white/90 shadow-lg shadow-[#4e6535]/10 space-y-4 bg-gradient-to-br from-white/95 to-[#fffafb]/80"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#ffd9df] text-[#864e5a] shadow-xs">
                  <GraduationCap className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-heading text-sm sm:text-base font-extrabold text-[#1b1c1c]">
                    Defensas & Fechas
                  </h3>
                  <p className="text-[11px] text-[#514345] font-medium">
                    Estado de presentación FCM • UNCA
                  </p>
                </div>
              </div>

              <button
                id="btn-edit-defense-config"
                onClick={() => {
                  setEditDefenseForm(defenseConfig);
                  setIsEditDefenseOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-[#864e5a] text-xs font-bold border border-[#ffccd5] flex items-center gap-1.5 transition-all shadow-2xs group"
                title="Editar fechas de defensa y notas de recordatorio"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#864e5a] group-hover:scale-110 transition-transform" />
                <span>Editar Defensas</span>
              </button>
            </div>

            {/* Big Status Badge */}
            <div
              className={`p-4 rounded-2xl border text-center space-y-1 ${
                isEligibleForDefense
                  ? 'bg-[#cde9ac]/50 border-[#b4cf95] text-[#2d4019]'
                  : 'bg-[#ffd9df]/50 border-[#ffccd5] text-[#864e5a]'
              }`}
            >
              <span className="text-[10px] font-extrabold uppercase tracking-wider block">
                Estado Actual de Presentación
              </span>
              <div className="font-extrabold text-sm sm:text-base">
                {isEligibleForDefense
                  ? '✓ Habilitada para presentar ante el Tribunal'
                  : 'Aún no habilitada para presentar'}
              </div>
              <p className="text-[11px] opacity-85">
                {isEligibleForDefense
                  ? `Has cumplido las ${targetHours} horas de tutoría con ${tutorName}.`
                  : `Se requiere completar ${targetHours} horas con ${tutorName} (llevas ${grandTotalHours}h).`}
              </p>
            </div>

            {/* Checklist of Requirements */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-[#1b1c1c] block text-[11px] uppercase tracking-wider">
                Requisitos para la Habilitación:
              </span>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 border border-white">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      grandTotalHours >= targetHours ? 'bg-[#4e6535] text-white' : 'bg-black/10 text-[#514345]'
                    }`}
                  >
                    {grandTotalHours >= targetHours ? '✓' : '•'}
                  </div>
                  <span className="font-medium text-[#1b1c1c]">
                    {targetHours} Horas de tutoría con {tutorName}
                  </span>
                </div>
                <span className="font-bold text-[#4e6535] text-[11px]">
                  {grandTotalHours}/{targetHours}h
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 border border-white">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      projects.some((p) => p.status === 'Culminado')
                        ? 'bg-[#4e6535] text-white'
                        : 'bg-black/10 text-[#514345]'
                    }`}
                  >
                    {projects.some((p) => p.status === 'Culminado') ? '✓' : '•'}
                  </div>
                  <span className="font-medium text-[#1b1c1c]">
                    Al menos 1 proyecto en estado 'Culminado'
                  </span>
                </div>
                <span className="font-bold text-[#514345] text-[11px]">
                  {projects.filter((p) => p.status === 'Culminado').length} listo
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 border border-white">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      defenseConfig.manuscriptApprovalStatus === 'Aprobado'
                        ? 'bg-[#4e6535] text-white'
                        : 'bg-black/10 text-[#514345]'
                    }`}
                  >
                    {defenseConfig.manuscriptApprovalStatus === 'Aprobado' ? '✓' : '•'}
                  </div>
                  <span className="font-medium text-[#1b1c1c]">
                    Aprobación de manuscrito por {tutorName}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    defenseConfig.manuscriptApprovalStatus === 'Aprobado'
                      ? 'bg-[#cde9ac] text-[#374d20]'
                      : defenseConfig.manuscriptApprovalStatus === 'En revisión'
                      ? 'bg-[#fedbc7] text-[#864e5a]'
                      : 'bg-black/5 text-[#514345]'
                  }`}
                >
                  {defenseConfig.manuscriptApprovalStatus}
                </span>
              </div>
            </div>

            {/* Upcoming Defense Dates (Configured) */}
            <div className="pt-2 space-y-2">
              <span className="font-bold text-[#1b1c1c] block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-[#864e5a]" /> Próximas Fechas de Defensa
              </span>

              <div className="p-3 rounded-2xl bg-white/80 border border-white shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1b1c1c]">Convocatoria Ordinaria</span>
                  <span className="font-bold text-[#864e5a]">{defenseConfig.ordinaryDate}</span>
                </div>
                <p className="text-[11px] text-[#514345]">
                  {defenseConfig.ordinaryNotes}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/60 border border-white shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1b1c1c]">Convocatoria Extraordinaria</span>
                  <span className="font-bold text-[#514345]">{defenseConfig.extraordinaryDate}</span>
                </div>
                <p className="text-[11px] text-[#514345]/80">
                  {defenseConfig.extraordinaryNotes}
                </p>
              </div>

              {defenseConfig.customNotes && (
                <div className="p-2.5 rounded-xl bg-[#ffd9df]/40 border border-[#ffccd5]/60 text-[11px] text-[#864e5a] italic">
                  💡 {defenseConfig.customNotes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Control de Asistencia & Mis Proyectos */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Control de Asistencia y Horas */}
          <div
            id="research-attendance-logs-section"
            className="p-5 sm:p-6 rounded-[28px] bloom-glass border border-white/90 shadow-lg shadow-[#4e6535]/10 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#cde9ac] text-[#374d20] shadow-xs">
                  <FileCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-extrabold text-[#1b1c1c]">
                    Control de Asistencia & Horas
                  </h3>
                  <p className="text-[11.5px] text-[#514345] font-medium">
                    Sesiones teóricas, lecturas y revisiones con {tutorName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingLogId(null);
                  setLogDate(new Date().toISOString().split('T')[0]);
                  setLogTopic('');
                  setLogHours(2);
                  setLogStatus('Culminado');
                  setLogNotes('');
                  setIsAddLogOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#4e6535] hover:bg-[#3d5029] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
              >
                <Plus className="w-3.5 h-3.5" /> Registrar Horas
              </button>
            </div>

            {/* List of Hour Logs */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="py-8 text-center text-[#514345] space-y-1">
                  <p className="text-xs font-bold">No hay registros de horas aún.</p>
                  <p className="text-[11px] opacity-75">
                    Haz clic en "Registrar Horas" para sumar tus sesiones teóricas con {tutorName}.
                  </p>
                </div>
              ) : (
                logs.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-white/75 hover:bg-white/95 border border-white/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-2xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-[#1b1c1c]">
                          {new Date(item.date).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>

                        {/* Status Tag (Click to toggle) */}
                        <button
                          onClick={() => handleToggleLogStatus(item.id)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border transition-all ${
                            item.status === 'Culminado'
                              ? 'bg-[#cde9ac] text-[#374d20] border-[#b4cf95]'
                              : 'bg-[#fedbc7] text-[#864e5a] border-[#ffccd5]'
                          }`}
                          title="Hacer clic para cambiar estado"
                        >
                          {item.status === 'Culminado' ? '✓ Culminado' : '⏳ En proceso'}
                        </button>
                      </div>

                      <p className="text-xs text-[#352c2d] font-semibold">{item.topic}</p>
                      {item.notes && (
                        <p className="text-[11px] text-[#514345]/80 italic">{item.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
                      <button
                        onClick={() => handleOpenEditLog(item)}
                        className="px-3 py-1.5 rounded-xl bg-[#ffd9df] hover:bg-[#ffccd5] text-[#783e4c] font-mono text-xs font-extrabold border border-[#ffccd5] flex items-center gap-1 transition-all group/btn shadow-2xs"
                        title="Hacer clic para editar horas y detalles"
                      >
                        <span>+{item.hours} {item.hours === 1 ? 'hora' : 'horas'}</span>
                        <Edit3 className="w-3 h-3 text-[#864e5a] opacity-75 group-hover/btn:opacity-100" />
                      </button>

                      <button
                        onClick={() => handleOpenEditLog(item)}
                        className="p-1.5 rounded-lg text-[#514345] hover:text-[#1b1c1c] hover:bg-black/5 opacity-80 group-hover:opacity-100 transition-all"
                        title="Editar registro"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteLog(item.id)}
                        className="p-1.5 rounded-lg text-[#514345] hover:text-[#ba1a1a] hover:bg-black/5 opacity-80 group-hover:opacity-100 transition-all"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Section 2: Mis Proyectos & Tareas (100% Dinámicos y Editables) */}
          <div
            id="research-projects-section"
            className="p-5 sm:p-6 rounded-[28px] bloom-glass border border-white/90 shadow-lg shadow-[#4e6535]/10 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#ffd9df] text-[#864e5a] shadow-xs">
                  <Bookmark className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-extrabold text-[#1b1c1c]">
                    Mis Proyectos & Tareas
                  </h3>
                  <p className="text-[11.5px] text-[#514345] font-medium">
                    Monografías, revisiones teóricas y entregas académicas
                  </p>
                </div>
              </div>

              <button
                onClick={handleOpenCreateProject}
                className="px-3.5 py-1.5 rounded-xl bg-[#864e5a] hover:bg-[#703d48] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
              >
                <Plus className="w-3.5 h-3.5" /> Nuevo Proyecto
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs font-bold flex-wrap">
              {(['todos', 'En proceso', 'Pendiente', 'Culminado'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setProjectFilter(filter)}
                  className={`px-3 py-1 rounded-xl text-[11px] transition-all capitalize ${
                    projectFilter === filter
                      ? 'bg-[#4e6535] text-white shadow-xs'
                      : 'bg-black/5 text-[#514345] hover:bg-black/10'
                  }`}
                >
                  {filter === 'todos' ? 'Todos los Proyectos' : filter}
                </button>
              ))}
            </div>

            {/* Project Cards */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredProjects.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#514345] space-y-2">
                  <p className="font-bold">No hay proyectos en esta categoría.</p>
                  <button
                    onClick={handleOpenCreateProject}
                    className="text-xs text-[#864e5a] font-bold underline inline-block"
                  >
                    Crear un nuevo proyecto ahora
                  </button>
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <motion.div
                    key={project.id}
                    layout
                    className="p-4 rounded-2xl bg-white/80 hover:bg-white border border-white/90 shadow-2xs transition-all space-y-2.5 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Simple Status Tag: Pendiente, En proceso, Culminado */}
                          <button
                            onClick={() => handleCycleProjectStatus(project.id)}
                            className={`px-2.5 py-0.5 rounded-lg text-[10.5px] font-extrabold border transition-all cursor-pointer ${
                              project.status === 'Culminado'
                                ? 'bg-[#cde9ac] text-[#374d20] border-[#b4cf95]'
                                : project.status === 'En proceso'
                                ? 'bg-[#fedbc7] text-[#864e5a] border-[#ffccd5]'
                                : 'bg-black/5 text-[#514345] border-black/10'
                            }`}
                            title="Haz clic para alternar: Pendiente → En proceso → Culminado"
                          >
                            {project.status === 'Culminado' && '✓ Culminado'}
                            {project.status === 'En proceso' && '⏳ En proceso'}
                            {project.status === 'Pendiente' && '⚪ Pendiente'}
                          </button>

                          <span className="text-[11px] font-bold text-[#514345]">
                            Tutor/a: <strong className="text-[#1b1c1c]">{project.advisor || tutorName}</strong>
                          </span>

                          {project.dueDate && (
                            <span className="text-[10px] font-bold text-[#864e5a] bg-[#ffd9df]/60 px-2 py-0.5 rounded-md">
                              Entrega: {project.dueDate}
                            </span>
                          )}
                        </div>

                        <h4
                          onClick={() => handleOpenEditProject(project)}
                          className="font-heading text-sm font-extrabold text-[#1b1c1c] hover:text-[#864e5a] cursor-pointer transition-colors flex items-center gap-1.5"
                          title="Hacer clic para editar proyecto"
                        >
                          <span>{project.title}</span>
                          <Edit3 className="w-3 h-3 text-[#864e5a] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditProject(project)}
                          className="p-1.5 rounded-lg text-[#514345] hover:text-[#864e5a] hover:bg-black/5 opacity-80 group-hover:opacity-100 transition-all"
                          title="Editar proyecto"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-1.5 rounded-lg text-[#514345] hover:text-[#ba1a1a] hover:bg-black/5 opacity-80 group-hover:opacity-100 transition-all"
                          title="Eliminar proyecto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-[#514345] leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-black/5 text-[10.5px] text-[#514345]">
                      <span>Última actualización: {project.lastUpdated || 'Reciente'}</span>
                      {project.linkUrl ? (
                        <a
                          href={project.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-[#864e5a] hover:underline flex items-center gap-1"
                        >
                          Ver documento <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <button
                          onClick={() => handleOpenEditProject(project)}
                          className="text-[10px] text-[#514345] hover:text-[#864e5a] underline"
                        >
                          + Añadir enlace Drive
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODALS FOR COMPLETE DYNAMIC EDITING
          ========================================================================= */}

      {/* Modal 1: Edit Tutor Name */}
      <AnimatePresence>
        {isEditTutorOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-white space-y-4 text-[#1b1c1c]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#4e6535]">
                  <UserCheck className="w-5 h-5" />
                  <h3 className="font-heading font-extrabold text-base">
                    Personalizar Tutor/a de Investigación
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditTutorOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-black/5 text-[#514345]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#514345]">
                Ingresa el nombre del docente, médico o tutor/a a cargo de tu investigación académica. Por defecto se sugiere <strong>Dra. Gladys</strong>, pero puedes escribir cualquier nombre.
              </p>

              <form onSubmit={handleSaveTutor} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#514345] block">
                    Nombre del Tutor/a:
                  </label>
                  <input
                    type="text"
                    value={tutorInput}
                    onChange={(e) => setTutorInput(e.target.value)}
                    placeholder="Ej: Dra. Gladys o Dr. Roberto Arzamendia"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.03] border border-black/10 text-sm font-bold focus:ring-2 focus:ring-[#4e6535]/20 outline-none"
                  />
                </div>

                {/* Suggestions */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#514345] block">Sugerencias rápidas:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Dra. Gladys', 'Dr. Roberto Arzamendia', 'Dra. Carmen Benítez', 'Dr. Walter Cardozo'].map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setTutorInput(name)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                          tutorInput === name
                            ? 'bg-[#cde9ac] text-[#374d20] border-[#b4cf95]'
                            : 'bg-black/5 text-[#514345] border-transparent hover:bg-black/10'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-black/5">
                  <button
                    type="button"
                    onClick={() => setIsEditTutorOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#514345] hover:bg-black/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#4e6535] hover:bg-[#3d5029] text-white text-xs font-bold shadow-md shadow-[#4e6535]/20"
                  >
                    Guardar Tutor/a
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Edit Target Hours & Direct Completed Hours Adjustment */}
      <AnimatePresence>
        {isEditTargetHoursOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-white space-y-4 text-[#1b1c1c]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#4e6535]">
                  <Clock className="w-5 h-5" />
                  <h3 className="font-heading font-extrabold text-base">
                    Personalizar Meta & Horas de Investigación
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditTargetHoursOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-black/5 text-[#514345]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#514345]">
                Configura la meta de horas totales requeridas con <strong>{tutorName}</strong> y opcionalmente añade un ajuste directo a tus horas completadas para sincronizar el gráfico 3D cilíndrico.
              </p>

              <form onSubmit={handleApplyHoursAdjustment} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#514345] block">
                    Meta Total de Horas Requeridas:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="500"
                      step="1"
                      value={editTargetInput}
                      onChange={(e) => setEditTargetInput(Number(e.target.value))}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.03] border border-black/10 text-base font-mono font-extrabold focus:ring-2 focus:ring-[#4e6535]/20 outline-none"
                    />
                    <span className="text-xs font-bold text-[#514345] px-2">horas</span>
                  </div>
                </div>

                {/* Preset shortcuts */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-[#514345] block">Accesos rápidos de meta:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 15, 20, 30].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setEditTargetInput(preset)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                          editTargetInput === preset
                            ? 'bg-[#cde9ac] text-[#374d20] border-[#b4cf95] shadow-xs'
                            : 'bg-black/5 text-[#514345] border-transparent hover:bg-black/10'
                        }`}
                      >
                        {preset}h
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct Adjustment Option */}
                <div className="p-3.5 rounded-2xl bg-black/[0.02] border border-black/5 space-y-2">
                  <label className="text-xs font-bold text-[#514345] block">
                    Ajuste Rápido de Horas Completadas (Opcional):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      value={directHourAdjustment}
                      onChange={(e) => setDirectHourAdjustment(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-xs font-mono font-bold outline-none"
                    />
                    <span className="text-xs text-[#514345]">horas (+ / -)</span>
                  </div>
                  <span className="text-[10px] text-[#514345] block">
                    Horas actuales registradas: <strong>{completedHoursTotal}h</strong>. Si sumas {directHourAdjustment}h, el nuevo total será {+(completedHoursTotal + directHourAdjustment).toFixed(1)}h.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-black/5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditTargetInput(DEFAULT_REQUIRED_HOURS);
                      setDirectHourAdjustment(0);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-[#864e5a] hover:bg-[#ffd9df]/50"
                  >
                    Restablecer (15h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditTargetHoursOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#514345] hover:bg-black/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#4e6535] hover:bg-[#3d5029] text-white text-xs font-bold shadow-md shadow-[#4e6535]/20"
                  >
                    Guardar Configuración
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 3: Edit Defense Dates and Presentation Reminders */}
      <AnimatePresence>
        {isEditDefenseOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-[28px] p-6 shadow-2xl border border-white space-y-4 text-[#1b1c1c] max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#864e5a]">
                  <GraduationCap className="w-5 h-5" />
                  <h3 className="font-heading font-extrabold text-base">
                    Editar Fechas & Notas de Defensas
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditDefenseOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-black/5 text-[#514345]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveDefenseConfig} className="space-y-3.5 text-xs">
                {/* Convocatoria Ordinaria */}
                <div className="p-3 rounded-2xl bg-black/[0.02] border border-black/5 space-y-2">
                  <span className="font-bold text-[#1b1c1c] block text-[11px] uppercase tracking-wider">
                    Convocatoria Ordinaria
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-[#514345] mb-1 block">Fecha de Defensa:</label>
                      <input
                        type="text"
                        value={editDefenseForm.ordinaryDate}
                        onChange={(e) =>
                          setEditDefenseForm({ ...editDefenseForm, ordinaryDate: e.target.value })
                        }
                        placeholder="Ej: 15 Nov 2026"
                        required
                        className="w-full p-2 rounded-xl bg-white border border-black/10 outline-none focus:ring-2 focus:ring-[#864e5a]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#514345] mb-1 block">Detalles / Cierre:</label>
                      <input
                        type="text"
                        value={editDefenseForm.ordinaryNotes}
                        onChange={(e) =>
                          setEditDefenseForm({ ...editDefenseForm, ordinaryNotes: e.target.value })
                        }
                        placeholder="Ej: Cierre de entrega de manuscritos: 31 de Octubre."
                        className="w-full p-2 rounded-xl bg-white border border-black/10 outline-none focus:ring-2 focus:ring-[#864e5a]"
                      />
                    </div>
                  </div>
                </div>

                {/* Convocatoria Extraordinaria */}
                <div className="p-3 rounded-2xl bg-black/[0.02] border border-black/5 space-y-2">
                  <span className="font-bold text-[#1b1c1c] block text-[11px] uppercase tracking-wider">
                    Convocatoria Extraordinaria
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-[#514345] mb-1 block">Fecha de Defensa:</label>
                      <input
                        type="text"
                        value={editDefenseForm.extraordinaryDate}
                        onChange={(e) =>
                          setEditDefenseForm({ ...editDefenseForm, extraordinaryDate: e.target.value })
                        }
                        placeholder="Ej: 10 Dic 2026"
                        required
                        className="w-full p-2 rounded-xl bg-white border border-black/10 outline-none focus:ring-2 focus:ring-[#864e5a]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#514345] mb-1 block">Detalles / Notas:</label>
                      <input
                        type="text"
                        value={editDefenseForm.extraordinaryNotes}
                        onChange={(e) =>
                          setEditDefenseForm({ ...editDefenseForm, extraordinaryNotes: e.target.value })
                        }
                        placeholder="Ej: Período complementario de defensas teóricas."
                        className="w-full p-2 rounded-xl bg-white border border-black/10 outline-none focus:ring-2 focus:ring-[#864e5a]"
                      />
                    </div>
                  </div>
                </div>

                {/* Estado de Manuscrito */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[#514345] block">
                    Estado de Aprobación de Manuscrito por {tutorName}:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Pendiente', 'En revisión', 'Aprobado'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() =>
                          setEditDefenseForm({ ...editDefenseForm, manuscriptApprovalStatus: st })
                        }
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                          editDefenseForm.manuscriptApprovalStatus === st
                            ? st === 'Aprobado'
                              ? 'bg-[#cde9ac] text-[#374d20] border-[#b4cf95] shadow-xs'
                              : st === 'En revisión'
                              ? 'bg-[#fedbc7] text-[#864e5a] border-[#ffccd5] shadow-xs'
                              : 'bg-black/10 text-[#1b1c1c] border-black/20 shadow-xs'
                            : 'bg-black/5 text-[#514345] border-transparent hover:bg-black/10'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Notes */}
                <div className="space-y-1">
                  <label className="font-bold text-[#514345] block">
                    Notas y recordatorios para el Tribunal Examinador:
                  </label>
                  <textarea
                    rows={2}
                    value={editDefenseForm.customNotes || ''}
                    onChange={(e) =>
                      setEditDefenseForm({ ...editDefenseForm, customNotes: e.target.value })
                    }
                    placeholder="Ej: Preparar presentación con diapositivas oficiales de la FCM..."
                    className="w-full p-2.5 rounded-xl bg-black/[0.03] border border-black/10 outline-none focus:ring-2 focus:ring-[#864e5a] resize-none"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-black/5">
                  <button
                    type="button"
                    onClick={() => setIsEditDefenseOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#514345] hover:bg-black/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#864e5a] hover:bg-[#703d48] text-white text-xs font-bold shadow-md shadow-[#864e5a]/20"
                  >
                    Guardar Defensas
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 4: Add / Edit Hours Log */}
      <AnimatePresence>
        {isAddLogOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-white space-y-4 text-[#1b1c1c]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#4e6535]">
                  <Clock className="w-5 h-5" />
                  <h3 className="font-heading font-extrabold text-base">
                    {editingLogId ? 'Editar Registro de Horas' : 'Registrar Horas de Investigación'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddLogOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-black/5 text-[#514345]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveLog} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#514345] block">Fecha:</label>
                    <input
                      type="date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/10 text-xs font-semibold focus:ring-2 focus:ring-[#4e6535]/20 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#514345] block">Horas dedicadas:</label>
                    <select
                      value={logHours}
                      onChange={(e) => setLogHours(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/10 text-xs font-semibold focus:ring-2 focus:ring-[#4e6535]/20 outline-none"
                    >
                      <option value={0.5}>0.5 horas (30 min)</option>
                      <option value={1}>1 hora</option>
                      <option value={1.5}>1.5 horas</option>
                      <option value={2}>2 horas</option>
                      <option value={2.5}>2.5 horas</option>
                      <option value={3}>3 horas</option>
                      <option value={4}>4 horas</option>
                      <option value={5}>5 horas</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#514345] block">Tema Revisado:</label>
                  <input
                    type="text"
                    value={logTopic}
                    onChange={(e) => setLogTopic(e.target.value)}
                    placeholder={`Ej: Tutoría con ${tutorName} o lectura sistemática`}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/10 text-xs font-medium focus:ring-2 focus:ring-[#4e6535]/20 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#514345] block">Estado de la sesión:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLogStatus('Culminado')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        logStatus === 'Culminado'
                          ? 'bg-[#cde9ac] text-[#374d20] border-[#b4cf95] shadow-xs'
                          : 'bg-black/5 text-[#514345] border-transparent'
                      }`}
                    >
                      ✓ Culminado
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogStatus('En proceso')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        logStatus === 'En proceso'
                          ? 'bg-[#ffd9df] text-[#864e5a] border-[#ffccd5] shadow-xs'
                          : 'bg-black/5 text-[#514345] border-transparent'
                      }`}
                    >
                      ⏳ En proceso
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#514345] block">Notas breves (opcional):</label>
                  <textarea
                    rows={2}
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    placeholder="Detalles sobre lo avanzado..."
                    className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/10 text-xs font-medium focus:ring-2 focus:ring-[#4e6535]/20 outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddLogOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#514345] hover:bg-black/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#4e6535] hover:bg-[#3d5029] text-white text-xs font-bold shadow-md shadow-[#4e6535]/20"
                  >
                    {editingLogId ? 'Guardar Cambios' : 'Guardar Registro'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 5: Create / Edit Project */}
      <AnimatePresence>
        {isProjectModalOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-white space-y-4 text-[#1b1c1c]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#864e5a]">
                  <Bookmark className="w-5 h-5" />
                  <h3 className="font-heading font-extrabold text-base">
                    {editingProjectId ? 'Editar Proyecto de Investigación' : 'Nuevo Proyecto de Investigación'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsProjectModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-black/5 text-[#514345]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-[#514345] block">Título del Proyecto *</label>
                  <input
                    type="text"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    placeholder="Ej: Revisión Sistemática sobre..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.03] border border-black/10 text-xs font-bold focus:ring-2 focus:ring-[#864e5a]/20 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#514345] block">Tutor/a:</label>
                    <input
                      type="text"
                      value={projAdvisor}
                      onChange={(e) => setProjAdvisor(e.target.value)}
                      placeholder={tutorName}
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/10 text-xs font-medium focus:ring-2 focus:ring-[#864e5a]/20 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#514345] block">Fecha Límite / Entrega:</label>
                    <input
                      type="text"
                      value={projDueDate}
                      onChange={(e) => setProjDueDate(e.target.value)}
                      placeholder="Ej: 30 Oct 2026"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/10 text-xs font-medium focus:ring-2 focus:ring-[#864e5a]/20 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#514345] block">Estado del Proyecto:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Pendiente', 'En proceso', 'Culminado'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setProjStatus(st)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                          projStatus === st
                            ? st === 'Culminado'
                              ? 'bg-[#cde9ac] text-[#374d20] border-[#b4cf95] shadow-xs'
                              : st === 'En proceso'
                              ? 'bg-[#fedbc7] text-[#864e5a] border-[#ffccd5] shadow-xs'
                              : 'bg-black/10 text-[#1b1c1c] border-black/20 shadow-xs'
                            : 'bg-black/5 text-[#514345] border-transparent hover:bg-black/10'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#514345] block">Descripción u Objetivos:</label>
                  <textarea
                    rows={2.5}
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    placeholder="Breve resumen del contenido o preguntas de investigación..."
                    className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/10 text-xs font-medium focus:ring-2 focus:ring-[#864e5a]/20 outline-none resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#514345] block">Enlace a Google Drive o Documento (Opcional):</label>
                  <input
                    type="url"
                    value={projLinkUrl}
                    onChange={(e) => setProjLinkUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/10 text-xs font-mono focus:ring-2 focus:ring-[#864e5a]/20 outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProjectModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#514345] hover:bg-black/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#864e5a] hover:bg-[#703d48] text-white text-xs font-bold shadow-md shadow-[#864e5a]/20"
                  >
                    {editingProjectId ? 'Guardar Cambios' : 'Crear Proyecto'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 6: Edit Google Drive URL */}
      <AnimatePresence>
        {isDriveEditOpen && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-[26px] p-6 shadow-2xl border border-white space-y-4 text-[#1b1c1c]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#6b3743]">
                  <FolderSync className="w-5 h-5" />
                  <h3 className="font-heading font-extrabold text-base">
                    Configurar Carpeta de Google Drive
                  </h3>
                </div>
                <button
                  onClick={() => setIsDriveEditOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-black/5 text-[#514345]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setDriveConfig({
                    url: driveFormUrl.trim() || 'https://drive.google.com',
                    folderName: driveFormName.trim() || 'Tesis & Documentos Teóricos',
                  });
                  setIsDriveEditOpen(false);
                  showToast('Enlace de Google Drive actualizado.');
                }}
                className="space-y-3.5 text-xs"
              >
                <div className="space-y-1">
                  <label className="font-bold text-[#514345] block">
                    Nombre de la Carpeta:
                  </label>
                  <input
                    type="text"
                    value={driveFormName}
                    onChange={(e) => setDriveFormName(e.target.value)}
                    placeholder="Tesis & Documentos Teóricos"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.03] border border-black/10 text-xs font-medium focus:ring-2 focus:ring-[#864e5a]/20 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#514345] block">
                    Enlace de Google Drive:
                  </label>
                  <input
                    type="url"
                    value={driveFormUrl}
                    onChange={(e) => setDriveFormUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.03] border border-black/10 text-xs font-medium focus:ring-2 focus:ring-[#864e5a]/20 outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDriveEditOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#514345] hover:bg-black/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#864e5a] hover:bg-[#6f3d48] text-white text-xs font-bold shadow-md shadow-[#864e5a]/20"
                  >
                    Guardar Enlace
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
