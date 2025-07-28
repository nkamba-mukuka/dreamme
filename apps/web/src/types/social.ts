import type { WorkoutLog } from './exercise';
import type { JournalEntry } from './mental';

export type PrivacyLevel = 'public' | 'friends' | 'private';

export type WorkoutType = 'yoga' | 'running' | 'weightlifting' | 'hiit' | 'cycling' | 'swimming';
export type Availability = 'morning' | 'afternoon' | 'evening' | 'weekend';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface PublicProfile {
    userId: string;
    username: string;
    displayName: string;
    bio?: string;
    photoURL?: string;
    location?: string;
    websiteUrl?: string;
    socialLinks?: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
    };
    workoutPreferences?: {
        types: WorkoutType[];
        availability: Availability[];
        experienceLevel: ExperienceLevel;
    };
    interests?: string[];
    isFollowing?: boolean;
    stats: {
        totalWorkouts: number;
        workoutStreak: number;
        totalMinutes: number;
        achievementCount: number;
        followersCount: number;
        followingCount: number;
    };
    privacySettings: {
        workoutPrivacy: PrivacyLevel;
        journalPrivacy: PrivacyLevel;
        progressPrivacy: PrivacyLevel;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface Follow {
    id: string;
    followerId: string;
    followingId: string;
    status: 'pending' | 'accepted';
    createdAt: Date;
    updatedAt: Date;
}

export type PostType = 'workout' | 'achievement' | 'progress' | 'journal';

export interface Post {
    id: string;
    userId: string;
    type: PostType;
    content: string;
    mediaUrls?: string[];
    privacyLevel: PrivacyLevel;
    workoutLog?: WorkoutLog;
    journalEntry?: JournalEntry;
    achievement?: Achievement;
    stats: {
        likesCount: number;
        commentsCount: number;
        sharesCount: number;
    };
    tags: string[];
    location?: {
        name: string;
        latitude: number;
        longitude: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    replyTo?: string; // Parent comment ID for nested replies
    stats: {
        likesCount: number;
        repliesCount: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface Like {
    id: string;
    userId: string;
    targetType: 'post' | 'comment';
    targetId: string;
    createdAt: Date;
}

export interface Share {
    id: string;
    userId: string;
    postId: string;
    platform: 'internal' | 'whatsapp' | 'telegram' | 'twitter' | 'facebook';
    createdAt: Date;
}

export type AchievementCategory =
    | 'workout'
    | 'streak'
    | 'nutrition'
    | 'mental'
    | 'social'
    | 'special';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    category: AchievementCategory;
    imageUrl: string;
    requirement: {
        type: 'count' | 'streak' | 'duration' | 'custom';
        value: number;
        metric?: string;
    };
    points: number;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    createdAt: Date;
    updatedAt: Date;
}

export interface UserAchievement {
    id: string;
    userId: string;
    achievementId: string;
    progress: number;
    isCompleted: boolean;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Notification {
    id: string;
    userId: string;
    type:
    | 'follow_request'
    | 'follow_accept'
    | 'like'
    | 'comment'
    | 'reply'
    | 'mention'
    | 'achievement'
    | 'milestone';
    title: string;
    content: string;
    imageUrl?: string;
    data: {
        targetType: 'post' | 'comment' | 'profile' | 'achievement';
        targetId: string;
        actorId: string;
    };
    isRead: boolean;
    createdAt: Date;
}

// Helper type for activity feed filtering
export interface ActivityFeedFilters {
    postType?: PostType[];
    following?: boolean;
    dateRange?: {
        start: Date;
        end: Date;
    };
    location?: {
        latitude: number;
        longitude: number;
        radiusKm: number;
    };
    tags?: string[];
}

// Helper type for profile search
export interface ProfileSearchParams {
    query?: string;
    location?: string;
    achievementCategory?: AchievementCategory;
    minWorkouts?: number;
    maxWorkouts?: number;
    sortBy?: 'recent' | 'workouts' | 'streak' | 'achievements' | 'stats.totalWorkouts';
    workoutTypes?: WorkoutType[];
    availability?: Availability[];
    experienceLevel?: ExperienceLevel;
} 