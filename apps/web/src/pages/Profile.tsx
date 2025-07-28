import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { Button, Card } from '@dreamme/ui';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProfileImageUpload } from '../components/profile/ProfileImageUpload';

interface UserProfile {
    displayName: string;
    age: number;
    weight: number;
    email: string;
    photoURL?: string;
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
        weight: number;
        email: string;
    }>({
        displayName: '',
        age: 0,
        weight: 0,
        email: ''
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
                    displayName: data.displayName || '',
                    age: data.age || 0,
                    weight: data.weight || 0,
                    email: data.email || user.email || ''
                });
            } else {
                // Initialize with user's email if profile doesn't exist
                setFormData(prev => ({
                    ...prev,
                    email: user.email || ''
                }));
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
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
        <div className="container mx-auto px-4 py-8 max-w-md">
            <Card className="bg-white shadow-lg rounded-2xl overflow-hidden">
                <div className="p-6">
                    <div className="flex flex-col items-center">
                        <div className="mb-6 w-32 h-32">
                            <ProfileImageUpload
                                userId={user.uid}
                                currentPhotoURL={profile?.photoURL}
                                onUploadComplete={handlePhotoUpload}
                            />
                        </div>

                        {!isEditing ? (
                            // View Mode
                            <div className="w-full space-y-4">
                                <div className="text-center mb-6">
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {profile?.displayName || 'Add Your Name'}
                                    </h1>
                                    <p className="text-gray-500">{profile?.email || user.email}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                                        <p className="text-sm text-gray-500">Age</p>
                                        <p className="font-semibold">{profile?.age || 'Not set'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                                        <p className="text-sm text-gray-500">Weight</p>
                                        <p className="font-semibold">{profile?.weight ? `${profile.weight} kg` : 'Not set'}</p>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => setIsEditing(true)}
                                    variant="primary"
                                    className="w-full mt-6"
                                >
                                    Edit Profile
                                </Button>
                            </div>
                        ) : (
                            // Edit Mode
                            <form onSubmit={handleSubmit} className="w-full space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="displayName"
                                        value={formData.displayName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Your name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                                        placeholder="Your email"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                        min="13"
                                        max="120"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                        min="30"
                                        max="300"
                                        step="0.1"
                                        required
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="flex-1"
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
} 