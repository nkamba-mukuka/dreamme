import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    addDoc,
    updateDoc,
    deleteDoc,
    increment,
    QueryConstraint,
    startAfter,
    writeBatch,
    FieldValue,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type {
    PublicProfile,
    Follow,
    Post,
    Comment,
    Like,
    Share,
    Achievement,
    UserAchievement,
    Notification,
    ActivityFeedFilters,
    ProfileSearchParams,
    PrivacyLevel,
} from '../types/social';

const PROFILES_COLLECTION = 'publicProfiles';
const FOLLOWS_COLLECTION = 'follows';
const POSTS_COLLECTION = 'posts';
const COMMENTS_COLLECTION = 'comments';
const LIKES_COLLECTION = 'likes';
const SHARES_COLLECTION = 'shares';
const ACHIEVEMENTS_COLLECTION = 'achievements';
const USER_ACHIEVEMENTS_COLLECTION = 'userAchievements';
const NOTIFICATIONS_COLLECTION = 'notifications';

export const socialService = {
    // Profile Management
    async getProfile(userId: string): Promise<PublicProfile | null> {
        const profileRef = doc(db, PROFILES_COLLECTION, userId);
        const profileDoc = await getDoc(profileRef);

        if (!profileDoc.exists()) {
            return null;
        }

        return profileDoc.data() as PublicProfile;
    },

    async updateProfile(userId: string, data: Partial<PublicProfile>): Promise<void> {
        const profileRef = doc(db, PROFILES_COLLECTION, userId);
        await updateDoc(profileRef, {
            ...data,
            updatedAt: new Date(),
        });
    },

    async searchProfiles(params: ProfileSearchParams, lastProfile?: PublicProfile): Promise<PublicProfile[]> {
        const constraints: QueryConstraint[] = [
            orderBy(params.sortBy || 'createdAt', 'desc'),
            limit(20),
        ];

        if (params.query) {
            constraints.push(where('username', '>=', params.query));
            constraints.push(where('username', '<=', params.query + '\uf8ff'));
        }

        if (params.location) {
            constraints.push(where('location', '==', params.location));
        }

        if (params.achievementCategory) {
            constraints.push(where('achievements.categories', 'array-contains', params.achievementCategory));
        }

        if (params.minWorkouts) {
            constraints.push(where('stats.totalWorkouts', '>=', params.minWorkouts));
        }

        if (params.maxWorkouts) {
            constraints.push(where('stats.totalWorkouts', '<=', params.maxWorkouts));
        }

        if (lastProfile && params.sortBy && params.sortBy in lastProfile) {
            constraints.push(startAfter(lastProfile[params.sortBy as keyof PublicProfile]));
        }

        const q = query(collection(db, PROFILES_COLLECTION), ...constraints);
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            userId: doc.id,
        })) as PublicProfile[];
    },

    // Follow Management
    async followUser(followerId: string, followingId: string): Promise<string> {
        const followRef = await addDoc(collection(db, FOLLOWS_COLLECTION), {
            followerId,
            followingId,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Create notification for follow request
        await this.createNotification({
            userId: followingId,
            type: 'follow_request',
            title: 'New Follow Request',
            content: 'Someone wants to follow you',
            data: {
                targetType: 'profile',
                targetId: followingId,
                actorId: followerId,
            },
            isRead: false,
            createdAt: new Date(),
        });

        return followRef.id;
    },

    async acceptFollow(followId: string): Promise<void> {
        const followRef = doc(db, FOLLOWS_COLLECTION, followId);
        const followDoc = await getDoc(followRef);

        if (!followDoc.exists()) {
            throw new Error('Follow request not found');
        }

        const follow = followDoc.data() as Follow;

        await updateDoc(followRef, {
            status: 'accepted',
            updatedAt: new Date(),
        });

        // Update follower counts
        const updateData = {
            stats: {
                followingCount: increment(1) as unknown as number,
            },
        } as Partial<PublicProfile>;
        await this.updateProfile(follow.followerId, updateData);

        const updateData2 = {
            stats: {
                followersCount: increment(1) as unknown as number,
            },
        } as Partial<PublicProfile>;
        await this.updateProfile(follow.followingId, updateData2);

        // Create notification for follow acceptance
        await this.createNotification({
            userId: follow.followerId,
            type: 'follow_accept',
            title: 'Follow Request Accepted',
            content: 'Someone accepted your follow request',
            data: {
                targetType: 'profile',
                targetId: follow.followingId,
                actorId: follow.followingId,
            },
            isRead: false,
            createdAt: new Date(),
        });
    },

    async unfollowUser(followId: string): Promise<void> {
        const followRef = doc(db, FOLLOWS_COLLECTION, followId);
        const followDoc = await getDoc(followRef);

        if (!followDoc.exists()) {
            throw new Error('Follow not found');
        }

        const follow = followDoc.data() as Follow;

        await deleteDoc(followRef);

        // Update follower counts
        const updateData = {
            stats: {
                followingCount: increment(-1) as unknown as number,
            },
        } as Partial<PublicProfile>;
        await this.updateProfile(follow.followerId, updateData);

        const updateData2 = {
            stats: {
                followersCount: increment(-1) as unknown as number,
            },
        } as Partial<PublicProfile>;
        await this.updateProfile(follow.followingId, updateData2);
    },

    // Post Management
    async createPost(data: Omit<Post, 'id' | 'stats' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const postRef = await addDoc(collection(db, POSTS_COLLECTION), {
            ...data,
            stats: {
                likesCount: 0,
                commentsCount: 0,
                sharesCount: 0,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return postRef.id;
    },

    async getPost(postId: string): Promise<Post | null> {
        const postRef = doc(db, POSTS_COLLECTION, postId);
        const postDoc = await getDoc(postRef);

        if (!postDoc.exists()) {
            return null;
        }

        return {
            id: postDoc.id,
            ...postDoc.data(),
        } as Post;
    },

    async updatePost(postId: string, data: Partial<Post>): Promise<void> {
        const postRef = doc(db, POSTS_COLLECTION, postId);
        await updateDoc(postRef, {
            ...data,
            updatedAt: new Date(),
        });
    },

    async deletePost(postId: string): Promise<void> {
        const postRef = doc(db, POSTS_COLLECTION, postId);
        await deleteDoc(postRef);

        // Delete associated comments, likes, and shares
        const batch = writeBatch(db);

        const commentsQuery = query(collection(db, COMMENTS_COLLECTION), where('postId', '==', postId));
        const commentsSnapshot = await getDocs(commentsQuery);
        commentsSnapshot.forEach(doc => batch.delete(doc.ref));

        const likesQuery = query(collection(db, LIKES_COLLECTION), where('targetId', '==', postId));
        const likesSnapshot = await getDocs(likesQuery);
        likesSnapshot.forEach(doc => batch.delete(doc.ref));

        const sharesQuery = query(collection(db, SHARES_COLLECTION), where('postId', '==', postId));
        const sharesSnapshot = await getDocs(sharesQuery);
        sharesSnapshot.forEach(doc => batch.delete(doc.ref));

        await batch.commit();
    },

    async getActivityFeed(userId: string, filters: ActivityFeedFilters, lastPost?: Post): Promise<Post[]> {
        const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(20)];

        if (filters.following) {
            // Get list of users being followed
            const followsQuery = query(
                collection(db, FOLLOWS_COLLECTION),
                where('followerId', '==', userId),
                where('status', '==', 'accepted')
            );
            const followsSnapshot = await getDocs(followsQuery);
            const followingIds = followsSnapshot.docs.map(doc => doc.data().followingId);

            constraints.push(where('userId', 'in', [userId, ...followingIds]));
        }

        if (filters.postType && filters.postType.length > 0) {
            constraints.push(where('type', 'in', filters.postType));
        }

        if (filters.dateRange) {
            constraints.push(where('createdAt', '>=', filters.dateRange.start));
            constraints.push(where('createdAt', '<=', filters.dateRange.end));
        }

        if (filters.tags && filters.tags.length > 0) {
            constraints.push(where('tags', 'array-contains-any', filters.tags));
        }

        if (lastPost) {
            constraints.push(startAfter(lastPost.createdAt));
        }

        const q = query(collection(db, POSTS_COLLECTION), ...constraints);
        const querySnapshot = await getDocs(q);

        let posts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Post[];

        // Client-side location filtering if needed
        if (filters.location) {
            posts = posts.filter(post => {
                if (!post.location) return false;
                const distance = calculateDistance(
                    filters.location!.latitude,
                    filters.location!.longitude,
                    post.location.latitude,
                    post.location.longitude
                );
                return distance <= filters.location!.radiusKm;
            });
        }

        return posts;
    },

    // Comment Management
    async createComment(data: Omit<Comment, 'id' | 'stats' | 'createdAt' | 'updatedAt'>): Promise<string> {
        const commentRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
            ...data,
            stats: {
                likesCount: 0,
                repliesCount: 0,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Update post comment count
        const updateData = {
            stats: {
                commentsCount: increment(1) as unknown as number,
            },
        } as Partial<Post>;
        await this.updatePost(data.postId, updateData);

        // Create notification for post owner
        const post = await this.getPost(data.postId);
        if (post && post.userId !== data.userId) {
            await this.createNotification({
                userId: post.userId,
                type: data.replyTo ? 'reply' : 'comment',
                title: data.replyTo ? 'New Reply' : 'New Comment',
                content: data.content.substring(0, 100),
                data: {
                    targetType: 'comment',
                    targetId: commentRef.id,
                    actorId: data.userId,
                },
                isRead: false,
                createdAt: new Date(),
            });
        }

        return commentRef.id;
    },

    async getComments(postId: string, parentId?: string): Promise<Comment[]> {
        const constraints: QueryConstraint[] = [
            where('postId', '==', postId),
            where('replyTo', '==', parentId || null),
            orderBy('createdAt', 'desc'),
        ];

        const q = query(collection(db, COMMENTS_COLLECTION), ...constraints);
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Comment[];
    },

    async deleteComment(commentId: string): Promise<void> {
        const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
        const commentDoc = await getDoc(commentRef);

        if (!commentDoc.exists()) {
            throw new Error('Comment not found');
        }

        const comment = commentDoc.data() as Comment;

        await deleteDoc(commentRef);

        // Update post comment count
        const updateData = {
            stats: {
                commentsCount: increment(-1) as unknown as number,
            },
        } as Partial<Post>;
        await this.updatePost(comment.postId, updateData);

        // Delete associated likes
        const batch = writeBatch(db);
        const likesQuery = query(collection(db, LIKES_COLLECTION), where('targetId', '==', commentId));
        const likesSnapshot = await getDocs(likesQuery);
        likesSnapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    },

    // Like Management
    async toggleLike(data: Omit<Like, 'id' | 'createdAt'>): Promise<void> {
        const likeQuery = query(
            collection(db, LIKES_COLLECTION),
            where('userId', '==', data.userId),
            where('targetType', '==', data.targetType),
            where('targetId', '==', data.targetId)
        );
        const likeSnapshot = await getDocs(likeQuery);

        if (likeSnapshot.empty) {
            // Create like
            await addDoc(collection(db, LIKES_COLLECTION), {
                ...data,
                createdAt: new Date(),
            });

            // Update target like count
            if (data.targetType === 'post') {
                const updateData = {
                    stats: {
                        likesCount: increment(1) as unknown as number,
                    },
                } as Partial<Post>;
                await this.updatePost(data.targetId, updateData);

                // Create notification for post owner
                const post = await this.getPost(data.targetId);
                if (post && post.userId !== data.userId) {
                    await this.createNotification({
                        userId: post.userId,
                        type: 'like',
                        title: 'New Like',
                        content: 'Someone liked your post',
                        data: {
                            targetType: 'post',
                            targetId: data.targetId,
                            actorId: data.userId,
                        },
                        isRead: false,
                        createdAt: new Date(),
                    });
                }
            } else {
                const commentRef = doc(db, COMMENTS_COLLECTION, data.targetId);
                await updateDoc(commentRef, {
                    'stats.likesCount': increment(1),
                });
            }
        } else {
            // Remove like
            await deleteDoc(likeSnapshot.docs[0].ref);

            // Update target like count
            if (data.targetType === 'post') {
                const updateData = {
                    stats: {
                        likesCount: increment(-1) as unknown as number,
                    },
                } as Partial<Post>;
                await this.updatePost(data.targetId, updateData);
            } else {
                const commentRef = doc(db, COMMENTS_COLLECTION, data.targetId);
                await updateDoc(commentRef, {
                    'stats.likesCount': increment(-1),
                });
            }
        }
    },

    // Share Management
    async sharePost(data: Omit<Share, 'id' | 'createdAt'>): Promise<string> {
        const shareRef = await addDoc(collection(db, SHARES_COLLECTION), {
            ...data,
            createdAt: new Date(),
        });

        // Update post share count
        const updateData = {
            stats: {
                sharesCount: increment(1) as unknown as number,
            },
        } as Partial<Post>;
        await this.updatePost(data.postId, updateData);

        return shareRef.id;
    },

    // Achievement Management
    async getAchievements(): Promise<Achievement[]> {
        const q = query(collection(db, ACHIEVEMENTS_COLLECTION), orderBy('points'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Achievement[];
    },

    async getUserAchievements(userId: string): Promise<UserAchievement[]> {
        const q = query(
            collection(db, USER_ACHIEVEMENTS_COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt')
        );
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as UserAchievement[];
    },

    async updateUserAchievement(achievementId: string, userId: string, progress: number): Promise<void> {
        const achievementRef = doc(db, ACHIEVEMENTS_COLLECTION, achievementId);
        const achievementDoc = await getDoc(achievementRef);

        if (!achievementDoc.exists()) {
            throw new Error('Achievement not found');
        }

        const achievement = achievementDoc.data() as Achievement;

        const userAchievementQuery = query(
            collection(db, USER_ACHIEVEMENTS_COLLECTION),
            where('userId', '==', userId),
            where('achievementId', '==', achievementId)
        );
        const userAchievementSnapshot = await getDocs(userAchievementQuery);

        if (userAchievementSnapshot.empty) {
            // Create new user achievement
            await addDoc(collection(db, USER_ACHIEVEMENTS_COLLECTION), {
                userId,
                achievementId,
                progress,
                isCompleted: progress >= achievement.requirement.value,
                completedAt: progress >= achievement.requirement.value ? new Date() : null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        } else {
            // Update existing user achievement
            const userAchievementRef = userAchievementSnapshot.docs[0].ref;
            const userAchievement = userAchievementSnapshot.docs[0].data() as UserAchievement;

            if (!userAchievement.isCompleted && progress >= achievement.requirement.value) {
                // Achievement newly completed
                await updateDoc(userAchievementRef, {
                    progress,
                    isCompleted: true,
                    completedAt: new Date(),
                    updatedAt: new Date(),
                });

                // Create notification
                await this.createNotification({
                    userId,
                    type: 'achievement',
                    title: 'Achievement Unlocked!',
                    content: `You've earned the "${achievement.title}" achievement!`,
                    imageUrl: achievement.imageUrl,
                    data: {
                        targetType: 'achievement',
                        targetId: achievementId,
                        actorId: userId,
                    },
                    isRead: false,
                    createdAt: new Date(),
                });

                // Update achievement count in profile
                const updateData = {
                    stats: {
                        achievementCount: increment(1) as unknown as number,
                    },
                } as Partial<PublicProfile>;
                await this.updateProfile(userId, updateData);
            } else {
                // Just update progress
                await updateDoc(userAchievementRef, {
                    progress,
                    updatedAt: new Date(),
                });
            }
        }
    },

    // Notification Management
    async createNotification(data: Omit<Notification, 'id'>): Promise<string> {
        const notificationRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), data);
        return notificationRef.id;
    },

    async getNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
        const constraints: QueryConstraint[] = [
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(50),
        ];

        if (unreadOnly) {
            constraints.push(where('isRead', '==', false));
        }

        const q = query(collection(db, NOTIFICATIONS_COLLECTION), ...constraints);
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })) as Notification[];
    },

    async markNotificationAsRead(notificationId: string): Promise<void> {
        const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
        await updateDoc(notificationRef, {
            isRead: true,
        });
    },

    async markAllNotificationsAsRead(userId: string): Promise<void> {
        const unreadQuery = query(
            collection(db, NOTIFICATIONS_COLLECTION),
            where('userId', '==', userId),
            where('isRead', '==', false)
        );
        const unreadSnapshot = await getDocs(unreadQuery);

        const batch = writeBatch(db);
        unreadSnapshot.forEach(doc => {
            batch.update(doc.ref, { isRead: true });
        });
        await batch.commit();
    },
};

// Helper function to calculate distance between two points in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
} 