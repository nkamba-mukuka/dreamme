import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { socialService } from '../../services/socialService';
import type { Post, PostType, ActivityFeedFilters } from '../../types/social';

const postTypeFilters: { value: PostType; label: string; emoji: string }[] = [
    { value: 'workout', label: 'Workouts', emoji: '💪' },
    { value: 'achievement', label: 'Achievements', emoji: '🏆' },
    { value: 'progress', label: 'Progress', emoji: '📈' },
    { value: 'journal', label: 'Journal', emoji: '📝' },
];

export function ActivityFeed() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [filters, setFilters] = useState<ActivityFeedFilters>({
        following: true,
    });
    const [selectedTypes, setSelectedTypes] = useState<PostType[]>([]);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        const loadPosts = async () => {
            if (!user) return;

            setLoading(true);
            setError(null);

            try {
                const postsData = await socialService.getActivityFeed(user.uid, {
                    ...filters,
                    postType: selectedTypes.length > 0 ? selectedTypes : undefined,
                });
                setPosts(postsData);
                setHasMore(postsData.length === 20); // 20 is the page size in the service
            } catch (err) {
                console.error('Error loading posts:', err);
                setError('Failed to load posts');
            } finally {
                setLoading(false);
            }
        };

        loadPosts();
    }, [user, filters, selectedTypes]);

    const loadMore = async () => {
        if (!user || !posts.length) return;

        try {
            const lastPost = posts[posts.length - 1];
            const morePosts = await socialService.getActivityFeed(user.uid, {
                ...filters,
                postType: selectedTypes.length > 0 ? selectedTypes : undefined,
            }, lastPost);

            setPosts(prev => [...prev, ...morePosts]);
            setHasMore(morePosts.length === 20);
        } catch (err) {
            console.error('Error loading more posts:', err);
            setError('Failed to load more posts');
        }
    };

    const handleLike = async (post: Post) => {
        if (!user) return;

        try {
            await socialService.toggleLike({
                userId: user.uid,
                targetType: 'post',
                targetId: post.id,
            });

            // Update post in state
            setPosts(prev =>
                prev.map(p =>
                    p.id === post.id
                        ? {
                            ...p,
                            stats: {
                                ...p.stats,
                                likesCount: p.stats.likesCount + 1,
                            },
                        }
                        : p
                )
            );
        } catch (err) {
            console.error('Error liking post:', err);
            setError('Failed to like post');
        }
    };

    const handleShare = async (post: Post) => {
        if (!user) return;

        try {
            await socialService.sharePost({
                userId: user.uid,
                postId: post.id,
                platform: 'internal',
            });

            // Update post in state
            setPosts(prev =>
                prev.map(p =>
                    p.id === post.id
                        ? {
                            ...p,
                            stats: {
                                ...p.stats,
                                sharesCount: p.stats.sharesCount + 1,
                            },
                        }
                        : p
                )
            );
        } catch (err) {
            console.error('Error sharing post:', err);
            setError('Failed to share post');
        }
    };

    if (loading && !posts.length) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">Activity Feed</h2>
                    <p className="text-muted-foreground">See what's happening in your fitness community</p>
                </div>
                <Button onClick={() => setShowCreatePost(true)}>
                    Create Post
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="space-y-4">
                {/* Post Type Filters */}
                <div className="flex flex-wrap gap-2">
                    {postTypeFilters.map(({ value, label, emoji }) => (
                        <Button
                            key={value}
                            variant={selectedTypes.includes(value) ? 'default' : 'outline'}
                            onClick={() =>
                                setSelectedTypes(prev =>
                                    prev.includes(value)
                                        ? prev.filter(t => t !== value)
                                        : [...prev, value]
                                )
                            }
                            className="text-sm"
                        >
                            {emoji} {label}
                        </Button>
                    ))}
                </div>

                {/* Feed Type Toggle */}
                <div className="flex gap-2">
                    <Button
                        variant={filters.following ? 'default' : 'outline'}
                        onClick={() => setFilters(prev => ({ ...prev, following: true }))}
                    >
                        Following
                    </Button>
                    <Button
                        variant={!filters.following ? 'default' : 'outline'}
                        onClick={() => setFilters(prev => ({ ...prev, following: false }))}
                    >
                        All
                    </Button>
                </div>
            </div>

            {/* Posts */}
            <div className="space-y-6">
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className="bg-white p-6 rounded-xl shadow-sm"
                    >
                        {/* Post Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {/* User Avatar */}
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    {post.userId[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium">User Name</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm">
                                •••
                            </Button>
                        </div>

                        {/* Post Content */}
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

                        {post.type === 'journal' && post.journalEntry && (
                            <div>
                                <p className="font-medium">Journal Entry</p>
                                <p className="text-muted-foreground">{post.content}</p>
                            </div>
                        )}

                        {/* Media */}
                        {post.mediaUrls && post.mediaUrls.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                {post.mediaUrls.map((url, index) => (
                                    <img
                                        key={index}
                                        src={url}
                                        alt={`Post media ${index + 1}`}
                                        className="rounded-lg w-full h-48 object-cover"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Location */}
                        {post.location && (
                            <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                                <span>📍</span> {post.location.name}
                            </p>
                        )}

                        {/* Tags */}
                        {post.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {post.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-sm text-primary bg-primary/10 px-2 py-1 rounded-full"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => handleLike(post)}
                                    className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                                >
                                    <span>❤️</span>
                                    <span>{post.stats.likesCount}</span>
                                </button>
                                <button
                                    onClick={() => setShowCreatePost(true)}
                                    className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                                >
                                    <span>💬</span>
                                    <span>{post.stats.commentsCount}</span>
                                </button>
                                <button
                                    onClick={() => handleShare(post)}
                                    className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                                >
                                    <span>🔄</span>
                                    <span>{post.stats.sharesCount}</span>
                                </button>
                            </div>
                            <Button variant="ghost" size="sm">
                                Save
                            </Button>
                        </div>
                    </div>
                ))}

                {posts.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No posts to show</p>
                        <Button
                            variant="outline"
                            onClick={() => setShowCreatePost(true)}
                            className="mt-4"
                        >
                            Create Your First Post
                        </Button>
                    </div>
                )}

                {hasMore && (
                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            onClick={loadMore}
                            disabled={loading}
                        >
                            {loading ? 'Loading...' : 'Load More'}
                        </Button>
                    </div>
                )}
            </div>

            {/* Create Post Modal */}
            {showCreatePost && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <CreatePostForm
                            onClose={() => setShowCreatePost(false)}
                            onSuccess={(newPost) => {
                                setPosts(prev => [newPost, ...prev]);
                                setShowCreatePost(false);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

interface CreatePostFormProps {
    onClose: () => void;
    onSuccess: (post: Post) => void;
}

function CreatePostForm({ onClose, onSuccess }: CreatePostFormProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [content, setContent] = useState('');
    const [type, setType] = useState<PostType>('workout');
    const [privacyLevel, setPrivacyLevel] = useState<'public' | 'friends' | 'private'>('public');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [location, setLocation] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const postId = await socialService.createPost({
                userId: user.uid,
                type,
                content,
                privacyLevel,
                tags,
                location: location
                    ? {
                        name: location,
                        latitude: 0, // Would use geolocation API in real app
                        longitude: 0,
                    }
                    : undefined,
            });

            const post = await socialService.getPost(postId);
            if (post) {
                onSuccess(post);
            }
        } catch (err) {
            console.error('Error creating post:', err);
            setError('Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTag = () => {
        if (tagInput && !tags.includes(tagInput)) {
            setTags(prev => [...prev, tagInput]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setTags(prev => prev.filter(t => t !== tag));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Create Post</h2>
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

            {/* Post Type */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Post Type</label>
                <div className="flex flex-wrap gap-2">
                    {postTypeFilters.map(({ value, label, emoji }) => (
                        <Button
                            key={value}
                            type="button"
                            variant={type === value ? 'default' : 'outline'}
                            onClick={() => setType(value)}
                            className="text-sm"
                        >
                            {emoji} {label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="What's on your mind?"
                    required
                />
            </div>

            {/* Tags */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                        placeholder="Add tags"
                    />
                    <Button
                        type="button"
                        onClick={handleAddTag}
                    >
                        Add
                    </Button>
                </div>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="flex items-center gap-1 text-sm text-primary bg-primary/10 px-2 py-1 rounded-full"
                            >
                                #{tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="text-primary/50 hover:text-primary"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Location */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                    placeholder="Add location"
                />
            </div>

            {/* Privacy */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Privacy</label>
                <select
                    value={privacyLevel}
                    onChange={(e) => setPrivacyLevel(e.target.value as 'public' | 'friends' | 'private')}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                >
                    <option value="public">Public</option>
                    <option value="friends">Followers Only</option>
                    <option value="private">Private</option>
                </select>
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
                    {loading ? 'Creating...' : 'Create Post'}
                </Button>
            </div>
        </form>
    );
} 