import { useState } from 'react';
import { Button } from '@dreamme/ui';
import { BackButton } from '../components/layout/BackButton';
import { useAuth } from '../lib/auth';

type View = 'account' | 'notifications' | 'privacy';

interface NotificationPreferences {
    allReminders: boolean;
    exerciseReminders: boolean;
    nutritionReminders: boolean;
    moodReminders: boolean;
}

interface PrivacySettings {
    hideMoodData: boolean;
    hideExerciseData: boolean;
    hideNutritionData: boolean;
}

export default Settings;

export function Settings() {
    const { user } = useAuth();
    const [currentView, setCurrentView] = useState<View>('account');
    const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
        allReminders: true,
        exerciseReminders: false,
        nutritionReminders: false,
        moodReminders: false,
    });
    const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
        hideMoodData: false,
        hideExerciseData: false,
        hideNutritionData: false,
    });

    const handleNotificationChange = (key: keyof NotificationPreferences) => {
        setNotificationPrefs(prev => {
            const newPrefs = { ...prev };
            if (key === 'allReminders') {
                // If toggling all reminders, update all other settings
                const newValue = !prev.allReminders;
                return {
                    allReminders: newValue,
                    exerciseReminders: newValue,
                    nutritionReminders: newValue,
                    moodReminders: newValue,
                };
            } else {
                // If toggling individual reminder, update that specific one
                newPrefs[key] = !prev[key];
                // Update allReminders based on other settings
                newPrefs.allReminders =
                    newPrefs.exerciseReminders &&
                    newPrefs.nutritionReminders &&
                    newPrefs.moodReminders;
                return newPrefs;
            }
        });
    };

    const handlePrivacyChange = (key: keyof PrivacySettings) => {
        setPrivacySettings(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <BackButton />
                <h1 className="text-3xl font-bold mb-4">Settings</h1>
                <p className="text-gray-600">Please sign in to access settings.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Settings</h1>
                <div className="flex space-x-4">
                    <Button
                        variant={currentView === 'account' ? 'default' : 'outline'}
                        onClick={() => setCurrentView('account')}
                    >
                        Account
                    </Button>
                    <Button
                        variant={currentView === 'notifications' ? 'default' : 'outline'}
                        onClick={() => setCurrentView('notifications')}
                    >
                        Notifications
                    </Button>
                    <Button
                        variant={currentView === 'privacy' ? 'default' : 'outline'}
                        onClick={() => setCurrentView('privacy')}
                    >
                        Privacy
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
                {currentView === 'account' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={user.email || ''}
                                        readOnly
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
                {currentView === 'notifications' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium">All Reminders</h3>
                                    <p className="text-sm text-gray-500">Enable or disable all reminders at once</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notificationPrefs.allReminders}
                                        onChange={() => handleNotificationChange('allReminders')}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                                    <span className="font-medium">Exercise Reminders</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notificationPrefs.exerciseReminders}
                                            onChange={() => handleNotificationChange('exerciseReminders')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                                    <span className="font-medium">Nutrition Reminders</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notificationPrefs.nutritionReminders}
                                            onChange={() => handleNotificationChange('nutritionReminders')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                                    <span className="font-medium">Mood Reminders</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={notificationPrefs.moodReminders}
                                            onChange={() => handleNotificationChange('moodReminders')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {currentView === 'privacy' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                                    <div>
                                        <h3 className="font-medium">Hide Mood Data</h3>
                                        <p className="text-sm text-gray-500">Keep your mood entries private from other users</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={privacySettings.hideMoodData}
                                            onChange={() => handlePrivacyChange('hideMoodData')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                                    <div>
                                        <h3 className="font-medium">Hide Exercise Data</h3>
                                        <p className="text-sm text-gray-500">Keep your exercise activities private from other users</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={privacySettings.hideExerciseData}
                                            onChange={() => handlePrivacyChange('hideExerciseData')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                                    <div>
                                        <h3 className="font-medium">Hide Nutrition Data</h3>
                                        <p className="text-sm text-gray-500">Keep your nutrition and meal data private from other users</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={privacySettings.hideNutritionData}
                                            onChange={() => handlePrivacyChange('hideNutritionData')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 