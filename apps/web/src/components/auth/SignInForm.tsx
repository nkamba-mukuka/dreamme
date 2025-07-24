import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { Button } from '@dreamme/ui';
import { FirebaseError } from 'firebase/app';

export function SignInForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signInWithGoogle } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Starting sign in process...');
        setError('');
        setLoading(true);

        try {
            console.log('Attempting to sign in with:', { email });
            await signIn(email, password);
            console.log('Sign in successful!');
        } catch (err) {
            console.error('Full sign in error:', err);
            if (err instanceof FirebaseError) {
                // Handle specific Firebase error codes
                switch (err.code) {
                    case 'auth/invalid-email':
                        setError('Invalid email address format.');
                        break;
                    case 'auth/user-disabled':
                        setError('This account has been disabled.');
                        break;
                    case 'auth/user-not-found':
                        setError('No account found with this email.');
                        break;
                    case 'auth/wrong-password':
                        setError('Incorrect password.');
                        break;
                    case 'auth/network-request-failed':
                        setError('Network error. Please check your connection.');
                        break;
                    default:
                        setError(`Authentication error: ${err.message}`);
                }
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithGoogle();
        } catch (err) {
            console.error('Google sign in error:', err);
            setError('Failed to sign in with Google. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-center text-foreground">Welcome Back</h2>
                <p className="text-muted-foreground text-center">Enter your credentials to continue</p>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 input-style rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                        placeholder="Enter your email"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label htmlFor="password" className="text-sm font-medium text-foreground">
                            Password
                        </label>
                        <a href="#" className="text-sm text-primary hover:underline">
                            Forgot password?
                        </a>
                    </div>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 input-style rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                        placeholder="Enter your password"
                    />
                </div>
                <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#10b981] hover:opacity-90 transition-opacity"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                        </div>
                    ) : (
                        'Sign In'
                    )}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={loading}
            >
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Continue with Google
            </Button>
        </div>
    );
} 