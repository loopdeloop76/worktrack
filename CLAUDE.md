# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WorkTrack is a React/TypeScript application for tracking work projects. Each project has a name, client, amount (payment), and state (interested, booked, invoiced, paid).

## Development Commands

- `npm run dev` - Start both API server and frontend (recommended)
- `npm run server` - Start API server only (port 3001)
- `npm run client` - Start frontend only (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Architecture

- **Frontend**: React 18 with TypeScript and Vite
- **Backend**: Express.js API server with SQLite database
- **Database**: SQLite with better-sqlite3 for persistent storage
- **API**: RESTful endpoints for CRUD operations
- **State Management**: Custom hook (`useProjectsAPI`) with API integration
- **Components**: Modular components in `/src/components/`
- **Types**: Centralized type definitions in `/src/types.ts`
- **Styling**: CSS modules with responsive design

## Key Files

- `src/types.ts` - Project interface and state definitions
- `src/hooks/useProjectsAPI.ts` - API integration and state management
- `src/components/` - UI components (ProjectForm, ProjectList, Dashboard)
- `src/App.tsx` - Main application with tab navigation
- `server/index.js` - Express API server
- `server/database.js` - SQLite database operations
- `server/worktrack.db` - SQLite database file (auto-created)