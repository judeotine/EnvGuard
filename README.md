<div align="center">
  <img src="./assets/logo/envguard-logo.png" alt="EnvGuard Logo" width="200">
  <h1>EnvGuard: Secure Environment Variable Masking for VS Code</h1>
</div>

EnvGuard is a professional development tool that automatically masks sensitive environment variables in VS Code, ensuring your secrets remain secure during screen sharing, live coding and pair programming sessions. Trusted by developers worldwide, EnvGuard provides robust protection without modifying your files.

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/envguard?style=flat-square&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=envguard)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/envguard?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=envguard)
[![GitHub Repo stars](https://img.shields.io/github/stars/judeotine/EnvGuard?style=flat-square&logo=github)](https://github.com/judeotine/EnvGuard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

EnvGuard is a professional-grade VS Code extension designed to protect sensitive environment variables during live streaming, screen sharing, or pair programming sessions. It automatically detects and masks sensitive values in `.env` files without affecting the actual file content.

> **Website**: [envguard](https://envguard-six.vercel.app)

>  **Suggest a feature**: [Submit feedback or ideas →](https://envguard.canny.io/feature-requests)

---

## Key Features

### **Automatic Protection**
- **Auto-detection**: Instantly recognizes `.env`, `.env.local`, `.env.production` and other environment files
- **Smart masking**: Only the values are hidden—keys remain visible for easy identification
- **Real-time updates**: Masking applies as you type with zero performance impact

### **Customizable Masking Styles**
- **Dots** (••••••••): Clean and professional
- **Asterisks** (********): Classic masking style
- **Blur effect**: Semi-transparent overlay for modern aesthetics

### **Selective Protection**
- **Pattern-based**: Mask only values matching patterns like `SECRET`, `KEY`, `TOKEN`, `PASSWORD`
- **Whitelist support**: Exclude harmless variables like `PORT`, `DEBUG`, `NODE_ENV`
- **Regex patterns**: Advanced users can define custom regex patterns
- **Mask everything**: Option to hide all values regardless of patterns

### **Easy Controls**
- **Command Palette**: `EnvGuard: Toggle Masking` (F1 → search "EnvGuard")
- **Keyboard shortcut**: `Ctrl+Shift+M` (customizable)
- **Status bar**: Quick toggle button appears when editing .env files
- **Sidebar panel**: Dedicated EnvGuard sidebar for full control

### **Streaming Mode**
- **One-click activation**: Instantly mask ALL environment values across all open files
- **Extra protection**: Disables hover reveals and clipboard access
- **Visual indicator**: Status bar shows streaming mode is active
- **Perfect for**: Live coding, tutorials and screen recordings

### **Advanced Security**
- **Clipboard protection**: Prevents copying masked values to clipboard
- **Auto-lock timer**: Automatically re-enable masking after period of inactivity
- **Hover reveal**: Temporarily show values on hover (configurable duration)
- **No file modification**: Masking is purely visual—your files remain unchanged

---

## Installation

### Prerequisites
- Visual Studio Code 1.74.0 or higher
- Node.js 16.0.0 or higher (for development)

### Installation Methods

### Via VS Code Marketplace
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "judeotine.envguard"
4. Click **Install**

### Via Command Line
```bash
code --install-extension judeotine.envguard
```

### Manual Installation
1. Download the `.vsix` file from [Releases](https://github.com/judeotine/EnvGuard/releases)
2. Run `code --install-extension envguard-1.0.0.vsix`

---

## Quick Start

1. **Install** EnvGuard from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=envguard)
2. **Open** any `.env` file in VS Code
3. **View** sensitive values automatically masked
4. **Toggle** masking with `Ctrl+Shift+M` (Windows/Linux) or `Cmd+Shift+M` (Mac)

![Quick Start Demo](screenshots/quick-start.gif)

---

## Configuration

### Recommended Settings

Add these settings to your VS Code settings (`File > Preferences > Settings > Extensions > EnvGuard`) for optimal security:

```json
{
  "envguard.enabled": true,
  "envguard.maskStyle": "dots",
  "envguard.patterns": [
    "SECRET",
    "KEY",
    "TOKEN",
    "PASSWORD",
    "API_KEY",
    "AUTH_TOKEN",
    "CREDENTIALS",
    "PRIVATE_KEY"
  ],
  "envguard.whitelist": [
    "PORT",
    "DEBUG",
    "NODE_ENV",
    "ENVIRONMENT",
    "APP_NAME",
    "LOG_LEVEL"
  ],
  "envguard.maskAllValues": false,
  "envguard.autoMaskOnOpen": true,
  "envguard.clipboardProtection": true,
  "envguard.hoverRevealDuration": 3,
  "envguard.autoLockTimer": 300,
  "envguard.supportedFileExtensions": [
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    ".env.staging",
    ".env.test",
    ".env.example"
  ]
}
```

### Advanced Configuration

Customize EnvGuard behavior through VS Code settings. Access via `File > Preferences > Settings` and search for "EnvGuard":

```json
{
  "envguard.enabled": true,
  "envguard.maskStyle": "dots",
  "envguard.patterns": ["SECRET", "KEY", "TOKEN", "PASSWORD", "API_KEY"],
  "envguard.whitelist": ["PORT", "DEBUG", "NODE_ENV", "ENVIRONMENT"],
  "envguard.maskAllValues": false,
  "envguard.autoMaskOnOpen": true,
  "envguard.clipboardProtection": true,
  "envguard.hoverRevealDuration": 3,
  "envguard.autoLockTimer": 5,
  "envguard.supportedFileExtensions": [
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    ".env.staging",
    ".env.test"
  ]
}
```

### Per-Project Configuration

Create a `.vscode/settings.json` file in your project:

```json
{
  "envguard.patterns": ["CUSTOM_SECRET", "PROJECT_KEY"],
  "envguard.maskStyle": "blur",
  "envguard.streamingMode": false
}
```

---

## Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| `EnvGuard: Toggle Masking` | `Ctrl+Shift+M`/`Cmd+Shift+M` | Toggle masking for current session |
| `EnvGuard: Toggle Streaming Mode` | `Ctrl+Alt+S`/`Cmd+Alt+S` | Toggle maximum protection for streaming |
| `EnvGuard: Refresh Patterns` | - | Reload masking patterns |
| `EnvGuard: Open Settings` | - | Open EnvGuard settings |

---

## Screenshots

### Main Interface
![Main Interface](screenshots/main-interface.png)

### Masking Styles
![Masking Styles](screenshots/masking-styles.png)

### Sidebar Panel
![Sidebar Panel](screenshots/sidebar-panel.png)

### Streaming Mode
![Streaming Mode](screenshots/streaming-mode.png)

### Settings Configuration
![Settings](screenshots/settings-config.png)

---

## Getting Help

### Documentation

For detailed documentation, including API reference and advanced usage, please visit our [official documentation](https://docs.envguard.dev).

### Support

- **Community Support**: [GitHub Discussions](https://github.com/judeotine/EnvGuard/discussions)
- **Bug Reports**: [GitHub Issues](https://github.com/judeotine/EnvGuard/issues)
- **Security Issues**: Please email security@envguard.dev (PGP: [public key](https://keys.openpgp.org))

### Enterprise Support

For enterprise support, custom integrations, or volume licensing, please contact sales@envguard.dev.

---

## Use Cases

- **Live streaming**: Keep API keys hidden during coding streams
- **Screen sharing**: Safe to share screen during meetings
- **Pair programming**: Protect secrets when working with others
- **Code reviews**: Screenshot code without exposing credentials
- **Tutorials**: Create educational content without security risks
- **Enterprise**: Maintain security standards in collaborative environments

---

## Advanced Configuration

### Pattern Matching

EnvGuard supports multiple pattern types:

```json
{
  "envguard.patterns": [
    "SECRET",           // Simple substring matching
    "API_*",           // Wildcard patterns
    "/^PRIVATE_/",     // Regex patterns 
    "TOKEN"
  ]
}
```

### Supported File Types

By default, EnvGuard works with:
- `.env`
- `.env.local`
- `.env.development`
- `.env.production`
- `.env.staging`
- `.env.test`

Customize the list in settings to match your project structure.

---

## Development

### Prerequisites
- Node.js 18+ (LTS)
- VS Code 1.80.0+
- pnpm 8.x

### Setup
1. Clone the repository
2. Install dependencies: `pnpm install`
3. Build the extension: `pnpm run compile`
4. Press F5 to launch the extension in development mode

### Scripts
- `pnpm run compile`: Compile TypeScript
- `pnpm run watch`: Watch for changes
- `pnpm run test`: Run tests
- `pnpm run package`: Create VSIX package

---

## Roadmap

- [x] Basic environment variable masking
- [x] Multiple masking styles (dots, asterisks, blur)
- [x] Pattern-based selective masking
- [x] Streaming mode for live coding
- [x] Clipboard protection
- [x] Status bar integration
- [x] Sidebar management panel
- [ ] **Multi-language support** (Python, PHP, Ruby env files)
- [ ] **Team sharing** (shared masking rules via Git)
- [ ] **Custom masking characters** (emoji, symbols)
- [ ] **Audit logging** (track when secrets are revealed)
- [ ] **Integration with secret managers** (Azure Key Vault, AWS Secrets)
- [ ] **Mobile development support** (React Native, Flutter env files)

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start for Contributors
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Ensure backward compatibility

---

## Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/judeotine/EnvGuard/issues)
- **Feature Requests**: [canny](https://envguard.canny.io/feature-requests)
- **Documentation**: [Wiki](https://github.com/judeotine/EnvGuard/wiki)

---

## License

EnvGuard is licensed under the MIT License. See [LICENSE](LICENSE) for the full license text.

## Security

Security is our top priority. If you discover any security issues, please review our [Security Policy](SECURITY.md) for reporting vulnerabilities.


## Trademarks

VS Code is a trademark of Microsoft Corporation. EnvGuard is not affiliated with or endorsed by Microsoft Corporation.

---

## Acknowledgments

- VS Code Extension API team for excellent documentation
- The open-source community for inspiration and feedback
- Beta testers who helped refine the user experience

---

## Author

**jude otine**
- GitHub: [@judeotine](https://github.com/judeotine)
- Website: [judeotine](https://judeotine.vercel.app)

---

<div align="center">

**Star this repo if EnvGuard helps keep your secrets safe!**

[Report Bug](https://github.com/judeotine/EnvGuard/issues) • [Request Feature](https://envguard.canny.io/feature-requests) • [Documentation](https://github.com/judeotine/EnvGuard/wiki)

</div>