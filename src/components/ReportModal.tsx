import { useState } from 'react';
import { X, Printer, Download, FileText, FileImage, FileJson } from 'lucide-react';
import type { Project } from '../lib/storage';
import { ComprehensiveReport } from './ComprehensiveReport';
import {
  exportComprehensiveReportAsPDF,
  exportComprehensiveReportAsDOCX,
  exportComprehensiveReportAsHTML,
} from '../lib/presentationExport';
import { useToast } from './Toast';

interface Props {
  project: Project;
  onClose: () => void;
}

export function ReportModal({ project, onClose }: Props) {
  const toast = useToast();
  const [showExport, setShowExport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async (type: string) => {
    setIsExporting(true);
    try {
      switch (type) {
        case 'pdf':
          await exportComprehensiveReportAsPDF(project);
          break;
        case 'docx':
          await exportComprehensiveReportAsDOCX(project);
          break;
        case 'html':
          exportComprehensiveReportAsHTML(project);
          break;
      }
      setShowExport(false);
      toast.success('تم التصدير بنجاح');
    } catch (err) {
      toast.error('خطأ في التصدير', err instanceof Error ? err.message : 'خطأ غير معروف');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm print:bg-white print:block">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl print:max-w-none print:max-h-none print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">التقرير الشامل</h2>
              <p className="text-xs text-slate-500">{project.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Printer className="h-4 w-4" />
              طباعة
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExport(!showExport)}
                disabled={isExporting}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                تصدير
              </button>

              {showExport && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowExport(false)} />
                  <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                    <button
                      onClick={() => handleExport('pdf')}
                      disabled={isExporting}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <FileImage className="h-4 w-4 text-red-500" />
                      PDF (للطباعة)
                    </button>
                    <button
                      onClick={() => handleExport('docx')}
                      disabled={isExporting}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <FileText className="h-4 w-4 text-blue-500" />
                      Word (DOCX)
                    </button>
                    <button
                      onClick={() => handleExport('html')}
                      disabled={isExporting}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <FileJson className="h-4 w-4 text-green-500" />
                      HTML (ويب)
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] print:max-h-none print:overflow-visible">
          <ComprehensiveReport project={project} />
        </div>
      </div>
    </div>
  );
}
