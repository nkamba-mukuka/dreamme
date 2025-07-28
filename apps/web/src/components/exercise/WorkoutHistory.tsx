import { useState, useEffect } from 'react';
import { Card } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { WorkoutLog } from '../../types/exercise';

interface WorkoutHistoryProps {
    limit?: number;
}

export function WorkoutHistory({ limit: limitProp = 10 }: WorkoutHistoryProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [workouts, setWorkouts] = useState<(WorkoutLog & { docId: string })[]>([]);

    useEffect(() => {
        loadWorkoutHistory();
    }, [user]);

    const loadWorkoutHistory = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            // Query recent workout logs
            const workoutQuery = query(
                collection(db, 'workoutLogs'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc'),
                limit(limitProp)
            );

            const querySnapshot = await getDocs(workoutQuery);
            const workoutLogs = querySnapshot.docs.map(doc => ({
                docId: doc.id,
                ...doc.data() as WorkoutLog
            }));

            setWorkouts(workoutLogs);
        } catch (err) {
            console.error('Error loading workout history:', err);
            setError('Failed to load workout history');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-white/10 rounded-xl"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-400 text-sm p-4 bg-red-400/10 rounded-xl">
                {error}
            </div>
        );
    }

    if (workouts.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No workout history yet. Start completing exercises to see your progress!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Workout History</h2>
            <div className="space-y-4">
                {workouts.map((workout) => (
                    <Card key={workout.docId} className="bg-white p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium text-gray-900">{workout.exerciseId}</h3>
                                <p className="text-sm text-gray-600">{workout.duration} minutes</p>
                                {workout.notes && (
                                    <p className="text-sm text-gray-500 mt-1">{workout.notes}</p>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">
                                    {new Date(workout.date).toLocaleDateString()}
                                </div>
                                {workout.rating && (
                                    <div className="text-yellow-500 mt-1">
                                        {'★'.repeat(workout.rating)}
                                        {'☆'.repeat(5 - workout.rating)}
                                    </div>
                                )}
                            </div>
                        </div>
                        {workout.sets && workout.sets.length > 0 && (
                            <div className="mt-4 border-t border-gray-100 pt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Sets</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    {workout.sets.map((set, index) => (
                                        <div key={index} className="text-sm text-gray-600">
                                            <span className="font-medium">Set {index + 1}:</span>
                                            {set.reps && <span> {set.reps} reps</span>}
                                            {set.weight && <span> @ {set.weight}kg</span>}
                                            {set.duration && <span> ({set.duration}s)</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
} 