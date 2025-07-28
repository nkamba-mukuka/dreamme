import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { Button } from '@dreamme/ui';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export function SignInForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const { signIn, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signIn(email, password);
            setIsTransitioning(true);
            // Always navigate to dashboard for sign in
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await signInWithGoogle();
            setIsTransitioning(true);
            // Always navigate to dashboard for sign in
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with Google');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 px-4">
            <AnimatePresence>
                {!isTransitioning && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-md bg-white/5 p-8 rounded-2xl shadow-xl backdrop-blur-lg space-y-6"
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <motion.h1
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.2 }}
                                    className="text-4xl dreamme-title mb-6"
                                >
                                    DREAMME
                                </motion.h1>
                                <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                                <p className="mt-2 text-white/80">Sign in to continue your journey</p>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-red-500/10 text-red-200 p-3 rounded-lg text-sm border border-red-500/20"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent text-white placeholder-white/50"
                                        required
                                        placeholder="Enter your password"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-white hover:bg-white/90 text-blue-700 font-medium py-2.5 rounded-lg transition-all duration-200"
                                    disabled={loading}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
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
                                onClick={handleGoogleSignIn}
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
                                    {loading ? 'Signing in...' : 'Sign in with Google'}
                                </span>
                            </Button>

                            <p className="text-center text-sm text-white/60">
                                Don't have an account?{' '}
                                <a href="/signup" className="text-white hover:text-white/80 font-medium">
                                    Sign up
                                </a>
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
} 