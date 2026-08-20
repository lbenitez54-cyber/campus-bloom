import React from 'react';
import { Upload } from 'lucide-react';

interface PdfUploadWidgetProps {
  onOpenModal: () => void;
}

export const PdfUploadWidget: React.FC<PdfUploadWidgetProps> = ({ onOpenModal }) => {
  return (
    <div
      id="pdf-upload-widget-container"
      className="w-full rounded-[24px] glass-card p-4 sm:p-5 flex flex-col gap-3 shadow-md shadow-[#864e5a]/10 border border-white/80 transition-all hover:shadow-lg"
    >
      {/* Header matching screenshot */}
      <h3 className="font-heading text-[15px] sm:text-[16px] font-bold text-[#1b1c1c] tracking-tight">
        Subir PDF del Cronograma
      </h3>

      {/* Inner card with upload button and description */}
      <div
        onClick={onOpenModal}
        className="p-5 sm:p-6 rounded-[20px] bg-white/50 border border-dashed border-[#864e5a]/30 hover:border-[#4e6535] hover:bg-white/80 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3 group"
      >
        {/* Matcha green squircle button matching screenshot */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] bg-[#6ca561] text-white flex flex-col items-center justify-center shadow-md shadow-[#4e6535]/20 group-hover:scale-105 transition-transform duration-200">
          <Upload className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
          <span className="text-[11px] sm:text-[12px] font-bold tracking-wide mt-0.5">
            Upload
          </span>
        </div>

        {/* Text matching screenshot */}
        <div className="space-y-0.5">
          <p className="text-[12px] sm:text-[13px] font-semibold text-[#514345]">
            Instrucciones y cronograma.
          </p>
          <p className="text-[11px] text-[#514345]/75">
            Subir PDF del Cronograma
          </p>
        </div>
      </div>
    </div>
  );
};
