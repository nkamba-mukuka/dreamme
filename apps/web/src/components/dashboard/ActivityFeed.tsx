import { useState, useEffect } from 'react';
import { Card } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { EXERCISE_RECOMMENDATIONS } from '../../services/exerciseService';

interface ActivityLog {
    id: string;
    type: 'exercise' | 'nutrition' | 'mental';
    title: string;
    description: string;
    timestamp: Date;
    icon: string;
    details?: {
        duration?: number;
        sets?: { reps: number; weight: number }[];
        notes?: string;
        rating?: number;
        meals?: { name: string; calories: number }[];
        totalCalories?: number;
        macros?: { protein: number; carbs: number; fat: number };
    };
}

export function ActivityFeed() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activities, setActivities] = useState<ActivityLog[]>([]);

    useEffect(() => {
        loadActivities();
    }, [user]);

    const getExerciseName = (exerciseId: string): string => {
        // Search through all exercises to find the matching one
        for (const goalExercises of Object.values(EXERCISE_RECOMMENDATIONS)) {
            for (const levelExercises of Object.values(goalExercises)) {
                const exercise = levelExercises.find(e => e.name === exerciseId);
                if (exercise) {
                    return exercise.name;
                }
            }
        }
        return exerciseId; // Fallback to ID if name not found
    };

    const loadActivities = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            // Get recent activities from different collections
            const [workouts, meals, mental] = await Promise.all([
                getDocs(query(
                    collection(db, 'workoutLogs'),
                    where('userId', '==', user.uid),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                )),
                getDocs(query(
                    collection(db, 'mealLogs'),
                    where('userId', '==', user.uid),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                )),
                getDocs(query(
                    collection(db, 'journalEntries'),
                    where('userId', '==', user.uid),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                ))
            ]);

            // Combine and format activities
            const allActivities: ActivityLog[] = [
                ...workouts.docs.map(doc => {
                    const data = doc.data();
                    const exerciseName = getExerciseName(data.exerciseId);
                    return {
                        id: doc.id,
                        type: 'exercise' as const,
                        title: 'Completed a workout',
                        description: `Completed ${exerciseName}`,
                        timestamp: data.createdAt.toDate(),
                        icon: '💪',
                        details: {
                            duration: data.duration,
                            sets: data.sets,
                            notes: data.notes,
                            rating: data.rating
                        }
                    };
                }),
                ...meals.docs.map(doc => {
                    const data = doc.data();
                    if (data.type === 'daily_completion') {
                        return {
                            id: doc.id,
                            type: 'nutrition' as const,
                            title: 'Completed Daily Meal Plan',
                            description: `Followed meal plan (${data.totalCalories} calories)`,
                            timestamp: data.createdAt.toDate(),
                            icon: '🍽️',
                            details: {
                                meals: data.meals,
                                totalCalories: data.totalCalories,
                                macros: data.macros
                            }
                        };
                    } else {
                        return {
                            id: doc.id,
                            type: 'nutrition' as const,
                            title: 'Logged a meal',
                            description: `Logged ${data.mealType}`,
                            timestamp: data.createdAt.toDate(),
                            icon: '🍽️'
                        };
                    }
                }),
                ...mental.docs.map(doc => ({
                    id: doc.id,
                    type: 'mental' as const,
                    title: 'Mental wellness activity',
                    description: 'Added a journal entry',
                    timestamp: doc.data().createdAt.toDate(),
                    icon: '🧘‍♂️'
                }))
            ];

            // Sort by timestamp
            allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            setActivities(allActivities);
        } catch (err) {
            console.error('Error loading activities:', err);
            setError('Failed to load activities');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-white/10 rounded-xl"></div>
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

    if (activities.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No recent activity. Start logging your progress!</p>
            </div>
        );
    }

    const getActivityColor = (type: ActivityLog['type']) => {
        switch (type) {
            case 'exercise':
                return 'bg-blue-100 text-blue-800';
            case 'nutrition':
                return 'bg-green-100 text-green-800';
            case 'mental':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card className="bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-6">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 ${getActivityColor(activity.type)} rounded-full flex items-center justify-center text-xl`}>
                            {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-900">{activity.title}</p>
                                <span className={`text-xs px-2 py-1 rounded-full ${getActivityColor(activity.type)}`}>
                                    {activity.type}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm">{activity.description}</p>

                            {/* Exercise Details */}
                            {activity.type === 'exercise' && activity.details && (
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>{activity.details.duration} minutes</span>
                                        {activity.details.rating && (
                                            <span className="text-yellow-500">
                                                {'★'.repeat(activity.details.rating)}
                                                {'☆'.repeat(5 - activity.details.rating)}
                                            </span>
                                        )}
                                    </div>
                                    {activity.details.sets && activity.details.sets.length > 0 && (
                                        <div className="text-sm text-gray-500">
                                            <span className="font-medium">Sets: </span>
                                            {activity.details.sets.map((set, i) => (
                                                <span key={i} className="mr-2">
                                                    {set.reps} reps @ {set.weight}kg
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {activity.details.notes && (
                                        <p className="text-sm text-gray-500 italic">
                                            "{activity.details.notes}"
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Nutrition Details */}
                            {activity.type === 'nutrition' && activity.details?.meals && activity.details.macros && (
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>{activity.details.totalCalories} calories total</span>
                                        <span>
                                            {activity.details.macros.protein}g protein • {activity.details.macros.carbs}g carbs • {activity.details.macros.fat}g fat
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {activity.details.meals.map((meal, i) => (
                                            <span key={i} className="mr-4">
                                                {meal.name} ({meal.calories} cal)
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <p className="text-gray-400 text-xs mt-1">
                                {new Date(activity.timestamp).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
} 