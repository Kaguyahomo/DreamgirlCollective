# Copilot Instructions for DreamGirl Collective

This document provides context and guidelines for GitHub Copilot when working on the DreamGirl Collective repository.

## Project Overview

DreamGirl Collective is a web application featuring a vocabulary quiz system and creative writing content. The project uses a multi-tier architecture with both static HTML pages and a React-based frontend.

## Technology Stack

- **Frontend**: React 18 with React Router for the vocabulary quiz application
- **Backend**: Express.js with SQLite for local development
- **Deployment**: Cloudflare Pages with D1 database and Workers for serverless functions
- **Static Content**: HTML pages with shared CSS styling

## Project Structure

- `/frontend/` - React application for the vocabulary quiz system
- `/backend/` - Express.js API server for local development
- `/functions/` - Cloudflare Workers/Functions for serverless API
- `/vocab/` - Vocabulary-related assets
- Root HTML files - Static content pages (creative writing, etc.)

## Code Style Guidelines

### JavaScript/React

- Use functional components with React hooks
- Use React Router for navigation
- Store admin state in localStorage
- API calls should use the `/api/` prefix

### CSS

- Use pastel color scheme (pink: `#ffd1dc`, purple: `#e6e6fa`)
- Maintain responsive design with media queries for 768px and 480px breakpoints
- Use consistent border-radius of 8px for containers
- Keep max-width of 60% for main content areas

### HTML

- Use semantic HTML5 elements
- Link to `styles.css` for consistent styling
- Include proper viewport meta tags

## API Endpoints

The backend provides these API routes:
- `/api/words` - Vocabulary word management
- `/api/quizzes` - Quiz functionality
- `/api/users` - User management
- `/api/scores` - Score tracking
- `/api/backup` - Backup functionality

## Cloudflare Integration

- D1 database binding: `dreamgirl_db`
- Functions in `/functions/api/` handle serverless API requests
- Cron job runs weekly to reset vocabulary words

## Testing

- Test React components using the existing component structure
- Verify API endpoints work with both local Express server and Cloudflare Functions

## Security Considerations

- Admin authentication uses localStorage-based state
- Sensitive configuration should use environment variables or secrets
- Avoid committing API keys or tokens to the repository
