import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { nutritionService } from '../../services/nutritionService';
import type { NutritionGoals, DietaryRestriction } from '../../types/nutrition';

const dietaryRestrictions: { value: DietaryRestriction; label: string }[] = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'glutenFree', label: 'Gluten Free' },
    { value: 'dairyFree', label: 'Dairy Free' },
    { value: 'nutFree', label: 'Nut Free' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Kosher' },
    { value: 'none', label: 'None' },
];

export function NutritionGoalsForm() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [goals, setGoals] = useState<NutritionGoals>({
        userId: user?.uid || '',
        dailyCalories: 2000,
        macros: {
            protein: 150,
            carbs: 250,
            fat: 70,
        },
        waterIntake: 2000,
        dietaryRestrictions: ['none'],
        excludedIngredients: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const [excludedInput, setExcludedInput] = useState('');

    useEffect(() => {
        const loadGoals = async () => {
            if (!user) return;

            setLoading(true);
            setError(null);

            try {
                const userGoals = await nutritionService.getNutritionGoals(user.uid);
                if (userGoals) {
                    setGoals(userGoals);
                }
            } catch (err) {
                console.error('Error loading nutrition goals:', err);
                setError('Failed to load nutrition goals');
            } finally {
                setLoading(false);
            }
        };

        loadGoals();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            await nutritionService.setNutritionGoals(user.uid, {
                dailyCalories: goals.dailyCalories,
                macros: goals.macros,
                waterIntake: goals.waterIntake,
                dietaryRestrictions: goals.dietaryRestrictions,
                excludedIngredients: goals.excludedIngredients,
            });

            setSuccess(true);
        } catch (err) {
            console.error('Error saving nutrition goals:', err);
            setError('Failed to save nutrition goals');
        } finally {
            setSaving(false);
        }
    };

    const handleAddExcludedIngredient = () => {
        if (excludedInput.trim() && !goals.excludedIngredients.includes(excludedInput.trim())) {
            setGoals(prev => ({
                ...prev,
                excludedIngredients: [...prev.excludedIngredients, excludedInput.trim()],
            }));
            setExcludedInput('');
        }
    };

    const handleRemoveExcludedIngredient = (ingredient: string) => {
        setGoals(prev => ({
            ...prev,
            excludedIngredients: prev.excludedIngredients.filter(i => i !== ingredient),
        }));
    };

    const handleDietaryRestrictionToggle = (restriction: DietaryRestriction) => {
        if (restriction === 'none') {
            setGoals(prev => ({
                ...prev,
                dietaryRestrictions: ['none'],
            }));
        } else {
            setGoals(prev => ({
                ...prev,
                dietaryRestrictions: prev.dietaryRestrictions.includes(restriction)
                    ? prev.dietaryRestrictions.filter(r => r !== restriction)
                    : [...prev.dietaryRestrictions.filter(r => r !== 'none'), restriction],
            }));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Nutrition Goals</h2>
                <p className="text-muted-foreground">Set your daily nutrition targets</p>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 text-green-600 text-sm p-4 rounded-lg border border-green-200">
                    Nutrition goals updated successfully!
                </div>
            )}

            {/* Daily Calories */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Daily Calories</h3>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Target Calories</label>
                    <input
                        type="number"
                        min="1000"
                        max="10000"
                        step="50"
                        value={goals.dailyCalories}
                        onChange={(e) => setGoals(prev => ({
                            ...prev,
                            dailyCalories: parseInt(e.target.value) || 2000,
                        }))}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            {/* Macronutrients */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Macronutrients</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Protein (g)</label>
                        <input
                            type="number"
                            min="0"
                            step="5"
                            value={goals.macros.protein}
                            onChange={(e) => setGoals(prev => ({
                                ...prev,
                                macros: {
                                    ...prev.macros,
                                    protein: parseInt(e.target.value) || 0,
                                },
                            }))}
                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Carbs (g)</label>
                        <input
                            type="number"
                            min="0"
                            step="5"
                            value={goals.macros.carbs}
                            onChange={(e) => setGoals(prev => ({
                                ...prev,
                                macros: {
                                    ...prev.macros,
                                    carbs: parseInt(e.target.value) || 0,
                                },
                            }))}
                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fat (g)</label>
                        <input
                            type="number"
                            min="0"
                            step="5"
                            value={goals.macros.fat}
                            onChange={(e) => setGoals(prev => ({
                                ...prev,
                                macros: {
                                    ...prev.macros,
                                    fat: parseInt(e.target.value) || 0,
                                },
                            }))}
                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </div>
            </div>

            {/* Water Intake */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Water Intake</h3>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Daily Water Goal (ml)</label>
                    <input
                        type="number"
                        min="500"
                        step="250"
                        value={goals.waterIntake}
                        onChange={(e) => setGoals(prev => ({
                            ...prev,
                            waterIntake: parseInt(e.target.value) || 2000,
                        }))}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Dietary Restrictions</h3>
                <div className="flex flex-wrap gap-2">
                    {dietaryRestrictions.map(({ value, label }) => (
                        <Button
                            key={value}
                            type="button"
                            variant={goals.dietaryRestrictions.includes(value) ? 'default' : 'outline'}
                            onClick={() => handleDietaryRestrictionToggle(value)}
                            className="text-sm"
                        >
                            {label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Excluded Ingredients */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Excluded Ingredients</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={excludedInput}
                        onChange={(e) => setExcludedInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddExcludedIngredient()}
                        placeholder="Enter ingredient to exclude"
                        className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddExcludedIngredient}
                    >
                        Add
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {goals.excludedIngredients.map((ingredient) => (
                        <span
                            key={ingredient}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm"
                        >
                            {ingredient}
                            <button
                                type="button"
                                onClick={() => handleRemoveExcludedIngredient(ingredient)}
                                className="hover:text-destructive/80"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
                <Button
                    type="submit"
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Goals'}
                </Button>
            </div>
        </form>
    );
} 