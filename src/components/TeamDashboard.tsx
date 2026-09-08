import { useState } from 'react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'member';
  sessions: number;
  focusMinutes: number;
  streak: number;
}

interface TeamDashboardProps {
  isTeam: boolean;
  onUpgrade: () => void;
}

export default function TeamDashboard({ isTeam, onUpgrade }: TeamDashboardProps) {
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'You',
      email: 'you@example.com',
      avatar: '👤',
      role: 'admin',
      sessions: 24,
      focusMinutes: 600,
      streak: 7,
    },
    {
      id: '2',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      avatar: '👨‍💼',
      role: 'member',
      sessions: 18,
      focusMinutes: 450,
      streak: 5,
    },
    {
      id: '3',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      avatar: '👩‍💻',
      role: 'member',
      sessions: 22,
      focusMinutes: 550,
      streak: 10,
    },
    {
      id: '4',
      name: 'Mike Wilson',
      email: 'mike@example.com',
      avatar: '👨‍🎨',
      role: 'member',
      sessions: 15,
      focusMinutes: 375,
      streak: 3,
    },
  ]);

  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'analytics'>('overview');

  if (!isTeam) {
    return (
      <div className="team-dashboard">
        <div className="dashboard-header">
          <h2>👥 Team Dashboard</h2>
          <p className="dashboard-subtitle">Collaborate and track team productivity</p>
        </div>

        <div className="dashboard-upgrade">
          <div className="upgrade-content">
            <div className="upgrade-icon">👥</div>
            <h3>Unlock Team Collaboration</h3>
            <p>Bring your team together with shared goals, team analytics, and collaborative features.</p>
            <ul className="upgrade-features">
              <li>✓ Team dashboard & analytics</li>
              <li>✓ Shared projects & goals</li>
              <li>✓ Team member management</li>
              <li>✓ Collaborative task tracking</li>
              <li>✓ Team achievements</li>
              <li>✓ Admin controls & permissions</li>
              <li>✓ SSO integration</li>
              <li>✓ Custom branding</li>
            </ul>
            <div className="team-pricing">
              <div className="price">$12.99</div>
              <div className="price-period">per user / month</div>
            </div>
            <button className="upgrade-btn" onClick={onUpgrade}>
              Start Team Plan
            </button>
            <p className="upgrade-note">Minimum 3 users required</p>
          </div>
        </div>
      </div>
    );
  }

  const totalSessions = teamMembers.reduce((sum, m) => sum + m.sessions, 0);
  const totalMinutes = teamMembers.reduce((sum, m) => sum + m.focusMinutes, 0);
  const avgStreak = Math.round(teamMembers.reduce((sum, m) => sum + m.streak, 0) / teamMembers.length);

  return (
    <div className="team-dashboard">
      <div className="dashboard-header">
        <h2>👥 Team Dashboard</h2>
        <p className="dashboard-subtitle">{teamMembers.length} team members</p>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="overview-content">
          <div className="team-stats">
            <div className="team-stat">
              <div className="stat-icon">🍅</div>
              <div className="stat-value">{totalSessions}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
            <div className="team-stat">
              <div className="stat-icon">⏱️</div>
              <div className="stat-value">{Math.floor(totalMinutes / 60)}h</div>
              <div className="stat-label">Total Focus Time</div>
            </div>
            <div className="team-stat">
              <div className="stat-icon">🔥</div>
              <div className="stat-value">{avgStreak}</div>
              <div className="stat-label">Avg Streak</div>
            </div>
            <div className="team-stat">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{teamMembers.length}</div>
              <div className="stat-label">Team Members</div>
            </div>
          </div>

          <div className="team-leaderboard">
            <h3>🏆 Leaderboard</h3>
            <div className="leaderboard-list">
              {[...teamMembers]
                .sort((a, b) => b.sessions - a.sessions)
                .map((member, index) => (
                  <div key={member.id} className="leaderboard-item">
                    <div className="leaderboard-rank">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div className="leaderboard-avatar">{member.avatar}</div>
                    <div className="leaderboard-info">
                      <div className="leaderboard-name">{member.name}</div>
                      <div className="leaderboard-sessions">{member.sessions} sessions</div>
                    </div>
                    <div className="leaderboard-streak">
                      🔥 {member.streak}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="members-content">
          <div className="members-header">
            <h3>Team Members</h3>
            <button className="invite-btn">+ Invite Member</button>
          </div>
          <div className="members-list">
            {teamMembers.map(member => (
              <div key={member.id} className="member-card">
                <div className="member-avatar">{member.avatar}</div>
                <div className="member-info">
                  <div className="member-name">
                    {member.name}
                    {member.role === 'admin' && <span className="admin-badge">Admin</span>}
                  </div>
                  <div className="member-email">{member.email}</div>
                </div>
                <div className="member-stats">
                  <div className="member-stat">
                    <span className="stat-label">Sessions</span>
                    <span className="stat-value">{member.sessions}</span>
                  </div>
                  <div className="member-stat">
                    <span className="stat-label">Focus</span>
                    <span className="stat-value">{Math.floor(member.focusMinutes / 60)}h</span>
                  </div>
                  <div className="member-stat">
                    <span className="stat-label">Streak</span>
                    <span className="stat-value">🔥 {member.streak}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="analytics-content">
          <h3>Team Analytics</h3>
          <div className="analytics-charts">
            <div className="chart-card">
              <h4>Sessions by Member</h4>
              <div className="bar-chart">
                {teamMembers.map(member => (
                  <div key={member.id} className="bar-item">
                    <div className="bar-label">{member.name}</div>
                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{ width: `${(member.sessions / Math.max(...teamMembers.map(m => m.sessions))) * 100}%` }}
                      />
                    </div>
                    <div className="bar-value">{member.sessions}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <h4>Focus Time by Member</h4>
              <div className="bar-chart">
                {teamMembers.map(member => (
                  <div key={member.id} className="bar-item">
                    <div className="bar-label">{member.name}</div>
                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{ width: `${(member.focusMinutes / Math.max(...teamMembers.map(m => m.focusMinutes))) * 100}%` }}
                      />
                    </div>
                    <div className="bar-value">{Math.floor(member.focusMinutes / 60)}h</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
