import { useState } from 'react';
import { Button } from '@dreamme/ui';
import { exerciseService } from '../../services/exerciseService';
import type { Exercise, MuscleGroup, Equipment, ExerciseDifficulty } from '../../types/exercise';

interface ExerciseFormProps {
    onSubmit: () => void;
    onCancel: () => void;
    initialData?: Partial<Exercise>;
}

export function ExerciseForm({ onSubmit, onCancel, initialData }: ExerciseFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        type: initialData?.type || 'strength',
        duration: initialData?.duration || '30 mins',
        videoUrl: initialData?.videoUrl || '',
        muscleGroups: initialData?.muscleGroups || [],
        equipment: initialData?.equipment || [],
        difficulty: initialData?.difficulty || 'beginner' as ExerciseDifficulty,
        instructions: initialData?.instructions || [''],
        tips: initialData?.tips || [''],
        youtubeVideoId: initialData?.youtubeVideoId || '',
        estimatedDuration: initialData?.estimatedDuration || 0,
        caloriesBurnedPerMinute: initialData?.caloriesBurnedPerMinute || 0,
        completed: initialData?.completed || false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const muscleGroups: MuscleGroup[] = [
        'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core', 'fullBody'
    ];

    const equipmentTypes: Equipment[] = [
        'bodyweight', 'dumbbell', 'barbell', 'kettlebell', 'resistanceBand', 'machine', 'cable', 'other'
    ];

    const difficulties: ExerciseDifficulty[] = ['beginner', 'intermediate', 'advanced'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (initialData?.id) {
                await exerciseService.updateExercise(initialData.id, formData);
            } else {
                await exerciseService.createExercise(formData);
            }
            onSubmit();
        } catch (error) {
            console.error('Error saving exercise:', error);
            // TODO: Add error handling UI
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleArrayInputChange = (
        field: 'instructions' | 'tips',
        index: number,
        value: string
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => (i === index ? value : item))
        }));
    };

    const addArrayItem = (field: 'instructions' | 'tips') => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const removeArrayItem = (field: 'instructions' | 'tips', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border"
                    rows={3}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Muscle Groups</label>
                <div className="flex flex-wrap gap-2">
                    {muscleGroups.map(group => (
                        <Button
                            key={group}
                            type="button"
                            variant={formData.muscleGroups.includes(group) ? 'primary' : 'outline'}
                            onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    muscleGroups: prev.muscleGroups.includes(group)
                                        ? prev.muscleGroups.filter(g => g !== group)
                                        : [...prev.muscleGroups, group]
                                }));
                            }}
                        >
                            {group}
                        </Button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Equipment</label>
                <div className="flex flex-wrap gap-2">
                    {equipmentTypes.map(type => (
                        <Button
                            key={type}
                            type="button"
                            variant={formData.equipment.includes(type) ? 'primary' : 'outline'}
                            onClick={() => {
                                setFormData(prev => ({
                                    ...prev,
                                    equipment: prev.equipment.includes(type)
                                        ? prev.equipment.filter(t => t !== type)
                                        : [...prev.equipment, type]
                                }));
                            }}
                        >
                            {type}
                        </Button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <div className="flex gap-2">
                    {difficulties.map(diff => (
                        <Button
                            key={diff}
                            type="button"
                            variant={formData.difficulty === diff ? 'primary' : 'outline'}
                            onClick={() => setFormData(prev => ({ ...prev, difficulty: diff }))}
                        >
                            {diff}
                        </Button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Instructions</label>
                {formData.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={instruction}
                            onChange={e => handleArrayInputChange('instructions', index, e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg border"
                            placeholder={`Step ${index + 1}`}
                            required
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeArrayItem('instructions', index)}
                        >
                            Remove
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem('instructions')}
                >
                    Add Step
                </Button>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Tips</label>
                {formData.tips.map((tip, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={tip}
                            onChange={e => handleArrayInputChange('tips', index, e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg border"
                            placeholder={`Tip ${index + 1}`}
                            required
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeArrayItem('tips', index)}
                        >
                            Remove
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => addArrayItem('tips')}
                >
                    Add Tip
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">YouTube Video ID</label>
                    <input
                        type="text"
                        value={formData.youtubeVideoId}
                        onChange={e => setFormData(prev => ({ ...prev, youtubeVideoId: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg border"
                        placeholder="Optional"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Estimated Duration (minutes)</label>
                    <input
                        type="number"
                        value={formData.estimatedDuration}
                        onChange={e => setFormData(prev => ({ ...prev, estimatedDuration: Number(e.target.value) }))}
                        className="w-full px-4 py-2 rounded-lg border"
                        min="0"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Calories Burned per Minute</label>
                <input
                    type="number"
                    value={formData.caloriesBurnedPerMinute}
                    onChange={e => setFormData(prev => ({ ...prev, caloriesBurnedPerMinute: Number(e.target.value) }))}
                    className="w-full px-4 py-2 rounded-lg border"
                    min="0"
                    required
                />
            </div>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : initialData?.id ? 'Update Exercise' : 'Create Exercise'}
                </Button>
            </div>
        </form>
    );
} 