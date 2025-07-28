import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Button } from '@dreamme/ui';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'framer-motion';
import { exerciseService } from '../services/exerciseService';
import { userProfileService } from '../services/userProfile';

interface DailyActivity {
    exercise: boolean;
    nutrition: boolean;
    mental: boolean;
    completed?: boolean;
    lastUpdated: string;
}

interface UserProgress {
    workouts: {
        completed: number;
        goal: number;
        streak: number;
    };
    nutrition: {
        mealsLogged: number;
        calorieGoal: number;
        currentCalories: number;
    };
    mental: {
        moodScore: number;
        journalStreak: number;
        breathingMinutes: number;
    };
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dailyActivity, setDailyActivity] = useState<DailyActivity | null>(null);
    const [progress, setProgress] = useState<UserProgress | null>(null);

    const loadDashboardData = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            // Load daily activity status
            const today = new Date().toISOString().split('T')[0];
            const activityDoc = await getDoc(doc(db, 'dailyActivity', `${user.uid}_${today}`));

            if (activityDoc.exists()) {
                setDailyActivity(activityDoc.data() as DailyActivity);
            } else {
                // Initialize daily activity if not exists
                setDailyActivity({
                    exercise: false,
                    nutrition: false,
                    mental: false,
                    completed: false,
                    lastUpdated: today
                });
            }

            // Load progress data if activities are completed
            if (activityDoc.exists()) {
                const progressDoc = await getDoc(doc(db, 'progress', user.uid));
                if (progressDoc.exists()) {
                    setProgress(progressDoc.data() as UserProgress);
                }
            }

        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError('Failed to load dashboard data. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
                    {error}
                </div>
                <Button onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="container mx-auto px-4 py-8"
        >
            <motion.h1
                variants={item}
                className="text-4xl font-bold mb-8 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600"
            >
                Welcome DreamMe!
            </motion.h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Exercise Card */}
                <motion.div
                    variants={item}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Exercise</h2>
                        <span className="text-3xl">💪</span>
                    </div>

                    {dailyActivity?.exercise ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span>Today's Progress</span>
                                <span>{progress?.workouts.completed || 0} / {progress?.workouts.goal || 0}</span>
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                    style={{
                                        width: `${progress?.workouts.completed && progress?.workouts.goal ?
                                            (progress.workouts.completed / progress.workouts.goal) * 100 : 0}%`
                                    }}
                                />
                            </div>
                            {!dailyActivity.completed && (
                                <Button
                                    onClick={async () => {
                                        try {
                                            await setDoc(doc(db, 'dailyActivity', `${user?.uid}_${new Date().toISOString().split('T')[0]}`), {
                                                ...dailyActivity,
                                                completed: true,
                                                lastUpdated: new Date()
                                            }, { merge: true });
                                            loadDashboardData();
                                        } catch (err) {
                                            console.error('Error marking as complete:', err);
                                        }
                                    }}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2"
                                >
                                    Mark as Complete
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-white/80">Don't forget your exercise</p>
                            <Button
                                onClick={() => navigate('/exercise')}
                                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 shadow-sm text-white font-medium py-3"
                            >
                                Log Exercise
                            </Button>
                        </div>
                    )}
                </motion.div>

                {/* Nutrition Card */}
                <motion.div
                    variants={item}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Nutrition</h2>
                        <span className="text-3xl">🥗</span>
                    </div>

                    {dailyActivity?.nutrition ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span>Calories Today</span>
                                <span>{progress?.nutrition.currentCalories || 0} / {progress?.nutrition.calorieGoal || 0}</span>
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 to-teal-500 rounded-full"
                                    style={{
                                        width: `${progress?.nutrition.currentCalories && progress?.nutrition.calorieGoal ?
                                            (progress.nutrition.currentCalories / progress.nutrition.calorieGoal) * 100 : 0}%`
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-white/80">Don't forget your nutrition</p>
                            <Button
                                onClick={() => navigate('/nutrition')}
                                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 shadow-sm text-white font-medium py-3"
                            >
                                Log Nutrition
                            </Button>
                        </div>
                    )}
                </motion.div>

                {/* Mental Health Card */}
                <motion.div
                    variants={item}
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Mental Health</h2>
                        <span className="text-3xl">🧠</span>
                    </div>

                    {dailyActivity?.mental ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span>Breathing Minutes</span>
                                <span>{progress?.mental.breathingMinutes || 0} mins</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Journal Streak</span>
                                <span>{progress?.mental.journalStreak || 0} days</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-white/80">Don't forget your mental health</p>
                            <Button
                                onClick={() => navigate('/mental')}
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-sm text-white font-medium py-3"
                            >
                                Log Mental Activity
                            </Button>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
} 