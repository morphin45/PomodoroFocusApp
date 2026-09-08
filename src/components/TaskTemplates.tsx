import { useState } from 'react';

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  estimatedPomodoros: number;
  category: string;
  isPro: boolean;
}

interface TaskTemplatesProps {
  isPremium: boolean;
  onUpgrade: () => void;
  onApplyTemplate: (template: { name: string; estimatedPomodoros: number; category: string }) => void;
}

const DEFAULT_TEMPLATES: TaskTemplate[] = [
  {
    id: '1',
    name: 'Deep Work Session',
    description: 'Extended focus for complex tasks',
    icon: '🎯',
    estimatedPomodoros: 4,
    category: 'work',
    isPro: false,
  },
  {
    id: '2',
    name: 'Quick Task',
    description: 'Short, simple tasks',
    icon: '⚡',
    estimatedPomodoros: 1,
    category: 'work',
    isPro: false,
  },
  {
    id: '3',
    name: 'Study Session',
    description: 'Focused learning time',
    icon: '📚',
    estimatedPomodoros: 3,
    category: 'study',
    isPro: false,
  },
  {
    id: '4',
    name: 'Creative Project',
    description: 'Design, writing, or creative work',
    icon: '🎨',
    estimatedPomodoros: 6,
    category: 'creative',
    isPro: true,
  },
  {
    id: '5',
    name: 'Meeting Prep',
    description: 'Prepare for important meetings',
    icon: '📋',
    estimatedPomodoros: 2,
    category: 'work',
    isPro: true,
  },
  {
    id: '6',
    name: 'Code Review',
    description: 'Review and refactor code',
    icon: '💻',
    estimatedPomodoros: 3,
    category: 'work',
    isPro: true,
  },
  {
    id: '7',
    name: 'Email Catch-up',
    description: 'Process and respond to emails',
    icon: '📧',
    estimatedPomodoros: 2,
    category: 'admin',
    isPro: true,
  },
  {
    id: '8',
    name: 'Research Deep Dive',
    description: 'In-depth research session',
    icon: '🔍',
    estimatedPomodoros: 5,
    category: 'study',
    isPro: true,
  },
  {
    id: '9',
    name: 'Planning Session',
    description: 'Plan projects and goals',
    icon: '📅',
    estimatedPomodoros: 2,
    category: 'planning',
    isPro: true,
  },
  {
    id: '10',
    name: 'Documentation',
    description: 'Write or update documentation',
    icon: '📝',
    estimatedPomodoros: 3,
    category: 'work',
    isPro: true,
  },
];

export default function TaskTemplates({ isPremium, onUpgrade, onApplyTemplate }: TaskTemplatesProps) {
  const [templates, setTemplates] = useState<TaskTemplate[]>(DEFAULT_TEMPLATES);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    icon: '📋',
    estimatedPomodoros: 2,
    category: 'work',
  });

  const handleApplyTemplate = (template: TaskTemplate) => {
    if (template.isPro && !isPremium) {
      onUpgrade();
      return;
    }

    onApplyTemplate({
      name: template.name,
      estimatedPomodoros: template.estimatedPomodoros,
      category: template.category,
    });
  };

  const handleCreateTemplate = () => {
    if (!isPremium) {
      onUpgrade();
      return;
    }

    if (!newTemplate.name.trim()) return;

    const template: TaskTemplate = {
      id: Date.now().toString(),
      ...newTemplate,
      isPro: true,
    };

    setTemplates([...templates, template]);
    setNewTemplate({
      name: '',
      description: '',
      icon: '📋',
      estimatedPomodoros: 2,
      category: 'work',
    });
    setShowCreateForm(false);
  };

  const freeTemplates = templates.filter(t => !t.isPro);
  const proTemplates = templates.filter(t => t.isPro);

  return (
    <div className="task-templates">
      <div className="templates-header">
        <h2>📋 Task Templates</h2>
        <p className="templates-subtitle">Quick-start common tasks with pre-configured templates</p>
      </div>

      <div className="templates-section">
        <h3>Free Templates</h3>
        <div className="templates-grid">
          {freeTemplates.map(template => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => handleApplyTemplate(template)}
            >
              <div className="template-icon">{template.icon}</div>
              <div className="template-info">
                <div className="template-name">{template.name}</div>
                <div className="template-description">{template.description}</div>
                <div className="template-meta">
                  <span className="template-pomodoros">🍅 {template.estimatedPomodoros}</span>
                  <span className="template-category">{template.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="templates-section">
        <h3>
          Pro Templates {!isPremium && <span className="pro-badge">PRO</span>}
        </h3>
        <div className="templates-grid">
          {proTemplates.map(template => (
            <div
              key={template.id}
              className={`template-card ${!isPremium ? 'locked' : ''}`}
              onClick={() => handleApplyTemplate(template)}
            >
              {!isPremium && <div className="template-lock">🔒</div>}
              <div className="template-icon">{template.icon}</div>
              <div className="template-info">
                <div className="template-name">{template.name}</div>
                <div className="template-description">{template.description}</div>
                <div className="template-meta">
                  <span className="template-pomodoros">🍅 {template.estimatedPomodoros}</span>
                  <span className="template-category">{template.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isPremium && (
        <div className="create-template-section">
          {!showCreateForm ? (
            <button
              className="create-template-btn"
              onClick={() => setShowCreateForm(true)}
            >
              + Create Custom Template
            </button>
          ) : (
            <div className="create-template-form">
              <h3>Create Custom Template</h3>
              <div className="form-group">
                <label>Template Name</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="e.g., Weekly Review"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="Brief description"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Icon</label>
                  <select
                    value={newTemplate.icon}
                    onChange={(e) => setNewTemplate({ ...newTemplate, icon: e.target.value })}
                  >
                    <option value="📋">📋 Task</option>
                    <option value="🎯">🎯 Goal</option>
                    <option value="⚡">⚡ Quick</option>
                    <option value="📚">📚 Study</option>
                    <option value="💻">💻 Code</option>
                    <option value="🎨">🎨 Creative</option>
                    <option value="📧">📧 Email</option>
                    <option value="📅">📅 Planning</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Estimated Pomodoros</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newTemplate.estimatedPomodoros}
                    onChange={(e) => setNewTemplate({ ...newTemplate, estimatedPomodoros: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                >
                  <option value="work">Work</option>
                  <option value="study">Study</option>
                  <option value="creative">Creative</option>
                  <option value="admin">Admin</option>
                  <option value="planning">Planning</option>
                </select>
              </div>
              <div className="form-actions">
                <button className="cancel-btn" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleCreateTemplate}>
                  Create Template
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!isPremium && (
        <div className="templates-upgrade">
          <div className="upgrade-content">
            <h3>📋 Unlock Pro Templates</h3>
            <p>Get 10+ professional templates and create your own custom templates</p>
            <button className="upgrade-btn" onClick={onUpgrade}>
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
