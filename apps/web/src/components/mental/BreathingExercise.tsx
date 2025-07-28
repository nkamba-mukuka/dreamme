import { useState, useEffect, useCallback } from 'react';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { mentalService } from '../../services/mentalService';

interface BreathingExerciseProps {
    onComplete: () => void;
}

export function BreathingExercise({ onComplete }: BreathingExerciseProps) {
    const { user } = useAuth();
    const [timeLeft, setTimeLeft] = useState(30); // 30 seconds
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const PHASE_DURATION = {
        inhale: 4,
        hold: 4,
        exhale: 4
    };

    const getNextPhase = useCallback((currentPhase: typeof phase) => {
        switch (currentPhase) {
            case 'inhale':
                return 'hold';
            case 'hold':
                return 'exhale';
            case 'exhale':
                return 'inhale';
        }
    }, []);

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setTimeLeft(time => {
                if (time <= 1) {
                    clearInterval(interval);
                    handleComplete();
                    return 0;
                }
                return time - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive]);

    useEffect(() => {
        if (!isActive) return;

        const phaseInterval = setInterval(() => {
            setPhase(currentPhase => getNextPhase(currentPhase));
        }, PHASE_DURATION[phase] * 1000);

        return () => clearInterval(phaseInterval);
    }, [isActive, phase, getNextPhase]);

    const handleStart = () => {
        setIsActive(true);
    };

    const handleComplete = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);
            await mentalService.logBreathingSession(user.uid, 30); // 30 seconds
            onComplete();
        } catch (err) {
            console.error('Error logging breathing session:', err);
            setError('Failed to save breathing session');
        } finally {
            setLoading(false);
        }
    };

    const getPhaseInstruction = () => {
        switch (phase) {
            case 'inhale':
                return 'Breathe in slowly...';
            case 'hold':
                return 'Hold your breath...';
            case 'exhale':
                return 'Breathe out slowly...';
        }
    };

    const getPhaseAnimation = () => {
        switch (phase) {
            case 'inhale':
                return 'scale-110 transition-transform duration-4000';
            case 'hold':
                return 'scale-110';
            case 'exhale':
                return 'scale-100 transition-transform duration-4000';
        }
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

    if (!isActive) {
        return (
            <div className="text-center space-y-6 py-12">
                <h2 className="text-2xl font-bold">Let's Take a Moment to Breathe</h2>
                <p className="text-gray-600">
                    Take 30 seconds to follow this breathing exercise. It will help you feel more calm and centered.
                </p>
                <Button onClick={handleStart} size="lg" disabled={loading}>
                    Start Breathing Exercise
                </Button>
            </div>
        );
    }

    return (
        <div className="text-center space-y-8 py-12">
            <h2 className="text-2xl font-bold">Breathing Exercise</h2>

            <div className="relative">
                <div className={`
                    w-48 h-48 mx-auto rounded-full bg-primary/10 
                    flex items-center justify-center
                    ${getPhaseAnimation()}
                `}>
                    <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-4xl font-bold">{timeLeft}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-xl font-medium">{getPhaseInstruction()}</p>
                <div className="h-2 bg-gray-200 rounded-full max-w-md mx-auto">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{
                            width: `${(timeLeft / 30) * 100}%`
                        }}
                    />
                </div>
            </div>
        </div>
    );
} 