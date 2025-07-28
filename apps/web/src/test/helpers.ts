import { expect } from 'vitest';
import { screen, waitFor } from '@testing-library/react';

// Type for any function
type AnyFunction = (...args: any[]) => any;

// Helper to ensure a function doesn't throw
export const expectNotToThrow = async (fn: AnyFunction) => {
    try {
        await fn();
    } catch (error) {
        throw new Error(`Expected not to throw but got: ${error}`);
    }
};

// Helper to ensure all required elements are present
export const expectRequiredElementsPresent = (elements: string[]) => {
    elements.forEach(element => {
        expect(screen.getByText(element)).toBeInTheDocument();
    });
};

// Helper to wait for loading to complete and assert content
export const waitForContentAndAssert = async (text: string) => {
    await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(screen.getByText(text)).toBeInTheDocument();
    });
};

// Helper to check form validation
export const expectFormValidation = async (
    getErrorMessage: () => HTMLElement | null,
    submitForm: () => Promise<void>,
    expectedError: string
) => {
    await submitForm();
    const errorMessage = getErrorMessage();
    expect(errorMessage).toHaveTextContent(expectedError);
};

// Helper to mock API responses
export const mockApiResponse = <T>(data: T) => {
    return {
        ok: true,
        json: async () => data,
        status: 200,
        headers: new Headers(),
    };
};

// Helper to mock API error
export const mockApiError = (status: number, message: string) => {
    return {
        ok: false,
        status,
        statusText: message,
        json: async () => ({ message }),
        headers: new Headers(),
    };
};

// Helper to test async error handling
export const expectAsyncError = async (
    fn: AnyFunction,
    expectedError: string
) => {
    try {
        await fn();
        throw new Error('Expected function to throw');
    } catch (error) {
        expect(error).toHaveProperty('message', expectedError);
    }
};

// Helper to test component props
export const expectPropsMatch = (
    element: HTMLElement,
    props: Record<string, any>
) => {
    Object.entries(props).forEach(([key, value]) => {
        expect(element).toHaveAttribute(key, String(value));
    });
}; 