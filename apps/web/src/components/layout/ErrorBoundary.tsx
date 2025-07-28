import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { motion } from 'framer-motion';

export function ErrorBoundary() {
    const error = useRouteError();
    let errorMessage = 'An unexpected error occurred';

    if (isRouteErrorResponse(error)) {
        errorMessage = error.statusText || error.data?.message || 'Page not found';
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-black/30 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/10 text-center"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-3xl font-bold text-white mb-4">Oops!</h2>
                    <p className="text-gray-300">{errorMessage}</p>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all"
                    onClick={() => window.location.href = '/'}
                >
                    Go Back Home
                </motion.button>
            </motion.div>
        </div>
    );
} 