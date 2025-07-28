import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button, Card } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { exerciseService } from '../../services/exerciseService';
import { motion } from 'framer-motion';

interface WorkoutStats {
    weeklyWorkouts: {
        date: string;
        count: number;
    }[];
    monthlyStats: {
        totalWorkouts: number;
        totalMinutes: number;
        averageRating: number;
        streak: number;
    };
    recentPBs: {
        exercise: string;
        value: string;
        date: string;
    }[];
    popularExercises: {
        name: string;
        count: number;
    }[];
}

export interface ProgressDashboardRef {
    refreshStats: () => Promise<void>;
}

export const ProgressDashboard = forwardRef<ProgressDashboardRef>((props, ref) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<WorkoutStats | null>(null);

    const loadStats = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            // Get weekly workouts
            const weeklyWorkouts = await exerciseService.getWeeklyWorkouts(user.uid);
            const monthlyStats = await exerciseService.getMonthlyStats(user.uid);
            const recentPBs = await exerciseService.getRecentPBs(user.uid);
            const popularExercises = await exerciseService.getPopularExercises(user.uid);

            setStats({
                weeklyWorkouts,
                monthlyStats,
                recentPBs,
                popularExercises
            });
        } catch (err) {
            console.error('Error loading workout stats:', err);
            setError('Failed to load workout progress');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, [user]);

    useImperativeHandle(ref, () => ({
        refreshStats: loadStats
    }));

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                {error}
                <Button onClick={() => setError(null)} variant="outline" className="mt-2">
                    Try Again
                </Button>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">No workout data available yet. Start logging your workouts!</p>
                <Button onClick={() => window.location.href = '/exercise'} variant="primary" className="mt-4">
                    Log a Workout
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Weekly Progress */}
            <Card className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Weekly Progress</h2>
                <div className="grid grid-cols-7 gap-2">
                    {stats.weeklyWorkouts.map((day) => (
                        <div
                            key={day.date}
                            className="flex flex-col items-center"
                        >
                            <div className="text-sm text-gray-600">
                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div
                                className={`w-full h-24 rounded-lg mt-2 flex items-end ${day.count > 0 ? 'bg-primary/20' : 'bg-gray-100'
                                    }`}
                            >
                                <div
                                    className="bg-primary rounded-lg w-full transition-all duration-500"
                                    style={{ height: `${(day.count / 3) * 100}%` }}
                                />
                            </div>
                            <div className="text-sm font-medium mt-1 text-gray-900">
                                {day.count}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Monthly Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-sm font-medium text-gray-600">Total Workouts</h3>
                    <p className="text-2xl font-bold mt-2 text-gray-900">{stats.monthlyStats.totalWorkouts}</p>
                </Card>
                <Card className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-sm font-medium text-gray-600">Total Minutes</h3>
                    <p className="text-2xl font-bold mt-2 text-gray-900">{stats.monthlyStats.totalMinutes}</p>
                </Card>
                <Card className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-sm font-medium text-gray-600">Average Rating</h3>
                    <p className="text-2xl font-bold mt-2 text-gray-900">{stats.monthlyStats.averageRating.toFixed(1)}</p>
                </Card>
                <Card className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="text-sm font-medium text-gray-600">Current Streak</h3>
                    <p className="text-2xl font-bold mt-2 text-gray-900">{stats.monthlyStats.streak} days</p>
                </Card>
            </div>

            {/* Recent Personal Bests */}
            {stats.recentPBs.length > 0 && (
                <Card className="bg-gray-50 p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Personal Bests</h2>
                    <div className="space-y-4">
                        {stats.recentPBs.map((pb) => (
                            <div
                                key={`${pb.exercise}-${pb.date}`}
                                className="flex items-center justify-between"
                            >
                                <div>
                                    <h3 className="font-medium text-gray-900">{pb.exercise}</h3>
                                    <p className="text-sm text-gray-600">
                                        {new Date(pb.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-lg font-bold text-primary">
                                    {pb.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Popular Exercises */}
            {stats.popularExercises.length > 0 && (
                <Card className="bg-gray-50 p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Most Popular Exercises</h2>
                    <div className="space-y-4">
                        {stats.popularExercises.map((exercise) => (
                            <div
                                key={exercise.name}
                                className="flex items-center justify-between"
                            >
                                <h3 className="font-medium text-gray-900">{exercise.name}</h3>
                                <p className="text-gray-600">
                                    {exercise.count} times
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}); 