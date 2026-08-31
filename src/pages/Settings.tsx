import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Palette,
  HardDrive,
  Download,
  Upload,
  Trash2,
  Check,
  RefreshCw,
  Camera,
  Mic,
  FileText,
  Sliders,
  Sparkles,
} from 'lucide-react';
import type { UserProfile, EntryType } from '../types';
import { storageService } from '../services/storage/storageService';
import { Button } from '../components/common/Button';
import { MoodSelector } from '../components/common/MoodSelector';

interface SettingsPageProps {
  onRefreshEntries: () => void;
}

export const Settings: React.FC<SettingsPageProps> = ({ onRefreshEntries }) => {
  const [profile, setProfile] = useState<UserProfile>(storageService.getProfile());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [micStatus, setMicStatus] = useState<'checking' | 'granted' | 'denied' | 'prompt'>('checking');
  const [camStatus, setCamStatus] = useState<'checking' | 'granted' | 'denied' | 'prompt'>('checking');
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const mic = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setMicStatus(mic.state as any);
          mic.onchange = () => setMicStatus(mic.state as any);
        } catch {
          setMicStatus('prompt');
        }

        try {
          const cam = await navigator.permissions.query({ name: 'camera' as PermissionName });
          setCamStatus(cam.state as any);
          cam.onchange = () => setCamStatus(cam.state as any);
        } catch {
          setCamStatus('prompt');
        }
      } else {
        setMicStatus('prompt');
        setCamStatus('prompt');
      }
    } catch {
      setMicStatus('prompt');
      setCamStatus('prompt');
    }
  };

  const handleProfileChange = (updates: Partial<UserProfile>) => {
    const updated = storageService.updateProfile(updates);
    setProfile(updated);

    // Apply dark mode if theme changes
    if (updates.theme) {
      applyTheme(updates.theme);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const json = storageService.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memento-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export Markdown Bundle
  const handleExportMarkdown = () => {
    const entries = storageService.getEntries();
    let mdContent = `# Memento Journal Export\nExported on: ${new Date().toLocaleString()}\n\n---\n\n`;

    entries.forEach((e) => {
      mdContent += `## ${e.title}\n`;
      mdContent += `*Date: ${new Date(e.createdAt).toLocaleString()} | Type: ${e.type} | Mood: ${e.mood || 'unspecified'}*\n`;
      if (e.tags && e.tags.length > 0) {
        mdContent += `*Tags: ${e.tags.map((t) => `#${t}`).join(' ')}*\n\n`;
      }
      if (e.text) {
        mdContent += `${e.text}\n\n`;
      }
      if (e.transcript) {
        mdContent += `### Spoken Transcript\n> ${e.transcript}\n\n`;
      }
      if (e.reflection) {
        mdContent += `### Reflection Insights\n${e.reflection.summary || ''}\n\n`;
        if (e.reflection.observations?.length) {
          mdContent += `**Observations:**\n${e.reflection.observations.map((o) => `- ${o}`).join('\n')}\n\n`;
        }
      }
      mdContent += `\n---\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memento-memories-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const success = storageService.importData(content);
      if (success) {
        setProfile(storageService.getProfile());
        onRefreshEntries();
        alert('Data imported successfully!');
      } else {
        alert('Could not read backup file format.');
      }
    };
    reader.readAsText(file);
  };

  // Reset to demo
  const handleResetDemo = () => {
    if (window.confirm('Reset journal entries and profile to initial sample memories?')) {
      storageService.resetToDemo();
      setProfile(storageService.getProfile());
      onRefreshEntries();
    }
  };

  // Clear all data
  const handleClearAll = async () => {
    await storageService.clearAll();
    setClearConfirmOpen(false);
    setProfile(storageService.getProfile());
    onRefreshEntries();
  };

  const entriesCount = storageService.getEntries().length;

  return (
    <div className="space-y-10 max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <section className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warm-card border border-warm-border text-warm-muted text-xs font-semibold">
          <Sliders className="w-3.5 h-3.5 text-warm-accent" />
          <span>Preferences & Data</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-warm-text">
            Settings
          </h1>
          {savedSuccess && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-800/40 animate-fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Saved</span>
            </div>
          )}
        </div>
        <p className="text-sm sm:text-base text-warm-muted max-w-xl leading-relaxed">
          Manage your personal profile, mindful reflection preferences, appearance, and local-first data.
        </p>
      </section>

      {/* 1. Profile Section */}
      <section className="bg-warm-card border border-warm-border rounded-3xl p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-warm-accent-light text-warm-accent">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-medium text-warm-text">
              Personal Profile
            </h2>
            <p className="text-xs text-warm-muted">
              How Memento personalizes your reflective greeting
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-warm-muted block mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleProfileChange({ name: e.target.value })}
              className="w-full bg-warm-card-subtle border border-warm-border rounded-2xl px-4 py-2.5 text-sm text-warm-text outline-none focus:border-warm-accent transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-warm-muted block mb-1">
              Preferred Capture Mode
            </label>
            <select
              value={profile.defaultEntryType}
              onChange={(e) =>
                handleProfileChange({ defaultEntryType: e.target.value as EntryType })
              }
              className="w-full bg-warm-card-subtle border border-warm-border rounded-2xl px-4 py-2.5 text-sm text-warm-text outline-none focus:border-warm-accent transition-colors capitalize"
            >
              <option value="text">Written Text Journal</option>
              <option value="voice">Spoken Voice Journal</option>
              <option value="video">Video Journal</option>
              <option value="photo">Photo Story</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-warm-muted block mb-1">
              Personal Intent / Bio
            </label>
            <input
              type="text"
              value={profile.bio || ''}
              onChange={(e) => handleProfileChange({ bio: e.target.value })}
              placeholder="e.g. Exploring slow technology, writing, and mindful living..."
              className="w-full bg-warm-card-subtle border border-warm-border rounded-2xl px-4 py-2.5 text-sm text-warm-text outline-none focus:border-warm-accent transition-colors"
            />
          </div>
        </div>
      </section>

      {/* 2. Journaling & Reflection Preferences */}
      <section className="bg-warm-card border border-warm-border rounded-3xl p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-medium text-warm-text">
              Journaling & AI Reflection
            </h2>
            <p className="text-xs text-warm-muted">
              Configure automated transcription and reflection assistant
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-warm-muted block">
              Default Baseline Mood
            </label>
            <MoodSelector
              value={profile.defaultMood}
              onChange={(m) => handleProfileChange({ defaultMood: m })}
              size="sm"
            />
          </div>

          <div className="pt-2 border-t border-warm-border/60 space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-warm-card-subtle border border-warm-border cursor-pointer">
              <div>
                <span className="text-sm font-medium text-warm-text block">
                  Automatic Audio Transcription
                </span>
                <span className="text-xs text-warm-muted block">
                  Transcribe spoken voice memos in real-time when recording
                </span>
              </div>
              <input
                type="checkbox"
                checked={profile.autoTranscribe}
                onChange={(e) => handleProfileChange({ autoTranscribe: e.target.checked })}
                className="w-5 h-5 accent-warm-accent rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-warm-card-subtle border border-warm-border cursor-pointer">
              <div>
                <span className="text-sm font-medium text-warm-text block">
                  Empathetic AI Reflections
                </span>
                <span className="text-xs text-warm-muted block">
                  Generate gentle observations and follow-up contemplation prompts
                </span>
              </div>
              <input
                type="checkbox"
                checked={profile.aiReflectionEnabled}
                onChange={(e) =>
                  handleProfileChange({ aiReflectionEnabled: e.target.checked })
                }
                className="w-5 h-5 accent-warm-accent rounded cursor-pointer"
              />
            </label>
          </div>
        </div>
      </section>

      {/* 3. Appearance */}
      <section className="bg-warm-card border border-warm-border rounded-3xl p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-medium text-warm-text">
              Appearance & Theme
            </h2>
            <p className="text-xs text-warm-muted">
              Choose the visual environment that feels most comfortable
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleProfileChange({ theme: t })}
              className={`p-4 rounded-2xl border text-center capitalize transition-all cursor-pointer ${
                profile.theme === t
                  ? 'border-warm-accent bg-warm-accent-light/60 font-semibold text-warm-accent shadow-subtle'
                  : 'border-warm-border bg-warm-card-subtle text-warm-muted hover:text-warm-text'
              }`}
            >
              <span className="text-sm block">{t} Theme</span>
              <span className="text-[10px] text-warm-faint mt-0.5 block">
                {t === 'system' ? 'Follows OS' : t === 'light' ? 'Warm paper' : 'Night ink'}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Privacy & Permissions */}
      <section className="bg-warm-card border border-warm-border rounded-3xl p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-medium text-warm-text">
              Privacy & Hardware Status
            </h2>
            <p className="text-xs text-warm-muted">
              All journal entries and media remain 100% on your local device
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-warm-card-subtle border border-warm-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Mic className="w-4 h-4 text-warm-muted" />
              <div>
                <span className="text-xs font-medium text-warm-text block">Microphone</span>
                <span className="text-[11px] text-warm-faint">For voice journaling</span>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                micStatus === 'granted'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
              }`}
            >
              {micStatus}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-warm-card-subtle border border-warm-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Camera className="w-4 h-4 text-warm-muted" />
              <div>
                <span className="text-xs font-medium text-warm-text block">Camera</span>
                <span className="text-[11px] text-warm-faint">For video journaling</span>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                camStatus === 'granted'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
              }`}
            >
              {camStatus}
            </span>
          </div>
        </div>
      </section>

      {/* 5. Data Management & Backup */}
      <section className="bg-warm-card border border-warm-border rounded-3xl p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-stone-100 dark:bg-stone-800 text-warm-text">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-medium text-warm-text">
              Data, Backup & Export
            </h2>
            <p className="text-xs text-warm-muted">
              {entriesCount} memories saved on this device
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="md"
            onClick={handleExportJSON}
            leftIcon={<Download className="w-4 h-4 text-warm-accent" />}
            className="w-full justify-center"
          >
            Export Backup (JSON)
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={handleExportMarkdown}
            leftIcon={<FileText className="w-4 h-4 text-warm-accent" />}
            className="w-full justify-center"
          >
            Export as Markdown (.md)
          </Button>
        </div>

        <div className="pt-4 border-t border-warm-border/60 flex items-center justify-between flex-wrap gap-3">
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-warm-border bg-warm-card-subtle text-xs font-medium text-warm-text hover:bg-warm-card transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-warm-muted" />
            <span>Restore from Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDemo}
              className="text-xs text-warm-muted hover:text-warm-text px-3 py-1.5 rounded-xl hover:bg-warm-card-subtle transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset to Sample Data</span>
            </button>

            <button
              onClick={() => setClearConfirmOpen(true)}
              className="text-xs text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>
      </section>

      {/* Confirmation Modal for Clearing Data */}
      {clearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-warm-card border border-warm-border rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-elevated space-y-4">
            <h3 className="font-serif text-xl font-medium text-warm-text">
              Clear All Local Memories?
            </h3>
            <p className="text-xs sm:text-sm text-warm-muted leading-relaxed">
              This will permanently remove all your journal entries, audio recordings, video clips, and AI reflections from this browser. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClearConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleClearAll}
              >
                Yes, Clear Everything
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
