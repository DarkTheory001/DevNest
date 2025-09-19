# DevCloud Platform

## Overview

DevCloud is a comprehensive development platform that provides cloud-based IDE functionality, project hosting, and collaboration tools. The platform supports multiple project types including web applications, WhatsApp bots, APIs, and static sites. Users can code directly in the browser, deploy projects, manage GitHub repositories, and collaborate through real-time chat. The system includes a coin-based economy for resource management and comprehensive admin tools for user and resource management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for development and bundling
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript using TSX for development execution
- **Framework**: Express.js for REST API endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Real-time Communication**: WebSocket server for chat functionality
- **Build System**: ESBuild for production builds

### Authentication System
- **Provider**: Replit OpenID Connect (OIDC) authentication
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Authorization**: Role-based access control with admin privileges

### Database Schema
- **User Management**: Users table with profiles, coin balances, and admin flags
- **Projects**: Support for web apps, WhatsApp bots, APIs, and static sites with status tracking
- **Transactions**: Coin-based economy with transaction history
- **Chat System**: Real-time messaging with user associations
- **WhatsApp Bots**: Bot configuration and webhook management
- **Sessions**: Secure session storage for authentication

### API Structure
- **RESTful Design**: Express routes with proper HTTP methods and status codes
- **Authentication Middleware**: Protected routes requiring valid sessions
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Request Validation**: Zod schemas for input validation
- **Response Formatting**: Consistent JSON responses

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting via `@neondatabase/serverless`
- **Connection Pooling**: Built-in connection pooling for database efficiency

### GitHub Integration
- **GitHub API**: Full repository management via `@octokit/rest`
- **OAuth Integration**: Replit Connectors for GitHub authentication
- **Repository Operations**: Clone, create, and sync repositories

### Authentication Services
- **Replit Auth**: OIDC-based authentication system
- **Session Storage**: PostgreSQL-backed sessions for security

### Development Tools
- **Replit Integration**: Native Replit environment support with cartographer and dev banner
- **Hot Module Replacement**: Vite HMR for development experience
- **Runtime Error Handling**: Replit-specific error overlay for debugging

### UI and Styling
- **Icon Libraries**: Lucide React for general icons, React Icons for brand icons
- **Font Loading**: Google Fonts integration (Inter, JetBrains Mono)
- **Component Library**: Extensive Radix UI primitives for accessibility

### Real-time Features
- **WebSocket Support**: Native WebSocket implementation for chat
- **Connection Management**: Automatic reconnection and state management

### Build and Deployment
- **Static Asset Serving**: Express static middleware for production
- **Build Optimization**: Vite for frontend builds, ESBuild for backend bundling
- **Environment Configuration**: Environment-based configuration management