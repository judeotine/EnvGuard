# EnvGuard

**Enterprise-Grade Secret Protection for VS Code**

EnvGuard is a professional development tool that automatically masks sensitive environment variables in VS Code, ensuring your secrets remain secure during screen sharing, live coding and pair programming sessions. Trusted by developers worldwide, EnvGuard provides robust protection without modifying your files.

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/envguard.envguard?style=flat-square&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=envguard.envguard)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/envguard.envguard?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=envguard.envguard)
[![GitHub Repo stars](https://img.shields.io/github/stars/judeotine/EnvGuard?style=flat-square&logo=github)](https://github.com/judeotine/EnvGuard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

EnvGuard is a professional-grade VS Code extension designed to protect sensitive environment variables during live streaming, screen sharing, or pair programming sessions. It automatically detects and masks sensitive values in `.env` files without affecting the actual file content.

> 🌐 **Website**: [envguard.dev](https://envguard.dev) *(coming soon)*

---

## Key Features

### **Automatic Protection**
- **Auto-detection**: Instantly recognizes `.env`, `.env.local`, `.env.production`, and other environment files
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
- **Perfect for**: Live coding, tutorials, and screen recordings

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
3. Search for "EnvGuard"
4. Click **Install**

### Via Command Line
```bash
code --install-extension envguard.envguard
```

### Manual Installation
1. Download the `.vsix` file from [Releases](https://github.com/judeotine/EnvGuard/releases)
2. Run `code --install-extension envguard-1.0.0.vsix`

---

## Quick Start

1. **Install** EnvGuard from the VS Code Marketplace
2. **Open** any `.env` file
3. **See** sensitive values automatically masked
4. **Toggle** masking with `Ctrl+Shift+M` when needed

![Quick Start Demo](screenshots/quick-start.gif)

---

## Configuration

### Recommended Settings

For optimal security and usability, we recommend the following configuration in your VS Code settings (File > Preferences > Settings > Extensions > EnvGuard):

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

Access settings via `File > Preferences > Settings` and search for "EnvGuard":

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
| `EnvGuard: Toggle Masking` | `Ctrl+Shift+M` | Enable/disable masking for current session |
| `EnvGuard: Enable Streaming Mode` | - | Activate maximum protection for live streaming |
| `EnvGuard: Disable Streaming Mode` | - | Return to normal masking mode |
| `EnvGuard: Refresh Patterns` | - | Reload masking patterns from settings |
| `EnvGuard: Open Settings` | - | Quick access to EnvGuard configuration |

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
    "/^PRIVATE_/",     // Regex patterns (enclosed in forward slashes)
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
- Node.js 16+
- VS Code 1.74.0+
- TypeScript 4.9+

### Setup
```bash
git clone https://github.com/judeotine/EnvGuard.git
cd EnvGuard
npm install
npm run compile
```

### Testing
```bash
# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Run extension in development
# Press F5 in VS Code to launch Extension Development Host
```

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
- **Feature Requests**: [GitHub Discussions](https://github.com/judeotine/EnvGuard/discussions)
- **Documentation**: [Wiki](https://github.com/judeotine/EnvGuard/wiki)

---

## License

EnvGuard is licensed under the MIT License. See [LICENSE](LICENSE) for the full license text.

## Security

Security is our top priority. If you discover any security issues, please review our [Security Policy](SECURITY.md) for reporting vulnerabilities.

## Acknowledgements

We'd like to thank all our contributors and the open-source community for their support. Special thanks to the VS Code team for their excellent extension API documentation.

## Trademarks

VS Code is a trademark of Microsoft Corporation. EnvGuard is not affiliated with or endorsed by Microsoft Corporation.

---

## Acknowledgments

- VS Code Extension API team for excellent documentation
- The open-source community for inspiration and feedback
- Beta testers who helped refine the user experience

---

## Author

**Jude Otine**
- GitHub: [@judeotine](https://github.com/judeotine)
- Website: [judeotine](https://judeotine.vercel.app)

---

<div align="center">

**Star this repo if EnvGuard helps keep your secrets safe!**

[Report Bug](https://github.com/judeotine/EnvGuard/issues) • [Request Feature](https://github.com/judeotine/EnvGuard/discussions) • [Documentation](https://github.com/judeotine/EnvGuard/wiki)

</div>