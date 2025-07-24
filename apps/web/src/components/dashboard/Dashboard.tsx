import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { Button } from '@dreamme/ui';
import { ProfileEditor } from '../profile/ProfileEditor';

export function Dashboard() {
    const { user, logout } = useAuth();
    const [showProfileEditor, setShowProfileEditor] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold text-gradient">DREAMME</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                onClick={() => setShowProfileEditor(!showProfileEditor)}
                            >
                                {user?.email}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {showProfileEditor ? (
                    <div className="bg-white rounded-xl shadow-sm">
                        <ProfileEditor />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Quick Stats */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="text-lg font-semibold mb-2">Workout Progress</h3>
                            <p className="text-3xl font-bold text-primary">0/30</p>
                            <p className="text-sm text-gray-500">Days Completed</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="text-lg font-semibold mb-2">Nutrition Goals</h3>
                            <p className="text-3xl font-bold text-primary">1,800</p>
                            <p className="text-sm text-gray-500">Daily Calorie Target</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="text-lg font-semibold mb-2">Mental Wellness</h3>
                            <p className="text-3xl font-bold text-primary">7/10</p>
                            <p className="text-sm text-gray-500">Today's Mood</p>
                        </div>

                        {/* Quick Actions */}
                        <div className="md:col-span-2 lg:col-span-3">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600">
                                        Start Workout
                                    </Button>
                                    <Button className="w-full bg-gradient-to-r from-green-500 to-green-600">
                                        Log Meal
                                    </Button>
                                    <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600">
                                        Journal Entry
                                    </Button>
                                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600">
                                        Meditate
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Coming Soon Section */}
                        <div className="md:col-span-2 lg:col-span-3">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 border border-dashed rounded-lg text-center">
                                        <h4 className="font-medium text-gray-800">AI Workout Plans</h4>
                                        <p className="text-sm text-gray-500">Personalized training based on your goals</p>
                                    </div>
                                    <div className="p-4 border border-dashed rounded-lg text-center">
                                        <h4 className="font-medium text-gray-800">Community Features</h4>
                                        <p className="text-sm text-gray-500">Connect with fitness buddies</p>
                                    </div>
                                    <div className="p-4 border border-dashed rounded-lg text-center">
                                        <h4 className="font-medium text-gray-800">Progress Analytics</h4>
                                        <p className="text-sm text-gray-500">Detailed insights into your journey</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
} 