export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export type MoodType = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

export interface MoodEntry {
    id: string;
    userId: string;
    mood: MoodType;
    journalEntry?: string;
    date: Date;
    completedBreathing: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface MotivationalQuote {
    id: string;
    quote: string;
    author: string;
    category: string;
    imageUrl?: string;
}

export type MoodTag =
    | 'happy'
    | 'excited'
    | 'peaceful'
    | 'content'
    | 'neutral'
    | 'anxious'
    | 'stressed'
    | 'sad'
    | 'angry'
    | 'frustrated'
    | 'tired'
    | 'energetic'
    | 'motivated'
    | 'unmotivated'
    | 'other';

export interface JournalEntry {
    id: string;
    userId: string;
    date: Date;
    content: string;
    mood: MoodLevel;
    moodTags: MoodTag[];
    isPrivate: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type BreathingPattern = {
    name: string;
    description: string;
    inhaleSeconds: number;
    holdInhaleSeconds: number;
    exhaleSeconds: number;
    holdExhaleSeconds: number;
    repetitions: number;
    totalDurationSeconds: number;
};

export interface BreathingSession {
    id: string;
    userId: string;
    date: Date;
    pattern: BreathingPattern;
    completedRepetitions: number;
    durationSeconds: number;
    notes?: string;
    moodBefore?: MoodLevel;
    moodAfter?: MoodLevel;
    createdAt: Date;
    updatedAt: Date;
}

export interface BreathingPreset {
    id: string;
    name: string;
    description: string;
    pattern: BreathingPattern;
    benefits: string[];
    recommendedFor: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    createdAt: Date;
    updatedAt: Date;
}

export type MotivationType =
    | 'health'
    | 'fitness'
    | 'mental'
    | 'personal'
    | 'family'
    | 'career'
    | 'other';

export interface Motivation {
    id: string;
    userId: string;
    type: MotivationType;
    title: string;
    description: string;
    isActive: boolean;
    reminderFrequency?: 'daily' | 'weekly' | 'monthly';
    reminderTime?: string; // HH:mm format
    lastReminderSent?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface MentalHealthStats {
    userId: string;
    date: Date;
    moodTrend: 'improving' | 'stable' | 'declining';
    averageMood: number;
    journalStreak: number;
    breathingMinutes: number;
    activeMotivations: number;
    commonMoodTags: MoodTag[];
    createdAt: Date;
    updatedAt: Date;
}

// Helper type for journal search and filtering
export interface JournalSearchParams {
    startDate?: Date;
    endDate?: Date;
    moodLevel?: MoodLevel;
    moodTags?: MoodTag[];
    searchTerm?: string;
}

// Helper type for breathing session search and filtering
export interface BreathingSessionSearchParams {
    startDate?: Date;
    endDate?: Date;
    pattern?: string;
    minDuration?: number;
    maxDuration?: number;
}

// Helper type for motivation search and filtering
export interface MotivationSearchParams {
    type?: MotivationType;
    isActive?: boolean;
    hasReminder?: boolean;
    searchTerm?: string;
} 