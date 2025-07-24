import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { mentalService } from '../../services/mentalService';
import type { Motivation, MotivationType } from '../../types/mental';

const motivationTypes: { value: MotivationType; label: string; emoji: string }[] = [
    { value: 'health', label: 'Health', emoji: '💪' },
    { value: 'fitness', label: 'Fitness', emoji: '🏃‍♂️' },
    { value: 'mental', label: 'Mental', emoji: '🧠' },
    { value: 'personal', label: 'Personal', emoji: '🎯' },
    { value: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
    { value: 'career', label: 'Career', emoji: '💼' },
    { value: 'other', label: 'Other', emoji: '✨' },
];

const reminderFrequencies: { value: 'daily' | 'weekly' | 'monthly'; label: string }[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
];

export function MotivationSystem() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [motivations, setMotivations] = useState<Motivation[]>([]);
    const [showMotivationForm, setShowMotivationForm] = useState(false);
    const [selectedMotivation, setSelectedMotivation] = useState<Motivation | null>(null);
    const [selectedType, setSelectedType] = useState<MotivationType | null>(null);

    useEffect(() => {
        const loadMotivations = async () => {
            if (!user) return;

            setLoading(true);
            setError(null);

            try {
                const results = await mentalService.searchMotivations(user.uid, {});
                setMotivations(results);
            } catch (err) {
                console.error('Error loading motivations:', err);
                setError('Failed to load motivations');
            } finally {
                setLoading(false);
            }
        };

        loadMotivations();
    }, [user]);

    const handleDeleteMotivation = async (motivationId: string) => {
        if (!user) return;

        try {
            await mentalService.deleteMotivation(motivationId);
            setMotivations(prev => prev.filter(m => m.id !== motivationId));
        } catch (err) {
            console.error('Error deleting motivation:', err);
            setError('Failed to delete motivation');
        }
    };

    const handleToggleActive = async (motivation: Motivation) => {
        if (!user) return;

        try {
            await mentalService.updateMotivation(motivation.id, {
                isActive: !motivation.isActive,
            });

            setMotivations(prev =>
                prev.map(m =>
                    m.id === motivation.id
                        ? { ...m, isActive: !m.isActive }
                        : m
                )
            );

            // Update mental health stats
            await mentalService.updateMentalHealthStats(user.uid, new Date());
        } catch (err) {
            console.error('Error updating motivation:', err);
            setError('Failed to update motivation');
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
                    <h2 className="text-2xl font-semibold">My Motivations</h2>
                    <p className="text-muted-foreground">Track what drives you and stay inspired</p>
                </div>
                <Button onClick={() => setShowMotivationForm(true)}>
                    Add Motivation
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={selectedType === null ? 'default' : 'outline'}
                    onClick={() => setSelectedType(null)}
                    className="text-sm"
                >
                    All
                </Button>
                {motivationTypes.map(({ value, label, emoji }) => (
                    <Button
                        key={value}
                        variant={selectedType === value ? 'default' : 'outline'}
                        onClick={() => setSelectedType(value)}
                        className="text-sm"
                    >
                        {emoji} {label}
                    </Button>
                ))}
            </div>

            {/* Motivations List */}
            <div className="space-y-4">
                {motivations
                    .filter(m => !selectedType || m.type === selectedType)
                    .map((motivation) => {
                        const type = motivationTypes.find(t => t.value === motivation.type);
                        return (
                            <div
                                key={motivation.id}
                                className={`bg-white p-6 rounded-xl shadow-sm ${!motivation.isActive && 'opacity-60'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-2xl">{type?.emoji}</span>
                                            <h3 className="text-lg font-semibold">{motivation.title}</h3>
                                        </div>
                                        <p className="text-muted-foreground">{motivation.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setSelectedMotivation(motivation)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive/90"
                                            onClick={() => handleDeleteMotivation(motivation.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant={motivation.isActive ? 'default' : 'outline'}
                                            onClick={() => handleToggleActive(motivation)}
                                            className="text-sm"
                                        >
                                            {motivation.isActive ? 'Active' : 'Inactive'}
                                        </Button>
                                        {motivation.reminderFrequency && (
                                            <span className="text-sm text-muted-foreground">
                                                Reminder: {motivation.reminderFrequency} at {motivation.reminderTime}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        Added {new Date(motivation.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                {motivations.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No motivations added yet</p>
                        <Button
                            variant="outline"
                            onClick={() => setShowMotivationForm(true)}
                            className="mt-4"
                        >
                            Add Your First Motivation
                        </Button>
                    </div>
                )}
            </div>

            {/* Motivation Form Modal */}
            {showMotivationForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <MotivationForm
                            onClose={() => {
                                setShowMotivationForm(false);
                                setSelectedMotivation(null);
                            }}
                            onSuccess={(newMotivation) => {
                                setMotivations(prev => [newMotivation, ...prev]);
                                setShowMotivationForm(false);
                                setSelectedMotivation(null);
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Edit Form Modal */}
            {selectedMotivation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <MotivationForm
                            motivation={selectedMotivation}
                            onClose={() => {
                                setShowMotivationForm(false);
                                setSelectedMotivation(null);
                            }}
                            onSuccess={(updatedMotivation) => {
                                setMotivations(prev =>
                                    prev.map(m =>
                                        m.id === updatedMotivation.id ? updatedMotivation : m
                                    )
                                );
                                setShowMotivationForm(false);
                                setSelectedMotivation(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

interface MotivationFormProps {
    motivation?: Motivation;
    onClose: () => void;
    onSuccess: (motivation: Motivation) => void;
}

function MotivationForm({ motivation, onClose, onSuccess }: MotivationFormProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [title, setTitle] = useState(motivation?.title || '');
    const [description, setDescription] = useState(motivation?.description || '');
    const [type, setType] = useState<MotivationType>(motivation?.type || 'personal');
    const [isActive, setIsActive] = useState(motivation?.isActive ?? true);
    const [reminderFrequency, setReminderFrequency] = useState<'daily' | 'weekly' | 'monthly' | ''>(motivation?.reminderFrequency || '');
    const [reminderTime, setReminderTime] = useState(motivation?.reminderTime || '09:00');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);

        const reminderSettings = reminderFrequency
            ? {
                reminderFrequency: reminderFrequency as 'daily' | 'weekly' | 'monthly',
                reminderTime,
            }
            : {
                reminderFrequency: undefined,
                reminderTime: undefined,
            };

        try {
            if (motivation) {
                // Update existing motivation
                await mentalService.updateMotivation(motivation.id, {
                    title,
                    description,
                    type,
                    isActive,
                    ...reminderSettings,
                });

                onSuccess({
                    ...motivation,
                    title,
                    description,
                    type,
                    isActive,
                    ...reminderSettings,
                    updatedAt: new Date(),
                });
            } else {
                // Create new motivation
                const data = {
                    userId: user.uid,
                    title,
                    description,
                    type,
                    isActive,
                    ...reminderSettings,
                };

                const motivationId = await mentalService.createMotivation(data);
                onSuccess({
                    id: motivationId,
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            }

            // Update mental health stats
            await mentalService.updateMentalHealthStats(user.uid, new Date());
        } catch (err) {
            console.error('Error saving motivation:', err);
            setError('Failed to save motivation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                    {motivation ? 'Edit Motivation' : 'New Motivation'}
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

            {/* Type Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <div className="flex flex-wrap gap-2">
                    {motivationTypes.map(({ value, label, emoji }) => (
                        <Button
                            key={value}
                            type="button"
                            variant={type === value ? 'default' : 'outline'}
                            onClick={() => setType(value)}
                            className="text-sm"
                        >
                            {emoji} {label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                    placeholder="What motivates you?"
                    required
                />
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Why is this important to you?"
                    required
                />
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                    This motivation is currently active
                </label>
            </div>

            {/* Reminders */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium">Reminders</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-muted-foreground">Frequency</label>
                        <select
                            value={reminderFrequency}
                            onChange={(e) => setReminderFrequency(e.target.value as 'daily' | 'weekly' | 'monthly' | '')}
                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">No reminders</option>
                            {reminderFrequencies.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                    {reminderFrequency && (
                        <div>
                            <label className="text-sm text-muted-foreground">Time</label>
                            <input
                                type="time"
                                value={reminderTime}
                                onChange={(e) => setReminderTime(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    )}
                </div>
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
                    {loading ? 'Saving...' : motivation ? 'Update Motivation' : 'Save Motivation'}
                </Button>
            </div>
        </form>
    );
} 