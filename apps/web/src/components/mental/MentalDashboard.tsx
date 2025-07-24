import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { mentalService } from '../../services/mentalService';
import type { MentalHealthStats, MoodTag } from '../../types/mental';

const moodTrendEmojis: Record<MentalHealthStats['moodTrend'], string> = {
    improving: '📈',
    stable: '➡️',
    declining: '📉',
};

const moodTrendDescriptions: Record<MentalHealthStats['moodTrend'], string> = {
    improving: 'Your mood is improving',
    stable: 'Your mood is stable',
    declining: 'Your mood is declining',
};

const moodTagEmojis: Record<MoodTag, string> = {
    happy: '😊',
    excited: '🎉',
    peaceful: '😌',
    content: '🥰',
    neutral: '😐',
    anxious: '😰',
    stressed: '😫',
    sad: '😢',
    angry: '😠',
    frustrated: '😤',
    tired: '😴',
    energetic: '⚡',
    motivated: '💪',
    unmotivated: '🥱',
    other: '❓',
};

export function MentalDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<MentalHealthStats | null>(null);
    const [dateRange, setDateRange] = useState<'week' | 'month'>('week');

    useEffect(() => {
        const loadStats = async () => {
            if (!user) return;

            setLoading(true);
            setError(null);

            try {
                const today = new Date();
                const stats = await mentalService.getMentalHealthStats(user.uid, today);
                setStats(stats);
            } catch (err) {
                console.error('Error loading mental health stats:', err);
                setError('Failed to load mental health stats');
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">No mental health data available yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Mental Health Overview</h2>
                    <p className="text-muted-foreground">Track your emotional well-being</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={dateRange === 'week' ? 'default' : 'outline'}
                        onClick={() => setDateRange('week')}
                    >
                        Last Week
                    </Button>
                    <Button
                        variant={dateRange === 'month' ? 'default' : 'outline'}
                        onClick={() => setDateRange('month')}
                    >
                        Last Month
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            {/* Mood Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Mood Trend</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">{moodTrendEmojis[stats.moodTrend]}</span>
                        <div>
                            <p className="font-medium">{moodTrendDescriptions[stats.moodTrend]}</p>
                            <p className="text-sm text-muted-foreground">
                                Average mood: {stats.averageMood.toFixed(1)}/5
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Journal Activity</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">📝</span>
                        <div>
                            <p className="font-medium">{stats.journalStreak} day streak</p>
                            <p className="text-sm text-muted-foreground">
                                Keep writing to maintain your streak!
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Breathing Practice</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">🧘‍♂️</span>
                        <div>
                            <p className="font-medium">{stats.breathingMinutes} minutes today</p>
                            <p className="text-sm text-muted-foreground">
                                {stats.breathingMinutes >= 10
                                    ? 'Great job staying mindful!'
                                    : 'Try to practice for at least 10 minutes'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Common Emotions */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Common Emotions</h3>
                <div className="flex flex-wrap gap-4">
                    {stats.commonMoodTags.map((tag) => (
                        <div
                            key={tag}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full"
                        >
                            <span className="text-2xl">{moodTagEmojis[tag]}</span>
                            <span className="font-medium capitalize">{tag}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active Motivations */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Active Motivations</h3>
                    <Button variant="outline" onClick={() => {/* Navigate to motivations */ }}>
                        View All
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-4xl">🎯</span>
                    <div>
                        <p className="font-medium">{stats.activeMotivations} active motivations</p>
                        <p className="text-sm text-muted-foreground">
                            {stats.activeMotivations > 0
                                ? 'Stay focused on your goals!'
                                : 'Add some motivations to stay inspired'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                <div className="space-y-4">
                    {stats.moodTrend === 'declining' && (
                        <div className="flex items-start gap-4">
                            <span className="text-2xl">💭</span>
                            <div>
                                <p className="font-medium">Consider journaling more</p>
                                <p className="text-sm text-muted-foreground">
                                    Writing about your feelings can help improve your mood
                                </p>
                            </div>
                        </div>
                    )}

                    {stats.breathingMinutes < 10 && (
                        <div className="flex items-start gap-4">
                            <span className="text-2xl">🧘‍♂️</span>
                            <div>
                                <p className="font-medium">Try a breathing exercise</p>
                                <p className="text-sm text-muted-foreground">
                                    Just 5-10 minutes can help reduce stress and anxiety
                                </p>
                            </div>
                        </div>
                    )}

                    {stats.activeMotivations === 0 && (
                        <div className="flex items-start gap-4">
                            <span className="text-2xl">✨</span>
                            <div>
                                <p className="font-medium">Set some motivations</p>
                                <p className="text-sm text-muted-foreground">
                                    Having clear goals can improve your mental well-being
                                </p>
                            </div>
                        </div>
                    )}

                    {stats.journalStreak === 0 && (
                        <div className="flex items-start gap-4">
                            <span className="text-2xl">📝</span>
                            <div>
                                <p className="font-medium">Start a journal streak</p>
                                <p className="text-sm text-muted-foreground">
                                    Regular journaling helps track and improve your mental health
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 