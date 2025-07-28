import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { Button, Card } from '@dreamme/ui';
import { userProfileService } from '../../services/userProfile';
import type { UserProfile as UserProfileType } from '../../types/user';

interface UserProfileProps {
    userId?: string;
}

interface ProfileFormData {
    displayName: string;
    email: string;
    bio?: string;
    location?: string;
    avatar?: string;
    personalInfo: {
        firstName?: string;
        lastName?: string;
    };
}

const DEFAULT_AVATAR = '👤';
const DEBUG = true; // Add debugging

export function UserProfile({ userId }: UserProfileProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfileType | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<ProfileFormData>({
        displayName: '',
        email: '',
        personalInfo: {}
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profileId = userId || user?.uid;
                if (!profileId) return;

                const userProfile = await userProfileService.getProfile(profileId);
                if (userProfile) {
                    setProfile(userProfile);
                    setFormData({
                        displayName: userProfile.displayName || '',
                        email: userProfile.email || '',
                        bio: userProfile.personalInfo?.bio,
                        location: userProfile.personalInfo?.location,
                        avatar: userProfile.personalInfo?.avatar || DEFAULT_AVATAR,
                        personalInfo: {
                            firstName: userProfile.personalInfo?.firstName,
                            lastName: userProfile.personalInfo?.lastName,
                        }
                    });
                } else if (user) {
                    // Initialize with user's email if profile doesn't exist
                    setFormData(prev => ({
                        ...prev,
                        displayName: user.displayName || '',
                        email: user.email || '',
                        avatar: DEFAULT_AVATAR,
                        personalInfo: {}
                    }));
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [user, userId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setLoading(true);
            if (DEBUG) console.log('Updating profile with data:', formData);

            // Create an object with only defined values for personal info
            const personalInfoUpdate = {
                ...(formData.personalInfo.firstName && { firstName: formData.personalInfo.firstName }),
                ...(formData.personalInfo.lastName && { lastName: formData.personalInfo.lastName }),
                ...(formData.bio !== undefined && { bio: formData.bio }),
                ...(formData.location !== undefined && { location: formData.location }),
                ...(formData.avatar && { avatar: formData.avatar })
            };

            // First, update the personal info
            await userProfileService.updatePersonalInfo(user.uid, personalInfoUpdate);

            // Then update the main profile data
            await userProfileService.updateProfile(user.uid, {
                displayName: formData.displayName || '',
                email: formData.email || ''
            });

            if (DEBUG) console.log('Profile updated, fetching latest data...');

            // Fetch the updated profile
            const updatedProfile = await userProfileService.getProfile(user.uid);
            if (DEBUG) console.log('Fetched updated profile:', updatedProfile);

            if (updatedProfile) {
                setProfile(updatedProfile);
                setFormData({
                    displayName: updatedProfile.displayName || '',
                    email: updatedProfile.email || '',
                    bio: updatedProfile.personalInfo?.bio,
                    location: updatedProfile.personalInfo?.location,
                    avatar: updatedProfile.personalInfo?.avatar || DEFAULT_AVATAR,
                    personalInfo: {
                        firstName: updatedProfile.personalInfo?.firstName,
                        lastName: updatedProfile.personalInfo?.lastName,
                    }
                });
                if (DEBUG) console.log('Local state updated successfully');
            }

            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            // Show error in UI
            alert('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <Card className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6">
                    {!isEditing ? (
                        // View Mode
                        <div className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl">
                                    {profile?.personalInfo?.avatar || formData.avatar || DEFAULT_AVATAR}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        {profile?.displayName || formData.displayName || user?.displayName || 'Anonymous'}
                                    </h1>
                                    <p className="text-gray-500">{profile?.email || formData.email || user?.email}</p>
                                    {(profile?.personalInfo?.location || formData.location) && (
                                        <p className="text-gray-500 text-sm mt-1">
                                            📍 {profile?.personalInfo?.location || formData.location}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <h2 className="text-gray-500 text-sm mb-2">About</h2>
                                <p className="text-gray-700">
                                    {profile?.personalInfo?.bio || formData.bio || 'No bio yet'}
                                </p>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <p className="text-gray-500 text-sm">
                                    Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently'}
                                </p>
                            </div>

                            {!userId && (
                                <div className="pt-4">
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        variant="primary"
                                        className="w-full"
                                    >
                                        Edit Profile
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Edit Mode
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
                                    {formData.avatar || DEFAULT_AVATAR}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Avatar
                                    </label>
                                    <input
                                        type="text"
                                        name="avatar"
                                        value={formData.avatar || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Enter an emoji"
                                        maxLength={2}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Your name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Your location"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                                    rows={4}
                                    placeholder="Tell us about yourself"
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
            </Card>
        </div>
    );
} 