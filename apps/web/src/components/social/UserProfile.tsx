import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { Button } from '@dreamme/ui';
import { motion } from 'framer-motion';
import { userProfileService } from '../../services/userProfile';

interface UserProfileProps {
    userId?: string;
}

export function UserProfile({ userId }: UserProfileProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profileId = userId || user?.uid;
                if (!profileId) return;
                const userProfile = await userProfileService.getProfile(profileId);
                setProfile(userProfile);
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [user, userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                {/* Cover Image */}
                <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                {/* Profile Info */}
                <div className="relative px-6 pb-6">
                    {/* Profile Picture */}
                    <div className="absolute -top-16 left-6">
                        <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-lg">
                            <img
                                src="/profile_photo.jpeg"
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="pt-20">
                        <h1 className="text-2xl font-bold">{profile?.name || user?.displayName}</h1>
                        <p className="text-gray-600 mt-1">{profile?.bio || "Fitness enthusiast"}</p>

                        {/* Stats */}
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{profile?.stats?.workouts || 0}</p>
                                <p className="text-sm text-gray-600">Workouts</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{profile?.stats?.streak || 0}</p>
                                <p className="text-sm text-gray-600">Day Streak</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold">{profile?.stats?.achievements || 0}</p>
                                <p className="text-sm text-gray-600">Achievements</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Fitness Communities */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
            >
                <h2 className="text-xl font-bold mb-4">Fitness Communities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <a
                        href="https://t.me/yogalovers"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                    >
                        <span className="text-2xl">🧘‍♀️</span>
                        <div>
                            <p className="font-semibold">Yoga Lovers</p>
                            <p className="text-sm opacity-80">1.2k members</p>
                        </div>
                    </a>
                    <a
                        href="https://t.me/runnersclub"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200"
                    >
                        <span className="text-2xl">🏃‍♂️</span>
                        <div>
                            <p className="font-semibold">Runners Club</p>
                            <p className="text-sm opacity-80">2.3k members</p>
                        </div>
                    </a>
                    <a
                        href="https://t.me/weighttraining"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
                    >
                        <span className="text-2xl">🏋️‍♀️</span>
                        <div>
                            <p className="font-semibold">Weight Training</p>
                            <p className="text-sm opacity-80">3.4k members</p>
                        </div>
                    </a>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                <Button
                    onClick={() => window.open('https://t.me/dreamme_fitness', '_blank')}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 h-auto py-4"
                >
                    <div>
                        <p className="font-semibold">Join Our Main Community</p>
                        <p className="text-sm opacity-80">Connect with fellow fitness enthusiasts</p>
                    </div>
                </Button>
                <Button
                    onClick={() => window.open('https://t.me/dreamme_support', '_blank')}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 h-auto py-4"
                >
                    <div>
                        <p className="font-semibold">Get Support</p>
                        <p className="text-sm opacity-80">24/7 fitness guidance and motivation</p>
                    </div>
                </Button>
            </motion.div>
        </div>
    );
} 