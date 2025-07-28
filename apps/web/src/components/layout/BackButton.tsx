import { useNavigate } from 'react-router-dom';
import { Button, ChevronLeft } from '@dreamme/ui';
import { motion } from 'framer-motion';

interface BackButtonProps {
    className?: string;
}

export function BackButton({ className = '' }: BackButtonProps) {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className={`flex items-center gap-1 mb-4 text-white hover:text-white/80 hover:bg-white/10 ${className}`}
            >
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
            </Button>
        </motion.div>
    );
} 