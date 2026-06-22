import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Save } from 'lucide-react';
import {
  createProject,
  getProject,
  updateProject,
} from '../lib/storage';
import { PROJECT_COLORS, PROJECT_ICONS } from './ProjectsPage';
import { useToast } from '../components/Toast';

export function ProjectFormPage() {
  const toast = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📊');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (id) {
      getProject(id).then((p) => {
        if (p) {
          setName(p.name);
          setDescription(p.description);
          setIcon(p.icon);
          setColor(p.color);
          setTagsInput(p.tags?.join(', ') || '');
        }
      });
    }
  }, [id]);
  
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('الرجاء إدخال اسم المشروع');
      return;
    }
    
    setSaving(true);
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    
    try {
      if (isEdit && id) {
        await updateProject(id, { name, description, icon, color, tags });
        toast.success('تم تحديث المشروع بنجاح');
        navigate(`/projects/${id}`);
      } else {
        const project = await createProject({
          name,
          description,
          icon,
          color,
          tags,
          data: null,
          analysis: null,
          chatHistory: [],
          isFavorite: false,
        });
        toast.success('تم إنشاء المشروع بنجاح');
        navigate(`/projects/${project.id}`);
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-xl border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white font-display">
            {isEdit ? 'تعديل المشروع' : 'مشروع جديد'}
          </h1>
          <p className="text-slate-400 mt-1">
            {isEdit ? 'تحديث معلومات المشروع' : 'ابدأ مشروع تحليل جديد'}
          </p>
        </div>
      </div>
      
      {/* Form */}
      <div className="glass-dark rounded-2xl border border-white/10 p-8 shadow-xl space-y-6">
        {/* Preview */}
        <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-6">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl text-5xl shadow-xl transition-all"
            style={{ background: `${color}30`, color }}
          >
            {icon}
          </div>
          <p className="text-sm text-slate-400">معاينة</p>
          <h3 className="text-lg font-bold text-white">{name || 'اسم المشروع'}</h3>
        </div>
        
        {/* Name */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-white">
            اسم المشروع <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: تحليل مبيعات 2024"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        
        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-white">
            الوصف
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف مختصر للمشروع..."
            rows={3}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
          />
        </div>
        
        {/* Icon */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-white">
            الأيقونة
          </label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_ICONS.map((i) => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-all ${
                  icon === i
                    ? 'bg-white/20 ring-2 ring-indigo-500 scale-110'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
        
        {/* Color */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-white">
            اللون
          </label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-10 w-10 rounded-xl transition-all ${
                  color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        
        {/* Tags */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-white">
            الوسوم
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="مبيعات، تحليل، 2024 (مفصولة بفواصل)"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-xl hover:shadow-2xl disabled:opacity-50"
          >
            {saving ? (
              <>جاري الحفظ...</>
            ) : (
              <>
                <Save className="h-5 w-5" />
                {isEdit ? 'حفظ التعديلات' : 'إنشاء المشروع'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
