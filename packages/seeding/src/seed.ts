import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
initializeApp({
    credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS || ''),
});

const db = getFirestore();

// Seed motivational quotes
const motivationalQuotes = [
    {
        quote: "Every day is a new beginning. Take a deep breath and start again.",
        author: "Unknown",
        category: "motivation",
        imageUrl: "https://source.unsplash.com/random/800x600/?motivation"
    },
    {
        quote: "Your body can stand almost anything. It's your mind you have to convince.",
        author: "Unknown",
        category: "fitness",
        imageUrl: "https://source.unsplash.com/random/800x600/?fitness"
    },
    {
        quote: "The only bad workout is the one that didn't happen.",
        author: "Unknown",
        category: "fitness",
        imageUrl: "https://source.unsplash.com/random/800x600/?workout"
    },
    {
        quote: "You are what you eat, so don't be fast, cheap, easy, or fake.",
        author: "Unknown",
        category: "nutrition",
        imageUrl: "https://source.unsplash.com/random/800x600/?healthy-food"
    },
    {
        quote: "Take care of your body. It's the only place you have to live.",
        author: "Jim Rohn",
        category: "wellness",
        imageUrl: "https://source.unsplash.com/random/800x600/?wellness"
    }
];

// Seed meals
const meals = [
    {
        name: "Overnight Oats with Berries",
        type: "breakfast",
        description: "Healthy and filling breakfast with oats, berries, and nuts",
        recipe: [
            "Mix 1/2 cup oats with 1/2 cup milk",
            "Add 1/4 cup yogurt",
            "Add berries and nuts",
            "Refrigerate overnight"
        ],
        ingredients: [
            "1/2 cup oats",
            "1/2 cup milk",
            "1/4 cup yogurt",
            "Mixed berries",
            "Nuts"
        ],
        nutritionInfo: {
            calories: 350,
            protein: 12,
            carbs: 45,
            fat: 14
        },
        imageUrl: "https://source.unsplash.com/random/800x600/?oatmeal",
        preparationTime: 10,
        difficulty: "easy"
    },
    {
        name: "Grilled Chicken Salad",
        type: "lunch",
        description: "Fresh and protein-rich salad with grilled chicken",
        recipe: [
            "Grill chicken breast",
            "Chop vegetables",
            "Mix salad ingredients",
            "Add dressing"
        ],
        ingredients: [
            "Chicken breast",
            "Mixed greens",
            "Cherry tomatoes",
            "Cucumber",
            "Olive oil"
        ],
        nutritionInfo: {
            calories: 400,
            protein: 35,
            carbs: 10,
            fat: 25
        },
        imageUrl: "https://source.unsplash.com/random/800x600/?chicken-salad",
        preparationTime: 20,
        difficulty: "medium"
    }
];

// Seed exercises
const exercises = [
    {
        name: "Push-ups",
        description: "Classic upper body exercise",
        muscleGroups: ["chest", "shoulders", "triceps"],
        equipment: ["bodyweight"],
        difficulty: "beginner",
        instructions: [
            "Start in a plank position",
            "Lower your body until your chest nearly touches the ground",
            "Push back up to the starting position"
        ],
        tips: [
            "Keep your core tight",
            "Don't let your hips sag",
            "Breathe steadily"
        ],
        youtubeVideoId: "IODxDxX7oi4",
        thumbnailUrl: "https://source.unsplash.com/random/800x600/?pushup",
        estimatedDuration: 5,
        caloriesBurnedPerMinute: 7
    },
    {
        name: "Squats",
        description: "Fundamental lower body exercise",
        muscleGroups: ["legs", "core"],
        equipment: ["bodyweight"],
        difficulty: "beginner",
        instructions: [
            "Stand with feet shoulder-width apart",
            "Lower your body as if sitting back into a chair",
            "Keep your chest up and back straight",
            "Return to standing position"
        ],
        tips: [
            "Keep your knees in line with your toes",
            "Go as low as comfortable",
            "Keep your weight in your heels"
        ],
        youtubeVideoId: "aclHkVaku9U",
        thumbnailUrl: "https://source.unsplash.com/random/800x600/?squat",
        estimatedDuration: 5,
        caloriesBurnedPerMinute: 8
    }
];

async function seedData() {
    try {
        // Seed motivational quotes
        const quotesRef = db.collection('motivationalQuotes');
        for (const quote of motivationalQuotes) {
            await quotesRef.add({
                ...quote,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        console.log('✅ Motivational quotes seeded');

        // Seed meals
        const mealsRef = db.collection('meals');
        for (const meal of meals) {
            await mealsRef.add({
                ...meal,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        console.log('✅ Meals seeded');

        // Seed exercises
        const exercisesRef = db.collection('exercises');
        for (const exercise of exercises) {
            await exercisesRef.add({
                ...exercise,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }
        console.log('✅ Exercises seeded');

        console.log('🎉 All data seeded successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedData(); 