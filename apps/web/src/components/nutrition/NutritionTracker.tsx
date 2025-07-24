import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { nutritionService } from '../../services/nutritionService';
import type {
    NutritionLog,
    NutritionGoals,
    LoggedMeal,
    MealType,
    Recipe,
} from '../../types/nutrition';
import { MealForm } from './MealForm';

const MEAL_TYPES: { value: MealType; label: string }[] = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
];

export function NutritionTracker() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [nutritionLog, setNutritionLog] = useState<NutritionLog | null>(null);
    const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals | null>(null);
    const [showMealForm, setShowMealForm] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);

    useEffect(() => {
        const loadNutritionData = async () => {
            if (!user) return;

            setLoading(true);
            setError(null);

            try {
                const [log, goals] = await Promise.all([
                    nutritionService.getNutritionLog(user.uid, selectedDate),
                    nutritionService.getNutritionGoals(user.uid),
                ]);

                if (!log) {
                    // Create a new log if none exists
                    const newLogId = await nutritionService.createNutritionLog({
                        userId: user.uid,
                        date: selectedDate,
                        meals: {
                            breakfast: [],
                            lunch: [],
                            dinner: [],
                            snack: [],
                        },
                        totalNutrition: {
                            calories: 0,
                            protein: 0,
                            carbs: 0,
                            fat: 0,
                            fiber: 0,
                            sugar: 0,
                            sodium: 0,
                            cholesterol: 0,
                            saturatedFat: 0,
                            servingSize: 0,
                            servings: 0,
                        },
                        waterIntake: 0,
                    });

                    const newLog = await nutritionService.getNutritionLog(user.uid, selectedDate);
                    setNutritionLog(newLog);
                } else {
                    setNutritionLog(log);
                }

                setNutritionGoals(goals);
            } catch (err) {
                console.error('Error loading nutrition data:', err);
                setError('Failed to load nutrition data');
            } finally {
                setLoading(false);
            }
        };

        loadNutritionData();
    }, [user, selectedDate]);

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
    };

    const handleAddMeal = (mealType: MealType) => {
        setSelectedMealType(mealType);
        setShowMealForm(true);
    };

    const handleLogMeal = async (meal: LoggedMeal) => {
        if (!user || !nutritionLog || !selectedMealType) return;

        try {
            const updatedMeals = {
                ...nutritionLog.meals,
                [selectedMealType]: [...nutritionLog.meals[selectedMealType], meal],
            };

            const updatedTotalNutrition = calculateTotalNutrition(updatedMeals);

            await nutritionService.updateNutritionLog(nutritionLog.id, {
                meals: updatedMeals,
                totalNutrition: updatedTotalNutrition,
            });

            // Update progress
            await nutritionService.updateNutritionProgress({
                userId: user.uid,
                date: selectedDate,
                planned: nutritionGoals?.dailyCalories
                    ? {
                        calories: nutritionGoals.dailyCalories,
                        protein: nutritionGoals.macros.protein,
                        carbs: nutritionGoals.macros.carbs,
                        fat: nutritionGoals.macros.fat,
                        fiber: 0,
                        sugar: 0,
                        sodium: 0,
                        cholesterol: 0,
                        saturatedFat: 0,
                        servingSize: 0,
                        servings: 0,
                    }
                    : updatedTotalNutrition,
                actual: updatedTotalNutrition,
                waterIntake: {
                    planned: nutritionGoals?.waterIntake || 2000,
                    actual: nutritionLog.waterIntake,
                },
                adherenceRate: calculateAdherenceRate(updatedTotalNutrition, nutritionGoals),
            });

            // Reload nutrition log
            const updatedLog = await nutritionService.getNutritionLog(user.uid, selectedDate);
            setNutritionLog(updatedLog);
        } catch (err) {
            console.error('Error logging meal:', err);
            setError('Failed to log meal');
        }

        setShowMealForm(false);
        setSelectedMealType(null);
    };

    const handleRemoveMeal = async (mealType: MealType, index: number) => {
        if (!user || !nutritionLog) return;

        try {
            const updatedMeals = {
                ...nutritionLog.meals,
                [mealType]: nutritionLog.meals[mealType].filter((_, i) => i !== index),
            };

            const updatedTotalNutrition = calculateTotalNutrition(updatedMeals);

            await nutritionService.updateNutritionLog(nutritionLog.id, {
                meals: updatedMeals,
                totalNutrition: updatedTotalNutrition,
            });

            // Update progress
            await nutritionService.updateNutritionProgress({
                userId: user.uid,
                date: selectedDate,
                planned: nutritionGoals?.dailyCalories
                    ? {
                        calories: nutritionGoals.dailyCalories,
                        protein: nutritionGoals.macros.protein,
                        carbs: nutritionGoals.macros.carbs,
                        fat: nutritionGoals.macros.fat,
                        fiber: 0,
                        sugar: 0,
                        sodium: 0,
                        cholesterol: 0,
                        saturatedFat: 0,
                        servingSize: 0,
                        servings: 0,
                    }
                    : updatedTotalNutrition,
                actual: updatedTotalNutrition,
                waterIntake: {
                    planned: nutritionGoals?.waterIntake || 2000,
                    actual: nutritionLog.waterIntake,
                },
                adherenceRate: calculateAdherenceRate(updatedTotalNutrition, nutritionGoals),
            });

            // Reload nutrition log
            const updatedLog = await nutritionService.getNutritionLog(user.uid, selectedDate);
            setNutritionLog(updatedLog);
        } catch (err) {
            console.error('Error removing meal:', err);
            setError('Failed to remove meal');
        }
    };

    const handleUpdateWaterIntake = async (amount: number) => {
        if (!user || !nutritionLog) return;

        try {
            await nutritionService.updateNutritionLog(nutritionLog.id, {
                waterIntake: amount,
            });

            // Update progress
            await nutritionService.updateNutritionProgress({
                userId: user.uid,
                date: selectedDate,
                planned: nutritionGoals?.dailyCalories
                    ? {
                        calories: nutritionGoals.dailyCalories,
                        protein: nutritionGoals.macros.protein,
                        carbs: nutritionGoals.macros.carbs,
                        fat: nutritionGoals.macros.fat,
                        fiber: 0,
                        sugar: 0,
                        sodium: 0,
                        cholesterol: 0,
                        saturatedFat: 0,
                        servingSize: 0,
                        servings: 0,
                    }
                    : nutritionLog.totalNutrition,
                actual: nutritionLog.totalNutrition,
                waterIntake: {
                    planned: nutritionGoals?.waterIntake || 2000,
                    actual: amount,
                },
                adherenceRate: calculateAdherenceRate(nutritionLog.totalNutrition, nutritionGoals),
            });

            // Reload nutrition log
            const updatedLog = await nutritionService.getNutritionLog(user.uid, selectedDate);
            setNutritionLog(updatedLog);
        } catch (err) {
            console.error('Error updating water intake:', err);
            setError('Failed to update water intake');
        }
    };

    const calculateTotalNutrition = (meals: NutritionLog['meals']) => {
        const total = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            cholesterol: 0,
            saturatedFat: 0,
            servingSize: 0,
            servings: 0,
        };

        Object.values(meals).forEach(mealList =>
            mealList.forEach(meal => {
                Object.entries(meal.nutrition).forEach(([key, value]) => {
                    if (key !== 'servings' && key !== 'servingSize') {
                        total[key as keyof typeof total] += value * meal.servings;
                    }
                });
            })
        );

        return total;
    };

    const calculateAdherenceRate = (actual: NutritionLog['totalNutrition'], goals: NutritionGoals | null) => {
        if (!goals) return 100;

        const calorieAdherence = Math.abs(actual.calories - goals.dailyCalories) / goals.dailyCalories;
        const proteinAdherence = Math.abs(actual.protein - goals.macros.protein) / goals.macros.protein;
        const carbsAdherence = Math.abs(actual.carbs - goals.macros.carbs) / goals.macros.carbs;
        const fatAdherence = Math.abs(actual.fat - goals.macros.fat) / goals.macros.fat;

        const averageAdherence = (calorieAdherence + proteinAdherence + carbsAdherence + fatAdherence) / 4;
        return Math.max(0, Math.min(100, (1 - averageAdherence) * 100));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Date Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => {
                        const prevDay = new Date(selectedDate);
                        prevDay.setDate(prevDay.getDate() - 1);
                        handleDateChange(prevDay);
                    }}
                >
                    Previous Day
                </Button>
                <h2 className="text-xl font-semibold">
                    {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                    })}
                </h2>
                <Button
                    variant="outline"
                    onClick={() => {
                        const nextDay = new Date(selectedDate);
                        nextDay.setDate(nextDay.getDate() + 1);
                        handleDateChange(nextDay);
                    }}
                >
                    Next Day
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            {/* Nutrition Summary */}
            {nutritionLog && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Calories</h3>
                        <p className="text-2xl font-semibold">
                            {Math.round(nutritionLog.totalNutrition.calories)}
                            {nutritionGoals && (
                                <span className="text-sm text-muted-foreground">
                                    /{nutritionGoals.dailyCalories}
                                </span>
                            )}
                        </p>
                        <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary"
                                style={{
                                    width: `${Math.min(
                                        (nutritionLog.totalNutrition.calories /
                                            (nutritionGoals?.dailyCalories || 2000)) *
                                        100,
                                        100
                                    )}%`,
                                }}
                            />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Protein</h3>
                        <p className="text-2xl font-semibold">
                            {Math.round(nutritionLog.totalNutrition.protein)}g
                            {nutritionGoals && (
                                <span className="text-sm text-muted-foreground">
                                    /{nutritionGoals.macros.protein}g
                                </span>
                            )}
                        </p>
                        <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary"
                                style={{
                                    width: `${Math.min(
                                        (nutritionLog.totalNutrition.protein /
                                            (nutritionGoals?.macros.protein || 50)) *
                                        100,
                                        100
                                    )}%`,
                                }}
                            />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Carbs</h3>
                        <p className="text-2xl font-semibold">
                            {Math.round(nutritionLog.totalNutrition.carbs)}g
                            {nutritionGoals && (
                                <span className="text-sm text-muted-foreground">
                                    /{nutritionGoals.macros.carbs}g
                                </span>
                            )}
                        </p>
                        <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary"
                                style={{
                                    width: `${Math.min(
                                        (nutritionLog.totalNutrition.carbs /
                                            (nutritionGoals?.macros.carbs || 250)) *
                                        100,
                                        100
                                    )}%`,
                                }}
                            />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Fat</h3>
                        <p className="text-2xl font-semibold">
                            {Math.round(nutritionLog.totalNutrition.fat)}g
                            {nutritionGoals && (
                                <span className="text-sm text-muted-foreground">
                                    /{nutritionGoals.macros.fat}g
                                </span>
                            )}
                        </p>
                        <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary"
                                style={{
                                    width: `${Math.min(
                                        (nutritionLog.totalNutrition.fat /
                                            (nutritionGoals?.macros.fat || 70)) *
                                        100,
                                        100
                                    )}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Water Intake */}
            {nutritionLog && (
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">Water Intake</h3>
                            <p className="text-sm text-muted-foreground">
                                Goal: {((nutritionGoals?.waterIntake || 2000) / 1000).toFixed(1)}L
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => handleUpdateWaterIntake(Math.max(0, nutritionLog.waterIntake - 250))}
                            >
                                -250ml
                            </Button>
                            <span className="text-xl font-semibold">
                                {(nutritionLog.waterIntake / 1000).toFixed(1)}L
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => handleUpdateWaterIntake(nutritionLog.waterIntake + 250)}
                            >
                                +250ml
                            </Button>
                        </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500"
                            style={{
                                width: `${Math.min(
                                    (nutritionLog.waterIntake / (nutritionGoals?.waterIntake || 2000)) * 100,
                                    100
                                )}%`,
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Meals */}
            {nutritionLog && (
                <div className="space-y-6">
                    {MEAL_TYPES.map(({ value: mealType, label }) => (
                        <div key={mealType} className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">{label}</h3>
                                <Button
                                    variant="outline"
                                    onClick={() => handleAddMeal(mealType)}
                                >
                                    Add Food
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {nutritionLog.meals[mealType].map((meal, index) => (
                                    <div
                                        key={`${meal.name}_${index}`}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <div className="font-medium">{meal.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {meal.servings} serving(s) • {Math.round(meal.nutrition.calories)} cal
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                P: {Math.round(meal.nutrition.protein)}g •
                                                C: {Math.round(meal.nutrition.carbs)}g •
                                                F: {Math.round(meal.nutrition.fat)}g
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive/90"
                                            onClick={() => handleRemoveMeal(mealType, index)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}

                                {nutritionLog.meals[mealType].length === 0 && (
                                    <p className="text-center text-muted-foreground py-4">
                                        No food logged
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Meal Form Modal */}
            {showMealForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-4">Add Food</h2>
                        <MealForm
                            onSubmit={handleLogMeal}
                            onCancel={() => {
                                setShowMealForm(false);
                                setSelectedMealType(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
} 