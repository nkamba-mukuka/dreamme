import React, { useState } from 'react';
import { Button } from '@dreamme/ui';
import { Exercise } from '../../services/exerciseService';

interface WorkoutLogFormProps {
    exercise: Exercise;
    onSubmit: (data: {
        sets: { reps: number; weight?: number }[];
        notes: string;
    }) => void;
    onCancel: () => void;
}

export function WorkoutLogForm({ exercise, onSubmit, onCancel }: WorkoutLogFormProps) {
    const [sets, setSets] = useState([{ reps: 0, weight: 0 }]);
    const [notes, setNotes] = useState('');

    const addSet = () => {
        setSets([...sets, { reps: 0, weight: 0 }]);
    };

    const removeSet = (index: number) => {
        setSets(sets.filter((_, i) => i !== index));
    };

    const updateSet = (index: number, field: 'reps' | 'weight', value: number) => {
        setSets(
            sets.map((set, i) =>
                i === index ? { ...set, [field]: value } : set
            )
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ sets, notes });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-4">Log {exercise.name}</h3>
                <div className="space-y-4">
                    {sets.map((set, index) => (
                        <div key={index} className="flex items-center gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Set {index + 1}
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600">Reps</label>
                                <input
                                    type="number"
                                    value={set.reps}
                                    onChange={(e) =>
                                        updateSet(index, 'reps', parseInt(e.target.value))
                                    }
                                    className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600">Weight (kg)</label>
                                <input
                                    type="number"
                                    value={set.weight}
                                    onChange={(e) =>
                                        updateSet(index, 'weight', parseInt(e.target.value))
                                    }
                                    className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => removeSet(index)}
                                className="mt-5"
                            >
                                ×
                            </Button>
                        </div>
                    ))}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={addSet}
                    className="mt-4"
                >
                    Add Set
                </Button>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Notes
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
            </div>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">Save Workout</Button>
            </div>
        </form>
    );
} 