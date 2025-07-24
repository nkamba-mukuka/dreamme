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