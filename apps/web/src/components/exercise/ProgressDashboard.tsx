import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { exerciseService } from '../../services/exerciseService';
import type { ExerciseProgress, Exercise } from '../../types/exercise';

export function ProgressDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [progressData, setProgressData] = useState<(ExerciseProgress & { exercise: Exercise })[]>([]);

    useEffect(() => {
        const loadProgressData = async () => {
            if (!user) return;

            setLoading(true);
            setError(null);

            try {
                const progress = await exerciseService.getAllExerciseProgress(user.uid);

                // Load exercise details for each progress entry
                const progressWithExercises = await Promise.all(
                    progress.map(async (p) => {
                        const exercise = await exerciseService.getExercise(p.exerciseId);
                        return {
                            ...p,
                            exercise: exercise!,
                        };
                    })
                );

                setProgressData(progressWithExercises);
            } catch (err) {
                console.error('Error loading progress data:', err);
                setError('Failed to load progress data');
            } finally {
                setLoading(false);
            }
        };

        loadProgressData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-destructive">
                {error}
            </div>
        );
    }

    if (progressData.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                No workout data available yet. Start exercising to see your progress!
            </div>
        );
    }

    // Calculate total stats
    const totalWorkouts = progressData.reduce((sum, p) => sum + p.totalSessions, 0);
    const totalMinutes = progressData.reduce((sum, p) => sum + p.totalDuration, 0);
    const totalCalories = progressData.reduce(
        (sum, p) => sum + (p.totalDuration * p.exercise.caloriesBurnedPerMinute),
        0
    );

    // Sort exercises by most recent
    const sortedProgress = [...progressData].sort(
        (a, b) => (b.lastPerformed?.getTime() || 0) - (a.lastPerformed?.getTime() || 0)
    );

    return (
        <div className="space-y-8">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-2">Total Workouts</h3>
                    <p className="text-3xl font-bold text-primary">{totalWorkouts}</p>
                    <p className="text-sm text-muted-foreground">Sessions completed</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-2">Total Time</h3>
                    <p className="text-3xl font-bold text-primary">{totalMinutes}</p>
                    <p className="text-sm text-muted-foreground">Minutes of exercise</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-2">Calories Burned</h3>
                    <p className="text-3xl font-bold text-primary">{Math.round(totalCalories)}</p>
                    <p className="text-sm text-muted-foreground">Estimated total</p>
                </div>
            </div>

            {/* Exercise Progress List */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Exercise Progress</h3>
                <div className="grid gap-4">
                    {sortedProgress.map((progress) => (
                        <div
                            key={progress.exerciseId}
                            className="bg-white p-6 rounded-xl shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-semibold mb-1">
                                        {progress.exercise.name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Last performed: {progress.lastPerformed?.toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium">
                                        {progress.totalSessions} sessions
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {progress.totalDuration} minutes total
                                    </p>
                                </div>
                            </div>

                            {/* Personal Bests */}
                            <div className="space-y-2">
                                <h5 className="text-sm font-medium">Personal Bests</h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {progress.personalBests.maxWeight && (
                                        <div className="bg-primary/5 p-2 rounded-lg">
                                            <p className="text-xs text-muted-foreground">Max Weight</p>
                                            <p className="font-medium">{progress.personalBests.maxWeight}kg</p>
                                        </div>
                                    )}
                                    {progress.personalBests.maxReps && (
                                        <div className="bg-primary/5 p-2 rounded-lg">
                                            <p className="text-xs text-muted-foreground">Max Reps</p>
                                            <p className="font-medium">{progress.personalBests.maxReps}</p>
                                        </div>
                                    )}
                                    {progress.personalBests.maxDuration && (
                                        <div className="bg-primary/5 p-2 rounded-lg">
                                            <p className="text-xs text-muted-foreground">Max Duration</p>
                                            <p className="font-medium">{progress.personalBests.maxDuration}s</p>
                                        </div>
                                    )}
                                    {progress.personalBests.maxDistance && (
                                        <div className="bg-primary/5 p-2 rounded-lg">
                                            <p className="text-xs text-muted-foreground">Max Distance</p>
                                            <p className="font-medium">{progress.personalBests.maxDistance}m</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-4">
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary"
                                        style={{
                                            width: `${Math.min(
                                                (progress.totalSessions / 10) * 100,
                                                100
                                            )}%`,
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {progress.totalSessions} / 10 sessions completed
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 