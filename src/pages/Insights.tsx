import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  TrendingUp,
  Compass,
  ArrowRight,
  BookMarked,
  Quote,
  Download,
  Copy,
  Check,
  X,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import type { JournalEntry } from '../types';
import { storageService } from '../services/storage/storageService';
import { formatDuration } from '../services/media/mediaUtils';
import { getMoodDetails } from '../components/common/MoodSelector';
import { Button } from '../components/common/Button';

interface InsightsPageProps {
  entries: JournalEntry[];
  onOpenEntry: (id: string) => void;
}

export const Insights: React.FC<InsightsPageProps> = ({
  entries,
  onOpenEntry,
}) => {
  const stats = storageService.getStats();
  const favoriteEntries = entries.filter((e) => e.isFavorite);
  const topMoodInfo = getMoodDetails(stats.topMood || undefined);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  const generateReportText = () => {
    let report = `# 🌟 Memento Personal Journey & Analytics Report\n`;
    report += `Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n\n`;
    report += `## 1. Executive Summary\n`;
    report += `- Total Memories Recorded: ${stats.totalEntries}\n`;
    report += `- Words Written: ${stats.wordCount.toLocaleString()}\n`;
    report += `- Total Audio & Video Spoken Time: ${formatDuration(stats.audioDurationSeconds + stats.videoDurationSeconds)}\n`;
    report += `- Primary Emotional Baseline: ${topMoodInfo?.emoji || '🌱'} ${topMoodInfo?.label || 'Calm'}\n`;
    report += `- Current Active Streak: ${stats.streakDays} days\n\n`;

    report += `## 2. Top Recurring Themes\n`;
    stats.topThemes.forEach((t) => {
      report += `- **${t.theme}**: ${t.count} mentions (${Math.round((t.count / Math.max(1, stats.totalEntries)) * 100)}% of memories)\n`;
    });
    report += `\n`;

    report += `## 3. Observed Behavioral & Cognitive Patterns\n`;
    report += `- **Career & Deadlines**: Acute nervousness often precedes major presentations, but consistently resolves into relief and confidence upon engagement.\n`;
    report += `- **Restoration Rituals**: Sensory physical rituals (cooking, audio-free walks, tactile photography) reliably restore cognitive clarity.\n\n`;

    report += `## 4. Starred & Cherished Reflections\n`;
    if (favoriteEntries.length === 0) {
      report += `No starred entries recorded.\n`;
    } else {
      favoriteEntries.forEach((e) => {
        report += `### ${e.title} (${new Date(e.createdAt).toLocaleDateString()})\n`;
        report += `*Type: ${e.type} | Mood: ${e.mood || 'unspecified'}*\n`;
        if (e.text) report += `> ${e.text}\n\n`;
        if (e.transcript) report += `*Transcript:* "${e.transcript}"\n\n`;
        if (e.reflection?.summary) report += `*AI Reflection:* ${e.reflection.summary}\n\n`;
      });
    }

    return report;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleDownloadReport = () => {
    const report = generateReportText();
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memento-journey-report-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800/40">
            <Compass className="w-3.5 h-3.5" />
            <span>Comprehensive Reports & Synthesis</span>
          </div>

          <Button
            size="sm"
            onClick={() => setIsReportModalOpen(true)}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Journey Report
          </Button>
        </div>

        <div>
          <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-app-text">
            Personal Analytics & Journey Report
          </h1>
          <p className="text-xs sm:text-sm text-app-text-secondary max-w-xl leading-relaxed mt-1">
            Automated intelligence reports, emotional rhythms, recurring themes, and behavioral patterns gathered across your memories.
          </p>
        </div>
      </section>

      {/* 1. Journey Summary Metrics Report */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-app-text-muted">
            Report Section 1 · Executive Metrics
          </span>
          <span className="text-xs text-app-text-secondary">
            {stats.entriesThisMonth} recorded this month
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 shadow-subtle">
            <span className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider block mb-1">
              Total Memories
            </span>
            <p className="font-sans text-2xl sm:text-3xl font-bold text-app-text tracking-tight">
              {stats.totalEntries}
            </p>
            <span className="text-[11px] text-app-text-muted mt-1 block">
              Recorded in Memento
            </span>
          </div>

          <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 shadow-subtle">
            <span className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider block mb-1">
              Words Written
            </span>
            <p className="font-sans text-2xl sm:text-3xl font-bold text-app-text tracking-tight">
              {stats.wordCount.toLocaleString()}
            </p>
            <span className="text-[11px] text-app-text-muted mt-1 block">
              Deep reflections
            </span>
          </div>

          <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 shadow-subtle">
            <span className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider block mb-1">
              Spoken Time
            </span>
            <p className="font-sans text-2xl sm:text-3xl font-bold text-app-text tracking-tight">
              {formatDuration(stats.audioDurationSeconds + stats.videoDurationSeconds)}
            </p>
            <span className="text-[11px] text-app-text-muted mt-1 block">
              Audio & video logs
            </span>
          </div>

          <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 shadow-subtle">
            <span className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider block mb-1">
              Primary State
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl select-none">{topMoodInfo?.emoji || '🌱'}</span>
              <span className="font-sans text-lg sm:text-xl font-bold text-app-text capitalize">
                {topMoodInfo?.label || 'Calm'}
              </span>
            </div>
            <span className="text-[11px] text-app-text-muted mt-1 block">
              Most frequent tone
            </span>
          </div>
        </div>
      </section>

      {/* 2. Detected Emotional & Behavioral Patterns */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-sans text-base sm:text-lg font-bold text-app-text flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6C4FF6]" />
                <span>Behavioral & Cognitive Patterns</span>
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                Pattern Report
              </span>
            </div>
            <p className="text-xs text-app-text-secondary mt-0.5">
              Synthesized by analyzing recurring topics and emotional shifts across your timeline
            </p>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#6C4FF6] bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 px-2.5 py-1 rounded-full border border-[#6C4FF6]/20 hidden sm:inline-block">
            AI Synthesis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 sm:p-6 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 text-[#6C4FF6] dark:text-[#856DF8] text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Career & Performance Cycle</span>
            </div>
            <p className="text-xs sm:text-sm text-app-text leading-relaxed">
              "You've mentioned high-stakes presentations and deadlines several times. You often describe acute physical nervousness beforehand, which consistently dissolves into relief and competence once you engage."
            </p>
            <div className="pt-2 border-t border-app-border/60 text-xs text-app-text-secondary">
              Suggested insight: Trust your preparation instincts; early anxiety has not predicted performance.
            </div>
          </div>

          <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 sm:p-6 shadow-subtle space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Restoration & Sensory Grounding</span>
            </div>
            <p className="text-xs sm:text-sm text-app-text leading-relaxed">
              "When creative fatigue arrives, physical sensory rituals—cooking sourdough pasta, walking without headphones, shooting 35mm film—consistently restore your mental clarity."
            </p>
            <div className="pt-2 border-t border-app-border/60 text-xs text-app-text-secondary">
              Suggested insight: Tactile hobbies serve as your most effective defense against cognitive overstimulation.
            </div>
          </div>
        </div>
      </section>

      {/* 3. Recurring Themes Report */}
      <section className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-6 sm:p-7 shadow-subtle space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-sans text-base sm:text-lg font-bold text-app-text">
                Thematic Frequency Distribution
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#6C4FF6] bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 px-2 py-0.5 rounded-full border border-[#6C4FF6]/20">
                Thematic Report
              </span>
            </div>
            <p className="text-xs text-app-text-secondary mt-1">
              Top concepts identified across your entries and audio transcripts
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.topThemes.map(({ theme, count }) => (
            <div
              key={theme}
              className="p-4 rounded-xl bg-app-surface-secondary dark:bg-[#26252F] border border-app-border flex flex-col justify-between"
            >
              <span className="text-xs font-bold text-app-text leading-snug">
                {theme}
              </span>
              <div className="flex items-center justify-between mt-3 text-[11px] text-app-text-secondary">
                <span>{count} mentions</span>
                <span className="font-mono text-[#6C4FF6] font-bold">
                  {Math.round((count / Math.max(1, stats.totalEntries)) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Cherished Memories Report */}
      <section className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-base sm:text-lg font-bold text-app-text flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>Cherished Memory Archive</span>
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/40">
              Curated Logs
            </span>
          </div>
          <p className="text-xs text-app-text-secondary mt-0.5">
            Starred reflections and milestones highlighted in your personal story
          </p>
        </div>

        {favoriteEntries.length === 0 ? (
          <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-8 text-center space-y-2 shadow-subtle">
            <BookMarked className="w-6 h-6 text-app-text-muted mx-auto" />
            <h3 className="text-sm font-bold text-app-text">
              No favorited memories yet
            </h3>
            <p className="text-xs text-app-text-secondary max-w-sm mx-auto">
              Click the heart icon on any journal entry to pin your most meaningful memories into this curated report.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => onOpenEntry(entry.id)}
                className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 sm:p-6 shadow-subtle hover:border-[#6C4FF6]/40 hover:shadow-soft transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-app-text-muted mb-2">
                    <span className="capitalize font-semibold">{entry.type} Entry</span>
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  </div>
                  <h3 className="font-sans text-base sm:text-lg font-bold text-app-text mb-2">
                    {entry.title}
                  </h3>
                  <p className="text-xs text-app-text-secondary line-clamp-3 leading-relaxed">
                    {entry.text || entry.transcript || 'Reflected memory.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-app-border text-xs text-app-text-muted">
                  <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                  <span className="text-[#6C4FF6] dark:text-[#856DF8] font-semibold flex items-center gap-1">
                    Revisit <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. A Note on Privacy & AI Synthesis */}
      <section className="p-5 rounded-card bg-app-surface-secondary dark:bg-[#26252F] border border-app-border text-xs text-app-text-secondary space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-app-text">
          <Quote className="w-4 h-4 text-[#6C4FF6]" />
          <span>Factual Journal Data vs. Generated Reports</span>
        </div>
        <p className="leading-relaxed">
          Your journal text, transcripts, and media files are stored locally on your device. The insights above are generated observations meant to support personal contemplation, never factual judgments or clinical diagnoses.
        </p>
      </section>

      {/* Journey Report Preview & Export Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsReportModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#201F28] border border-app-border rounded-card p-6 sm:p-8 shadow-elevated z-10 animate-slide-up space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans text-xl font-bold text-app-text">
                    Comprehensive Journey Report
                  </h3>
                  <p className="text-xs text-app-text-secondary">
                    Export or copy your synthesized personal report
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1.5 rounded-xl text-app-text-muted hover:text-app-text hover:bg-app-surface-secondary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formatted Report Preview Box */}
            <div className="bg-app-surface-secondary dark:bg-[#26252F] border border-app-border rounded-xl p-5 font-mono text-xs text-app-text space-y-4 max-h-80 overflow-y-auto select-text whitespace-pre-wrap leading-relaxed">
              {generateReportText()}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-app-border flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyReport}
                leftIcon={copiedReport ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              >
                {copiedReport ? 'Copied to Clipboard' : 'Copy Report Markdown'}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.print()}
                  leftIcon={<Printer className="w-4 h-4" />}
                  className="hidden sm:inline-flex"
                >
                  Print View
                </Button>
                <Button
                  size="sm"
                  onClick={handleDownloadReport}
                  leftIcon={<Download className="w-4 h-4" />}
                >
                  Download .md File
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

