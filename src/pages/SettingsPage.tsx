import { useState, useEffect } from 'react';
import { Save, User, Key, Palette } from 'lucide-react';
import { getSettings, saveSettings, getProfile, saveProfile } from '../lib/storage';
import type { AppSettings, UserProfile } from '../lib/storage';
import { useToast } from '../components/Toast';

export function SettingsPage() {
  const toast = useToast();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'preferences'>('profile');
  
  useEffect(() => {
    Promise.all([getSettings(), getProfile()]).then(([s, p]) => {
      setSettings(s);
      setProfile(p);
    });
  }, []);
  
  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    await saveProfile(profile);
    setSaving(false);
    toast.success('تم حفظ البروفايل بنجاح');
  };
  
  const handleSaveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    await saveSettings(settings);
    setSaving(false);
    toast.success('تم حفظ الإعدادات بنجاح');
  };
  
  if (!settings || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white font-display">الإعدادات</h1>
        <p className="text-slate-400 mt-1">خصص تجربتك وإعداداتك</p>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
            activeTab === 'profile'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <User className="h-4 w-4" />
          البروفايل
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
            activeTab === 'api'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Key className="h-4 w-4" />
          API
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
            activeTab === 'preferences'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="h-4 w-4" />
          التفضيلات
        </button>
      </div>
      
      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="glass-dark rounded-2xl border border-white/10 p-8 shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-white">معلومات البروفايل</h2>
          
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-white" />
              )}
            </div>
            <div>
              <input
                type="text"
                value={profile.avatar}
                onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
                placeholder="رابط الصورة (اختياري)"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
          
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-white">الاسم</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          
          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-white">البريد الإلكتروني</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
              dir="ltr"
            />
          </div>
          
          {/* Bio */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-white">نبذة</label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>
          
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-xl disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {saving ? 'جاري الحفظ...' : 'حفظ البروفايل'}
          </button>
        </div>
      )}
      
      {/* API Tab */}
      {activeTab === 'api' && (
        <div className="glass-dark rounded-2xl border border-white/10 p-8 shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-white">مفاتيح API</h2>
          
          <div>
            <label className="mb-2 block text-sm font-semibold text-white">مفتاح Gemini API</label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              placeholder="AIzaSy..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              dir="ltr"
            />
            <p className="mt-2 text-xs text-slate-400">
              احصل على مفتاحك المجاني من{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>
          
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4">
            <p className="text-sm text-amber-300">
              ⚠️ المفتاح يُحفظ محلياً في المتصفح فقط ولا يتم إرساله لأي خادم خارجي
            </p>
          </div>
          
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-xl disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      )}
      
      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="glass-dark rounded-2xl border border-white/10 p-8 shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-white">التفضيلات العامة</h2>
          
          {/* Auto Save */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">الحفظ التلقائي</p>
              <p className="text-sm text-slate-400">حفظ التغييرات تلقائياً</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoSave: !settings.autoSave })}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                settings.autoSave ? 'bg-indigo-500' : 'bg-slate-600'
              }`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                  settings.autoSave ? 'translate-x-0.5' : 'translate-x-5'
                }`}
              />
            </button>
          </div>
          
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">الإشعارات</p>
              <p className="text-sm text-slate-400">إظهار الإشعارات</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                settings.notificationsEnabled ? 'bg-indigo-500' : 'bg-slate-600'
              }`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                  settings.notificationsEnabled ? 'translate-x-0.5' : 'translate-x-5'
                }`}
              />
            </button>
          </div>
          
          {/* Default Chart */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-white">نوع الرسم الافتراضي</label>
            <select
              value={settings.defaultChartType}
              onChange={(e) => setSettings({ ...settings, defaultChartType: e.target.value as any })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="bar">أعمدة</option>
              <option value="line">خطية</option>
              <option value="pie">دائرية</option>
              <option value="area">مساحة</option>
            </select>
          </div>
          
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-xl disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {saving ? 'جاري الحفظ...' : 'حفظ التفضيلات'}
          </button>
        </div>
      )}
    </div>
  );
}
