import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { Replay } from '@sentry/replay';
import { Integration } from '@sentry/types';
import { getAnalytics, logEvent, setUserProperties } from 'firebase/analytics';
import { app } from './firebase';

// Initialize Sentry
Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
        new BrowserTracing({
            tracePropagationTargets: ['localhost', /^https:\/\/[^/]*dreamme\.app/],
        }) as unknown as Integration,
        new Replay() as unknown as Integration,
    ],
    tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
    replaysSessionSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
});

// Initialize Firebase Analytics
const analytics = getAnalytics(app);

// Monitoring service
export const monitoring = {
    // Error tracking
    captureError: (error: Error, context?: Record<string, any>) => {
        console.error(error);
        Sentry.captureException(error, { extra: context });
    },

    captureMessage: (message: string, level: Sentry.SeverityLevel = 'info') => {
        Sentry.captureMessage(message, level);
    },

    setUser: (user: { id: string; email?: string; username?: string }) => {
        Sentry.setUser(user);
        setUserProperties(analytics, {
            userId: user.id,
            userType: 'member',
        });
    },

    clearUser: () => {
        Sentry.setUser(null);
    },

    // Analytics events
    logEvent: (eventName: string, params?: Record<string, any>) => {
        logEvent(analytics, eventName, params);
    },

    // Common analytics events
    events: {
        // Auth events
        signIn: (method: 'email' | 'google') => {
            monitoring.logEvent('login', { method });
        },
        signUp: (method: 'email' | 'google') => {
            monitoring.logEvent('sign_up', { method });
        },
        signOut: () => {
            monitoring.logEvent('logout');
        },

        // Profile events
        updateProfile: () => {
            monitoring.logEvent('update_profile');
        },
        completeOnboarding: () => {
            monitoring.logEvent('complete_onboarding');
        },

        // Workout events
        startWorkout: (exerciseCount: number) => {
            monitoring.logEvent('start_workout', { exerciseCount });
        },
        completeWorkout: (duration: number, calories: number) => {
            monitoring.logEvent('complete_workout', { duration, calories });
        },
        logExercise: (exerciseId: string, sets: number, reps: number) => {
            monitoring.logEvent('log_exercise', { exerciseId, sets, reps });
        },

        // Nutrition events
        createMealPlan: () => {
            monitoring.logEvent('create_meal_plan');
        },
        logMeal: (calories: number, protein: number, carbs: number, fat: number) => {
            monitoring.logEvent('log_meal', { calories, protein, carbs, fat });
        },
        createRecipe: () => {
            monitoring.logEvent('create_recipe');
        },

        // Mental health events
        createJournalEntry: (mood: number) => {
            monitoring.logEvent('create_journal_entry', { mood });
        },
        completeBreathingSession: (duration: number, pattern: string) => {
            monitoring.logEvent('complete_breathing_session', { duration, pattern });
        },
        createMotivation: () => {
            monitoring.logEvent('create_motivation');
        },

        // Social events
        createPost: (type: string) => {
            monitoring.logEvent('create_post', { type });
        },
        followUser: () => {
            monitoring.logEvent('follow_user');
        },
        likePost: () => {
            monitoring.logEvent('like_post');
        },
        commentPost: () => {
            monitoring.logEvent('comment_post');
        },
        sharePost: () => {
            monitoring.logEvent('share_post');
        },
        unlockAchievement: (achievementId: string) => {
            monitoring.logEvent('unlock_achievement', { achievementId });
        },

        // Feature usage
        viewPage: (pageName: string) => {
            monitoring.logEvent('page_view', { pageName });
        },
        useFeature: (featureName: string) => {
            monitoring.logEvent('use_feature', { featureName });
        },
        searchContent: (query: string, resultCount: number) => {
            monitoring.logEvent('search', { query, resultCount });
        },
    },

    // Performance monitoring
    startPerformanceTrace: (name: string) => {
        return {
            finish: () => { },
            setAttribute: (key: string, value: string) => { },
            setTag: (key: string, value: string) => { },
        };
    },
}; 