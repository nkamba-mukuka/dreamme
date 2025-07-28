import { useState } from 'react';
import { Button } from '@dreamme/ui';
import { BackButton } from '../components/layout/BackButton';
import { ActivityFeed } from '../components/social/ActivityFeed';
import { UserProfile } from '../components/social/UserProfile';
import { useAuth } from '../lib/auth';

type View = 'feed' | 'profile';

export default Social;

export function Social() {
    const { user } = useAuth();
    const [currentView, setCurrentView] = useState<View>('feed');

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <BackButton />
                <h1 className="text-3xl font-bold mb-4">Social</h1>
                <p className="text-gray-600">Please sign in to access social features.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Social</h1>
                <div className="flex space-x-4">
                    <Button
                        variant={currentView === 'feed' ? 'default' : 'outline'}
                        onClick={() => setCurrentView('feed')}
                    >
                        Activity Feed
                    </Button>
                    <Button
                        variant={currentView === 'profile' ? 'default' : 'outline'}
                        onClick={() => setCurrentView('profile')}
                    >
                        My Profile
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                {currentView === 'feed' && <ActivityFeed />}
                {currentView === 'profile' && <UserProfile />}
            </div>
        </div>
    );
} 