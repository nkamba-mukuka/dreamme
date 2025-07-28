import { useState } from 'react';
import { Button } from '@dreamme/ui';
import { nutritionService } from '../../services/nutritionService';
import type { LoggedMeal, Recipe } from '../../types/nutrition';
import { RecipeSearch } from './RecipeSearch';

interface MealFormProps {
    onSubmit: (meal: LoggedMeal) => void;
    onCancel: () => void;
}

export function MealForm({ onSubmit, onCancel }: MealFormProps) {
    const [mode, setMode] = useState<'recipe' | 'custom'>('recipe');
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [servings, setServings] = useState(1);
    const [customFood, setCustomFood] = useState({
        name: '',
        servings: 1,
        nutrition: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            cholesterol: 0,
            saturatedFat: 0,
            servingSize: 100,
            servings: 1,
        },
    });

    const handleRecipeSelect = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'recipe' && selectedRecipe) {
            const meal: LoggedMeal = {
                recipeId: selectedRecipe.id,
                name: selectedRecipe.name,
                servings,
                nutrition: {
                    ...selectedRecipe.nutritionInfo,
                    calories: selectedRecipe.nutritionInfo.calories * (servings / selectedRecipe.servings),
                    protein: selectedRecipe.nutritionInfo.protein * (servings / selectedRecipe.servings),
                    carbs: selectedRecipe.nutritionInfo.carbs * (servings / selectedRecipe.servings),
                    fat: selectedRecipe.nutritionInfo.fat * (servings / selectedRecipe.servings),
                    fiber: selectedRecipe.nutritionInfo.fiber * (servings / selectedRecipe.servings),
                    sugar: selectedRecipe.nutritionInfo.sugar * (servings / selectedRecipe.servings),
                    sodium: selectedRecipe.nutritionInfo.sodium * (servings / selectedRecipe.servings),
                    cholesterol: selectedRecipe.nutritionInfo.cholesterol * (servings / selectedRecipe.servings),
                    saturatedFat: selectedRecipe.nutritionInfo.saturatedFat * (servings / selectedRecipe.servings),
                },
                time: new Date(),
            };
            onSubmit(meal);
        } else if (mode === 'custom') {
            const meal: LoggedMeal = {
                name: customFood.name,
                servings: customFood.servings,
                nutrition: {
                    ...customFood.nutrition,
                    calories: customFood.nutrition.calories * customFood.servings,
                    protein: customFood.nutrition.protein * customFood.servings,
                    carbs: customFood.nutrition.carbs * customFood.servings,
                    fat: customFood.nutrition.fat * customFood.servings,
                    fiber: customFood.nutrition.fiber * customFood.servings,
                    sugar: customFood.nutrition.sugar * customFood.servings,
                    sodium: customFood.nutrition.sodium * customFood.servings,
                    cholesterol: customFood.nutrition.cholesterol * customFood.servings,
                    saturatedFat: customFood.nutrition.saturatedFat * customFood.servings,
                },
                time: new Date(),
            };
            onSubmit(meal);
        }
    };

    return (
        <div className="space-y-6">
            {/* Mode Selection */}
            <div className="flex gap-4">
                <Button
                    variant={mode === 'recipe' ? 'default' : 'outline'}
                    onClick={() => setMode('recipe')}
                    className="flex-1"
                >
                    From Recipe
                </Button>
                <Button
                    variant={mode === 'custom' ? 'default' : 'outline'}
                    onClick={() => setMode('custom')}
                    className="flex-1"
                >
                    Custom Food
                </Button>
            </div>

            {mode === 'recipe' ? (
                <div className="space-y-6">
                    {selectedRecipe ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">{selectedRecipe.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedRecipe.nutritionInfo.calories} cal per serving
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedRecipe(null)}
                                >
                                    Change Recipe
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Number of Servings
                                </label>
                                <input
                                    type="number"
                                    min="0.25"
                                    step="0.25"
                                    value={servings}
                                    onChange={(e) => setServings(parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                                />
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <h4 className="font-medium">Nutrition per serving</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>Calories: {selectedRecipe.nutritionInfo.calories}</div>
                                    <div>Protein: {selectedRecipe.nutritionInfo.protein}g</div>
                                    <div>Carbs: {selectedRecipe.nutritionInfo.carbs}g</div>
                                    <div>Fat: {selectedRecipe.nutritionInfo.fat}g</div>
                                </div>
                            </div>

                            <div className="bg-primary/5 p-4 rounded-lg space-y-2">
                                <h4 className="font-medium">Total nutrition</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        Calories: {Math.round(selectedRecipe.nutritionInfo.calories * servings)}
                                    </div>
                                    <div>
                                        Protein: {Math.round(selectedRecipe.nutritionInfo.protein * servings)}g
                                    </div>
                                    <div>
                                        Carbs: {Math.round(selectedRecipe.nutritionInfo.carbs * servings)}g
                                    </div>
                                    <div>
                                        Fat: {Math.round(selectedRecipe.nutritionInfo.fat * servings)}g
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <RecipeSearch
                            onSelect={handleRecipeSelect}
                            onCancel={onCancel}
                        />
                    )}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Food Name</label>
                        <input
                            type="text"
                            value={customFood.name}
                            onChange={(e) => setCustomFood(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Number of Servings</label>
                        <input
                            type="number"
                            min="0.25"
                            step="0.25"
                            value={customFood.servings}
                            onChange={(e) => setCustomFood(prev => ({
                                ...prev,
                                servings: parseFloat(e.target.value) || 0,
                            }))}
                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-medium">Nutrition per serving</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Calories</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={customFood.nutrition.calories}
                                    onChange={(e) => setCustomFood(prev => ({
                                        ...prev,
                                        nutrition: {
                                            ...prev.nutrition,
                                            calories: parseInt(e.target.value) || 0,
                                        },
                                    }))}
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Protein (g)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={customFood.nutrition.protein}
                                    onChange={(e) => setCustomFood(prev => ({
                                        ...prev,
                                        nutrition: {
                                            ...prev.nutrition,
                                            protein: parseFloat(e.target.value) || 0,
                                        },
                                    }))}
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Carbs (g)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={customFood.nutrition.carbs}
                                    onChange={(e) => setCustomFood(prev => ({
                                        ...prev,
                                        nutrition: {
                                            ...prev.nutrition,
                                            carbs: parseFloat(e.target.value) || 0,
                                        },
                                    }))}
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Fat (g)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={customFood.nutrition.fat}
                                    onChange={(e) => setCustomFood(prev => ({
                                        ...prev,
                                        nutrition: {
                                            ...prev.nutrition,
                                            fat: parseFloat(e.target.value) || 0,
                                        },
                                    }))}
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 p-4 rounded-lg space-y-2">
                        <h4 className="font-medium">Total nutrition</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                Calories: {Math.round(customFood.nutrition.calories * customFood.servings)}
                            </div>
                            <div>
                                Protein: {Math.round(customFood.nutrition.protein * customFood.servings)}g
                            </div>
                            <div>
                                Carbs: {Math.round(customFood.nutrition.carbs * customFood.servings)}g
                            </div>
                            <div>
                                Fat: {Math.round(customFood.nutrition.fat * customFood.servings)}g
                            </div>
                        </div>
                    </div>
                </form>
            )}

            <div className="flex justify-end space-x-4">
                <Button
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={mode === 'recipe' && !selectedRecipe}
                >
                    Add Food
                </Button>
            </div>
        </div>
    );
} 