import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { exerciseService } from '../../services/exerciseService';
import { useAuth } from '../../lib/auth';
import type { WorkoutSet, Exercise } from '../../types/exercise';
import { EXERCISE_RECOMMENDATIONS } from '../../services/exerciseService';

interface WorkoutLogFormProps {
    preSelectedExercise: string;
    onComplete: () => void;
}

interface Set {
    reps: number;
    weight: number;
}

export function WorkoutLogForm({ preSelectedExercise, onComplete }: WorkoutLogFormProps) {
    const { user } = useAuth();
    const [sets, setSets] = useState<Set[]>([{ reps: 0, weight: 0 }]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [duration, setDuration] = useState(30); // Default to 30 minutes
    const [selectedExercise, setSelectedExercise] = useState(preSelectedExercise);
    const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);

    useEffect(() => {
        // Load available exercises
        const exercises: Exercise[] = [];
        Object.values(EXERCISE_RECOMMENDATIONS).forEach(goalExercises => {
            Object.values(goalExercises).forEach(levelExercises => {
                exercises.push(...(levelExercises as Exercise[]));
            });
        });
        setAvailableExercises(exercises);
    }, []);

    const handleAddSet = () => {
        setSets([...sets, { reps: 0, weight: 0 }]);
    };

    const handleRemoveSet = (index: number) => {
        setSets(sets.filter((_, i) => i !== index));
    };

    const handleSetChange = (index: number, field: keyof Set, value: number) => {
        const newSets = [...sets];
        newSets[index] = { ...newSets[index], [field]: value };
        setSets(newSets);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedExercise) {
            setError('Please select an exercise');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Transform sets into the correct format
            const workoutSets: WorkoutSet[] = sets.map(set => ({
                reps: set.reps,
                weight: set.weight
            }));

            // Find the selected exercise details
            const exercise = availableExercises.find(e => e.name === selectedExercise);

            await exerciseService.logWorkout(user.uid, {
                userId: user.uid,
                exerciseId: selectedExercise,
                date: new Date(),
                duration: duration,
                sets: workoutSets,
                notes,
                rating: 5 // Default rating
            });

            onComplete();
        } catch (err) {
            console.error('Error logging workout:', err);
            setError('Failed to save workout log');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="bg-red-500/10 text-red-200 p-4 rounded-lg mb-4 border border-red-500/20">
                {error}
                <Button onClick={() => setError(null)} variant="outline" className="mt-2">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Log Workout</h2>
                <p className="text-gray-600">Record your sets, reps, and weight for this exercise.</p>
            </div>

            <div>
                <label className="block font-medium mb-2 text-gray-700">Exercise</label>
                <select
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={loading}
                    required
                >
                    <option value="">Select an exercise</option>
                    {availableExercises.map((exercise) => (
                        <option key={exercise.name} value={exercise.name}>
                            {exercise.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block font-medium mb-2 text-gray-700">Duration (minutes)</label>
                <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="1"
                    max="240"
                    required
                    disabled={loading}
                />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Sets</h3>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddSet}
                        disabled={loading}
                        size="sm"
                    >
                        Add Set
                    </Button>
                </div>

                {sets.map((set, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <span className="text-gray-600">Set {index + 1}</span>
                        <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => handleSetChange(index, 'reps', parseInt(e.target.value))}
                            placeholder="Reps"
                            className="w-20 px-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={loading}
                            min="0"
                            required
                        />
                        <input
                            type="number"
                            value={set.weight}
                            onChange={(e) => handleSetChange(index, 'weight', parseInt(e.target.value))}
                            placeholder="Weight (lbs)"
                            className="w-24 px-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            disabled={loading}
                            min="0"
                            required
                        />
                        {sets.length > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleRemoveSet(index)}
                                disabled={loading}
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                                Remove
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            <div>
                <label className="block font-medium mb-2 text-gray-700">Notes</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={3}
                    placeholder="Add any notes about your workout..."
                    disabled={loading}
                />
            </div>

            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onComplete}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Workout'}
                </Button>
            </div>
        </form>
    );
} 