import React from 'react';
import { Meal } from '../../types/nutrition';
import { Button } from '@dreamme/ui';

interface RecipeDetailProps {
    meal: Meal;
    onClose: () => void;
    onAddToMealPlan?: () => void;
}

export function RecipeDetail({ meal, onClose, onAddToMealPlan }: RecipeDetailProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="relative h-64">
                    <img
                        src={meal.imageUrl}
                        alt={meal.name}
                        className="absolute inset-0 w-full h-full object-cover rounded-t-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                        <h2 className="text-2xl font-bold text-white">{meal.name}</h2>
                        <p className="text-white/80">{meal.description}</p>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div>
                            <p className="text-sm text-gray-600">Calories</p>
                            <p className="font-medium">{meal.nutritionInfo.calories} kcal</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Protein</p>
                            <p className="font-medium">{meal.nutritionInfo.protein}g</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Carbs</p>
                            <p className="font-medium">{meal.nutritionInfo.carbs}g</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Fat</p>
                            <p className="font-medium">{meal.nutritionInfo.fat}g</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
                        <ul className="list-disc list-inside space-y-1">
                            {meal.ingredients.map((ingredient, index) => (
                                <li key={index} className="text-gray-600">{ingredient}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                        <ol className="list-decimal list-inside space-y-2">
                            {meal.recipe.map((step, index) => (
                                <li key={index} className="text-gray-600">{step}</li>
                            ))}
                        </ol>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button onClick={onClose} variant="ghost">
                            Close
                        </Button>
                        {onAddToMealPlan && (
                            <Button onClick={onAddToMealPlan}>
                                Add to Meal Plan
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 