import { useState } from 'react';

export interface ImportedSession {
  id: string;
  date: string;
  mode: 'work' | 'shortBreak' | 'longBreak';
  duration: number;
  task: string;
  interruptions: number;
}

interface DataImportProps {
  onImport: (sessions: ImportedSession[]) => void;
}

export default function DataImport({ onImport }: DataImportProps) {
  const [importSource, setImportSource] = useState<'toggl' | 'forest' | 'csv' | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [preview, setPreview] = useState<ImportedSession[]>([]);
  const [error, setError] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
      parseFile(content);
    };
    reader.readAsText(file);
  };

  const parseFile = (content: string) => {
    try {
      let sessions: ImportedSession[] = [];

      if (importSource === 'csv') {
        sessions = parseCSV(content);
      } else if (importSource === 'toggl') {
        sessions = parseToggl(content);
      } else if (importSource === 'forest') {
        sessions = parseForest(content);
      }

      setPreview(sessions);
      setError('');
    } catch (err) {
      setError('Failed to parse file. Please check the format.');
      setPreview([]);
    }
  };

  const parseCSV = (content: string): ImportedSession[] => {
    const lines = content.split('\n').filter((line) => line.trim());
    const sessions: ImportedSession[] = [];

    // Skip header if present
    const startIndex = lines[0].toLowerCase().includes('date') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const columns = lines[i].split(',');
      if (columns.length >= 3) {
        sessions.push({
          id: `import-${Date.now()}-${i}`,
          date: columns[0],
          mode: 'work',
          duration: parseInt(columns[1]) * 60, // Convert minutes to seconds
          task: columns[2] || 'Imported session',
          interruptions: parseInt(columns[3]) || 0,
        });
      }
    }

    return sessions;
  };

  const parseToggl = (content: string): ImportedSession[] => {
    try {
      const data = JSON.parse(content);
      const sessions: ImportedSession[] = [];

      if (Array.isArray(data)) {
        data.forEach((item: any, index: number) => {
          if (item.duration && item.start) {
            sessions.push({
              id: `toggl-${Date.now()}-${index}`,
              date: item.start,
              mode: 'work',
              duration: Math.round(item.duration / 1000), // Convert ms to seconds
              task: item.description || 'Toggl session',
              interruptions: 0,
            });
          }
        });
      }

      return sessions;
    } catch {
      throw new Error('Invalid Toggl format');
    }
  };

  const parseForest = (content: string): ImportedSession[] => {
    try {
      const data = JSON.parse(content);
      const sessions: ImportedSession[] = [];

      if (Array.isArray(data.trees || data)) {
        const trees = data.trees || data;
        trees.forEach((tree: any, index: number) => {
          if (tree.uninterrupted_length || tree.length) {
            sessions.push({
              id: `forest-${Date.now()}-${index}`,
              date: tree.started_at || tree.date,
              mode: 'work',
              duration: (tree.uninterrupted_length || tree.length) * 60, // Convert minutes to seconds
              task: tree.tag || 'Forest session',
              interruptions: 0,
            });
          }
        });
      }

      return sessions;
    } catch {
      throw new Error('Invalid Forest format');
    }
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      setPreview([]);
      setFileContent('');
      setImportSource(null);
      setError('');
    }
  };

  const handleCancel = () => {
    setPreview([]);
    setFileContent('');
    setImportSource(null);
    setError('');
  };

  return (
    <div className="data-import">
      <div className="import-header">
        <h2>📥 Import Data</h2>
        <p className="import-subtitle">Import sessions from other apps</p>
      </div>

      {!importSource ? (
        <div className="import-sources">
          <button
            className="source-btn"
            onClick={() => setImportSource('toggl')}
          >
            <span className="source-icon">📊</span>
            <span className="source-name">Toggl</span>
            <span className="source-desc">Import from Toggl Track</span>
          </button>
          <button
            className="source-btn"
            onClick={() => setImportSource('forest')}
          >
            <span className="source-icon">🌳</span>
            <span className="source-name">Forest</span>
            <span className="source-desc">Import from Forest app</span>
          </button>
          <button
            className="source-btn"
            onClick={() => setImportSource('csv')}
          >
            <span className="source-icon">📄</span>
            <span className="source-name">CSV</span>
            <span className="source-desc">Import from CSV file</span>
          </button>
        </div>
      ) : (
        <div className="import-form">
          <div className="import-instructions">
            <h3>
              {importSource === 'toggl' && '📊 Import from Toggl'}
              {importSource === 'forest' && '🌳 Import from Forest'}
              {importSource === 'csv' && '📄 Import from CSV'}
            </h3>
            <p>
              {importSource === 'toggl' && 'Upload your Toggl export file (JSON format)'}
              {importSource === 'forest' && 'Upload your Forest export file (JSON format)'}
              {importSource === 'csv' && 'Upload a CSV file with columns: date, duration (minutes), task, interruptions'}
            </p>
          </div>

          <div className="file-upload">
            <input
              type="file"
              accept={importSource === 'csv' ? '.csv' : '.json'}
              onChange={handleFileUpload}
              className="file-input"
            />
            <label className="file-label">
              <span className="file-icon">📁</span>
              <span>Choose File</span>
            </label>
          </div>

          {error && <div className="import-error">{error}</div>}

          {preview.length > 0 && (
            <div className="import-preview">
              <h3>Preview ({preview.length} sessions)</h3>
              <div className="preview-list">
                {preview.slice(0, 5).map((session) => (
                  <div key={session.id} className="preview-item">
                    <span className="preview-date">
                      {new Date(session.date).toLocaleDateString()}
                    </span>
                    <span className="preview-task">{session.task}</span>
                    <span className="preview-duration">
                      {Math.round(session.duration / 60)}m
                    </span>
                  </div>
                ))}
                {preview.length > 5 && (
                  <div className="preview-more">
                    + {preview.length - 5} more sessions
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="import-actions">
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button
              className="import-btn"
              onClick={handleImport}
              disabled={preview.length === 0}
            >
              Import {preview.length > 0 && `(${preview.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
