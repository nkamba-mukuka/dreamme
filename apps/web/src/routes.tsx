import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, useNavigate, Outlet } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LoadingSpinner } from '@dreamme/ui';
import { useAuth } from './lib/auth';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { userProfileService } from './services/userProfile';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Exercise = lazy(() => import('./pages/Exercise'));
const Nutrition = lazy(() => import('./pages/Nutrition'));
const Mental = lazy(() => import('./pages/Mental'));
const Social = lazy(() => import('./pages/Social'));
const Settings = lazy(() => import('./pages/Settings'));

// Auth Layout Component
function AuthLayout() {
    const letters = "DREAMME".split("");
    const sparkles = ["✨", "⭐", "💫", "✨"];

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="fixed inset-0 w-full h-full object-cover"
            >
                <source src="/video_background.MP4" type="video/mp4" />
            </video>

            {/* Gradient overlay with a more dreamy feel */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-indigo-900/40 to-blue-900/50 backdrop-blur-[2px]" />

            {/* Animated particles */}
            {sparkles.map((sparkle, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0.4, 0.8, 0.4],
                        scale: [1, 1.2, 1],
                        y: [-10, 10, -10]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.8,
                        ease: "easeInOut"
                    }}
                    className={`absolute text-3xl text-white/80 ${i === 0 ? "top-1/4 left-1/4" :
                        i === 1 ? "top-1/3 right-1/4" :
                            i === 2 ? "bottom-1/3 left-1/3" :
                                "bottom-1/4 right-1/3"
                        }`}
                >
                    {sparkle}
                </motion.div>
            ))}

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-12"
                >
                    <div className="flex gap-2 mb-4">
                        {letters.map((letter, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, y: 40, rotate: -10 }}
                                animate={{ opacity: 1, y: 0, rotate: 0 }}
                                transition={{
                                    delay: index * 0.1,
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15,
                                    bounce: 0.5
                                }}
                                whileHover={{
                                    scale: 1.2,
                                    rotate: [0, -5, 5, 0],
                                    transition: { duration: 0.3 }
                                }}
                                className="text-7xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] cursor-default"
                                style={{
                                    textShadow: '0 0 20px rgba(255,255,255,0.2), 0 0 40px rgba(255,255,255,0.1)'
                                }}
                            >
                                {letter}
                            </motion.span>
                        ))}
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="relative"
                    >
                        <p className="text-white/90 text-center text-xl font-medium drop-shadow-md">
                            Transform into your dream self ✨
                        </p>
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute -right-8 top-0 text-2xl"
                        >
                            💫
                        </motion.div>
                    </motion.div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/20">
                        <Outlet />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// Auth guard component that also checks for onboarding completion
function RequireAuth({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [hasProfile, setHasProfile] = useState(false);
    const [isNewUser, setIsNewUser] = useState(false);

    useEffect(() => {
        async function checkProfile() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const profile = await userProfileService.getProfile(user.uid);
                // If no profile exists, this is likely a new user
                setIsNewUser(!profile);
                setHasProfile(!!profile);
            } catch (err) {
                console.error('Error checking user profile:', err);
            } finally {
                setLoading(false);
            }
        }

        checkProfile();
    }, [user]);

    if (loading) {
        return <PageLoader />;
    }

    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    // Only redirect to onboarding if it's a new user
    if (isNewUser && window.location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />;
    }

    // If user has completed onboarding, allow access to protected routes
    return children;
}

// Guest guard component (redirect authenticated users away from auth pages)
function RequireGuest({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
}

// Loading component
function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner size="lg" />
        </div>
    );
}

// Router configuration
export const router = createBrowserRouter([
    {
        path: '/',
        element: <RequireGuest><AuthLayout /></RequireGuest>,
        errorElement: <AuthLayout />,
        children: [
            {
                index: true,
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <SignIn />
                    </Suspense>
                ),
            },
            {
                path: 'signin',
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <SignIn />
                    </Suspense>
                ),
            },
            {
                path: 'signup',
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <SignUp />
                    </Suspense>
                ),
            },
        ],
    },
    {
        path: '/onboarding',
        element: (
            <RequireAuth>
                <OnboardingFlow />
            </RequireAuth>
        ),
    },
    {
        path: '/',
        element: <Layout />,
        errorElement: <ErrorBoundary />,
        children: [
            {
                path: 'home',
                element: (
                    <RequireAuth>
                        <Suspense fallback={<PageLoader />}>
                            <Home />
                        </Suspense>
                    </RequireAuth>
                ),
            },
            {
                path: 'dashboard',
                element: (
                    <RequireAuth>
                        <Suspense fallback={<PageLoader />}>
                            <Dashboard />
                        </Suspense>
                    </RequireAuth>
                ),
            },
            {
                path: 'profile',
                children: [
                    {
                        index: true,
                        element: (
                            <RequireAuth>
                                <Suspense fallback={<PageLoader />}>
                                    <Profile />
                                </Suspense>
                            </RequireAuth>
                        ),
                    },
                    {
                        path: ':userId',
                        element: (
                            <Suspense fallback={<PageLoader />}>
                                <Profile />
                            </Suspense>
                        ),
                    },
                ],
            },
            {
                path: 'exercise',
                element: (
                    <RequireAuth>
                        <Suspense fallback={<PageLoader />}>
                            <Exercise />
                        </Suspense>
                    </RequireAuth>
                ),
            },
            {
                path: 'nutrition',
                element: (
                    <RequireAuth>
                        <Suspense fallback={<PageLoader />}>
                            <Nutrition />
                        </Suspense>
                    </RequireAuth>
                ),
            },
            {
                path: 'mental',
                element: (
                    <RequireAuth>
                        <Suspense fallback={<PageLoader />}>
                            <Mental />
                        </Suspense>
                    </RequireAuth>
                ),
            },
            {
                path: 'social',
                element: (
                    <RequireAuth>
                        <Suspense fallback={<PageLoader />}>
                            <Social />
                        </Suspense>
                    </RequireAuth>
                ),
            },
            {
                path: 'settings',
                element: (
                    <RequireAuth>
                        <Suspense fallback={<PageLoader />}>
                            <Settings />
                        </Suspense>
                    </RequireAuth>
                ),
            },
        ],
    },
]); 