# ReWear - Clothing Swap Platform

## Overview

ReWear is a modern web application that enables users to swap and trade clothing items in a sustainable marketplace. The platform combines social features with e-commerce functionality to create an eco-friendly alternative to traditional clothing consumption.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Shadcn/UI component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for earth-tone sustainability theme
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **File Handling**: Multer for image uploads with local storage

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon Database
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Comprehensive schema covering users, items, swaps, wishlists, and sessions
- **File Storage**: Local file system for uploaded images (configurable for cloud storage)

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OpenID Connect
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple
- **User Management**: Automatic user creation/updates on authentication
- **Authorization**: Role-based access control with admin privileges

### Item Management
- **CRUD Operations**: Full item lifecycle management
- **Image Upload**: Multi-image support with validation and preview
- **Categorization**: Structured categories (tops, bottoms, outerwear, etc.)
- **Condition Tracking**: Standardized condition levels (like-new, excellent, etc.)
- **Status Management**: Item states (active, swapped, pending, etc.)

### Swap System
- **Peer-to-Peer Trading**: Direct user-to-user item exchanges
- **Points System**: Virtual currency for transaction flexibility
- **Swap Proposals**: Structured negotiation process
- **Status Tracking**: Comprehensive swap lifecycle management

### Admin Panel
- **Content Moderation**: Review and approve pending items
- **User Management**: Administrative oversight of user accounts
- **Analytics**: Platform statistics and monitoring
- **System Controls**: Administrative tools for platform management

## Data Flow

### User Journey
1. **Authentication**: Users authenticate via Replit Auth
2. **Profile Creation**: Automatic user profile generation
3. **Item Listing**: Users upload items with images and metadata
4. **Browse/Search**: Users discover items through filtering and search
5. **Swap Initiation**: Users propose swaps with messages and point offers
6. **Negotiation**: Back-and-forth communication until agreement
7. **Completion**: Swap finalization and status updates

### Data Processing
- **Image Handling**: Upload → Validation → Storage → URL generation
- **Search/Filter**: Query parameters → Database filtering → Results
- **Real-time Updates**: TanStack Query for optimistic updates and cache management

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **express**: Web server framework
- **multer**: File upload handling

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Fast JavaScript bundling for production

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling (when available)

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **Database**: Direct connection to Neon PostgreSQL
- **File Storage**: Local uploads directory
- **Authentication**: Replit Auth with development configuration

### Production Build
- **Client**: Vite build with static asset optimization
- **Server**: ESBuild bundling for Node.js production
- **Database**: Migrations via Drizzle Kit
- **Environment**: Production-ready configuration with security headers

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPLIT_DOMAINS`: Authentication domain configuration
- `ISSUER_URL`: OpenID Connect issuer (defaults to Replit)

The application follows a modern full-stack architecture with strong type safety, comprehensive error handling, and scalable design patterns suitable for a social marketplace platform.