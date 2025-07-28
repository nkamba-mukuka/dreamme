import { useState } from 'react';
import { Button } from '@dreamme/ui';
import { BackButton } from '../components/layout/BackButton';
import { NutritionDashboard } from '../components/nutrition/NutritionDashboard';
import { MealPlanner } from '../components/nutrition/MealPlanner';
import { RecipeSearch } from '../components/nutrition/RecipeSearch';
import { RecipeForm } from '../components/nutrition/RecipeForm';

type View = 'dashboard' | 'planner' | 'recipes' | 'add-recipe';

export default Nutrition;

export function Nutrition() {
    const [currentView, setCurrentView] = useState<View>('dashboard');

    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Nutrition</h1>
                <div className="flex space-x-4">
                    <Button
                        variant={currentView === 'dashboard' ? 'default' : 'outline'}
                        onClick={() => setCurrentView('dashboard')}
                    >
                        Dashboard
                    </Button>
                    <Button
                        variant={currentView === 'planner' ? 'default' : 'outline'}
                        onClick={() => setCurrentView('planner')}
                    >
                        Meal Planner
                    </Button>
                    <Button
                        variant={currentView === 'recipes' ? 'default' : 'outline'}
                        onClick={() => setCurrentView('recipes')}
                    >
                        Recipes
                    </Button>
                    <Button
                        variant="default"
                        onClick={() => setCurrentView('add-recipe')}
                    >
                        Add Recipe
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                {currentView === 'dashboard' && <NutritionDashboard />}
                {currentView === 'planner' && (
                    <MealPlanner
                        onReplaceMeal={() => setCurrentView('recipes')}
                    />
                )}
                {currentView === 'recipes' && (
                    <RecipeSearch
                        onSelect={() => setCurrentView('planner')}
                        onCancel={() => setCurrentView('dashboard')}
                    />
                )}
                {currentView === 'add-recipe' && (
                    <RecipeForm
                        onComplete={() => setCurrentView('recipes')}
                    />
                )}
            </div>
        </div>
    );
} 