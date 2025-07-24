import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { exerciseService } from '../../services/exerciseService';
import type { Exercise, WorkoutLog } from '../../types/exercise';
import { WorkoutLogForm } from './WorkoutLogForm';

interface ExerciseDetailProps {
    exerciseId: string;
    onClose: () => void;
}

export function ExerciseDetail({ exerciseId, onClose }: ExerciseDetailProps) {
    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showLogForm, setShowLogForm] = useState(false);

    const loadExerciseData = async () => {
        setLoading(true);
        setError(null);

        try {
            const [exerciseData, logs] = await Promise.all([
                exerciseService.getExercise(exerciseId),
                exerciseService.getWorkoutLogs(exerciseId),
            ]);

            if (!exerciseData) {
                throw new Error('Exercise not found');
            }

            setExercise(exerciseData);
            setWorkoutLogs(logs);
        } catch (err) {
            console.error('Error loading exercise:', err);
            setError('Failed to load exercise details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExerciseData();
    }, [exerciseId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !exercise) {
        return (
            <div className="p-8 text-center">
                <p className="text-destructive mb-4">{error || 'Exercise not found'}</p>
                <Button onClick={onClose}>Go Back</Button>
            </div>
        );
    }

    if (showLogForm) {
        return (
            <WorkoutLogForm
                exercise={exercise}
                onClose={() => setShowLogForm(false)}
                onSuccess={() => {
                    loadExerciseData();
                    setShowLogForm(false);
                }}
            />
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-semibold mb-2">{exercise.name}</h2>
                    <p className="text-muted-foreground">{exercise.description}</p>
                </div>
                <Button variant="outline" onClick={onClose}>Close</Button>
            </div>

            {/* Video Section */}
            {exercise.youtubeVideoId && (
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <iframe
                        src={`https://www.youtube.com/embed/${exercise.youtubeVideoId}`}
                        title={`${exercise.name} demonstration`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </div>
            )}

            {/* Instructions and Tips */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Instructions</h3>
                    <ol className="list-decimal list-inside space-y-2">
                        {exercise.instructions.map((instruction, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                                {instruction}
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tips</h3>
                    <ul className="list-disc list-inside space-y-2">
                        {exercise.tips.map((tip, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Exercise Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Duration</h4>
                    <p className="text-2xl font-semibold">{exercise.estimatedDuration}m</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Calories</h4>
                    <p className="text-2xl font-semibold">
                        {exercise.caloriesBurnedPerMinute * exercise.estimatedDuration}
                    </p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Equipment</h4>
                    <div className="flex flex-wrap gap-1">
                        {exercise.equipment.map((item) => (
                            <span
                                key={item}
                                className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Difficulty</h4>
                    <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full">
                        {exercise.difficulty}
                    </span>
                </div>
            </div>

            {/* Workout History */}
            {workoutLogs.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Workout History</h3>
                    <div className="space-y-2">
                        {workoutLogs.map((log) => (
                            <div
                                key={log.id}
                                className="p-4 bg-white rounded-lg shadow-sm"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="text-sm font-medium">
                                            {new Date(log.date).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Duration: {log.duration} minutes
                                        </p>
                                    </div>
                                    {log.rating && (
                                        <div className="flex items-center">
                                            {Array.from({ length: log.rating }).map((_, i) => (
                                                <span key={i} className="text-yellow-400">★</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {log.sets.map((set, index) => (
                                    <div
                                        key={index}
                                        className="text-sm text-muted-foreground"
                                    >
                                        Set {index + 1}:
                                        {set.reps && ` ${set.reps} reps`}
                                        {set.weight && ` @ ${set.weight}kg`}
                                        {set.duration && ` for ${set.duration}s`}
                                        {set.distance && ` ${set.distance}m`}
                                    </div>
                                ))}
                                {log.notes && (
                                    <p className="mt-2 text-sm text-muted-foreground italic">
                                        {log.notes}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
                <Button
                    variant="outline"
                    onClick={() => setShowLogForm(true)}
                >
                    Log Workout
                </Button>
                <Button>Start Exercise</Button>
            </div>
        </div>
    );
} 