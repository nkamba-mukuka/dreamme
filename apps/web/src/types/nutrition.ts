export interface Macros {
    protein: number; // in grams
    carbs: number; // in grams
    fat: number; // in grams
}

export interface NutritionInfo extends Macros {
    calories: number;
    fiber: number; // in grams
    sugar: number; // in grams
    sodium: number; // in mg
    cholesterol: number; // in mg
    saturatedFat: number; // in grams
    servingSize: number; // in grams
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
    description: string;
    ingredients: Ingredient[];
    instructions: string[];
    prepTime: number; // in minutes
    cookTime: number; // in minutes
    servings: number;
    nutrition: NutritionInfo;
    dietaryRestrictions: DietaryRestriction[];
    cuisineType: CuisineType;
    difficulty: 'easy' | 'medium' | 'hard';
    imageUrl?: string;
    createdBy: string; // user ID
    createdAt: Date;
    updatedAt: Date;
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
    userId: string;
    dailyCalories: number;
    macros: Macros;
    waterIntake: number; // in ml
    dietaryRestrictions: DietaryRestriction[];
    excludedIngredients: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface NutritionProgress {
    userId: string;
    date: Date;
    planned: NutritionInfo;
    actual: NutritionInfo;
    waterIntake: {
        planned: number;
        actual: number;
    };
    adherenceRate: number; // 0-100%
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