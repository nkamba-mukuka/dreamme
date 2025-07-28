# API Services Documentation

This document provides detailed information about the Firebase services used in the DREAM-ME application.

## Table of Contents

- [Authentication Service](#authentication-service)
- [User Profile Service](#user-profile-service)
- [Exercise Service](#exercise-service)
- [Nutrition Service](#nutrition-service)
- [Mental Service](#mental-service)
- [Social Service](#social-service)

## Authentication Service

Located in `apps/web/src/lib/auth.ts`

### Methods

- `signIn(email: string, password: string)`: Sign in with email/password
- `signInWithGoogle()`: Sign in with Google
- `signUp(email: string, password: string)`: Create new account
- `signOut()`: Sign out current user
- `useAuth()`: React hook for auth state

### Usage

```typescript
import { useAuth } from '../lib/auth';

function MyComponent() {
    const { user, signIn, signOut } = useAuth();
    // ...
}
```

## User Profile Service

Located in `apps/web/src/services/userProfileService.ts`

### Methods

- `createProfile(data: UserProfile)`: Create new profile
- `getProfile(userId: string)`: Get user profile
- `updateProfile(userId: string, data: Partial<UserProfile>)`: Update profile
- `updatePreferences(userId: string, preferences: UserPreferences)`: Update preferences

### Usage

```typescript
import { userProfileService } from '../services/userProfileService';

// Get profile
const profile = await userProfileService.getProfile(userId);

// Update profile
await userProfileService.updateProfile(userId, {
    displayName: 'New Name',
    bio: 'New bio',
});
```

## Exercise Service

Located in `apps/web/src/services/exerciseService.ts`

### Methods

- `createExercise(data: Exercise)`: Create new exercise
- `getExercise(id: string)`: Get exercise by ID
- `searchExercises(params: SearchParams)`: Search exercises
- `logWorkout(data: WorkoutLog)`: Log workout
- `getWorkoutLogs(userId: string)`: Get user's workout logs
- `updateExerciseProgress(userId: string, exerciseId: string)`: Update progress

### Usage

```typescript
import { exerciseService } from '../services/exerciseService';

// Search exercises
const exercises = await exerciseService.searchExercises({
    muscleGroups: ['chest'],
    equipment: ['dumbbell'],
    difficulty: 'intermediate',
});

// Log workout
await exerciseService.logWorkout({
    exerciseId: 'exercise-id',
    sets: [{ reps: 10, weight: 50 }],
    duration: 30,
});
```

## Nutrition Service

Located in `apps/web/src/services/nutritionService.ts`

### Methods

- `createRecipe(data: Recipe)`: Create new recipe
- `searchRecipes(params: SearchParams)`: Search recipes
- `createMealPlan(data: MealPlan)`: Create meal plan
- `getMealPlan(userId: string, date: Date)`: Get meal plan
- `logNutrition(data: NutritionLog)`: Log nutrition
- `getNutritionGoals(userId: string)`: Get nutrition goals

### Usage

```typescript
import { nutritionService } from '../services/nutritionService';

// Get meal plan
const mealPlan = await nutritionService.getMealPlan(userId, new Date());

// Log nutrition
await nutritionService.logNutrition({
    userId,
    date: new Date(),
    meals: [...],
    totalCalories: 2000,
});
```

## Mental Service

Located in `apps/web/src/services/mentalService.ts`

### Methods

- `createJournalEntry(data: JournalEntry)`: Create journal entry
- `getJournalEntries(userId: string)`: Get journal entries
- `createBreathingSession(data: BreathingSession)`: Log breathing session
- `createMotivation(data: Motivation)`: Create motivation
- `getMotivations(userId: string)`: Get motivations
- `getMentalHealthStats(userId: string)`: Get mental health stats

### Usage

```typescript
import { mentalService } from '../services/mentalService';

// Create journal entry
await mentalService.createJournalEntry({
    userId,
    content: 'Today was a great day...',
    mood: 4,
    moodTags: ['happy', 'energetic'],
});

// Get mental health stats
const stats = await mentalService.getMentalHealthStats(userId);
```

## Social Service

Located in `apps/web/src/services/socialService.ts`

### Methods

- `getProfile(userId: string)`: Get public profile
- `followUser(followerId: string, followingId: string)`: Follow user
- `createPost(data: Post)`: Create post
- `getActivityFeed(userId: string)`: Get activity feed
- `toggleLike(data: Like)`: Toggle like
- `createComment(data: Comment)`: Create comment
- `getAchievements()`: Get all achievements
- `getUserAchievements(userId: string)`: Get user achievements

### Usage

```typescript
import { socialService } from '../services/socialService';

// Create post
await socialService.createPost({
    userId,
    type: 'workout',
    content: 'Great workout today!',
    workoutLog: workoutData,
});

// Get activity feed
const feed = await socialService.getActivityFeed(userId, {
    following: true,
    postType: ['workout', 'achievement'],
});
```

## Error Handling

All services use a consistent error handling pattern:

```typescript
try {
    await service.someMethod();
} catch (err) {
    if (err instanceof AuthError) {
        // Handle auth errors
    } else if (err instanceof ValidationError) {
        // Handle validation errors
    } else {
        // Handle other errors
    }
}
```

## Data Types

Refer to the TypeScript type definitions in `apps/web/src/types/` for detailed type information:

- `user.ts`: User and profile types
- `exercise.ts`: Exercise and workout types
- `nutrition.ts`: Nutrition and meal types
- `mental.ts`: Mental health types
- `social.ts`: Social feature types

## Firebase Security Rules

Important security rules are implemented for each collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /profiles/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }

    // Workouts
    match /workouts/{workoutId} {
      allow read: if true;
      allow write: if request.auth.uid == resource.data.userId;
    }

    // And so on...
  }
}
```

## Rate Limiting

To prevent abuse, the following rate limits are implemented:

- Authentication: 100 requests per hour
- API calls: 1000 requests per hour
- File uploads: 100MB per day

## Offline Support

The application supports offline functionality through Firebase's offline persistence:

```typescript
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open
    } else if (err.code == 'unimplemented') {
        // Browser doesn't support persistence
    }
});
``` 