import { useState, useEffect } from 'react';
import { Button } from '@dreamme/ui';
import { exerciseService } from '../../services/exerciseService';
import type {
    Exercise,
    MuscleGroup,
    Equipment,
    ExerciseDifficulty,
} from '../../types/exercise';

const muscleGroups: { value: MuscleGroup; label: string }[] = [
    { value: 'chest', label: 'Chest' },
    { value: 'back', label: 'Back' },
    { value: 'shoulders', label: 'Shoulders' },
    { value: 'biceps', label: 'Biceps' },
    { value: 'triceps', label: 'Triceps' },
    { value: 'legs', label: 'Legs' },
    { value: 'core', label: 'Core' },
    { value: 'fullBody', label: 'Full Body' },
];

const equipmentTypes: { value: Equipment; label: string }[] = [
    { value: 'bodyweight', label: 'Bodyweight' },
    { value: 'dumbbell', label: 'Dumbbell' },
    { value: 'barbell', label: 'Barbell' },
    { value: 'kettlebell', label: 'Kettlebell' },
    { value: 'resistanceBand', label: 'Resistance Band' },
    { value: 'machine', label: 'Machine' },
    { value: 'cable', label: 'Cable' },
    { value: 'other', label: 'Other' },
];

const difficultyLevels: { value: ExerciseDifficulty; label: string }[] = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
];

export function ExerciseList() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<MuscleGroup[]>([]);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState<ExerciseDifficulty | null>(null);

    // Load exercises with current filters
    const loadExercises = async () => {
        setLoading(true);
        setError(null);

        try {
            const results = await exerciseService.searchExercises({
                searchTerm: searchTerm || undefined,
                muscleGroups: selectedMuscleGroups.length > 0 ? selectedMuscleGroups : undefined,
                equipment: selectedEquipment.length > 0 ? selectedEquipment : undefined,
                difficulty: selectedDifficulty || undefined,
            });
            setExercises(results);
        } catch (err) {
            console.error('Error loading exercises:', err);
            setError('Failed to load exercises');
        } finally {
            setLoading(false);
        }
    };

    // Load exercises on mount and when filters change
    useEffect(() => {
        loadExercises();
    }, [searchTerm, selectedMuscleGroups, selectedEquipment, selectedDifficulty]);

    const handleMuscleGroupToggle = (value: MuscleGroup) => {
        setSelectedMuscleGroups(prev =>
            prev.includes(value)
                ? prev.filter(g => g !== value)
                : [...prev, value]
        );
    };

    const handleEquipmentToggle = (value: Equipment) => {
        setSelectedEquipment(prev =>
            prev.includes(value)
                ? prev.filter(e => e !== value)
                : [...prev, value]
        );
    };

    const handleDifficultySelect = (value: ExerciseDifficulty | null) => {
        setSelectedDifficulty(prev => prev === value ? null : value);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedMuscleGroups([]);
        setSelectedEquipment([]);
        setSelectedDifficulty(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary/50"
                />

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="text-sm"
                    >
                        Clear Filters
                    </Button>
                </div>

                {/* Muscle Groups */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Muscle Groups</h3>
                    <div className="flex flex-wrap gap-2">
                        {muscleGroups.map(({ value, label }) => (
                            <Button
                                key={value}
                                variant={selectedMuscleGroups.includes(value) ? 'default' : 'outline'}
                                onClick={() => handleMuscleGroupToggle(value)}
                                className="text-sm"
                            >
                                {label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Equipment */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Equipment</h3>
                    <div className="flex flex-wrap gap-2">
                        {equipmentTypes.map(({ value, label }) => (
                            <Button
                                key={value}
                                variant={selectedEquipment.includes(value) ? 'default' : 'outline'}
                                onClick={() => handleEquipmentToggle(value)}
                                className="text-sm"
                            >
                                {label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Difficulty</h3>
                    <div className="flex flex-wrap gap-2">
                        {difficultyLevels.map(({ value, label }) => (
                            <Button
                                key={value}
                                variant={selectedDifficulty === value ? 'default' : 'outline'}
                                onClick={() => handleDifficultySelect(value)}
                                className="text-sm"
                            >
                                {label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            {/* Exercise List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exercises.map((exercise) => (
                    <div
                        key={exercise.id}
                        className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                        {exercise.thumbnailUrl && (
                            <div className="aspect-video mb-4 rounded-lg overflow-hidden bg-gray-100">
                                <img
                                    src={exercise.thumbnailUrl}
                                    alt={exercise.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <h3 className="font-semibold mb-2">{exercise.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {exercise.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {exercise.muscleGroups.map((group) => (
                                <span
                                    key={group}
                                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                                >
                                    {muscleGroups.find(m => m.value === group)?.label}
                                </span>
                            ))}
                            <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full">
                                {difficultyLevels.find(d => d.value === exercise.difficulty)?.label}
                            </span>
                        </div>
                    </div>
                ))}

                {exercises.length === 0 && !loading && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        No exercises found matching your criteria
                    </div>
                )}
            </div>
        </div>
    );
} 