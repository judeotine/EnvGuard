# Contributing to EnvGuard

Thank you for considering contributing to EnvGuard! We appreciate your interest in making our project better. This document outlines the process for contributing to the EnvGuard VS Code extension.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Development Environment Setup](#development-environment-setup)
- [Development Workflow](#development-workflow)
  - [Branching Strategy](#branching-strategy)
  - [Making Changes](#making-changes)
  - [Testing](#testing)
  - [Pull Requests](#pull-requests)
- [Code Standards](#code-standards)
  - [TypeScript Guidelines](#typescript-guidelines)
  - [Documentation](#documentation)
- [Issue Tracking](#issue-tracking)
- [Feature Proposals](#feature-proposals)
- [Code Review Process](#code-review-process)
- [License](#license)

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setting Up the Development Environment](#setting-up-the-development-environment)
- [Development Workflow](#development-workflow)
  - [Creating a Branch](#creating-a-branch)
  - [Making Changes](#making-changes)
  - [Testing Your Changes](#testing-your-changes)
  - [Commit Guidelines](#commit-guidelines)
  - [Submitting a Pull Request](#submitting-a-pull-request)
- [Coding Standards](#coding-standards)
  - [TypeScript Guidelines](#typescript-guidelines)
  - [Documentation](#documentation)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)
- [Review Process](#review-process)
- [License](#license)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report any unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 16.0.0 or higher ([Download](https://nodejs.org/))
- **npm** 7.0.0 or higher (included with Node.js)
- **Git** 2.25.0 or higher ([Download](https://git-scm.com/))
- **Visual Studio Code** 1.74.0 or higher ([Download](https://code.visualstudio.com/))
- **VS Code Extension Development Tools** (install via VS Code Extensions view)

### Development Environment Setup

1. **Fork the Repository**
   - Click the "Fork" button at the top-right of the [EnvGuard repository](https://github.com/judeotine/EnvGuard)

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/EnvGuard.git
   cd EnvGuard
   
   # Add upstream remote
   git remote add upstream https://github.com/judeotine/EnvGuard.git
   ```

3. **Install Dependencies**
   ```bash
   # Install project dependencies
   npm ci
   
   # Install VS Code extension dependencies
   cd client
   npm ci
   cd ..
   ```

4. **Build the Project**
   ```bash
   # Build the extension
   npm run compile
   
   # Watch for changes during development
   npm run watch
   ```

5. **Open in VS Code**
   ```bash
   code .
   ```

6. **Run the Extension**
   - Press `F5` to launch a new VS Code window with the extension loaded

### Setting Up the Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/EnvGuard.git
   cd EnvGuard
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Compile the TypeScript code:
   ```bash
   npm run compile
   ```
5. Open the project in VS Code:
   ```bash
   code .
   ```

## Development Workflow

### Branching Strategy

We follow the [GitHub Flow](https://guides.github.com/introduction/flow/) branching model:

1. `main` - Stable, production-ready code
2. `develop` - Integration branch for upcoming features
3. `feature/*` - New features
4. `bugfix/*` - Bug fixes
5. `docs/*` - Documentation improvements

### Making Changes

1. **Create a Feature Branch**
   ```bash
   # Make sure your fork is up to date
   git fetch upstream
   git checkout develop
   git pull upstream develop
   
   # Create and switch to a new branch
   git checkout -b feature/your-feature-name
   # or for bug fixes
   git checkout -b bugfix/issue-number-description
   ```

2. **Make Your Changes**
   - Follow our [code standards](#code-standards)
   - Keep commits focused and atomic
   - Write meaningful commit messages

3. **Testing**
   - Add unit tests for new functionality
   - Update existing tests if needed
   - Run the test suite before committing

4. **Documentation**
   - Update README.md for user-facing changes
   - Add JSDoc comments for new functions/classes
   - Update CHANGELOG.md for notable changes

### Testing

#### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- path/to/test/file.test.ts
```

#### Integration Tests
1. Press `F5` to launch the Extension Development Host
2. Open an `.env` file in the test window
3. Test your changes manually
4. Check the Debug Console for any errors

#### Linting
```bash
# Run ESLint
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

#### Type Checking
```bash
# Run TypeScript type checking
npm run type-check
```

### Pull Requests

1. **Push Your Changes**
   ```bash
   git push origin your-branch-name
   ```

2. **Create a Pull Request**
   - Go to the [Pull Requests](https://github.com/judeotine/EnvGuard/pulls) page
   - Click "New pull request"
   - Select your branch from the dropdown
   - Fill in the PR template with all relevant information
   - Add reviewers if needed

3. **PR Requirements**
   - All tests must pass
   - Code must be properly documented
   - Changes must be properly tested
   - Update the CHANGELOG.md if needed

### Making Changes

1. Make your changes to the codebase
2. Ensure your code follows our [coding standards](#coding-standards)
3. Add tests for new functionality
4. Update documentation as needed

### Testing Your Changes

1. Run the test suite:
   ```bash
   npm test
   ```
2. For development, you can use the VS Code debugger:
   - Press `F5` to launch the Extension Development Host
   - Test your changes in the new VS Code window

### Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Please format your commit messages as follows:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

Example:
```
feat(masking): add support for custom masking characters

Adds the ability for users to specify custom masking characters in the settings.

Closes #123
```

### Submitting a Pull Request

1. Push your changes to your fork:
   ```bash
   git push origin your-branch-name
   ```
2. Open a pull request against the `main` branch of the original repository
3. Fill in the pull request template with all relevant information
4. Ensure all tests pass and there are no merge conflicts
5. Request a review from one of the maintainers

## Code Standards

### TypeScript Guidelines

1. **Type System**
   - Use TypeScript's type system to its full potential
   - Enable strict mode in `tsconfig.json`
   - Avoid using `any` type - use `unknown` or proper types instead

2. **Interfaces vs Types**
   - Use `interface` for public API definitions
   - Use `type` for unions, tuples, or complex type compositions
   - Example:
     ```typescript
     // Good
     interface User {
       id: string;
       name: string;
     }
     
     type UserRole = 'admin' | 'user' | 'guest';
     ```

3. **Immutability**
   - Use `readonly` for immutable properties
   - Use `ReadonlyArray` for immutable arrays
   - Example:
     ```typescript
     interface Config {
       readonly apiUrl: string;
       readonly maxRetries: number;
     }
     ```

4. **Functions**
   - Keep functions small and focused on a single responsibility
   - Use arrow functions for callbacks
   - Document complex functions with JSDoc
   - Example:
     ```typescript
     /**
      * Validates if a string is a valid environment variable name
      * @param name - The name to validate
      * @returns boolean indicating if the name is valid
      */
     function isValidEnvVarName(name: string): boolean {
       return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
     }
     ```

5. **Error Handling**
   - Use custom error classes for better error handling
   - Always handle errors appropriately
   - Example:
     ```typescript
     class EnvGuardError extends Error {
       constructor(message: string, public readonly code: string) {
         super(message);
         this.name = 'EnvGuardError';
       }
     }
     ```

### Documentation

1. **JSDoc Comments**
   - Document all public APIs
   - Include parameter and return types
   - Add examples for complex functions
   - Example:
     ```typescript
     /**
      * Masks sensitive values in the given text
      * @param text - The text to process
      * @param patterns - Array of patterns to match against
      * @param options - Configuration options
      * @returns The processed text with sensitive values masked
      * @example
      * ```typescript
      * const result = maskSensitiveValues('API_KEY=123', ['KEY']);
      * // Returns: 'API_KEY=***'
      * ```
      */
     function maskSensitiveValues(
       text: string,
       patterns: string[],
       options?: MaskOptions
     ): string;
     ```

2. **README Updates**
   - Update README.md for user-facing changes
   - Keep installation and usage instructions up to date
   - Document new features and configuration options

3. **CHANGELOG.md**
   - Document all notable changes
   - Follow [Keep a Changelog](https://keepachangelog.com/) format
   - Group changes by type (Added, Changed, Deprecated, Removed, Fixed, Security)

4. **Inline Comments**
   - Use comments to explain "why" not "what"
   - Keep comments up to date with code changes
   - Remove commented-out code before committing
   - Example:
     ```typescript
     // Using Set for O(1) lookups instead of Array.includes()
     const sensitivePatterns = new Set(patterns);
     ```

## Issue Tracking

### Reporting Bugs

Before submitting a bug report:
1. Check if the issue has already been reported in the [GitHub Issues](https://github.com/judeotine/EnvGuard/issues)
2. Search the [discussions](https://github.com/judeotine/EnvGuard/discussions) for similar issues

When creating a bug report, please include:

1. **Title**: Clear and descriptive (e.g., "Masking fails when environment variable contains special characters")
2. **Environment**:
   - OS and version
   - VS Code version
   - EnvGuard version
   - Node.js version
3. **Steps to Reproduce**:
   ```markdown
   1. Create a new `.env` file
   2. Add a variable with special characters: `SPECIAL_VAR=test$123`
   3. Save the file
   4. Observe that the value is not properly masked
   ```
4. **Expected vs Actual Behavior**:
   - Expected: Special characters should be properly masked
   - Actual: Special characters are not masked
5. **Screenshots/Logs**: If applicable, add screenshots or error logs
6. **Additional Context**: Any other relevant information

## Feature Proposals

We welcome feature requests! Before submitting:
1. Check if a similar feature has already been requested
2. Consider if the feature aligns with EnvGuard's goals

When proposing a feature, please include:

1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: How should this work?
3. **Alternatives Considered**: What other approaches were considered?
4. **Additional Context**: Any other relevant information

Example feature request:
```markdown
## Feature: Support for .env.example files

### Problem
Currently, EnvGuard only works with `.env` files, but many projects use `.env.example` for documentation.

### Proposed Solution
Add support for `.env.example` files with read-only masking.

### Alternatives
- Continue using `.env` for documentation
- Create a separate extension for `.env.example` files
```

## Code Review Process

1. **Initial Review**:
   - A maintainer will review your PR within 3 business days
   - They may request changes or ask questions

2. **Addressing Feedback**:
   - Make the requested changes
   - Push updates to your branch
   - The PR will automatically update

3. **Approval**:
   - Once approved, a maintainer will squash and merge your changes
   - Your contribution will be included in the next release

4. **Release Notes**:
   - Your changes will be included in the next version's release notes
   - You'll be credited as a contributor

## License

By contributing to EnvGuard, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## Recognition

All significant contributions will be recognized in:
- The project's README.md
- Release notes
- The project's website (coming soon)

## Getting Help

If you need help at any point:
1. Check the [documentation](https://github.com/judeotine/EnvGuard#readme)
2. Search the [discussions](https://github.com/judeotine/EnvGuard/discussions)
3. Open a new discussion if your question hasn't been answered

## Thank You!

Your contributions help make EnvGuard better for developers worldwide. We appreciate your time and effort in helping us improve this project!
