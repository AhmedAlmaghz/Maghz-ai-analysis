import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import {
  ArrowRight,
  Upload,
  Sparkles,
  Trash2,
  Database as DatabaseIcon,
  Download,
  FileImage,
  FileJson,
  Table2,
  MessageSquare,
  Loader2,
  BarChart3,
  Link as LinkIcon,
  AlertCircle,
} from 'lucide-react';
import {
  getProject,
  updateProject,
  getSettings,
  getAllConnections,
  type Project,
  type DBConnection,
} from '../lib/storage';
import type { ParsedData } from '../lib/dataParser';
import { parseExcelFile, parseCSVFile, parseTextData } from '../lib/dataParser';
import { analyzeWithGemini } from '../lib/gemini';
import type { ChatMessage } from '../lib/chat';
import { DataTable } from '../components/DataTable';
import { ChartsView } from '../components/ChartsView';
import { InsightsPanel } from '../components/InsightsPanel';
import {
  exportAsJSON,
  exportDataAsCSV,
  exportChatAsText,
  exportAsPDF,
} from '../lib/export';
import { fetchDataFromConnection, testConnection } from '../lib/connections';

type Tab = 'data' | 'analysis' | 'charts' | 'chat';
type DataInputMode = 'file' | 'paste' | 'database';

export function ProjectWorkspacePage() {
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('data');
  const [apiKey, setApiKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [connections, setConnections] = useState<DBConnection[]>([]);
  const [dataInputMode, setDataInputMode] = useState<DataInputMode>('file');
  const [pastedData, setPastedData] = useState('');
  const [importingFromDB, setImportingFromDB] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (!id) return;
    Promise.all([getProject(id), getSettings(), getAllConnections()]).then(
      ([proj, settings, conns]) => {
        if (!proj) {
          navigate('/projects');
          return;
        }
        setProject(proj);
        // Use API key from settings - this is the main source
        setApiKey(settings.apiKey || '');
        setConnections(conns);
        setLoading(false);
      }
    );
  }, [id, navigate]);
  
  const saveProject = useCallback(async (updates: Partial<Project>) => {
    if (!project) return;
    const updated = await updateProject(project.id, updates);
    if (updated) setProject(updated);
  }, [project]);
  
  // Stable callback for chat updates - prevents re-renders from recreating it
  const handleChatUpdate = useCallback((msgs: ChatMessage[]) => {
    saveProject({ chatHistory: msgs });
  }, [saveProject]);
  
  const handleDataLoaded = async (data: ParsedData) => {
    await saveProject({ data, analysis: null });
    setDataInputMode('file');
    setPastedData('');
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError(null);
    try {
      let data: ParsedData;
      if (file.name.endsWith('.csv')) {
        data = await parseCSVFile(file);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        data = await parseExcelFile(file);
      } else {
        throw new Error('صيغة غير مدعومة. استخدم CSV أو Excel');
      }
      
      if (data.rows.length === 0) {
        throw new Error('الملف فارغ');
      }
      
      await handleDataLoaded(data);
      setActiveTab('analysis');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في قراءة الملف');
    }
    e.target.value = '';
  };
  
  const handlePasteSubmit = async () => {
    if (!pastedData.trim()) return;
    setError(null);
    try {
      const data = parseTextData(pastedData);
      if (data.rows.length === 0) throw new Error('لا توجد بيانات');
      await handleDataLoaded(data);
      setActiveTab('analysis');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحليل البيانات');
    }
  };
  
  const handleAnalyze = async () => {
    if (!project?.data || !apiKey) {
      if (!apiKey) toast.warning('مفتاح API غير مُعد', 'يرجى إضافة مفتاح API من الإعدادات');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    toast.info('جارٍ التحليل...', 'يتم تحليل البيانات بالذكاء الاصطناعي');
    
    try {
      const result = await analyzeWithGemini(apiKey, project.data);
      await saveProject({ analysis: result });
      setActiveTab('analysis');
      toast.success('تم التحليل بنجاح', 'يمكنك الآن استعراض النتائج');
    } catch (err) {
      toast.error('خطأ في التحليل', err instanceof Error ? err.message : 'خطأ غير معروف');
      setError(err instanceof Error ? err.message : 'خطأ في التحليل');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleReset = async () => {
    if (confirm('هل تريد حذف البيانات والتحليل؟')) {
      await saveProject({ data: null, analysis: null, chatHistory: [] });
      setActiveTab('data');
    }
  };
  
  const handleImportFromConnection = async (conn: DBConnection) => {
    setError(null);
    setImportingFromDB(true);
    toast.info('جارٍ الاستيراد...', `يتم الاتصال بـ ${conn.name}`);
    
    try {
      const status = await testConnection(conn);
      if (!status.success) {
        throw new Error(status.message);
      }
      
      const data = await fetchDataFromConnection(conn);
      if (!data || data.rows.length === 0) {
        throw new Error('لم يتم العثور على بيانات');
      }
      
      await handleDataLoaded(data);
      setActiveTab('data');
      toast.success('تم الاستيراد بنجاح', `تم استيراد ${data.rows.length} صف`);
    } catch (err) {
      toast.error('خطأ في الاستيراد', err instanceof Error ? err.message : 'خطأ غير معروف');
      setError(err instanceof Error ? err.message : 'خطأ في الاستيراد');
    } finally {
      setImportingFromDB(false);
    }
  };
  
  const handleExport = async (type: string) => {
    if (!project) return;
    
    try {
      switch (type) {
        case 'json':
          exportAsJSON(project);
          break;
        case 'csv':
          if (project.data) exportDataAsCSV(project.data);
          break;
        case 'chat':
          exportChatAsText(project);
          break;
        case 'pdf':
          await exportAsPDF('workspace-content', project.name);
          break;
      }
      setShowExport(false);
      toast.success('تم التصدير بنجاح');
    } catch (err) {
      toast.error('خطأ في التصدير', err instanceof Error ? err.message : 'خطأ غير معروف');
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
      </div>
    );
  }
  
  if (!project) return null;
  
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'data', label: 'البيانات', icon: <DatabaseIcon className="h-4 w-4" /> },
    { id: 'analysis', label: 'التحليل', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'charts', label: 'التصورات', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'chat', label: 'الدردشة', icon: <MessageSquare className="h-4 w-4" /> },
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/projects"
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10 transition-colors"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-lg"
            style={{ background: `${project.color}30` }}
          >
            {project.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white font-display">{project.name}</h1>
              {project.isFavorite && <span className="text-amber-400">⭐</span>}
            </div>
            {project.description && (
              <p className="text-sm text-slate-400 mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              تصدير
            </button>
            
            {showExport && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExport(false)} />
                <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-xl border border-white/10 bg-slate-900 py-1 shadow-2xl">
                  <button
                    onClick={() => handleExport('json')}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
                  >
                    <FileJson className="h-4 w-4 text-blue-400" />
                    المشروع كاملاً (JSON)
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={!project.data}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-40"
                  >
                    <Table2 className="h-4 w-4 text-emerald-400" />
                    البيانات (CSV)
                  </button>
                  <button
                    onClick={() => handleExport('chat')}
                    disabled={project.chatHistory.length === 0}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-40"
                  >
                    <MessageSquare className="h-4 w-4 text-pink-400" />
                    الدردشة (TXT)
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
                  >
                    <FileImage className="h-4 w-4 text-red-400" />
                    كصورة PDF
                  </button>
                </div>
              </>
            )}
          </div>
          

          
          {project.data && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-red-500/10 hover:border-red-500/30"
            >
              <Trash2 className="h-4 w-4" />
              إعادة تعيين
            </button>
          )}
        </div>
      </div>
      

      
      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-300">
          ❌ {error}
        </div>
      )}
      
      {/* Tabs */}
      <div className="glass-dark rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-1 border-b border-white/10 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-l from-indigo-500/20 to-purple-500/20 text-white border border-white/10'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          
          {/* Analyze Button */}
          {project.data && apiKey && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="mr-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50 shimmer"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              تحليل بالذكاء
            </button>
          )}
        </div>
        
        <div className="p-6" id="workspace-content">
          {activeTab === 'data' && (
            <DataTab
              project={project}
              onFileUpload={handleFileUpload}
              onPasteSubmit={handlePasteSubmit}
              onImportFromConnection={handleImportFromConnection}
              dataInputMode={dataInputMode}
              setDataInputMode={setDataInputMode}
              pastedData={pastedData}
              setPastedData={setPastedData}
              fileInputRef={fileInputRef}
              connections={connections}
              importingFromDB={importingFromDB}
              apiKey={apiKey}
            />
          )}
          
          {activeTab === 'analysis' && project.data && (
            <InsightsPanel
              analysis={project.analysis}
              isLoading={isAnalyzing}
              apiKey={apiKey}
              data={project.data}
              initialMessages={project.chatHistory}
              onChatUpdate={handleChatUpdate}
              onStartAnalysis={handleAnalyze}
            />
          )}
          
          {activeTab === 'analysis' && !project.data && (
            <EmptyTab message="لا توجد بيانات. انتقل إلى تبويب البيانات لإضافة بيانات." />
          )}
          
          {activeTab === 'charts' && project.data && (
            <ChartsView data={project.data} />
          )}
          
          {activeTab === 'charts' && !project.data && (
            <EmptyTab message="لا توجد بيانات لعرض التصورات." />
          )}
          
          {activeTab === 'chat' && project.data && (
            <InsightsPanel
              analysis={project.analysis}
              isLoading={false}
              apiKey={apiKey}
              data={project.data}
              initialMessages={project.chatHistory}
              onChatUpdate={handleChatUpdate}
              showOnlyChat
            />
          )}
          
          {activeTab === 'chat' && !project.data && (
            <EmptyTab message="ابدأ بإضافة بيانات للبدء بالدردشة." />
          )}
        </div>
      </div>
    </div>
  );
}

function DataTab({
  project,
  onFileUpload,
  onPasteSubmit,
  onImportFromConnection,
  dataInputMode,
  setDataInputMode,
  pastedData,
  setPastedData,
  fileInputRef,
  connections,
  importingFromDB,
  apiKey,
}: {
  project: Project;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasteSubmit: () => void;
  onImportFromConnection: (conn: DBConnection) => void;
  dataInputMode: DataInputMode;
  setDataInputMode: (mode: DataInputMode) => void;
  pastedData: string;
  setPastedData: (v: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  connections: DBConnection[];
  importingFromDB: boolean;
  apiKey: string;
}) {
  if (project.data) {
    return (
      <div className="space-y-4">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          <StatBadge label="الصفوف" value={project.data.rows.length.toLocaleString('ar-SA')} icon="📊" />
          <StatBadge label="الأعمدة" value={project.data.columns.length} icon="📐" />
          <StatBadge
            label="القيم الفارغة"
            value={project.data.columns.reduce((s, c) => s + c.nullCount, 0)}
            icon="⚠️"
          />
        </div>
        
        {!apiKey && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-300 font-medium">لم يتم إعداد مفتاح Gemini API</p>
              <p className="text-xs text-amber-400/80">ستحتاج إلى المفتاح لتحليل البيانات بالذكاء الاصطناعي</p>
            </div>
            <Link
              to="/settings"
              className="rounded-lg bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-500/30"
            >
              إعداد الآن
            </Link>
          </div>
        )}
        
        <DataTable data={project.data} />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {!apiKey && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-amber-300 font-medium">مفتاح API مطلوب للتحليل</p>
            <p className="text-xs text-amber-400/80">يمكنك إضافة البيانات الآن، ثم قم بإعداد المفتاح في الإعدادات</p>
          </div>
          <Link
            to="/settings"
            className="rounded-lg bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-500/30"
          >
            الإعدادات
          </Link>
        </div>
      )}
      
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-4">إضافة البيانات</h3>
        
        {/* Mode Tabs */}
        <div className="mb-6 grid grid-cols-3 gap-2 rounded-xl bg-black/20 p-1">
          <button
            onClick={() => setDataInputMode('file')}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              dataInputMode === 'file'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="h-4 w-4" />
            رفع ملف
          </button>
          <button
            onClick={() => setDataInputMode('paste')}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              dataInputMode === 'paste'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DatabaseIcon className="h-4 w-4" />
            لصق بيانات
          </button>
          <button
            onClick={() => setDataInputMode('database')}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              dataInputMode === 'database'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            قاعدة بيانات
          </button>
        </div>
        
        {/* File Upload Mode */}
        {dataInputMode === 'file' && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={onFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group relative w-full overflow-hidden rounded-xl border-2 border-dashed border-white/20 bg-gradient-to-br from-white/5 to-transparent px-6 py-16 text-center hover:border-indigo-500/50 hover:from-indigo-500/5 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all" />
              <div className="relative">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl group-hover:scale-110 transition-transform">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <p className="text-lg font-semibold text-white mb-1">اسحب الملف هنا أو انقر للتحميل</p>
                <p className="text-sm text-slate-400">يدعم: CSV, XLSX, XLS</p>
              </div>
            </button>
          </>
        )}
        
        {/* Paste Mode */}
        {dataInputMode === 'paste' && (
          <>
            <textarea
              value={pastedData}
              onChange={(e) => setPastedData(e.target.value)}
              placeholder={`الصق البيانات هنا (CSV/TSV):\n\nالاسم,العمر,المدينة\nأحمد,25,الرياض\nسارة,30,جدة`}
              className="w-full h-56 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none resize-none font-mono text-sm"
              dir="ltr"
            />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {pastedData.trim().split('\n').filter(Boolean).length} سطر
              </p>
              <button
                onClick={onPasteSubmit}
                disabled={!pastedData.trim()}
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 font-semibold text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                تحليل البيانات
              </button>
            </div>
          </>
        )}
        
        {/* Database Mode */}
        {dataInputMode === 'database' && (
          <div>
            {connections.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
                  <DatabaseIcon className="h-8 w-8 text-slate-500" />
                </div>
                <h4 className="mb-2 text-lg font-bold text-white">لا توجد اتصالات</h4>
                <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
                  قم بإضافة اتصال بقاعدة بيانات أولاً لاستيراد البيانات مباشرة
                </p>
                <Link
                  to="/connections"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 font-semibold text-white shadow-lg"
                >
                  <LinkIcon className="h-4 w-4" />
                  إضافة اتصال جديد
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-400">اختر اتصالاً لاستيراد البيانات منه:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {connections.map((conn) => (
                    <button
                      key={conn.id}
                      onClick={() => onImportFromConnection(conn)}
                      disabled={importingFromDB}
                      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-right hover:bg-white/10 hover:border-indigo-500/30 transition-all disabled:opacity-50"
                    >
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${
                        conn.type === 'rest-api' ? 'bg-blue-500' :
                        conn.type === 'graphql' ? 'bg-pink-500' :
                        conn.type === 'mysql' ? 'bg-orange-500' :
                        conn.type === 'postgres' ? 'bg-indigo-500' : 'bg-emerald-500'
                      }`}>
                        <DatabaseIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white group-hover:text-indigo-400 transition-colors truncate">
                          {conn.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate uppercase">
                          {conn.type} • {conn.host || conn.url}
                        </p>
                      </div>
                      {conn.status === 'connected' && (
                        <div className="h-2 w-2 rounded-full bg-emerald-400" title="متصل" />
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="text-center pt-3">
                  <Link
                    to="/connections"
                    className="text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    إدارة الاتصالات ←
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Quick Stats for new projects */}
      {!project.data && (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-6">
          <h4 className="text-sm font-bold text-white mb-3">💡 نصائح سريعة</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex gap-2"><span className="text-indigo-400">•</span> ملفات Excel تدعم عدة أوراق عمل (سيتم استخدام الأولى)</li>
            <li className="flex gap-2"><span className="text-indigo-400">•</span> ملفات CSV يجب أن تحتوي على صف عناوين في البداية</li>
            <li className="flex gap-2"><span className="text-indigo-400">•</span> REST APIs يجب أن تعيد بيانات JSON كمصفوفة</li>
          </ul>
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-3 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

function EmptyTab({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-slate-800 p-6">
        <DatabaseIcon className="h-12 w-12 text-slate-600" />
      </div>
      <p className="text-slate-400">{message}</p>
    </div>
  );
}
