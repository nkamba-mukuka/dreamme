import React, { ReactElement } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../lib/auth.tsx';
import { TestErrorBoundary } from './TestErrorBoundary';
import * as testHelpers from './helpers';

// Mock user for testing
export const mockUser = {
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    emailVerified: true,
};

// Common test data
export const mockTestData = {
    workouts: [
        { id: '1', name: 'Test Workout', duration: 30 },
        { id: '2', name: 'Another Workout', duration: 45 },
    ],
    achievements: [
        { id: '1', title: 'First Workout', description: 'Complete your first workout' },
        { id: '2', title: 'Week Streak', description: 'Complete workouts for 7 days' },
    ],
};

// Helper to wait for loading states
export const waitForLoadingToFinish = async () => {
    const loading = document.querySelector('[role="status"], [aria-busy="true"]');
    if (loading) {
        // Wait for loading to finish
        await new Promise((resolve) => setTimeout(resolve, 0));
    }
};

// Wrapper component for testing
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <TestErrorBoundary>
            <BrowserRouter>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </BrowserRouter>
        </TestErrorBoundary>
    );
};

// Custom render function with options
const customRender = (
    ui: ReactElement,
    options = {}
) => {
    const utils = {
        ...render(ui, { wrapper: AllTheProviders, ...options }),
        // Add custom helper methods
        ...testHelpers,
        waitForLoadingToFinish,
        // Add user event instance
        user: userEvent.setup(),
    };

    return {
        ...utils,
        // Add helper to rerender with same utils
        rerender: (newUi: ReactElement) => ({
            ...utils,
            ...render(newUi, { wrapper: AllTheProviders, ...options })
        }),
    };
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
export { userEvent };
export * from './helpers'; 