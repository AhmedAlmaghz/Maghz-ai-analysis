import { openDB, type IDBPDatabase } from 'idb';
import type { ParsedData } from './dataParser';
import type { AIAnalysis } from './gemini';
import type { ChatMessage } from './chat';

const DB_NAME = 'data-analyzer-db';
const DB_VERSION = 1;

export interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  createdAt: number;
  updatedAt: number;
  data: ParsedData | null;
  analysis: AIAnalysis | null;
  chatHistory: ChatMessage[];
  tags: string[];
  isFavorite: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  createdAt: number;
}

export interface AppSettings {
  apiKey: string;
  theme: 'light' | 'dark';
  language: 'ar' | 'en';
  autoSave: boolean;
  defaultChartType: 'bar' | 'line' | 'pie' | 'area';
  notificationsEnabled: boolean;
}

export interface DBConnection {
  id: string;
  name: string;
  type: 'mysql' | 'postgres' | 'mongodb' | 'rest-api' | 'graphql';
  host: string;
  port: number;
  database?: string;
  username?: string;
  password?: string;
  url?: string;
  headers?: Record<string, string>;
  query?: string;
  ssl: boolean;
  createdAt: number;
  lastTested?: number;
  status: 'connected' | 'failed' | 'unknown';
}

let dbInstance: IDBPDatabase | null = null;

async function getDB() {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) {
        const projectsStore = db.createObjectStore('projects', { keyPath: 'id' });
        projectsStore.createIndex('createdAt', 'createdAt');
        projectsStore.createIndex('updatedAt', 'updatedAt');
        projectsStore.createIndex('isFavorite', 'isFavorite');
      }
      
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
      
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('connections')) {
        const connStore = db.createObjectStore('connections', { keyPath: 'id' });
        connStore.createIndex('type', 'type');
        connStore.createIndex('createdAt', 'createdAt');
      }
    },
  });
  
  return dbInstance;
}

// ===== PROJECTS =====

export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const db = await getDB();
  const now = Date.now();
  const newProject: Project = {
    ...project,
    id: `proj_${now}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('projects', newProject);
  return newProject;
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDB();
  const projects = await db.getAll('projects');
  return projects.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getProject(id: string): Promise<Project | undefined> {
  const db = await getDB();
  return db.get('projects', id);
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const db = await getDB();
  const existing = await db.get('projects', id);
  if (!existing) return null;
  
  const updated: Project = {
    ...existing,
    ...updates,
    id,
    updatedAt: Date.now(),
  };
  
  await db.put('projects', updated);
  return updated;
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('projects', id);
}

export async function toggleFavorite(id: string): Promise<void> {
  const project = await getProject(id);
  if (project) {
    await updateProject(id, { isFavorite: !project.isFavorite });
  }
}

// ===== SETTINGS =====

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const saved = await db.get('settings', 'app-settings');
  
  return saved?.value || {
    apiKey: '',
    theme: 'dark',
    language: 'ar',
    autoSave: true,
    defaultChartType: 'bar',
    notificationsEnabled: true,
  };
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const db = await getDB();
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await db.put('settings', { key: 'app-settings', value: updated });
  return updated;
}

// ===== PROFILE =====

export async function getProfile(): Promise<UserProfile> {
  const db = await getDB();
  const saved = await db.get('profile', 'user-profile');
  
  return saved || {
    name: 'مستخدم جديد',
    email: '',
    avatar: '',
    bio: '',
    createdAt: Date.now(),
  };
}

export async function saveProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  const db = await getDB();
  const current = await getProfile();
  const updated = { ...current, ...profile, id: 'user-profile' };
  await db.put('profile', updated);
  return updated;
}

// ===== DATABASE CONNECTIONS =====

export async function createConnection(conn: Omit<DBConnection, 'id' | 'createdAt' | 'status'>): Promise<DBConnection> {
  const db = await getDB();
  const newConn: DBConnection = {
    ...conn,
    id: `conn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    status: 'unknown',
  };
  await db.put('connections', newConn);
  return newConn;
}

export async function getAllConnections(): Promise<DBConnection[]> {
  const db = await getDB();
  const connections = await db.getAll('connections');
  return connections.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getConnection(id: string): Promise<DBConnection | undefined> {
  const db = await getDB();
  return db.get('connections', id);
}

export async function updateConnection(id: string, updates: Partial<DBConnection>): Promise<void> {
  const db = await getDB();
  const existing = await db.get('connections', id);
  if (existing) {
    await db.put('connections', { ...existing, ...updates });
  }
}

export async function deleteConnection(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('connections', id);
}
