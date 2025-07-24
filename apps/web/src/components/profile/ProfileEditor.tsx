import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { Button } from '@dreamme/ui';
import type { UserProfile, FitnessGoal, FitnessLevel } from '../../types/user';
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

export function ProfileEditor() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (user) {
            loadProfile();
        }
    }, [user]);

    const loadProfile = async () => {
        try {
            const data = await userProfileService.getProfile(user!.uid);
            setProfile(data);
        } catch (err) {
            console.error('Error loading profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !profile) return;

        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            await userProfileService.updateProfile(user.uid, profile);
            setSuccess(true);
        } catch (err) {
            console.error('Error saving profile:', err);
            setError('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Failed to load profile
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 p-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Profile Settings</h2>
                <p className="text-muted-foreground">Update your personal information and preferences</p>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 text-green-600 text-sm p-4 rounded-lg border border-green-200">
                    Profile updated successfully!
                </div>
            )}

            <div className="grid gap-6">
                <div className="grid gap-4">
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">First Name</label>
                            <input
                                type="text"
                                value={profile.personalInfo.firstName || ''}
                                onChange={(e) => setProfile(prev => ({
                                    ...prev!,
                                    personalInfo: { ...prev!.personalInfo, firstName: e.target.value }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Last Name</label>
                            <input
                                type="text"
                                value={profile.personalInfo.lastName || ''}
                                onChange={(e) => setProfile(prev => ({
                                    ...prev!,
                                    personalInfo: { ...prev!.personalInfo, lastName: e.target.value }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid gap-4">
                    <h3 className="text-lg font-medium">Fitness Goals</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {fitnessGoals.map((goal) => (
                            <Button
                                key={goal.value}
                                type="button"
                                variant={profile.fitnessGoals.includes(goal.value) ? 'default' : 'outline'}
                                onClick={() => setProfile(prev => ({
                                    ...prev!,
                                    fitnessGoals: prev!.fitnessGoals.includes(goal.value)
                                        ? prev!.fitnessGoals.filter(g => g !== goal.value)
                                        : [...prev!.fitnessGoals, goal.value]
                                }))}
                                className="w-full justify-start"
                            >
                                {goal.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid gap-4">
                    <h3 className="text-lg font-medium">Fitness Level</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {fitnessLevels.map((level) => (
                            <Button
                                key={level.value}
                                type="button"
                                variant={profile.fitnessLevel === level.value ? 'default' : 'outline'}
                                onClick={() => setProfile(prev => ({
                                    ...prev!,
                                    fitnessLevel: level.value
                                }))}
                                className="w-full justify-start"
                            >
                                {level.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="grid gap-4">
                    <h3 className="text-lg font-medium">Preferences</h3>
                    <div className="grid gap-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="workoutReminders"
                                checked={profile.preferences.workoutReminders}
                                onChange={(e) => setProfile(prev => ({
                                    ...prev!,
                                    preferences: { ...prev!.preferences, workoutReminders: e.target.checked }
                                }))}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="workoutReminders" className="text-sm font-medium">
                                Enable workout reminders
                            </label>
                        </div>
                        {profile.preferences.workoutReminders && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Reminder Time</label>
                                <input
                                    type="time"
                                    value={profile.preferences.reminderTime || '09:00'}
                                    onChange={(e) => setProfile(prev => ({
                                        ...prev!,
                                        preferences: { ...prev!.preferences, reminderTime: e.target.value }
                                    }))}
                                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Weekly Workout Goal</label>
                            <input
                                type="number"
                                min="1"
                                max="7"
                                value={profile.preferences.weeklyGoal}
                                onChange={(e) => setProfile(prev => ({
                                    ...prev!,
                                    preferences: { ...prev!.preferences, weeklyGoal: parseInt(e.target.value) }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Preferred Workout Duration (minutes)</label>
                            <input
                                type="number"
                                min="5"
                                step="5"
                                value={profile.preferences.preferredWorkoutDuration}
                                onChange={(e) => setProfile(prev => ({
                                    ...prev!,
                                    preferences: { ...prev!.preferences, preferredWorkoutDuration: parseInt(e.target.value) }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Measurement Unit</label>
                            <select
                                value={profile.preferences.measurementUnit}
                                onChange={(e) => setProfile(prev => ({
                                    ...prev!,
                                    preferences: { ...prev!.preferences, measurementUnit: e.target.value as 'metric' | 'imperial' }
                                }))}
                                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                            >
                                <option value="metric">Metric (kg, cm)</option>
                                <option value="imperial">Imperial (lb, in)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => loadProfile()}
                    disabled={saving}
                >
                    Reset
                </Button>
                <Button
                    type="submit"
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
} 