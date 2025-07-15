# CS2 Memory Game

A Counter-Strike 2 themed memory game built with Vue 3, Nuxt 3, TypeScript, and Tailwind CSS.

## Features

- 🎮 CS2 themed memory game
- ⚡ Built with Vue 3 and Nuxt 3
- 🔧 TypeScript for type safety
- 🎨 Tailwind CSS for styling
- 📱 Responsive design
- 🚀 Fast development with hot reload

## Tech Stack

- **Framework**: Nuxt 3
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Linting**: ESLint + Prettier
- **Package Manager**: npm/yarn/pnpm

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cs2-memory-game
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run generate` - Generate static site
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
cs2-memory-game/
├── assets/          # Static assets (CSS, images)
├── components/      # Vue components
├── pages/           # Application pages
├── public/          # Public static files
├── nuxt.config.ts   # Nuxt configuration
├── tailwind.config.ts # Tailwind CSS configuration
├── tsconfig.json    # TypeScript configuration
├── .eslintrc.js     # ESLint configuration
├── .prettierrc      # Prettier configuration
└── package.json     # Dependencies and scripts
```

## Development

### Code Style

This project uses ESLint and Prettier for code formatting. The configuration files are already set up:

- `.eslintrc.js` - ESLint rules for Vue 3, TypeScript, and Prettier
- `.prettierrc` - Prettier formatting rules
- `.prettierignore` - Files to ignore during formatting

### TypeScript

The project is configured with strict TypeScript settings. All components and utilities should be properly typed.

### Styling

The project uses Tailwind CSS with custom CS2-themed colors:

- `cs2-orange` - Primary orange color
- `cs2-blue` - Secondary blue color  
- `cs2-dark` - Dark background color
- `cs2-gray` - Gray text color

## Deployment

The application can be deployed to various platforms:

- **Vercel**: `npm run generate` and deploy the `.output` folder
- **Netlify**: `npm run generate` and deploy the `.output` folder
- **Static hosting**: Use `npm run generate` for static site generation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and formatting: `npm run lint:fix && npm run format`
5. Submit a pull request

## License

This project is licensed under the MIT License. 