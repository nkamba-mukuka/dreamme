import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserProfile } from '../types/user';

const PROFILES_COLLECTION = 'profiles';

export const userProfileService = {
    async createProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
        const userRef = doc(db, PROFILES_COLLECTION, userId);
        const now = new Date();

        const defaultProfile: UserProfile = {
            id: userId,
            email: data.email || '',
            displayName: data.displayName || '',
            fitnessGoals: ['generalFitness'],
            fitnessLevel: 'beginner',
            preferences: {
                workoutReminders: false,
                weeklyGoal: 3,
                preferredWorkoutDuration: 30,
                measurementUnit: 'metric',
                theme: 'system',
            },
            personalInfo: {},
            createdAt: now,
            updatedAt: now,
        };

        await setDoc(userRef, {
            ...defaultProfile,
            ...data,
        });
    },

    async getProfile(userId: string): Promise<UserProfile | null> {
        const userRef = doc(db, PROFILES_COLLECTION, userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return null;
        }

        return userDoc.data() as UserProfile;
    },

    async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
        const userRef = doc(db, PROFILES_COLLECTION, userId);
        await updateDoc(userRef, {
            ...data,
            updatedAt: new Date(),
        });
    },

    async updatePreferences(userId: string, preferences: Partial<UserProfile['preferences']>): Promise<void> {
        const userRef = doc(db, PROFILES_COLLECTION, userId);
        await updateDoc(userRef, {
            'preferences': preferences,
            updatedAt: new Date(),
        });
    },

    async updatePersonalInfo(userId: string, personalInfo: Partial<UserProfile['personalInfo']>): Promise<void> {
        const userRef = doc(db, PROFILES_COLLECTION, userId);
        await updateDoc(userRef, {
            'personalInfo': personalInfo,
            updatedAt: new Date(),
        });
    },
}; 