# Contributing to G-Studio PowerTools

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/g-studio-powertools.git`
3. Load the extension in Chrome developer mode (see README.md)
4. Make your changes
5. Test thoroughly on Google AI Studio

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes with clear commit messages
3. Ensure your code follows the existing style (IIFEs, strict mode, error handling)
4. Update CHANGELOG.md if applicable
5. Submit PR with detailed description of changes

## Code Style

- Use IIFEs to scope variables: `(function() { 'use strict'; ... })()`
- Always use `const` or `let`, never `var`
- Add error handling for async operations
- Use template literals for string concatenation
- Keep functions small and focused

## Testing Checklist

- [ ] Extension loads without console errors
- [ ] Sidebar appears on AI Studio
- [ ] Prompt library save/load works
- [ ] Bulk deletion works correctly
- [ ] Boundary flags persist across reloads
- [ ] Onboarding shows for new users
- [ ] No debug logs in production (DEBUG = false)

## Reporting Bugs

Please include:
- Chrome version
- Extension version (from manifest)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
