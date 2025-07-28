import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@dreamme/ui';
import { useAuth } from '../lib/auth';
import { motion } from 'framer-motion';

export default function SignUp() {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await signUp(email, password, ''); // Add empty string as name parameter
            navigate('/onboarding');
        } catch (error) {
            console.error('Sign up error:', error);
            setError('Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 px-4 relative overflow-hidden">
            {/* Animated background shapes */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                className="absolute w-96 h-96 bg-white rounded-full blur-3xl -top-20 -left-20"
            />
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
                className="absolute w-96 h-96 bg-white rounded-full blur-3xl -bottom-20 -right-20"
            />

            <div className="w-full max-w-md bg-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl space-y-8 relative z-10 border border-white/20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-8"
                >
                    <div className="text-center">
                        <motion.h1
                            className="text-5xl dreamme-title mb-8"
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, type: "spring" }}
                        >
                            DREAMME
                        </motion.h1>
                        <h2 className="text-2xl font-bold text-white">Start Your Journey ✨</h2>
                        <p className="mt-2 text-white/80">Create your account and begin your transformation</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 text-red-200 p-4 rounded-2xl text-sm border border-red-500/20 shadow-lg"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent text-white placeholder-white/50 transition-all duration-200"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent text-white placeholder-white/50 transition-all duration-200"
                                    placeholder="Create a password"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-300 to-purple-300 hover:from-indigo-400 hover:to-purple-400 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-white/80">
                        Already have an account?{' '}
                        <Link to="/signin" className="text-white hover:text-white font-medium underline decoration-2 underline-offset-4 hover:decoration-white/50 transition-all duration-200">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
} 