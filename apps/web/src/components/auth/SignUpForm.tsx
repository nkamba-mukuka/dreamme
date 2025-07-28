import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { Button } from '@dreamme/ui';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function SignUpForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const validatePasswords = () => {
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validatePasswords()) {
            return;
        }

        setLoading(true);
        try {
            await signUp(email, password, name);
            // Always navigate to onboarding for new users
            navigate('/onboarding');
        } catch (err: any) {
            setError(err.message || 'Failed to sign up');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithGoogle();
            // Always navigate to onboarding for new users
            navigate('/onboarding');
        } catch (err: any) {
            setError(err.message || 'Failed to sign up with Google');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 px-4">
            <div className="w-full max-w-md bg-white/5 p-8 rounded-2xl shadow-xl backdrop-blur-lg space-y-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    <div className="text-center">
                        <h1 className="text-4xl dreamme-title mb-6">DREAMME</h1>
                        <h2 className="text-2xl font-bold text-white">Create Account</h2>
                        <p className="mt-2 text-white/80">Join us on your fitness journey</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 text-red-200 p-3 rounded-lg text-sm border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent text-white placeholder-white/50"
                                required
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent text-white placeholder-white/50"
                                required
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                                Create Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent text-white placeholder-white/50"
                                required
                                minLength={6}
                                placeholder="Create a password (min. 6 characters)"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent text-white placeholder-white/50"
                                required
                                minLength={6}
                                placeholder="Enter your password again"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-white hover:bg-white/90 text-blue-700 font-medium py-2.5 rounded-lg transition-all duration-200"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-transparent text-white/60">Or continue with</span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border-2 border-white/20 py-2.5 rounded-lg transition-colors duration-200 text-white"
                        onClick={handleGoogleSignUp}
                        disabled={loading}
                    >
                        <img
                            src="/google_logo.svg"
                            alt="Google"
                            width="20"
                            height="20"
                            className="shrink-0"
                        />
                        <span className="text-white font-medium">
                            {loading ? 'Signing up...' : 'Sign up with Google'}
                        </span>
                    </Button>

                    <p className="text-center text-sm text-white/60">
                        Already have an account?{' '}
                        <a href="/signin" className="text-white hover:text-white/80 font-medium">
                            Sign in
                        </a>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}