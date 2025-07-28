import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../test/utils';
import { UserProfile } from './UserProfile';
import { socialService } from '../../services/socialService';

// Mock the social service
vi.mock('../../services/socialService', () => ({
    socialService: {
        getProfile: vi.fn(),
        getActivityFeed: vi.fn(),
        getUserAchievements: vi.fn(),
        getAchievements: vi.fn(),
        getFollowerCount: vi.fn(),
        getFollowingCount: vi.fn(),
        followUser: vi.fn(),
        unfollowUser: vi.fn(),
    },
}));

describe('UserProfile', () => {
    const mockProfile = {
        userId: 'test-user-id',
        username: 'testuser',
        displayName: 'Test User',
        bio: 'Test bio',
        stats: {
            totalWorkouts: 10,
            workoutStreak: 5,
            totalMinutes: 300,
            achievementCount: 3,
            followersCount: 20,
            followingCount: 15,
        },
        privacySettings: {
            workoutPrivacy: 'public',
            journalPrivacy: 'friends',
            progressPrivacy: 'private',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockPosts = [
        {
            id: 'post-1',
            userId: 'test-user-id',
            type: 'workout',
            content: 'Test workout post',
            privacyLevel: 'public',
            stats: {
                likesCount: 5,
                commentsCount: 2,
                sharesCount: 1,
            },
            tags: ['workout', 'fitness'],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    const mockAchievements = [
        {
            id: 'achievement-1',
            title: 'First Workout',
            description: 'Complete your first workout',
            category: 'workout',
            imageUrl: 'test.jpg',
            requirement: {
                type: 'count',
                value: 1,
                metric: 'workouts',
            },
            points: 100,
            rarity: 'common',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    const mockUserAchievements = [
        {
            id: 'user-achievement-1',
            userId: 'test-user-id',
            achievementId: 'achievement-1',
            progress: 1,
            isCompleted: true,
            completedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    beforeEach(() => {
        // Reset all mocks
        vi.resetAllMocks();

        // Setup mock implementations
        (socialService.getProfile as any).mockResolvedValue(mockProfile);
        (socialService.getActivityFeed as any).mockResolvedValue(mockPosts);
        (socialService.getAchievements as any).mockResolvedValue(mockAchievements);
        (socialService.getUserAchievements as any).mockResolvedValue(mockUserAchievements);
        (socialService.getFollowerCount as any).mockResolvedValue(20);
        (socialService.getFollowingCount as any).mockResolvedValue(15);
    });

    it('renders loading state initially', () => {
        render(<UserProfile userId="test-user-id" />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders user profile information', async () => {
        render(<UserProfile userId="test-user-id" />);

        await waitFor(() => {
            expect(screen.getByText('Test User')).toBeInTheDocument();
            expect(screen.getByText('@testuser')).toBeInTheDocument();
            expect(screen.getByText('Test bio')).toBeInTheDocument();
        });
    });

    it('renders user stats', async () => {
        render(<UserProfile userId="test-user-id" />);

        await waitFor(() => {
            expect(screen.getByText('10')).toBeInTheDocument(); // Total workouts
            expect(screen.getByText('5')).toBeInTheDocument(); // Workout streak
            expect(screen.getByText('300')).toBeInTheDocument(); // Total minutes
            expect(screen.getByText('3')).toBeInTheDocument(); // Achievement count
        });
    });

    it('renders recent activity', async () => {
        render(<UserProfile userId="test-user-id" />);

        await waitFor(() => {
            expect(screen.getByText('Test workout post')).toBeInTheDocument();
            expect(screen.getByText('5 likes')).toBeInTheDocument();
            expect(screen.getByText('2 comments')).toBeInTheDocument();
        });
    });

    it('renders achievements', async () => {
        render(<UserProfile userId="test-user-id" />);

        await waitFor(() => {
            expect(screen.getByText('First Workout')).toBeInTheDocument();
            expect(screen.getByText('Complete your first workout')).toBeInTheDocument();
            expect(screen.getByText('100')).toBeInTheDocument(); // Points
        });
    });

    it('handles error state', async () => {
        // Mock an error
        (socialService.getProfile as any).mockRejectedValue(new Error('Failed to load profile'));

        render(<UserProfile userId="test-user-id" />);

        await waitFor(() => {
            expect(screen.getByText('Profile not found')).toBeInTheDocument();
        });
    });
}); 