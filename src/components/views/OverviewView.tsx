import React, { useState, useMemo } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  BookOpen,
  ChevronRight,
  Award,
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  ReferenceLine,
} from 'recharts';
import { StudentProfile, Subject } from '../../types';
import { SpotifyWidget } from '../widgets/SpotifyWidget';
import { PdfUploadWidget } from '../widgets/PdfUploadWidget';

interface OverviewViewProps {
  profile: StudentProfile;
  subjects: Subject[];
  onOpenBackgroundModal: () => void;
  onOpenPdfModal: () => void;
  onSelectSubject: (subject: Subject) => void;
  onNavigateToAttendance: () => void;
  onNavigateToExams: () => void;
  onNavigateToResearch?: () => void;
}

type ChartViewType = 'bar' | 'donut';

// Custom Tooltip for Bar Chart
interface CustomBarTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      fullName: string;
      grade: number;
      maxGrade: number;
      professor: string;
      credits: number;
      percentage: number;
      color: string;
    };
  }>;
}

const CustomBarTooltip: React.FC<CustomBarTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl shadow-[#864e5a]/15 border border-white text-xs space-y-1.5 min-w-[200px] z-50">
        <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-1.5">
          <span className="font-bold text-[#1b1c1c] text-sm">{data.fullName}</span>
          <span
            className="px-2 py-0.5 rounded-full font-bold text-[11px] text-white shadow-xs"
            style={{ backgroundColor: data.color }}
          >
            {data.grade.toFixed(1)} / {data.maxGrade}
          </span>
        </div>
        <p className="text-[#514345] font-medium flex items-center justify-between">
          <span>Profesor/a:</span>
          <span className="font-bold text-[#1b1c1c] truncate max-w-[120px]">{data.professor}</span>
        </p>
        <p className="text-[#514345] font-medium flex items-center justify-between">
          <span>Créditos:</span>
          <span className="font-bold text-[#4e6535]">{data.credits} créditos</span>
        </p>
        <p className="text-[#514345] font-medium flex items-center justify-between">
          <span>Rendimiento:</span>
          <span className="font-bold text-[#864e5a]">{data.percentage}%</span>
        </p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Donut Chart
interface CustomDonutTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      count: number;
      percentage: number;
      subjects: string[];
      color: string;
    };
  }>;
}

const CustomDonutTooltip: React.FC<CustomDonutTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl shadow-[#864e5a]/15 border border-white text-xs space-y-1.5 min-w-[210px] z-50">
        <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-1.5">
          <span className="font-bold text-[#1b1c1c]">{data.name}</span>
          <span
            className="px-2 py-0.5 rounded-full font-bold text-[11px] text-white"
            style={{ backgroundColor: data.color }}
          >
            {data.count} {data.count === 1 ? 'materia' : 'materias'} ({data.percentage}%)
          </span>
        </div>
        <div>
          <p className="text-[11px] font-bold text-[#514345] mb-1">Materias en este rango:</p>
          <ul className="list-disc list-inside text-[#1b1c1c] space-y-0.5">
            {data.subjects.map((sub, i) => (
              <li key={i} className="truncate">
                {sub}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  return null;
};

export const OverviewView: React.FC<OverviewViewProps> = ({
  profile,
  subjects,
  onOpenBackgroundModal,
  onOpenPdfModal,
  onSelectSubject,
  onNavigateToAttendance,
  onNavigateToExams,
  onNavigateToResearch,
}) => {
  const [chartView, setChartView] = useState<ChartViewType>('bar');

  const attendancePercentage = Math.round(
    (profile.attendedClasses / (profile.totalClasses || 1)) * 100
  );

  // SVG parameters for circular progress gauge
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (attendancePercentage / 100) * circumference;

  // Data preparation for Bar Chart
  const barChartData = useMemo(() => {
    return subjects.map((s) => {
      // Color coding according to botanical theme & performance
      let barColor = '#4e6535'; // Deep Matcha (>= 4.5)
      if (s.grade >= 4.5) {
        barColor = '#4e6535';
      } else if (s.grade >= 4.0) {
        barColor = '#82a77d';
      } else if (s.grade >= 3.0) {
        barColor = '#e098a7';
      } else {
        barColor = '#ba1a1a';
      }

      // Format short name for XAxis
      const shortName =
        s.name.length > 12 ? s.name.substring(0, 11) + '…' : s.name;

      return {
        id: s.id,
        name: shortName,
        fullName: s.name,
        grade: Number(s.grade.toFixed(1)),
        maxGrade: s.maxGrade,
        professor: s.professor,
        credits: s.credits,
        percentage: Math.round((s.grade / s.maxGrade) * 100),
        color: barColor,
        rawSubject: s,
      };
    });
  }, [subjects]);

  // Data preparation for Donut Distribution Chart
  const donutChartData = useMemo(() => {
    const total = subjects.length || 1;
    const tierOutstanding = subjects.filter((s) => s.grade >= 4.5);
    const tierGood = subjects.filter((s) => s.grade >= 4.0 && s.grade < 4.5);
    const tierPassing = subjects.filter((s) => s.grade >= 3.0 && s.grade < 4.0);
    const tierAtRisk = subjects.filter((s) => s.grade < 3.0);

    const categories = [
      {
        name: 'Sobresaliente (4.5 - 5.0)',
        count: tierOutstanding.length,
        percentage: Math.round((tierOutstanding.length / total) * 100),
        color: '#4e6535', // Deep Forest Matcha
        subjects: tierOutstanding.map((s) => `${s.name} (${s.grade.toFixed(1)})`),
      },
      {
        name: 'Notable (4.0 - 4.4)',
        count: tierGood.length,
        percentage: Math.round((tierGood.length / total) * 100),
        color: '#82a77d', // Soft Matcha Green
        subjects: tierGood.map((s) => `${s.name} (${s.grade.toFixed(1)})`),
      },
      {
        name: 'Aprobado (3.0 - 3.9)',
        count: tierPassing.length,
        percentage: Math.round((tierPassing.length / total) * 100),
        color: '#e098a7', // Sakura Soft Rose
        subjects: tierPassing.map((s) => `${s.name} (${s.grade.toFixed(1)})`),
      },
      {
        name: 'Por Reforzar (< 3.0)',
        count: tierAtRisk.length,
        percentage: Math.round((tierAtRisk.length / total) * 100),
        color: '#ba1a1a', // Alert Red
        subjects: tierAtRisk.map((s) => `${s.name} (${s.grade.toFixed(1)})`),
      },
    ];

    // Filter out 0 count tiers so pie chart renders cleanly
    return categories.filter((c) => c.count > 0);
  }, [subjects]);

  // Key Highlights Calculation
  const highestSubject = useMemo(() => {
    if (!subjects.length) return null;
    return [...subjects].sort((a, b) => b.grade - a.grade)[0];
  }, [subjects]);

  const totalCredits = useMemo(() => {
    return subjects.reduce((sum, s) => sum + s.credits, 0);
  }, [subjects]);

  const passingRate = useMemo(() => {
    if (!subjects.length) return 100;
    const passed = subjects.filter((s) => s.grade >= 3.0).length;
    return Math.round((passed / subjects.length) * 100);
  }, [subjects]);

  return (
    <div id="overview-view-screen" className="w-full flex flex-col lg:flex-row items-stretch gap-5 max-w-7xl mx-auto">
      {/* Central Main Column */}
      <div className="flex-1 flex flex-col gap-5">
        {/* Central Main Student Card */}
        <div className="rounded-[28px] glass-card p-6 sm:p-8 flex flex-col items-center shadow-xl shadow-[#864e5a]/10 border border-white/80 relative overflow-hidden backdrop-blur-xl">
          {/* Subtle decorative background glow */}
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#ffb7c5]/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-[#cde9ac]/30 rounded-full blur-3xl pointer-events-none" />

          {/* Modern Framed Student Avatar with Ambient Glow & Sleek Squircle Glass */}
          <div
            id="overview-profile-avatar-frame"
            className="relative mb-3 group cursor-pointer"
            onClick={onOpenBackgroundModal}
            title="Click para cambiar fondo o personalizar"
          >
            {/* Ambient Glow Aura */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#ff9ebb] via-[#ffccd5] to-[#a3d977] rounded-[32px] opacity-65 blur-md group-hover:opacity-95 group-hover:blur-lg transition-all duration-500" />

            {/* Modern Layered Squircle Frame */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[26px] p-1.5 bg-gradient-to-br from-white/95 via-white/60 to-white/30 backdrop-blur-xl shadow-xl shadow-[#864e5a]/15 border border-white/95 ring-1 ring-black/5 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5">
              {/* Inner Image Container */}
              <div className="w-full h-full rounded-[20px] overflow-hidden border border-white/80 shadow-inner relative bg-[#ffd9df]/30">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/20 pointer-events-none" />
              </div>
            </div>

            {/* Modern Status Badge with Live Pulse */}
            <div className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-[#1b1c1c]/85 backdrop-blur-md border border-white/80 shadow-md flex items-center gap-1.5 text-white transition-transform group-hover:scale-105" title="Estudiante Activa - Facultad de Ciencias Médicas">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#cde9ac] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6ca561]"></span>
              </span>
              <span className="text-[10px] font-bold tracking-tight text-[#cde9ac]">FCM</span>
            </div>
          </div>

          {/* Student Title */}
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1b1c1c] text-center tracking-tight mb-6">
            {profile.name} - {profile.title}
          </h2>

          {/* Main Content Grid inside Hero Card */}
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Academic info & Attendance Circle & Change Background Button */}
            <div className="md:col-span-6 flex flex-col justify-between gap-5">
              {/* University & Degree Info */}
              <div className="space-y-1 text-[#3b3335] text-[13px] sm:text-[14px]">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-[#1b1c1c]">Universidad:</span>
                  <span className="font-medium text-[#4a4647]">{profile.university}</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-bold text-[#1b1c1c]">Carrera:</span>
                  <span className="font-medium text-[#4a4647]">{profile.career}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#1b1c1c]">Promedio Actual:</span>
                  <span className="font-bold text-[#4e6535] bg-[#cde9ac]/50 px-2 py-0.5 rounded-full text-xs border border-[#b4cf95]/60 flex items-center gap-1">
                    <Award className="w-3 h-3 text-[#4e6535]" /> {profile.gpa} / 5.0
                  </span>
                </div>
              </div>

              {/* Circular Attendance Gauge */}
              <div
                onClick={onNavigateToAttendance}
                className="flex items-center gap-4 p-3 rounded-2xl bg-white/40 hover:bg-white/70 border border-white/60 transition-all cursor-pointer group"
                title="Click para ver detalle de asistencia"
              >
                {/* Circular Gauge */}
                <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-24 h-24 -rotate-90 transform" viewBox="0 0 100 100">
                    {/* Background Track */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      className="text-[#ffb7c5]/30"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    {/* Progress Indicator in Matcha Green */}
                    <circle
                      cx="50"
                      cy="50"
                      r={radius}
                      className="text-[#6ca561] transition-all duration-1000 ease-out"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  {/* Center Percentage */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-heading text-xl font-extrabold text-[#1b1c1c]">
                      {attendancePercentage}%
                    </span>
                  </div>
                </div>

                {/* Attendance Text info */}
                <div className="space-y-1 text-[13px] sm:text-[14px]">
                  <p className="text-[#1b1c1c] font-semibold">
                    Clases Totales: <span className="font-normal text-[#514345]">{profile.totalClasses}</span>
                  </p>
                  <p className="text-[#1b1c1c] font-semibold">
                    Clases Asistidas: <span className="font-bold text-[#4e6535]">{profile.attendedClasses}</span>
                  </p>
                  <span className="inline-block text-[11px] text-[#864e5a] font-bold group-hover:underline">
                    Ver registro detallado →
                  </span>
                </div>
              </div>

              {/* "Cambiar Fondo" Matcha Pill Button */}
              <button
                id="change-background-hero-btn"
                onClick={onOpenBackgroundModal}
                className="w-full py-3.5 px-6 rounded-[20px] bg-gradient-to-r from-[#4e6535] to-[#618342] hover:from-[#3f532a] hover:to-[#527036] text-white font-bold text-[14px] sm:text-[15px] shadow-md shadow-[#4e6535]/25 border border-white/40 flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <ImageIcon className="w-5 h-5 text-[#cde9ac]" />
                <span>Cambiar Fondo</span>
              </button>
            </div>

            {/* Right Column: "Mis Materias" Progress list */}
            <div className="md:col-span-6">
              <div className="rounded-[22px] bg-white/60 p-4 sm:p-5 border border-white/85 shadow-sm flex flex-col gap-3.5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-[16px] sm:text-[17px] font-bold text-[#1b1c1c] tracking-tight flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#864e5a]" />
                    Mis Materias
                  </h3>
                  <span className="text-xs font-semibold text-[#864e5a] hover:underline cursor-pointer" onClick={onNavigateToExams}>
                    Evaluaciones →
                  </span>
                </div>

                {/* Subject items with custom Matcha progress bars */}
                <div className="space-y-3">
                  {subjects.map((subject) => {
                    const percent = Math.round((subject.grade / subject.maxGrade) * 100);
                    return (
                      <div
                        key={subject.id}
                        id={`subject-item-${subject.id}`}
                        onClick={() => onSelectSubject(subject)}
                        className="group cursor-pointer p-1.5 rounded-xl hover:bg-white/80 transition-all"
                        title="Click para ver temario y notas"
                      >
                        <div className="flex items-center justify-between text-[13px] sm:text-[14px] mb-1.5">
                          <span className="font-semibold text-[#2c2426] group-hover:text-[#864e5a] transition-colors flex items-center gap-1">
                            {subject.name}
                            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#864e5a]" />
                          </span>
                          <span className="font-bold text-[#4e6535]">
                            {subject.grade.toFixed(1)}/{subject.maxGrade}
                          </span>
                        </div>

                        {/* Matcha progress bar */}
                        <div className="w-full h-2.5 bg-[#e4e2e2]/80 rounded-full overflow-hidden p-0.5 border border-white/60">
                          <div
                            className="h-full bg-[#82a77d] rounded-full transition-all duration-700 ease-out group-hover:bg-[#5b8855]"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            INSIGHTS DE RENDIMIENTO (Recharts Bar & Donut Visualization Section)
            ========================================================================= */}
        <div
          id="performance-insights-section"
          className="rounded-[28px] glass-card p-6 sm:p-7 shadow-xl shadow-[#864e5a]/10 border border-white/80 flex flex-col gap-5 backdrop-blur-xl relative overflow-hidden"
        >
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-[#cde9ac]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-40 h-40 bg-[#ffd9df]/30 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header & View Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-[#cde9ac] text-[#4e6535] shadow-xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-[#1b1c1c] tracking-tight flex items-center gap-2">
                  Insights de Rendimiento
                  <span className="px-2 py-0.5 rounded-full bg-[#ffd9df] text-[#864e5a] text-[10px] font-extrabold uppercase tracking-wider">
                    Analytics
                  </span>
                </h3>
                <p className="text-xs text-[#514345]/85">
                  Distribución analítica de calificaciones y métricas por materia
                </p>
              </div>
            </div>

            {/* View Mode Toggle Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-white/70 backdrop-blur-md rounded-2xl border border-white/90 shadow-xs self-start sm:self-auto">
              <button
                onClick={() => setChartView('bar')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  chartView === 'bar'
                    ? 'bg-[#4e6535] text-white shadow-sm'
                    : 'text-[#514345] hover:text-[#1b1c1c] hover:bg-white/60'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Barras por Materia</span>
              </button>

              <button
                onClick={() => setChartView('donut')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  chartView === 'donut'
                    ? 'bg-[#4e6535] text-white shadow-sm'
                    : 'text-[#514345] hover:text-[#1b1c1c] hover:bg-white/60'
                }`}
              >
                <PieIcon className="w-3.5 h-3.5" />
                <span>Distribución (Dona)</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
            <div className="p-3 rounded-2xl bg-white/65 border border-white shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-[#514345] flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#864e5a]" /> Promedio GPA
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold text-[#1b1c1c]">{profile.gpa}</span>
                <span className="text-[10px] font-bold text-[#514345]/70">/ 5.0</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/65 border border-white shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-[#514345] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#4e6535]" /> Mejor Materia
              </span>
              <div className="mt-1">
                <span className="text-xs font-bold text-[#4e6535] truncate block" title={highestSubject?.name || 'N/A'}>
                  {highestSubject?.name || 'N/A'}
                </span>
                <span className="text-[10px] font-bold text-[#1b1c1c]">
                  {highestSubject?.grade.toFixed(1)} / 5.0
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/65 border border-white shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-[#514345] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#6ca561]" /> Aprobación
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold text-[#374d20]">{passingRate}%</span>
                <span className="text-[10px] font-semibold text-[#514345]/70">({subjects.length} materias)</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/65 border border-white shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold text-[#514345] flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#8a5a44]" /> Créditos
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold text-[#1b1c1c]">{totalCredits}</span>
                <span className="text-[10px] font-semibold text-[#514345]/70">acumulados</span>
              </div>
            </div>
          </div>

          {/* Interactive Recharts Canvas */}
          <div className="w-full bg-white/60 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/90 shadow-sm relative z-10">
            {chartView === 'bar' ? (
              /* BAR CHART: Subject Grades comparison */
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-[#514345] px-1">
                  <span className="font-bold text-[#1b1c1c]">Calificaciones por Materia (Escala 0 a 5.0)</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4e6535]" /> Sobresaliente (≥4.5)
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#82a77d]" /> Notable (4.0-4.4)
                    </span>
                  </div>
                </div>

                <div className="w-full h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{ top: 20, right: 15, left: -15, bottom: 25 }}
                      onClick={(state: any) => {
                        if (state && state.activePayload && state.activePayload.length) {
                          const sub = state.activePayload[0].payload.rawSubject;
                          if (sub) onSelectSubject(sub);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={{ stroke: '#e4e2e2' }}
                        tick={{ fill: '#514345', fontSize: 11, fontWeight: 600 }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis
                        domain={[0, 5]}
                        ticks={[0, 1, 2, 3, 4, 5]}
                        tickLine={false}
                        axisLine={{ stroke: '#e4e2e2' }}
                        tick={{ fill: '#514345', fontSize: 11, fontWeight: 600 }}
                      />
                      <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255, 183, 197, 0.15)', radius: 8 }} />
                      <ReferenceLine
                        y={profile.gpa}
                        stroke="#864e5a"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                        label={{
                          value: `Promedio: ${profile.gpa}`,
                          position: 'insideTopRight',
                          fill: '#864e5a',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      />
                      <ReferenceLine
                        y={3.0}
                        stroke="#ba1a1a"
                        strokeDasharray="2 2"
                        strokeWidth={1}
                        label={{
                          value: 'Mínimo (3.0)',
                          position: 'insideBottomRight',
                          fill: '#ba1a1a',
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      />
                      <Bar dataKey="grade" radius={[8, 8, 0, 0]} maxBarSize={48} animationDuration={1000}>
                        {barChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            className="transition-all hover:opacity-85"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-[#514345]/80 text-center italic">
                  💡 Haz clic en una barra para abrir el temario detallado y registro de notas de la materia.
                </p>
              </div>
            ) : (
              /* DONUT CHART: Grade Ranges Distribution */
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2">
                <div className="relative w-full md:w-1/2 h-60 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomDonutTooltip />} />
                      <Pie
                        data={donutChartData}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={88}
                        paddingAngle={4}
                        animationDuration={1000}
                      >
                        {donutChartData.map((entry, index) => (
                          <Cell
                            key={`donut-cell-${index}`}
                            fill={entry.color}
                            stroke="rgba(255, 255, 255, 0.8)"
                            strokeWidth={2}
                            className="transition-all hover:scale-105 cursor-pointer"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Badge inside the Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-extrabold text-[#1b1c1c]">{subjects.length}</span>
                    <span className="text-[10px] font-bold text-[#514345] uppercase tracking-wider">
                      Materias
                    </span>
                  </div>
                </div>

                {/* Donut Legend and Detailed Range Breakdown */}
                <div className="w-full md:w-1/2 flex flex-col gap-2.5 text-xs">
                  <span className="font-bold text-[#1b1c1c] mb-1">Distribución por Rangos de Calificación:</span>
                  {donutChartData.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white/70 border border-white flex items-center justify-between gap-3 shadow-2xs hover:bg-white transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-[#1b1c1c]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#4e6535]">
                          {item.count} {item.count === 1 ? 'materia' : 'materias'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#cde9ac]/60 text-[#374d20] text-[10px] font-extrabold border border-[#b4cf95]/50">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Widgets */}
      <div className="w-full lg:w-[320px] xl:w-[360px] flex flex-col gap-5 flex-shrink-0">
        {/* Widget 1: Investigación Junior Quick Card */}
        {onNavigateToResearch && (
          <div
            id="overview-research-shortcut-widget"
            onClick={onNavigateToResearch}
            className="p-5 rounded-[26px] glass-card border border-white/90 shadow-lg shadow-[#4e6535]/10 hover:shadow-xl hover:shadow-[#4e6535]/15 transition-all cursor-pointer group relative overflow-hidden bg-gradient-to-br from-white/90 via-white/80 to-[#f2f8ec]/80 hover:scale-[1.01]"
          >
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-[#cde9ac] text-[#374d20] shadow-xs group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-extrabold text-[#1b1c1c] group-hover:text-[#4e6535] transition-colors">
                    Investigación
                  </h4>
                  <span className="text-[11px] text-[#514345] font-medium">
                    Tutoría: Dra. Gladys
                  </span>
                </div>
              </div>

              <div className="p-1.5 rounded-xl bg-white/80 text-[#4e6535] border border-white shadow-2xs group-hover:translate-x-0.5 transition-transform">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            <p className="text-xs text-[#514345]/85 leading-relaxed font-medium">
              Contador 3D de 15 horas requeridas, registro de temas y seguimiento de proyectos teóricos.
            </p>

            <div className="mt-3 flex items-center justify-between text-[11px] pt-2.5 border-t border-black/5">
              <span className="font-extrabold text-[#4e6535]">Ir a Investigación →</span>
              <span className="px-2 py-0.5 rounded-full bg-[#ffd9df] text-[#864e5a] font-bold text-[10px]">
                Investigadora Jr
              </span>
            </div>
          </div>
        )}

        {/* Widget 2: Spotify Lo-Fi Player */}
        <SpotifyWidget />

        {/* Widget 3: Subir PDF del Cronograma */}
        <PdfUploadWidget onOpenModal={onOpenPdfModal} />
      </div>
    </div>
  );
};

