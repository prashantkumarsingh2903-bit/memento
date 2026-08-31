import React from 'react';
import { Flame, BookOpen, Clock, Heart, TrendingUp } from 'lucide-react';
import type { JournalEntry } from '../../types';
import { getMoodDetails, MOOD_OPTIONS } from '../common/MoodSelector';

interface HomeAnalyticsProps {
  entries: JournalEntry[];
}

export const HomeAnalytics: React.FC<HomeAnalyticsProps> = ({ entries }) => {
  // 1. Calculate Streak
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    const entryDates = new Set(
      entries.map((e) => new Date(e.createdAt).toISOString().split('T')[0])
    );
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (entryDates.has(dateStr)) {
        streak++;
      } else if (i === 0) {
        // If no entry today yet, check if there was one yesterday to keep streak alive
        continue;
      } else {
        break;
      }
    }
    return Math.max(streak, entries.length > 0 ? 1 : 0);
  };

  // 2. Total Transcribed / Audio duration
  const totalAudioSeconds = entries.reduce((acc, e) => {
    const mediaSecs =
      e.media
        ?.filter((m) => m.type === 'audio' || m.type === 'video')
        .reduce((mAcc, item) => mAcc + (item.duration || 0), 0) || 0;
    return acc + mediaSecs;
  }, 0);
  const totalMinutes = Math.round(totalAudioSeconds / 60);

  // 3. Dominant Mood
  const moodCounts: Record<string, number> = {};
  entries.forEach((e) => {
    if (e.mood) {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    }
  });
  let dominantMoodKey = 'good';
  let maxMoodCount = 0;
  Object.entries(moodCounts).forEach(([mood, count]) => {
    if (count > maxMoodCount) {
      maxMoodCount = count;
      dominantMoodKey = mood;
    }
  });
  const dominantMood =
    getMoodDetails(dominantMoodKey as any) || MOOD_OPTIONS[1];

  // 4. Last 7 Days Activity counts
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const last7DaysData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dayLabel = daysOfWeek[(d.getDay() + 6) % 7];
    const dateStr = d.toISOString().split('T')[0];
    const count = entries.filter(
      (e) => new Date(e.createdAt).toISOString().split('T')[0] === dateStr
    ).length;
    return { day: dayLabel, count, date: dateStr };
  });

  const maxActivity = Math.max(...last7DaysData.map((d) => d.count), 3);

  // Calculate SVG line points for smooth curve
  const chartWidth = 340;
  const chartHeight = 80;
  const paddingX = 20;
  const paddingY = 15;
  const availableWidth = chartWidth - paddingX * 2;
  const availableHeight = chartHeight - paddingY * 2;

  const points = last7DaysData.map((d, index) => {
    const x = paddingX + (index / (last7DaysData.length - 1)) * availableWidth;
    const y =
      chartHeight -
      paddingY -
      (d.count / maxActivity) * availableHeight;
    return { x, y, ...d };
  });

  // Generate SVG path command with cubic bezier smoothing
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const current = pts[i];
      const next = pts[i + 1];
      const controlX = (current.x + next.x) / 2;
      path += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const linePath = generateSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  // Mood Distribution calculation
  const totalWithMood =
    Object.values(moodCounts).reduce((a, b) => a + b, 0) || 1;
  const goodGreatPct = Math.round(
    (((moodCounts['great'] || 0) + (moodCounts['good'] || 0)) / totalWithMood) *
      100
  );
  const okayPct = Math.round(
    ((moodCounts['okay'] || 0) / totalWithMood) * 100
  );
  const lowDiffPct = Math.round(
    (((moodCounts['low'] || 0) +
      (moodCounts['difficult'] || 0) +
      (moodCounts['tired'] || 0)) /
      totalWithMood) *
      100
  );

  const streak = calculateStreak();

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1: Streak */}
        <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-4 sm:p-5 shadow-subtle flex flex-col justify-between hover:border-[#6C4FF6]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider">
              Current Streak
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/40">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans text-2xl sm:text-3xl font-bold text-app-text tracking-tight">
                {streak}
              </span>
              <span className="text-xs font-medium text-app-text-muted">days</span>
            </div>
            <p className="text-[11px] text-app-text-secondary mt-1">
              {streak > 3 ? 'Unstoppable flow' : 'Keep the habit alive'}
            </p>
          </div>
        </div>

        {/* Metric 2: Total Memories */}
        <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-4 sm:p-5 shadow-subtle flex flex-col justify-between hover:border-[#6C4FF6]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider">
              Total Entries
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] flex items-center justify-center border border-[#6C4FF6]/20">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans text-2xl sm:text-3xl font-bold text-app-text tracking-tight">
                {entries.length}
              </span>
              <span className="text-xs font-medium text-app-text-muted">memories</span>
            </div>
            <p className="text-[11px] text-app-text-secondary mt-1">
              Recorded in Memento
            </p>
          </div>
        </div>

        {/* Metric 3: Voice / Audio minutes */}
        <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-4 sm:p-5 shadow-subtle flex flex-col justify-between hover:border-[#6C4FF6]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider">
              Audio Recorded
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-200/50 dark:border-cyan-800/40">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans text-2xl sm:text-3xl font-bold text-app-text tracking-tight">
                {totalMinutes > 0 ? `${totalMinutes}m` : `${totalAudioSeconds}s`}
              </span>
              <span className="text-xs font-medium text-app-text-muted">spoken</span>
            </div>
            <p className="text-[11px] text-app-text-secondary mt-1">
              AI speech transcribed
            </p>
          </div>
        </div>

        {/* Metric 4: Dominant Mood */}
        <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-4 sm:p-5 shadow-subtle flex flex-col justify-between hover:border-[#6C4FF6]/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider">
              Top Mood
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center border border-rose-200/50 dark:border-rose-800/40">
              <Heart className="w-4 h-4 fill-rose-500/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl select-none">{dominantMood.emoji}</span>
              <span className="font-sans text-lg sm:text-xl font-bold text-app-text truncate">
                {dominantMood.label}
              </span>
            </div>
            <p className="text-[11px] text-app-text-secondary mt-1">
              Primary emotional tone
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row: Activity Line Chart & Mood Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Activity Line Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 sm:p-6 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-sans text-sm font-bold text-app-text">
                Weekly Reflection Rhythm
              </h3>
            </div>
            <span className="text-xs font-medium text-app-text-secondary">
              Past 7 Days
            </span>
          </div>

          {/* SVG Smooth Curve Area Chart */}
          <div className="w-full h-28 relative">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="purpleAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C4FF6" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#6C4FF6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gradient Filled Area */}
              <path d={areaPath} fill="url(#purpleAreaGradient)" />

              {/* Stroke Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#6C4FF6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {points.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.count > 0 ? '4' : '2.5'}
                    fill={pt.count > 0 ? '#6C4FF6' : 'var(--color-border)'}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="transition-transform hover:scale-125"
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* Day Labels */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-app-text-muted pt-2 border-t border-app-border/60">
            {last7DaysData.map((d, i) => (
              <span
                key={i}
                className={
                  d.count > 0
                    ? 'text-[#6C4FF6] dark:text-[#856DF8]'
                    : 'text-app-text-muted'
                }
              >
                {d.day}
              </span>
            ))}
          </div>
        </div>

        {/* Mood Distribution Ring (1 Col) */}
        <div className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-5 sm:p-6 shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-sans text-sm font-bold text-app-text">
              Mind State
            </h3>
            <span className="text-xs font-medium text-app-text-secondary">
              Distribution
            </span>
          </div>

          <div className="flex items-center gap-4 py-2">
            {/* Donut SVG */}
            <div className="relative w-20 h-20 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth="4"
                />
                {/* Progress Segments */}
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#6C4FF6"
                  strokeWidth="4"
                  strokeDasharray={`${Math.max(goodGreatPct || 40, 10)} 100`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#D95CFF"
                  strokeWidth="4"
                  strokeDasharray={`${Math.max(okayPct || 30, 5)} 100`}
                  strokeDashoffset={`-${Math.max(goodGreatPct || 40, 10)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-app-text">
                {entries.length}
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-app-text-secondary">
                  <span className="w-2 h-2 rounded-full bg-[#6C4FF6]" />
                  Positive
                </span>
                <span className="font-semibold text-app-text">
                  {goodGreatPct > 0 ? `${goodGreatPct}%` : '50%'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-app-text-secondary">
                  <span className="w-2 h-2 rounded-full bg-[#D95CFF]" />
                  Neutral
                </span>
                <span className="font-semibold text-app-text">
                  {okayPct > 0 ? `${okayPct}%` : '30%'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-app-text-secondary">
                  <span className="w-2 h-2 rounded-full bg-[#48D7E8]" />
                  Challenging
                </span>
                <span className="font-semibold text-app-text">
                  {lowDiffPct > 0 ? `${lowDiffPct}%` : '20%'}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-app-text-muted pt-2 border-t border-app-border/60">
            Self-reported emotional trends
          </p>
        </div>
      </div>
    </div>
  );
};
