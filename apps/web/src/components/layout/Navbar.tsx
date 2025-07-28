import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { Button } from '@dreamme/ui';

export function Navbar() {
    const { user, signOut } = useAuth();

    return (
        <nav className="bg-black/30 backdrop-blur-xl border-b border-white/10">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link to="/dashboard" className="flex items-center">
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
                            DREAM ME
                        </span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        <Link to="/dashboard" className="text-gray-300 hover:text-white">
                            Dashboard
                        </Link>
                        <Link to="/exercise" className="text-gray-300 hover:text-white">
                            Exercise
                        </Link>
                        <Link to="/nutrition" className="text-gray-300 hover:text-white">
                            Nutrition
                        </Link>
                        <Link to="/mental" className="text-gray-300 hover:text-white">
                            Mental
                        </Link>
                        <Link to="/social" className="text-gray-300 hover:text-white">
                            Social
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link to="/profile">
                            <img
                                src={user?.photoURL || '/default-avatar.png'}
                                alt="Profile"
                                className="w-8 h-8 rounded-full border-2 border-white/20"
                            />
                        </Link>
                        <Button
                            variant="ghost"
                            className="text-gray-300 hover:text-white"
                            onClick={() => signOut()}
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
} 