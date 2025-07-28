import React from 'react';
import { Card } from '@dreamme/ui';
import { WorkoutLog } from '../../services/exerciseService';

interface WorkoutHistoryProps {
    workouts: WorkoutLog[];
}

export function WorkoutHistory({ workouts }: WorkoutHistoryProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Workout History</h2>
            <div className="grid gap-6">
                {workouts.map((workout) => (
                    <Card key={workout.id} className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-medium">
                                    {new Date(workout.date).toLocaleDateString()}
                                </h3>
                                <div className="mt-4 space-y-4">
                                    {workout.exercises.map((exercise, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{exercise.exerciseId}</span>
                                                {exercise.weight && (
                                                    <span className="text-gray-600">
                                                        {exercise.weight}kg
                                                    </span>
                                                )}
                                                <span className="text-gray-600">
                                                    {exercise.sets} sets × {exercise.reps} reps
                                                </span>
                                            </div>
                                            {exercise.duration && (
                                                <p className="text-sm text-gray-500">
                                                    Duration: {exercise.duration} minutes
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
} 