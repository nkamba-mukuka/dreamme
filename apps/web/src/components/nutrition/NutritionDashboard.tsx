import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { nutritionService } from '../../services/nutritionService';
import type { NutritionProgress, NutritionGoals } from '../../types/nutrition';

export function NutritionDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<NutritionProgress[]>([]);
    const [goals, setGoals] = useState<NutritionGoals | null>(null);
    const [dateRange, setDateRange] = useState<'week' | 'month'>('week');

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            setLoading(true);
            setError(null);

            try {
                const endDate = new Date();
                const startDate = new Date();
                if (dateRange === 'week') {
                    startDate.setDate(startDate.getDate() - 7);
                } else {
                    startDate.setMonth(startDate.getMonth() - 1);
                }

                const [progressData, goalsData] = await Promise.all([
                    nutritionService.getNutritionProgress(user.uid, startDate, endDate),
                    nutritionService.getNutritionGoals(user.uid),
                ]);

                setProgress(progressData);
                setGoals(goalsData);
            } catch (err) {
                console.error('Error loading nutrition data:', err);
                setError('Failed to load nutrition data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user, dateRange]);

    const calculateAverages = () => {
        if (progress.length === 0) return null;

        const totals = progress.reduce(
            (acc, day) => ({
                calories: acc.calories + day.actual.calories,
                protein: acc.protein + day.actual.protein,
                carbs: acc.carbs + day.actual.carbs,
                fat: acc.fat + day.actual.fat,
                waterIntake: acc.waterIntake + day.waterIntake.actual,
                adherenceRate: acc.adherenceRate + day.adherenceRate,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0, waterIntake: 0, adherenceRate: 0 }
        );

        return {
            calories: Math.round(totals.calories / progress.length),
            protein: Math.round(totals.protein / progress.length),
            carbs: Math.round(totals.carbs / progress.length),
            fat: Math.round(totals.fat / progress.length),
            waterIntake: Math.round(totals.waterIntake / progress.length),
            adherenceRate: Math.round(totals.adherenceRate / progress.length),
        };
    };

    const averages = calculateAverages();

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Nutrition Progress</h2>
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

            {/* Overall Stats */}
            {averages && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Avg. Calories</h3>
                        <p className="text-2xl font-semibold">
                            {averages.calories}
                            {goals && (
                                <span className="text-sm text-muted-foreground">
                                    /{goals.dailyCalories}
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Avg. Protein</h3>
                        <p className="text-2xl font-semibold">
                            {averages.protein}g
                            {goals && (
                                <span className="text-sm text-muted-foreground">
                                    /{goals.macros.protein}g
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Avg. Carbs</h3>
                        <p className="text-2xl font-semibold">
                            {averages.carbs}g
                            {goals && (
                                <span className="text-sm text-muted-foreground">
                                    /{goals.macros.carbs}g
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Avg. Fat</h3>
                        <p className="text-2xl font-semibold">
                            {averages.fat}g
                            {goals && (
                                <span className="text-sm text-muted-foreground">
                                    /{goals.macros.fat}g
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Avg. Water</h3>
                        <p className="text-2xl font-semibold">
                            {(averages.waterIntake / 1000).toFixed(1)}L
                            {goals && (
                                <span className="text-sm text-muted-foreground">
                                    /{(goals.waterIntake / 1000).toFixed(1)}L
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Adherence</h3>
                        <p className="text-2xl font-semibold">
                            {averages.adherenceRate}%
                        </p>
                    </div>
                </div>
            )}

            {/* Daily Progress */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Daily Progress</h3>
                <div className="space-y-2">
                    {progress.map((day) => (
                        <div
                            key={day.date.toISOString()}
                            className="bg-white p-4 rounded-lg shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-medium">
                                        {day.date.toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {day.adherenceRate}% adherence
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm">
                                        {Math.round(day.actual.calories)} / {Math.round(day.planned.calories)} cal
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {(day.waterIntake.actual / 1000).toFixed(1)}L / {(day.waterIntake.planned / 1000).toFixed(1)}L water
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Protein</p>
                                    <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{
                                                width: `${Math.min(
                                                    (day.actual.protein / day.planned.protein) * 100,
                                                    100
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Carbs</p>
                                    <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{
                                                width: `${Math.min(
                                                    (day.actual.carbs / day.planned.carbs) * 100,
                                                    100
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Fat</p>
                                    <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{
                                                width: `${Math.min(
                                                    (day.actual.fat / day.planned.fat) * 100,
                                                    100
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {progress.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            No nutrition data available for this period
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
} 