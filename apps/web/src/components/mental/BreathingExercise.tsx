import { useState, useEffect, useRef } from 'react';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { mentalService } from '../../services/mentalService';
import type { BreathingPattern, BreathingPreset, BreathingSession, MoodLevel } from '../../types/mental';

const defaultPresets: BreathingPreset[] = [
    {
        id: 'box-breathing',
        name: 'Box Breathing',
        description: 'A simple but powerful technique used by Navy SEALs for stress relief and focus.',
        pattern: {
            name: 'Box Breathing',
            description: 'Inhale, hold, exhale, and hold for equal counts.',
            inhaleSeconds: 4,
            holdInhaleSeconds: 4,
            exhaleSeconds: 4,
            holdExhaleSeconds: 4,
            repetitions: 4,
            totalDurationSeconds: 64,
        },
        benefits: [
            'Reduces stress and anxiety',
            'Improves focus and concentration',
            'Helps regulate blood pressure',
        ],
        recommendedFor: [
            'Stress relief',
            'Pre-performance',
            'Focus enhancement',
        ],
        difficulty: 'beginner',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: '4-7-8',
        name: '4-7-8 Breathing',
        description: 'A relaxing breath pattern that promotes better sleep and reduces anxiety.',
        pattern: {
            name: '4-7-8 Breathing',
            description: 'Inhale for 4, hold for 7, exhale for 8.',
            inhaleSeconds: 4,
            holdInhaleSeconds: 7,
            exhaleSeconds: 8,
            holdExhaleSeconds: 0,
            repetitions: 4,
            totalDurationSeconds: 76,
        },
        benefits: [
            'Promotes better sleep',
            'Reduces anxiety',
            'Helps manage cravings',
        ],
        recommendedFor: [
            'Sleep preparation',
            'Anxiety relief',
            'Stress management',
        ],
        difficulty: 'intermediate',
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export function BreathingExercise() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [presets, setPresets] = useState<BreathingPreset[]>([]);
    const [selectedPreset, setSelectedPreset] = useState<BreathingPreset | null>(null);
    const [isExercising, setIsExercising] = useState(false);
    const [moodBefore, setMoodBefore] = useState<MoodLevel>(3);
    const [showMoodAfter, setShowMoodAfter] = useState(false);

    useEffect(() => {
        const loadPresets = async () => {
            setLoading(true);
            setError(null);

            try {
                const loadedPresets = await mentalService.getBreathingPresets();
                setPresets(loadedPresets.length > 0 ? loadedPresets : defaultPresets);
            } catch (err) {
                console.error('Error loading breathing presets:', err);
                setError('Failed to load breathing presets');
                setPresets(defaultPresets);
            } finally {
                setLoading(false);
            }
        };

        loadPresets();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isExercising && selectedPreset) {
        return (
            <BreathingSession
                preset={selectedPreset}
                moodBefore={moodBefore}
                onComplete={(moodAfter) => {
                    setIsExercising(false);
                    setShowMoodAfter(false);
                    setSelectedPreset(null);
                }}
                onCancel={() => {
                    setIsExercising(false);
                    setSelectedPreset(null);
                }}
            />
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold">Breathing Exercises</h2>
                <p className="text-muted-foreground">Practice guided breathing for relaxation and focus</p>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            {/* Breathing Presets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {presets.map((preset) => (
                    <div
                        key={preset.id}
                        className="bg-white p-6 rounded-xl shadow-sm"
                    >
                        <h3 className="text-lg font-semibold mb-2">{preset.name}</h3>
                        <p className="text-muted-foreground mb-4">{preset.description}</p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <h4 className="text-sm font-medium mb-2">Pattern</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>Inhale: {preset.pattern.inhaleSeconds}s</div>
                                    <div>Hold: {preset.pattern.holdInhaleSeconds}s</div>
                                    <div>Exhale: {preset.pattern.exhaleSeconds}s</div>
                                    <div>Hold: {preset.pattern.holdExhaleSeconds}s</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-2">Benefits</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                    {preset.benefits.map((benefit, index) => (
                                        <li key={index}>{benefit}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                    {preset.difficulty}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {Math.round(preset.pattern.totalDurationSeconds / 60)} min
                                </span>
                            </div>
                            <Button
                                onClick={() => {
                                    setSelectedPreset(preset);
                                    setIsExercising(true);
                                }}
                            >
                                Start
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface BreathingSessionProps {
    preset: BreathingPreset;
    moodBefore: MoodLevel;
    onComplete: (moodAfter: MoodLevel) => void;
    onCancel: () => void;
}

function BreathingSession({ preset, moodBefore, onComplete, onCancel }: BreathingSessionProps) {
    const { user } = useAuth();
    const [phase, setPhase] = useState<'inhale' | 'holdInhale' | 'exhale' | 'holdExhale'>('inhale');
    const [repetition, setRepetition] = useState(1);
    const [timeLeft, setTimeLeft] = useState(preset.pattern.inhaleSeconds);
    const [isPaused, setIsPaused] = useState(false);
    const [showMoodAfter, setShowMoodAfter] = useState(false);
    const [moodAfter, setMoodAfter] = useState<MoodLevel>(moodBefore);
    const circleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isPaused) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Move to next phase
                    switch (phase) {
                        case 'inhale':
                            setPhase('holdInhale');
                            return preset.pattern.holdInhaleSeconds;
                        case 'holdInhale':
                            setPhase('exhale');
                            return preset.pattern.exhaleSeconds;
                        case 'exhale':
                            setPhase('holdExhale');
                            return preset.pattern.holdExhaleSeconds;
                        case 'holdExhale':
                            if (repetition < preset.pattern.repetitions) {
                                setRepetition((prev) => prev + 1);
                                setPhase('inhale');
                                return preset.pattern.inhaleSeconds;
                            } else {
                                setShowMoodAfter(true);
                                return 0;
                            }
                    }
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [phase, repetition, isPaused, preset.pattern]);

    useEffect(() => {
        if (!circleRef.current) return;

        // Animation based on phase
        const circle = circleRef.current;
        circle.style.transition = 'all 1s ease-in-out';

        switch (phase) {
            case 'inhale':
                circle.style.transform = 'scale(1.5)';
                break;
            case 'holdInhale':
                circle.style.transform = 'scale(1.5)';
                break;
            case 'exhale':
                circle.style.transform = 'scale(1)';
                break;
            case 'holdExhale':
                circle.style.transform = 'scale(1)';
                break;
        }
    }, [phase]);

    const handleComplete = async () => {
        if (!user) return;

        try {
            const session: Omit<BreathingSession, 'id' | 'createdAt' | 'updatedAt'> = {
                userId: user.uid,
                date: new Date(),
                pattern: preset.pattern,
                completedRepetitions: repetition,
                durationSeconds: preset.pattern.totalDurationSeconds,
                moodBefore,
                moodAfter,
            };

            await mentalService.createBreathingSession(session);
            await mentalService.updateMentalHealthStats(user.uid, new Date());
            onComplete(moodAfter);
        } catch (err) {
            console.error('Error saving breathing session:', err);
        }
    };

    if (showMoodAfter) {
        return (
            <div className="space-y-8 text-center">
                <h2 className="text-2xl font-semibold">Great job!</h2>
                <p className="text-muted-foreground">How do you feel now?</p>

                <div className="flex justify-center gap-4">
                    {[1, 2, 3, 4, 5].map((level) => (
                        <button
                            key={level}
                            onClick={() => {
                                setMoodAfter(level as MoodLevel);
                                handleComplete();
                            }}
                            className={`flex flex-col items-center p-4 rounded-lg transition-colors ${moodAfter === level ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5'
                                }`}
                        >
                            <span className="text-3xl">
                                {level === 1 ? '😢' :
                                    level === 2 ? '😕' :
                                        level === 3 ? '😐' :
                                            level === 4 ? '🙂' : '😊'}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold">{preset.name}</h2>
                    <p className="text-muted-foreground">
                        Round {repetition} of {preset.pattern.repetitions}
                    </p>
                </div>
                <Button variant="outline" onClick={onCancel}>
                    End Session
                </Button>
            </div>

            {/* Breathing Animation */}
            <div className="flex flex-col items-center justify-center py-16">
                <div
                    ref={circleRef}
                    className="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center text-4xl"
                >
                    {timeLeft}
                </div>
                <p className="mt-8 text-xl font-medium">
                    {phase === 'inhale' ? 'Inhale...' :
                        phase === 'holdInhale' ? 'Hold...' :
                            phase === 'exhale' ? 'Exhale...' : 'Hold...'}
                </p>
            </div>

            {/* Controls */}
            <div className="flex justify-center">
                <Button
                    variant="outline"
                    onClick={() => setIsPaused(!isPaused)}
                >
                    {isPaused ? 'Resume' : 'Pause'}
                </Button>
            </div>
        </div>
    );
} 