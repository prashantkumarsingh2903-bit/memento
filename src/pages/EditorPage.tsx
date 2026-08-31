import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Sparkles,
  Tag,
  X,
  Mic,
  Video,
  Bold,
  Italic,
  List,
  Quote,
  Heading2,
  Image as ImageIcon,
  Trash2,
  Eye,
  Edit2,
} from 'lucide-react';
import type { JournalEntry, Mood, EntryType, MediaItem, Reflection } from '../types';
import { MoodSelector } from '../components/common/MoodSelector';
import { Button } from '../components/common/Button';
import { aiService } from '../services/ai/aiService';

interface EditorPageProps {
  initialEntry?: JournalEntry;
  initialType?: EntryType;
  initialPrompt?: string;
  initialMood?: Mood;
  onSave: (entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdate: (id: string, updates: Partial<JournalEntry>) => void;
  onCancel: () => void;
  onOpenVoiceModal?: () => void;
  onOpenVideoModal?: () => void;
}

export const EditorPage: React.FC<EditorPageProps> = ({
  initialEntry,
  initialType = 'text',
  initialPrompt = '',
  initialMood,
  onSave,
  onUpdate,
  onCancel,
}) => {
  const isEditing = !!initialEntry;

  const [title, setTitle] = useState(initialEntry?.title || '');
  const [text, setText] = useState(
    initialEntry?.text || (initialPrompt ? `> ${initialPrompt}\n\n` : '')
  );
  const [transcript, setTranscript] = useState(initialEntry?.transcript || '');
  const [mood, setMood] = useState<Mood | undefined>(
    initialEntry?.mood || initialMood
  );
  const [tags, setTags] = useState<string[]>(initialEntry?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [media, setMedia] = useState<MediaItem[]>(initialEntry?.media || []);
  const [reflection, setReflection] = useState<Reflection | undefined>(
    initialEntry?.reflection
  );

  const [isReflecting, setIsReflecting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(
        textareaRef.current.scrollHeight,
        280
      )}px`;
    }
  }, [text]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Image Upload Handling
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const newMediaItem: MediaItem = {
        id: `media-photo-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        type: 'image',
        url,
        blob: file,
        name: file.name,
        size: file.size,
        createdAt: new Date().toISOString(),
      };
      setMedia((prev) => [...prev, newMediaItem]);
    });
  };

  const handleRemoveMedia = (mediaId: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== mediaId));
  };

  // Formatting helpers
  const applyMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = text.slice(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;

    const newText = text.slice(0, start) + replacement + text.slice(end);
    setText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected.length || 4)
      );
    }, 50);
  };

  // Trigger AI reflection
  const handleReflectWithAI = async () => {
    setIsReflecting(true);
    try {
      const genReflection = await aiService.generateReflection({
        title,
        text,
        transcript,
        mood,
        tags,
      });
      setReflection(genReflection);

      // If no mood was set, offer the AI detected mood
      if (!mood) {
        const detected = aiService.detectMood(`${title} ${text}`);
        setMood(detected);
      }

      // Add newly discovered themes as tags if not present
      if (genReflection.themes) {
        const newTags = [...tags];
        genReflection.themes.forEach((t) => {
          if (!newTags.includes(t)) newTags.push(t);
        });
        setTags(newTags);
      }
    } catch (err) {
      console.error('Reflection failed:', err);
    } finally {
      setIsReflecting(false);
    }
  };

  const determineEntryType = (): EntryType => {
    const hasAudio = media.some((m) => m.type === 'audio') || !!transcript;
    const hasVideo = media.some((m) => m.type === 'video');
    const hasPhoto = media.some((m) => m.type === 'image');
    const hasText = text.trim().length > 0;

    const count = [hasAudio, hasVideo, hasPhoto, hasText].filter(Boolean).length;
    if (count > 1) return 'mixed';
    if (hasVideo) return 'video';
    if (hasAudio) return 'voice';
    if (hasPhoto) return 'photo';
    return initialType || 'text';
  };

  const handleSave = () => {
    const finalType = determineEntryType();

    const payload = {
      title: title.trim() || 'Untitled Reflection',
      text: text.trim(),
      transcript: transcript.trim() || undefined,
      mood,
      tags,
      type: finalType,
      media,
      reflection,
      isFavorite: initialEntry?.isFavorite || false,
    };

    if (isEditing && initialEntry) {
      onUpdate(initialEntry.id, payload);
    } else {
      onSave(payload);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between gap-3 border-b border-app-border pb-4">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-app-text-secondary hover:text-app-text transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journal</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReflectWithAI}
            isLoading={isReflecting}
            leftIcon={<Sparkles className="w-4 h-4 text-[#6C4FF6]" />}
          >
            Reflect with AI
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Entry
          </Button>
        </div>
      </div>

      {/* Main Journal Form */}
      <div className="space-y-6">
        {/* Title Input */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of this moment..."
            className="w-full font-sans text-2xl sm:text-3xl font-extrabold text-app-text placeholder:text-app-text-muted bg-transparent border-none outline-none focus:ring-0 leading-tight"
          />
        </div>

        {/* Mood Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-app-text-secondary">
            How were you feeling?
          </label>
          <MoodSelector
            value={mood}
            onChange={(newMood) => setMood(newMood)}
            size="sm"
          />
        </div>

        {/* Tags Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-app-text-secondary">
            Tags & Context
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 border border-[#6C4FF6]/20 text-xs font-semibold text-[#6C4FF6] dark:text-[#856DF8] shadow-subtle"
              >
                <Tag className="w-3 h-3 text-[#6C4FF6]/60" />
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="p-0.5 text-[#6C4FF6]/60 hover:text-rose-500 rounded-full cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <div className="inline-flex items-center gap-1">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="+ Add tag..."
                className="text-xs bg-app-surface-secondary dark:bg-[#26252F] border border-app-border rounded-full px-3 py-1 outline-none text-app-text placeholder:text-app-text-muted focus:border-[#6C4FF6]"
              />
            </div>
          </div>
        </div>

        {/* Attached Media Cards */}
        {media.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-app-text-secondary">
              Attached Media ({media.length})
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="relative group rounded-xl overflow-hidden border border-app-border bg-white dark:bg-[#201F28] aspect-video flex items-center justify-center shadow-subtle"
                >
                  {item.type === 'image' && (
                    <img
                      src={item.url}
                      alt={item.name || 'Attached photo'}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {item.type === 'audio' && (
                    <div className="p-4 text-center">
                      <Mic className="w-6 h-6 text-[#6C4FF6] mx-auto mb-1" />
                      <p className="text-[11px] font-semibold text-app-text truncate">
                        {item.name || 'Voice Note'}
                      </p>
                    </div>
                  )}
                  {item.type === 'video' && (
                    <div className="p-4 text-center">
                      <Video className="w-6 h-6 text-[#D95CFF] mx-auto mb-1" />
                      <p className="text-[11px] font-semibold text-app-text truncate">
                        {item.name || 'Video Note'}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => handleRemoveMedia(item.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Remove attachment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor Toolbar & Text Area */}
        <div className="border border-app-border rounded-card overflow-hidden bg-white dark:bg-[#201F28] shadow-subtle">
          {/* Formatting Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-app-border bg-app-surface-secondary dark:bg-[#26252F] flex-wrap gap-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => applyMarkdown('**', '**')}
                className="p-1.5 rounded-lg text-app-text-muted hover:text-app-text hover:bg-white dark:hover:bg-[#201F28] transition-colors cursor-pointer"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => applyMarkdown('*', '*')}
                className="p-1.5 rounded-lg text-app-text-muted hover:text-app-text hover:bg-white dark:hover:bg-[#201F28] transition-colors cursor-pointer"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => applyMarkdown('## ')}
                className="p-1.5 rounded-lg text-app-text-muted hover:text-app-text hover:bg-white dark:hover:bg-[#201F28] transition-colors cursor-pointer"
                title="Heading"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => applyMarkdown('- ')}
                className="p-1.5 rounded-lg text-app-text-muted hover:text-app-text hover:bg-white dark:hover:bg-[#201F28] transition-colors cursor-pointer"
                title="Bullet list"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => applyMarkdown('> ')}
                className="p-1.5 rounded-lg text-app-text-muted hover:text-app-text hover:bg-white dark:hover:bg-[#201F28] transition-colors cursor-pointer"
                title="Quote"
              >
                <Quote className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-app-text-secondary hover:text-app-text hover:bg-white dark:hover:bg-[#201F28] rounded-lg transition-colors cursor-pointer"
                title="Add Photos"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-app-text-secondary hover:text-app-text hover:bg-white dark:hover:bg-[#201F28] rounded-lg transition-colors cursor-pointer"
              >
                {showPreview ? <Edit2 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPreview ? 'Edit' : 'Preview'}</span>
              </button>
            </div>
          </div>

          {/* Writing Surface */}
          {showPreview ? (
            <div className="p-6 prose dark:prose-invert max-w-none min-h-[280px] font-sans text-app-text leading-relaxed whitespace-pre-wrap">
              {text || <span className="text-app-text-muted italic">Nothing written yet.</span>}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What thoughts are gently presenting themselves today? Write freely..."
              className="w-full min-h-[280px] p-6 bg-transparent text-app-text placeholder:text-app-text-muted outline-none font-sans text-base sm:text-lg leading-relaxed resize-none"
            />
          )}
        </div>

        {/* Optional Transcript Section */}
        {transcript && (
          <div className="bg-app-surface-secondary dark:bg-[#26252F] border border-app-border rounded-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-app-text-secondary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6C4FF6]" />
                Voice Transcript
              </span>
              <button
                type="button"
                onClick={() => setTranscript('')}
                className="text-[11px] text-app-text-muted hover:text-rose-500 cursor-pointer"
              >
                Clear
              </button>
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full text-sm text-app-text italic leading-relaxed bg-transparent outline-none resize-none"
              rows={3}
            />
          </div>
        )}

        {/* Generated AI Reflection Preview */}
        {reflection && (
          <div className="bg-white dark:bg-[#201F28] border border-[#6C4FF6]/30 rounded-card p-6 shadow-subtle space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#6C4FF6]" />
                <h4 className="font-sans text-base font-bold text-app-text">
                  AI Reflection
                </h4>
              </div>
              <span className="text-[11px] text-app-text-muted">Non-prescriptive</span>
            </div>

            {reflection.summary && (
              <div>
                <h5 className="text-xs font-bold text-app-text-secondary uppercase tracking-wider mb-1">
                  What I noticed
                </h5>
                <p className="text-xs sm:text-sm text-app-text leading-relaxed">
                  {reflection.summary}
                </p>
              </div>
            )}

            {reflection.themes.length > 0 && (
              <div>
                <h5 className="text-xs font-bold text-app-text-secondary uppercase tracking-wider mb-1.5">
                  Possible Themes
                </h5>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {reflection.themes.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-[#F1EEFF] dark:bg-[#6C4FF6]/20 border border-[#6C4FF6]/20 font-semibold text-[#6C4FF6] dark:text-[#856DF8]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {reflection.questions.length > 0 && (
              <div>
                <h5 className="text-xs font-bold text-app-text-secondary uppercase tracking-wider mb-1">
                  Explore this
                </h5>
                <ul className="space-y-1.5">
                  {reflection.questions.map((q, idx) => (
                    <li
                      key={idx}
                      className="text-xs sm:text-sm text-app-text-secondary italic flex items-start gap-2"
                    >
                      <span className="text-[#6C4FF6]">›</span>
                      <span>"{q}"</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
