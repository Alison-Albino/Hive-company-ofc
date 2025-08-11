# Hive - Real Estate and Services Platform

## Overview

Hive is a comprehensive web platform that connects properties to people who really need them, similar to iFood's model but for real estate and professional services. The platform serves as a marketplace where users can discover properties (houses, apartments, commercial spaces, event halls) and find qualified service providers (plumbers, electricians, painters, cleaners, etc.) all in one place.

The application uses a modern full-stack architecture with React frontend, Express.js backend, PostgreSQL database with Drizzle ORM, and is designed to be responsive across mobile, tablet, and desktop devices.

## Recent Changes (January 2025)

### Sistema de Controle de Assinatura Implementado (Janeiro 2025)
- **Sistema Completo de Assinatura**: Controle total do ciclo de vida das assinaturas:
  - Duração fixa de 30 dias para ambos os planos (BE HIVE R$ 29 e HIVE GOLD R$ 59)
  - Período de cancelamento gratuito de 7 dias após criação da assinatura
  - Integração completa com Stripe para processamento de pagamentos
  - Criação automática de registro de assinatura após pagamento bem-sucedido
- **Dashboard de Assinatura**: Página dedicada `/subscription` para gerenciamento:
  - Visualização detalhada do status da assinatura ativa
  - Informações de duração, renovação e elegibilidade para cancelamento
  - Funcionalidade de cancelamento dentro do período permitido
  - Histórico completo de assinaturas anteriores
- **Backend Storage Completo**: Métodos implementados para:
  - Criação e gerenciamento de assinaturas com status e datas
  - Verificação de elegibilidade para cancelamento baseada em períodos
  - Registro de histórico de pagamentos integrado ao Stripe
  - Ativação/desativação automática de planos de prestadores
- **Correção de Conflitos Stripe**: Resolvido erro de configuração que impedia pagamentos
  - Removido conflito entre `automatic_payment_methods` e `payment_method_types`
  - Sistema de checkout totalmente operacional com todos os métodos de pagamento

### Complete Implementation of Hive-First Contact Policy
- **Mandatory Chat Platform**: All user contact now exclusively through Hive platform:
  - Removed all phone numbers and email addresses from provider profiles and property listings
  - Implemented authentication-required chat system across all user interactions
  - Added informative messages about "primeiro contato via Hive" policy on all pages
  - Property detail pages, profiles, and services require login before chat initiation
- **Functional Chat System**: Real-time messaging platform fully operational:
  - Fixed React hooks ordering issues in ChatPage component
  - Chat conversations load properly for authenticated users
  - All chat endpoints protected with authentication middleware
- **Stripe Payment Integration**: Subscription system working correctly:
  - Backend processing subscriptions successfully (clientSecret generation confirmed)
  - Plan A: "BE HIVE" - R$ 29/mês (CPF individuals)
  - Plan B: "HIVE GOLD" - R$ 59/mês (CNPJ companies)
  - Improved error handling for payment processing
- **Platform Policy Enforcement**: Complete removal of direct contact methods ensures all communication flows through Hive marketplace
- **Enhanced Payment Methods**: Stripe configured with automatic payment methods detection:
  - Supports all available payment methods: Cartões, Apple Pay, Google Pay, Link
  - Dynamic payment method detection based on user device and account configuration
  - Improved checkout experience with tabbed layout and wallet integration
  - Auto-redirect support for payment methods requiring external authentication

### Enhanced Category System with Plan-Based Access Control (January 2025)
- **Clear Plan-Based Category Separation**: Logical category organization:
  - **CPF Plans (BE HIVE R$ 29/mês)**: 13 service categories with planType="CPF"
    * Eletricista, Encanador, Pintor, Pedreiro, Marceneiro, Limpeza, Jardinagem
    * Ar Condicionado, Dedetização, Segurança, Assistência Técnica, Serralheria, Mudanças
  - **CNPJ Plans (HIVE GOLD R$ 59/mês)**: All CPF categories PLUS exclusive "Imobiliária" category
    * Single consolidated "Imobiliária" category with planType="CNPJ"
    * 10 real estate subcategories (Residenciais, Comerciais, Incorporação, etc.)
- **Subcategory Selection System**: Advanced provider configuration:
  - Providers select 1 main category and 1-3 subcategories
  - Mandatory biography field (minimum requirements)
  - Optional profile image upload
  - Optional portfolio images (up to 5 images)
- **Plan-Based Filtering**: Strict access control implementation:
  - CPF users see ONLY categories with planType="CPF" (13 service categories)
  - CNPJ users see ALL categories (13 CPF service categories + 1 CNPJ imobiliária)
  - Frontend and backend validation ensures plan compliance

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
- **Schema**: Six main entities:
  - **Properties**: Real estate listings with pricing, location, amenities, and agency information
  - **Service Providers**: Professional service providers with ratings, categories, and portfolio
  - **Service Categories**: 14 total categories (13 basic services + 1 consolidated imobiliária) with subcategories and provider counts
  - **Plans**: Subscription plans for different user types (CPF individuals vs CNPJ companies)
  - **Subscriptions**: Complete subscription management with 30-day duration and 7-day cancellation window
  - **Payment History**: Transaction records integrated with Stripe payment processing

### Component Architecture
- **Design System**: Consistent component library with variants and proper TypeScript support
- **Card-based UI**: Property cards, service provider cards, and category cards for intuitive browsing
- **Interactive Map**: Custom map component with property markers and nearby places visualization
- **Chat System**: Complete messaging platform with widget and full-page interface
  - Real-time chat widget with intelligent responses and contextual help
  - Full chat page (/chat) with Facebook-style interface
  - Sidebar with conversation list, search functionality, and user status
  - Message history with read/unread status indicators
  - Responsive design for mobile and desktop
- **Responsive Layout**: Mobile-first design with grid systems that adapt to different screen sizes
- **Navigation**: Sticky header with mobile hamburger menu and desktop horizontal navigation
- **Multi-view Interface**: Toggle between grid view and mixed map+list view for property browsing
- **Adaptive Layout**: Desktop shows map and property list side-by-side, mobile shows map above and list below

### Authentication & Authorization
- **Planned Implementation**: Session-based authentication with role-based access control
- **User Types**: Two-tier plan system (Plan A for individuals/CPF, Plan B for companies/CNPJ)

### Search & Discovery
- **Location Search**: Complete search system with text input for any location with autocomplete suggestions
- **Interactive Map**: Click anywhere on map to find nearby properties and points of interest
- **Property Discovery**: Visual search with property markers and detailed property cards
- **Location Insights**: Shows hospitals, schools, supermarkets, and other important places near any selected area
- **Nearby Properties**: Click on map to discover properties in the selected region
- **Service Discovery**: Category-based browsing with rating-based sorting and location filtering
- **Featured Content**: Highlighted properties and top-rated service providers
- **Chat Support**: Intelligent chat widget with contextual responses about properties and services

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