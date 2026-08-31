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
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1EEFF] dark:bg-[#6C4FF6]/18 text-[#6C4FF6] dark:text-[#856DF8] text-xs font-semibold border border-[#6C4FF6]/20">
            <Sliders className="w-3.5 h-3.5" />
            <span>Preferences & Data</span>
          </div>

          {/* Action Header Button */}
          <div className="flex items-center gap-2.5">
            {savedSuccess && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-emerald-800/40 animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Profile Saved</span>
              </div>
            )}
            <Button
              onClick={handleSaveProfile}
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </div>

        <div>
          <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-app-text">
            Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-app-text-secondary max-w-xl leading-relaxed mt-1">
            Manage your personal profile, photo, mindful reflection preferences, appearance, and local-first data.
          </p>
        </div>
      </section>

      {/* 1. Profile & Avatar Section */}
      <section className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans text-base sm:text-lg font-bold text-app-text">
                Personal Profile
              </h2>
              <p className="text-xs text-app-text-secondary">
                Personalize your name, reflective greeting, and profile picture
              </p>
            </div>
          </div>

          {hasUnsavedChanges && (
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/40">
              Unsaved changes
            </span>
          )}
        </div>

        {/* Profile Picture & Name Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-xl bg-app-surface-secondary dark:bg-[#26252F] border border-app-border">
          <div className="relative group">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-app-border shadow-soft group-hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8] font-bold text-2xl flex items-center justify-center border-2 border-app-border shadow-soft">
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-[#6C4FF6] text-white shadow-subtle hover:bg-[#5B3FD4] transition-transform active:scale-95 cursor-pointer"
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
                leftIcon={<ImageIcon className="w-3.5 h-3.5 text-[#6C4FF6]" />}
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
            <p className="text-[11px] text-app-text-muted">
              Choose from aesthetic curated portraits or upload any image from your camera/files.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-app-text-secondary block mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleFieldChange({ name: e.target.value })}
              placeholder="Enter your name..."
              className="w-full bg-app-surface-secondary dark:bg-[#26252F] border border-app-border rounded-xl px-4 py-2.5 text-sm text-app-text outline-none focus:border-[#6C4FF6] transition-colors font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-app-text-secondary block mb-1">
              Preferred Capture Mode
            </label>
            <select
              value={profile.defaultEntryType}
              onChange={(e) =>
                handleFieldChange({ defaultEntryType: e.target.value as EntryType })
              }
              className="w-full bg-app-surface-secondary dark:bg-[#26252F] border border-app-border rounded-xl px-4 py-2.5 text-sm text-app-text outline-none focus:border-[#6C4FF6] transition-colors capitalize cursor-pointer font-medium"
            >
              <option value="text">Written Text Journal</option>
              <option value="voice">Spoken Voice Journal</option>
              <option value="video">Video Journal</option>
              <option value="photo">Photo Story</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-app-text-secondary block mb-1">
              Personal Intent / Bio
            </label>
            <input
              type="text"
              value={profile.bio || ''}
              onChange={(e) => handleFieldChange({ bio: e.target.value })}
              placeholder="e.g. Exploring slow technology, writing, and mindful living..."
              className="w-full bg-app-surface-secondary dark:bg-[#26252F] border border-app-border rounded-xl px-4 py-2.5 text-sm text-app-text outline-none focus:border-[#6C4FF6] transition-colors"
            />
          </div>
        </div>

        {/* Save Profile Button */}
        <div className="pt-3 border-t border-app-border flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-app-text-muted">
            All profile information is stored privately in your browser storage.
          </p>
          <Button
            onClick={handleSaveProfile}
            size="sm"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile Changes
          </Button>
        </div>
      </section>

      {/* 2. Journaling & Reflection Preferences */}
      <section className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-sans text-base sm:text-lg font-bold text-app-text">
              Journaling & AI Reflection
            </h2>
            <p className="text-xs text-app-text-secondary">
              Configure automated transcription and reflection assistant
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-app-text-secondary block">
              Default Baseline Mood
            </label>
            <MoodSelector
              value={profile.defaultMood}
              onChange={(m: Mood) => handleFieldChange({ defaultMood: m })}
              size="sm"
            />
          </div>

          <div className="pt-2 border-t border-app-border space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-app-surface-secondary dark:bg-[#26252F] border border-app-border cursor-pointer">
              <div>
                <span className="text-sm font-bold text-app-text block">
                  Automatic Audio Transcription
                </span>
                <span className="text-xs text-app-text-secondary block">
                  Transcribe spoken voice memos in real-time when recording
                </span>
              </div>
              <input
                type="checkbox"
                checked={profile.autoTranscribe}
                onChange={(e) => handleFieldChange({ autoTranscribe: e.target.checked })}
                className="w-4 h-4 accent-[#6C4FF6] rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-app-surface-secondary dark:bg-[#26252F] border border-app-border cursor-pointer">
              <div>
                <span className="text-sm font-bold text-app-text block">
                  Empathetic AI Reflections
                </span>
                <span className="text-xs text-app-text-secondary block">
                  Generate gentle observations and follow-up contemplation prompts
                </span>
              </div>
              <input
                type="checkbox"
                checked={profile.aiReflectionEnabled}
                onChange={(e) =>
                  handleFieldChange({ aiReflectionEnabled: e.target.checked })
                }
                className="w-4 h-4 accent-[#6C4FF6] rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div className="pt-3 border-t border-app-border flex justify-end">
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
      <section className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6] dark:text-[#856DF8]">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-sans text-base sm:text-lg font-bold text-app-text">
              Appearance & Theme
            </h2>
            <p className="text-xs text-app-text-secondary">
              Choose the visual palette that fits your focus
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleFieldChange({ theme: t })}
              className={`p-4 rounded-xl border text-center capitalize transition-all cursor-pointer ${
                profile.theme === t
                  ? 'border-[#6C4FF6] bg-[#F1EEFF] dark:bg-[#6C4FF6]/18 font-bold text-[#6C4FF6] dark:text-[#856DF8] shadow-subtle'
                  : 'border-app-border bg-app-surface-secondary dark:bg-[#26252F] text-app-text-secondary hover:text-app-text'
              }`}
            >
              <span className="text-sm block">{t} Theme</span>
              <span className="text-[10px] text-app-text-muted mt-0.5 block">
                {t === 'system' ? 'Follows OS' : t === 'light' ? 'Soft lavender' : 'Deep dark'}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Hardware Permissions */}
      <section className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-sans text-base sm:text-lg font-bold text-app-text">
              Hardware Permissions
            </h2>
            <p className="text-xs text-app-text-secondary">
              Status of browser microphone and camera access
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-app-surface-secondary dark:bg-[#26252F] border border-app-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 text-[#6C4FF6]">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-app-text">Microphone</p>
                <p className="text-xs text-app-text-secondary">Voice Journaling</p>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                micStatus === 'granted'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                  : micStatus === 'denied'
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                  : 'bg-white dark:bg-[#201F28] text-app-text-muted border border-app-border'
              }`}
            >
              {micStatus}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-app-surface-secondary dark:bg-[#26252F] border border-app-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-600">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-app-text">Camera</p>
                <p className="text-xs text-app-text-secondary">Video Journaling</p>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                camStatus === 'granted'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                  : camStatus === 'denied'
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                  : 'bg-white dark:bg-[#201F28] text-app-text-muted border border-app-border'
              }`}
            >
              {camStatus}
            </span>
          </div>
        </div>
      </section>

      {/* 5. Data Ownership & Storage */}
      <section className="bg-white dark:bg-[#201F28] border border-app-border rounded-card p-6 sm:p-8 shadow-subtle space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-sans text-base sm:text-lg font-bold text-app-text">
              Data Portability & Local Storage
            </h2>
            <p className="text-xs text-app-text-secondary">
              {entriesCount} memories recorded • Full local data ownership
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            onClick={handleExportJSON}
            className="p-4 rounded-xl bg-app-surface-secondary dark:bg-[#26252F] border border-app-border hover:border-[#6C4FF6]/40 hover:shadow-subtle transition-all text-left flex items-start gap-3 cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-white dark:bg-[#201F28] border border-app-border text-[#6C4FF6] group-hover:scale-105 transition-transform">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-app-text">Export JSON Backup</p>
              <p className="text-xs text-app-text-secondary mt-0.5">
                Complete journal with metadata & settings
              </p>
            </div>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="p-4 rounded-xl bg-app-surface-secondary dark:bg-[#26252F] border border-app-border hover:border-[#6C4FF6]/40 hover:shadow-subtle transition-all text-left flex items-start gap-3 cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-white dark:bg-[#201F28] border border-app-border text-[#6C4FF6] group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-app-text">Export Markdown (.md)</p>
              <p className="text-xs text-app-text-secondary mt-0.5">
                Readable plain text archive for Obsidian/Logseq
              </p>
            </div>
          </button>

          <label className="p-4 rounded-xl bg-app-surface-secondary dark:bg-[#26252F] border border-app-border hover:border-[#6C4FF6]/40 hover:shadow-subtle transition-all text-left flex items-start gap-3 cursor-pointer group">
            <div className="p-2 rounded-lg bg-white dark:bg-[#201F28] border border-app-border text-[#6C4FF6] group-hover:scale-105 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-app-text">Import Backup</p>
              <p className="text-xs text-app-text-secondary mt-0.5">
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
            className="p-4 rounded-xl bg-app-surface-secondary dark:bg-[#26252F] border border-app-border hover:border-[#6C4FF6]/40 hover:shadow-subtle transition-all text-left flex items-start gap-3 cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-white dark:bg-[#201F28] border border-app-border text-[#6C4FF6] group-hover:scale-105 transition-transform">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-app-text">Load Sample Memories</p>
              <p className="text-xs text-app-text-secondary mt-0.5">
                Restore initial demo memories & reflections
              </p>
            </div>
          </button>
        </div>

        {/* Danger zone */}
        <div className="pt-4 border-t border-rose-200/50 dark:border-rose-900/30 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
              Clear All Journal Data
            </p>
            <p className="text-xs text-app-text-secondary">
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
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsAvatarModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#201F28] border border-app-border rounded-card p-6 sm:p-8 shadow-elevated z-10 animate-slide-up space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-xl font-bold text-app-text">
                Choose Profile Photo
              </h3>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1.5 rounded-xl text-app-text-muted hover:text-app-text hover:bg-app-surface-secondary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Curated Aesthetic Avatars */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-app-text-secondary block">
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
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-app-border group-hover:border-[#6C4FF6] group-hover:scale-105 transition-all shadow-subtle"
                    />
                    <span className="text-[11px] text-app-text-secondary group-hover:text-[#6C4FF6] font-semibold truncate max-w-full">
                      {av.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Custom */}
            <div className="pt-4 border-t border-app-border flex items-center justify-between gap-3">
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
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setClearConfirmOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-[#201F28] border border-rose-200 dark:border-rose-900 rounded-card p-6 shadow-elevated z-10 animate-slide-up space-y-4">
            <h3 className="font-sans text-lg font-bold text-rose-600 dark:text-rose-400">
              Clear all journal data?
            </h3>
            <p className="text-xs sm:text-sm text-app-text-secondary leading-relaxed">
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
