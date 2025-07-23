import { Button } from './components/ui/button'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">DREA,ME</h1>
        <div className="space-y-4">
          <div className="p-6 bg-card rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Welcome to Your Fitness Journey</h2>
            <p className="text-muted-foreground mb-4">
              Your personalized fitness companion for workouts, nutrition, and mental wellness.
            </p>
            <div className="space-x-4">
              <Button size="lg">Get Started</Button>
              <Button variant="outline" size="lg">Learn More</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
