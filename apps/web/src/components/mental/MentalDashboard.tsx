import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { mentalService } from '../../services/mentalService';
import type { MoodEntry, MotivationalQuote } from '../../types/mental';

const MOODS = [
    { value: 'great', label: 'Great! 😄', color: 'bg-green-500' },
    { value: 'good', label: 'Good 😊', color: 'bg-blue-500' },
    { value: 'okay', label: 'Okay 😐', color: 'bg-yellow-500' },
    { value: 'bad', label: 'Bad 😔', color: 'bg-orange-500' },
    { value: 'terrible', label: 'Terrible 😢', color: 'bg-red-500' }
] as const;

interface MentalDashboardProps {
    moodEntry: MoodEntry | null;
    onMoodSelect: (mood: MoodEntry['mood']) => void;
}

export function MentalDashboard({ moodEntry, onMoodSelect }: MentalDashboardProps) {
    const [quote, setQuote] = useState<MotivationalQuote | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDailyQuote();
    }, []);

    const loadDailyQuote = async () => {
        try {
            const dailyQuote = await mentalService.getDailyMotivationalQuote();
            setQuote(dailyQuote);
        } catch (error) {
            console.error('Error loading daily quote:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Daily Quote */}
            {quote && (
                <div className="bg-primary/5 rounded-lg p-6 text-center">
                    <p className="text-xl font-medium italic mb-2">"{quote.quote}"</p>
                    <p className="text-sm text-gray-600">— {quote.author}</p>
                </div>
            )}

            {/* Mood Selection */}
            {!moodEntry ? (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-center">How are you feeling today?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {MOODS.map(mood => (
                            <Button
                                key={mood.value}
                                onClick={() => onMoodSelect(mood.value)}
                                className={`h-24 text-lg ${mood.color} text-white hover:opacity-90`}
                            >
                                {mood.label}
                            </Button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Today's Mental Health Check-in</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <h3 className="font-medium mb-2">Your Mood</h3>
                            <p className="text-lg">
                                {MOODS.find(m => m.value === moodEntry.mood)?.label}
                            </p>
                        </div>
                        {moodEntry.journalEntry && (
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="font-medium mb-2">Journal Entry</h3>
                                <p className="text-gray-600 line-clamp-3">{moodEntry.journalEntry}</p>
                            </div>
                        )}
                    </div>

                    {/* Progress Indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h3 className="font-medium mb-2">Breathing Exercise</h3>
                            <p className="text-gray-600">
                                {moodEntry.completedBreathing
                                    ? '✅ Completed'
                                    : '⏳ Not completed'}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h3 className="font-medium mb-2">Journal Entry</h3>
                            <p className="text-gray-600">
                                {moodEntry.journalEntry
                                    ? '✅ Written'
                                    : '⏳ Not written'}
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h3 className="font-medium mb-2">Daily Progress</h3>
                            <div className="h-2 bg-gray-200 rounded-full">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-1000"
                                    style={{
                                        width: `${((moodEntry.completedBreathing ? 1 : 0) +
                                                (moodEntry.journalEntry ? 1 : 0)) *
                                            50
                                            }%`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 