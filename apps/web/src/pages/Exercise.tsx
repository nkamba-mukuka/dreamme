import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { BackButton } from '../components/layout/BackButton';
import { ExerciseList } from '../components/exercise/ExerciseList';
import { WorkoutLogForm } from '../components/exercise/WorkoutLogForm';
import { ExerciseDetail } from '../components/exercise/ExerciseDetail';
import { WorkoutHistory } from '../components/exercise/WorkoutHistory';
import { exerciseService } from '../services/exerciseService';
import type { Exercise } from '../services/exerciseService';

function Exercise() {
    const { user } = useAuth();
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [showLogForm, setShowLogForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [workouts, setWorkouts] = useState([]);

    const handleExerciseSelect = (exercise: Exercise) => {
        setSelectedExercise(exercise);
    };

    const handleLogWorkout = async (data: {
        sets: { reps: number; weight?: number }[];
        notes: string;
    }) => {
        if (!user || !selectedExercise) return;

        try {
            setLoading(true);
            await exerciseService.logWorkout(user.uid, {
                userId: user.uid,
                date: new Date().toISOString().split('T')[0],
                exercises: [{
                    exerciseId: selectedExercise.id,
                    sets: data.sets.length,
                    reps: data.sets[0].reps,
                    weight: data.sets[0].weight
                }]
            });
            setShowLogForm(false);
            setSelectedExercise(null);
        } catch (error) {
            console.error('Error logging workout:', error);
            setError('Failed to log workout');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <BackButton />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h1 className="text-3xl font-bold mb-8">Exercises</h1>
                    <ExerciseList
                        exercises={[]}
                        onSelectExercise={handleExerciseSelect}
                    />
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-6">Recent Workouts</h2>
                    <WorkoutHistory workouts={workouts} />
                </div>
            </div>

            {selectedExercise && !showLogForm && (
                <ExerciseDetail
                    exerciseId={selectedExercise.id}
                    onClose={() => setSelectedExercise(null)}
                />
            )}

            {selectedExercise && showLogForm && (
                <WorkoutLogForm
                    exercise={selectedExercise}
                    onSubmit={handleLogWorkout}
                    onCancel={() => setShowLogForm(false)}
                />
            )}

            {error && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
                    {error}
                </div>
            )}
        </div>
    );
}

export default Exercise; 