import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectFormPage } from './pages/ProjectFormPage';
import { ProjectWorkspacePage } from './pages/ProjectWorkspacePage';
import { SettingsPage } from './pages/SettingsPage';
import { ConnectionsPage } from './pages/ConnectionsPage';
import { ToastProvider } from './components/Toast';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen mesh-bg">
          <Sidebar />
          <main className="mr-64 min-h-screen">
            <div className="mx-auto max-w-7xl px-6 py-8">
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
    </BrowserRouter>
  );
}
