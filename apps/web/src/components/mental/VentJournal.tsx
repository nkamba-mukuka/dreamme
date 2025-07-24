import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { mentalService } from '../../services/mentalService';
import type { JournalEntry, MoodLevel, MoodTag } from '../../types/mental';

const moodEmojis: Record<MoodLevel, string> = {
    1: '😢',
    2: '😕',
    3: '😐',
    4: '🙂',
    5: '😊',
};

const moodDescriptions: Record<MoodLevel, string> = {
    1: 'Very Bad',
    2: 'Bad',
    3: 'Neutral',
    4: 'Good',
    5: 'Very Good',
};

const moodTags: { value: MoodTag; label: string; emoji: string }[] = [
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'excited', label: 'Excited', emoji: '🎉' },
    { value: 'peaceful', label: 'Peaceful', emoji: '😌' },
    { value: 'content', label: 'Content', emoji: '🥰' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' },
    { value: 'anxious', label: 'Anxious', emoji: '😰' },
    { value: 'stressed', label: 'Stressed', emoji: '😫' },
    { value: 'sad', label: 'Sad', emoji: '😢' },
    { value: 'angry', label: 'Angry', emoji: '😠' },
    { value: 'frustrated', label: 'Frustrated', emoji: '😤' },
    { value: 'tired', label: 'Tired', emoji: '😴' },
    { value: 'energetic', label: 'Energetic', emoji: '⚡' },
    { value: 'motivated', label: 'Motivated', emoji: '💪' },
    { value: 'unmotivated', label: 'Unmotivated', emoji: '🥱' },
    { value: 'other', label: 'Other', emoji: '❓' },
];

export function VentJournal() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [showEntryForm, setShowEntryForm] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

    useEffect(() => {
        const loadEntries = async () => {
            if (!user) return;

            setLoading(true);
            setError(null);

            try {
                const results = await mentalService.searchJournalEntries(user.uid, {
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                });
                setEntries(results);
            } catch (err) {
                console.error('Error loading journal entries:', err);
                setError('Failed to load journal entries');
            } finally {
                setLoading(false);
            }
        };

        loadEntries();
    }, [user]);

    const handleDeleteEntry = async (entryId: string) => {
        if (!user) return;

        try {
            await mentalService.deleteJournalEntry(entryId);
            setEntries(prev => prev.filter(entry => entry.id !== entryId));
        } catch (err) {
            console.error('Error deleting journal entry:', err);
            setError('Failed to delete journal entry');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Vent Journal</h2>
                    <p className="text-muted-foreground">Express your thoughts and track your mood</p>
                </div>
                <Button onClick={() => setShowEntryForm(true)}>
                    New Entry
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            {/* Journal Entries */}
            <div className="space-y-4">
                {entries.map((entry) => (
                    <div
                        key={entry.id}
                        className="bg-white p-6 rounded-xl shadow-sm"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{moodEmojis[entry.mood]}</span>
                                    <span className="font-medium">{moodDescriptions[entry.mood]}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {entry.date.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedEntry(entry)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive/90"
                                    onClick={() => handleDeleteEntry(entry.id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {entry.moodTags.map((tag) => {
                                const moodTag = moodTags.find(t => t.value === tag);
                                return (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                    >
                                        {moodTag?.emoji} {moodTag?.label}
                                    </span>
                                );
                            })}
                        </div>

                        <p className="whitespace-pre-wrap">{entry.content}</p>
                    </div>
                ))}

                {entries.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No journal entries yet</p>
                        <Button
                            variant="outline"
                            onClick={() => setShowEntryForm(true)}
                            className="mt-4"
                        >
                            Write Your First Entry
                        </Button>
                    </div>
                )}
            </div>

            {/* Entry Form Modal */}
            {showEntryForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <JournalEntryForm
                            onClose={() => {
                                setShowEntryForm(false);
                                setSelectedEntry(null);
                            }}
                            onSuccess={(newEntry) => {
                                setEntries(prev => [newEntry, ...prev]);
                                setShowEntryForm(false);
                                setSelectedEntry(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Edit Form Modal */}
            {selectedEntry && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <JournalEntryForm
                            entry={selectedEntry}
                            onClose={() => {
                                setShowEntryForm(false);
                                setSelectedEntry(null);
                            }}
                            onSuccess={(updatedEntry) => {
                                setEntries(prev =>
                                    prev.map(entry =>
                                        entry.id === updatedEntry.id ? updatedEntry : entry
                                    )
                                );
                                setShowEntryForm(false);
                                setSelectedEntry(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

interface JournalEntryFormProps {
    entry?: JournalEntry;
    onClose: () => void;
    onSuccess: (entry: JournalEntry) => void;
}

function JournalEntryForm({ entry, onClose, onSuccess }: JournalEntryFormProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [content, setContent] = useState(entry?.content || '');
    const [mood, setMood] = useState<MoodLevel>(entry?.mood || 3);
    const [selectedTags, setSelectedTags] = useState<MoodTag[]>(entry?.moodTags || []);
    const [isPrivate, setIsPrivate] = useState(entry?.isPrivate || false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            if (entry) {
                // Update existing entry
                await mentalService.updateJournalEntry(entry.id, {
                    content,
                    mood,
                    moodTags: selectedTags,
                    isPrivate,
                });

                onSuccess({
                    ...entry,
                    content,
                    mood,
                    moodTags: selectedTags,
                    isPrivate,
                    updatedAt: new Date(),
                });
            } else {
                // Create new entry
                const data = {
                    userId: user.uid,
                    date: new Date(),
                    content,
                    mood,
                    moodTags: selectedTags,
                    isPrivate,
                };

                const entryId = await mentalService.createJournalEntry(data);
                onSuccess({
                    id: entryId,
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

            // Update mental health stats
            await mentalService.updateMentalHealthStats(user.uid, new Date());
        } catch (err) {
            console.error('Error saving journal entry:', err);
            setError('Failed to save journal entry');
        } finally {
            setLoading(false);
        }
    };

    const handleTagToggle = (tag: MoodTag) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                    {entry ? 'Edit Entry' : 'New Entry'}
                </h2>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                >
                    Close
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            {/* Mood Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium">How are you feeling?</label>
                <div className="flex justify-between">
                    {Object.entries(moodEmojis).map(([level, emoji]) => (
                        <button
                            key={level}
                            type="button"
                            onClick={() => setMood(parseInt(level) as MoodLevel)}
                            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${mood === parseInt(level)
                                    ? 'bg-primary/10 text-primary'
                                    : 'hover:bg-primary/5'
                                }`}
                        >
                            <span className="text-2xl">{emoji}</span>
                            <span className="text-xs mt-1">
                                {moodDescriptions[parseInt(level) as MoodLevel]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Mood Tags */}
            <div className="space-y-2">
                <label className="text-sm font-medium">What emotions are you experiencing?</label>
                <div className="flex flex-wrap gap-2">
                    {moodTags.map(({ value, label, emoji }) => (
                        <Button
                            key={value}
                            type="button"
                            variant={selectedTags.includes(value) ? 'default' : 'outline'}
                            onClick={() => handleTagToggle(value)}
                            className="text-sm"
                        >
                            {emoji} {label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Journal Content */}
            <div className="space-y-2">
                <label className="text-sm font-medium">What's on your mind?</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Write your thoughts here..."
                    required
                />
            </div>

            {/* Privacy Setting */}
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="isPrivate"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isPrivate" className="text-sm font-medium">
                    Keep this entry private
                </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : entry ? 'Update Entry' : 'Save Entry'}
                </Button>
            </div>
        </form>
    );
} 