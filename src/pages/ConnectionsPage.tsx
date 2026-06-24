import { useState, useEffect } from 'react';
import {
  Plus,
  Database,
  Trash2,
  Edit3,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  getAllConnections,
  createConnection,
  deleteConnection,
  updateConnection,
  type DBConnection,
} from '../lib/storage';
import { testConnection } from '../lib/connections';
import { useToast } from '../components/Toast';

export function ConnectionsPage() {
  const toast = useToast();
  const [connections, setConnections] = useState<DBConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  useEffect(() => {
    loadConnections();
  }, []);
  
  const loadConnections = async () => {
    const conns = await getAllConnections();
    setConnections(conns);
    setLoading(false);
  };
  
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف الاتصال "${name}"؟`)) {
      await deleteConnection(id);
      loadConnections();
    }
  };
  
  const handleTest = async (conn: DBConnection) => {
    const result = await testConnection(conn);
    await updateConnection(conn.id, {
      status: result.success ? 'connected' : 'failed',
      lastTested: Date.now(),
    });
    loadConnections();
    
    if (result.success) {
      toast.success('الاتصال ناجح', `تم الاتصال بـ ${conn.name} بنجاح`);
    } else {
      toast.error('فشل الاتصال', result.message);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white font-display">الاتصالات</h1>
          <p className="text-slate-400 mt-1">
            {connections.length} اتصال • ربط بقواعد البيانات
          </p>
        </div>
        
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-xl"
        >
          <Plus className="h-5 w-5" />
          اتصال جديد
        </button>
      </div>
      
      {/* Form Modal */}
      {showForm && (
        <ConnectionForm
          editingId={editingId}
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
          }}
          onSave={() => {
            loadConnections();
            setShowForm(false);
            setEditingId(null);
          }}
        />
      )}
      
      {/* Connections List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
        </div>
      ) : connections.length === 0 ? (
        <div className="glass-dark rounded-2xl border border-white/10 p-16 text-center">
          <div className="mb-4 inline-flex rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-6">
            <Database className="h-12 w-12 text-indigo-400" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-white">لا توجد اتصالات</h3>
          <p className="text-sm text-slate-400 mb-6">
            اربط بقواعد البيانات لاستيراد البيانات مباشرة
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-xl"
          >
            <Plus className="h-5 w-5" />
            إضافة اتصال
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.map((conn) => (
            <ConnectionCard
              key={conn.id}
              connection={conn}
              onTest={() => handleTest(conn)}
              onEdit={() => {
                setEditingId(conn.id);
                setShowForm(true);
              }}
              onDelete={() => handleDelete(conn.id, conn.name)}
            />
          ))}
        </div>
      )}
      
      {/* Info Box */}
      <div className="glass-dark rounded-2xl border border-white/10 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-300">
            <p className="font-semibold text-white mb-2">ملاحظة مهمة:</p>
            <ul className="space-y-1 text-slate-400">
              <li>• اتصالات REST API و GraphQL تعمل مباشرة من المتصفح</li>
              <li>• قواعد بيانات SQL (MySQL, PostgreSQL) تتطلب خادم خلفي</li>
              <li>• MongoDB يتطلب MongoDB Realm أو REST API</li>
              <li>• بيانات الاتصال تُحفظ محلياً فقط</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectionCard({
  connection,
  onTest,
  onEdit,
  onDelete,
}: {
  connection: DBConnection;
  onTest: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const statusColor =
    connection.status === 'connected'
      ? 'text-emerald-400 bg-emerald-500/10'
      : connection.status === 'failed'
      ? 'text-red-400 bg-red-500/10'
      : 'text-slate-400 bg-slate-500/10';
  
  const StatusIcon =
    connection.status === 'connected'
      ? CheckCircle
      : connection.status === 'failed'
      ? XCircle
      : AlertCircle;
  
  return (
    <div className="glass-dark rounded-2xl border border-white/10 p-5 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg ${
              connection.type === 'rest-api'
                ? 'bg-blue-500'
                : connection.type === 'graphql'
                ? 'bg-pink-500'
                : connection.type === 'mysql'
                ? 'bg-orange-500'
                : connection.type === 'postgres'
                ? 'bg-indigo-500'
                : 'bg-emerald-500'
            }`}
          >
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-white">{connection.name}</h3>
            <p className="text-xs text-slate-400 uppercase">{connection.type}</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${statusColor}`}>
          <StatusIcon className="h-3 w-3" />
          <span>{connection.status === 'connected' ? 'متصل' : connection.status === 'failed' ? 'فشل' : 'غير مختبر'}</span>
        </div>
      </div>
      
      <div className="mb-4 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-medium text-slate-300">المضيف:</span>
          <span className="truncate">{connection.host || connection.url}</span>
        </div>
        {connection.database && (
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-medium text-slate-300">قاعدة البيانات:</span>
            <span>{connection.database}</span>
          </div>
        )}
        {connection.lastTested && (
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-medium text-slate-300">آخر اختبار:</span>
            <span>{new Date(connection.lastTested).toLocaleString('ar-SA')}</span>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={onTest}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/30"
        >
          <TestTube className="h-4 w-4" />
          اختبار
        </button>
        <button
          onClick={onEdit}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ConnectionForm({
  editingId,
  onClose,
  onSave,
}: {
  editingId: string | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [type, setType] = useState<DBConnection['type']>('rest-api');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [database, setDatabase] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [ssl, setSsl] = useState(false);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (editingId) {
      import('../lib/storage').then(({ getConnection }) => {
        getConnection(editingId).then((conn) => {
          if (conn) {
            setName(conn.name);
            setType(conn.type);
            setHost(conn.host);
            setPort(String(conn.port));
            setDatabase(conn.database || '');
            setUsername(conn.username || '');
            setPassword(conn.password || '');
            setUrl(conn.url || '');
            setQuery(conn.query || '');
            setSsl(conn.ssl);
          }
        });
      });
    }
  }, [editingId]);
  
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('الرجاء إدخال اسم الاتصال');
      return;
    }
    
    setSaving(true);
    try {
      const data = {
        name,
        type,
        host,
        port: parseInt(port) || 0,
        database,
        username,
        password,
        url,
        query,
        ssl,
      };
      
      if (editingId) {
        await updateConnection(editingId, data);
        toast.success('تم تحديث الاتصال بنجاح');
      } else {
        await createConnection(data);
        toast.success('تم إنشاء الاتصال بنجاح');
      }
      
      onSave();
    } catch (err) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="glass-dark rounded-2xl border border-white/10 p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          {editingId ? 'تعديل الاتصال' : 'اتصال جديد'}
        </h2>
        
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-white">الاسم</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: Production API"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          
          {/* Type */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-white">النوع</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="rest-api">REST API</option>
              <option value="graphql">GraphQL</option>
              <option value="mysql">MySQL</option>
              <option value="postgres">PostgreSQL</option>
              <option value="mongodb">MongoDB</option>
            </select>
          </div>
          
          {/* REST API / GraphQL */}
          {(type === 'rest-api' || type === 'graphql') && (
            <>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">الرابط (URL)</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.example.com/data"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                  dir="ltr"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  {type === 'graphql' ? 'الاستعلام (Query)' : 'الاستعلام (اختياري)'}
                </label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={type === 'graphql' ? '{ users { id name } }' : '{"filter": "value"}'}
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none resize-none font-mono text-sm"
                  dir="ltr"
                />
              </div>
            </>
          )}
          
          {/* SQL / MongoDB */}
          {(type === 'mysql' || type === 'postgres' || type === 'mongodb') && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">المضيف</label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="localhost"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">المنفذ</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder={type === 'mysql' ? '3306' : type === 'postgres' ? '5432' : '27017'}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">قاعدة البيانات</label>
                <input
                  type="text"
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                  placeholder="mydb"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                  dir="ltr"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">اسم المستخدم</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="user"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">كلمة المرور</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ssl"
                  checked={ssl}
                  onChange={(e) => setSsl(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="ssl" className="text-sm text-white">
                  استخدام SSL
                </label>
              </div>
            </>
          )}
          
          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-[2] rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-xl disabled:opacity-50"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
