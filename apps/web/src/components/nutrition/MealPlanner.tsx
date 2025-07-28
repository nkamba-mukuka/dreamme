import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { nutritionService } from '../../services/nutritionService';
import type { DailyMealPlan, Meal } from '../../types/nutrition';

// Default meal images
const DEFAULT_MEAL_IMAGES = {
    breakfast: {
        'Oatmeal': 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800',
        'Pancakes': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
        'Eggs': 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800',
        'Smoothie': 'https://images.unsplash.com/photo-1494597564530-871f2b93ac55?w=800',
        'Toast': 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=800',
        'Yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
        'Breakfast': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800',
        default: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800'
    },
    lunch: {
        'Salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
        'Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800',
        'Bowl': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
        'Soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
        'Stir Fry': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',
        'Quinoa': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
        'Lunch': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'
    },
    dinner: {
        'Salmon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
        'Chicken': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800',
        'Pasta': 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800',
        'Steak': 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=800',
        'Rice': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',
        'Fish': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800',
        'Dinner': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
        default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'
    },
    snack: {
        'Fruit': 'https://images.unsplash.com/photo-1490474418585-ba9012e5b350?w=800',
        'Nuts': 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=800',
        'Yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800',
        'Smoothie': 'https://images.unsplash.com/photo-1526424382096-74a93e105682?w=800',
        'Snack': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
        default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'
    }
} as const;

type MealImageType = keyof typeof DEFAULT_MEAL_IMAGES;

const getMealImage = (meal: Meal, type: string) => {
    const mealType = type.toLowerCase().split(' ')[0] as MealImageType;
    const images = DEFAULT_MEAL_IMAGES[mealType] || DEFAULT_MEAL_IMAGES.snack;

    // Try to find a matching image based on meal name
    const matchingKey = Object.keys(images).find(key =>
        meal.name.toLowerCase().includes(key.toLowerCase())
    );

    return matchingKey ? images[matchingKey as keyof typeof images] : images.default;
};

type MealType = 'breakfast' | 'lunch' | 'dinner';

const MEAL_TYPES: { value: MealType; label: string }[] = [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
];

export function MealPlanner({ onReplaceMeal }: { onReplaceMeal: () => void }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [mealPlan, setMealPlan] = useState<DailyMealPlan | null>(null);
    const [completing, setCompleting] = useState(false);

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
                const plan = await nutritionService.getDailyMealPlan(user.uid);
                setMealPlan(plan);
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

    const handleCompleteMealPlan = async () => {
        if (!user || !mealPlan) return;

        try {
            setCompleting(true);
            await nutritionService.completeDailyMealPlan(user.uid, selectedDate);

            // Update local state
            setMealPlan(prev => prev ? {
                ...prev,
                completed: true,
                updatedAt: new Date()
            } : null);

            // Show success message
            alert('Great job! Your meal plan has been marked as completed.');
        } catch (error) {
            console.error('Error completing meal plan:', error);
            alert('Failed to mark meal plan as completed. Please try again.');
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const renderMeal = (meal: Meal, label: string) => (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-black">{label}</h3>
                <Button
                    variant="outline"
                    onClick={onReplaceMeal}
                    className="text-black hover:bg-gray-50"
                >
                    Replace Meal
                </Button>
            </div>

            <div className="space-y-4">
                <div className="relative h-48 rounded-lg overflow-hidden">
                    <img
                        src={getMealImage(meal, label)}
                        alt={meal.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-4">
                        <h4 className="text-xl font-semibold text-white">
                            {meal.name}
                        </h4>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-sm text-muted-foreground">Calories</p>
                        <p className="font-medium">{meal.nutritionInfo.calories} kcal</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Protein</p>
                        <p className="font-medium">{meal.nutritionInfo.protein}g</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Carbs</p>
                        <p className="font-medium">{meal.nutritionInfo.carbs}g</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Fat</p>
                        <p className="font-medium">{meal.nutritionInfo.fat}g</p>
                    </div>
                </div>

                <div className="mt-4 space-y-4">
                    <div>
                        <h4 className="text-sm font-medium mb-2">Ingredients</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {meal.ingredients.map((ingredient, index) => (
                                <li key={index}>{ingredient}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium mb-2">Recipe</h4>
                        <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                            {meal.recipe.map((step, index) => (
                                <li key={index}>{step}</li>
                            ))}
                        </ol>
                    </div>

                    <div className="flex justify-between text-sm text-gray-600">
                        <p>Preparation time: {meal.preparationTime} minutes</p>
                        <p>Difficulty: {meal.difficulty}</p>
                    </div>
                </div>
            </div>
        </div>
    );

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
                <div className="text-center">
                    <h2 className="text-xl font-semibold">
                        {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} -
                        {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </h2>
                    {mealPlan && selectedDate.toDateString() === new Date().toDateString() && (
                        <Button
                            variant="primary"
                            className="mt-4"
                            onClick={handleCompleteMealPlan}
                            disabled={completing || mealPlan.completed}
                        >
                            {completing ? 'Saving...' : mealPlan.completed ? 'Completed!' : 'I Ate Today! 🎉'}
                        </Button>
                    )}
                </div>
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
                    <div key="breakfast">{renderMeal(mealPlan.breakfast, 'Breakfast')}</div>
                    <div key="lunch">{renderMeal(mealPlan.lunch, 'Lunch')}</div>
                    <div key="dinner">{renderMeal(mealPlan.dinner, 'Dinner')}</div>
                    {mealPlan.snacks?.map((snack, index) => (
                        <div key={`snack-${index}`}>{renderMeal(snack, `Snack ${index + 1}`)}</div>
                    ))}
                </div>
            )}
        </div>
    );
} 