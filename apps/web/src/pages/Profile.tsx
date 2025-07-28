import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { Button, Card } from '@dreamme/ui';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProfileImageUpload } from '../components/profile/ProfileImageUpload';
import { ProfileStats } from '../components/profile/ProfileStats';
import { ProfileActivity } from '../components/profile/ProfileActivity';

interface UserProfile {
    displayName: string;
    age: number;
    bio: string;
    fitnessGoal: string;
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
    photoURL?: string;
    createdAt: Date;
    updatedAt: Date;
}

export default function Profile() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<{
        displayName: string;
        age: number;
        bio: string;
        fitnessGoal: string;
        fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
    }>({
        displayName: '',
        age: 0,
        bio: '',
        fitnessGoal: '',
        fitnessLevel: 'beginner'
    });

    useEffect(() => {
        loadProfile();
    }, [user]);

    const loadProfile = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
            if (profileDoc.exists()) {
                const data = profileDoc.data() as UserProfile;
                setProfile(data);
                setFormData({
                    displayName: data.displayName,
                    age: data.age,
                    bio: data.bio,
                    fitnessGoal: data.fitnessGoal,
                    fitnessLevel: data.fitnessLevel
                });
            }
        } catch (err) {
            console.error('Error loading profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            await updateDoc(doc(db, 'profiles', user.uid), {
                ...formData,
                updatedAt: new Date()
            });

            await loadProfile();
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'age' ? parseInt(value) : value
        }));
    };

    const handlePhotoUpload = (url: string) => {
        if (profile) {
            setProfile({ ...profile, photoURL: url });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-8">
                <p className="text-white/60">Please sign in to view your profile</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <ProfileImageUpload
                        userId={user.uid}
                        currentPhotoURL={profile?.photoURL}
                        onUploadComplete={handlePhotoUpload}
                    />
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900">{profile?.displayName}</h1>
                        <p className="text-gray-600 mt-2">{profile?.bio}</p>
                        <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                {profile?.fitnessLevel ? profile.fitnessLevel.charAt(0).toUpperCase() + profile.fitnessLevel.slice(1) : 'Not Set'}
                            </span>
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                Goal: {profile?.fitnessGoal || 'Not Set'}
                            </span>
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                Age: {profile?.age || 'Not Set'}
                            </span>
                        </div>
                        {!isEditing && (
                            <Button
                                onClick={() => setIsEditing(true)}
                                variant="outline"
                                className="mt-6"
                            >
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </div>

                {/* Edit Form */}
                {isEditing && (
                    <form onSubmit={handleSubmit} className="mt-8 border-t border-gray-200 pt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-medium mb-2 text-gray-700">Display Name</label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-medium mb-2 text-gray-700">Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                    min="13"
                                    max="120"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block font-medium mb-2 text-gray-700">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block font-medium mb-2 text-gray-700">Fitness Goal</label>
                                <select
                                    name="fitnessGoal"
                                    value={formData.fitnessGoal}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                >
                                    <option value="">Select a goal</option>
                                    <option value="weight-loss">Weight Loss</option>
                                    <option value="muscle-gain">Muscle Gain</option>
                                    <option value="endurance">Endurance</option>
                                    <option value="flexibility">Flexibility</option>
                                    <option value="general">General Fitness</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium mb-2 text-gray-700">Fitness Level</label>
                                <select
                                    name="fitnessLevel"
                                    value={formData.fitnessLevel}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                )}
            </div>

            {/* Stats and Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats - Takes up 2 columns */}
                <div className="lg:col-span-2">
                    <ProfileStats userId={user.uid} />
                </div>

                {/* Activity Feed - Takes up 1 column */}
                <div>
                    <ProfileActivity userId={user.uid} />
                </div>
            </div>
        </div>
    );
} 