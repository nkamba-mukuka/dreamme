import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { Button } from '@dreamme/ui';
import type { FitnessGoal, FitnessLevel, PersonalInfo } from '../../types/user';
import { userProfileService } from '../../services/userProfile';

const fitnessGoals: { value: FitnessGoal; label: string }[] = [
    { value: 'weightLoss', label: 'Weight Loss' },
    { value: 'muscleGain', label: 'Muscle Gain' },
    { value: 'endurance', label: 'Endurance' },
    { value: 'flexibility', label: 'Flexibility' },
    { value: 'strength', label: 'Strength' },
    { value: 'generalFitness', label: 'General Fitness' },
];

const fitnessLevels: { value: FitnessLevel; label: string }[] = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' },
];

interface OnboardingData {
    personalInfo: PersonalInfo;
    fitnessGoals: FitnessGoal[];
    fitnessLevel: FitnessLevel;
}

interface OnboardingFlowProps {
    onComplete?: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<OnboardingData>({
        personalInfo: {},
        fitnessGoals: [],
        fitnessLevel: 'beginner',
    });

    const steps = [
        {
            title: 'Personal Information',
            component: (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">First Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary"
                                value={data.personalInfo.firstName || ''}
                                onChange={(e) => setData(prev => ({
                                    ...prev,
                                    personalInfo: { ...prev.personalInfo, firstName: e.target.value }
                                }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Last Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary"
                                value={data.personalInfo.lastName || ''}
                                onChange={(e) => setData(prev => ({
                                    ...prev,
                                    personalInfo: { ...prev.personalInfo, lastName: e.target.value }
                                }))}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Gender</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary"
                            value={data.personalInfo.gender || ''}
                            onChange={(e) => setData(prev => ({
                                ...prev,
                                personalInfo: { ...prev.personalInfo, gender: e.target.value as PersonalInfo['gender'] }
                            }))}
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="preferNotToSay">Prefer not to say</option>
                        </select>
                    </div>
                </div>
            ),
            isValid: () => !!data.personalInfo.firstName && !!data.personalInfo.lastName,
        },
        {
            title: 'Fitness Goals',
            component: (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Select your fitness goals (multiple choice)</p>
                    <div className="grid grid-cols-2 gap-4">
                        {fitnessGoals.map((goal) => (
                            <Button
                                key={goal.value}
                                variant={data.fitnessGoals.includes(goal.value) ? 'default' : 'outline'}
                                onClick={() => setData(prev => ({
                                    ...prev,
                                    fitnessGoals: prev.fitnessGoals.includes(goal.value)
                                        ? prev.fitnessGoals.filter(g => g !== goal.value)
                                        : [...prev.fitnessGoals, goal.value]
                                }))}
                                className="w-full justify-start"
                            >
                                {goal.label}
                            </Button>
                        ))}
                    </div>
                </div>
            ),
            isValid: () => data.fitnessGoals.length > 0,
        },
        {
            title: 'Fitness Level',
            component: (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Select your current fitness level</p>
                    <div className="grid grid-cols-2 gap-4">
                        {fitnessLevels.map((level) => (
                            <Button
                                key={level.value}
                                variant={data.fitnessLevel === level.value ? 'default' : 'outline'}
                                onClick={() => setData(prev => ({
                                    ...prev,
                                    fitnessLevel: level.value
                                }))}
                                className="w-full justify-start"
                            >
                                {level.label}
                            </Button>
                        ))}
                    </div>
                </div>
            ),
            isValid: () => true, // Always valid since we have a default value
        },
    ];

    const handleNext = () => {
        if (!steps[currentStep].isValid()) {
            setError('Please fill in all required fields');
            return;
        }
        setError(null);

        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        setError(null);
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            await userProfileService.createProfile(user.uid, {
                email: user.email || '',
                displayName: user.displayName || `${data.personalInfo.firstName} ${data.personalInfo.lastName}`.trim(),
                personalInfo: data.personalInfo,
                fitnessGoals: data.fitnessGoals,
                fitnessLevel: data.fitnessLevel,
            });

            // Call the onComplete callback to trigger profile refresh
            onComplete?.();
        } catch (error) {
            console.error('Error saving profile:', error);
            setError('Failed to save your profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Welcome to DREAMME</h1>
                <p className="text-muted-foreground">Let's personalize your experience</p>
            </div>

            <div className="mb-8">
                <div className="flex justify-between mb-4">
                    {steps.map((_step, index) => (
                        <div
                            key={index}
                            className={`flex-1 h-2 rounded-full mx-1 ${index <= currentStep ? 'bg-primary' : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>
                <h2 className="text-xl font-semibold mb-4">{steps[currentStep].title}</h2>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            {steps[currentStep].component}

            <div className="flex justify-between mt-8">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0 || loading}
                >
                    Back
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                </Button>
            </div>
        </div>
    );
} 