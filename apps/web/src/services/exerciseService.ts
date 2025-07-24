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
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type {
    Exercise,
    WorkoutLog,
    ExerciseProgress,
    MuscleGroup,
    Equipment,
    ExerciseDifficulty,
} from '../types/exercise';

const EXERCISES_COLLECTION = 'exercises';
const WORKOUT_LOGS_COLLECTION = 'workoutLogs';
const EXERCISE_PROGRESS_COLLECTION = 'exerciseProgress';

export const exerciseService = {
    // Exercise CRUD operations
    async createExercise(data: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const now = new Date();
        const exerciseRef = await addDoc(collection(db, EXERCISES_COLLECTION), {
            ...data,
            createdAt: now,
            updatedAt: now,
        });
        return exerciseRef.id;
    },

    async getExercise(id: string): Promise<Exercise | null> {
        const exerciseRef = doc(db, EXERCISES_COLLECTION, id);
        const exerciseDoc = await getDoc(exerciseRef);

        if (!exerciseDoc.exists()) {
            return null;
        }

        return {
            id: exerciseDoc.id,
            ...exerciseDoc.data(),
        } as Exercise;
    },

    async updateExercise(id: string, data: Partial<Exercise>): Promise<void> {
        const exerciseRef = doc(db, EXERCISES_COLLECTION, id);
        await updateDoc(exerciseRef, {
            ...data,
            updatedAt: new Date(),
        });
    },

    async deleteExercise(id: string): Promise<void> {
        const exerciseRef = doc(db, EXERCISES_COLLECTION, id);
        await deleteDoc(exerciseRef);
    },

    // Exercise search and filtering
    async searchExercises(params: {
        searchTerm?: string;
        muscleGroups?: MuscleGroup[];
        equipment?: Equipment[];
        difficulty?: ExerciseDifficulty;
        limit?: number;
    }): Promise<Exercise[]> {
        const constraints: QueryConstraint[] = [];

        if (params.muscleGroups && params.muscleGroups.length > 0) {
            constraints.push(where('muscleGroups', 'array-contains-any', params.muscleGroups));
        }

        if (params.equipment && params.equipment.length > 0) {
            constraints.push(where('equipment', 'array-contains-any', params.equipment));
        }

        if (params.difficulty) {
            constraints.push(where('difficulty', '==', params.difficulty));
        }

        // Add ordering by name
        constraints.push(orderBy('name', 'asc'));

        if (params.limit) {
            constraints.push(limit(params.limit));
        }

        const q = query(collection(db, EXERCISES_COLLECTION), ...constraints);
        const querySnapshot = await getDocs(q);

        const exercises = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Exercise[];

        // Client-side search if searchTerm is provided
        if (params.searchTerm) {
            const searchLower = params.searchTerm.toLowerCase();
            return exercises.filter(exercise =>
                exercise.name.toLowerCase().includes(searchLower) ||
                exercise.description.toLowerCase().includes(searchLower)
            );
        }

        return exercises;
    },

    // Workout logging
    async logWorkout(data: Omit<WorkoutLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const now = new Date();
        const workoutRef = await addDoc(collection(db, WORKOUT_LOGS_COLLECTION), {
            ...data,
            createdAt: now,
            updatedAt: now,
        });

        // Update exercise progress
        await this.updateExerciseProgress(data.userId, data.exerciseId, data.duration);

        return workoutRef.id;
    },

    async getWorkoutLogs(userId: string, exerciseId?: string): Promise<WorkoutLog[]> {
        const constraints: QueryConstraint[] = [
            where('userId', '==', userId),
            orderBy('date', 'desc'),
        ];

        if (exerciseId) {
            constraints.push(where('exerciseId', '==', exerciseId));
        }

        const q = query(collection(db, WORKOUT_LOGS_COLLECTION), ...constraints);
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as WorkoutLog[];
    },

    // Exercise progress tracking
    async updateExerciseProgress(
        userId: string,
        exerciseId: string,
        duration: number
    ): Promise<void> {
        const progressRef = doc(db, EXERCISE_PROGRESS_COLLECTION, `${userId}_${exerciseId}`);
        const progressDoc = await getDoc(progressRef);

        const now = new Date();

        if (!progressDoc.exists()) {
            // Create new progress document
            await updateDoc(progressRef, {
                userId,
                exerciseId,
                totalSessions: 1,
                totalDuration: duration,
                lastPerformed: now,
                createdAt: now,
                updatedAt: now,
            });
        } else {
            // Update existing progress
            const data = progressDoc.data() as ExerciseProgress;
            await updateDoc(progressRef, {
                totalSessions: data.totalSessions + 1,
                totalDuration: data.totalDuration + duration,
                lastPerformed: now,
                updatedAt: now,
            });
        }
    },

    async getExerciseProgress(userId: string, exerciseId: string): Promise<ExerciseProgress | null> {
        const progressRef = doc(db, EXERCISE_PROGRESS_COLLECTION, `${userId}_${exerciseId}`);
        const progressDoc = await getDoc(progressRef);

        if (!progressDoc.exists()) {
            return null;
        }

        return progressDoc.data() as ExerciseProgress;
    },

    async getAllExerciseProgress(userId: string): Promise<ExerciseProgress[]> {
        const q = query(
            collection(db, EXERCISE_PROGRESS_COLLECTION),
            where('userId', '==', userId),
            orderBy('lastPerformed', 'desc')
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => doc.data()) as ExerciseProgress[];
    },
}; 