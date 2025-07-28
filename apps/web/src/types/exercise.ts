export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' | 'legs' | 'core' | 'fullBody' | 'arms';
export type Equipment = 'bodyweight' | 'dumbbell' | 'barbell' | 'kettlebell' | 'resistanceBand' | 'machine' | 'cable' | 'other';
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
    id?: string;
    name: string;
    description: string;
    type: string;
    duration: string;
    videoUrl: string;
    muscleGroups: MuscleGroup[];
    equipment: Equipment[];
    difficulty: ExerciseDifficulty;
    instructions: string[];
    tips: string[];
    youtubeVideoId: string;
    estimatedDuration: number;
    caloriesBurnedPerMinute: number;
    completed: boolean;
    sets?: number;
    reps?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface DailyExercise {
    exerciseId: string;
    name: string;
    description: string;
    youtubeVideoId: string;
    thumbnailUrl: string;
    demoImageUrl: string;
    duration: number;
    sets: number;
    reps: number;
    completed: boolean;
}

export interface DailyWorkout {
    id: string;
    userId: string;
    date: Date;
    exercises: DailyExercise[];
    completed: boolean;
    fitnessGoal: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface WorkoutLog {
    id: string;
    userId: string;
    exerciseId: string;
    date: Date;
    duration: number; // in minutes
    sets: WorkoutSet[];
    notes?: string;
    rating?: number; // 1-5 rating of how the workout felt
    createdAt: Date;
    updatedAt: Date;
}

export interface WorkoutSet {
    reps?: number;
    weight?: number; // in kg
    duration?: number; // in seconds (for timed exercises)
    distance?: number; // in meters (for cardio exercises)
    restTime?: number; // in seconds
}

export interface ExerciseProgress {
    userId: string;
    exerciseId: string;
    totalSessions: number;
    totalDuration: number; // in minutes
    personalBests: {
        maxWeight?: number; // in kg
        maxReps?: number;
        maxDuration?: number; // in seconds
        maxDistance?: number; // in meters
    };
    lastPerformed?: Date;
    createdAt: Date;
    updatedAt: Date;
} 