import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { nutritionService } from '../../services/nutritionService';
import type { MealPlan, Recipe, MealType, PlannedMeal } from '../../types/nutrition';
import { RecipeSearch } from './RecipeSearch';

const MEAL_TYPES: { value: MealType; label: string }[] = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
];

export function MealPlanner() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
    const [showRecipeSearch, setShowRecipeSearch] = useState(false);
    const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
    const [recipes, setRecipes] = useState<{ [key: string]: Recipe }>({});

    // Get week dates
    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - date.getDay() + i);
        return date;
    });

    useEffect(() => {
        const loadMealPlan = async () => {
            if (!user) return;

            setLoading(true);
            setError(null);

            try {
                const plan = await nutritionService.getMealPlan(user.uid, selectedDate);

                if (!plan) {
                    // Create a new meal plan if none exists
                    const newPlanId = await nutritionService.createMealPlan({
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
                    });

                    const newPlan = await nutritionService.getMealPlan(user.uid, selectedDate);
                    setMealPlan(newPlan);
                } else {
                    setMealPlan(plan);

                    // Load recipe details for all meals
                    const recipeIds = new Set<string>();
                    Object.values(plan.meals).forEach(meals =>
                        meals.forEach(meal => recipeIds.add(meal.recipeId))
                    );

                    const recipeDetails = await Promise.all(
                        Array.from(recipeIds).map(id => nutritionService.getRecipe(id))
                    );

                    const recipeMap = recipeDetails.reduce((map, recipe) => {
                        if (recipe) {
                            map[recipe.id] = recipe;
                        }
                        return map;
                    }, {} as { [key: string]: Recipe });

                    setRecipes(recipeMap);
                }
            } catch (err) {
                console.error('Error loading meal plan:', err);
                setError('Failed to load meal plan');
            } finally {
                setLoading(false);
            }
        };

        loadMealPlan();
    }, [user, selectedDate]);

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
    };

    const handleAddMeal = (mealType: MealType) => {
        setSelectedMealType(mealType);
        setShowRecipeSearch(true);
    };

    const handleRecipeSelect = async (recipe: Recipe) => {
        if (!user || !mealPlan || !selectedMealType) return;

        try {
            const updatedMeals = {
                ...mealPlan.meals,
                [selectedMealType]: [
                    ...mealPlan.meals[selectedMealType],
                    {
                        recipeId: recipe.id,
                        servings: 1,
                        completed: false,
                    },
                ],
            };

            await nutritionService.updateMealPlan(mealPlan.id, {
                meals: updatedMeals,
                totalNutrition: calculateTotalNutrition(updatedMeals, { ...recipes, [recipe.id]: recipe }),
            });

            // Update local state
            setRecipes(prev => ({ ...prev, [recipe.id]: recipe }));

            // Reload meal plan
            const updatedPlan = await nutritionService.getMealPlan(user.uid, selectedDate);
            setMealPlan(updatedPlan);
        } catch (err) {
            console.error('Error adding meal:', err);
            setError('Failed to add meal');
        }

        setShowRecipeSearch(false);
        setSelectedMealType(null);
    };

    const handleRemoveMeal = async (mealType: MealType, index: number) => {
        if (!user || !mealPlan) return;

        try {
            const updatedMeals = {
                ...mealPlan.meals,
                [mealType]: mealPlan.meals[mealType].filter((_, i) => i !== index),
            };

            await nutritionService.updateMealPlan(mealPlan.id, {
                meals: updatedMeals,
                totalNutrition: calculateTotalNutrition(updatedMeals, recipes),
            });

            // Reload meal plan
            const updatedPlan = await nutritionService.getMealPlan(user.uid, selectedDate);
            setMealPlan(updatedPlan);
        } catch (err) {
            console.error('Error removing meal:', err);
            setError('Failed to remove meal');
        }
    };

    const handleToggleMeal = async (mealType: MealType, index: number) => {
        if (!user || !mealPlan) return;

        try {
            const updatedMeals = {
                ...mealPlan.meals,
                [mealType]: mealPlan.meals[mealType].map((meal, i) =>
                    i === index ? { ...meal, completed: !meal.completed } : meal
                ),
            };

            await nutritionService.updateMealPlan(mealPlan.id, {
                meals: updatedMeals,
            });

            // Reload meal plan
            const updatedPlan = await nutritionService.getMealPlan(user.uid, selectedDate);
            setMealPlan(updatedPlan);
        } catch (err) {
            console.error('Error toggling meal:', err);
            setError('Failed to update meal');
        }
    };

    const calculateTotalNutrition = (meals: MealPlan['meals'], recipeMap: { [key: string]: Recipe }) => {
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
                const recipe = recipeMap[meal.recipeId];
                if (recipe) {
                    const multiplier = meal.servings / recipe.nutrition.servings;
                    Object.entries(recipe.nutrition).forEach(([key, value]) => {
                        if (key !== 'servings' && key !== 'servingSize') {
                            total[key as keyof typeof total] += value * multiplier;
                        }
                    });
                }
            })
        );

        return total;
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
            {/* Week Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => {
                        const prevWeek = new Date(selectedDate);
                        prevWeek.setDate(prevWeek.getDate() - 7);
                        setSelectedDate(prevWeek);
                    }}
                >
                    Previous Week
                </Button>
                <h2 className="text-xl font-semibold">
                    {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} -
                    {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                <Button
                    variant="outline"
                    onClick={() => {
                        const nextWeek = new Date(selectedDate);
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        setSelectedDate(nextWeek);
                    }}
                >
                    Next Week
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            {/* Week Calendar */}
            <div className="grid grid-cols-7 gap-4">
                {weekDates.map((date) => {
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                        <div
                            key={date.toISOString()}
                            className={`p-2 rounded-lg cursor-pointer transition-colors ${isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : isToday
                                        ? 'bg-primary/10'
                                        : 'hover:bg-primary/5'
                                }`}
                            onClick={() => handleDateSelect(date)}
                        >
                            <div className="text-center mb-2">
                                <div className="text-sm font-medium">
                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </div>
                                <div className="text-2xl font-semibold">
                                    {date.getDate()}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Meal Plan for Selected Date */}
            {mealPlan && (
                <div className="space-y-6">
                    {MEAL_TYPES.map(({ value: mealType, label }) => (
                        <div key={mealType} className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">{label}</h3>
                                <Button
                                    variant="outline"
                                    onClick={() => handleAddMeal(mealType)}
                                >
                                    Add Meal
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {mealPlan.meals[mealType].map((meal, index) => {
                                    const recipe = recipes[meal.recipeId];
                                    return (
                                        <div
                                            key={`${meal.recipeId}_${index}`}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <input
                                                    type="checkbox"
                                                    checked={meal.completed}
                                                    onChange={() => handleToggleMeal(mealType, index)}
                                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <div className={meal.completed ? 'line-through text-muted-foreground' : ''}>
                                                    <div className="font-medium">
                                                        {recipe?.name || 'Loading...'}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {meal.servings} serving(s) • {recipe?.nutrition.calories * meal.servings} cal
                                                    </div>
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
                                    );
                                })}

                                {mealPlan.meals[mealType].length === 0 && (
                                    <p className="text-center text-muted-foreground py-4">
                                        No meals planned
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Recipe Search Modal */}
            {showRecipeSearch && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-4">Add Recipe</h2>
                        <RecipeSearch
                            onSelect={handleRecipeSelect}
                            onCancel={() => {
                                setShowRecipeSearch(false);
                                setSelectedMealType(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
} 