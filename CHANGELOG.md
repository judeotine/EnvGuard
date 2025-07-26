# Changelog

All notable changes to the EnvGuard extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial setup for future changes

## [1.0.0] - 2025-07-25

### Added
- **Core Functionality**:
  - Automatic masking of sensitive environment variables in .env files
  - Support for multiple masking styles (dots, asterisks, blur)
  - Pattern-based detection of sensitive variables
  - Whitelist support for non-sensitive variables
  - Status bar integration for quick toggling
  - Sidebar panel for easy access to settings and status

- **Security Features**:
  - Clipboard protection to prevent accidental copying of sensitive values
  - Auto-lock timer for automatic re-masking after inactivity
  - Hover reveal functionality with configurable duration
  - Streaming mode for maximum protection during live sessions

- **User Experience**:
  - Command palette integration
  - Visual indicators for masking status
  - Customizable settings through VS Code settings
  - Support for multiple .env file variants (.env.local, .env.production, etc.)
  - Real-time updates with performance optimizations

- **Development Features**:
  - Comprehensive TypeScript implementation
  - Modular architecture for easy maintenance
  - Debug configuration included
  - GitHub repository with issue templates

### Technical Details
- Built with TypeScript
- VS Code Extension API
- Modern ES6+ JavaScript features
- Comprehensive error handling
- Performance optimized for large .env files

### Fixed
- Initial release with no known bugs

## [0.1.0] - 2025-07-20

### Added
- Initial development version
- Basic environment variable masking functionality
- Core extension setup and configuration

[Unreleased]: https://github.com/judeotine/EnvGuard/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/judeotine/EnvGuard/releases/tag/v1.0.0
[0.1.0]: https://github.com/judeotine/EnvGuard/releases/tag/v0.1.0