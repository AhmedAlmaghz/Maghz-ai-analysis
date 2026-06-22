import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Clipboard, X } from 'lucide-react';
import { parseExcelFile, parseCSVFile, parseTextData, type ParsedData } from '../lib/dataParser';

interface Props {
  onDataLoaded: (data: ParsedData) => void;
}

export function DataInput({ onDataLoaded }: Props) {
  const [mode, setMode] = useState<'file' | 'paste'>('file');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pastedData, setPastedData] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let data: ParsedData;
      
      if (file.name.endsWith('.csv')) {
        data = await parseCSVFile(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        data = await parseExcelFile(file);
      } else {
        throw new Error('صيغة الملف غير مدعومة. الرجاء استخدام CSV أو Excel');
      }
      
      if (data.rows.length === 0) {
        throw new Error('الملف فارغ أو لا يحتوي على بيانات صالحة');
      }
      
      onDataLoaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء قراءة الملف');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasteData = () => {
    if (!pastedData.trim()) {
      setError('الرجاء لصق البيانات أولاً');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = parseTextData(pastedData);
      
      if (data.rows.length === 0) {
        throw new Error('لم يتم العثور على بيانات صالحة');
      }
      
      onDataLoaded(data);
      setPastedData('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحليل البيانات');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadSampleData = () => {
    const sample = `التاريخ,المنتج,الفئة,الكمية,السعر,الإجمالي
2024-01-05,لابتوب,إلكترونيات,15,4500,67500
2024-01-08,هاتف ذكي,إلكترونيات,28,2800,78400
2024-01-12,سماعات,إلكترونيات,45,350,15750
2024-01-15,طابعة,مستلزمات,12,1200,14400
2024-01-20,شاشة,إلكترونيات,18,1800,32400
2024-01-25,لوحة مفاتيح,مستلزمات,35,250,8750
2024-02-02,ماوس,مستلزمات,52,150,7800
2024-02-08,كاميرا,إلكترونيات,8,3500,28000
2024-02-15,تابلت,إلكترونيات,22,2200,48400
2024-02-20,راوتر,شبكات,30,450,13500
2024-03-05,لابتوب,إلكترونيات,20,4500,90000
2024-03-10,هاتف ذكي,إلكترونيات,35,2800,98000
2024-03-18,سماعات,إلكترونيات,55,350,19250
2024-03-25,طابعة,مستلزمات,15,1200,18000`;
    
    setPastedData(sample);
    setMode('paste');
  };
  
  return (
    <div className="glass rounded-2xl border border-white/20 p-6 shadow-xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
          <FileSpreadsheet className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">إدخال البيانات</h3>
          <p className="text-sm text-slate-500">ارفع ملف أو الصق البيانات مباشرة</p>
        </div>
      </div>
      
      {/* Mode Tabs */}
      <div className="mb-4 flex gap-2 rounded-xl bg-slate-100 p-1">
        <button
          onClick={() => setMode('file')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            mode === 'file'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="h-4 w-4" />
          رفع ملف
        </button>
        <button
          onClick={() => setMode('paste')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            mode === 'paste'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clipboard className="h-4 w-4" />
          لصق بيانات
        </button>
      </div>
      
      {/* File Upload Mode */}
      {mode === 'file' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="group relative w-full overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-white/50 px-6 py-12 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/50 disabled:opacity-50"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 shadow-lg transition-transform group-hover:scale-110">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {isLoading ? 'جاري التحميل...' : 'انقر لرفع الملف'}
                </p>
                <p className="text-sm text-slate-500">CSV أو Excel (XLSX, XLS)</p>
              </div>
            </div>
          </button>
          
          <div className="mt-4 text-center">
            <button
              onClick={loadSampleData}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              أو جرب بيانات تجريبية
            </button>
          </div>
        </div>
      )}
      
      {/* Paste Mode */}
      {mode === 'paste' && (
        <div>
          <textarea
            value={pastedData}
            onChange={(e) => setPastedData(e.target.value)}
            placeholder={`الصق البيانات هنا (CSV أو TSV)\nمثال:\nالاسم,العمر,المدينة\nأحمد,25,الرياض\nسارة,30,جدة`}
            className="h-48 w-full resize-none rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            dir="ltr"
          />
          
          <div className="mt-3 flex gap-2">
            <button
              onClick={handlePasteData}
              disabled={isLoading || !pastedData.trim()}
              className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? 'جاري التحليل...' : 'تحليل البيانات'}
            </button>
            
            {pastedData && (
              <button
                onClick={() => setPastedData('')}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-600 transition-all hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
