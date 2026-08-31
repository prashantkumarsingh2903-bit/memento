import React, { useState, useEffect, useRef } from 'react';
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
  Image as ImageIcon,
  X,
  Save,
} from 'lucide-react';
import type { UserProfile, EntryType, Mood } from '../types';
import { storageService } from '../services/storage/storageService';
import { Button } from '../components/common/Button';
import { MoodSelector } from '../components/common/MoodSelector';

const PRESET_AVATARS = [
  {
    name: 'Elena',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Marcus',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Siddharth',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Aria',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Julian',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Chloe',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Mira',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
];

interface SettingsPageProps {
  currentProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onRefreshEntries: () => void;
}

export const Settings: React.FC<SettingsPageProps> = ({
  currentProfile,
  onUpdateProfile,
  onRefreshEntries,
}) => {
  const [profile, setProfile] = useState<UserProfile>(currentProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [micStatus, setMicStatus] = useState<'checking' | 'granted' | 'denied' | 'prompt'>('checking');
  const [camStatus, setCamStatus] = useState<'checking' | 'granted' | 'denied' | 'prompt'>('checking');
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync internal state if currentProfile prop changes
  useEffect(() => {
    setProfile(currentProfile);
  }, [currentProfile]);

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

  const handleFieldChange = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);

    // If theme changed directly, apply it immediately for visual preview
    if (updates.theme) {
      applyTheme(updates.theme);
      // Auto save theme selection
      const updated = storageService.updateProfile({ theme: updates.theme });
      onUpdateProfile(updated);
    }
  };

  const handleSaveProfile = () => {
    const updated = storageService.updateProfile(profile);
    setProfile(updated);
    onUpdateProfile(updated);
    setHasUnsavedChanges(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAvatarSelect = (url: string) => {
    const updated = storageService.updateProfile({ avatarUrl: url });
    setProfile(updated);
    onUpdateProfile(updated);
    setIsAvatarModalOpen(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPEG, WebP, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      handleAvatarSelect(dataUrl);
    };
    reader.readAsDataURL(file);
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
        const freshProfile = storageService.getProfile();
        setProfile(freshProfile);
        onUpdateProfile(freshProfile);
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
      const freshProfile = storageService.getProfile();
      setProfile(freshProfile);
      onUpdateProfile(freshProfile);
      onRefreshEntries();
    }
  };

  // Clear all data
  const handleClearAll = async () => {
    await storageService.clearAll();
    setClearConfirmOpen(false);
    const freshProfile = storageService.getProfile();
    setProfile(freshProfile);
    onUpdateProfile(freshProfile);
    onRefreshEntries();
  };

  const entriesCount = storageService.getEntries().length;
  const initials = profile.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ME';

  return (
    <div className="space-y-10 max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warm-card border border-warm-border text-warm-muted text-xs font-semibold">
            <Sliders className="w-3.5 h-3.5 text-warm-accent" />
            <span>Preferences & Data</span>
          </div>

          {/* Action Header Button */}
          <div className="flex items-center gap-2.5">
            {savedSuccess && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-800/40 animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Profile Saved Successfully</span>
              </div>
            )}
            <Button
              onClick={handleSaveProfile}
              className="py-2 px-4 shadow-subtle hover:shadow-soft font-medium text-xs sm:text-sm"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </div>

        <div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-warm-text">
            Settings
          </h1>
          <p className="text-sm sm:text-base text-warm-muted max-w-xl leading-relaxed mt-1">
            Manage your personal profile, photo, mindful reflection preferences, appearance, and local-first data.
          </p>
        </div>
      </section>

      {/* 1. Profile & Avatar Section */}
      <section className="bg-warm-card border border-warm-border rounded-3xl p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-warm-accent-light text-warm-accent">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-medium text-warm-text">
                Personal Profile
              </h2>
              <p className="text-xs text-warm-muted">
                Personalize your name, reflective greeting, and profile picture
              </p>
            </div>
          </div>

          {hasUnsavedChanges && (
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/40">
              Unsaved changes
            </span>
          )}
        </div>

        {/* Profile Picture & Name Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-2xl bg-warm-card-subtle border border-warm-border">
          <div className="relative group">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-warm-border shadow-soft group-hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-warm-accent-light text-warm-accent font-serif text-2xl font-semibold flex items-center justify-center border-2 border-warm-border shadow-soft">
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute -bottom-1 -right-1 p-2 rounded-full bg-warm-accent text-white shadow-subtle hover:bg-warm-accent/90 transition-transform active:scale-95 cursor-pointer"
              title="Change profile photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAvatarModalOpen(true)}
                leftIcon={<ImageIcon className="w-3.5 h-3.5 text-warm-accent" />}
              >
                Change Photo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Upload className="w-3.5 h-3.5" />}
              >
                Upload from Device
              </Button>
              {profile.avatarUrl && (
                <button
                  type="button"
                  onClick={() => handleAvatarSelect('')}
                  className="text-xs text-rose-500 hover:text-rose-600 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  Remove Photo
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileUpload}
                className="hidden"
              />
            </div>
            <p className="text-[11px] text-warm-faint">
              Choose from aesthetic curated portraits or upload any image from your camera/files.
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
              onChange={(e) => handleFieldChange({ name: e.target.value })}
              placeholder="Enter your name..."
              className="w-full bg-warm-card-subtle border border-warm-border rounded-2xl px-4 py-2.5 text-sm text-warm-text outline-none focus:border-warm-accent transition-colors font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-warm-muted block mb-1">
              Preferred Capture Mode
            </label>
            <select
              value={profile.defaultEntryType}
              onChange={(e) =>
                handleFieldChange({ defaultEntryType: e.target.value as EntryType })
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
              onChange={(e) => handleFieldChange({ bio: e.target.value })}
              placeholder="e.g. Exploring slow technology, writing, and mindful living..."
              className="w-full bg-warm-card-subtle border border-warm-border rounded-2xl px-4 py-2.5 text-sm text-warm-text outline-none focus:border-warm-accent transition-colors"
            />
          </div>
        </div>

        {/* Save Profile Button */}
        <div className="pt-3 border-t border-warm-border flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-warm-muted">
            All profile information is stored privately in your browser storage.
          </p>
          <Button
            onClick={handleSaveProfile}
            size="md"
            className="shadow-subtle hover:shadow-soft"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile Changes
          </Button>
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
              onChange={(m: Mood) => handleFieldChange({ defaultMood: m })}
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
                onChange={(e) => handleFieldChange({ autoTranscribe: e.target.checked })}
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
                  handleFieldChange({ aiReflectionEnabled: e.target.checked })
                }
                className="w-5 h-5 accent-warm-accent rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div className="pt-3 border-t border-warm-border flex justify-end">
          <Button
            onClick={handleSaveProfile}
            size="sm"
            variant="secondary"
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Preferences
          </Button>
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
              onClick={() => handleFieldChange({ theme: t })}
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

      {/* 4. Hardware Permissions */}
      <section className="bg-warm-card border border-warm-border rounded-3xl p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-medium text-warm-text">
              Hardware Permissions
            </h2>
            <p className="text-xs text-warm-muted">
              Status of browser microphone and camera access
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-warm-card-subtle border border-warm-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-warm-text">Microphone</p>
                <p className="text-xs text-warm-muted">Voice Journaling</p>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                micStatus === 'granted'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                  : micStatus === 'denied'
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                  : 'bg-warm-card text-warm-muted border border-warm-border'
              }`}
            >
              {micStatus}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-warm-card-subtle border border-warm-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-warm-text">Camera</p>
                <p className="text-xs text-warm-muted">Video Journaling</p>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                camStatus === 'granted'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                  : camStatus === 'denied'
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                  : 'bg-warm-card text-warm-muted border border-warm-border'
              }`}
            >
              {camStatus}
            </span>
          </div>
        </div>
      </section>

      {/* 5. Data Ownership & Storage */}
      <section className="bg-warm-card border border-warm-border rounded-3xl p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-medium text-warm-text">
              Data Portability & Local Storage
            </h2>
            <p className="text-xs text-warm-muted">
              {entriesCount} memories recorded • Full local data ownership
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            onClick={handleExportJSON}
            className="p-4 rounded-2xl bg-warm-card-subtle border border-warm-border hover:border-warm-border-strong hover:shadow-subtle transition-all text-left flex items-start gap-3 cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-warm-card border border-warm-border text-warm-accent group-hover:scale-105 transition-transform">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-warm-text">Export JSON Backup</p>
              <p className="text-xs text-warm-muted mt-0.5">
                Complete journal with metadata & settings
              </p>
            </div>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="p-4 rounded-2xl bg-warm-card-subtle border border-warm-border hover:border-warm-border-strong hover:shadow-subtle transition-all text-left flex items-start gap-3 cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-warm-card border border-warm-border text-warm-accent group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-warm-text">Export Markdown (.md)</p>
              <p className="text-xs text-warm-muted mt-0.5">
                Readable plain text archive for Obsidian/Logseq
              </p>
            </div>
          </button>

          <label className="p-4 rounded-2xl bg-warm-card-subtle border border-warm-border hover:border-warm-border-strong hover:shadow-subtle transition-all text-left flex items-start gap-3 cursor-pointer group">
            <div className="p-2 rounded-xl bg-warm-card border border-warm-border text-warm-accent group-hover:scale-105 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-warm-text">Import Backup</p>
              <p className="text-xs text-warm-muted mt-0.5">
                Restore previously exported JSON backup
              </p>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetDemo}
            className="p-4 rounded-2xl bg-warm-card-subtle border border-warm-border hover:border-warm-border-strong hover:shadow-subtle transition-all text-left flex items-start gap-3 cursor-pointer group"
          >
            <div className="p-2 rounded-xl bg-warm-card border border-warm-border text-warm-accent group-hover:scale-105 transition-transform">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-warm-text">Load Sample Memories</p>
              <p className="text-xs text-warm-muted mt-0.5">
                Restore initial demo memories & reflections
              </p>
            </div>
          </button>
        </div>

        {/* Danger zone */}
        <div className="pt-4 border-t border-rose-200/50 dark:border-rose-900/30 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Clear All Journal Data
            </p>
            <p className="text-xs text-warm-muted">
              Permanently removes all local entries, voice notes, and media.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setClearConfirmOpen(true)}
            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear Data
          </Button>
        </div>
      </section>

      {/* Avatar Picker Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-md"
            onClick={() => setIsAvatarModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-warm-card border border-warm-border rounded-3xl p-6 sm:p-8 shadow-elevated z-10 animate-slide-up space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-medium text-warm-text">
                Choose Profile Photo
              </h3>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1.5 rounded-full text-warm-muted hover:text-warm-text hover:bg-warm-card-subtle transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Curated Aesthetic Avatars */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-warm-muted block">
                Curated Portraits
              </label>
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.name}
                    type="button"
                    onClick={() => handleAvatarSelect(av.url)}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer"
                  >
                    <img
                      src={av.url}
                      alt={av.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-warm-border group-hover:border-warm-accent group-hover:scale-105 transition-all shadow-subtle"
                    />
                    <span className="text-[11px] text-warm-muted group-hover:text-warm-text font-medium truncate max-w-full">
                      {av.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Custom */}
            <div className="pt-4 border-t border-warm-border flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Upload from Files / Camera
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAvatarModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {clearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-md"
            onClick={() => setClearConfirmOpen(false)}
          />
          <div className="relative w-full max-w-md bg-warm-card border border-rose-200 dark:border-rose-900 rounded-3xl p-6 shadow-elevated z-10 animate-slide-up space-y-4">
            <h3 className="font-serif text-xl font-medium text-rose-600 dark:text-rose-400">
              Clear all journal data?
            </h3>
            <p className="text-xs sm:text-sm text-warm-muted leading-relaxed">
              This will permanently delete all your memories, recorded voice memos, videos, photos, and reset settings on this browser. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClearConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleClearAll}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Yes, Delete Everything
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
