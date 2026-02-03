# G-Studio PowerTools

[![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/YOUR_EXTENSION_ID)](https://chromewebstore.google.com/detail/YOUR_EXTENSION_ID)
[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/YOUR_EXTENSION_ID)](https://chromewebstore.google.com/detail/YOUR_EXTENSION_ID)
[![GitHub Release](https://img.shields.io/github/v/release/tal-shulgin/g-studio-powertools)](https://github.com/tal-shulgin/g-studio-powertools/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Supercharge Google AI Studio** with bulk conversation management, prompt library, and smart deletion tools.

![Screenshot](screenshots/hero.png)

## ✨ Features

### 🧹 Bulk Conversation Management
- **Delete Below** – Remove all messages from any point downward with one click
- **Smart Boundaries** – Set "stop flags" to prevent accidental over-deletion
- **Bulk Delete by Type** – Mass delete only text, image, or file messages
- **Safe Operation** – Auto-aborts if model is generating responses

### 📚 Prompt Library
- **Save Prompts** – Store frequently used prompts locally
- **Quick Load** – One-click insert into the chat input
- **Instant Run** – Load and execute immediately
- **Organized Storage** – Name and manage your prompt collection

### 🎯 Smart UI Enhancements
- **Integrated Sidebar** – Native-feeling tab interface in AI Studio's settings panel
- **Jump Buttons** – Quick navigation to top/bottom of long prompts
- **Boundary Flags** – Visual indicators for deletion stop points
- **Status Feedback** – Real-time operation progress indicators

## 🔒 Privacy First

- **Zero Data Collection** – All data stored locally via `chrome.storage.local`
- **No External Requests** – Works entirely offline
- **No Analytics** – No tracking or telemetry
- **Open Source** – Full transparency, audit the code yourself

Read our [Privacy Policy](docs/privacy.html).

## 📦 Installation

### From Chrome Web Store (Recommended)
1. Visit the [Chrome Web Store page](https://chromewebstore.google.com/detail/YOUR_EXTENSION_ID)
2. Click "Add to Chrome"
3. Navigate to [Google AI Studio](https://aistudio.google.com) – the sidebar will appear automatically

### Manual Installation (Developer Mode)
1. Download the latest release: [`g-studio-powertools-v2.1.1.zip`](https://github.com/tal-shulgin/g-studio-powertools/releases/latest)
2. Extract the ZIP file
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable **"Developer mode"** (toggle in top-right)
5. Click **"Load unpacked"** and select the extracted folder
6. Visit [Google AI Studio](https://aistudio.google.com)

## 🚀 Usage

### Getting Started
1. Open [Google AI Studio](https://aistudio.google.com)
2. Look for the new **"PowerTools"** tab in the right sidebar
3. Click it to access all features

### Saving a Prompt
1. Type your prompt in the AI Studio input
2. Click **"New from Input"** in the PowerTools panel
3. Give it a name and save
4. Use **Load** (edit) or **Run** (immediate) from the library

### Bulk Deleting Messages
1. Hover over any message in your conversation
2. Click the **🗑️ Delete Below** button (respects boundary flags)
3. Or use **Bulk Actions** in the sidebar for type-specific deletion

### Setting Boundaries
1. Hover over a message you want to protect
2. Click the **🚩 Flag** button – it turns blue when active
3. Deletion operations will stop at this message

## 🛠️ Development

### Project Structure
```
g-studio-powertools/
├── manifest.json          # Extension manifest (v3)
├── content.js             # Main controller
├── ui-controller.js       # Sidebar UI & observers
├── storage.js             # Local persistence layer
├── utils.js               # DOM helpers & shadow DOM piercing
├── sidebar.css            # Styling for injected UI
├── features/
│   ├── feedback.js        # GitHub issues integration & ratings
│   ├── monetization.js    # Support links
│   └── onboarding.js      # First-time user guide
└── docs/
    └── privacy.html       # Privacy policy page

### Local Development
```bash
# Clone the repository
git clone https://github.com/tal-shulgin/g-studio-powertools.git
cd g-studio-powertools

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select this folder
```

### Building for Release
```bash
# Create production ZIP (excludes dev files)
zip -r g-studio-powertools-v$(jq -r '.version' manifest.json).zip . \
  -x "*.git*" \
  -x "*.github*" \
  -x "README.md" \
  -x "PRIVACY.md" \
  -x "*.zip" \
  -x "screenshots/*"
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Reporting Issues
- 🐛 [Report a Bug](https://github.com/tal-shulgin/g-studio-powertools/issues/new?template=bug_report.md)
- 💡 [Suggest a Feature](https://github.com/tal-shulgin/g-studio-powertools/issues/new?template=feature_request.md)

### Security
If you discover a security vulnerability, please email security@talshulgin.com instead of using the public issue tracker.

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the [Google AI Studio](https://aistudio.google.com) community
- Icons from [Material Design](https://material.io/resources/icons/)
- Inspired by the need for better conversation management in AI tools

---

**Made with ❤️ by [Tal Shulgin](https://github.com/tal-shulgin)**

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/talshulgin)

## 3. Additional Project Files

### `CHANGELOG.md`

```markdown
# Changelog

All notable changes to G-Studio PowerTools will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.2] - 2024-02-04

### Fixed
- Scope isolation: Wrapped all modules in IIFEs to prevent variable redeclaration errors
- Fixed URL construction bugs (removed spaces in GitHub/Chrome Web Store URLs)
- Fixed manifest.json URL patterns (removed spaces before wildcards)

### Security
- Added input validation for prompt names (max 100 chars) and content (max 50KB)
- Improved turn ID generation with hash-based entropy to prevent collisions
- Added proper error handling for all storage operations

### Changed
- Replaced debug console spam with conditional logging (DEBUG flags)
- Added automatic observer cleanup on extension suspend
- Improved error messages for user-facing operations

## [2.1.1] - 2024-02-03

### Fixed
- Removed invalid `privacy_policy` key from manifest.json
- Updated all GitHub URLs to point to correct repository (tal-shulgin/g-studio-powertools)
- Fixed SVG xmlns URLs in CSS and HTML

## [2.1.0] - 2024-02-01

### Added
- Initial release with bulk deletion engine
- Prompt library with save/load/run functionality
- Boundary flags for safe deletion
- Smart UI integration with AI Studio sidebar
- Jump buttons for textarea navigation
- Onboarding flow for first-time users
- Feedback integration (GitHub issues)
- Monetization support links

[2.1.2]: https://github.com/tal-shulgin/g-studio-powertools/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/tal-shulgin/g-studio-powertools/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/tal-shulgin/g-studio-powertools/releases/tag/v2.1.0
