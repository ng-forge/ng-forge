# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.3.x   | :white_check_mark: |
| < 0.3.0 | :x:                |

## Reporting a Vulnerability

We take security seriously at ng-forge. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please send an email to **contact@ng-forge.com** with:

1. **Description** of the vulnerability
2. **Steps to reproduce** the issue
3. **Affected versions** of the library
4. **Potential impact** of the vulnerability
5. **Any possible mitigations** you've identified

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Updates**: We will provide updates on the progress of addressing the vulnerability
- **Resolution**: We aim to resolve critical vulnerabilities within 14 days
- **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)

### Disclosure Policy

- We follow a coordinated disclosure process
- We will work with you to understand and resolve the issue
- Once a fix is available, we will publish a security advisory
- We request that you do not disclose the vulnerability publicly until we have addressed it

## Security Best Practices

When using ng-forge dynamic forms:

1. **Validate user input**: Always validate form data on the server side, not just client side
2. **Sanitize output**: Be cautious when rendering user-provided content
3. **Keep dependencies updated**: Regularly update to the latest version of ng-forge packages
4. **Review custom validators**: Ensure custom validators don't introduce vulnerabilities

## Security Updates

Security updates are released as patch versions. We recommend:

- Enabling Dependabot or similar tools to receive automatic update PRs
- Subscribing to GitHub releases to be notified of new versions
- Following the [changelog](https://github.com/ng-forge/ng-forge/releases) for security-related updates

## Contact

For security concerns: **contact@ng-forge.com**

For general questions: [GitHub Discussions](https://github.com/ng-forge/ng-forge/discussions)
