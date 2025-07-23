# DREAMME - Your Personal Fitness Companion

A modern, personalized fitness web application that provides tailored workout plans, nutrition guidance, mental health support, and progress tracking with offline capabilities.

## Features

- 🏋️‍♂️ Personalized workout plans
- 🥗 Nutrition guidance and meal planning
- 🧘‍♀️ Mental health support and wellness features
- 📊 Progress tracking dashboard
- 📱 Offline-first capabilities
- 🎯 Goal-based customization

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS, shadcn/ui
- **State Management:** TanStack Query + Zustand
- **Backend:** Firebase (Auth, Firestore, Storage, Functions)
- **Build Tools:** Turborepo, PNPM workspaces
- **Testing:** Vitest, Testing Library, Playwright

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PNPM package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/DREAMME.git
cd DREAMME
```

2. Install dependencies
```bash
pnpm install
```

3. Start the development server
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
DREAMME/
├── apps/
│   └── web/              # React frontend application
├── packages/
│   ├── shared/           # Shared utilities and types
│   └── config/           # Shared configurations
└── functions/            # Firebase Cloud Functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details 