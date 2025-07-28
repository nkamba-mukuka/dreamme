import { doc, getDoc, setDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { NutritionLog, NutritionInfo, MealType, LoggedMeal, DailyMealPlan, NutritionGoals, Meal } from '../types/nutrition';

// Default meal recommendations
const MEAL_RECOMMENDATIONS: Record<string, { breakfast: Meal[]; lunch: Meal[]; dinner: Meal[] }> = {
    'default': {
        breakfast: [
            {
                id: 'greek-yogurt-parfait',
                name: 'Greek Yogurt Parfait with Berries',
                type: 'breakfast',
                description: 'Creamy Greek yogurt layered with fresh berries, honey, and granola',
                recipe: [
                    'Layer Greek yogurt in a bowl or glass',
                    'Add fresh mixed berries',
                    'Top with granola and honey',
                    'Optional: add chia seeds or nuts'
                ],
                ingredients: [
                    '1 cup Greek yogurt',
                    '1 cup mixed berries',
                    '1/4 cup granola',
                    '1 tbsp honey',
                    'Optional: chia seeds, nuts'
                ],
                nutritionInfo: {
                    calories: 320,
                    protein: 15,
                    carbs: 45,
                    fat: 10,
                    fiber: 3,
                    sugar: 25,
                    sodium: 120,
                    cholesterol: 15,
                    saturatedFat: 3,
                    servingSize: 250,
                    servings: 1
                },
                servings: 1,
                imageUrl: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800', // Updated to a proper yogurt parfait image
                preparationTime: 10,
                difficulty: 'easy',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'avocado-toast',
                name: 'Avocado Toast with Poached Egg',
                type: 'breakfast',
                description: 'Sourdough toast topped with mashed avocado, poached egg, and chili flakes',
                recipe: [
                    'Toast sourdough bread',
                    'Mash ripe avocado with lime and salt',
                    'Spread on toast',
                    'Top with poached egg and seasonings'
                ],
                ingredients: [
                    '2 slices sourdough bread',
                    '1 ripe avocado',
                    '2 eggs',
                    'Lime juice',
                    'Salt and pepper',
                    'Red chili flakes'
                ],
                nutritionInfo: {
                    calories: 420,
                    protein: 18,
                    carbs: 35,
                    fat: 28,
                    fiber: 5,
                    sugar: 10,
                    sodium: 500,
                    cholesterol: 100,
                    saturatedFat: 5,
                    servingSize: 300,
                    servings: 1
                },
                servings: 1,
                imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800', // Updated to a proper avocado toast image
                preparationTime: 15,
                difficulty: 'medium',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ],
        lunch: [
            {
                id: 'quinoa-buddha-bowl',
                name: 'Rainbow Quinoa Buddha Bowl',
                type: 'lunch',
                description: 'Colorful bowl with quinoa, roasted vegetables, chickpeas, and tahini dressing',
                recipe: [
                    'Cook quinoa according to package instructions',
                    'Roast mixed vegetables with olive oil',
                    'Prepare tahini dressing',
                    'Assemble bowl with all components',
                    'Drizzle with dressing'
                ],
                ingredients: [
                    '1 cup quinoa',
                    'Mixed vegetables (sweet potato, broccoli, carrots)',
                    '1 can chickpeas',
                    'Tahini dressing',
                    'Olive oil',
                    'Mixed seeds'
                ],
                nutritionInfo: {
                    calories: 450,
                    protein: 15,
                    carbs: 65,
                    fat: 20,
                    fiber: 10,
                    sugar: 15,
                    sodium: 1000,
                    cholesterol: 0,
                    saturatedFat: 3,
                    servingSize: 400,
                    servings: 1
                },
                servings: 1,
                imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800', // Updated to a proper quinoa bowl image
                preparationTime: 30,
                difficulty: 'medium',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'grilled-chicken-salad',
                name: 'Mediterranean Grilled Chicken Salad',
                type: 'lunch',
                description: 'Fresh salad with grilled chicken, mixed greens, feta, and balsamic dressing',
                recipe: [
                    'Grill chicken breast with herbs',
                    'Prepare mixed salad base',
                    'Add cherry tomatoes, cucumber, olives',
                    'Top with feta cheese',
                    'Drizzle with balsamic dressing'
                ],
                ingredients: [
                    'Chicken breast',
                    'Mixed salad greens',
                    'Cherry tomatoes',
                    'Cucumber',
                    'Kalamata olives',
                    'Feta cheese',
                    'Balsamic dressing'
                ],
                nutritionInfo: {
                    calories: 380,
                    protein: 35,
                    carbs: 15,
                    fat: 22,
                    fiber: 3,
                    sugar: 5,
                    sodium: 1200,
                    cholesterol: 100,
                    saturatedFat: 7,
                    servingSize: 350,
                    servings: 1
                },
                servings: 1,
                imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800', // Updated to a proper grilled chicken salad image
                preparationTime: 20,
                difficulty: 'medium',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ],
        dinner: [
            {
                id: 'grilled-salmon',
                name: 'Herb-Crusted Grilled Salmon',
                type: 'dinner',
                description: 'Fresh salmon fillet with herbs, served with quinoa and roasted vegetables',
                recipe: [
                    'Season salmon with herbs and lemon',
                    'Grill or bake salmon',
                    'Cook quinoa',
                    'Roast vegetables',
                    'Plate and garnish'
                ],
                ingredients: [
                    'Salmon fillet',
                    'Fresh herbs (dill, parsley)',
                    'Quinoa',
                    'Mixed vegetables',
                    'Lemon',
                    'Olive oil'
                ],
                nutritionInfo: {
                    calories: 520,
                    protein: 42,
                    carbs: 35,
                    fat: 25,
                    fiber: 5,
                    sugar: 5,
                    sodium: 1500,
                    cholesterol: 120,
                    saturatedFat: 7,
                    servingSize: 450,
                    servings: 1
                },
                servings: 1,
                imageUrl: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=800', // Updated to a proper grilled salmon image
                preparationTime: 30,
                difficulty: 'medium',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'chicken-stir-fry',
                name: 'Asian Chicken Stir-Fry with Brown Rice',
                type: 'dinner',
                description: 'Colorful stir-fried chicken with vegetables in a ginger-soy sauce',
                recipe: [
                    'Cook brown rice',
                    'Stir-fry chicken with garlic and ginger',
                    'Add mixed vegetables',
                    'Make sauce and combine',
                    'Serve over rice'
                ],
                ingredients: [
                    'Chicken breast',
                    'Brown rice',
                    'Mixed vegetables',
                    'Ginger',
                    'Garlic',
                    'Soy sauce',
                    'Sesame oil'
                ],
                nutritionInfo: {
                    calories: 480,
                    protein: 35,
                    carbs: 55,
                    fat: 18,
                    fiber: 5,
                    sugar: 10,
                    sodium: 1800,
                    cholesterol: 80,
                    saturatedFat: 3,
                    servingSize: 400,
                    servings: 1
                },
                servings: 1,
                imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800', // Updated to a proper chicken stir-fry image
                preparationTime: 25,
                difficulty: 'medium',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]
    }
};

// Healthy snack options
const HEALTHY_SNACKS: Meal[] = [
    {
        id: 'fruit-yogurt-parfait',
        name: 'Fresh Fruit and Yogurt Parfait',
        type: 'snack',
        description: 'Light and refreshing parfait with fresh fruits and yogurt',
        recipe: [
            'Layer yogurt and fresh fruits',
            'Add honey if desired',
            'Top with granola'
        ],
        ingredients: [
            'Greek yogurt',
            'Mixed fresh fruits',
            'Honey',
            'Granola'
        ],
        nutritionInfo: {
            calories: 180,
            protein: 10,
            carbs: 25,
            fat: 5,
            fiber: 2,
            sugar: 15,
            sodium: 50,
            cholesterol: 5,
            saturatedFat: 1,
            servingSize: 150,
            servings: 1
        },
        servings: 1,
        imageUrl: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=800', // Updated to a proper fruit and yogurt parfait image
        preparationTime: 5,
        difficulty: 'easy',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'mixed-nuts-trail',
        name: 'Mixed Nuts and Dried Fruit Trail Mix',
        type: 'snack',
        description: 'Energy-boosting mix of nuts, seeds, and dried fruits',
        recipe: [
            'Mix all ingredients together',
            'Store in an airtight container'
        ],
        ingredients: [
            'Almonds',
            'Walnuts',
            'Pumpkin seeds',
            'Dried cranberries',
            'Dark chocolate chips'
        ],
        nutritionInfo: {
            calories: 220,
            protein: 8,
            carbs: 15,
            fat: 16,
            fiber: 5,
            sugar: 10,
            sodium: 100,
            cholesterol: 0,
            saturatedFat: 3,
            servingSize: 100,
            servings: 1
        },
        servings: 1,
        imageUrl: 'https://images.unsplash.com/photo-1606368728504-497b4fba8d98?w=800', // Updated to a proper trail mix image
        preparationTime: 5,
        difficulty: 'easy',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'green-smoothie',
        name: 'Green Energy Smoothie',
        type: 'snack',
        description: 'Nutrient-rich green smoothie with spinach, banana, and almond milk',
        recipe: [
            'Blend all ingredients until smooth',
            'Add ice if desired'
        ],
        ingredients: [
            'Spinach',
            'Banana',
            'Almond milk',
            'Chia seeds',
            'Honey'
        ],
        nutritionInfo: {
            calories: 150,
            protein: 5,
            carbs: 25,
            fat: 4,
            fiber: 3,
            sugar: 15,
            sodium: 50,
            cholesterol: 0,
            saturatedFat: 1,
            servingSize: 200,
            servings: 1
        },
        servings: 1,
        imageUrl: 'https://images.unsplash.com/photo-1638432607995-17f3d0fc1a46?w=800', // Updated to a proper green smoothie image
        preparationTime: 5,
        difficulty: 'easy',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const nutritionService = {
    async generateDailyMealPlan(userId: string): Promise<DailyMealPlan> {
        try {
            // Get user profile and nutrition goals
            const profileDoc = await getDoc(doc(db, 'profiles', userId));
            const goalsDoc = await getDoc(doc(db, 'nutritionGoals', userId));

            if (!profileDoc.exists() || !goalsDoc.exists()) {
                throw new Error('User profile or nutrition goals not found');
            }

            const profile = profileDoc.data();
            const goals = goalsDoc.data() as NutritionGoals;

            // Filter meals based on dietary restrictions and fitness goals
            const filterMeals = (meals: Meal[], type: 'breakfast' | 'lunch' | 'dinner' | 'snack'): Meal[] => {
                return meals.filter(meal => {
                    // Check dietary restrictions
                    if (goals.dietaryRestrictions.length > 0 && goals.dietaryRestrictions[0] !== 'none') {
                        const meetsRestrictions = goals.dietaryRestrictions.every(restriction => {
                            switch (restriction) {
                                case 'vegetarian':
                                    return !meal.ingredients.some(i =>
                                        i.toLowerCase().includes('meat') ||
                                        i.toLowerCase().includes('chicken') ||
                                        i.toLowerCase().includes('fish')
                                    );
                                case 'vegan':
                                    return !meal.ingredients.some(i =>
                                        i.toLowerCase().includes('meat') ||
                                        i.toLowerCase().includes('dairy') ||
                                        i.toLowerCase().includes('egg') ||
                                        i.toLowerCase().includes('honey')
                                    );
                                case 'glutenFree':
                                    return !meal.ingredients.some(i =>
                                        i.toLowerCase().includes('wheat') ||
                                        i.toLowerCase().includes('gluten') ||
                                        i.toLowerCase().includes('bread') ||
                                        i.toLowerCase().includes('pasta')
                                    );
                                case 'dairyFree':
                                    return !meal.ingredients.some(i =>
                                        i.toLowerCase().includes('milk') ||
                                        i.toLowerCase().includes('cheese') ||
                                        i.toLowerCase().includes('yogurt') ||
                                        i.toLowerCase().includes('cream')
                                    );
                                default:
                                    return true;
                            }
                        });
                        if (!meetsRestrictions) return false;
                    }

                    // Check fitness goals
                    switch (profile.primaryGoal) {
                        case 'weightLoss':
                            return meal.nutritionInfo.calories < 500 && meal.nutritionInfo.fat < 20;
                        case 'muscleGain':
                            return meal.nutritionInfo.protein > 30;
                        case 'maintenance':
                            return true; // No specific restrictions
                        default:
                            return true;
                    }
                });
            };

            // Get meals for each type
            const availableBreakfasts = filterMeals(MEAL_RECOMMENDATIONS.default.breakfast, 'breakfast');
            const availableLunches = filterMeals(MEAL_RECOMMENDATIONS.default.lunch, 'lunch');
            const availableDinners = filterMeals(MEAL_RECOMMENDATIONS.default.dinner, 'dinner');
            const availableSnacks = filterMeals(HEALTHY_SNACKS, 'snack');

            // Randomly select meals for the day
            const getRandomMeal = (meals: Meal[]): Meal => {
                const randomIndex = Math.floor(Math.random() * meals.length);
                return meals[randomIndex];
            };

            const mealPlan: DailyMealPlan = {
                id: `${userId}_${new Date().toISOString().split('T')[0]}`,
                userId,
                date: new Date(),
                breakfast: getRandomMeal(availableBreakfasts),
                lunch: getRandomMeal(availableLunches),
                dinner: getRandomMeal(availableDinners),
                snacks: [getRandomMeal(availableSnacks)],
                completed: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Save to Firestore
            await setDoc(doc(db, 'dailyMealPlans', mealPlan.id), mealPlan);

            return mealPlan;
        } catch (error) {
            console.error('Error generating daily meal plan:', error);
            throw error;
        }
    },

    async getDailyMealPlan(userId: string): Promise<DailyMealPlan> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const mealPlanDoc = await getDoc(doc(db, 'dailyMealPlans', `${userId}_${today.toISOString().split('T')[0]}`));

            if (!mealPlanDoc.exists()) {
                return this.generateDailyMealPlan(userId);
            }

            return mealPlanDoc.data() as DailyMealPlan;
        } catch (error) {
            console.error('Error getting daily meal plan:', error);
            throw error;
        }
    },

    async getNutritionGoals(userId: string): Promise<NutritionGoals> {
        try {
            const goalsDoc = await getDoc(doc(db, 'nutritionGoals', userId));

            if (!goalsDoc.exists()) {
                // Create default nutrition goals
                const defaultGoals: NutritionGoals = {
                    id: userId,
                    userId: userId,
                    dailyCalories: 2000,
                    macros: {
                        protein: 150,
                        carbs: 200,
                        fat: 70
                    },
                    waterIntake: 2000,
                    dietaryRestrictions: [],
                    preferences: {
                        cuisineTypes: [],
                        excludedIngredients: [],
                        mealSize: 'medium'
                    },
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                await setDoc(doc(db, 'nutritionGoals', userId), defaultGoals);
                return defaultGoals;
            }

            return goalsDoc.data() as NutritionGoals;
        } catch (error) {
            console.error('Error getting nutrition goals:', error);
            throw error;
        }
    },

    // Add missing functions
    async getMealPlan(userId: string, date: Date): Promise<DailyMealPlan | null> {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const q = query(
                collection(db, 'dailyMealPlans'),
                where('userId', '==', userId),
                where('date', '>=', startOfDay),
                where('date', '<=', endOfDay),
                limit(1)
            );

            const querySnapshot = await getDocs(q);
            const doc = querySnapshot.docs[0];

            if (!doc) {
                return this.generateDailyMealPlan(userId);
            }

            return doc.data() as DailyMealPlan;
        } catch (error) {
            console.error('Error getting meal plan:', error);
            throw error;
        }
    },

    async getNutritionLog(userId: string, date: Date): Promise<NutritionLog | null> {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const q = query(
                collection(db, 'nutritionLogs'),
                where('userId', '==', userId),
                where('date', '==', startOfDay),
                limit(1)
            );

            const querySnapshot = await getDocs(q);
            const doc = querySnapshot.docs[0];

            if (!doc) {
                return null;
            }

            return {
                id: doc.id,
                ...doc.data()
            } as NutritionLog;
        } catch (error) {
            console.error('Error getting nutrition log:', error);
            throw error;
        }
    },

    async createNutritionLog(data: Omit<NutritionLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        try {
            const docRef = doc(collection(db, 'nutritionLogs'));
            const logData = {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await setDoc(docRef, logData);
            return docRef.id;
        } catch (error) {
            console.error('Error creating nutrition log:', error);
            throw error;
        }
    },

    async updateNutritionLog(logId: string, updates: Partial<NutritionLog>): Promise<void> {
        try {
            const docRef = doc(db, 'nutritionLogs', logId);
            await setDoc(docRef, {
                ...updates,
                updatedAt: new Date()
            }, { merge: true });
        } catch (error) {
            console.error('Error updating nutrition log:', error);
            throw error;
        }
    },

    async updateNutritionProgress(data: {
        userId: string;
        date: Date;
        planned: NutritionInfo;
        actual: NutritionInfo;
        waterIntake: {
            planned: number;
            actual: number;
        };
        adherenceRate: number;
    }): Promise<void> {
        try {
            const docRef = doc(db, 'nutritionProgress', `${data.userId}_${data.date.toISOString().split('T')[0]}`);
            await setDoc(docRef, {
                ...data,
                updatedAt: new Date()
            }, { merge: true });
        } catch (error) {
            console.error('Error updating nutrition progress:', error);
            throw error;
        }
    },

    async searchRecipes(params: {
        searchTerm?: string;
        dietaryRestrictions?: string[];
        maxPrepTime?: number;
        maxCalories?: number;
    }): Promise<Meal[]> {
        try {
            // Get all meals from recommendations
            const allMeals = Object.values(MEAL_RECOMMENDATIONS).flatMap(mealType => [
                ...mealType.breakfast,
                ...mealType.lunch,
                ...mealType.dinner
            ]);

            let filteredMeals = allMeals;

            if (params.searchTerm) {
                const searchLower = params.searchTerm.toLowerCase();
                filteredMeals = filteredMeals.filter(meal =>
                    meal.name.toLowerCase().includes(searchLower) ||
                    meal.recipe.some(step => step.toLowerCase().includes(searchLower)) ||
                    meal.ingredients.some((ing: string) => ing.toLowerCase().includes(searchLower))
                );
            }

            if (params.maxCalories) {
                filteredMeals = filteredMeals.filter(meal => meal.nutritionInfo.calories <= params.maxCalories!);
            }

            if (params.maxPrepTime) {
                filteredMeals = filteredMeals.filter(meal => meal.preparationTime <= params.maxPrepTime!);
            }

            // Sort by name for consistent results
            return filteredMeals.sort((a, b) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error('Error searching recipes:', error);
            throw error;
        }
    }
}; 