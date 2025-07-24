import { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup,
} from 'firebase/auth';
import { auth } from './firebase';
import { userProfileService } from '../services/userProfile';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('Setting up auth state listener');
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'No user');
            setUser(user);
            setLoading(false);
        });

        return () => {
            console.log('Cleaning up auth state listener');
            unsubscribe();
        };
    }, []);

    const signUp = async (email: string, password: string) => {
        console.log('Attempting to sign up with email:', email);
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            console.log('Sign up successful:', result.user.uid);
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    };

    const signIn = async (email: string, password: string) => {
        console.log('Attempting to sign in with email:', email);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            console.log('Sign in successful:', result.user.uid);
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        console.log('Attempting to sign in with Google');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            console.log('Google sign in successful:', result.user.uid);

            // Check if user profile exists, if not create one
            const profile = await userProfileService.getProfile(result.user.uid);
            if (!profile) {
                await userProfileService.createProfile(result.user.uid, {
                    email: result.user.email || '',
                    displayName: result.user.displayName || '',
                    photoURL: result.user.photoURL || undefined,
                    fitnessGoals: ['generalFitness'],
                    fitnessLevel: 'beginner',
                    personalInfo: {
                        firstName: result.user.displayName?.split(' ')[0],
                        lastName: result.user.displayName?.split(' ').slice(1).join(' '),
                    },
                });
            }
        } catch (error) {
            console.error('Google sign in error:', error);
            throw error;
        }
    };

    const logout = async () => {
        console.log('Attempting to sign out');
        try {
            await signOut(auth);
            console.log('Sign out successful');
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    };

    const resetPassword = async (email: string) => {
        console.log('Attempting to send password reset email to:', email);
        try {
            await sendPasswordResetEmail(auth, email);
            console.log('Password reset email sent successfully');
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        logout,
        resetPassword,
    };

    console.log('Auth context current state:', {
        hasUser: !!user,
        isLoading: loading,
    });

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 