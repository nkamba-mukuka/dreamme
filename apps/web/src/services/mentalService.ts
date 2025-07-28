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
    setDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type {
    JournalEntry,
    BreathingSession,
    BreathingPreset,
    Motivation,
    MentalHealthStats,
    JournalSearchParams,
    BreathingSessionSearchParams,
    MotivationSearchParams,
    MoodTag,
} from '../types/mental';

const JOURNAL_COLLECTION = 'journalEntries';
const BREATHING_SESSIONS_COLLECTION = 'breathingSessions';
const BREATHING_PRESETS_COLLECTION = 'breathingPresets';
const MOTIVATIONS_COLLECTION = 'motivations';
const MENTAL_STATS_COLLECTION = 'mentalHealthStats';

type MoodType = 'great' | 'good' | 'okay' | 'bad' | 'terrible';

interface MoodEntry {
    id: string;
    userId: string;
    mood: MoodType;
    journalEntry?: string;
    date: Date;
    completedBreathing: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface MotivationalQuote {
    id: string;
    quote: string;
    author: string;
    category: string;
    imageUrl?: string;
    date: string; // Added date property
}

export const mentalService = {
    // Journal CRUD operations
    async createJournalEntry(data: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const now = new Date();
        const entryRef = await addDoc(collection(db, JOURNAL_COLLECTION), {
            ...data,
            createdAt: now,
            updatedAt: now,
        });
        return entryRef.id;
    },

    async getJournalEntry(id: string): Promise<JournalEntry | null> {
        const entryRef = doc(db, JOURNAL_COLLECTION, id);
        const entryDoc = await getDoc(entryRef);

        if (!entryDoc.exists()) {
            return null;
        }

        return {
            id: entryDoc.id,
            ...entryDoc.data(),
        } as JournalEntry;
    },

    async updateJournalEntry(id: string, data: Partial<JournalEntry>): Promise<void> {
        const entryRef = doc(db, JOURNAL_COLLECTION, id);
        await updateDoc(entryRef, {
            ...data,
            updatedAt: new Date(),
        });
    },

    async deleteJournalEntry(id: string): Promise<void> {
        const entryRef = doc(db, JOURNAL_COLLECTION, id);
        await deleteDoc(entryRef);
    },

    async searchJournalEntries(userId: string, params: JournalSearchParams): Promise<JournalEntry[]> {
        const constraints: QueryConstraint[] = [
            where('userId', '==', userId),
            orderBy('date', 'desc'),
        ];

        if (params.startDate) {
            constraints.push(where('date', '>=', params.startDate));
        }

        if (params.endDate) {
            constraints.push(where('date', '<=', params.endDate));
        }

        if (params.moodLevel) {
            constraints.push(where('mood', '==', params.moodLevel));
        }

        if (params.moodTags && params.moodTags.length > 0) {
            constraints.push(where('moodTags', 'array-contains-any', params.moodTags));
        }

        const q = query(collection(db, JOURNAL_COLLECTION), ...constraints);
        const querySnapshot = await getDocs(q);

        let entries = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as JournalEntry[];

        // Client-side search for content
        if (params.searchTerm) {
            const searchLower = params.searchTerm.toLowerCase();
            entries = entries.filter(entry =>
                entry.content.toLowerCase().includes(searchLower)
            );
        }

        return entries;
    },

    // Breathing Sessions
    async createBreathingSession(data: Omit<BreathingSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const now = new Date();
        const sessionRef = await addDoc(collection(db, BREATHING_SESSIONS_COLLECTION), {
            ...data,
            createdAt: now,
            updatedAt: now,
        });
        return sessionRef.id;
    },

    async getBreathingSession(id: string): Promise<BreathingSession | null> {
        const sessionRef = doc(db, BREATHING_SESSIONS_COLLECTION, id);
        const sessionDoc = await getDoc(sessionRef);

        if (!sessionDoc.exists()) {
            return null;
        }

        return {
            id: sessionDoc.id,
            ...sessionDoc.data(),
        } as BreathingSession;
    },

    async searchBreathingSessions(userId: string, params: BreathingSessionSearchParams): Promise<BreathingSession[]> {
        const constraints: QueryConstraint[] = [
            where('userId', '==', userId),
            orderBy('date', 'desc'),
        ];

        if (params.startDate) {
            constraints.push(where('date', '>=', params.startDate));
        }

        if (params.endDate) {
            constraints.push(where('date', '<=', params.endDate));
        }

        if (params.pattern) {
            constraints.push(where('pattern.name', '==', params.pattern));
        }

        const q = query(collection(db, BREATHING_SESSIONS_COLLECTION), ...constraints);
        const querySnapshot = await getDocs(q);

        let sessions = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as BreathingSession[];

        // Client-side filtering for duration
        if (params.minDuration !== undefined || params.maxDuration !== undefined) {
            sessions = sessions.filter(session => {
                if (params.minDuration !== undefined && session.durationSeconds < params.minDuration) {
                    return false;
                }
                if (params.maxDuration !== undefined && session.durationSeconds > params.maxDuration) {
                    return false;
                }
                return true;
            });
        }

        return sessions;
    },

    // Breathing Presets
    async getBreathingPresets(): Promise<BreathingPreset[]> {
        const q = query(
            collection(db, BREATHING_PRESETS_COLLECTION),
            orderBy('difficulty'),
            orderBy('name')
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as BreathingPreset[];
    },

    // Motivations
    async createMotivation(data: Omit<Motivation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const now = new Date();
        const motivationRef = await addDoc(collection(db, MOTIVATIONS_COLLECTION), {
            ...data,
            createdAt: now,
            updatedAt: now,
        });
        return motivationRef.id;
    },

    async getMotivation(id: string): Promise<Motivation | null> {
        const motivationRef = doc(db, MOTIVATIONS_COLLECTION, id);
        const motivationDoc = await getDoc(motivationRef);

        if (!motivationDoc.exists()) {
            return null;
        }

        return {
            id: motivationDoc.id,
            ...motivationDoc.data(),
        } as Motivation;
    },

    async updateMotivation(id: string, data: Partial<Motivation>): Promise<void> {
        const motivationRef = doc(db, MOTIVATIONS_COLLECTION, id);
        await updateDoc(motivationRef, {
            ...data,
            updatedAt: new Date(),
        });
    },

    async deleteMotivation(id: string): Promise<void> {
        const motivationRef = doc(db, MOTIVATIONS_COLLECTION, id);
        await deleteDoc(motivationRef);
    },

    async searchMotivations(userId: string, params: MotivationSearchParams): Promise<Motivation[]> {
        const constraints: QueryConstraint[] = [
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
        ];

        if (params.type) {
            constraints.push(where('type', '==', params.type));
        }

        if (params.isActive !== undefined) {
            constraints.push(where('isActive', '==', params.isActive));
        }

        if (params.hasReminder !== undefined) {
            constraints.push(where('reminderFrequency', params.hasReminder ? '!=' : '==', null));
        }

        const q = query(collection(db, MOTIVATIONS_COLLECTION), ...constraints);
        const querySnapshot = await getDocs(q);

        let motivations = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Motivation[];

        // Client-side search
        if (params.searchTerm) {
            const searchLower = params.searchTerm.toLowerCase();
            motivations = motivations.filter(motivation =>
                motivation.title.toLowerCase().includes(searchLower) ||
                motivation.description.toLowerCase().includes(searchLower)
            );
        }

        return motivations;
    },

    // Mental Health Stats
    async updateMentalHealthStats(userId: string, date: Date): Promise<void> {
        const statsRef = doc(db, MENTAL_STATS_COLLECTION, `${userId}_${date.toISOString().split('T')[0]}`);
        const now = new Date();

        // Get recent journal entries
        const recentEntries = await this.searchJournalEntries(userId, {
            startDate: new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            endDate: date,
        });

        // Calculate mood trend
        const moodTrend = calculateMoodTrend(recentEntries);

        // Get breathing sessions
        const breathingSessions = await this.searchBreathingSessions(userId, {
            startDate: new Date(date.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
            endDate: date,
        });

        // Get active motivations
        const activeMotivations = await this.searchMotivations(userId, {
            isActive: true,
        });

        // Calculate stats
        const stats: Omit<MentalHealthStats, 'id'> = {
            userId,
            date,
            averageMood: calculateAverageMood(recentEntries),
            moodTrend,
            commonMoodTags: findCommonMoodTags(recentEntries),
            journalStreak: calculateJournalStreak(recentEntries),
            breathingMinutes: Math.round(breathingSessions.reduce((total, session) => total + session.durationSeconds, 0) / 60),
            activeMotivations: activeMotivations.length,
            createdAt: now,
            updatedAt: now,
        };

        await updateDoc(statsRef, stats);
    },

    async getMentalHealthStats(userId: string, date: Date): Promise<MentalHealthStats | null> {
        const statsRef = doc(db, MENTAL_STATS_COLLECTION, `${userId}_${date.toISOString().split('T')[0]}`);
        const statsDoc = await getDoc(statsRef);

        if (!statsDoc.exists()) {
            return null;
        }

        return statsDoc.data() as MentalHealthStats;
    },

    async logMood(userId: string, mood: MoodType): Promise<MoodEntry> {
        const moodData: Omit<MoodEntry, 'id'> = {
            userId,
            mood,
            date: new Date(),
            completedBreathing: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const moodRef = await addDoc(collection(db, 'moodEntries'), moodData);
        return {
            id: moodRef.id,
            ...moodData
        };
    },

    async updateMoodEntry(moodEntryId: string, updates: Partial<MoodEntry>): Promise<void> {
        const moodRef = doc(db, 'moodEntries', moodEntryId);
        await updateDoc(moodRef, {
            ...updates,
            updatedAt: new Date()
        });
    },

    async getTodaysMoodEntry(userId: string): Promise<MoodEntry | null> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const moodRef = collection(db, 'moodEntries');
        const q = query(
            moodRef,
            where('userId', '==', userId),
            where('date', '>=', today),
            limit(1)
        );

        const moodSnapshot = await getDocs(q);
        if (moodSnapshot.empty) {
            return null;
        }

        return {
            id: moodSnapshot.docs[0].id,
            ...moodSnapshot.docs[0].data()
        } as MoodEntry;
    },

    async markBreathingComplete(moodEntryId: string): Promise<void> {
        const moodRef = doc(db, 'moodEntries', moodEntryId);
        await updateDoc(moodRef, {
            completedBreathing: true,
            updatedAt: new Date()
        });
    },

    async logBreathingSession(userId: string, durationSeconds: number): Promise<void> {
        const now = new Date();
        const sessionData: Omit<BreathingSession, 'id'> = {
            userId,
            date: now,
            durationSeconds,
            pattern: {
                name: 'Box Breathing',
                description: 'A simple breathing technique to reduce stress',
                inhaleSeconds: 4,
                holdInhaleSeconds: 4,
                exhaleSeconds: 4,
                holdExhaleSeconds: 4,
                repetitions: 4,
                totalDurationSeconds: durationSeconds
            },
            completedRepetitions: Math.floor(durationSeconds / 16),
            createdAt: now,
            updatedAt: now
        };

        // Add to breathing sessions collection with auto-generated ID
        await addDoc(collection(db, 'breathingSessions'), sessionData);

        // Update daily activity
        await setDoc(doc(db, 'dailyActivity', `${userId}_${now.toISOString().split('T')[0]}`), {
            mental: true,
            lastUpdated: now
        }, { merge: true });

        // Update progress
        const progressRef = doc(db, 'progress', userId);
        const progressDoc = await getDoc(progressRef);

        if (progressDoc.exists()) {
            const progress = progressDoc.data();
            await updateDoc(progressRef, {
                'mental.breathingMinutes': (progress.mental?.breathingMinutes || 0) + Math.round(durationSeconds / 60),
                updatedAt: now
            });
        } else {
            await setDoc(progressRef, {
                mental: {
                    breathingMinutes: Math.round(durationSeconds / 60),
                    journalStreak: 0,
                    moodScore: 0
                },
                createdAt: now,
                updatedAt: now
            });
        }
    },

    async addJournalEntry(userId: string, content: string): Promise<void> {
        const now = new Date();
        const entryData: Omit<JournalEntry, 'id'> = {
            userId,
            content,
            date: now,
            mood: 3,
            moodTags: [],
            isPrivate: true,
            createdAt: now,
            updatedAt: now
        };

        // Add to journal entries collection with auto-generated ID
        await addDoc(collection(db, 'journalEntries'), entryData);

        // Update daily activity
        await setDoc(doc(db, 'dailyActivity', `${userId}_${now.toISOString().split('T')[0]}`), {
            mental: true,
            lastUpdated: now
        }, { merge: true });

        // Update progress
        const progressRef = doc(db, 'progress', userId);
        const progressDoc = await getDoc(progressRef);

        if (progressDoc.exists()) {
            const progress = progressDoc.data();
            await updateDoc(progressRef, {
                'mental.journalStreak': (progress.mental?.journalStreak || 0) + 1,
                updatedAt: now
            });
        } else {
            await setDoc(progressRef, {
                mental: {
                    breathingMinutes: 0,
                    journalStreak: 1,
                    moodScore: 0
                },
                createdAt: now,
                updatedAt: now
            });
        }
    },

    async getDailyMotivationalQuote(): Promise<MotivationalQuote> {
        try {
            const today = new Date().toISOString().split('T')[0];

            // Try to get cached quote for today
            const cachedQuoteDoc = await getDoc(doc(db, 'motivationalQuotes', today));
            if (cachedQuoteDoc.exists()) {
                return cachedQuoteDoc.data() as MotivationalQuote;
            }

            // Try Quotable API first (no CORS issues)
            try {
                const response = await fetch('https://api.quotable.io/quotes/random?tags=inspirational,motivation');
                if (response.ok) {
                    const [data] = await response.json();
                    const quote: MotivationalQuote = {
                        id: data._id,
                        quote: data.content,
                        author: data.author,
                        category: 'motivation',
                        date: today
                    };
                    await setDoc(doc(db, 'motivationalQuotes', today), quote);
                    return quote;
                }
            } catch (error) {
                console.error('Quotable API failed:', error);
            }

            // Fallback to static quotes if API fails
            const fallbackQuotes = [
                { quote: 'Dream big, work hard, stay focused.', author: 'DreamMe' },
                { quote: 'Your only limit is your mind.', author: 'DreamMe' },
                { quote: 'Make today amazing.', author: 'DreamMe' },
                { quote: 'Stay focused and never give up.', author: 'DreamMe' },
                { quote: 'Every rep brings you closer to your dream.', author: 'DreamMe' },
                { quote: 'Transform your dreams into reality.', author: 'DreamMe' },
                { quote: 'Your future self will thank you.', author: 'DreamMe' },
                { quote: 'Small steps lead to big changes.', author: 'DreamMe' },
                { quote: 'Believe in yourself and dream big.', author: 'DreamMe' },
                { quote: 'Success is built one workout at a time.', author: 'DreamMe' }
            ];

            const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
            const quote: MotivationalQuote = {
                id: 'dreamme-' + today,
                ...randomQuote,
                category: 'motivation',
                date: today
            };

            await setDoc(doc(db, 'motivationalQuotes', today), quote);
            return quote;
        } catch (error) {
            console.error('Error fetching quote:', error);
            const today = new Date().toISOString().split('T')[0];
            return {
                id: 'default',
                quote: 'Dream big with DreamMe',
                author: 'DreamMe',
                category: 'motivation',
                date: today
            };
        }
    },

    async getMoodHistory(userId: string, days: number = 7): Promise<MoodEntry[]> {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const moodRef = collection(db, 'moodEntries');
        const q = query(
            moodRef,
            where('userId', '==', userId),
            where('date', '>=', startDate),
            orderBy('date', 'desc')
        );

        const moodSnapshot = await getDocs(q);
        return moodSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as MoodEntry[];
    }
};

// Helper functions
function calculateMoodTrend(entries: JournalEntry[]): MentalHealthStats['moodTrend'] {
    if (entries.length < 2) return 'stable';

    const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
    const moodChanges = sortedEntries.slice(1).map((entry, i) => entry.mood - sortedEntries[i].mood);
    const averageChange = moodChanges.reduce((sum, change) => sum + change, 0) / moodChanges.length;

    if (averageChange > 0.2) return 'improving';
    if (averageChange < -0.2) return 'declining';
    return 'stable';
}

function calculateAverageMood(entries: JournalEntry[]): number {
    if (entries.length === 0) return 3;
    return Math.round((entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length) * 10) / 10;
}

function findCommonMoodTags(entries: JournalEntry[]): MoodTag[] {
    const tagCounts = new Map<MoodTag, number>();
    entries.forEach(entry =>
        entry.moodTags.forEach(tag =>
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        )
    );

    return Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag]) => tag);
}

function calculateJournalStreak(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entriesByDate = new Map<string, boolean>();
    entries.forEach(entry => {
        const dateStr = entry.date.toISOString().split('T')[0];
        entriesByDate.set(dateStr, true);
    });

    let streak = 0;
    let currentDate = today;

    while (entriesByDate.has(currentDate.toISOString().split('T')[0])) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
} 