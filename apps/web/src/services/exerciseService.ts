import { db } from '../lib/firebase';
import { collection, doc, getDoc, setDoc, query, where, getDocs, updateDoc, orderBy, limit as limitQuery } from 'firebase/firestore';

export interface Exercise {
    id: string;
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    muscleGroups: string[];
    equipment: string[];
    instructions: string[];
    imageUrl?: string;
    videoUrl?: string;
}

export interface WorkoutLog {
    id: string;
    userId: string;
    date: string;
    exercises: {
        exerciseId: string;
        sets: number;
        reps: number;
        weight?: number;
        duration?: number;
    }[];
}

export interface DailyWorkout {
    id: string;
    userId: string;
    date: Date;
    exercises: {
        exerciseId: string;
        name: string;
        description: string;
        duration: number;
        sets?: number;
        reps?: number;
        completed: boolean;
    }[];
    completed: boolean;
}

export const EXERCISE_RECOMMENDATIONS = {
    beginner: {
        strength: [
            {
                name: "Push-ups",
                sets: 3,
                reps: 10,
                restTime: 60
            },
            {
                name: "Bodyweight Squats",
                sets: 3,
                reps: 15,
                restTime: 60
            }
        ],
        cardio: [
            {
                name: "Walking",
                duration: 30,
                intensity: "moderate"
            },
            {
                name: "Light Jogging",
                duration: 20,
                intensity: "moderate"
            }
        ]
    },
    intermediate: {
        strength: [
            {
                name: "Dumbbell Bench Press",
                sets: 4,
                reps: 12,
                restTime: 90
            },
            {
                name: "Barbell Squats",
                sets: 4,
                reps: 10,
                restTime: 120
            }
        ],
        cardio: [
            {
                name: "Running",
                duration: 30,
                intensity: "high"
            },
            {
                name: "HIIT",
                duration: 20,
                intensity: "very high"
            }
        ]
    },
    advanced: {
        strength: [
            {
                name: "Deadlifts",
                sets: 5,
                reps: 5,
                restTime: 180
            },
            {
                name: "Power Cleans",
                sets: 5,
                reps: 3,
                restTime: 180
            }
        ],
        cardio: [
            {
                name: "Sprint Intervals",
                duration: 30,
                intensity: "maximum"
            },
            {
                name: "CrossFit WOD",
                duration: 20,
                intensity: "very high"
            }
        ]
    }
};

class ExerciseService {
    async getExercise(exerciseId: string): Promise<Exercise | null> {
        try {
            const exerciseDoc = await getDoc(doc(db, 'exercises', exerciseId));
            return exerciseDoc.exists() ? exerciseDoc.data() as Exercise : null;
        } catch (error) {
            console.error('Error fetching exercise:', error);
            return null;
        }
    }

    async getExercisesByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
        try {
            const exercisesQuery = query(
                collection(db, 'exercises'),
                where('muscleGroups', 'array-contains', muscleGroup)
            );
            const snapshot = await getDocs(exercisesQuery);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
        } catch (error) {
            console.error('Error fetching exercises by muscle group:', error);
            return [];
        }
    }

    async logWorkout(userId: string, workoutData: Omit<WorkoutLog, 'id'>): Promise<string> {
        try {
            const workoutId = `${userId}_${new Date().toISOString()}`;
            await setDoc(doc(db, 'workoutLogs', workoutId), {
                ...workoutData,
                id: workoutId,
                createdAt: new Date()
            });
            return workoutId;
        } catch (error) {
            console.error('Error logging workout:', error);
            throw error;
        }
    }

    async getWorkoutHistory(userId: string, startDate: Date, endDate: Date): Promise<WorkoutLog[]> {
        try {
            const logsQuery = query(
                collection(db, 'workoutLogs'),
                where('userId', '==', userId),
                where('date', '>=', startDate.toISOString().split('T')[0]),
                where('date', '<=', endDate.toISOString().split('T')[0])
            );
            const snapshot = await getDocs(logsQuery);
            return snapshot.docs.map(doc => doc.data() as WorkoutLog);
        } catch (error) {
            console.error('Error fetching workout history:', error);
            return [];
        }
    }

    async getDailyWorkout(userId: string): Promise<DailyWorkout | null> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const workoutId = `${userId}_${today.toISOString().split('T')[0]}`;
            const workoutDoc = await getDoc(doc(db, 'dailyWorkouts', workoutId));
            return workoutDoc.exists() ? workoutDoc.data() as DailyWorkout : null;
        } catch (error) {
            console.error('Error fetching daily workout:', error);
            return null;
        }
    }

    async generateDailyWorkout(userId: string, goal: string): Promise<DailyWorkout> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const workoutId = `${userId}_${today.toISOString().split('T')[0]}`;

            const workout: DailyWorkout = {
                id: workoutId,
                userId,
                date: today,
                exercises: [
                    {
                        exerciseId: 'pushups',
                        name: 'Push-ups',
                        description: 'Basic push-ups',
                        duration: 10,
                        sets: 3,
                        reps: 10,
                        completed: false
                    },
                    {
                        exerciseId: 'squats',
                        name: 'Bodyweight Squats',
                        description: 'Basic squats',
                        duration: 10,
                        sets: 3,
                        reps: 15,
                        completed: false
                    }
                ],
                completed: false
            };

            await setDoc(doc(db, 'dailyWorkouts', workoutId), workout);
            return workout;
        } catch (error) {
            console.error('Error generating daily workout:', error);
            throw error;
        }
    }

    async markExerciseComplete(userId: string, exerciseId: string): Promise<void> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const workoutId = `${userId}_${today.toISOString().split('T')[0]}`;
            const workoutDoc = await getDoc(doc(db, 'dailyWorkouts', workoutId));

            if (!workoutDoc.exists()) {
                throw new Error('Workout not found');
            }

            const workout = workoutDoc.data() as DailyWorkout;
            const exerciseIndex = workout.exercises.findIndex((e, i) => i.toString() === exerciseId);

            if (exerciseIndex === -1) {
                throw new Error('Exercise not found');
            }

            const updatedExercises = [...workout.exercises];
            updatedExercises[exerciseIndex] = {
                ...updatedExercises[exerciseIndex],
                completed: true
            };

            const allCompleted = updatedExercises.every(e => e.completed);

            await updateDoc(doc(db, 'dailyWorkouts', workoutId), {
                exercises: updatedExercises,
                completed: allCompleted,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error marking exercise complete:', error);
            throw error;
        }
    }

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
                        count: workoutDoc.exists() ? workoutDoc.data().exercises.filter((e: any) => e.completed).length : 0
                    };
                })
            );

            return workouts;
        } catch (error) {
            console.error('Error getting weekly workouts:', error);
            throw error;
        }
    }

    async getMonthlyStats(userId: string): Promise<{
        totalWorkouts: number;
        totalMinutes: number;
        averageRating: number;
        streak: number;
    }> {
        try {
            const today = new Date();
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

            const workoutLogs = await getDocs(
                query(
                    collection(db, 'workoutLogs'),
                    where('userId', '==', userId),
                    where('date', '>=', monthStart.toISOString().split('T')[0]),
                    where('date', '<=', today.toISOString().split('T')[0])
                )
            );

            let totalWorkouts = 0;
            let totalMinutes = 0;
            let totalRating = 0;
            let ratingCount = 0;

            workoutLogs.forEach(doc => {
                const data = doc.data();
                totalWorkouts++;
                totalMinutes += data.duration || 0;
                if (data.rating) {
                    totalRating += data.rating;
                    ratingCount++;
                }
            });

            return {
                totalWorkouts,
                totalMinutes,
                averageRating: ratingCount > 0 ? totalRating / ratingCount : 0,
                streak: 0 // TODO: Implement streak calculation
            };
        } catch (error) {
            console.error('Error getting monthly stats:', error);
            throw error;
        }
    }

    async getRecentPBs(userId: string): Promise<{ exercise: string; value: string; date: string }[]> {
        try {
            const workoutLogs = await getDocs(
                query(
                    collection(db, 'workoutLogs'),
                    where('userId', '==', userId),
                    orderBy('date', 'desc'),
                    limitQuery(10)
                )
            );

            const pbs: { [key: string]: { value: string; date: string } } = {};

            workoutLogs.forEach(doc => {
                const data = doc.data();
                if (data.exercises) {
                    data.exercises.forEach((exercise: any) => {
                        if (exercise.weight && exercise.reps) {
                            const key = exercise.exerciseId;
                            if (!pbs[key] || parseInt(pbs[key].value) < exercise.weight) {
                                pbs[key] = {
                                    value: `${exercise.weight}kg × ${exercise.reps}`,
                                    date: data.date
                                };
                            }
                        }
                    });
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
    }

    async getPopularExercises(userId: string): Promise<{ name: string; count: number }[]> {
        try {
            const workoutLogs = await getDocs(
                query(
                    collection(db, 'workoutLogs'),
                    where('userId', '==', userId),
                    orderBy('date', 'desc'),
                    limitQuery(50)
                )
            );

            const exerciseCounts: { [key: string]: number } = {};

            workoutLogs.forEach(doc => {
                const data = doc.data();
                if (data.exercises) {
                    data.exercises.forEach((exercise: any) => {
                        exerciseCounts[exercise.exerciseId] = (exerciseCounts[exercise.exerciseId] || 0) + 1;
                    });
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
    }

    async createExercise(exerciseData: Omit<Exercise, 'id'>): Promise<string> {
        try {
            const exerciseRef = doc(collection(db, 'exercises'));
            await setDoc(exerciseRef, {
                ...exerciseData,
                id: exerciseRef.id,
                createdAt: new Date()
            });
            return exerciseRef.id;
        } catch (error) {
            console.error('Error creating exercise:', error);
            throw error;
        }
    }

    async updateExercise(exerciseId: string, updates: Partial<Exercise>): Promise<void> {
        try {
            await updateDoc(doc(db, 'exercises', exerciseId), {
                ...updates,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating exercise:', error);
            throw error;
        }
    }
}

export const exerciseService = new ExerciseService(); 