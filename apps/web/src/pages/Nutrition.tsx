import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { BackButton } from '../components/layout/BackButton';
import { NutritionDashboard } from '../components/nutrition/NutritionDashboard';
import { MealPlanner } from '../components/nutrition/MealPlanner';
import { RecipeSearch } from '../components/nutrition/RecipeSearch';
import type { Meal } from '../types/nutrition';
import { useLocation } from 'react-router-dom';

type View = 'dashboard' | 'planner' | 'recipes';

export default Nutrition;

export function Nutrition() {
    const location = useLocation();
    const initialView = (location.state as { view?: View })?.view || 'dashboard';
    const [currentView, setCurrentView] = useState<View>(initialView);
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
    const [isSelectingForMealPlan, setIsSelectingForMealPlan] = useState(false);

    // Reset view when location state changes
    useEffect(() => {
        const view = (location.state as { view?: View })?.view;
        if (view) {
            setCurrentView(view);
        }
    }, [location.state]);

    const handleRecipeSelect = (meal: Meal) => {
        if (isSelectingForMealPlan) {
            // Add to meal plan
            setCurrentView('planner');
            setIsSelectingForMealPlan(false);
        } else {
            // Just view the recipe
            setSelectedMeal(meal);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Nutrition</h1>
                <div className="flex space-x-4">
                    <Button
                        variant={currentView === 'dashboard' ? 'default' : 'outline'}
                        onClick={() => {
                            setCurrentView('dashboard');
                            setSelectedMeal(null);
                            setIsSelectingForMealPlan(false);
                        }}
                    >
                        Dashboard
                    </Button>
                    <Button
                        variant={currentView === 'planner' ? 'default' : 'outline'}
                        onClick={() => {
                            setCurrentView('planner');
                            setSelectedMeal(null);
                            setIsSelectingForMealPlan(false);
                        }}
                    >
                        Meal Planner
                    </Button>
                    <Button
                        variant={currentView === 'recipes' ? 'default' : 'outline'}
                        onClick={() => {
                            setCurrentView('recipes');
                            setSelectedMeal(null);
                            setIsSelectingForMealPlan(false);
                        }}
                    >
                        Recipes
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                {currentView === 'dashboard' && <NutritionDashboard />}
                {currentView === 'planner' && (
                    <MealPlanner
                        onReplaceMeal={() => {
                            setCurrentView('recipes');
                            setIsSelectingForMealPlan(true);
                        }}
                    />
                )}
                {currentView === 'recipes' && (
                    <RecipeSearch
                        standalone={true}
                        onSelect={handleRecipeSelect}
                        onCancel={
                            isSelectingForMealPlan
                                ? () => {
                                    setCurrentView('planner');
                                    setIsSelectingForMealPlan(false);
                                }
                                : undefined
                        }
                    />
                )}
            </div>
        </div>
    );
} 