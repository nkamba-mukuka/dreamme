# DREAM-ME: Your Personal Fitness Journey

DREAM-ME is a comprehensive fitness application that helps you track your workouts, monitor nutrition, manage mental health, and connect with a supportive community. Built with modern web technologies and a focus on user experience, DREAM-ME is your all-in-one solution for achieving your fitness goals.

## Features

### 🏋️‍♂️ Workout Management
- Create and track custom workouts
- Log exercises with sets, reps, and weights
- Monitor progress with detailed statistics
- Set and achieve fitness goals

### 🥗 Nutrition Tracking
- Log meals and track macronutrients
- Create and save custom recipes
- Plan meals with a weekly calendar
- Monitor nutritional goals

### 🧘‍♂️ Mental Health
- Journal your thoughts and track mood
- Practice guided breathing exercises
- Set and track personal motivations
- Monitor mental well-being

### 👥 Social Features
- Share workouts and achievements
- Connect with other fitness enthusiasts
- Comment and like posts
- Track achievements and milestones

## Tech Stack

- **Frontend**: React + Vite with TypeScript
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend/Database**: Firebase (Firestore)
- **Authentication**: Firebase Auth
- **State Management**: React Hooks
- **Testing**: Vitest + Testing Library
- **Build System**: Turborepo + PNPM

## Getting Started

### Prerequisites

- Node.js 18+
- PNPM 8+
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dream-me.git
   cd dream-me
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp apps/web/.env.example apps/web/.env
   ```
   Fill in your Firebase configuration details in the `.env` file.

4. Start the development server:
   ```bash
   pnpm dev
   ```

### Project Structure

```
dream-me/
├── apps/
│   └── web/              # Main web application
│       ├── src/
│       │   ├── components/   # React components
│       │   ├── lib/         # Utilities and services
│       │   ├── services/    # API services
│       │   └── types/       # TypeScript types
│       └── public/          # Static assets
├── packages/
│   ├── config/            # Shared configurations
│   └── ui/               # Shared UI components
└── docs/                # Documentation
```

## Development

### Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm test` - Run tests
- `pnpm lint` - Run linter
- `pnpm format` - Format code

### Testing

We use Vitest and Testing Library for testing. Run tests with:

```bash
pnpm test          # Run all tests
pnpm test:watch    # Run tests in watch mode
pnpm test:coverage # Run tests with coverage
```

### Code Style

We use ESLint and Prettier for code formatting. Format your code with:

```bash
pnpm format
```

## Deployment

1. Build the application:
   ```bash
   pnpm build
   ```

2. Deploy to Firebase:
   ```bash
   pnpm deploy
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Firebase](https://firebase.google.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Turborepo](https://turbo.build/repo)
- [PNPM](https://pnpm.io/) 