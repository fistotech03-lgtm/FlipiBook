import React from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, FileText, AlertCircle } from 'lucide-react';
import { getLegacyConverterUrl } from './PageEditor/PageEditorModule/extractor/officeExtractor';

const LegacyFormatModal = ({
  isOpen,
  onClose,
  file,
  legacyType = 'doc'
}) => {
  if (!isOpen) return null;

  const fileName = file?.name || 'Your document';
  const isPpt = legacyType === 'ppt' || fileName.toLowerCase().endsWith('.ppt');
  const typeLabel = isPpt ? 'PowerPoint 97-2003 (.ppt)' : 'Word 97-2003 (.doc)';
  const targetLabel = isPpt ? 'PowerPoint Presentation (.pptx)' : 'Word Document (.docx)';
  const converterUrl = getLegacyConverterUrl(isPpt ? 'ppt' : 'doc');

  const handleOpenConverter = () => {
    window.open(converterUrl, '_blank', 'noopener,noreferrer');
  };

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-[1vw] bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div
        className="bg-white rounded-[1.2vw] shadow-[0_1.5vw_4vw_rgba(0,0,0,0.18)] border border-slate-100 w-full max-w-[28vw] overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200 relative select-none"
        role="alertdialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-[1vw] right-[1vw] text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-[0.35vw] rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size="1vw" strokeWidth={2.2} />
        </button>

        <div className="p-[1.8vw] pb-[1.4vw] flex flex-col items-center text-center">
          {/* Badge Icon */}
          <div className="w-[3.6vw] h-[3.6vw] rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 mb-[1vw] shadow-sm">
            <FileText size="1.8vw" strokeWidth={2.2} />
          </div>

          <h3 className="text-[1.2vw] font-bold text-gray-900 tracking-tight leading-tight mb-[0.4vw]">
            Legacy Document Format
          </h3>

          <p className="text-[0.78vw] text-gray-500 mb-[1.2vw] leading-relaxed max-w-[24vw]">
            <span className="font-semibold text-gray-700">{fileName}</span> is in the older{' '}
            <span className="font-semibold text-amber-600">{typeLabel}</span> binary format.
          </p>

          {/* Info Box */}
          <div className="w-full bg-slate-50 border border-slate-200/80 rounded-[0.8vw] p-[1vw] text-left mb-[1.4vw]">
            <div className="flex items-start gap-[0.6vw]">
              <AlertCircle size="1.1vw" className="text-amber-500 shrink-0 mt-[0.1vw]" />
              <div className="text-[0.73vw] text-gray-600 space-y-[0.3vw]">
                <p>
                  To ensure maximum visual fidelity, vector sharpness, and security, FlipiBook uses high-performance canvas extraction which requires modern XML format (<span className="font-semibold text-gray-800">{isPpt ? '.pptx' : '.docx'}</span>).
                </p>
                <p className="text-gray-500 text-[0.7vw]">
                  Please convert your file using a free online converter or save it as {isPpt ? '.pptx' : '.docx'} in Microsoft Office / Google Docs, then upload again.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col w-full gap-[0.55vw]">
            <button
              onClick={handleOpenConverter}
              className="w-full py-[0.7vw] px-[1.2vw] bg-[#6366F1] hover:bg-[#4F46E5] active:scale-[0.99] text-white text-[0.82vw] font-semibold rounded-[0.7vw] shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-[0.4vw] cursor-pointer"
            >
              <span>Convert to {isPpt ? 'PPTX' : 'DOCX'} Online (Free)</span>
              <ExternalLink size="0.95vw" strokeWidth={2.2} />
            </button>

            <button
              onClick={onClose}
              className="w-full py-[0.65vw] px-[1.2vw] bg-white hover:bg-slate-50 active:scale-[0.99] text-gray-700 text-[0.8vw] font-medium rounded-[0.7vw] border border-gray-200 hover:border-gray-300 transition-all duration-150 cursor-pointer"
            >
              I'll Convert It Later
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LegacyFormatModal;
