import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Dumbbell, Utensils, Brain, Users, Settings, LogOut } from '@dreamme/ui';
import { useAuth } from '../../lib/auth';

export function Layout() {
    const location = useLocation();
    const { user, loading, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Handle responsive sidebar
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close sidebar on mobile when route changes
    useEffect(() => {
        if (isMobile) {
            setIsOpen(false);
        }
    }, [location.pathname, isMobile]);

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/exercise', label: 'Exercise', icon: Dumbbell },
        { path: '/nutrition', label: 'Nutrition', icon: Utensils },
        { path: '/mental', label: 'Mental', icon: Brain },
        { path: '/social', label: 'Social', icon: Users },
        { path: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                initial={false}
                animate={{
                    x: isOpen ? 0 : -280,
                    transition: { type: 'spring', bounce: 0.2 }
                }}
                className={`fixed top-0 left-0 h-full w-[280px] bg-white/10 backdrop-blur-lg border-r border-white/10 p-4 z-50 
                    ${isMobile ? 'shadow-xl' : ''}`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="text-2xl font-bold text-white mb-8 text-center">
                        DREAMME
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => isMobile && setIsOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-white/20 text-white'
                                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout Button */}
                    <button
                        onClick={() => signOut()}
                        className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/10 hover:text-white rounded-lg transition-colors mt-auto"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </motion.div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed top-4 ${isOpen ? 'left-[296px] lg:left-[296px]' : 'left-4'} z-50 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all duration-300`}
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    {isOpen ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    )}
                </svg>
            </button>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${isOpen ? 'lg:ml-[280px]' : 'ml-0'}`}>
                <div className="min-h-screen p-4 sm:p-6 lg:p-8 pb-24">
                    <Outlet />
                </div>
            </main>

            {/* Footer */}
            <footer className={`transition-all duration-300 ${isOpen ? 'lg:ml-[280px]' : 'ml-0'} bg-white/10 backdrop-blur-lg border-t border-white/10`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-white/80 text-center sm:text-left">
                            <span className="font-bold text-white">DREAMME</span> © {new Date().getFullYear()}
                        </div>
                        <div className="flex gap-4 sm:gap-6 text-white/60">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
} 