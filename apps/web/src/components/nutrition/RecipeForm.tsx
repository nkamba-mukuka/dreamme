import { useState } from 'react';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Recipe {
    id: string;
    userId: string;
    title: string;
    ingredients: string[];
    instructions: string[];
    prepTime: number;
    cookTime: number;
    servings: number;
    createdAt: Date;
    updatedAt: Date;
}

export function RecipeForm({ onComplete }: { onComplete: () => void }) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [ingredients, setIngredients] = useState(['']);
    const [instructions, setInstructions] = useState(['']);
    const [prepTime, setPrepTime] = useState(0);
    const [cookTime, setCookTime] = useState(0);
    const [servings, setServings] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddIngredient = () => {
        setIngredients([...ingredients, '']);
    };

    const handleAddInstruction = () => {
        setInstructions([...instructions, '']);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            const recipeId = `${user.uid}_${Date.now()}`;
            const recipe: Recipe = {
                id: recipeId,
                userId: user.uid,
                title,
                ingredients: ingredients.filter(Boolean),
                instructions: instructions.filter(Boolean),
                prepTime,
                cookTime,
                servings,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await setDoc(doc(db, 'recipes', recipeId), recipe);
            onComplete();
        } catch (err) {
            console.error('Error saving recipe:', err);
            setError('Failed to save recipe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-4">Add New Recipe</h2>
                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
                        {error}
                    </div>
                )}
            </div>

            <div>
                <label className="block font-medium mb-2">Recipe Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                    required
                    disabled={loading}
                />
            </div>

            <div>
                <label className="block font-medium mb-2">Ingredients</label>
                {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={ingredient}
                            onChange={(e) => {
                                const newIngredients = [...ingredients];
                                newIngredients[index] = e.target.value;
                                setIngredients(newIngredients);
                            }}
                            className="flex-1 px-3 py-2 border rounded"
                            placeholder={`Ingredient ${index + 1}`}
                            disabled={loading}
                        />
                        {index === ingredients.length - 1 && (
                            <Button
                                type="button"
                                onClick={handleAddIngredient}
                                disabled={loading}
                            >
                                Add
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            <div>
                <label className="block font-medium mb-2">Instructions</label>
                {instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <textarea
                            value={instruction}
                            onChange={(e) => {
                                const newInstructions = [...instructions];
                                newInstructions[index] = e.target.value;
                                setInstructions(newInstructions);
                            }}
                            className="flex-1 px-3 py-2 border rounded"
                            placeholder={`Step ${index + 1}`}
                            rows={2}
                            disabled={loading}
                        />
                        {index === instructions.length - 1 && (
                            <Button
                                type="button"
                                onClick={handleAddInstruction}
                                disabled={loading}
                            >
                                Add
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block font-medium mb-2">Prep Time (mins)</label>
                    <input
                        type="number"
                        value={prepTime}
                        onChange={(e) => setPrepTime(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded"
                        min="0"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label className="block font-medium mb-2">Cook Time (mins)</label>
                    <input
                        type="number"
                        value={cookTime}
                        onChange={(e) => setCookTime(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded"
                        min="0"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label className="block font-medium mb-2">Servings</label>
                    <input
                        type="number"
                        value={servings}
                        onChange={(e) => setServings(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border rounded"
                        min="1"
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onComplete}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Recipe'}
                </Button>
            </div>
        </form>
    );
} 