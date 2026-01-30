# XPGains

A gamified fitness tracker inspired by OSRS that transforms strength training into an RPG-like experience.

## Features

- **14 Muscle Skills** - Level up each muscle group from 1 to 99
- **XP System** - Earn XP based on weight, reps, and exercise type
- **Spillover XP** - Compound exercises award bonus XP to secondary muscles
- **Offline-First** - Works fully offline with background sync
- **Guest Mode** - No account required to start training
- **Cloud Sync** - Sync progress across devices with Supabase

## Project Structure

```
/
├── apps/
│   └── mobile/           # Expo React Native app
│
├── packages/
│   └── core/             # Domain logic (XP, levels, state)
│
├── supabase/
│   └── migrations/       # Database schema
│
└── docs/                 # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 10+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/SavorgDev/XPGains.git
cd XPGains

# Install dependencies
npm install

# Build the core package
cd packages/core
npm run build
cd ../..

# Start the mobile app
cd apps/mobile
npm start
```

### Environment Variables

Create `.env` in `apps/mobile/`:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Running the App

```bash
# Start Expo development server
npm run mobile

# iOS (requires macOS)
npm run mobile:ios

# Android
npm run mobile:android
```

## Architecture

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

### Key Design Decisions

1. **Domain-Driven Design** - All game rules in `@xpgains/core`
2. **Offline-First** - Local state always updated immediately
3. **Idempotent Sync** - Client-generated IDs prevent duplicates
4. **Event Sourcing** - XP tracked via immutable events

## XP System

### Level Progression

```
XP to next level = 150 × 1.03^(level-1)
Max level: 99
Total XP for 99: ~83,000
```

### XP Calculation

```
XP = BaseXP × RepsFactor × IntensityFactor × Diminishing × NeglectedBonus

BaseXP: Compound (50), Isolation (35)
RepsFactor: 0.6 - 2.0 based on reps
IntensityFactor: 0.7 - 1.6 based on weight
NeglectedBonus: +10% for muscles not trained in 7+ days
```

## Supabase Setup

### Create Project

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and anon key

### Run Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Development

### Core Package

```bash
cd packages/core

# Build
npm run build

# Watch mode
npm run dev

# Run tests
npm test
```

### Mobile App

```bash
cd apps/mobile

# Start development
npm start

# Run on device
npm run ios
npm run android
```

## Testing

```bash
# Run all tests
npm test

# Run core tests only
cd packages/core && npm test
```

## Documentation

- [Architecture](docs/architecture.md) - System architecture and design
- [Data Model](docs/data-model.md) - Database schema and types
- [Sync Strategy](docs/sync-strategy.md) - Offline-first sync approach
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) - Detailed build plan

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

© 2026 Gerbert Guliyev. All rights reserved.

## Acknowledgments

- Inspired by Old School RuneScape's skill system
- Built with Expo, React Native, and Supabase
