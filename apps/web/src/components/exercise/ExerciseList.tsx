import React from 'react';
import { Button, Card } from '@dreamme/ui';
import { Exercise } from '../../services/exerciseService';

interface ExerciseListProps {
    exercises: Exercise[];
    onSelectExercise: (exercise: Exercise) => void;
}

export function ExerciseList({ exercises, onSelectExercise }: ExerciseListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
                <Card key={exercise.id} className="overflow-hidden">
                    {exercise.imageUrl && (
                        <div className="relative h-48">
                            <img
                                src={exercise.imageUrl}
                                alt={exercise.name}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                    )}
                    <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{exercise.name}</h3>
                        <p className="text-gray-600 mb-4">{exercise.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {exercise.muscleGroups.map((group) => (
                                <span
                                    key={group}
                                    className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                                >
                                    {group}
                                </span>
                            ))}
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 capitalize">
                                {exercise.difficulty}
                            </span>
                            <Button onClick={() => onSelectExercise(exercise)}>
                                View Details
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
} 