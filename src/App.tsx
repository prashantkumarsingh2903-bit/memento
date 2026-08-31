import { useState } from 'react';
import type { ActiveView, EntryType, JournalEntry, Mood, ToastMessage } from './types';
import { useTheme } from './hooks/useTheme';
import { useEntries } from './hooks/useEntries';
import { storageService } from './services/storage/storageService';
import { AppShell } from './components/layout/AppShell';
import { Home } from './pages/Home';
import { Journal } from './pages/Journal';
import { EntryDetail } from './pages/EntryDetail';
import { EditorPage } from './pages/EditorPage';
import { Reflect } from './pages/Reflect';
import { Insights } from './pages/Insights';
import { Settings } from './pages/Settings';
import { VoiceRecorderModal } from './components/recording/VoiceRecorderModal';
import { VideoRecorderModal } from './components/recording/VideoRecorderModal';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [profile, setProfile] = useState(() => storageService.getProfile());
  const { theme, setTheme } = useTheme();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Recording Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Entries hook
  const {
    entries,
    filteredEntries,
    allTags,
    filters,
    setFilters,
    createEntry,
    updateEntry,
    deleteEntry,
    toggleFavorite,
    getEntryById,
    reloadEntries,
  } = useEntries();

  // Current selected entry & editing state
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [captureType, setCaptureType] = useState<EntryType>('text');
  const [capturePrompt, setCapturePrompt] = useState<string>('');
  const [captureMood, setCaptureMood] = useState<Mood | undefined>();

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Handlers
  const handleStartCapture = (type: EntryType, initialPrompt?: string, initialMood?: Mood) => {
    if (type === 'voice') {
      setIsVoiceModalOpen(true);
      return;
    }
    if (type === 'video') {
      setIsVideoModalOpen(true);
      return;
    }

    setCaptureType(type);
    setCapturePrompt(initialPrompt || '');
    setCaptureMood(initialMood);
    setEditingEntryId(null);
    setActiveView('new-entry');
  };

  const handleOpenEntry = (id: string) => {
    setSelectedEntryId(id);
    setActiveView('entry-detail');
  };

  const handleEditEntry = (id: string) => {
    setEditingEntryId(id);
    setActiveView('edit-entry');
  };

  const handleDeleteEntry = (id: string) => {
    const success = deleteEntry(id);
    if (success) {
      addToast({
        type: 'info',
        title: 'Memory removed',
        description: 'The journal entry was deleted.',
      });
      if (activeView === 'entry-detail' || editingEntryId === id) {
        setActiveView('journal');
      }
    }
  };

  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavorite(id);
    if (updated) {
      addToast({
        type: 'success',
        title: updated.isFavorite ? 'Saved to favorites' : 'Removed from favorites',
      });
    }
  };

  const handleSaveNewEntry = (
    data: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const created = createEntry(data);
    addToast({
      type: 'success',
      title: 'Memory saved',
      description: `"${created.title}" was recorded in your journal.`,
    });
    setSelectedEntryId(created.id);
    setActiveView('entry-detail');
  };

  const handleUpdateExistingEntry = (
    id: string,
    updates: Partial<JournalEntry>
  ) => {
    const updated = updateEntry(id, updates);
    if (updated) {
      addToast({
        type: 'success',
        title: 'Changes saved',
        description: 'Your journal entry has been updated.',
      });
      setSelectedEntryId(id);
      setActiveView('entry-detail');
    }
  };

  const refreshProfile = () => {
    setProfile(storageService.getProfile());
    reloadEntries();
  };

  const activeEntry = selectedEntryId ? getEntryById(selectedEntryId) : undefined;
  const editingEntry = editingEntryId ? getEntryById(editingEntryId) : undefined;

  return (
    <AppShell
      activeView={activeView}
      onNavigate={setActiveView}
      onStartCapture={handleStartCapture}
      profile={profile}
      theme={theme}
      onThemeChange={setTheme}
      toasts={toasts}
      onDismissToast={removeToast}
    >
      {/* 1. Home View */}
      {activeView === 'home' && (
        <Home
          entries={entries}
          profile={profile}
          onStartCapture={handleStartCapture}
          onOpenEntry={handleOpenEntry}
          onEditEntry={handleEditEntry}
          onDeleteEntry={handleDeleteEntry}
          onToggleFavorite={handleToggleFavorite}
          onNavigateToJournal={() => setActiveView('journal')}
        />
      )}

      {/* 2. Journal Timeline View */}
      {activeView === 'journal' && (
        <Journal
          entries={filteredEntries}
          allTags={allTags}
          filters={filters}
          onFilterChange={setFilters}
          onOpenEntry={handleOpenEntry}
          onEditEntry={handleEditEntry}
          onDeleteEntry={handleDeleteEntry}
          onToggleFavorite={handleToggleFavorite}
          onStartCapture={handleStartCapture}
        />
      )}

      {/* 3. Mindful Reflection View */}
      {activeView === 'reflect' && (
        <Reflect
          entries={entries}
          onOpenEntry={handleOpenEntry}
          onStartWritingWithPrompt={(promptText) =>
            handleStartCapture('text', promptText)
          }
          onUpdateEntry={handleUpdateExistingEntry}
        />
      )}

      {/* 4. Long-Term Insights View */}
      {activeView === 'insights' && (
        <Insights entries={entries} onOpenEntry={handleOpenEntry} />
      )}

      {/* 5. Settings View */}
      {activeView === 'settings' && (
        <Settings
          currentProfile={profile}
          onUpdateProfile={(updated) => setProfile(updated)}
          onRefreshEntries={refreshProfile}
        />
      )}

      {/* 6. New Entry / Editor View */}
      {activeView === 'new-entry' && (
        <EditorPage
          initialType={captureType}
          initialPrompt={capturePrompt}
          initialMood={captureMood}
          onSave={handleSaveNewEntry}
          onUpdate={handleUpdateExistingEntry}
          onCancel={() => setActiveView('journal')}
        />
      )}

      {/* 7. Edit Entry View */}
      {activeView === 'edit-entry' && editingEntry && (
        <EditorPage
          initialEntry={editingEntry}
          onSave={handleSaveNewEntry}
          onUpdate={handleUpdateExistingEntry}
          onCancel={() => setActiveView('entry-detail')}
        />
      )}

      {/* 8. Entry Detail View */}
      {activeView === 'entry-detail' && activeEntry && (
        <EntryDetail
          entry={activeEntry}
          onBack={() => setActiveView('journal')}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
          onToggleFavorite={handleToggleFavorite}
          onUpdateEntry={handleUpdateExistingEntry}
        />
      )}

      {/* Dedicated Voice Recorder Modal */}
      <VoiceRecorderModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSaveVoiceEntry={(entryData) => {
          handleSaveNewEntry(entryData);
          setIsVoiceModalOpen(false);
        }}
        initialMood={captureMood}
      />

      {/* Dedicated Video Recorder Modal */}
      <VideoRecorderModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSaveVideoEntry={(entryData) => {
          handleSaveNewEntry(entryData);
          setIsVideoModalOpen(false);
        }}
        initialMood={captureMood}
      />
    </AppShell>
  );
}
