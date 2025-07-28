import { useState, useRef } from 'react';
import { Button } from '@dreamme/ui';
import { BackButton } from '../components/layout/BackButton';
import { ExerciseList } from '../components/exercise/ExerciseList';
import { WorkoutLogForm } from '../components/exercise/WorkoutLogForm';
import { ProgressDashboard, ProgressDashboardRef } from '../components/exercise/ProgressDashboard';
import { WorkoutHistory } from '../components/exercise/WorkoutHistory';

type View = 'exercises' | 'workout' | 'progress' | 'history';

export default function Exercise() {
    const [currentView, setCurrentView] = useState<View>('exercises');
    const progressDashboardRef = useRef<ProgressDashboardRef>(null);

    const handleExerciseComplete = () => {
        // Refresh stats and switch to progress view
        progressDashboardRef.current?.refreshStats();
        setCurrentView('progress');
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="space-y-8">
                <div>
                    <BackButton />

                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-white">Exercise & Workouts</h1>
                        <div className="flex space-x-4">
                            <Button
                                variant={currentView === 'exercises' ? 'default' : 'outline'}
                                onClick={() => setCurrentView('exercises')}
                            >
                                Exercise Library
                            </Button>
                            <Button
                                variant={currentView === 'workout' ? 'default' : 'outline'}
                                onClick={() => setCurrentView('workout')}
                            >
                                Log Workout
                            </Button>
                            <Button
                                variant={currentView === 'progress' ? 'default' : 'outline'}
                                onClick={() => setCurrentView('progress')}
                            >
                                Progress
                            </Button>
                            <Button
                                variant={currentView === 'history' ? 'default' : 'outline'}
                                onClick={() => setCurrentView('history')}
                            >
                                History
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        {currentView === 'exercises' && (
                            <ExerciseList onExerciseComplete={handleExerciseComplete} />
                        )}
                        {currentView === 'workout' && (
                            <WorkoutLogForm
                                preSelectedExercise=""
                                onComplete={() => {
                                    progressDashboardRef.current?.refreshStats();
                                    setCurrentView('progress');
                                }}
                            />
                        )}
                        {currentView === 'progress' && (
                            <ProgressDashboard ref={progressDashboardRef} />
                        )}
                        {currentView === 'history' && (
                            <WorkoutHistory limit={20} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 