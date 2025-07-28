import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { BackButton } from '../components/layout/BackButton';
import { BreathingExercise } from '../components/mental/BreathingExercise';
import { MentalDashboard } from '../components/mental/MentalDashboard';
import { VentJournal } from '../components/mental/VentJournal';
import { useAuth } from '../lib/auth';
import { mentalService } from '../services/mentalService';
import type { MoodEntry } from '../types/mental';

type View = 'dashboard' | 'breathing' | 'journal';

export default Mental;

export function Mental() {
    const { user } = useAuth();
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [moodEntry, setMoodEntry] = useState<MoodEntry | null>(null);
    const [journalEntry, setJournalEntry] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTodaysMoodEntry();
    }, [user]);

    const loadTodaysMoodEntry = async () => {
        if (!user) return;

        setLoading(true);
        setError(null);
        try {
            const entry = await mentalService.getTodaysMoodEntry(user.uid);
            setMoodEntry(entry);
            if (entry?.journalEntry) {
                setJournalEntry(entry.journalEntry);
            }
        } catch (error) {
            console.error('Error loading mood entry:', error);
            setError('Failed to load your mood data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMoodSelect = async (mood: MoodEntry['mood']) => {
        if (!user) return;

        setLoading(true);
        setError(null);
        try {
            const newMoodEntry = await mentalService.logMood(user.uid, mood);
            setMoodEntry(newMoodEntry);

            // For bad or terrible moods, go to breathing exercise
            if (mood === 'bad' || mood === 'terrible') {
                setCurrentView('breathing');
            } else {
                setCurrentView('journal');
            }
        } catch (error) {
            console.error('Error logging mood:', error);
            setError('Failed to save your mood. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBreathingComplete = async () => {
        if (!user || !moodEntry) {
            setError('Please log your mood first before doing breathing exercises.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await mentalService.markBreathingComplete(moodEntry.id);
            setMoodEntry(prev => prev ? { ...prev, completedBreathing: true } : null);
            setCurrentView('journal');
        } catch (error) {
            console.error('Error marking breathing complete:', error);
            setError('Failed to save your breathing progress. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleJournalSave = async (entry: string) => {
        if (!user || !moodEntry) {
            setError('Please log your mood first before journaling.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await mentalService.addJournalEntry(moodEntry.id, entry);
            setJournalEntry(entry);
            setMoodEntry(prev => prev ? { ...prev, journalEntry: entry } : null);
            setCurrentView('dashboard');
        } catch (error) {
            console.error('Error saving journal entry:', error);
            setError('Failed to save your journal entry. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <BackButton />
                <h1 className="text-3xl font-bold mb-4">Mental Wellness</h1>
                <p className="text-gray-600">Please sign in to access mental health features.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Mental Wellness</h1>
                <div className="flex space-x-4">
                    <Button
                        variant={currentView === 'dashboard' ? 'default' : 'outline'}
                        onClick={() => setCurrentView('dashboard')}
                    >
                        Dashboard
                    </Button>
                    <Button
                        variant={currentView === 'breathing' ? 'default' : 'outline'}
                        onClick={() => setCurrentView('breathing')}
                    >
                        Breathing Exercise
                    </Button>
                    <Button
                        variant={currentView === 'journal' ? 'default' : 'outline'}
                        onClick={() => setCurrentView('journal')}
                    >
                        Journal Entry
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {currentView === 'dashboard' && (
                            <MentalDashboard
                                moodEntry={moodEntry}
                                onMoodSelect={handleMoodSelect}
                            />
                        )}
                        {currentView === 'breathing' && (
                            <BreathingExercise
                                onComplete={handleBreathingComplete}
                            />
                        )}
                        {currentView === 'journal' && (
                            <VentJournal
                                onSave={handleJournalSave}
                                initialEntry={journalEntry}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 