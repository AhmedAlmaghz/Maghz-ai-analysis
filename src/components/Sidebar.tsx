import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Database,
  Settings,
  User,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getProfile, type UserProfile } from '../lib/storage';

export function Sidebar() {
  const location = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    getProfile().then(setProfile);
  }, []);
  
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'لوحة التحكم', exact: true },
    { path: '/projects', icon: FolderKanban, label: 'المشاريع' },
    { path: '/connections', icon: Database, label: 'الاتصالات' },
    { path: '/settings', icon: Settings, label: 'الإعدادات' },
  ];
  
  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };
  
  return (
    <aside className="fixed top-0 right-0 z-40 flex h-screen w-64 flex-col border-l border-white/10 glass-dark">
      {/* Logo */}
      <div className="border-b border-white/10 p-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl animate-float">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white font-display">المحلل الذكي</h1>
            <p className="text-xs text-slate-400">تحليل بالذكاء الاصطناعي</p>
          </div>
        </Link>
      </div>
      
      {/* Menu */}
      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.exact);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                active
                  ? 'bg-gradient-to-l from-indigo-500/20 to-purple-500/20 text-white border border-white/10'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
              {active && <div className="mr-auto h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />}
            </Link>
          );
        })}
      </nav>
      
      {/* User Profile */}
      <div className="border-t border-white/10 p-4">
        <Link
          to="/settings"
          className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 shadow-md">
            {profile?.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <User className="h-5 w-5 text-white" />
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">
              {profile?.name || 'مستخدم'}
            </p>
            <p className="truncate text-xs text-slate-400">
              {profile?.email || 'إعدادات البروفايل'}
            </p>
          </div>
          <LogOut className="h-4 w-4 text-slate-500" />
        </Link>
      </div>
    </aside>
  );
}
