# my-template-nextjs

A modern gallery application built with Next.js, TypeScript, and Tailwind CSS, featuring secure authentication with NextAuth.js.

## Features

- ⚡ **Next.js 15** with App Router
- 🔷 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for styling
- 🔐 **NextAuth.js** for authentication
- 🗄️ **Vercel Postgres** for database
- 📋 **ZenStack** for schema management
- 🔑 **Google OAuth** for sign-in
- ✅ **ESLint** for code linting
- 💅 **Prettier** for code formatting
- 🧪 **Vitest** for testing
- 📚 **Storybook** for component development
- 🪝 **Husky** for git hooks

## Authentication Setup

This application requires authentication to access protected areas. Follow these steps to set up authentication:

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

Required environment variables:

- `NEXTAUTH_URL` - Your application URL (e.g., http://localhost:3000)
- `NEXTAUTH_SECRET` - A random secret for NextAuth.js (generate with `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `DATABASE_URL` - Vercel Postgres connection string

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local`

### 3. Database Setup

1. Create a Vercel Postgres database
2. Copy the connection string to `DATABASE_URL` in `.env.local`
3. Generate and push the database schema:

```bash
# Generate Prisma client
yarn db:generate

# Deploy schema migrations to database
yarn db:migrate
```

## Getting Started

### Development

```bash
# Install dependencies
yarn install

# Set up environment variables (see Authentication Setup above)
cp .env.example .env.local

# Generate database schema and client
yarn db:generate

# Deploy schema migrations to database
yarn db:migrate

# Start development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to the sign-in page where you can authenticate with Google.

### Building

```bash
# Build for production
yarn build

# Start production server
yarn start
```

### Testing

```bash
# Run tests
yarn test

# Run tests with UI
yarn test:ui

# Run tests once
yarn test:run
```

### Database Management

```bash
# Generate schema from ZenStack and Prisma client
yarn db:generate

# Deploy schema migrations to database
yarn db:migrate

# Open Prisma Studio (database GUI)
yarn db:studio
```

### Linting and Formatting

```bash
# Run ESLint
yarn lint

# Fix ESLint issues
yarn lint:fix

# Check Prettier formatting
yarn format:check

# Format code with Prettier
yarn format
```

### Storybook

```bash
# Start Storybook development server
yarn storybook

# Build Storybook for production
yarn build-storybook
```

## CI/CD

This project uses multiple GitHub Actions workflows for comprehensive testing and deployment:

### Workflows

- 🧹 **Lint & Format**: Validates code quality with ESLint and Prettier formatting
- 🧪 **Test**: Runs the test suite using Vitest with coverage reporting
- 🎨 **Chromatic**: Deploys Storybook to Chromatic for visual testing
- 📝 **PR Title Format**: Automatically enforces Linear Issue ID format in PR titles (`${LinearIssueId} ${title}`)
- 🗃️ **Neon DB Cleanup**: Automatically deletes Neon database branches when pull requests are closed
- 📦 **Weekly Package Upgrade**: Automatically creates issues for package upgrades using GitHub Copilot Coding Agent

All workflows run on every push and pull request to `main` and `develop` branches using `pull_request_target` for enhanced security.

### Test Coverage

The test workflow automatically generates coverage reports and comments them on pull requests, providing:

- Overall coverage percentage
- File-by-file coverage breakdown
- Coverage changes compared to the base branch

### Setting up Chromatic

To enable Chromatic deployment, add your `CHROMATIC_PROJECT_TOKEN` as a repository secret:

1. Sign up at [chromatic.com](https://www.chromatic.com/start)
2. Create a new project or find your existing project token
3. Add the token as `CHROMATIC_PROJECT_TOKEN` in your repository secrets

### Setting up Neon DB Branch Cleanup

To enable automatic cleanup of Neon database branches when pull requests are closed, configure the following repository secrets:

1. **NEON_API_KEY**: Your Neon API key for authentication
   - Obtain from [Neon Console](https://console.neon.tech/) under Account Settings → Developer Settings
2. **NEON_PROJECT_ID**: Your Neon project ID where database branches are created
   - Found in your Neon project URL or project settings

The workflow will automatically:

- Trigger when any pull request is closed (merged or just closed)
- Sanitize the branch name to match Neon's naming requirements
- Call the Neon API to delete the corresponding database branch
- Handle errors gracefully (branches that don't exist are ignored)

### Weekly Package Upgrade

The Weekly Package Upgrade workflow automatically creates issues for package maintenance using GitHub Copilot Coding Agent:

**Schedule**: Every Monday at 07:00 JST (Sunday 22:00 UTC)

**Process**:

1. Creates a new GitHub issue with detailed package upgrade instructions
2. Assigns the issue to `@copilot` for automated processing
3. Provides comprehensive guidelines for:
   - Listing outdated packages with `yarn outdated`
   - Upgrading packages individually with proper testing
   - Running mandatory checks: format → lint → test → build → storybook
   - Handling build errors and compatibility issues

**Manual Trigger**: The workflow can also be triggered manually from the Actions tab using `workflow_dispatch`.

### PR Title Format Enforcement

The PR Title Format workflow automatically ensures that all pull request titles follow the Linear Issue ID format: `${LinearIssueId} ${title}`.

**How it works**:

1. **Triggers**: Automatically runs when pull requests are opened, synchronized, edited, or converted from draft to ready for review
2. **Format Check**: Validates if the PR title already follows the `[A-Z]+-\d+ Title` pattern
3. **Issue Detection**: If format is incorrect, searches for associated GitHub issue number from:
   - PR body (keywords like "Fixes #123", "Closes #123", "Resolves #123")
   - Branch name (e.g., "copilot/fix-123" → issue #123)
4. **Linear ID Extraction**: Fetches issue comments to find Linear bot comment containing the Linear Issue ID
5. **Auto-correction**: Updates PR title to include the Linear Issue ID at the beginning
6. **Notification**: Adds a comment explaining the automatic title change

**Example**:

- **Original**: "Fix content upload issue"
- **Corrected**: "RDG-106 Fix content upload issue"

This ensures consistent PR naming that aligns with the project's issue tracking and Copilot instructions.

### Copilot Actions Auto-Approval

For automated GitHub Copilot Coding Agent workflow approvals, see [Copilot Actions Setup Guide](.github/COPILOT_ACTIONS_SETUP.md).

## Git Hooks

This project uses Husky to run git hooks that ensure code quality:

### Pre-commit Hook

- Runs `lint-staged` to automatically fix ESLint issues and format code with Prettier for staged files
- Only processes files that are staged for commit

### Pre-push Hook

- Runs `yarn format:check` to verify all files are properly formatted
- Runs `yarn lint` to check for ESLint issues
- Prevents push if formatting or linting issues are found

**Important**: Always ensure your code is properly formatted before pushing. If you encounter formatting errors, run `yarn format` to fix them automatically.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/auth/          # NextAuth.js API routes
│   ├── auth/signin/       # Custom sign-in page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with SessionProvider
│   └── page.tsx           # Protected home page
├── components/            # React components
│   └── Providers.tsx      # SessionProvider wrapper
├── prisma/               # Prisma schema and migrations
│   └── schema.prisma     # Generated Prisma schema
├── public/               # Static assets
├── src/
│   ├── stories/          # Storybook stories
│   └── setup.ts          # Test setup
├── .storybook/           # Storybook configuration
├── schema.zmodel         # ZenStack schema definition
├── middleware.ts         # Authentication middleware
└── ...
```

## Authentication Flow

1. **Access Protection**: All routes except `/auth/signin` and API routes are protected by middleware
2. **Sign In**: Users are redirected to `/auth/signin` if not authenticated
3. **Google OAuth**: Users can sign in with their Google account
4. **Session Management**: NextAuth.js manages user sessions with database storage
5. **Protected Access**: Authenticated users can access the main application

## Database Schema

The application uses ZenStack to define the database schema, which includes:

- **User**: User profile information
- **Account**: OAuth account information
- **Session**: User session data
- **VerificationToken**: Email verification tokens

## Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint issues
- `yarn format` - Format code with Prettier
- `yarn format:check` - Check code formatting
- `yarn test` - Run tests in watch mode
- `yarn test:run` - Run tests once
- `yarn test:ui` - Run tests with UI
- `yarn storybook` - Start Storybook
- `yarn build-storybook` - Build Storybook
- `yarn chromatic` - Deploy to Chromatic
- `yarn db:generate` - Generate ZenStack and Prisma schemas
- `yarn db:migrate` - Deploy schema migrations to database
- `yarn db:studio` - Open Prisma Studio

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: Vercel Postgres
- **ORM**: Prisma
- **Schema Management**: ZenStack
- **OAuth Provider**: Google
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint
- **Formatting**: Prettier
- **Components**: Storybook
- **Git Hooks**: Husky + lint-staged
