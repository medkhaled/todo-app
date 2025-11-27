import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface TaskStats {
  total: number;
  active: number;
  completed: number;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taskApi = {
  // Récupérer toutes les tâches
  getAll: async (filter?: 'all' | 'active' | 'completed'): Promise<Task[]> => {
    const params = filter && filter !== 'all' ? { filter } : {};
    const response = await api.get<Task[]>('/api/tasks', { params });
    return response.data;
  },

  // Récupérer une tâche par ID
  getById: async (id: number): Promise<Task> => {
    const response = await api.get<Task>(`/api/tasks/${id}`);
    return response.data;
  },

  // Créer une nouvelle tâche
  create: async (task: CreateTaskDto): Promise<Task> => {
    const response = await api.post<Task>('/api/tasks', task);
    return response.data;
  },

  // Mettre à jour une tâche
  update: async (id: number, task: UpdateTaskDto): Promise<Task> => {
    const response = await api.put<Task>(`/api/tasks/${id}`, task);
    return response.data;
  },

  // Basculer le statut d'une tâche
  toggle: async (id: number): Promise<Task> => {
    const response = await api.patch<Task>(`/api/tasks/${id}/toggle`);
    return response.data;
  },

  // Supprimer une tâche
  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/tasks/${id}`);
  },

  // Récupérer les statistiques
  getStats: async (): Promise<TaskStats> => {
    const response = await api.get<TaskStats>('/api/tasks/stats');
    return response.data;
  },

  // Supprimer toutes les tâches complétées
  clearCompleted: async (): Promise<void> => {
    await api.delete('/api/tasks/completed');
  },
};

export default api;