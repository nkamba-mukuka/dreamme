import { useEffect, useState } from 'react';
import { Card } from '@dreamme/ui';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Activity {
    id: string;
    type: 'workout' | 'meal' | 'mental' | 'social';
    title: string;
    description: string;
    timestamp: Date;
    icon: string;
}

interface ProfileActivityProps {
    userId: string;
}

export function ProfileActivity({ userId }: ProfileActivityProps) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadActivities();
    }, [userId]);

    const loadActivities = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get recent activities from different collections
            const [workouts, meals, mental, social] = await Promise.all([
                getDocs(query(
                    collection(db, 'workoutLogs'),
                    where('userId', '==', userId),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                )),
                getDocs(query(
                    collection(db, 'mealLogs'),
                    where('userId', '==', userId),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                )),
                getDocs(query(
                    collection(db, 'journalEntries'),
                    where('userId', '==', userId),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                )),
                getDocs(query(
                    collection(db, 'socialActivity'),
                    where('userId', '==', userId),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                ))
            ]);

            // Combine and format activities
            const allActivities: Activity[] = [
                ...workouts.docs.map(doc => ({
                    id: doc.id,
                    type: 'workout' as const,
                    title: 'Completed a workout',
                    description: `Completed ${doc.data().exerciseName}`,
                    timestamp: doc.data().createdAt.toDate(),
                    icon: '💪'
                })),
                ...meals.docs.map(doc => ({
                    id: doc.id,
                    type: 'meal' as const,
                    title: 'Logged a meal',
                    description: `Logged ${doc.data().mealType}`,
                    timestamp: doc.data().createdAt.toDate(),
                    icon: '🍽️'
                })),
                ...mental.docs.map(doc => ({
                    id: doc.id,
                    type: 'mental' as const,
                    title: 'Mental wellness activity',
                    description: 'Added a journal entry',
                    timestamp: doc.data().createdAt.toDate(),
                    icon: '🧘‍♂️'
                })),
                ...social.docs.map(doc => ({
                    id: doc.id,
                    type: 'social' as const,
                    title: 'Social activity',
                    description: doc.data().description,
                    timestamp: doc.data().createdAt.toDate(),
                    icon: '👥'
                }))
            ];

            // Sort by timestamp
            allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            setActivities(allActivities.slice(0, 10));
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
            <div className="text-red-400 text-sm">{error}</div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="text-white/60 text-sm">No recent activity</div>
        );
    }

    return (
        <Card variant="glass" padding="lg">
            <h3 className="text-xl font-medium text-white mb-6">Recent Activity</h3>
            <div className="space-y-6">
                {activities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl">
                            {activity.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium">{activity.title}</p>
                            <p className="text-white/60 text-sm">{activity.description}</p>
                            <p className="text-white/40 text-xs mt-1">
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