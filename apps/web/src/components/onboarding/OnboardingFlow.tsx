import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@dreamme/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/auth';
import { exerciseService } from '../../services/exerciseService';
import { nutritionService } from '../../services/nutritionService';

interface FitnessGoals {
    primaryGoal: string;
    weeklyWorkouts: number;
    dietaryRestrictions: string[];
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
    height?: number | null;
    weight?: number | null;
    age?: number | null;
    gender?: string | null;
}

const GOALS = [
    { id: 'weight-loss', label: 'Weight Loss', icon: '⚖️' },
    { id: 'muscle-gain', label: 'Build Muscle', icon: '💪' },
    { id: 'endurance', label: 'Improve Endurance', icon: '🏃‍♂️' },
    { id: 'flexibility', label: 'Increase Flexibility', icon: '🧘‍♀️' },
    { id: 'strength', label: 'Gain Strength', icon: '🏋️‍♂️' },
    { id: 'general', label: 'Overall Fitness', icon: '🎯' },
];

const DIETARY_RESTRICTIONS = [
    { id: 'none', label: 'None' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'gluten-free', label: 'Gluten Free' },
    { id: 'dairy-free', label: 'Dairy Free' },
    { id: 'keto', label: 'Keto' },
];

export function OnboardingFlow() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [goals, setGoals] = useState<FitnessGoals>({
        primaryGoal: '',
        weeklyWorkouts: 3,
        dietaryRestrictions: [],
        fitnessLevel: 'beginner',
        height: null,
        weight: null,
        age: null,
        gender: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleComplete = async () => {
        if (!user) {
            setError('No user found. Please try logging out and back in.');
            return;
        }

        // Validate required fields
        if (!goals.primaryGoal) {
            setError('Please select a primary goal');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('Starting onboarding completion with user:', user.uid);

            // Clean up the goals object by removing null/undefined values
            const cleanGoals = Object.fromEntries(
                Object.entries(goals).filter(([_, value]) => value != null)
            );

            // Calculate daily calorie target
            const calorieTarget = calculateCalorieTarget(goals);

            // 1. First, create the user profile
            await setDoc(doc(db, 'profiles', user.uid), {
                ...cleanGoals,
                userId: user.uid,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log('Profile saved successfully');

            // 2. Then create nutrition goals
            await setDoc(doc(db, 'nutritionGoals', user.uid), {
                id: user.uid,
                userId: user.uid,
                dailyCalories: calorieTarget,
                macros: {
                    protein: goals.primaryGoal === 'muscle-gain' ? Math.round(calorieTarget * 0.3 / 4) : Math.round(calorieTarget * 0.25 / 4),
                    carbs: goals.primaryGoal === 'weight-loss' ? Math.round(calorieTarget * 0.4 / 4) : Math.round(calorieTarget * 0.5 / 4),
                    fat: Math.round(calorieTarget * 0.25 / 9)
                },
                dietaryRestrictions: goals.dietaryRestrictions,
                preferences: {
                    cuisineTypes: [],
                    excludedIngredients: [],
                    mealSize: 'medium'
                },
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log('Nutrition goals saved successfully');

            // 3. Initialize progress tracking
            await setDoc(doc(db, 'progress', user.uid), {
                userId: user.uid,
                workouts: {
                    completed: 0,
                    goal: goals.weeklyWorkouts,
                    streak: 0,
                },
                nutrition: {
                    mealsLogged: 0,
                    calorieGoal: calorieTarget,
                    currentCalories: 0,
                },
                mental: {
                    moodScore: 0,
                    journalStreak: 0,
                    breathingMinutes: 0,
                },
                social: {
                    followers: 0,
                    following: 0,
                    achievements: 0,
                },
                lastUpdated: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log('Progress tracking initialized successfully');

            // 4. Generate initial workout plan
            await exerciseService.generateDailyWorkout(user.uid, goals.primaryGoal);
            console.log('Workout plan generated successfully');

            // 5. Finally, generate initial meal plan
            const mealPlan = await nutritionService.generateDailyMealPlan(user.uid);
            console.log('Meal plan generated successfully:', mealPlan);

            // Navigate to dashboard
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Error during onboarding:', error);
            // More descriptive error message based on the error type
            if (error.code === 'permission-denied') {
                setError('Permission denied. Please try logging out and back in.');
            } else if (error.code === 'invalid-argument') {
                setError('Invalid data provided. Please check all fields and try again.');
            } else {
                setError('Failed to complete setup. Please try again. Error: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper function to calculate calorie target based on user data
    const calculateCalorieTarget = (goals: FitnessGoals) => {
        // Basic BMR calculation using Harris-Benedict equation
        let bmr = 0;

        if (goals.weight && goals.height && goals.age) {
            if (goals.gender === 'male') {
                bmr = 88.362 + (13.397 * goals.weight) + (4.799 * goals.height) - (5.677 * goals.age);
            } else {
                bmr = 447.593 + (9.247 * goals.weight) + (3.098 * goals.height) - (4.330 * goals.age);
            }
        } else {
            // Default calorie targets if no data provided
            return goals.primaryGoal === 'weight-loss' ? 1800 : 2200;
        }

        // Adjust based on activity level and goal
        const activityMultiplier = goals.weeklyWorkouts <= 2 ? 1.2 : goals.weeklyWorkouts <= 4 ? 1.375 : 1.55;
        let calories = bmr * activityMultiplier;

        // Adjust based on primary goal
        switch (goals.primaryGoal) {
            case 'weight-loss':
                calories *= 0.85; // 15% deficit
                break;
            case 'muscle-gain':
                calories *= 1.15; // 15% surplus
                break;
            default:
                // Maintain for other goals
                break;
        }

        return Math.round(calories);
    };

    const steps = [
        // Step 1: Primary Goal
        <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">What's your primary fitness goal?</h2>
                <p className="text-white/80">Choose the main focus of your fitness journey</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {GOALS.map(goal => (
                    <Button
                        key={goal.id}
                        onClick={() => {
                            setGoals(prev => ({ ...prev, primaryGoal: goal.id }));
                            setStep(1);
                        }}
                        variant={goals.primaryGoal === goal.id ? 'primary' : 'outline'}
                        className="h-24 text-lg"
                    >
                        <span className="text-2xl mb-2">{goal.icon}</span>
                        {goal.label}
                    </Button>
                ))}
            </div>
        </motion.div>,

        // Step 2: Weekly Workouts
        <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">How many times a week can you work out?</h2>
                <p className="text-white/80">Be realistic - consistency is key!</p>
            </div>
            <div className="flex justify-center space-x-4">
                {[2, 3, 4, 5, 6].map(num => (
                    <Button
                        key={num}
                        onClick={() => {
                            setGoals(prev => ({ ...prev, weeklyWorkouts: num }));
                            setStep(2);
                        }}
                        variant={goals.weeklyWorkouts === num ? 'primary' : 'outline'}
                        className="w-16 h-16 text-xl"
                    >
                        {num}
                    </Button>
                ))}
            </div>
        </motion.div>,

        // Step 3: Fitness Level
        <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">What's your current fitness level?</h2>
                <p className="text-white/80">This helps us tailor the difficulty of your workouts</p>
            </div>
            <div className="flex justify-center space-x-4">
                {['beginner', 'intermediate', 'advanced'].map(level => (
                    <Button
                        key={level}
                        onClick={() => {
                            setGoals(prev => ({ ...prev, fitnessLevel: level as any }));
                            setStep(3);
                        }}
                        variant={goals.fitnessLevel === level ? 'primary' : 'outline'}
                        className="px-6 py-3"
                    >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                ))}
            </div>
        </motion.div>,

        // Step 4: Dietary Restrictions
        <motion.div
            key="step-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white">Any dietary restrictions?</h2>
                <p className="text-white/80">Select all that apply to customize your meal plans</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {DIETARY_RESTRICTIONS.map(diet => (
                    <Button
                        key={diet.id}
                        onClick={() => {
                            setGoals(prev => ({
                                ...prev,
                                dietaryRestrictions: prev.dietaryRestrictions.includes(diet.id)
                                    ? prev.dietaryRestrictions.filter(d => d !== diet.id)
                                    : [...prev.dietaryRestrictions, diet.id]
                            }));
                        }}
                        variant={goals.dietaryRestrictions.includes(diet.id) ? 'primary' : 'outline'}
                        className="py-3"
                    >
                        {diet.label}
                    </Button>
                ))}
            </div>
            <div className="flex justify-center mt-8">
                <Button
                    onClick={handleComplete}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500"
                >
                    {loading ? 'Setting up your profile...' : 'Complete Setup'}
                </Button>
            </div>
        </motion.div>,
    ];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}
            <div className="w-full max-w-2xl backdrop-blur-lg bg-white/10 rounded-2xl p-8">
                {/* Progress bar */}
                <div className="mb-12">
                    <div className="h-2 bg-white/10 rounded-full">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step content */}
                <AnimatePresence mode="wait">
                    {steps[step]}
                </AnimatePresence>

                {/* Navigation */}
                {step > 0 && (
                    <div className="mt-8 flex justify-center">
                        <Button
                            variant="outline"
                            onClick={() => setStep(step - 1)}
                            className="text-white border-white/20 hover:bg-white/20"
                        >
                            Back
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
} 