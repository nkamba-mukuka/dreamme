import { useState } from 'react';
import { Button, Card } from '@dreamme/ui';
import type { Meal } from '../../types/nutrition';

interface RecipeDetailProps {
    recipe: Meal;
    onClose: () => void;
    onAddToMealPlan?: () => void;
}

export function RecipeDetail({ recipe, onClose, onAddToMealPlan }: RecipeDetailProps) {
    return (
        <Card className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{recipe.name}</h2>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>

                {/* Recipe Image */}
                <div className="relative h-64 rounded-xl overflow-hidden mb-6">
                    <img
                        src={recipe.imageUrl}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-4 gap-4 mb-6 text-center">
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Calories</p>
                        <p className="font-semibold">{recipe.nutritionInfo.calories}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Protein</p>
                        <p className="font-semibold">{recipe.nutritionInfo.protein}g</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Carbs</p>
                        <p className="font-semibold">{recipe.nutritionInfo.carbs}g</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Fat</p>
                        <p className="font-semibold">{recipe.nutritionInfo.fat}g</p>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-600">{recipe.description}</p>
                </div>

                {/* Ingredients */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {recipe.ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                        ))}
                    </ul>
                </div>

                {/* Instructions */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                        {recipe.recipe.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                </div>

                {/* Additional Info */}
                <div className="flex justify-between text-sm text-gray-500 mb-6">
                    <p>Preparation Time: {recipe.preparationTime} minutes</p>
                    <p>Difficulty: {recipe.difficulty}</p>
                    <p>Servings: {recipe.servings}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    {onAddToMealPlan && (
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={onAddToMealPlan}
                        >
                            Add to Meal Plan
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            </div>
        </Card>
    );
} 