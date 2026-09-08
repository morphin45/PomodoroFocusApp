import { useState } from 'react';
import jsPDF from 'jspdf';

interface FocusReportProps {
  sessions: any[];
  dailyStats: any[];
  tasks: any[];
  currentStreak: number;
  longestStreak: number;
  isPremium: boolean;
  onUpgrade: () => void;
}

export default function FocusReport({
  sessions,
  dailyStats,
  tasks,
  currentStreak,
  longestStreak,
  isPremium,
  onUpgrade,
}: FocusReportProps) {
  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'custom'>('weekly');
  const [isGenerating, setIsGenerating] = useState(false);

  const calculateStats = () => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    if (reportType === 'weekly') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (reportType === 'monthly') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    }

    const filteredSessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= startDate && sessionDate <= endDate;
    });

    const totalSessions = filteredSessions.length;
    const totalMinutes = Math.round(
      filteredSessions.reduce((sum, s) => sum + s.duration, 0) / 60
    );
    const totalInterruptions = filteredSessions.reduce(
      (sum, s) => sum + (s.interruptions || 0),
      0
    );
    const avgSessionsPerDay = totalSessions / (reportType === 'weekly' ? 7 : 30);
    const completedTasks = tasks.filter(t => t.done).length;

    return {
      totalSessions,
      totalMinutes,
      totalInterruptions,
      avgSessionsPerDay: avgSessionsPerDay.toFixed(1),
      completedTasks,
      currentStreak,
      longestStreak,
    };
  };

  const generatePDFReport = async () => {
    if (!isPremium) {
      onUpgrade();
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF();
      const stats = calculateStats();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Focus Performance Report', pageWidth / 2, 20, { align: 'center' });

      // Date range
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const dateRange = reportType === 'weekly' ? 'Last 7 Days' : reportType === 'monthly' ? 'Last 30 Days' : 'Last 14 Days';
      doc.text(dateRange, pageWidth / 2, 30, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 38, { align: 'center' });

      // Summary section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 14, 55);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const summaryData = [
        ['Total Focus Sessions', stats.totalSessions.toString()],
        ['Total Focus Time', `${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`],
        ['Average Sessions/Day', stats.avgSessionsPerDay],
        ['Total Interruptions', stats.totalInterruptions.toString()],
        ['Tasks Completed', stats.completedTasks.toString()],
        ['Current Streak', `${stats.currentStreak} days`],
        ['Longest Streak', `${stats.longestStreak} days`],
      ];

      let yPos = 65;
      summaryData.forEach(([label, value]) => {
        doc.text(label, 20, yPos);
        doc.text(value, 150, yPos);
        yPos += 8;
      });

      // Performance insights
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Performance Insights', 14, yPos + 10);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      yPos += 20;

      const insights = [];
      if (parseFloat(stats.avgSessionsPerDay) >= 4) {
        insights.push('✓ Excellent consistency: Averaging 4+ sessions per day');
      } else if (parseFloat(stats.avgSessionsPerDay) >= 2) {
        insights.push('→ Good progress: Consider increasing to 4+ sessions per day');
      } else {
        insights.push('⚠ Opportunity: Try to increase daily sessions for better results');
      }

      if (stats.totalInterruptions / stats.totalSessions < 1) {
        insights.push('✓ Great focus: Low interruption rate');
      } else {
        insights.push('→ Consider using Focus Mode to reduce interruptions');
      }

      if (stats.currentStreak >= 7) {
        insights.push(`✓ Amazing streak: ${stats.currentStreak} days in a row!`);
      }

      insights.forEach(insight => {
        doc.text(insight, 20, yPos);
        yPos += 8;
      });

      // Recommendations
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendations', 14, yPos + 10);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      yPos += 20;

      const recommendations = [
        '• Set a daily goal of 4-6 focus sessions',
        '• Use the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds',
        '• Take proper breaks between sessions to maintain focus',
        '• Track interruptions to identify and eliminate distractions',
        '• Use ambient sounds to enhance concentration',
      ];

      recommendations.forEach(rec => {
        doc.text(rec, 20, yPos);
        yPos += 8;
      });

      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        'Generated by Pomodoro Focus Premium',
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );

      // Save PDF
      doc.save(`focus-report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const stats = calculateStats();

  return (
    <div className="focus-report">
      <div className="report-header">
        <h2>📊 Focus Report</h2>
        <p className="report-subtitle">Generate detailed performance reports</p>
      </div>

      <div className="report-type-selector">
        <button
          className={`type-btn ${reportType === 'weekly' ? 'active' : ''}`}
          onClick={() => setReportType('weekly')}
        >
          Weekly
        </button>
        <button
          className={`type-btn ${reportType === 'monthly' ? 'active' : ''}`}
          onClick={() => setReportType('monthly')}
        >
          Monthly
        </button>
        <button
          className={`type-btn ${reportType === 'custom' ? 'active' : ''}`}
          onClick={() => setReportType('custom')}
        >
          Custom
        </button>
      </div>

      <div className="report-preview">
        <h3>Report Preview</h3>
        <div className="preview-stats">
          <div className="preview-stat">
            <div className="stat-icon">🍅</div>
            <div className="stat-value">{stats.totalSessions}</div>
            <div className="stat-label">Sessions</div>
          </div>
          <div className="preview-stat">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">{Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m</div>
            <div className="stat-label">Focus Time</div>
          </div>
          <div className="preview-stat">
            <div className="stat-icon">📈</div>
            <div className="stat-value">{stats.avgSessionsPerDay}</div>
            <div className="stat-label">Avg/Day</div>
          </div>
          <div className="preview-stat">
            <div className="stat-icon">⚡</div>
            <div className="stat-value">{stats.totalInterruptions}</div>
            <div className="stat-label">Interruptions</div>
          </div>
          <div className="preview-stat">
            <div className="stat-icon">✓</div>
            <div className="stat-value">{stats.completedTasks}</div>
            <div className="stat-label">Tasks Done</div>
          </div>
          <div className="preview-stat">
            <div className="stat-icon">🔥</div>
            <div className="stat-value">{stats.currentStreak}</div>
            <div className="stat-label">Streak</div>
          </div>
        </div>
      </div>

      <button
        className="generate-report-btn"
        onClick={generatePDFReport}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : '📄 Generate PDF Report'}
      </button>

      {!isPremium && (
        <div className="report-upgrade">
          <div className="upgrade-content">
            <h3>📊 Unlock Advanced Reports</h3>
            <p>Generate detailed PDF reports with charts, insights, and recommendations</p>
            <button className="upgrade-btn" onClick={onUpgrade}>
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
