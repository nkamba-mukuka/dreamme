import { useState } from 'react';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { mentalService } from '../../services/mentalService';

interface VentJournalProps {
    initialEntry?: string;
    onSave: (entry: string) => Promise<void>;
}

export function VentJournal({ initialEntry = '', onSave }: VentJournalProps) {
    const { user } = useAuth();
    const [entry, setEntry] = useState(initialEntry);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !entry.trim()) return;

        try {
            setIsSubmitting(true);
            setError(null);
            await onSave(entry.trim());
        } catch (err) {
            console.error('Error saving journal entry:', err);
            setError('Failed to save journal entry');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPrompt = () => {
        const prompts = [
            "What's on your mind right now?",
            "How are you really feeling?",
            "What made you feel this way?",
            "What would make you feel better?",
            "What's one positive thing you can focus on?",
            "What would you like to let go of?",
            "What are you grateful for today?",
            "What's something you're looking forward to?",
        ];

        // Use the current hour to select a prompt, so it stays consistent for the day
        const hour = new Date().getHours();
        return prompts[hour % prompts.length];
    };

    if (error) {
        return (
            <div className="text-center space-y-4 py-12">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
                <Button onClick={() => setError(null)}>
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Journal Entry</h2>
                <p className="text-gray-600">
                    Take a moment to write down your thoughts and feelings.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        {getPrompt()}
                    </label>
                    <textarea
                        value={entry}
                        onChange={(e) => setEntry(e.target.value)}
                        className="w-full h-48 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                        placeholder="Start writing here..."
                        required
                        disabled={isSubmitting}
                    />
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting || !entry.trim()}>
                        {isSubmitting ? 'Saving...' : 'Save Entry'}
                    </Button>
                </div>
            </form>

            {/* Writing Tips */}
            <div className="bg-primary/5 rounded-lg p-6">
                <h3 className="font-medium mb-4">Writing Tips</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Be honest with yourself - this is your private space</li>
                    <li>• Don't worry about grammar or spelling</li>
                    <li>• Write whatever comes to mind</li>
                    <li>• Take your time to reflect</li>
                    <li>• Focus on your feelings and thoughts</li>
                </ul>
            </div>
        </div>
    );
} 