import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';
import { socialService } from '../../services/socialService';
import type { Comment, Post } from '../../types/social';

interface CommentsProps {
    post: Post;
    onClose: () => void;
}

export function Comments({ post, onClose }: CommentsProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [replyTo, setReplyTo] = useState<Comment | null>(null);
    const [content, setContent] = useState('');

    useEffect(() => {
        const loadComments = async () => {
            if (!post) return;

            setLoading(true);
            setError(null);

            try {
                const commentsData = await socialService.getComments(post.id);
                setComments(commentsData);
            } catch (err) {
                console.error('Error loading comments:', err);
                setError('Failed to load comments');
            } finally {
                setLoading(false);
            }
        };

        loadComments();
    }, [post]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !content.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const commentId = await socialService.createComment({
                userId: user.uid,
                postId: post.id,
                content: content.trim(),
                replyTo: replyTo?.id,
            });

            // Fetch the new comment from the list of comments
            const comments = await socialService.getComments(post.id);
            const newComment = comments.find(c => c.id === commentId);

            if (newComment) {
                if (replyTo) {
                    // Add reply to replies
                    const replies = await socialService.getComments(post.id, replyTo.id);
                    setComments(prev =>
                        prev.map(c =>
                            c.id === replyTo.id
                                ? {
                                    ...c,
                                    stats: {
                                        ...c.stats,
                                        repliesCount: replies.length,
                                    },
                                }
                                : c
                        )
                    );
                } else {
                    // Add new top-level comment
                    setComments(prev => [newComment, ...prev]);
                }
            }

            setContent('');
            setReplyTo(null);
        } catch (err) {
            console.error('Error creating comment:', err);
            setError('Failed to create comment');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (comment: Comment) => {
        if (!user) return;

        try {
            await socialService.toggleLike({
                userId: user.uid,
                targetType: 'comment',
                targetId: comment.id,
            });

            // Update comment in state
            setComments(prev =>
                prev.map(c =>
                    c.id === comment.id
                        ? {
                            ...c,
                            stats: {
                                ...c.stats,
                                likesCount: c.stats.likesCount + 1,
                            },
                        }
                        : c
                )
            );
        } catch (err) {
            console.error('Error liking comment:', err);
            setError('Failed to like comment');
        }
    };

    const handleDelete = async (comment: Comment) => {
        if (!user) return;

        try {
            await socialService.deleteComment(comment.id);

            // Remove comment from state
            setComments(prev => prev.filter(c => c.id !== comment.id));
        } catch (err) {
            console.error('Error deleting comment:', err);
            setError('Failed to delete comment');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Comments</h2>
                <Button
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

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {user?.uid[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50 resize-none"
                            placeholder={
                                replyTo
                                    ? `Reply to ${replyTo.userId}'s comment...`
                                    : 'Write a comment...'
                            }
                            required
                        />
                        {replyTo && (
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    Replying to comment
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setReplyTo(null)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={loading || !content.trim()}
                    >
                        {loading ? 'Posting...' : 'Post Comment'}
                    </Button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.map((comment) => (
                    <CommentThread
                        key={comment.id}
                        comment={comment}
                        post={post}
                        onReply={() => setReplyTo(comment)}
                        onLike={() => handleLike(comment)}
                        onDelete={() => handleDelete(comment)}
                    />
                ))}

                {comments.length === 0 && !loading && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No comments yet</p>
                        <p className="text-sm text-muted-foreground">Be the first to comment!</p>
                    </div>
                )}

                {loading && (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface CommentThreadProps {
    comment: Comment;
    post: Post;
    onReply: () => void;
    onLike: () => void;
    onDelete: () => void;
}

function CommentThread({ comment, post, onReply, onLike, onDelete }: CommentThreadProps) {
    const { user } = useAuth();
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);

    const loadReplies = async () => {
        if (!showReplies) {
            setLoading(true);
            try {
                const repliesData = await socialService.getComments(post.id, comment.id);
                setReplies(repliesData);
                setShowReplies(true);
            } catch (err) {
                console.error('Error loading replies:', err);
            } finally {
                setLoading(false);
            }
        } else {
            setShowReplies(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Comment */}
            <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {comment.userId[0].toUpperCase()}
                </div>
                <div className="flex-1">
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">User Name</p>
                            <p className="text-sm text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <p className="text-muted-foreground">{comment.content}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-2">
                        <button
                            onClick={onLike}
                            className="text-sm text-muted-foreground hover:text-primary"
                        >
                            {comment.stats.likesCount} likes
                        </button>
                        <button
                            onClick={onReply}
                            className="text-sm text-muted-foreground hover:text-primary"
                        >
                            Reply
                        </button>
                        {user && user.uid === comment.userId && (
                            <button
                                onClick={onDelete}
                                className="text-sm text-destructive hover:text-destructive/90"
                            >
                                Delete
                            </button>
                        )}
                    </div>

                    {/* Replies Toggle */}
                    {comment.stats.repliesCount > 0 && (
                        <button
                            onClick={loadReplies}
                            className="flex items-center gap-2 mt-2 text-sm text-muted-foreground hover:text-primary"
                        >
                            <span>
                                {showReplies ? '▼' : '▶'} {comment.stats.repliesCount} replies
                            </span>
                            {loading && (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Replies */}
            {showReplies && replies.length > 0 && (
                <div className="ml-14 space-y-4">
                    {replies.map((reply) => (
                        <CommentThread
                            key={reply.id}
                            comment={reply}
                            post={post}
                            onReply={onReply}
                            onLike={() => { }}
                            onDelete={() => { }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 