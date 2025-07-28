import { doc, getDoc, setDoc, updateDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Exercise, DailyExercise, DailyWorkout, WorkoutLog, WorkoutSet } from '../types/exercise';

// Exercise recommendations based on goals and fitness levels
export const EXERCISE_RECOMMENDATIONS: Record<string, Record<string, Exercise[]>> = {
    'weight-loss': {
        beginner: [
            {
                name: 'HIIT Cardio',
                type: 'Cardio',
                duration: '20 mins',
                videoUrl: 'https://www.youtube.com/watch?v=ml6cT4AZdqI',
                description: 'High-intensity interval training for maximum calorie burn',
                muscleGroups: ['fullBody'],
                equipment: ['bodyweight'],
                difficulty: 'beginner',
                instructions: ['Warm up for 3-5 minutes', 'Perform each exercise for 30 seconds', 'Rest for 10 seconds between exercises'],
                tips: ['Focus on form', 'Take breaks if needed', 'Stay hydrated'],
                youtubeVideoId: 'ml6cT4AZdqI',
                estimatedDuration: 20,
                caloriesBurnedPerMinute: 12,
                completed: false
            },
            {
                name: 'Fat Burning Cardio',
                type: 'Cardio',
                duration: '30 mins',
                videoUrl: 'https://www.youtube.com/watch?v=gC_L9qAHVJ8',
                description: 'Low-impact cardio workout for fat loss',
                muscleGroups: ['fullBody'],
                equipment: ['bodyweight'],
                difficulty: 'beginner',
                instructions: ['Start with a light warm-up', 'Follow along with the video', 'Cool down properly'],
                tips: ['Keep moving', 'Modify as needed', 'Focus on breathing'],
                youtubeVideoId: 'gC_L9qAHVJ8',
                estimatedDuration: 30,
                caloriesBurnedPerMinute: 8,
                completed: false
            }
        ],
        intermediate: [
            {
                name: 'Running Intervals',
                type: 'Cardio',
                duration: '30 mins',
                videoUrl: 'https://www.youtube.com/watch?v=nK0RZCcqzM8',
                description: 'Alternating between running and jogging',
                muscleGroups: ['legs', 'core'],
                equipment: ['bodyweight'],
                difficulty: 'intermediate',
                instructions: ['Warm up with light jog', 'Sprint for 1 minute', 'Jog for 2 minutes', 'Repeat'],
                tips: ['Keep proper form', 'Listen to your body', 'Stay hydrated'],
                youtubeVideoId: 'nK0RZCcqzM8',
                estimatedDuration: 30,
                caloriesBurnedPerMinute: 12,
                completed: false
            },
            {
                name: 'Advanced HIIT',
                type: 'HIIT',
                duration: '25 mins',
                videoUrl: 'https://www.youtube.com/watch?v=ml6cT4AZdqI',
                description: 'High-intensity interval training with complex movements',
                muscleGroups: ['fullBody'],
                equipment: ['bodyweight'],
                difficulty: 'intermediate',
                instructions: ['Warm up with 5-minute jog', 'High-intensity 20 seconds, rest 10 seconds', 'Repeat 10 times'],
                tips: ['Go all out during work periods', 'Rest completely during breaks', 'Keep good form'],
                youtubeVideoId: 'ml6cT4AZdqI',
                estimatedDuration: 25,
                caloriesBurnedPerMinute: 10,
                completed: false
            }
        ],
        advanced: [
            {
                name: 'Tabata Workouts',
                type: 'HIIT',
                duration: '30 mins',
                videoUrl: 'https://www.youtube.com/watch?v=XIeCMhNWFQQ',
                description: 'High-intensity 20/10 intervals',
                muscleGroups: ['fullBody'],
                equipment: ['bodyweight'],
                difficulty: 'advanced',
                instructions: ['20 seconds high intensity', '10 seconds rest', 'Repeat 8 times'],
                tips: ['Go all out during work periods', 'Rest completely during breaks', 'Keep good form'],
                youtubeVideoId: 'XIeCMhNWFQQ',
                estimatedDuration: 30,
                caloriesBurnedPerMinute: 15,
                completed: false
            }
        ]
    },
    'muscle-gain': {
        beginner: [
            {
                name: 'Full Body Strength',
                type: 'Strength',
                duration: '45 mins',
                videoUrl: 'https://www.youtube.com/watch?v=eMjyvIQbn9M',
                description: 'Complete full body strength workout for beginners',
                muscleGroups: ['fullBody'],
                equipment: ['dumbbell'],
                difficulty: 'beginner',
                instructions: ['Warm up properly', 'Follow proper form', 'Rest between sets'],
                tips: ['Start light', 'Focus on form', 'Progressive overload'],
                youtubeVideoId: 'eMjyvIQbn9M',
                estimatedDuration: 45,
                caloriesBurnedPerMinute: 6,
                completed: false
            },
            {
                name: 'Upper Body Build',
                type: 'Strength',
                duration: '40 mins',
                videoUrl: 'https://www.youtube.com/watch?v=Dd6tB13CBAk',
                description: 'Upper body strength training for muscle gain',
                muscleGroups: ['chest', 'back', 'shoulders', 'arms'],
                equipment: ['dumbbell'],
                difficulty: 'beginner',
                instructions: ['Warm up shoulders and arms', 'Follow video progression', 'Cool down stretch'],
                tips: ['Control the weight', 'Feel the muscle', 'Rest adequately'],
                youtubeVideoId: 'Dd6tB13CBAk',
                estimatedDuration: 40,
                caloriesBurnedPerMinute: 5,
                completed: false
            }
        ],
        intermediate: [
            {
                name: 'Compound Lifts',
                type: 'Strength',
                duration: '60 mins',
                videoUrl: 'https://www.youtube.com/watch?v=U4BS9EXvfyg',
                description: 'Basic compound movements for muscle growth',
                muscleGroups: ['fullBody'],
                equipment: ['barbell', 'dumbbell'],
                difficulty: 'intermediate',
                instructions: ['Warm up properly', 'Focus on form', 'Progressive overload'],
                tips: ['Start light', 'Increase weight gradually', 'Rest between sets'],
                youtubeVideoId: 'U4BS9EXvfyg',
                estimatedDuration: 60,
                caloriesBurnedPerMinute: 7,
                completed: false
            }
        ],
        advanced: [
            {
                name: 'Advanced Hypertrophy',
                type: 'Strength',
                duration: '75 mins',
                videoUrl: 'https://www.youtube.com/watch?v=5JmWguyvu7Y',
                description: 'Complex training for muscle growth',
                muscleGroups: ['fullBody'],
                equipment: ['barbell', 'dumbbell', 'cable', 'machine'],
                difficulty: 'advanced',
                instructions: ['Warm up thoroughly', 'Perform supersets', 'Focus on time under tension'],
                tips: ['Control the weight', 'Feel the muscle working', 'Rest adequately'],
                youtubeVideoId: '5JmWguyvu7Y',
                estimatedDuration: 75,
                caloriesBurnedPerMinute: 8,
                completed: false
            }
        ]
    },
    'endurance': {
        beginner: [
            {
                name: 'Basic Endurance',
                type: 'Cardio',
                duration: '30 mins',
                videoUrl: 'https://www.youtube.com/watch?v=gC_L9qAHVJ8',
                description: 'Building basic cardiovascular endurance',
                muscleGroups: ['fullBody'],
                equipment: ['bodyweight'],
                difficulty: 'beginner',
                instructions: ['Warm up with 5-minute jog', 'Run for 30 minutes at a steady pace', 'Cool down with 5-minute walk'],
                tips: ['Start slow and steady', 'Listen to your body', 'Stay hydrated'],
                youtubeVideoId: 'gC_L9qAHVJ8',
                estimatedDuration: 30,
                caloriesBurnedPerMinute: 8,
                completed: false
            }
        ],
        intermediate: [
            {
                name: 'Mixed Cardio',
                type: 'Cardio',
                duration: '45 mins',
                videoUrl: 'https://www.youtube.com/watch?v=DHOPWvO3ZcI',
                description: 'Varied cardio exercises for endurance',
                muscleGroups: ['fullBody'],
                equipment: ['bodyweight'],
                difficulty: 'intermediate',
                instructions: ['Warm up with 5-minute jog', 'Run for 45 minutes at a steady pace', 'Cool down with 5-minute walk'],
                tips: ['Start slow and steady', 'Listen to your body', 'Stay hydrated'],
                youtubeVideoId: 'DHOPWvO3ZcI',
                estimatedDuration: 45,
                caloriesBurnedPerMinute: 10,
                completed: false
            }
        ],
        advanced: [
            {
                name: 'Advanced Endurance',
                type: 'Cardio',
                duration: '60 mins',
                videoUrl: 'https://www.youtube.com/watch?v=Ks-lKvKQ8f4',
                description: 'High-level endurance training',
                muscleGroups: ['fullBody'],
                equipment: ['bodyweight'],
                difficulty: 'advanced',
                instructions: ['Warm up with 5-minute jog', 'Run for 60 minutes at a steady pace', 'Cool down with 5-minute walk'],
                tips: ['Start slow and steady', 'Listen to your body', 'Stay hydrated'],
                youtubeVideoId: 'Ks-lKvKQ8f4',
                estimatedDuration: 60,
                caloriesBurnedPerMinute: 12,
                completed: false
            }
        ]
    },
    'flexibility': {
        beginner: [
            {
                name: 'Full Body Stretch',
                type: 'Flexibility',
                duration: '30 mins',
                videoUrl: 'https://www.youtube.com/watch?v=g_tea8ZNk5A',
                description: 'Complete full body flexibility routine',
                muscleGroups: ['fullBody'],
                equipment: ['bodyweight'],
                difficulty: 'beginner',
                instructions: ['Start with light movement', 'Hold each stretch 30 seconds', 'Breathe deeply'],
                tips: ['Don\'t bounce', 'Feel the stretch', 'Stay relaxed'],
                youtubeVideoId: 'g_tea8ZNk5A',
                estimatedDuration: 30,
                caloriesBurnedPerMinute: 3,
                completed: false
            }
        ],
        intermediate: [
            {
                name: 'Yoga Flow',
                type: 'Flexibility',
                duration: '30 mins',
                videoUrl: 'https://www.youtube.com/watch?v=v7AYKMP6rOE',
                description: 'Intermediate yoga sequence',
                muscleGroups: ['fullBody'],
                equipment: ['bodyweight'],
                difficulty: 'intermediate',
                instructions: ['Warm up with 5-minute jog', 'Perform 30 minutes of yoga flow', 'Cool down with 5-minute walk'],
                tips: ['Focus on breath', 'Listen to your body', 'Stay present'],
                youtubeVideoId: 'v7AYKMP6rOE',
                estimatedDuration: 30,
                caloriesBurnedPerMinute: 6,
                completed: false
            }
        ],
        advanced: [
            {
                name: 'Advanced Flexibility',
                type: 'Flexibility',
                duration: '45 mins',
                videoUrl: 'https://www.youtube.com/watch?v=GLy2rYHwUqY',
                description: 'Advanced stretching and mobility work',
                muscleGroups: ['fullBody'],
                equipment: ['bodyweight'],
                difficulty: 'advanced',
                instructions: ['Warm up with 5-minute jog', 'Perform 45 minutes of mobility work', 'Cool down with 5-minute walk'],
                tips: ['Focus on deep tissue', 'Listen to your body', 'Stay present'],
                youtubeVideoId: 'GLy2rYHwUqY',
                estimatedDuration: 45,
                caloriesBurnedPerMinute: 7,
                completed: false
            }
        ]
    },
    'strength': {
        beginner: [
            {
                name: 'Bodyweight Strength',
                type: 'Strength',
                duration: '30 mins',
                videoUrl: 'https://www.youtube.com/watch?v=D7KaRcUTQeE',
                description: 'Basic strength training with bodyweight',
                muscleGroups: ['fullBody'],
                equipment: ['bodyweight'],
                difficulty: 'beginner',
                instructions: ['Warm up with 5-minute jog', 'Perform 30 minutes of bodyweight exercises', 'Cool down with 5-minute walk'],
                tips: ['Focus on form', 'Listen to your body', 'Stay hydrated'],
                youtubeVideoId: 'D7KaRcUTQeE',
                estimatedDuration: 30,
                caloriesBurnedPerMinute: 5,
                completed: false
            }
        ],
        intermediate: [
            {
                name: 'Strength Fundamentals',
                type: 'Strength',
                duration: '45 mins',
                videoUrl: 'https://www.youtube.com/watch?v=YaXPRqUwItQ',
                description: 'Core strength training exercises',
                muscleGroups: ['core'],
                equipment: ['bodyweight'],
                difficulty: 'intermediate',
                instructions: ['Warm up with 5-minute jog', 'Perform 45 minutes of core exercises', 'Cool down with 5-minute walk'],
                tips: ['Focus on form', 'Listen to your body', 'Stay hydrated'],
                youtubeVideoId: 'YaXPRqUwItQ',
                estimatedDuration: 45,
                caloriesBurnedPerMinute: 6,
                completed: false
            }
        ],
        advanced: [
            {
                name: 'Power Training',
                type: 'Strength',
                duration: '60 mins',
                videoUrl: 'https://www.youtube.com/watch?v=2pLT-olgUJs',
                description: 'Advanced strength and power training',
                muscleGroups: ['fullBody'],
                equipment: ['bodyweight'],
                difficulty: 'advanced',
                instructions: ['Warm up with 5-minute jog', 'Perform 60 minutes of power training', 'Cool down with 5-minute walk'],
                tips: ['Focus on explosive movements', 'Listen to your body', 'Stay hydrated'],
                youtubeVideoId: '2pLT-olgUJs',
                estimatedDuration: 60,
                caloriesBurnedPerMinute: 8,
                completed: false
            }
        ]
    },
    'general': {
        beginner: [
            {
                name: 'Full Body Basics',
                type: 'General Fitness',
                duration: '30 mins',
                videoUrl: 'https://www.youtube.com/watch?v=UBMk30rjy0o',
                description: 'Basic full body workout',
                muscleGroups: ['fullBody'],
                equipment: ['bodyweight'],
                difficulty: 'beginner',
                instructions: ['Warm up with 5-minute jog', 'Perform 30 minutes of varied exercises', 'Cool down with 5-minute walk'],
                tips: ['Focus on form', 'Listen to your body', 'Stay hydrated'],
                youtubeVideoId: 'UBMk30rjy0o',
                estimatedDuration: 30,
                caloriesBurnedPerMinute: 7,
                completed: false
            }
        ],
        intermediate: [
            {
                name: 'Mixed Training',
                type: 'General Fitness',
                duration: '45 mins',
                videoUrl: 'https://www.youtube.com/watch?v=5SwN0FN6PJE',
                description: 'Balanced workout combining strength and cardio',
                muscleGroups: ['fullBody'],
                equipment: ['bodyweight'],
                difficulty: 'intermediate',
                instructions: ['Warm up with 5-minute jog', 'Perform 45 minutes of mixed training', 'Cool down with 5-minute walk'],
                tips: ['Focus on form', 'Listen to your body', 'Stay hydrated'],
                youtubeVideoId: '5SwN0FN6PJE',
                estimatedDuration: 45,
                caloriesBurnedPerMinute: 8,
                completed: false
            }
        ],
        advanced: [
            {
                name: 'Advanced Fitness',
                type: 'General Fitness',
                duration: '60 mins',
                videoUrl: 'https://www.youtube.com/watch?v=oAPCPjnU1wA',
                description: 'Comprehensive advanced workout',
                muscleGroups: ['fullBody'],
                equipment: ['bodyweight'],
                difficulty: 'advanced',
                instructions: ['Warm up with 5-minute jog', 'Perform 60 minutes of advanced training', 'Cool down with 5-minute walk'],
                tips: ['Focus on form', 'Listen to your body', 'Stay hydrated'],
                youtubeVideoId: 'oAPCPjnU1wA',
                estimatedDuration: 60,
                caloriesBurnedPerMinute: 9,
                completed: false
            }
        ]
    }
};

export const exerciseService = {
    async generateDailyWorkout(userId: string, goal: string): Promise<DailyWorkout> {
        try {
            console.log('Generating daily workout for goal:', goal);

            // Get user profile to check fitness level
            const profileDoc = await getDoc(doc(db, 'profiles', userId));
            const profile = profileDoc.data();
            const fitnessLevel = profile?.fitnessLevel || 'beginner';
            console.log('User fitness level:', fitnessLevel);

            // Get recommended exercises for the user's goal and fitness level
            let recommendations = EXERCISE_RECOMMENDATIONS[goal]?.[fitnessLevel];
            console.log('Found recommendations:', !!recommendations);

            if (!recommendations) {
                console.log('No recommendations found, using default beginner general workout');
                // Fallback to general beginner workout if no recommendations found
                recommendations = EXERCISE_RECOMMENDATIONS['general']['beginner'];
            }

            // Convert Exercise[] to DailyExercise[]
            const dailyExercises: DailyExercise[] = recommendations.map(exercise => {
                // Generate a unique ID for each exercise
                const exerciseId = doc(collection(db, 'exercises')).id;

                return {
                    exerciseId,
                    name: exercise.name,
                    description: exercise.description,
                    youtubeVideoId: exercise.youtubeVideoId,
                    thumbnailUrl: exercise.videoUrl,
                    demoImageUrl: exercise.videoUrl,
                    duration: exercise.estimatedDuration,
                    sets: exercise.sets || 3,
                    reps: exercise.reps || 12,
                    completed: false
                };
            });

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const workoutId = `${userId}_${today.toISOString().split('T')[0]}`;
            const workoutRef = doc(db, 'dailyWorkouts', workoutId);

            // Create daily workout plan
            const workout: Omit<DailyWorkout, 'id'> = {
                userId,
                date: today,
                exercises: dailyExercises,
                completed: false,
                fitnessGoal: goal,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            console.log('Saving new workout:', workout);
            // Save to Firestore and wait for it to complete
            await setDoc(workoutRef, workout);

            // Verify the workout was saved
            const savedWorkoutDoc = await getDoc(workoutRef);
            if (!savedWorkoutDoc.exists()) {
                throw new Error('Failed to save workout');
            }

            const savedWorkout = {
                ...workout,
                id: workoutRef.id
            };
            console.log('Successfully saved and verified workout:', savedWorkout);
            return savedWorkout;
        } catch (error) {
            console.error('Error generating daily workout:', error);
            throw error;
        }
    },

    async getDailyWorkout(userId: string): Promise<DailyWorkout> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const workoutId = `${userId}_${today.toISOString().split('T')[0]}`;
            const workoutRef = doc(db, 'dailyWorkouts', workoutId);

            console.log('Checking for existing workout:', workoutId);
            const workoutDoc = await getDoc(workoutRef);

            if (!workoutDoc.exists()) {
                console.log('No existing workout found, generating new workout');

                // Get user profile to check goal
                const profileRef = doc(db, 'profiles', userId);
                const profileDoc = await getDoc(profileRef);
                console.log('User profile data:', profileDoc.data());

                if (!profileDoc.exists()) {
                    console.log('No profile found, creating default profile');
                    // Create a default profile if none exists
                    const defaultProfile = {
                        displayName: 'User',
                        fitnessGoal: 'general',
                        fitnessLevel: 'beginner',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    await setDoc(profileRef, defaultProfile);
                    console.log('Created default profile');

                    // Generate workout with default settings
                    const workout = await this.generateDailyWorkout(userId, 'general');
                    console.log('Generated workout with default settings:', workout);
                    return workout;
                }

                const profile = profileDoc.data();
                const fitnessGoal = profile?.fitnessGoal || 'general';
                console.log('Generating workout with goal:', fitnessGoal);

                // Generate new workout if none exists
                const workout = await this.generateDailyWorkout(userId, fitnessGoal);
                console.log('Generated new workout:', workout);
                return workout;
            }

            console.log('Found existing workout');
            const data = workoutDoc.data();
            return {
                id: workoutDoc.id,
                userId: data.userId,
                date: data.date.toDate(),
                exercises: data.exercises,
                completed: data.completed,
                fitnessGoal: data.fitnessGoal,
                createdAt: data.createdAt.toDate(),
                updatedAt: data.updatedAt.toDate()
            };
        } catch (error) {
            console.error('Error getting daily workout:', error);
            throw error;
        }
    },

    async markExerciseComplete(userId: string, exerciseIndex: string): Promise<{ exercises: DailyExercise[]; completed: boolean }> {
        try {
            console.log('Marking exercise complete:', { userId, exerciseIndex });
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const workoutId = `${userId}_${today.toISOString().split('T')[0]}`;
            const workoutRef = doc(db, 'dailyWorkouts', workoutId);

            // First try to get the workout
            let workoutDoc = await getDoc(workoutRef);
            let retries = 0;
            const maxRetries = 3;

            // If workout doesn't exist, generate it first
            if (!workoutDoc.exists()) {
                console.log('No workout found, generating new workout');
                await this.getDailyWorkout(userId);

                // Wait and retry a few times to ensure the workout is saved
                while (!workoutDoc.exists() && retries < maxRetries) {
                    console.log(`Waiting for workout to be saved (attempt ${retries + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
                    workoutDoc = await getDoc(workoutRef);
                    retries++;
                }

                if (!workoutDoc.exists()) {
                    console.error('Failed to generate workout - workout document still does not exist after retries');
                    throw new Error('Failed to generate workout');
                }
            }

            const workout = workoutDoc.data() as DailyWorkout;
            console.log('Current workout state:', workout);

            const exercises = [...workout.exercises];
            const index = parseInt(exerciseIndex);

            if (index < 0 || index >= exercises.length) {
                console.error('Invalid exercise index:', { index, totalExercises: exercises.length });
                throw new Error('Invalid exercise index');
            }

            // Mark the exercise as completed
            exercises[index] = {
                ...exercises[index],
                completed: true
            };

            // Check if all exercises are completed
            const allCompleted = exercises.every(ex => ex.completed);
            console.log('Updating workout:', { exercises, allCompleted });

            // Update the workout document
            await updateDoc(workoutRef, {
                exercises,
                completed: allCompleted,
                updatedAt: new Date()
            });

            // Verify the update was successful
            const updatedDoc = await getDoc(workoutRef);
            if (!updatedDoc.exists()) {
                throw new Error('Workout document was deleted during update');
            }

            const updatedWorkout = updatedDoc.data() as DailyWorkout;
            if (!updatedWorkout.exercises[index].completed) {
                throw new Error('Exercise completion status was not updated');
            }

            return { exercises, completed: allCompleted };
        } catch (error) {
            console.error('Error marking exercise complete:', error);
            throw error;
        }
    },

    async updateExercise(exerciseId: string, exerciseData: Partial<Exercise>): Promise<void> {
        try {
            const exerciseRef = doc(db, 'exercises', exerciseId);
            await updateDoc(exerciseRef, {
                ...exerciseData,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating exercise:', error);
            throw error;
        }
    },

    async createExercise(exerciseData: Omit<Exercise, 'id'>): Promise<string> {
        try {
            const exerciseRef = doc(collection(db, 'exercises'));
            await setDoc(exerciseRef, {
                ...exerciseData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return exerciseRef.id;
        } catch (error) {
            console.error('Error creating exercise:', error);
            throw error;
        }
    },

    async logWorkout(userId: string, workoutLog: Omit<WorkoutLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Save workout log
            await setDoc(doc(db, 'workoutLogs', `${userId}_${today.toISOString().split('T')[0]}_${workoutLog.exerciseId}`), {
                ...workoutLog,
                userId,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // Update daily activity
            await setDoc(doc(db, 'dailyActivity', `${userId}_${today.toISOString().split('T')[0]}`), {
                exercise: true,
                lastUpdated: new Date()
            }, { merge: true });

            // Update progress
            const progressRef = doc(db, 'progress', userId);
            const progressDoc = await getDoc(progressRef);

            if (progressDoc.exists()) {
                const progress = progressDoc.data();
                await updateDoc(progressRef, {
                    'workouts.completed': (progress.workouts?.completed || 0) + 1,
                    updatedAt: new Date()
                });
            } else {
                await setDoc(progressRef, {
                    workouts: {
                        completed: 1,
                        goal: 5, // Default weekly goal
                        streak: 1
                    },
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        } catch (error) {
            console.error('Error logging workout:', error);
            throw error;
        }
    },

    async getWeeklyWorkouts(userId: string): Promise<{ date: string; count: number }[]> {
        try {
            const today = new Date();
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            weekStart.setHours(0, 0, 0, 0);

            const weekDates = Array.from({ length: 7 }, (_, i) => {
                const date = new Date(weekStart);
                date.setDate(date.getDate() + i);
                return date.toISOString().split('T')[0];
            });

            const workouts = await Promise.all(
                weekDates.map(async (date) => {
                    const workoutDoc = await getDoc(doc(db, 'dailyWorkouts', `${userId}_${date}`));
                    return {
                        date,
                        count: workoutDoc.exists() ? workoutDoc.data().exercises.filter((e: DailyExercise) => e.completed).length : 0
                    };
                })
            );

            return workouts;
        } catch (error) {
            console.error('Error getting weekly workouts:', error);
            throw error;
        }
    },

    async getMonthlyStats(userId: string): Promise<{
        totalWorkouts: number;
        totalMinutes: number;
        averageRating: number;
        streak: number;
    }> {
        try {
            const today = new Date();
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            // Get all workout logs for the month
            const workoutLogs = await Promise.all(
                Array.from({ length: monthEnd.getDate() }, (_, i) => {
                    const date = new Date(monthStart);
                    date.setDate(date.getDate() + i);
                    return getDoc(doc(db, 'dailyWorkouts', `${userId}_${date.toISOString().split('T')[0]}`));
                })
            );

            let totalWorkouts = 0;
            let totalMinutes = 0;
            let totalRating = 0;
            let ratingCount = 0;
            let currentStreak = 0;
            let maxStreak = 0;

            workoutLogs.forEach((doc) => {
                if (doc.exists()) {
                    const data = doc.data() as { exercises: DailyExercise[] };
                    const completedExercises = data.exercises.filter(e => e.completed);
                    if (completedExercises.length > 0) {
                        totalWorkouts += completedExercises.length;
                        totalMinutes += completedExercises.reduce((sum, e) => sum + (e.duration || 0), 0);
                        currentStreak++;
                        maxStreak = Math.max(maxStreak, currentStreak);
                    } else {
                        currentStreak = 0;
                    }
                } else {
                    currentStreak = 0;
                }
            });

            return {
                totalWorkouts,
                totalMinutes,
                averageRating: ratingCount > 0 ? totalRating / ratingCount : 0,
                streak: maxStreak
            };
        } catch (error) {
            console.error('Error getting monthly stats:', error);
            throw error;
        }
    },

    async getRecentPBs(userId: string): Promise<{
        exercise: string;
        value: string;
        date: string;
    }[]> {
        try {
            const today = new Date();
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

            // Get all workout logs for the month
            const workoutLogs = await Promise.all(
                Array.from({ length: today.getDate() }, (_, i) => {
                    const date = new Date(monthStart);
                    date.setDate(date.getDate() + i);
                    return getDoc(doc(db, 'workoutLogs', `${userId}_${date.toISOString().split('T')[0]}`));
                })
            );

            const pbs: { [key: string]: { value: string; date: string } } = {};

            workoutLogs.forEach((doc) => {
                if (doc.exists()) {
                    const data = doc.data() as { exerciseId: string; sets: WorkoutSet[]; createdAt: { toDate: () => Date } };
                    const maxWeight = Math.max(...data.sets.map(s => s.weight || 0));
                    const maxReps = Math.max(...data.sets.map(s => s.reps || 0));

                    if (maxWeight > 0 || maxReps > 0) {
                        pbs[data.exerciseId] = {
                            value: maxWeight > 0 ? `${maxWeight}kg x ${maxReps}` : `${maxReps} reps`,
                            date: data.createdAt.toDate().toISOString().split('T')[0]
                        };
                    }
                }
            });

            return Object.entries(pbs).map(([exercise, { value, date }]) => ({
                exercise,
                value,
                date
            }));
        } catch (error) {
            console.error('Error getting recent PBs:', error);
            throw error;
        }
    },

    async getPopularExercises(userId: string): Promise<{
        name: string;
        count: number;
    }[]> {
        try {
            const today = new Date();
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

            // Get all workout logs for the month
            const workoutLogs = await Promise.all(
                Array.from({ length: today.getDate() }, (_, i) => {
                    const date = new Date(monthStart);
                    date.setDate(date.getDate() + i);
                    return getDoc(doc(db, 'workoutLogs', `${userId}_${date.toISOString().split('T')[0]}`));
                })
            );

            const exerciseCounts: { [key: string]: number } = {};

            workoutLogs.forEach((doc) => {
                if (doc.exists()) {
                    const data = doc.data() as WorkoutLog;
                    exerciseCounts[data.exerciseId] = (exerciseCounts[data.exerciseId] || 0) + 1;
                }
            });

            return Object.entries(exerciseCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
        } catch (error) {
            console.error('Error getting popular exercises:', error);
            throw error;
        }
    },

    async getExerciseById(exerciseId: string): Promise<Exercise | null> {
        try {
            // First try to find in recommendations
            for (const goalExercises of Object.values(EXERCISE_RECOMMENDATIONS)) {
                for (const levelExercises of Object.values(goalExercises)) {
                    const exercise = levelExercises.find(e => e.id === exerciseId);
                    if (exercise) {
                        return exercise;
                    }
                }
            }

            // If not found in recommendations, try Firestore
            const exerciseDoc = await getDoc(doc(db, 'exercises', exerciseId));
            if (exerciseDoc.exists()) {
                return exerciseDoc.data() as Exercise;
            }

            return null;
        } catch (error) {
            console.error('Error getting exercise:', error);
            throw error;
        }
    }
}; 