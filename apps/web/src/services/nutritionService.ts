import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    addDoc,
    updateDoc,
    deleteDoc,
    QueryConstraint,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type {
    Recipe,
    MealPlan,
    NutritionLog,
    NutritionGoals,
    NutritionProgress,
    RecipeSearchParams,
    CuisineType,
    DietaryRestriction,
} from '../types/nutrition';

const RECIPES_COLLECTION = 'recipes';
const MEAL_PLANS_COLLECTION = 'mealPlans';
const NUTRITION_LOGS_COLLECTION = 'nutritionLogs';
const NUTRITION_GOALS_COLLECTION = 'nutritionGoals';
const NUTRITION_PROGRESS_COLLECTION = 'nutritionProgress';

export const nutritionService = {
    // Recipe CRUD operations
    async createRecipe(data: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const now = new Date();
        const recipeRef = await addDoc(collection(db, RECIPES_COLLECTION), {
            ...data,
            createdAt: now,
            updatedAt: now,
        });
        return recipeRef.id;
    },

    async getRecipe(id: string): Promise<Recipe | null> {
        const recipeRef = doc(db, RECIPES_COLLECTION, id);
        const recipeDoc = await getDoc(recipeRef);

        if (!recipeDoc.exists()) {
            return null;
        }

        return {
            id: recipeDoc.id,
            ...recipeDoc.data(),
        } as Recipe;
    },

    async updateRecipe(id: string, data: Partial<Recipe>): Promise<void> {
        const recipeRef = doc(db, RECIPES_COLLECTION, id);
        await updateDoc(recipeRef, {
            ...data,
            updatedAt: new Date(),
        });
    },

    async deleteRecipe(id: string): Promise<void> {
        const recipeRef = doc(db, RECIPES_COLLECTION, id);
        await deleteDoc(recipeRef);
    },

    // Recipe search and filtering
    async searchRecipes(params: RecipeSearchParams): Promise<Recipe[]> {
        const constraints: QueryConstraint[] = [];

        if (params.cuisineTypes && params.cuisineTypes.length > 0) {
            constraints.push(where('cuisineType', 'in', params.cuisineTypes));
        }

        if (params.dietaryRestrictions && params.dietaryRestrictions.length > 0) {
            constraints.push(where('dietaryRestrictions', 'array-contains-any', params.dietaryRestrictions));
        }

        if (params.maxPrepTime) {
            constraints.push(where('prepTime', '<=', params.maxPrepTime));
        }

        if (params.maxCookTime) {
            constraints.push(where('cookTime', '<=', params.maxCookTime));
        }

        if (params.difficulty) {
            constraints.push(where('difficulty', '==', params.difficulty));
        }

        if (params.minCalories) {
            constraints.push(where('nutrition.calories', '>=', params.minCalories));
        }

        if (params.maxCalories) {
            constraints.push(where('nutrition.calories', '<=', params.maxCalories));
        }

        // Add ordering by name
        constraints.push(orderBy('name', 'asc'));

        const q = query(collection(db, RECIPES_COLLECTION), ...constraints);
        const querySnapshot = await getDocs(q);

        let recipes = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Recipe[];

        // Client-side filtering for search term and excluded ingredients
        if (params.searchTerm || params.excludedIngredients) {
            recipes = recipes.filter(recipe => {
                // Search term filtering
                if (params.searchTerm) {
                    const searchLower = params.searchTerm.toLowerCase();
                    const matchesSearch = recipe.name.toLowerCase().includes(searchLower) ||
                        recipe.description.toLowerCase().includes(searchLower) ||
                        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchLower));

                    if (!matchesSearch) return false;
                }

                // Excluded ingredients filtering
                if (params.excludedIngredients) {
                    const hasExcludedIngredient = recipe.ingredients.some(ing =>
                        params.excludedIngredients!.some(excluded =>
                            ing.name.toLowerCase().includes(excluded.toLowerCase())
                        )
                    );

                    if (hasExcludedIngredient) return false;
                }

                return true;
            });
        }

        return recipes;
    },

    // Meal Plan operations
    async createMealPlan(data: Omit<MealPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const now = new Date();
        const mealPlanRef = await addDoc(collection(db, MEAL_PLANS_COLLECTION), {
            ...data,
            createdAt: now,
            updatedAt: now,
        });
        return mealPlanRef.id;
    },

    async getMealPlan(userId: string, date: Date): Promise<MealPlan | null> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const q = query(
            collection(db, MEAL_PLANS_COLLECTION),
            where('userId', '==', userId),
            where('date', '>=', startOfDay),
            where('date', '<=', endOfDay),
            limit(1)
        );

        const querySnapshot = await getDocs(q);
        const doc = querySnapshot.docs[0];

        if (!doc) {
            return null;
        }

        return {
            id: doc.id,
            ...doc.data(),
        } as MealPlan;
    },

    async updateMealPlan(id: string, data: Partial<MealPlan>): Promise<void> {
        const mealPlanRef = doc(db, MEAL_PLANS_COLLECTION, id);
        await updateDoc(mealPlanRef, {
            ...data,
            updatedAt: new Date(),
        });
    },

    // Nutrition Log operations
    async createNutritionLog(data: Omit<NutritionLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const now = new Date();
        const logRef = await addDoc(collection(db, NUTRITION_LOGS_COLLECTION), {
            ...data,
            createdAt: now,
            updatedAt: now,
        });
        return logRef.id;
    },

    async getNutritionLog(userId: string, date: Date): Promise<NutritionLog | null> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const q = query(
            collection(db, NUTRITION_LOGS_COLLECTION),
            where('userId', '==', userId),
            where('date', '>=', startOfDay),
            where('date', '<=', endOfDay),
            limit(1)
        );

        const querySnapshot = await getDocs(q);
        const doc = querySnapshot.docs[0];

        if (!doc) {
            return null;
        }

        return {
            id: doc.id,
            ...doc.data(),
        } as NutritionLog;
    },

    async updateNutritionLog(id: string, data: Partial<NutritionLog>): Promise<void> {
        const logRef = doc(db, NUTRITION_LOGS_COLLECTION, id);
        await updateDoc(logRef, {
            ...data,
            updatedAt: new Date(),
        });
    },

    // Nutrition Goals operations
    async setNutritionGoals(userId: string, data: Omit<NutritionGoals, 'userId' | 'createdAt' | 'updatedAt'>): Promise<void> {
        const now = new Date();
        const goalsRef = doc(db, NUTRITION_GOALS_COLLECTION, userId);
        await updateDoc(goalsRef, {
            ...data,
            userId,
            updatedAt: now,
        });
    },

    async getNutritionGoals(userId: string): Promise<NutritionGoals | null> {
        const goalsRef = doc(db, NUTRITION_GOALS_COLLECTION, userId);
        const goalsDoc = await getDoc(goalsRef);

        if (!goalsDoc.exists()) {
            return null;
        }

        return goalsDoc.data() as NutritionGoals;
    },

    // Nutrition Progress operations
    async updateNutritionProgress(data: Omit<NutritionProgress, 'createdAt' | 'updatedAt'>): Promise<void> {
        const now = new Date();
        const progressRef = doc(db, NUTRITION_PROGRESS_COLLECTION, `${data.userId}_${data.date.toISOString().split('T')[0]}`);
        await updateDoc(progressRef, {
            ...data,
            updatedAt: now,
        });
    },

    async getNutritionProgress(userId: string, startDate: Date, endDate: Date): Promise<NutritionProgress[]> {
        const q = query(
            collection(db, NUTRITION_PROGRESS_COLLECTION),
            where('userId', '==', userId),
            where('date', '>=', startDate),
            where('date', '<=', endDate),
            orderBy('date', 'asc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data()) as NutritionProgress[];
    },
}; 