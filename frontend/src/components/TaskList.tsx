import React, { useState, useEffect } from 'react';
import { taskApi, Task } from '../services/api';

type FilterType = 'all' | 'active' | 'completed';

export const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });

  // Charger les tâches
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskApi.getAll(filter);
      setTasks(data);
    } catch (err) {
      setError('Erreur lors du chargement des tâches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const data = await taskApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Erreur lors du chargement des stats:', err);
    }
  };

  useEffect(() => {
    loadTasks();
    loadStats();
  }, [filter]);

  // Créer une nouvelle tâche
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await taskApi.create({
        title: newTaskTitle,
        description: newTaskDescription || undefined,
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      loadTasks();
      loadStats();
    } catch (err) {
      setError('Erreur lors de la création de la tâche');
      console.error(err);
    }
  };

  // Basculer le statut d'une tâche
  const handleToggleTask = async (id: number) => {
    try {
      await taskApi.toggle(id);
      loadTasks();
      loadStats();
    } catch (err) {
      setError('Erreur lors de la mise à jour');
      console.error(err);
    }
  };

  // Supprimer une tâche
  const handleDeleteTask = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      return;
    }

    try {
      await taskApi.delete(id);
      loadTasks();
      loadStats();
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error(err);
    }
  };

  // Supprimer toutes les tâches complétées
  const handleClearCompleted = async () => {
    if (!window.confirm('Supprimer toutes les tâches complétées ?')) {
      return;
    }

    try {
      await taskApi.clearCompleted();
      loadTasks();
      loadStats();
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error(err);
    }
  };

  return (
    <div className="task-list-container">
      <h1 className="app-title">📝 Todo App</h1>

      {/* Formulaire d'ajout */}
      <form onSubmit={handleCreateTask} className="task-form">
        <input
          type="text"
          placeholder="Nouvelle tâche..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="task-input"
        />
        <input
          type="text"
          placeholder="Description (optionnelle)"
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          className="task-description-input"
        />
        <button type="submit" className="add-button">
          Ajouter
        </button>
      </form>

      {/* Statistiques */}
      <div className="stats">
        <span>Total: {stats.total}</span>
        <span>Actives: {stats.active}</span>
        <span>Complétées: {stats.completed}</span>
      </div>

      {/* Filtres */}
      <div className="filters">
        <button
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Toutes
        </button>
        <button
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Actives
        </button>
        <button
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Complétées
        </button>
      </div>

      {/* Messages d'erreur */}
      {error && <div className="error-message">{error}</div>}

      {/* Loading */}
      {loading && <div className="loading">Chargement...</div>}

      {/* Liste des tâches */}
      <div className="tasks">
        {tasks.length === 0 && !loading ? (
          <p className="no-tasks">Aucune tâche pour le moment</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleTask(task.id)}
                className="task-checkbox"
              />
              <div className="task-content">
                <h3 className="task-title">{task.title}</h3>
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
                <span className="task-date">
                  {new Date(task.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="delete-button"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      {stats.completed > 0 && (
        <div className="actions">
          <button onClick={handleClearCompleted} className="clear-button">
            Supprimer les tâches complétées ({stats.completed})
          </button>
        </div>
      )}
    </div>
  );
};