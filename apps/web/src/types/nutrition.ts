export interface Macros {
    protein: number; // in grams
    carbs: number; // in grams
    fat: number; // in grams
}

export interface NutritionInfo {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    cholesterol: number;
    saturatedFat: number;
    servingSize: number;
    servings: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type DietaryRestriction =
    | 'vegetarian'
    | 'vegan'
    | 'glutenFree'
    | 'dairyFree'
    | 'nutFree'
    | 'halal'
    | 'kosher'
    | 'none';

export type CuisineType =
    | 'american'
    | 'italian'
    | 'mexican'
    | 'chinese'
    | 'japanese'
    | 'indian'
    | 'mediterranean'
    | 'thai'
    | 'other';

export interface Recipe {
    id: string;
    name: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    description: string;
    recipe: string[];
    ingredients: string[];
    nutritionInfo: NutritionInfo;
    imageUrl: string;
    videoUrl?: string;
    preparationTime: number;
    difficulty: 'easy' | 'medium' | 'hard';
    servings: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Meal extends Recipe {
    // Additional meal-specific properties can be added here
}

export interface Ingredient {
    name: string;
    amount: number;
    unit: string;
    nutrition: NutritionInfo;
}

export interface MealPlan {
    id: string;
    userId: string;
    date: Date;
    meals: {
        [key in MealType]: PlannedMeal[];
    };
    totalNutrition: NutritionInfo;
    createdAt: Date;
    updatedAt: Date;
}

export interface PlannedMeal {
    recipeId: string;
    servings: number;
    completed: boolean;
    notes?: string;
}

export interface NutritionLog {
    id: string;
    userId: string;
    date: Date;
    meals: {
        [key in MealType]: LoggedMeal[];
    };
    totalNutrition: NutritionInfo;
    waterIntake: number; // in ml
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface LoggedMeal {
    recipeId?: string; // Optional if it's a custom food
    name: string;
    servings: number;
    nutrition: NutritionInfo;
    time: Date;
    notes?: string;
}

export interface NutritionGoals {
    id: string;
    userId: string;
    dailyCalories: number;
    macros: {
        protein: number; // in grams
        carbs: number; // in grams
        fat: number; // in grams
    };
    waterIntake: number; // in ml
    dietaryRestrictions: string[];
    preferences: {
        cuisineTypes: string[];
        excludedIngredients: string[];
        mealSize: 'small' | 'medium' | 'large';
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface NutritionProgress {
    id: string;
    userId: string;
    date: Date;
    meals: {
        mealId: string;
        type: Meal['type'];
        completed: boolean;
        rating?: number; // 1-5
        notes?: string;
    }[];
    totalCalories: number;
    macros: {
        protein: number;
        carbs: number;
        fat: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface DailyMealPlan {
    id: string;
    userId: string;
    date: Date;
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal[];
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Helper type for recipe search and filtering
export interface RecipeSearchParams {
    searchTerm?: string;
    cuisineTypes?: CuisineType[];
    dietaryRestrictions?: DietaryRestriction[];
    maxPrepTime?: number;
    maxCookTime?: number;
    difficulty?: Recipe['difficulty'];
    minCalories?: number;
    maxCalories?: number;
    excludedIngredients?: string[];
} 