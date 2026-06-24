import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Menu, Sparkles } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectFormPage } from './pages/ProjectFormPage';
import { ProjectWorkspacePage } from './pages/ProjectWorkspacePage';
import { SettingsPage } from './pages/SettingsPage';
import { ConnectionsPage } from './pages/ConnectionsPage';
import { ToastProvider } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
          <div className="min-h-screen mesh-bg">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 right-0 left-0 h-16 bg-slate-900/80 backdrop-blur-md border-b border-white/10 z-30 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg">
                  <Sparkles className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="font-bold text-white text-sm font-display">المحلل الذكي</span>
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
                aria-label="القائمة"
              >
                <Menu className="h-6 w-6" />
              </button>
            </header>

            {/* Sidebar with mobile menu controls */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            {/* Main view container adjusting dynamically to layouts */}
            <main className="lg:mr-64 mr-0 pt-16 lg:pt-0 min-h-screen">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/new" element={<ProjectFormPage />} />
                  <Route path="/projects/:id" element={<ProjectWorkspacePage />} />
                  <Route path="/projects/:id/edit" element={<ProjectFormPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/connections" element={<ConnectionsPage />} />
                </Routes>
              </div>
            </main>
          </div>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
