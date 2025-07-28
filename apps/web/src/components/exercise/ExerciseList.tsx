import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { exerciseService } from '../../services/exerciseService';
import type { DailyWorkout, DailyExercise } from '../../types/exercise';

interface ExerciseListProps {
    onExerciseComplete?: () => void;
}

export function ExerciseList({ onExerciseComplete }: ExerciseListProps) {
    const { user } = useAuth();
    const [workout, setWorkout] = useState<DailyWorkout | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completing, setCompleting] = useState<number | null>(null);

    useEffect(() => {
        loadWorkout();
    }, [user]);

    const loadWorkout = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);
            console.log('Loading workout for user:', user.uid);
            const dailyWorkout = await exerciseService.getDailyWorkout(user.uid);
            console.log('Loaded workout:', dailyWorkout);
            setWorkout(dailyWorkout);
        } catch (err) {
            console.error('Error loading workout:', err);
            setError('Failed to load workout');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (index: number) => {
        if (!user || !workout) {
            console.log('Cannot complete exercise - no user or workout', { user, workout });
            return;
        }

        try {
            console.log('Marking exercise complete:', { index, exercise: workout.exercises[index] });
            setCompleting(index);
            setError(null);

            const result = await exerciseService.markExerciseComplete(user.uid, index.toString());
            console.log('Exercise marked complete:', result);

            // Log the workout to update stats
            const exercise = workout.exercises[index];
            await exerciseService.logWorkout(user.uid, {
                userId: user.uid,
                exerciseId: exercise.exerciseId,
                date: new Date(),
                duration: exercise.duration,
                sets: [],
                notes: 'Completed via daily workout',
                rating: 5
            });

            setWorkout(prev => prev ? {
                ...prev,
                exercises: result.exercises,
                completed: result.completed
            } : null);

            // Notify parent component to refresh stats
            onExerciseComplete?.();
        } catch (err) {
            console.error('Error marking exercise complete:', err);
            setError('Failed to mark exercise as complete');
        } finally {
            setCompleting(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg">
                {error}
                <Button
                    onClick={loadWorkout}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                >
                    Try Again
                </Button>
            </div>
        );
    }

    if (!workout || workout.exercises.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-white/60">No exercises planned for today</p>
                <Button
                    onClick={loadWorkout}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                >
                    Refresh Exercises
                </Button>
            </div>
        );
    }

    const completedCount = workout.exercises.filter(e => e.completed).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">Today's Workout</h2>
                <div className="flex items-center gap-2">
                    <div className="text-sm text-white/60">
                        {workout.completed ? (
                            <span className="text-green-500 font-medium">All exercises completed! 🎉</span>
                        ) : (
                            `${completedCount}/${workout.exercises.length} completed`
                        )}
                    </div>
                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${(completedCount / workout.exercises.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {workout.exercises.map((exercise: DailyExercise, index) => (
                    <div
                        key={index}
                        className={`bg-white rounded-xl shadow-sm p-6 relative transition-all duration-300 ${exercise.completed
                                ? 'border-2 border-green-500 bg-green-50'
                                : 'hover:border-gray-300 border border-transparent'
                            }`}
                    >
                        {exercise.completed && (
                            <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                                Completed ✓
                            </div>
                        )}
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{exercise.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {exercise.duration} minutes
                                </p>
                            </div>
                            <Button
                                onClick={() => handleComplete(index)}
                                variant={exercise.completed ? "outline" : "primary"}
                                size="sm"
                                disabled={exercise.completed || completing === index}
                                className={`min-w-[120px] ${exercise.completed ? 'opacity-50' : ''}`}
                            >
                                {completing === index ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        Completing...
                                    </div>
                                ) : exercise.completed ? (
                                    'Completed'
                                ) : (
                                    'Mark Complete'
                                )}
                            </Button>
                        </div>

                        <p className="mt-4 text-sm text-gray-600">{exercise.description}</p>

                        {exercise.sets && exercise.reps && (
                            <p className="mt-2 text-sm font-medium text-gray-700">
                                {exercise.sets} sets × {exercise.reps} reps
                            </p>
                        )}

                        {/* YouTube Video Embed */}
                        {exercise.youtubeVideoId && (
                            <div className="mt-4 aspect-video rounded-lg overflow-hidden bg-black/20">
                                <iframe
                                    className="w-full h-full"
                                    src={`https://www.youtube.com/embed/${exercise.youtubeVideoId}`}
                                    title={`${exercise.name} tutorial`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {error && (
                <div className="mt-4 bg-destructive/10 text-destructive text-sm p-4 rounded-lg">
                    {error}
                </div>
            )}
        </div>
    );
} 