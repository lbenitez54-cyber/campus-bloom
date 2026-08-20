import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, Download, Eye, Sparkles } from 'lucide-react';
import { ClassScheduleItem } from '../../types';

interface PdfScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSchedule: (items: ClassScheduleItem[]) => void;
}

export const PdfScheduleModal: React.FC<PdfScheduleModalProps> = ({
  isOpen,
  onClose,
  onImportSchedule,
}) => {
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [parsedPreview, setParsedPreview] = useState<boolean>(false);
  const [importedSuccess, setImportedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSimulateUpload = (filename: string) => {
    setUploadedFileName(filename);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setParsedPreview(true);
    }, 900);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSimulateUpload(file.name);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleSimulateUpload(file.name);
    }
  };

  const handleImport = () => {
    const extractedClasses: ClassScheduleItem[] = [
      {
        id: `pdf-${Date.now()}-1`,
        subjectId: 'anat',
        subjectName: 'Anatomía Humana (Cátedra A)',
        dayOfWeek: 'Lunes',
        startTime: '07:30',
        endTime: '10:00',
        location: 'Pabellón Anatómico Central',
        professor: 'Dr. Alejandro Benítez',
        type: 'Práctica',
        color: '#864e5a',
      },
      {
        id: `pdf-${Date.now()}-2`,
        subjectId: 'histo',
        subjectName: 'Histología Médica',
        dayOfWeek: 'Martes',
        startTime: '08:00',
        endTime: '11:00',
        location: 'Laboratorio de Microscopía 3',
        professor: 'Dra. Carmen Mendoza',
        type: 'Práctica',
        color: '#4e6535',
      },
      {
        id: `pdf-${Date.now()}-3`,
        subjectId: 'fisio',
        subjectName: 'Fisiología I - Cardiovascular',
        dayOfWeek: 'Miércoles',
        startTime: '08:00',
        endTime: '10:30',
        location: 'Aula Magna FCM',
        professor: 'Dr. Roberto Duarte',
        type: 'Teoría',
        color: '#8a5a44',
      },
      {
        id: `pdf-${Date.now()}-4`,
        subjectId: 'bioq',
        subjectName: 'Bioquímica Clínica',
        dayOfWeek: 'Jueves',
        startTime: '10:30',
        endTime: '12:45',
        location: 'Laboratorio B-204',
        professor: 'Dra. Valeria Galeano',
        type: 'Laboratorio',
        color: '#5b7065',
      },
    ];

    onImportSchedule(extractedClasses);
    setImportedSuccess(true);
    setTimeout(() => {
      setImportedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-[30px] glass-card p-6 sm:p-7 shadow-2xl border border-white flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#6ca561] text-white flex items-center justify-center shadow-md">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#1b1c1c]">
                Subir PDF del Cronograma
              </h3>
              <p className="text-xs text-[#514345]/80">
                Sube el horario oficial de la Facultad de Ciencias Médicas para sincronizarlo automáticamente.
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

        {importedSuccess ? (
          <div className="p-8 rounded-2xl bg-[#cde9ac]/80 border border-[#4e6535] text-center flex flex-col items-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-[#4e6535] animate-bounce" />
            <h4 className="font-heading text-lg font-bold text-[#1b1c1c]">
              ¡Cronograma Importado con Éxito!
            </h4>
            <p className="text-xs text-[#514345]">
              Tus clases teóricas y laboratorios se han sincronizado con tu vista de calendario.
            </p>
          </div>
        ) : (
          <>
            {/* Upload Drag & Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`p-8 rounded-[24px] border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer ${
                dragOver
                  ? 'border-[#4e6535] bg-[#cde9ac]/40 scale-[1.01]'
                  : 'border-[#864e5a]/30 bg-white/50 hover:bg-white/80 hover:border-[#4e6535]'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#6ca561] text-white flex items-center justify-center shadow-md shadow-[#4e6535]/20">
                <Upload className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-[#1b1c1c]">
                  {uploadedFileName ? uploadedFileName : 'Arrastra tu archivo PDF o documento aquí'}
                </p>
                <p className="text-xs text-[#514345]/75">
                  Compatible con PDF, PNG, JPG de horarios oficiales de la facultad.
                </p>
              </div>

              <label className="px-4 py-2 rounded-xl bg-[#4e6535] text-white text-xs font-bold shadow-md hover:bg-[#3d5029] cursor-pointer">
                <span>Seleccionar Archivo</span>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Simulated processing state */}
            {isProcessing && (
              <div className="p-4 rounded-2xl glass-inner border border-white flex items-center justify-center gap-3 text-xs font-bold text-[#864e5a] animate-pulse">
                <Sparkles className="w-5 h-5" />
                <span>Analizando asignaturas, aulas y horarios del documento...</span>
              </div>
            )}

            {/* Parsed Schedule Preview */}
            {parsedPreview && (
              <div className="rounded-2xl glass-inner p-4 border border-white/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#4e6535] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> 4 Clases detectadas en el PDF
                  </span>
                  <span className="text-[11px] text-[#514345] font-semibold">Semestre II • Medicina</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-xl bg-white/70 flex items-center justify-between">
                    <div>
                      <strong className="text-[#1b1c1c]">Anatomía Humana</strong>
                      <p className="text-[11px] text-[#514345]">Lunes • 07:30 a 10:00 • Pabellón A-102</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#ffd9df] text-[#6b3743] font-bold text-[10px]">
                      Práctica
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/70 flex items-center justify-between">
                    <div>
                      <strong className="text-[#1b1c1c]">Histología Médica</strong>
                      <p className="text-[11px] text-[#514345]">Martes • 08:00 a 11:00 • Lab. 3</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#ffd9df] text-[#6b3743] font-bold text-[10px]">
                      Práctica
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/70 flex items-center justify-between">
                    <div>
                      <strong className="text-[#1b1c1c]">Fisiología I</strong>
                      <p className="text-[11px] text-[#514345]">Miércoles • 08:00 a 10:30 • Aula Magna</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-black/5 text-[#514345] font-bold text-[10px]">
                      Teoría
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleImport}
                  className="w-full py-2.5 rounded-xl bg-[#4e6535] text-white text-xs font-bold shadow-md hover:bg-[#3d5029] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#cde9ac]" />
                  <span>Sincronizar e Importar Clases a mi Cronograma</span>
                </button>
              </div>
            )}

            {/* Sample PDF Schedule Download Option */}
            <div className="flex items-center justify-between p-3 rounded-2xl glass-inner border border-white text-xs text-[#514345]">
              <span className="flex items-center gap-1.5 font-medium">
                <FileText className="w-4 h-4 text-[#864e5a]" />
                ¿No tienes el PDF a mano? Usa nuestra plantilla de Medicina.
              </span>
              <button
                onClick={() => handleSimulateUpload('Cronograma_Oficial_FCM_2026.pdf')}
                className="px-3 py-1 rounded-xl bg-[#ffd9df] text-[#6b3743] hover:bg-[#ffccd5] font-bold text-[11px] flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Cargar Ejemplo</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
