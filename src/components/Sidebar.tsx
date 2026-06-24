import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Database,
  Settings,
  Sparkles,
  User,
  ChevronLeft,
  LogOut,
  Moon,
  X,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { getProfile, type UserProfile } from '../lib/storage';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    getProfile().then(setProfile);
    
    // Refresh profile when navigating to/from settings
    const handleStorage = () => getProfile().then(setProfile);
    window.addEventListener('focus', handleStorage);
    return () => window.removeEventListener('focus', handleStorage);
  }, [location.pathname]);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);
  
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
  
  // Generate initials from name
  const getInitials = (name: string) => {
    if (!name) return 'م';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0);
    return parts[0].charAt(0) + parts[1].charAt(0);
  };
  
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 right-0 z-50 flex h-screen w-64 flex-col border-l border-white/10 glass-dark transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="border-b border-white/10 p-5 flex items-center justify-between">
          <Link to="/" onClick={onClose} className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl transition-transform group-hover:scale-110 animate-float">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="overflow-hidden text-right">
              <h1 className="text-base font-bold text-white font-display truncate">المحلل الذكي</h1>
              <p className="text-[11px] text-slate-400 truncate">تحليل بالذكاء الاصطناعي</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="إغلاق القائمة"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Menu */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-l from-indigo-500/20 to-purple-500/20 text-white border border-white/10 shadow-md'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.label}</span>
                {active && <div className="mr-auto h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />}
              </Link>
            );
          })}
        </nav>
        
        {/* User Profile - Avatar with Dropdown */}
        <div className="border-t border-white/10 p-3 relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex w-full items-center gap-3 rounded-xl p-2.5 transition-all hover:bg-white/5 group"
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg overflow-hidden ring-2 ring-white/10 group-hover:ring-indigo-400 transition-all">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name || 'User'}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-sm font-bold text-white">
                    {getInitials(profile?.name || '')}
                  </span>
                )}
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-0 left-0 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            </div>
            
            {/* User Info */}
            <div className="flex-1 overflow-hidden text-right">
              <p className="truncate text-sm font-semibold text-white">
                {profile?.name || 'مستخدم'}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                {profile?.email || 'إعداد البروفايل'}
              </p>
            </div>
            
            <ChevronLeft className={`h-4 w-4 text-slate-500 transition-transform ${showUserMenu ? 'rotate-90' : ''}`} />
          </button>
          
          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-lg shadow-2xl overflow-hidden animate-scale-in origin-bottom">
              {/* User Info Header */}
              <div className="border-b border-white/10 p-3 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 overflow-hidden shrink-0">
                    {profile?.avatar ? (
                      <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-base font-bold text-white">
                        {getInitials(profile?.name || '')}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-white truncate">{profile?.name || 'مستخدم'}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {profile?.email || 'لا يوجد بريد'}
                    </p>
                  </div>
                </div>
                {profile?.bio && (
                  <p className="mt-2 text-xs text-slate-300 line-clamp-2">{profile.bio}</p>
                )}
              </div>
              
              {/* Menu Items */}
              <div className="p-1">
                <Link
                  to="/settings"
                  onClick={() => {
                    setShowUserMenu(false);
                    onClose();
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>الإعدادات</span>
                </Link>
                
                <Link
                  to="/settings"
                  onClick={() => {
                    setShowUserMenu(false);
                    onClose();
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>تعديل البروفايل</span>
                </Link>
                
                <div className="my-1 border-t border-white/10" />
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // Theme toggle placeholder
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Moon className="h-4 w-4" />
                  <span>الوضع الليلي</span>
                  <span className="mr-auto text-xs text-slate-500">قريباً</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // Could trigger logout action
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
