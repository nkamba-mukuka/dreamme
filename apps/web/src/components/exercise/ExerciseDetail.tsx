import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { exerciseService, Exercise } from '../../services/exerciseService';
import { Button } from '@dreamme/ui';

interface ExerciseDetailProps {
    exerciseId: string;
    onClose: () => void;
}

export function ExerciseDetail({ exerciseId, onClose }: ExerciseDetailProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [exercise, setExercise] = useState<Exercise | null>(null);

    useEffect(() => {
        loadExercise();
    }, [exerciseId]);

    const loadExercise = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            const exerciseDetails = await exerciseService.getExercise(exerciseId);
            if (!exerciseDetails) {
                throw new Error('Exercise not found');
            }

            setExercise(exerciseDetails);
        } catch (err) {
            console.error('Error loading exercise:', err);
            setError('Failed to load exercise details');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        if (!user || !exercise) return;

        try {
            setLoading(true);
            await exerciseService.markExerciseComplete(user.uid, exerciseId);
            onClose();
        } catch (err) {
            console.error('Error completing exercise:', err);
            setError('Failed to mark exercise as complete');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !exercise) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
                    {error || 'Exercise not found'}
                </div>
                <Button onClick={onClose}>Close</Button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="relative h-64">
                    {exercise.imageUrl && (
                        <img
                            src={exercise.imageUrl}
                            alt={exercise.name}
                            className="absolute inset-0 w-full h-full object-cover rounded-t-xl"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                        <h2 className="text-2xl font-bold text-white">{exercise.name}</h2>
                        <p className="text-white/80">{exercise.description}</p>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                        <ol className="list-decimal list-inside space-y-2">
                            {exercise.instructions.map((instruction, index) => (
                                <li key={index} className="text-gray-600">{instruction}</li>
                            ))}
                        </ol>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Muscle Groups</h3>
                        <div className="flex flex-wrap gap-2">
                            {exercise.muscleGroups.map((group) => (
                                <span
                                    key={group}
                                    className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                >
                                    {group}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Equipment</h3>
                        <div className="flex flex-wrap gap-2">
                            {exercise.equipment.map((item) => (
                                <span
                                    key={item}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    {exercise.videoUrl && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">Video Tutorial</h3>
                            <div className="aspect-video rounded-lg overflow-hidden">
                                <iframe
                                    src={exercise.videoUrl}
                                    title={`${exercise.name} tutorial`}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-4">
                        <Button onClick={onClose} variant="ghost">
                            Close
                        </Button>
                        <Button onClick={handleComplete} disabled={loading}>
                            {loading ? 'Marking Complete...' : 'Mark Complete'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
} 