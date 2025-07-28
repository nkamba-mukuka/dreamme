import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { motion } from 'framer-motion';

const EXTERNAL_COMMUNITIES = [
    {
        id: 'reddit-fitness',
        name: 'Reddit Fitness',
        members: '3.2M+',
        icon: '💪',
        description: 'A community dedicated to fitness and exercise',
        link: 'https://www.reddit.com/r/Fitness/'
    },
    {
        id: 'myfitnesspal',
        name: 'MyFitnessPal Community',
        members: '2M+',
        icon: '🥗',
        description: 'Connect with fellow MyFitnessPal users',
        link: 'https://community.myfitnesspal.com/'
    },
    {
        id: 'bodybuilding',
        name: 'Bodybuilding.com Forums',
        members: '1.5M+',
        icon: '🏋️‍♂️',
        description: 'The world\'s largest fitness community',
        link: 'https://forum.bodybuilding.com/'
    },
    {
        id: 'strava',
        name: 'Strava',
        members: '95M+',
        icon: '🏃‍♂️',
        description: 'Connect with athletes and share your activities',
        link: 'https://www.strava.com/'
    },
    {
        id: 'fitocracy',
        name: 'Fitocracy',
        members: '1M+',
        icon: '🎮',
        description: 'Level up your fitness with gamification',
        link: 'https://www.fitocracy.com/'
    },
    {
        id: 'loseit',
        name: 'Reddit LoseIt',
        members: '3.5M+',
        icon: '⚖️',
        description: 'A community focused on weight loss',
        link: 'https://www.reddit.com/r/loseit/'
    }
];

export function ActivityFeed() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleJoinCommunity = (link: string) => {
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Fitness Communities</h2>
                <p className="text-gray-600">Join and connect with fitness enthusiasts worldwide</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {EXTERNAL_COMMUNITIES.map((community) => (
                    <motion.div
                        key={community.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                    >
                        <div className="flex items-center space-x-4 mb-4">
                            <span className="text-3xl">{community.icon}</span>
                            <div>
                                <h3 className="font-semibold text-lg">{community.name}</h3>
                                <p className="text-sm text-gray-500">{community.members} members</p>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-4">{community.description}</p>

                        <Button
                            onClick={() => handleJoinCommunity(community.link)}
                            className="w-full"
                        >
                            Join Community
                        </Button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
} 