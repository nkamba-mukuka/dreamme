export type MuscleGroup =
    | 'chest'
    | 'back'
    | 'shoulders'
    | 'biceps'
    | 'triceps'
    | 'legs'
    | 'core'
    | 'fullBody';

export type Equipment =
    | 'bodyweight'
    | 'dumbbell'
    | 'barbell'
    | 'kettlebell'
    | 'resistanceBand'
    | 'machine'
    | 'cable'
    | 'other';

export type ExerciseDifficulty =
    | 'beginner'
    | 'intermediate'
    | 'advanced';

export interface Exercise {
    id: string;
    name: string;
    description: string;
    muscleGroups: MuscleGroup[];
    equipment: Equipment[];
    difficulty: ExerciseDifficulty;
    instructions: string[];
    tips: string[];
    youtubeVideoId?: string;
    thumbnailUrl?: string;
    estimatedDuration: number; // in minutes
    caloriesBurnedPerMinute: number; // estimated calories burned per minute
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