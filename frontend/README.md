# NAVIAR CONSULT Frontend

Modern web dashboard for the NAVIAR CONSULT platform built with React, Next.js, and TypeScript.

## Technology Stack

- **React 19** - UI framework
- **Next.js 15** - React framework with SSR and routing
- **TypeScript** - Type-safe JavaScript
- **TailwindCSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Query** - Server state management
- **Recharts** - Data visualization
- **Axios** - HTTP client

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
frontend/
├── app/                      # Next.js app directory
│   ├── auth/                # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/           # Main dashboard
│   ├── employees/           # Employee management
│   ├── consultations/       # Consultation scheduling
│   ├── documents/           # Document management
│   ├── analytics/           # Analytics and reporting
│   ├── settings/            # Configuration
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # Reusable React components
│   ├── common/              # Common components
│   ├── forms/               # Form components
│   ├── charts/              # Chart components
│   └── layout/              # Layout components
├── hooks/                   # Custom React hooks
│   └── useAuth.ts           # Authentication hook
├── services/                # API and services
│   └── api.ts               # API client
├── store/                   # Redux state management
│   ├── store.ts             # Store configuration
│   └── authSlice.ts         # Auth state slice
├── types/                   # TypeScript types
│   └── index.ts             # Type definitions
├── utils/                   # Utility functions
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # TailwindCSS configuration
├── .eslintrc.json           # ESLint rules
└── .prettierrc.json         # Prettier formatting
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run type-check` - Type check without emitting

## Features

### Authentication
- User registration and login
- JWT token management
- Role-based access control (RBAC)
- Protected routes

### Dashboard
- Organization overview
- Quick statistics
- Navigation to main features
- User profile information

### Modules (In Development)
- **Employees** - Employee management and directory
- **Consultations** - Schedule and manage consultations
- **Documents** - Upload and manage documents
- **Analytics** - View reports and metrics
- **Settings** - Organization and user settings

## Environment Configuration

Create a `.env.local` file in the frontend directory:

```env
# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

# Optional: Add more environment variables as needed
```

## API Integration

The frontend connects to the NAVIAR CONSULT backend API at:
- Development: `http://localhost:5000`
- Production: Set via `NEXT_PUBLIC_API_BASE_URL` environment variable

### Authentication Flow

1. User logs in with email and password
2. Backend returns JWT token
3. Token stored in localStorage
4. Token sent with all subsequent requests
5. Automatic redirect to login if token expires

## Code Quality

### ESLint
Enforces code standards and best practices:
```bash
npm run lint
npm run lint:fix
```

### Prettier
Auto-formats code for consistency:
```bash
npm run format
```

### TypeScript
Strict type checking enabled:
```bash
npm run type-check
```

## Testing

Unit and integration tests with Jest and React Testing Library:

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Performance Optimization

- Next.js automatic code splitting
- Image optimization
- CSS minification
- React server components
- Efficient state management with Redux

## Security

- XSS protection headers
- CSRF token handling
- HTTPS enforcement (production)
- Secure token storage
- Input validation

## Deployment

### Vercel (Recommended)

```bash
# Deploy with Vercel CLI
vercel deploy
```

### Docker

```bash
# Build Docker image
docker build -t naviar-consult-frontend .

# Run container
docker run -p 3000:3000 naviar-consult-frontend
```

### Manual Deployment

```bash
# Build production bundle
npm run build

# Start production server
npm run start
```

## Troubleshooting

### Port 3000 already in use
```bash
lsof -i :3000
kill -9 <PID>
```

### Dependencies not installing
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build fails
```bash
npm run type-check
npm run lint
npm run build
```

## Contributing

Follow the project's code standards:
- TypeScript strict mode enabled
- ESLint configuration
- Prettier formatting
- Component-based architecture
- Functional components with hooks

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)

## Support

For issues and questions:
1. Check [GitHub Issues](../../issues)
2. Review [DEVELOPMENT.md](../DEVELOPMENT.md)
3. Consult the [PHASE2_ROADMAP.md](../PHASE2_ROADMAP.md)

## License

Part of NAVIAR CONSULT Platform

---

**Last Updated**: 2026-10-04  
**Status**: Phase 2 - Initial Implementation  
**Version**: 0.1.0
