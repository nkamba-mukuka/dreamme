import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { nutritionService } from '../../services/nutritionService';
import type { Meal as MealType } from '../../types/nutrition';
import { RecipeDetail } from './RecipeDetail';

interface RecipeSearchProps {
    onSelect?: (meal: MealType) => void;
    onCancel?: () => void;
    standalone?: boolean;
}

const dietaryRestrictions: { value: string; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'gluten-free', label: 'Gluten Free' },
    { value: 'dairy-free', label: 'Dairy Free' },
    { value: 'keto', label: 'Keto' }
];

export function RecipeSearch({ onSelect, onCancel, standalone = false }: RecipeSearchProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [meals, setMeals] = useState<MealType[]>([]);
    const [selectedRecipe, setSelectedRecipe] = useState<MealType | null>(null);

    // Search params state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
    const [maxCalories, setMaxCalories] = useState<number | ''>('');

    const searchRecipes = async () => {
        setLoading(true);
        setError(null);

        try {
            const results = await nutritionService.searchRecipes({
                searchTerm: searchTerm || undefined,
                dietaryRestrictions: selectedDiets.length > 0 ? selectedDiets : undefined,
                maxCalories: maxCalories || undefined
            });
            setMeals(results);
        } catch (err) {
            console.error('Error searching recipes:', err);
            setError('Failed to search recipes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial search without filters
        searchRecipes();
    }, []);

    const handleRecipeClick = (meal: MealType) => {
        if (standalone) {
            setSelectedRecipe(meal);
        } else if (onSelect) {
            onSelect(meal);
        }
    };

    // If a recipe is selected and we're in standalone mode, show the recipe detail
    if (selectedRecipe && standalone) {
        return (
            <RecipeDetail
                recipe={selectedRecipe}
                onClose={() => setSelectedRecipe(null)}
                onAddToMealPlan={onSelect ? () => onSelect(selectedRecipe) : undefined}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Search Input */}
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Search meals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                />

                <div>
                    <label className="text-sm font-medium">Max Calories</label>
                    <input
                        type="number"
                        min="0"
                        value={maxCalories}
                        onChange={(e) => setMaxCalories(e.target.value ? parseInt(e.target.value) : '')}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                    />
                </div>
            </div>

            {/* Dietary Restrictions */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium">Dietary Restrictions</h3>
                <div className="flex flex-wrap gap-2">
                    {dietaryRestrictions.map(({ value, label }) => (
                        <Button
                            key={value}
                            variant={selectedDiets.includes(value) ? 'default' : 'outline'}
                            onClick={() => setSelectedDiets(prev =>
                                prev.includes(value)
                                    ? prev.filter(d => d !== value)
                                    : [...prev, value]
                            )}
                            className="text-sm"
                        >
                            {label}
                        </Button>
                    ))}
                </div>
            </div>

            <Button
                onClick={searchRecipes}
                className="w-full"
            >
                Search Meals
            </Button>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            {/* Recipe Results */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : meals.length > 0 ? (
                    <div className="grid gap-4">
                        {meals.map((meal) => (
                            <div
                                key={meal.name}
                                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleRecipeClick(meal)}
                            >
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                                        <img
                                            src={meal.imageUrl}
                                            alt={meal.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-1">{meal.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {meal.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                                Prep: {meal.preparationTime} mins
                                            </span>
                                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                                {meal.difficulty}
                                            </span>
                                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                                {meal.nutritionInfo.calories} cal
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">
                        No meals found matching your criteria
                    </p>
                )}
            </div>

            {onCancel && (
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            )}
        </div>
    );
} 