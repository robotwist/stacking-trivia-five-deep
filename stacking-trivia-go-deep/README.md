# Stacking Trivia: Go Deep

A React-based trivia game where players can test their knowledge on various topics. Each question gets progressively harder, and the scoring system rewards deeper knowledge with exponentially higher points.

## Features

- Multiple trivia stacks covering different topics
- Progressive difficulty levels
- Exponential scoring system
- Modern, responsive UI with Tailwind CSS
- Built with React + Vite for optimal performance

## Available Trivia Stacks

- Van Gogh
- Current Olympic Distance Running
- 1980s Olympic Distance Running
- The Beatles
- Blade Runner
- Nebraska Sports
- Ancient Greece

## Development

### Prerequisites

- Node.js 18 or higher
- npm 8 or higher

### Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Deployment

### Netlify

This project is configured for easy deployment to Netlify:

1. Connect your repository to Netlify
2. The build command is automatically set to `npm run build`
3. The publish directory is set to `dist`
4. Client-side routing is handled via `_redirects` file

Or deploy manually:
```bash
npm run build
# Upload the dist/ folder to Netlify
```

### Heroku

This project is also configured for Heroku deployment:

1. Create a new Heroku app
2. Add the Node.js buildpack
3. Set the following config vars if needed:
   - `NODE_VERSION`: 18 (or higher)
4. Deploy via Git or GitHub integration

The `Procfile` is configured to serve the built application using Vite's preview server.

### Manual Deployment

For other hosting providers:

1. Run `npm run build`
2. Upload the contents of the `dist/` directory to your web server
3. Configure your server to serve `index.html` for all routes (for client-side routing)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production preview server
- `npm run serve` - Serve built files (configured for Heroku)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run preview` - Preview production build locally

## Technology Stack

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3
- **Linting**: ESLint 9
- **Package Manager**: npm

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint` to check code quality
5. Run `npm run build` to ensure the build works
6. Submit a pull request
