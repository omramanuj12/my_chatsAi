# Overview

This is a full-stack AI chat application built with React and Express. The application allows users to interact with AI models through a chat interface, managing multiple conversation sessions with persistent message history. Users provide their own OpenAI API key for AI interactions, and the application supports both in-memory storage and database persistence using PostgreSQL with Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built with React using TypeScript and Vite as the build tool. The UI leverages shadcn/ui components with Radix UI primitives for accessible, customizable interface elements. TailwindCSS handles styling with a comprehensive design system including dark mode support. The application uses Wouter for lightweight client-side routing and TanStack Query for efficient server state management and caching.

The chat interface is structured as a sidebar layout with separate components for chat history, message display, and input handling. State management is handled through React hooks and context, with real-time updates managed by TanStack Query's mutation and invalidation system.

## Backend Architecture
The server uses Express.js with TypeScript, following a modular route-based architecture. The API exposes RESTful endpoints for chat session management and message handling. The server integrates with OpenAI's API for AI responses, using user-provided API keys for authentication.

A storage abstraction layer provides flexibility between in-memory storage and database persistence. The in-memory implementation uses Maps for development and testing, while the database layer uses Drizzle ORM with PostgreSQL for production scenarios.

## Data Storage Solutions
The application uses a dual storage approach. For development and quick setup, an in-memory storage system maintains chat sessions and messages using JavaScript Maps. For production deployments, PostgreSQL serves as the persistent database with Drizzle ORM providing type-safe database operations and schema management.

The database schema includes two main entities: chat sessions (with title and timestamps) and messages (with role, content, and session relationships). Foreign key constraints ensure data integrity with cascade deletion for session cleanup.

## Authentication and Authorization
The application uses a user-provided API key model rather than traditional user authentication. Users input their OpenAI API keys, which are validated against the OpenAI API and stored client-side for the session duration. This approach eliminates the need for user accounts while ensuring users control their API usage and costs.

## External Dependencies
- **OpenAI API**: Core dependency for AI chat functionality, requiring user-provided API keys
- **Neon Database**: Serverless PostgreSQL provider for database hosting
- **Radix UI**: Comprehensive component library for accessible UI primitives
- **TailwindCSS**: Utility-first CSS framework for styling
- **TanStack Query**: Server state management and caching library
- **Drizzle ORM**: Type-safe ORM for PostgreSQL interactions
- **Vite**: Build tool and development server for the frontend
- **Express.js**: Web application framework for the backend API