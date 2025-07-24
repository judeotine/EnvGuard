# Change Log

All notable changes to the "EnvGuard" extension will be documented in this file.

## [1.0.0] - 2025-01-XX

### Added
- Initial release of EnvGuard
- Automatic masking of sensitive environment variable values
- Three masking styles: dots, asterisks, and blur
- Pattern-based selective masking with default patterns (SECRET, KEY, TOKEN, etc.)
- Whitelist support for common non-sensitive variables
- Command palette integration with toggle masking command
- Keyboard shortcut support (Ctrl+Shift+M)
- Status bar integration with visual indicators
- Dedicated sidebar panel for configuration
- Streaming mode for maximum protection during live sessions
- Clipboard protection to prevent copying masked values
- Auto-lock timer for automatic re-masking after inactivity
- Hover reveal functionality with configurable duration
- Support for multiple .env file variants (.env.local, .env.production, etc.)
- Real-time masking updates with debounced performance optimization
- Regex and wildcard pattern support
- Per-workspace configuration support
- Remote development compatibility (Codespaces, Remote SSH, Live Share)

### Security Features
- Values are never modified on disk - masking is purely visual
- Clipboard protection prevents accidental copying of sensitive values
- Streaming mode provides extra protection for live coding sessions
- Auto-lock ensures secrets remain protected after periods of inactivity

### Performance
- Debounced updates for smooth typing experience
- Efficient decoration caching to minimize VS Code API calls
- Lightweight operation with no impact on file saving or Git operations

### Supported Files
- .env
- .env.local
- .env.development
- .env.production
- .env.staging
- .env.test
- Custom file extensions via configuration