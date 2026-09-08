import { useState } from 'react';

export interface CustomTechnique {
  id: string;
  name: string;
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
  isPremium: boolean;
}

const DEFAULT_CUSTOM_TECHNIQUES: CustomTechnique[] = [
  {
    id: 'custom-1',
    name: 'My Focus',
    focusMinutes: 30,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4,
    isPremium: false,
  },
];

interface CustomTechniquesProps {
  isPremium: boolean;
  onUpgrade: () => void;
}

export default function CustomTechniques({ isPremium, onUpgrade }: CustomTechniquesProps) {
  const [techniques, setTechniques] = useState<CustomTechnique[]>(() => {
    const saved = localStorage.getItem('customTechniques');
    return saved ? JSON.parse(saved) : DEFAULT_CUSTOM_TECHNIQUES;
  });

  const [showForm, setShowForm] = useState(false);
  const [editingTechnique, setEditingTechnique] = useState<CustomTechnique | null>(null);

  const saveTechniques = (newTechniques: CustomTechnique[]) => {
    setTechniques(newTechniques);
    localStorage.setItem('customTechniques', JSON.stringify(newTechniques));
  };

  const handleAdd = () => {
    if (!isPremium && techniques.length >= 1) {
      onUpgrade();
      return;
    }
    setEditingTechnique({
      id: `custom-${Date.now()}`,
      name: '',
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      sessionsBeforeLongBreak: 4,
      isPremium: false,
    });
    setShowForm(true);
  };

  const handleEdit = (technique: CustomTechnique) => {
    setEditingTechnique(technique);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!editingTechnique || !editingTechnique.name.trim()) return;

    const existingIndex = techniques.findIndex(t => t.id === editingTechnique.id);
    let newTechniques;

    if (existingIndex >= 0) {
      newTechniques = techniques.map(t => t.id === editingTechnique.id ? editingTechnique : t);
    } else {
      newTechniques = [...techniques, editingTechnique];
    }

    saveTechniques(newTechniques);
    setShowForm(false);
    setEditingTechnique(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this custom technique?')) return;
    const newTechniques = techniques.filter(t => t.id !== id);
    saveTechniques(newTechniques);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTechnique(null);
  };

  return (
    <div className="custom-techniques">
      <div className="techniques-header">
        <h2>Custom Techniques</h2>
        <p className="techniques-subtitle">Create your own focus intervals</p>
      </div>

      {!showForm && (
        <>
          <div className="techniques-list">
            {techniques.length === 0 ? (
              <div className="empty-state">
                <p>No custom techniques yet. Create your first one!</p>
              </div>
            ) : (
              techniques.map(technique => (
                <div key={technique.id} className="technique-item">
                  <div className="technique-info">
                    <div className="technique-name">{technique.name}</div>
                    <div className="technique-details">
                      {technique.focusMinutes}min focus · {technique.shortBreakMinutes}min break · {technique.sessionsBeforeLongBreak} sessions
                    </div>
                  </div>
                  <div className="technique-actions">
                    <button className="edit-btn" onClick={() => handleEdit(technique)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(technique.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <button className="add-technique-btn" onClick={handleAdd}>
            + Add Custom Technique
          </button>

          {!isPremium && techniques.length >= 1 && (
            <div className="techniques-upgrade">
              <p>Upgrade to create unlimited custom techniques</p>
              <button className="upgrade-btn" onClick={onUpgrade}>
                Upgrade to Premium
              </button>
            </div>
          )}
        </>
      )}

      {showForm && editingTechnique && (
        <div className="technique-form">
          <h3>{techniques.find(t => t.id === editingTechnique.id) ? 'Edit' : 'Create'} Technique</h3>
          
          <div className="form-group">
            <label>Technique Name</label>
            <input
              type="text"
              value={editingTechnique.name}
              onChange={(e) => setEditingTechnique({ ...editingTechnique, name: e.target.value })}
              placeholder="e.g., Deep Work, Quick Sprint"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Focus (minutes)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={editingTechnique.focusMinutes}
                onChange={(e) => setEditingTechnique({ ...editingTechnique, focusMinutes: parseInt(e.target.value) || 25 })}
              />
            </div>

            <div className="form-group">
              <label>Short Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={editingTechnique.shortBreakMinutes}
                onChange={(e) => setEditingTechnique({ ...editingTechnique, shortBreakMinutes: parseInt(e.target.value) || 5 })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Long Break (minutes)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={editingTechnique.longBreakMinutes}
                onChange={(e) => setEditingTechnique({ ...editingTechnique, longBreakMinutes: parseInt(e.target.value) || 15 })}
              />
            </div>

            <div className="form-group">
              <label>Sessions Before Long Break</label>
              <input
                type="number"
                min="2"
                max="10"
                value={editingTechnique.sessionsBeforeLongBreak}
                onChange={(e) => setEditingTechnique({ ...editingTechnique, sessionsBeforeLongBreak: parseInt(e.target.value) || 4 })}
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button className="save-btn" onClick={handleSave}>
              Save Technique
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
