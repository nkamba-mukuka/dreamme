import * as React from 'react';
import { Meal } from '../../types/nutrition';

export interface RecipeDetailProps {
    meal: Meal;
    onClose: () => void;
    onAddToMealPlan?: () => void;
}

export function RecipeDetail(props: RecipeDetailProps): React.ReactElement; 