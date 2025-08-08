# Hive - Real Estate and Services Platform

## Overview

Hive is a comprehensive web platform that connects properties to people who really need them, similar to iFood's model but for real estate and professional services. The platform serves as a marketplace where users can discover properties (houses, apartments, commercial spaces, event halls) and find qualified service providers (plumbers, electricians, painters, cleaners, etc.) all in one place.

The application uses a modern full-stack architecture with React frontend, Express.js backend, PostgreSQL database with Drizzle ORM, and is designed to be responsive across mobile, tablet, and desktop devices.

## User Preferences

Preferred communication style: Simple, everyday language.
Language: Portuguese (Brazil) - All interface messages and content should be in PT-BR.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with custom design system using neutral colors, white, gold, and black theme
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints under `/api` prefix
- **Data Layer**: In-memory storage implementation with interface for future database integration
- **Middleware**: Custom logging, JSON parsing, error handling

### Database Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Four main entities:
  - **Properties**: Real estate listings with pricing, location, amenities, and agency information
  - **Service Providers**: Professional service providers with ratings, categories, and portfolio
  - **Service Categories**: Organized categories of services with icons and provider counts
  - **Plans**: Subscription plans for different user types (CPF individuals vs CNPJ companies)

### Component Architecture
- **Design System**: Consistent component library with variants and proper TypeScript support
- **Card-based UI**: Property cards, service provider cards, and category cards for intuitive browsing
- **Responsive Layout**: Mobile-first design with grid systems that adapt to different screen sizes
- **Navigation**: Sticky header with mobile hamburger menu and desktop horizontal navigation

### Authentication & Authorization
- **Planned Implementation**: Session-based authentication with role-based access control
- **User Types**: Two-tier plan system (Plan A for individuals/CPF, Plan B for companies/CNPJ)

### Search & Discovery
- **Property Search**: Multi-criteria filtering by location, property type, price range, and business type
- **Service Discovery**: Category-based browsing with rating-based sorting and location filtering
- **Featured Content**: Highlighted properties and top-rated service providers

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL database connection for serverless environments
- **drizzle-orm & drizzle-kit**: Type-safe ORM and migration tools
- **@tanstack/react-query**: Server state management and caching

### UI & Styling
- **@radix-ui/***: Accessible headless UI primitives for complex components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx & tailwind-merge**: Conditional className utilities

### Development Tools
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling

### Form & Validation
- **react-hook-form & @hookform/resolvers**: Form state management
- **drizzle-zod**: Schema validation integration
- **zod**: Runtime type validation

### Additional Libraries
- **date-fns**: Date manipulation utilities
- **embla-carousel-react**: Carousel/slider components
- **cmdk**: Command palette interface
- **wouter**: Lightweight routing library
- **nanoid**: Unique ID generation