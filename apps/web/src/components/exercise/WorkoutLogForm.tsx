import { useState } from 'react';
import { Button } from '@dreamme/ui';
import { exerciseService } from '../../services/exerciseService';
import type { Exercise, WorkoutSet } from '../../types/exercise';
import { useAuth } from '../../lib/auth';

interface WorkoutLogFormProps {
    exercise: Exercise;
    onClose: () => void;
    onSuccess?: () => void;
}

export function WorkoutLogForm({ exercise, onClose, onSuccess }: WorkoutLogFormProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [duration, setDuration] = useState(exercise.estimatedDuration);
    const [sets, setSets] = useState<WorkoutSet[]>([{ reps: 0, weight: 0 }]);
    const [notes, setNotes] = useState('');
    const [rating, setRating] = useState<number>(0);

    const handleAddSet = () => {
        setSets([...sets, { reps: 0, weight: 0 }]);
    };

    const handleRemoveSet = (index: number) => {
        setSets(sets.filter((_, i) => i !== index));
    };

    const handleSetChange = (index: number, field: keyof WorkoutSet, value: number) => {
        const newSets = [...sets];
        newSets[index] = {
            ...newSets[index],
            [field]: value,
        };
        setSets(newSets);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            await exerciseService.logWorkout({
                userId: user.uid,
                exerciseId: exercise.id,
                date: new Date(),
                duration,
                sets,
                notes: notes || undefined,
                rating: rating || undefined,
            });

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Error logging workout:', err);
            setError('Failed to log workout');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Log Workout</h2>
                <p className="text-muted-foreground">Record your {exercise.name} workout</p>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            {/* Duration */}
            <div className="space-y-2">
                <label className="text-sm font-medium">
                    Duration (minutes)
                </label>
                <input
                    type="number"
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                />
            </div>

            {/* Sets */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Sets</h3>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddSet}
                        className="text-sm"
                    >
                        Add Set
                    </Button>
                </div>

                <div className="space-y-4">
                    {sets.map((set, index) => (
                        <div key={index} className="flex items-center gap-4">
                            <span className="text-sm font-medium w-16">Set {index + 1}</span>
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-muted-foreground">Reps</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={set.reps || 0}
                                        onChange={(e) => handleSetChange(index, 'reps', parseInt(e.target.value))}
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Weight (kg)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={set.weight || 0}
                                        onChange={(e) => handleSetChange(index, 'weight', parseFloat(e.target.value))}
                                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>
                            {sets.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => handleRemoveSet(index)}
                                    className="text-destructive hover:text-destructive/90"
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <label className="text-sm font-medium">
                    Notes (optional)
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="How did it feel? Any challenges or achievements?"
                />
            </div>

            {/* Rating */}
            <div className="space-y-2">
                <label className="text-sm font-medium">
                    Rate your workout (optional)
                </label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                        >
                            ★
                        </button>
                    ))}
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
                    {loading ? 'Saving...' : 'Save Workout'}
                </Button>
            </div>
        </form>
    );
} 