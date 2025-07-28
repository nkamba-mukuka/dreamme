import { useEffect, useState } from 'react';
import { Card } from '@dreamme/ui';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface ProfileStats {
    workouts: {
        completed: number;
        streak: number;
        personalBests: number;
    };
    nutrition: {
        mealsLogged: number;
        waterStreak: number;
        calorieGoals: number;
    };
    mental: {
        moodScore: number;
        journalStreak: number;
        breathingMinutes: number;
    };
    social: {
        followers: number;
        following: number;
        kudosReceived: number;
    };
}

interface ProfileStatsProps {
    userId: string;
}

export function ProfileStats({ userId }: ProfileStatsProps) {
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStats();
    }, [userId]);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const statsDoc = await getDoc(doc(db, 'progress', userId));
            if (statsDoc.exists()) {
                setStats(statsDoc.data() as ProfileStats);
            }
        } catch (err) {
            console.error('Error loading stats:', err);
            setError('Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-32 bg-white/10 rounded-xl"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-400 text-sm">{error}</div>
        );
    }

    if (!stats) {
        return (
            <div className="text-white/60 text-sm">No stats available</div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="glass" padding="md">
                <h3 className="text-lg font-medium text-white mb-4">Fitness</h3>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-white/60">Workouts Completed</span>
                        <span className="text-white">{stats.workouts.completed}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/60">Current Streak</span>
                        <span className="text-white">{stats.workouts.streak} days</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/60">Personal Bests</span>
                        <span className="text-white">{stats.workouts.personalBests}</span>
                    </div>
                </div>
            </Card>

            <Card variant="glass" padding="md">
                <h3 className="text-lg font-medium text-white mb-4">Nutrition</h3>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-white/60">Meals Logged</span>
                        <span className="text-white">{stats.nutrition.mealsLogged}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/60">Water Streak</span>
                        <span className="text-white">{stats.nutrition.waterStreak} days</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/60">Calorie Goals Met</span>
                        <span className="text-white">{stats.nutrition.calorieGoals}</span>
                    </div>
                </div>
            </Card>

            <Card variant="glass" padding="md">
                <h3 className="text-lg font-medium text-white mb-4">Mental Wellness</h3>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-white/60">Average Mood</span>
                        <span className="text-white">{stats.mental.moodScore}/5</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/60">Journal Streak</span>
                        <span className="text-white">{stats.mental.journalStreak} days</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/60">Breathing Minutes</span>
                        <span className="text-white">{stats.mental.breathingMinutes}</span>
                    </div>
                </div>
            </Card>

            <Card variant="glass" padding="md">
                <h3 className="text-lg font-medium text-white mb-4">Social</h3>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-white/60">Followers</span>
                        <span className="text-white">{stats.social.followers}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/60">Following</span>
                        <span className="text-white">{stats.social.following}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-white/60">Kudos Received</span>
                        <span className="text-white">{stats.social.kudosReceived}</span>
                    </div>
                </div>
            </Card>
        </div>
    );
} 