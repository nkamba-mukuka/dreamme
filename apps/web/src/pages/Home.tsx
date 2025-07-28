import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@dreamme/ui';

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
            <h1 className="text-4xl font-bold mb-4">
                Welcome to DREAM-ME
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Your personal fitness journey starts here. Track workouts, monitor nutrition,
                manage mental health, and connect with a supportive community.
            </p>
            <div className="flex gap-4">
                <Link to="/signup">
                    <Button>Get Started</Button>
                </Link>
                <Link to="/about">
                    <Button variant="ghost">Learn More</Button>
                </Link>
            </div>
        </div>
    );
} 