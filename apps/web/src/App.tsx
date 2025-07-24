import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { SignInForm } from './components/auth/SignInForm';
import { SignUpForm } from './components/auth/SignUpForm';
import { Dashboard } from './components/dashboard/Dashboard';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { Button } from '@dreamme/ui';
import { userProfileService } from './services/userProfile';
import './App.css';

function AuthenticatedApp() {
  const { user } = useAuth();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  const checkProfile = async () => {
    if (user) {
      const profile = await userProfileService.getProfile(user.uid);
      setHasProfile(!!profile);
    }
  };

  useEffect(() => {
    checkProfile();
  }, [user]);

  if (!user || hasProfile === null) {
    return null;
  }

  if (!hasProfile) {
    return <OnboardingFlow onComplete={checkProfile} />;
  }

  return <Dashboard />;
}

function UnauthenticatedApp() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { user } = useAuth();

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen auth-gradient relative flex flex-col justify-center items-center p-4">
      {/* Decorative circles */}
      <div className="absolute top-[-50px] left-[-50px] w-[200px] h-[200px] rounded-full bg-[#90fBf6]/30 blur-3xl" />
      <div className="absolute bottom-[-50px] right-[-50px] w-[200px] h-[200px] rounded-full bg-[#7BE9B9]/30 blur-3xl" />

      <div className="w-full max-w-md card-gradient rounded-2xl p-8 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gradient mb-2">DREAMME</h1>
          <p className="text-muted-foreground">Your fitness journey begins here</p>
        </div>

        {isSignUp ? <SignUpForm /> : <SignInForm />}

        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:text-primary/90 font-medium"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </Button>
        </div>
      </div>

      {/* Bottom text */}
      <p className="mt-8 text-sm text-center text-muted-foreground">
        By continuing, you agree to our{' '}
        <a href="#" className="text-primary hover:underline">Terms of Service</a>
        {' '}and{' '}
        <a href="#" className="text-primary hover:underline">Privacy Policy</a>
      </p>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <AuthenticatedApp />
      <UnauthenticatedApp />
    </AuthProvider>
  );
}

export default App;
