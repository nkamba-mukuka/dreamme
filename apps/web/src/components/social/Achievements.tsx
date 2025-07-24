import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { socialService } from '../../services/socialService';
import type { Achievement, UserAchievement, AchievementCategory } from '../../types/social';

const categoryFilters: { value: AchievementCategory; label: string; emoji: string }[] = [
    { value: 'workout', label: 'Workouts', emoji: '💪' },
    { value: 'streak', label: 'Streaks', emoji: '🔥' },
    { value: 'nutrition', label: 'Nutrition', emoji: '🥗' },
    { value: 'mental', label: 'Mental', emoji: '🧠' },
    { value: 'social', label: 'Social', emoji: '👥' },
    { value: 'special', label: 'Special', emoji: '⭐' },
];

const rarityColors = {
    common: 'bg-gray-100 text-gray-600',
    uncommon: 'bg-green-100 text-green-600',
    rare: 'bg-blue-100 text-blue-600',
    epic: 'bg-purple-100 text-purple-600',
    legendary: 'bg-yellow-100 text-yellow-600',
};

export function Achievements() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | null>(null);
    const [showUnlocked, setShowUnlocked] = useState(true);
    const [showLocked, setShowLocked] = useState(true);

    useEffect(() => {
        const loadAchievements = async () => {
            if (!user) return;

            setLoading(true);
            setError(null);

            try {
                // Load all achievements
                const achievementsData = await socialService.getAchievements();
                setAchievements(achievementsData);

                // Load user's achievements
                const userAchievementsData = await socialService.getUserAchievements(user.uid);
                setUserAchievements(userAchievementsData);
            } catch (err) {
                console.error('Error loading achievements:', err);
                setError('Failed to load achievements');
            } finally {
                setLoading(false);
            }
        };

        loadAchievements();
    }, [user]);

    const filteredAchievements = achievements
        .filter(achievement => !selectedCategory || achievement.category === selectedCategory)
        .filter(achievement => {
            const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
            const isUnlocked = userAchievement?.isCompleted;
            return (showUnlocked && isUnlocked) || (showLocked && !isUnlocked);
        });

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold">Achievements</h2>
                <p className="text-muted-foreground">Track your progress and earn badges</p>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="space-y-4">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={selectedCategory === null ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(null)}
                        className="text-sm"
                    >
                        All Categories
                    </Button>
                    {categoryFilters.map(({ value, label, emoji }) => (
                        <Button
                            key={value}
                            variant={selectedCategory === value ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory(value)}
                            className="text-sm"
                        >
                            {emoji} {label}
                        </Button>
                    ))}
                </div>

                {/* Status Filters */}
                <div className="flex gap-2">
                    <Button
                        variant={showUnlocked ? 'default' : 'outline'}
                        onClick={() => setShowUnlocked(!showUnlocked)}
                        className="text-sm"
                    >
                        🏆 Unlocked
                    </Button>
                    <Button
                        variant={showLocked ? 'default' : 'outline'}
                        onClick={() => setShowLocked(!showLocked)}
                        className="text-sm"
                    >
                        🔒 Locked
                    </Button>
                </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAchievements.map((achievement) => {
                    const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
                    const isUnlocked = userAchievement?.isCompleted;
                    const progress = userAchievement?.progress || 0;
                    const progressPercentage = Math.min(
                        (progress / achievement.requirement.value) * 100,
                        100
                    );

                    return (
                        <div
                            key={achievement.id}
                            className={`bg-white p-6 rounded-xl shadow-sm ${!isUnlocked && 'opacity-75'
                                }`}
                        >
                            {/* Achievement Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={achievement.imageUrl}
                                        alt={achievement.title}
                                        className={`w-16 h-16 ${!isUnlocked && 'grayscale'}`}
                                    />
                                    <div>
                                        <h3 className="font-semibold">{achievement.title}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {achievement.description}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`text-xs px-2 py-1 rounded-full ${rarityColors[achievement.rarity]
                                        }`}
                                >
                                    {achievement.rarity}
                                </span>
                            </div>

                            {/* Achievement Progress */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {isUnlocked ? 'Completed' : 'Progress'}
                                    </span>
                                    <span className="font-medium">
                                        {progress} / {achievement.requirement.value}{' '}
                                        {achievement.requirement.metric}
                                    </span>
                                </div>
                                <div className="w-full bg-primary/10 rounded-full h-2">
                                    <div
                                        className="bg-primary h-full rounded-full transition-all"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Achievement Details */}
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Points</span>
                                    <span className="font-medium">{achievement.points}</span>
                                </div>
                                {isUnlocked && userAchievement?.completedAt && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Unlocked</span>
                                        <span className="font-medium">
                                            {new Date(userAchievement.completedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredAchievements.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">No achievements found</p>
                    <p className="text-sm text-muted-foreground">
                        Try adjusting your filters to see more achievements
                    </p>
                </div>
            )}
        </div>
    );
} 