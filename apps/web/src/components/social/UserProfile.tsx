import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { socialService } from '../../services/socialService';
import type {
    PublicProfile,
    Post,
    UserAchievement,
    Achievement,
    Follow,
    PrivacyLevel,
} from '../../types/social';

interface UserProfileProps {
    userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [achievements, setAchievements] = useState<(UserAchievement & { achievement: Achievement })[]>([]);
    const [followStatus, setFollowStatus] = useState<Follow | null>(null);
    const [showEditForm, setShowEditForm] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            if (!userId) return;

            setLoading(true);
            setError(null);

            try {
                // Load profile data
                const profileData = await socialService.getProfile(userId);
                if (!profileData) {
                    setError('Profile not found');
                    return;
                }
                setProfile(profileData);

                // Load user's posts
                const postsData = await socialService.getActivityFeed(userId, {
                    following: false,
                });
                setPosts(postsData);

                // Load achievements
                const userAchievements = await socialService.getUserAchievements(userId);
                const allAchievements = await socialService.getAchievements();
                const achievementsWithDetails = userAchievements.map(ua => ({
                    ...ua,
                    achievement: allAchievements.find(a => a.id === ua.achievementId)!,
                }));
                setAchievements(achievementsWithDetails);

                // Check follow status if viewing another user's profile
                if (user && user.uid !== userId) {
                    const followsQuery = await socialService.searchFollows(user.uid, userId);
                    setFollowStatus(followsQuery.length > 0 ? followsQuery[0] : null);
                }
            } catch (err) {
                console.error('Error loading profile:', err);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [userId, user]);

    const handleFollow = async () => {
        if (!user || !profile) return;

        try {
            const followId = await socialService.followUser(user.uid, profile.userId);
            setFollowStatus({
                id: followId,
                followerId: user.uid,
                followingId: profile.userId,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        } catch (err) {
            console.error('Error following user:', err);
            setError('Failed to follow user');
        }
    };

    const handleUnfollow = async () => {
        if (!followStatus) return;

        try {
            await socialService.unfollowUser(followStatus.id);
            setFollowStatus(null);
        } catch (err) {
            console.error('Error unfollowing user:', err);
            setError('Failed to unfollow user');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Profile not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Profile Header */}
            <div className="relative">
                {/* Cover Image */}
                <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl" />

                {/* Profile Info */}
                <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
                    {/* Avatar */}
                    <div className="w-32 h-32 rounded-full bg-white shadow-lg overflow-hidden">
                        {profile.avatarUrl ? (
                            <img
                                src={profile.avatarUrl}
                                alt={profile.displayName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-4xl">
                                {profile.displayName[0].toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="mb-4">
                        <h1 className="text-2xl font-semibold">{profile.displayName}</h1>
                        <p className="text-muted-foreground">@{profile.username}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute right-8 bottom-4 flex space-x-4">
                    {user && user.uid === profile.userId ? (
                        <Button onClick={() => setShowEditForm(true)}>
                            Edit Profile
                        </Button>
                    ) : (
                        followStatus ? (
                            <Button
                                variant={followStatus.status === 'pending' ? 'outline' : 'default'}
                                onClick={handleUnfollow}
                            >
                                {followStatus.status === 'pending' ? 'Pending' : 'Following'}
                            </Button>
                        ) : (
                            <Button onClick={handleFollow}>
                                Follow
                            </Button>
                        )
                    )}
                </div>
            </div>

            {/* Profile Content */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Bio & Stats */}
                <div className="space-y-6">
                    {/* Bio */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        {profile.bio && (
                            <p className="text-muted-foreground mb-4">{profile.bio}</p>
                        )}

                        {/* Location & Website */}
                        <div className="space-y-2">
                            {profile.location && (
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <span>📍</span> {profile.location}
                                </p>
                            )}
                            {profile.websiteUrl && (
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <span>🔗</span>
                                    <a
                                        href={profile.websiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        {new URL(profile.websiteUrl).hostname}
                                    </a>
                                </p>
                            )}
                        </div>

                        {/* Social Links */}
                        {profile.socialLinks && (
                            <div className="flex gap-4 mt-4">
                                {profile.socialLinks.instagram && (
                                    <a
                                        href={`https://instagram.com/${profile.socialLinks.instagram}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-primary"
                                    >
                                        Instagram
                                    </a>
                                )}
                                {profile.socialLinks.twitter && (
                                    <a
                                        href={`https://twitter.com/${profile.socialLinks.twitter}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-primary"
                                    >
                                        Twitter
                                    </a>
                                )}
                                {profile.socialLinks.facebook && (
                                    <a
                                        href={profile.socialLinks.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-primary"
                                    >
                                        Facebook
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">Stats</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-2xl font-semibold">{profile.stats.totalWorkouts}</p>
                                <p className="text-sm text-muted-foreground">Workouts</p>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">{profile.stats.workoutStreak}</p>
                                <p className="text-sm text-muted-foreground">Day Streak</p>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">{profile.stats.totalMinutes}</p>
                                <p className="text-sm text-muted-foreground">Minutes</p>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold">{profile.stats.achievementCount}</p>
                                <p className="text-sm text-muted-foreground">Achievements</p>
                            </div>
                        </div>
                    </div>

                    {/* Privacy Settings */}
                    {user && user.uid === profile.userId && (
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h2 className="text-lg font-semibold mb-4">Privacy Settings</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium">Workout Privacy</p>
                                    <p className="text-sm text-muted-foreground">
                                        {profile.privacySettings.workoutPrivacy === 'public'
                                            ? 'Anyone can see your workouts'
                                            : profile.privacySettings.workoutPrivacy === 'friends'
                                                ? 'Only followers can see your workouts'
                                                : 'Only you can see your workouts'}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium">Journal Privacy</p>
                                    <p className="text-sm text-muted-foreground">
                                        {profile.privacySettings.journalPrivacy === 'public'
                                            ? 'Anyone can see your journal entries'
                                            : profile.privacySettings.journalPrivacy === 'friends'
                                                ? 'Only followers can see your journal entries'
                                                : 'Only you can see your journal entries'}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium">Progress Privacy</p>
                                    <p className="text-sm text-muted-foreground">
                                        {profile.privacySettings.progressPrivacy === 'public'
                                            ? 'Anyone can see your progress'
                                            : profile.privacySettings.progressPrivacy === 'friends'
                                                ? 'Only followers can see your progress'
                                                : 'Only you can see your progress'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Middle Column - Posts */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold">Recent Activity</h2>
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <div
                                key={post.id}
                                className="bg-white p-6 rounded-xl shadow-sm"
                            >
                                {/* Post content based on type */}
                                {post.type === 'workout' && post.workoutLog && (
                                    <div>
                                        <p className="font-medium">Completed a workout</p>
                                        <p className="text-muted-foreground">{post.content}</p>
                                        <div className="mt-2 text-sm text-muted-foreground">
                                            Duration: {post.workoutLog.duration} minutes
                                        </div>
                                    </div>
                                )}

                                {post.type === 'achievement' && post.achievement && (
                                    <div>
                                        <p className="font-medium">Earned an achievement</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <img
                                                src={post.achievement.imageUrl}
                                                alt={post.achievement.title}
                                                className="w-12 h-12"
                                            />
                                            <div>
                                                <p className="font-medium">{post.achievement.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {post.achievement.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {post.type === 'progress' && (
                                    <div>
                                        <p className="font-medium">Made progress</p>
                                        <p className="text-muted-foreground">{post.content}</p>
                                    </div>
                                )}

                                {/* Post metadata */}
                                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-4">
                                        <span>{post.stats.likesCount} likes</span>
                                        <span>{post.stats.commentsCount} comments</span>
                                    </div>
                                    <span>
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No activity yet</p>
                        </div>
                    )}
                </div>

                {/* Right Column - Achievements */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold">Achievements</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {achievements.map(({ achievement, isCompleted, progress }) => (
                            <div
                                key={achievement.id}
                                className={`bg-white p-4 rounded-xl shadow-sm ${!isCompleted && 'opacity-50'
                                    }`}
                            >
                                <img
                                    src={achievement.imageUrl}
                                    alt={achievement.title}
                                    className="w-16 h-16 mx-auto mb-2"
                                />
                                <h3 className="text-center font-medium">{achievement.title}</h3>
                                <p className="text-sm text-center text-muted-foreground mb-2">
                                    {achievement.description}
                                </p>
                                {!isCompleted && (
                                    <div className="w-full bg-primary/10 rounded-full h-2 mt-2">
                                        <div
                                            className="bg-primary h-full rounded-full"
                                            style={{
                                                width: `${(progress / achievement.requirement.value) * 100}%`,
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="text-xs text-center text-muted-foreground mt-2">
                                    {isCompleted
                                        ? 'Completed'
                                        : `${progress} / ${achievement.requirement.value} ${achievement.requirement.metric || ''
                                        }`}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <ProfileEditForm
                            profile={profile}
                            onClose={() => setShowEditForm(false)}
                            onSuccess={(updatedProfile) => {
                                setProfile(updatedProfile);
                                setShowEditForm(false);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

interface ProfileEditFormProps {
    profile: PublicProfile;
    onClose: () => void;
    onSuccess: (profile: PublicProfile) => void;
}

function ProfileEditForm({ profile, onClose, onSuccess }: ProfileEditFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState(profile.displayName);
    const [bio, setBio] = useState(profile.bio || '');
    const [location, setLocation] = useState(profile.location || '');
    const [websiteUrl, setWebsiteUrl] = useState(profile.websiteUrl || '');
    const [socialLinks, setSocialLinks] = useState(profile.socialLinks || {});
    const [privacySettings, setPrivacySettings] = useState(profile.privacySettings);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await socialService.updateProfile(profile.userId, {
                displayName,
                bio,
                location,
                websiteUrl,
                socialLinks,
                privacySettings,
            });

            onSuccess({
                ...profile,
                displayName,
                bio,
                location,
                websiteUrl,
                socialLinks,
                privacySettings,
            });
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Edit Profile</h2>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                >
                    Close
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            {/* Basic Info */}
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Display Name</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                        required
                    />
                </div>

                <div>
                    <label className="text-sm font-medium">Bio</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="Tell us about yourself"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium">Location</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                        placeholder="City, Country"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium">Website</label>
                    <input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                        placeholder="https://example.com"
                    />
                </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium">Social Links</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-muted-foreground">Instagram</label>
                        <input
                            type="text"
                            value={socialLinks.instagram || ''}
                            onChange={(e) =>
                                setSocialLinks(prev => ({
                                    ...prev,
                                    instagram: e.target.value,
                                }))
                            }
                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                            placeholder="username"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Twitter</label>
                        <input
                            type="text"
                            value={socialLinks.twitter || ''}
                            onChange={(e) =>
                                setSocialLinks(prev => ({
                                    ...prev,
                                    twitter: e.target.value,
                                }))
                            }
                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                            placeholder="username"
                        />
                    </div>
                </div>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium">Privacy Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-muted-foreground">Workout Privacy</label>
                        <select
                            value={privacySettings.workoutPrivacy}
                            onChange={(e) =>
                                setPrivacySettings(prev => ({
                                    ...prev,
                                    workoutPrivacy: e.target.value as PrivacyLevel,
                                }))
                            }
                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="public">Public</option>
                            <option value="friends">Followers Only</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Journal Privacy</label>
                        <select
                            value={privacySettings.journalPrivacy}
                            onChange={(e) =>
                                setPrivacySettings(prev => ({
                                    ...prev,
                                    journalPrivacy: e.target.value as PrivacyLevel,
                                }))
                            }
                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="public">Public</option>
                            <option value="friends">Followers Only</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-muted-foreground">Progress Privacy</label>
                        <select
                            value={privacySettings.progressPrivacy}
                            onChange={(e) =>
                                setPrivacySettings(prev => ({
                                    ...prev,
                                    progressPrivacy: e.target.value as PrivacyLevel,
                                }))
                            }
                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="public">Public</option>
                            <option value="friends">Followers Only</option>
                            <option value="private">Private</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
} 