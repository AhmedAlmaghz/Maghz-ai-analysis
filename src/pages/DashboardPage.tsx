import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Database,
  MessageSquare,
  Sparkles,
  Plus,
  TrendingUp,
  BarChart3,
  Zap,
} from 'lucide-react';
import { getAllProjects, type Project } from '../lib/storage';

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    getAllProjects().then((p) => {
      setProjects(p);
      setLoading(false);
    });
  }, []);
  
  const totalProjects = projects.length;
  const totalRows = projects.reduce((sum, p) => sum + (p.data?.rows.length || 0), 0);
  const totalMessages = projects.reduce((sum, p) => sum + p.chatHistory.length, 0);
  const totalInsights = projects.reduce((sum, p) => sum + (p.analysis?.insights.length || 0), 0);
  
  const recentProjects = projects.slice(0, 4);
  
  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-2xl">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-32 translate-y-32" />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-medium text-white/80">مرحباً بك</span>
            </div>
            <h1 className="mb-2 text-4xl font-bold text-white font-display">
              محلل البيانات الذكي
            </h1>
            <p className="max-w-xl text-white/80">
              حوّل بياناتك إلى رؤى ذكية مع قوة الذكاء الاصطناعي. أنشئ مشاريع، حلل البيانات، واستخرج التنبؤات.
            </p>
          </div>
          
          <Link
            to="/projects/new"
            className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-indigo-600 shadow-xl transition-all hover:shadow-2xl hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            مشروع جديد
          </Link>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<FolderKanban className="h-5 w-5" />}
          iconColor="from-indigo-500 to-purple-600"
          label="المشاريع"
          value={totalProjects}
          trend={loading ? undefined : '+12%'}
        />
        <StatCard
          icon={<Database className="h-5 w-5" />}
          iconColor="from-emerald-500 to-teal-600"
          label="صفوف البيانات"
          value={totalRows.toLocaleString('ar-SA')}
        />
        <StatCard
          icon={<MessageSquare className="h-5 w-5" />}
          iconColor="from-pink-500 to-rose-600"
          label="رسائل الدردشة"
          value={totalMessages}
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          iconColor="from-amber-500 to-orange-600"
          label="الرؤى المستخرجة"
          value={totalInsights}
        />
      </div>
      
      {/* Recent Projects */}
      <div className="glass-dark rounded-2xl border border-white/10 p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">المشاريع الأخيرة</h2>
          <Link
            to="/projects"
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
          >
            عرض الكل ←
          </Link>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
          </div>
        ) : recentProjects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction
          to="/projects/new"
          icon={<Zap className="h-6 w-6" />}
          title="تحليل فوري"
          description="ابدأ بتحليل بياناتك الآن"
          gradient="from-indigo-500 to-purple-600"
        />
        <QuickAction
          to="/connections"
          icon={<Database className="h-6 w-6" />}
          title="ربط قاعدة بيانات"
          description="استورد من MySQL أو PostgreSQL"
          gradient="from-emerald-500 to-teal-600"
        />
        <QuickAction
          to="/settings"
          icon={<Sparkles className="h-6 w-6" />}
          title="الإعدادات"
          description="خصص تجربتك"
          gradient="from-pink-500 to-rose-600"
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconColor,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: string | number;
  trend?: string;
}) {
  return (
    <div className="glass-dark rounded-2xl border border-white/10 p-5 shadow-lg hover:shadow-xl transition-all hover:scale-105">
      <div className="flex items-center justify-between mb-3">
        <div className={`rounded-xl bg-gradient-to-br ${iconColor} p-2.5 text-white shadow-md`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="group rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10 hover:scale-105"
    >
      <div
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
        style={{ background: `${project.color}20`, color: project.color }}
      >
        {project.icon || '📊'}
      </div>
      <h3 className="mb-1 font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
        {project.name}
      </h3>
      {project.description && (
        <p className="text-xs text-slate-400 mb-3 line-clamp-2">{project.description}</p>
      )}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <BarChart3 className="h-3 w-3" />
          {project.data?.rows.length || 0} صف
        </span>
        <span>{new Date(project.updatedAt).toLocaleDateString('ar-SA')}</span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-6">
        <FolderKanban className="h-12 w-12 text-indigo-400" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-white">لا توجد مشاريع بعد</h3>
      <p className="mb-6 max-w-sm text-sm text-slate-400">
        ابدأ بإنشاء مشروعك الأول لتحليل بياناتك واستخراج الرؤى الذكية
      </p>
      <Link
        to="/projects/new"
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-xl transition-all hover:shadow-2xl"
      >
        <Plus className="h-5 w-5" />
        إنشاء مشروع
      </Link>
    </div>
  );
}

function QuickAction({
  to,
  icon,
  title,
  description,
  gradient,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:scale-105"
    >
      <div className={`absolute -top-8 -left-8 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl group-hover:opacity-30 transition-opacity`} />
      <div className="relative">
        <div className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${gradient} p-3 text-white shadow-lg`}>
          {icon}
        </div>
        <h3 className="mb-1 font-bold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </Link>
  );
}
