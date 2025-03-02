# Reminder Manager Browser Extension

A browser extension to add, edit, and delete reminders with scheduling options.

## Features

- Add reminders with title, description, date, time, and priority
- Set reminders to repeat daily, weekdays, weekly, monthly, or yearly
- Organize reminders with different priority levels
- Filter reminders by today, upcoming, and completed
- Dark/light mode for user preference
- Browser notifications when reminders are due

## Browser Compatibility

This extension works with:
- Google Chrome (and other Chromium-based browsers like Edge, Brave, etc.)
- Mozilla Firefox

## Repository Structure

```
reminder-extension/
├── src/                           # Shared source code
│   ├── icons/                     # Icons for both versions
│   ├── popup.css                  # Shared CSS
│   └── popup.html                 # Shared popup HTML (without browser-specific parts)
├── chrome/                        # Chrome-specific files
│   ├── manifest.json              # Chrome manifest
│   ├── background.js              # Chrome background script
│   ├── background-worker.js       # Chrome service worker wrapper
│   └── popup.js                   # Chrome popup script
├── firefox/                       # Firefox-specific files
│   ├── manifest.json              # Firefox manifest
│   ├── background-firefox.js      # Firefox background script
│   ├── popup.js                   # Firefox popup script
│   └── browser-polyfill.js        # Mozilla's browser API polyfill
├── build/                         # Built extensions
│   ├── chrome/                    # Chrome build output
│   └── firefox/                   # Firefox build output
├── build.js                       # Build script
└── README.md                      # This file
```

## Development Setup

### Prerequisites

- Node.js (for the build script)
- Firefox Developer Edition (for testing Firefox extensions)
- Chrome (for testing Chrome extensions)
- Mozilla's browser-polyfill.js (for Firefox compatibility)

### Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/reminder-extension.git
   cd reminder-extension
   ```

2. Download the browser-polyfill.js:
   - Go to https://github.com/mozilla/webextension-polyfill/releases
   - Download the latest version
   - Place `browser-polyfill.js` in the `firefox/` directory

3. Build the extensions:
   ```
   node build.js
   ```

4. The built extensions will be in the `build/` directory:
   - `build/chrome/` - Chrome extension
   - `build/firefox/` - Firefox extension

### Testing

#### Chrome:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `build/chrome/` directory

#### Firefox:
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Navigate to the `build/firefox/` directory and select `manifest.json`

## Project Organization

### Shared Code

The `src/` directory contains shared code used by both Chrome and Firefox versions:
- `icons/` - Extension icons
- `popup.css` - Styles for the popup UI
- `popup.html` - Base HTML structure for the popup

### Browser-Specific Code

Each browser has its own directory containing browser-specific implementations:

- `chrome/` - Chrome-specific code using the Chrome extension API
- `firefox/` - Firefox-specific code using the browser API with promises

### Build Process

The `build.js` script:
1. Copies all shared files from `src/` to both browser-specific build directories
2. Copies browser-specific files from `chrome/` and `firefox/` to their respective build directories
3. Creates complete, standalone extensions for each browser

## Publishing

### Chrome Web Store:
1. Zip the contents of the `build/chrome/` directory
2. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
3. Click "New Item" and upload your zip file

### Firefox Add-ons:
1. Zip the contents of the `build/firefox/` directory
2. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
3. Click "Submit a New Add-on" and upload your zip file

## License

[Your License Here]