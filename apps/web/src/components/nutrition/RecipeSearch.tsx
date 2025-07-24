import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { nutritionService } from '../../services/nutritionService';
import type {
    Recipe,
    CuisineType,
    DietaryRestriction,
    RecipeSearchParams,
} from '../../types/nutrition';

interface RecipeSearchProps {
    onSelect: (recipe: Recipe) => void;
    onCancel: () => void;
}

const cuisineTypes: { value: CuisineType; label: string }[] = [
    { value: 'american', label: 'American' },
    { value: 'italian', label: 'Italian' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'indian', label: 'Indian' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'thai', label: 'Thai' },
    { value: 'other', label: 'Other' },
];

const dietaryRestrictions: { value: DietaryRestriction; label: string }[] = [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'glutenFree', label: 'Gluten Free' },
    { value: 'dairyFree', label: 'Dairy Free' },
    { value: 'nutFree', label: 'Nut Free' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Kosher' },
];

export function RecipeSearch({ onSelect, onCancel }: RecipeSearchProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    // Search params state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCuisines, setSelectedCuisines] = useState<CuisineType[]>([]);
    const [selectedDiets, setSelectedDiets] = useState<DietaryRestriction[]>([]);
    const [maxPrepTime, setMaxPrepTime] = useState<number | ''>('');
    const [maxCalories, setMaxCalories] = useState<number | ''>('');
    const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
    const [excludedInput, setExcludedInput] = useState('');

    const searchRecipes = async (params: RecipeSearchParams) => {
        setLoading(true);
        setError(null);

        try {
            const results = await nutritionService.searchRecipes(params);
            setRecipes(results);
        } catch (err) {
            console.error('Error searching recipes:', err);
            setError('Failed to search recipes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial search without filters
        searchRecipes({});
    }, []);

    const handleSearch = () => {
        const params: RecipeSearchParams = {
            searchTerm: searchTerm || undefined,
            cuisineTypes: selectedCuisines.length > 0 ? selectedCuisines : undefined,
            dietaryRestrictions: selectedDiets.length > 0 ? selectedDiets : undefined,
            maxPrepTime: maxPrepTime || undefined,
            maxCalories: maxCalories || undefined,
            excludedIngredients: excludedIngredients.length > 0 ? excludedIngredients : undefined,
        };

        searchRecipes(params);
    };

    const handleAddExcludedIngredient = () => {
        if (excludedInput.trim() && !excludedIngredients.includes(excludedInput.trim())) {
            setExcludedIngredients([...excludedIngredients, excludedInput.trim()]);
            setExcludedInput('');
        }
    };

    const handleRemoveExcludedIngredient = (ingredient: string) => {
        setExcludedIngredients(excludedIngredients.filter(i => i !== ingredient));
    };

    return (
        <div className="space-y-6">
            {/* Search Input */}
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                />

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-sm font-medium">Max Prep Time (mins)</label>
                        <input
                            type="number"
                            min="0"
                            value={maxPrepTime}
                            onChange={(e) => setMaxPrepTime(e.target.value ? parseInt(e.target.value) : '')}
                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div className="flex-1">
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
            </div>

            {/* Cuisine Types */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium">Cuisine Types</h3>
                <div className="flex flex-wrap gap-2">
                    {cuisineTypes.map(({ value, label }) => (
                        <Button
                            key={value}
                            variant={selectedCuisines.includes(value) ? 'default' : 'outline'}
                            onClick={() => setSelectedCuisines(prev =>
                                prev.includes(value)
                                    ? prev.filter(c => c !== value)
                                    : [...prev, value]
                            )}
                            className="text-sm"
                        >
                            {label}
                        </Button>
                    ))}
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

            {/* Excluded Ingredients */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium">Excluded Ingredients</h3>
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
                        variant="outline"
                        onClick={handleAddExcludedIngredient}
                    >
                        Add
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {excludedIngredients.map((ingredient) => (
                        <span
                            key={ingredient}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm"
                        >
                            {ingredient}
                            <button
                                onClick={() => handleRemoveExcludedIngredient(ingredient)}
                                className="hover:text-destructive/80"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            <Button
                onClick={handleSearch}
                className="w-full"
            >
                Search Recipes
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
                ) : recipes.length > 0 ? (
                    <div className="grid gap-4">
                        {recipes.map((recipe) => (
                            <div
                                key={recipe.id}
                                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => onSelect(recipe)}
                            >
                                <div className="flex gap-4">
                                    {recipe.imageUrl && (
                                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                                            <img
                                                src={recipe.imageUrl}
                                                alt={recipe.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold mb-1">{recipe.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {recipe.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                                {recipe.prepTime + recipe.cookTime} mins
                                            </span>
                                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                                {recipe.nutrition.calories} cal
                                            </span>
                                            {recipe.dietaryRestrictions.map((diet) => (
                                                <span
                                                    key={diet}
                                                    className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full"
                                                >
                                                    {diet}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-8">
                        No recipes found matching your criteria
                    </p>
                )}
            </div>
        </div>
    );
} 