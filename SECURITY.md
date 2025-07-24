# Security Policy

## Supported Versions
We provide security updates for the following versions of EnvGuard:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

### Responsible Disclosure

We take security vulnerabilities very seriously. If you discover a security issue in EnvGuard, we appreciate your help in disclosing it to us in a responsible manner.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please send an email to [judextine28@gmail.com](mailto:judextine28@gmail.com) with the subject line "[SECURITY] Vulnerability Report".

### Our Commitment

- We will acknowledge receipt of your report within 48 hours
- We will keep you informed about the progress of the fix
- We will credit you in our security advisories (unless you prefer to remain anonymous)
- We aim to provide a fix within 30 days of the report

## Security Best Practices

### For Users

1. Always keep your VS Code and EnvGuard extension up to date
2. Review and customize the default patterns in your settings
3. Be cautious when sharing your screen or recording your development environment
4. Use environment-specific .env files (e.g., .env.development, .env.production)
5. Never commit .env files to version control

### For Developers

1. Follow the principle of least privilege
2. Use secure coding practices
3. Keep dependencies up to date
4. Review all third-party code before integration
5. Use environment variables for all sensitive configuration

## Security Updates

Security updates will be released as patch versions (e.g., 1.0.0 → 1.0.1). We recommend always using the latest version of EnvGuard.

## Security Advisories

Security advisories will be published on our [GitHub Security Advisories](https://github.com/judeotine/EnvGuard/security/advisories) page.

## Bug Bounty

We currently do not have a formal bug bounty program, but we may offer rewards for significant security reports at our discretion.

<!-- ## Credits -->

<!-- We would like to thank the following individuals for responsibly disclosing security issues:

- [Your Name] - [Vulnerability] -->

## Legal

By submitting a security report, you agree to the following:
- You give us permission to use your report for the purpose of improving security
- You will not publicly disclose the vulnerability until we've had time to address it
- You make a good faith effort to avoid privacy violations, data destruction, and service interruption during your testing
