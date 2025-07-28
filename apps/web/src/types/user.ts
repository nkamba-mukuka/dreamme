export interface UserProfile {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    fitnessGoals: FitnessGoal[];
    fitnessLevel: FitnessLevel;
    preferences: UserPreferences;
    personalInfo: PersonalInfo;
    createdAt: Date;
    updatedAt: Date;
}

export type FitnessGoal =
    | 'weightLoss'
    | 'muscleGain'
    | 'endurance'
    | 'flexibility'
    | 'strength'
    | 'generalFitness';

export type FitnessLevel =
    | 'beginner'
    | 'intermediate'
    | 'advanced'
    | 'expert';

export interface UserPreferences {
    workoutReminders: boolean;
    reminderTime?: string;
    weeklyGoal: number; // Number of workouts per week
    preferredWorkoutDuration: number; // In minutes
    measurementUnit: 'metric' | 'imperial';
    theme: 'light' | 'dark' | 'system';
}

export interface PersonalInfo {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other' | 'preferNotToSay';
    height?: number; // in cm
    weight?: number; // in kg
    targetWeight?: number; // in kg
    bio?: string;
    location?: string;
    avatar?: string;
} 