import { useState } from 'react';

interface Task {
  id: string;
  name: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  done: boolean;
  project?: string;
  category?: string;
}

interface TaskCategoriesProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const CATEGORIES = [
  { id: 'work', name: 'Work', color: '#3b82f6', icon: '💼' },
  { id: 'study', name: 'Study', color: '#8b5cf6', icon: '📚' },
  { id: 'personal', name: 'Personal', color: '#10b981', icon: '🏠' },
  { id: 'health', name: 'Health', color: '#ef4444', icon: '💪' },
  { id: 'creative', name: 'Creative', color: '#f59e0b', icon: '🎨' },
];

export default function TaskCategories({ tasks, onUpdateTask }: TaskCategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddCategory, setShowAddCategory] = useState(false);

  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(t => t.category === selectedCategory);

  const getCategoryStats = (categoryId: string) => {
    const categoryTasks = tasks.filter(t => t.category === categoryId);
    const completed = categoryTasks.filter(t => t.done).length;
    const total = categoryTasks.length;
    return { completed, total };
  };

  const handleCategoryChange = (taskId: string, category: string) => {
    onUpdateTask(taskId, { category });
  };

  return (
    <div className="task-categories">
      <div className="categories-header">
        <h2>📁 Task Categories</h2>
        <p className="categories-subtitle">Organize your tasks by category</p>
      </div>

      <div className="category-filters">
        <button
          className={`category-filter ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          <span className="filter-icon">📋</span>
          <span>All Tasks</span>
          <span className="filter-count">{tasks.length}</span>
        </button>

        {CATEGORIES.map(cat => {
          const stats = getCategoryStats(cat.id);
          return (
            <button
              key={cat.id}
              className={`category-filter ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                '--category-color': cat.color,
              } as React.CSSProperties}
            >
              <span className="filter-icon">{cat.icon}</span>
              <span>{cat.name}</span>
              <span className="filter-count">{stats.completed}/{stats.total}</span>
            </button>
          );
        })}
      </div>

      <div className="tasks-by-category">
        {filteredTasks.length === 0 ? (
          <div className="empty-category">
            <p>No tasks in this category yet</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className={`task-category-item ${task.done ? 'done' : ''}`}>
              <div className="task-category-info">
                <div className="task-category-name">{task.name}</div>
                <div className="task-category-progress">
                  {task.completedPomodoros}/{task.estimatedPomodoros} pomodoros
                </div>
              </div>
              <select
                className="category-select"
                value={task.category || ''}
                onChange={(e) => handleCategoryChange(task.id, e.target.value)}
              >
                <option value="">No category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          ))
        )}
      </div>

      <div className="category-stats">
        <h3>📊 Category Statistics</h3>
        <div className="stats-grid">
          {CATEGORIES.map(cat => {
            const stats = getCategoryStats(cat.id);
            const percentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
            return (
              <div key={cat.id} className="category-stat-card">
                <div className="stat-icon">{cat.icon}</div>
                <div className="stat-name">{cat.name}</div>
                <div className="stat-progress">
                  <div 
                    className="stat-progress-bar"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: cat.color 
                    }}
                  />
                </div>
                <div className="stat-value">{stats.completed}/{stats.total}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
