import { useState } from 'react';

interface SharedProject {
  id: string;
  name: string;
  description: string;
  icon: string;
  members: string[];
  tasks: number;
  completedTasks: number;
  totalPomodoros: number;
  createdAt: string;
}

interface SharedProjectsProps {
  isTeam: boolean;
  onUpgrade: () => void;
}

export default function SharedProjects({ isTeam, onUpgrade }: SharedProjectsProps) {
  const [projects, setProjects] = useState<SharedProject[]>([
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete overhaul of company website',
      icon: '🌐',
      members: ['You', 'Alex Johnson', 'Sarah Chen'],
      tasks: 12,
      completedTasks: 8,
      totalPomodoros: 45,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Q1 Marketing Campaign',
      description: 'Plan and execute Q1 marketing initiatives',
      icon: '📢',
      members: ['You', 'Mike Wilson'],
      tasks: 8,
      completedTasks: 5,
      totalPomodoros: 32,
      createdAt: '2024-01-20',
    },
    {
      id: '3',
      name: 'Product Launch',
      description: 'Launch new product features',
      icon: '🚀',
      members: ['You', 'Alex Johnson', 'Sarah Chen', 'Mike Wilson'],
      tasks: 15,
      completedTasks: 10,
      totalPomodoros: 68,
      createdAt: '2024-01-10',
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    icon: '📋',
  });

  if (!isTeam) {
    return (
      <div className="shared-projects">
        <div className="projects-header">
          <h2>📁 Shared Projects</h2>
          <p className="projects-subtitle">Collaborate on team projects</p>
        </div>

        <div className="projects-upgrade">
          <div className="upgrade-content">
            <div className="upgrade-icon">📁</div>
            <h3>Unlock Shared Projects</h3>
            <p>Create and manage collaborative projects with your team. Track progress together and achieve more.</p>
            <ul className="upgrade-features">
              <li>✓ Create shared projects</li>
              <li>✓ Assign team members</li>
              <li>✓ Track project progress</li>
              <li>✓ Shared task lists</li>
              <li>✓ Collaborative pomodoro tracking</li>
              <li>✓ Project analytics</li>
            </ul>
            <button className="upgrade-btn" onClick={onUpgrade}>
              Upgrade to Team Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return;

    const project: SharedProject = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      icon: newProject.icon,
      members: ['You'],
      tasks: 0,
      completedTasks: 0,
      totalPomodoros: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setProjects([...projects, project]);
    setNewProject({ name: '', description: '', icon: '📋' });
    setShowCreateForm(false);
  };

  const getProgressPercentage = (project: SharedProject) => {
    return project.tasks > 0 ? (project.completedTasks / project.tasks) * 100 : 0;
  };

  return (
    <div className="shared-projects">
      <div className="projects-header">
        <h2>📁 Shared Projects</h2>
        <p className="projects-subtitle">{projects.length} active projects</p>
      </div>

      {!showCreateForm ? (
        <button
          className="create-project-btn"
          onClick={() => setShowCreateForm(true)}
        >
          + Create New Project
        </button>
      ) : (
        <div className="create-project-form">
          <h3>Create New Project</h3>
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              placeholder="e.g., Website Redesign"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Brief project description"
            />
          </div>
          <div className="form-group">
            <label>Icon</label>
            <select
              value={newProject.icon}
              onChange={(e) => setNewProject({ ...newProject, icon: e.target.value })}
            >
              <option value="📋">📋 Project</option>
              <option value="🌐">🌐 Website</option>
              <option value="📱">📱 Mobile</option>
              <option value="🎨">🎨 Design</option>
              <option value="📢">📢 Marketing</option>
              <option value="🚀">🚀 Launch</option>
              <option value="💻">💻 Development</option>
              <option value="📊">📊 Analytics</option>
            </select>
          </div>
          <div className="form-actions">
            <button className="cancel-btn" onClick={() => setShowCreateForm(false)}>
              Cancel
            </button>
            <button className="save-btn" onClick={handleCreateProject}>
              Create Project
            </button>
          </div>
        </div>
      )}

      <div className="projects-list">
        {projects.map(project => {
          const progress = getProgressPercentage(project);
          return (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <div className="project-icon">{project.icon}</div>
                <div className="project-info">
                  <div className="project-name">{project.name}</div>
                  <div className="project-description">{project.description}</div>
                </div>
              </div>

              <div className="project-stats">
                <div className="project-stat">
                  <span className="stat-label">Tasks</span>
                  <span className="stat-value">{project.completedTasks}/{project.tasks}</span>
                </div>
                <div className="project-stat">
                  <span className="stat-label">Pomodoros</span>
                  <span className="stat-value">🍅 {project.totalPomodoros}</span>
                </div>
                <div className="project-stat">
                  <span className="stat-label">Members</span>
                  <span className="stat-value">👥 {project.members.length}</span>
                </div>
              </div>

              <div className="project-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="progress-text">{Math.round(progress)}% complete</div>
              </div>

              <div className="project-members">
                {project.members.slice(0, 4).map((member, index) => (
                  <div key={index} className="member-avatar-small" title={member}>
                    👤
                  </div>
                ))}
                {project.members.length > 4 && (
                  <div className="member-avatar-small more">
                    +{project.members.length - 4}
                  </div>
                )}
              </div>

              <div className="project-actions">
                <button className="view-btn">View Details</button>
                <button className="invite-btn">Invite Members</button>
              </div>
            </div>
          );
        })}
      </div>

      {projects.length === 0 && !showCreateForm && (
        <div className="empty-projects">
          <p>No projects yet. Create your first shared project!</p>
        </div>
      )}
    </div>
  );
}
