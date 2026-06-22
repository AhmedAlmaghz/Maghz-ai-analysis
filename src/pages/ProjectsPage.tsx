import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Star,
  MoreVertical,
  Trash2,
  Edit3,
  FolderKanban,
  Calendar,
  Database,
  MessageSquare,
  Filter,
} from 'lucide-react';
import {
  getAllProjects,
  deleteProject,
  toggleFavorite,
  type Project,
} from '../lib/storage';

const PROJECT_COLORS = [
  '#6366f1', '#a855f7', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#ef4444', '#8b5cf6',
];

const PROJECT_ICONS = ['📊', '📈', '💼', '🎯', '💡', '🚀', '📉', '🔍', '⭐', '🎨'];

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const loadProjects = async () => {
    const all = await getAllProjects();
    setProjects(all);
    setLoading(false);
  };
  
  useEffect(() => {
    loadProjects();
  }, []);
  
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف المشروع "${name}"؟`)) {
      await deleteProject(id);
      loadProjects();
      setOpenMenu(null);
    }
  };
  
  const handleToggleFavorite = async (id: string) => {
    await toggleFavorite(id);
    loadProjects();
  };
  
  const filtered = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'favorites' && p.isFavorite);
    return matchesSearch && matchesFilter;
  });
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-display">المشاريع</h1>
          <p className="text-slate-400 mt-1">
            {projects.length} مشروع • {projects.filter(p => p.isFavorite).length} مفضلة
          </p>
        </div>
        
        <button
          onClick={() => navigate('/projects/new')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-xl transition-all hover:shadow-2xl hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          مشروع جديد
        </button>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن مشروع..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-12 pl-4 text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            <Filter className="h-4 w-4" />
            الكل
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              filter === 'favorites'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            <Star className="h-4 w-4" />
            المفضلة
          </button>
        </div>
      </div>
      
      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-dark rounded-2xl border border-white/10 p-16 text-center">
          <div className="mb-4 inline-flex rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-6">
            <FolderKanban className="h-12 w-12 text-indigo-400" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-white">
            {search || filter !== 'all' ? 'لا توجد نتائج' : 'لا توجد مشاريع'}
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            {search || filter !== 'all'
              ? 'جرب تغيير معايير البحث'
              : 'ابدأ بإنشاء مشروعك الأول'}
          </p>
          {!search && filter === 'all' && (
            <button
              onClick={() => navigate('/projects/new')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-xl"
            >
              <Plus className="h-5 w-5" />
              إنشاء مشروع
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={() => handleDelete(project.id, project.name)}
              onToggleFavorite={() => handleToggleFavorite(project.id)}
              menuOpen={openMenu === project.id}
              onMenuToggle={() => setOpenMenu(openMenu === project.id ? null : project.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  onDelete,
  onToggleFavorite,
  menuOpen,
  onMenuToggle,
}: {
  project: Project;
  onDelete: () => void;
  onToggleFavorite: () => void;
  menuOpen: boolean;
  onMenuToggle: () => void;
}) {
  return (
    <div className="group relative glass-dark rounded-2xl border border-white/10 p-5 shadow-lg transition-all hover:border-white/20 hover:shadow-xl">
      {/* Menu */}
      <div className="absolute top-3 left-3 flex items-center gap-1">
        <button
          onClick={onToggleFavorite}
          className={`rounded-lg p-1.5 transition-colors ${
            project.isFavorite
              ? 'text-amber-400 hover:bg-amber-500/10'
              : 'text-slate-500 hover:bg-white/10 hover:text-amber-400'
          }`}
        >
          <Star className={`h-4 w-4 ${project.isFavorite ? 'fill-current' : ''}`} />
        </button>
        <div className="relative">
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-white transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={onMenuToggle}
              />
              <div className="absolute left-0 top-full z-20 mt-1 w-40 rounded-xl border border-white/10 bg-slate-900 py-1 shadow-2xl">
                <Link
                  to={`/projects/${project.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
                  onClick={onMenuToggle}
                >
                  <Edit3 className="h-4 w-4" />
                  تعديل
                </Link>
                <button
                  onClick={onDelete}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Content */}
      <Link to={`/projects/${project.id}`} className="block">
        <div
          className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-lg"
          style={{ background: `${project.color}20` }}
        >
          {project.icon || '📊'}
        </div>
        
        <h3 className="mb-1 text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
          {project.name}
        </h3>
        
        {project.description && (
          <p className="mb-4 text-sm text-slate-400 line-clamp-2">{project.description}</p>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-white/5 p-2">
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-0.5">
              <Database className="h-3 w-3" />
              <span>صفوف</span>
            </div>
            <p className="text-sm font-bold text-white">{project.data?.rows.length || 0}</p>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-0.5">
              <MessageSquare className="h-3 w-3" />
              <span>رسائل</span>
            </div>
            <p className="text-sm font-bold text-white">{project.chatHistory.length}</p>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-0.5">
              <Calendar className="h-3 w-3" />
              <span>التحديث</span>
            </div>
            <p className="text-xs font-bold text-white">
              {new Date(project.updatedAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        
        {project.tags && project.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </div>
  );
}

export { PROJECT_COLORS, PROJECT_ICONS };
