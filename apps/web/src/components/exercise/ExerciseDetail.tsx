import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { exerciseService } from '../../services/exerciseService';
import type { DailyExercise, Exercise } from '../../types/exercise';

function YouTubeVideo({ videoId, title }: { videoId: string; title: string }) {
    return (
        <div className="aspect-video rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm">
            <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
}

export function ExerciseDetail() {
    const { exerciseId } = useParams<{ exerciseId: string }>();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dailyExercise, setDailyExercise] = useState<DailyExercise | null>(null);
    const [exerciseDetails, setExerciseDetails] = useState<Exercise | null>(null);

    useEffect(() => {
        loadExercise();
    }, [exerciseId]);

    const loadExercise = async () => {
        if (!exerciseId || !user) return;

        try {
            setLoading(true);
            setError(null);

            // Get daily exercise
            const dailyWorkout = await exerciseService.getDailyWorkout(user.uid);
            const exercise = dailyWorkout.exercises.find((e, i) => i.toString() === exerciseId);

            if (!exercise) {
                setError('Exercise not found');
                return;
            }

            setDailyExercise(exercise);

            // Get full exercise details
            const details = await exerciseService.getExerciseById(exercise.exerciseId);
            if (details) {
                setExerciseDetails(details);
            }
        } catch (err) {
            console.error('Error loading exercise:', err);
            setError('Failed to load exercise details');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        if (!exerciseId || !user) return;

        try {
            setLoading(true);
            setError(null);
            await exerciseService.markExerciseComplete(user.uid, exerciseId);
            await loadExercise(); // Reload exercise to get updated status
        } catch (err) {
            console.error('Error completing exercise:', err);
            setError('Failed to mark exercise as complete');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 text-red-200 p-4 rounded-lg border border-red-500/20">
                {error}
                <Button onClick={() => setError(null)} variant="outline" className="mt-2">
                    Try Again
                </Button>
            </div>
        );
    }

    if (!dailyExercise || !exerciseDetails) {
        return (
            <div className="text-center py-8">
                <p className="text-white/60">Exercise not found</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white">{dailyExercise.name}</h1>
                    <p className="text-white/60 mt-2">{dailyExercise.description}</p>
                </div>
                <Button
                    onClick={handleComplete}
                    disabled={dailyExercise.completed}
                    variant={dailyExercise.completed ? 'outline' : 'primary'}
                >
                    {dailyExercise.completed ? 'Completed' : 'Mark as Complete'}
                </Button>
            </div>

            {exerciseDetails.youtubeVideoId && (
                <YouTubeVideo videoId={exerciseDetails.youtubeVideoId} title={dailyExercise.name} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h2 className="text-xl font-semibold mb-4 text-white">Instructions</h2>
                        <ol className="list-decimal list-inside space-y-2">
                            {exerciseDetails.instructions?.map((instruction, index) => (
                                <li key={index} className="text-white/80">{instruction}</li>
                            ))}
                        </ol>
                    </div>

                    {exerciseDetails.tips && exerciseDetails.tips.length > 0 && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                            <h2 className="text-xl font-semibold mb-4 text-white">Tips</h2>
                            <ul className="list-disc list-inside space-y-2">
                                {exerciseDetails.tips.map((tip, index) => (
                                    <li key={index} className="text-white/80">{tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h2 className="text-xl font-semibold mb-4 text-white">Exercise Details</h2>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm text-white/60">Type</dt>
                                <dd className="font-medium text-white">{exerciseDetails.type}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-white/60">Duration</dt>
                                <dd className="font-medium text-white">{exerciseDetails.duration}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-white/60">Difficulty</dt>
                                <dd className="font-medium capitalize text-white">{exerciseDetails.difficulty}</dd>
                            </div>
                            {exerciseDetails.muscleGroups && (
                                <div>
                                    <dt className="text-sm text-white/60">Muscle Groups</dt>
                                    <dd className="font-medium text-white">{exerciseDetails.muscleGroups.join(', ')}</dd>
                                </div>
                            )}
                            {exerciseDetails.equipment && (
                                <div>
                                    <dt className="text-sm text-white/60">Equipment Needed</dt>
                                    <dd className="font-medium text-white">{exerciseDetails.equipment.join(', ')}</dd>
                                </div>
                            )}
                            {exerciseDetails.caloriesBurnedPerMinute && (
                                <div>
                                    <dt className="text-sm text-white/60">Estimated Calories</dt>
                                    <dd className="font-medium text-white">
                                        {exerciseDetails.caloriesBurnedPerMinute * parseInt(exerciseDetails.duration)} calories
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h2 className="text-xl font-semibold mb-4 text-white">Recommended Sets</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Sets</span>
                                <span className="font-medium text-white">{dailyExercise.sets}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60">Reps per Set</span>
                                <span className="font-medium text-white">{dailyExercise.reps}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 