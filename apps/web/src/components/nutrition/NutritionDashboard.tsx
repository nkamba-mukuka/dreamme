import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { Button } from '@dreamme/ui';
import { nutritionService } from '../../services/nutritionService';
import type { DailyMealPlan, NutritionProgress } from '../../types/nutrition';
import { motion } from 'framer-motion';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export function NutritionDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mealPlan, setMealPlan] = useState<DailyMealPlan | null>(null);
    const [progress, setProgress] = useState<NutritionProgress | null>(null);

    const loadData = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            // Load meal plan and progress in parallel
            const [plan, todayProgress] = await Promise.all([
                nutritionService.getDailyMealPlan(user.uid),
                nutritionService.getNutritionProgress(user.uid, new Date())
            ]);

            setMealPlan(plan);
            setProgress(todayProgress);
        } catch (err) {
            console.error('Error loading nutrition data:', err);
            setError('Failed to load nutrition data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const handleCompleteMealPlan = async () => {
        if (!user || !mealPlan) return;

        try {
            setLoading(true);
            await nutritionService.completeDailyMealPlan(user.uid, new Date());

            // Reload data
            await loadData();
        } catch (error) {
            console.error('Error completing meal plan:', error);
            alert('Failed to mark meal plan as completed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
                    {error}
                </div>
                <Button onClick={() => loadData()}>
                    Try Again
                </Button>
            </div>
        );
    }

    if (!mealPlan) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="text-center mb-4">
                    <h2 className="text-xl font-semibold mb-2">No Meal Plan Found</h2>
                    <p className="text-gray-600">Let's create a meal plan for today!</p>
                </div>
                <Button onClick={() => loadData()}>
                    Generate Meal Plan
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="container mx-auto px-4 py-8"
        >
            <motion.div variants={item} className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-teal-600">
                        Nutrition Dashboard
                    </h1>
                    {progress && (
                        <p className="text-gray-600 mt-2">
                            {progress.meals.length} meals completed today • {progress.totalCalories} calories
                        </p>
                    )}
                </div>
                <div className="flex gap-4">
                    {mealPlan && !mealPlan.completed && (
                        <Button
                            variant="primary"
                            onClick={handleCompleteMealPlan}
                            className="flex items-center gap-2"
                        >
                            <span>I Ate Today!</span>
                            <span className="text-xl">🎉</span>
                        </Button>
                    )}
                    <Button onClick={() => navigate('/nutrition', { state: { view: 'planner' } })}>
                        View Meal Plan
                    </Button>
                </div>
            </motion.div>

            {/* Progress Summary */}
            {progress && (
                <motion.div variants={item} className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Today's Progress</h2>
                    <div className="grid grid-cols-4 gap-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary">{progress.totalCalories}</p>
                            <p className="text-sm text-gray-600">Calories</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary">{progress.macros.protein}g</p>
                            <p className="text-sm text-gray-600">Protein</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary">{progress.macros.carbs}g</p>
                            <p className="text-sm text-gray-600">Carbs</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-primary">{progress.macros.fat}g</p>
                            <p className="text-sm text-gray-600">Fat</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Today's Meals */}
            {mealPlan && (
                <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Breakfast */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Breakfast</h2>
                            <span className="text-3xl">🍳</span>
                        </div>
                        <div className="space-y-4">
                            <div className="relative h-48 rounded-lg overflow-hidden">
                                <img
                                    src={mealPlan.breakfast.imageUrl}
                                    alt={mealPlan.breakfast.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-4">
                                    <h3 className="text-lg font-semibold text-white">
                                        {mealPlan.breakfast.name}
                                    </h3>
                                </div>
                                {mealPlan.completed && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                                        ✓
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <p>Calories</p>
                                    <p className="font-medium">{mealPlan.breakfast.nutritionInfo.calories} kcal</p>
                                </div>
                                <div>
                                    <p>Protein</p>
                                    <p className="font-medium">{mealPlan.breakfast.nutritionInfo.protein}g</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lunch */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Lunch</h2>
                            <span className="text-3xl">🥗</span>
                        </div>
                        <div className="space-y-4">
                            <div className="relative h-48 rounded-lg overflow-hidden">
                                <img
                                    src={mealPlan.lunch.imageUrl}
                                    alt={mealPlan.lunch.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-4">
                                    <h3 className="text-lg font-semibold text-white">
                                        {mealPlan.lunch.name}
                                    </h3>
                                </div>
                                {mealPlan.completed && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                                        ✓
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <p>Calories</p>
                                    <p className="font-medium">{mealPlan.lunch.nutritionInfo.calories} kcal</p>
                                </div>
                                <div>
                                    <p>Protein</p>
                                    <p className="font-medium">{mealPlan.lunch.nutritionInfo.protein}g</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dinner */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Dinner</h2>
                            <span className="text-3xl">🍽️</span>
                        </div>
                        <div className="space-y-4">
                            <div className="relative h-48 rounded-lg overflow-hidden">
                                <img
                                    src={mealPlan.dinner.imageUrl}
                                    alt={mealPlan.dinner.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-4">
                                    <h3 className="text-lg font-semibold text-white">
                                        {mealPlan.dinner.name}
                                    </h3>
                                </div>
                                {mealPlan.completed && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                                        ✓
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <p>Calories</p>
                                    <p className="font-medium">{mealPlan.dinner.nutritionInfo.calories} kcal</p>
                                </div>
                                <div>
                                    <p>Protein</p>
                                    <p className="font-medium">{mealPlan.dinner.nutritionInfo.protein}g</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Snack */}
                    {mealPlan.snacks?.[0] && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Snack</h2>
                                <span className="text-3xl">🍎</span>
                            </div>
                            <div className="space-y-4">
                                <div className="relative h-48 rounded-lg overflow-hidden">
                                    <img
                                        src={mealPlan.snacks[0].imageUrl}
                                        alt={mealPlan.snacks[0].name}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-4">
                                        <h3 className="text-lg font-semibold text-white">
                                            {mealPlan.snacks[0].name}
                                        </h3>
                                    </div>
                                    {mealPlan.completed && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                                            ✓
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <p>Calories</p>
                                        <p className="font-medium">{mealPlan.snacks[0].nutritionInfo.calories} kcal</p>
                                    </div>
                                    <div>
                                        <p>Protein</p>
                                        <p className="font-medium">{mealPlan.snacks[0].nutritionInfo.protein}g</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
} 