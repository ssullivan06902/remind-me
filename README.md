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
- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Other Chromium-based browsers (Brave, Opera, etc.)

## Repository Structure

```
reminder-extension/
├── src/                           # Shared source code
│   ├── icons/                     # Icons for all versions
│   ├── popup.css                  # Shared CSS
│   └── popup.html                 # Shared popup HTML (without browser-specific parts)
├── chrome/                        # Chrome-specific files
│   ├── manifest.json              # Chrome manifest
│   ├── background.js              # Chrome background script
│   ├── background-worker.js       # Chrome service worker wrapper
│   └── popup.js                   # Chrome popup script
│   └── browser-polyfill.js        # Chrome's browser API polyfill
├── edge/                          # Edge-specific files
│   ├── background.js              # Edge background script
│   └── browser-polyfill.js        # Edge's browser API polyfill
│   ├── manifest.json              # Edge manifest
│   ├── popup.js                   # Edge popup script
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
- Google Chrome (for testing Chrome extensions)
- Microsoft Edge (for testing Edge extensions)
- Firefox Developer Edition (for testing Firefox extensions)
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
   - Place a copy or a modified version in the `edge/` directory

3. Build the extensions:
   ```
   node build.js
   ```

4. The built extensions will be in the `build/` directory:
   - `build/chrome/`  - Chrome extension
   - `build/edge/`    - Edge extension
   - `build/firefox/` - Firefox extension

### Testing

#### Chrome:
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `build/chrome/` directory

#### Edge:
1. Open Edge and navigate to `edge://extensions/`
2. Enable "Developer mode" (toggle in the bottom-left corner)
3. Click "Load unpacked" and select the `build/edge/` directory

#### Firefox:
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Navigate to the `build/firefox/` directory and select `manifest.json`

## Project Organization

### Shared Code

The `src/` directory contains shared code used by both Chrome and Firefox versions:
- `icons/`     - Extension icons <- [Reminder Skin Type 3 icons!](https://icons8.com/icon/PUU6euyt3ma8/reminder-skin-type-3) icons by [icons8](https://icons8.com) ->
- `popup.css`  - Styles for the popup UI
- `popup.html` - Base HTML structure for the popup

### Browser-Specific Code

Each browser has its own directory containing browser-specific implementations:

- `chrome/`  - Chrome-specific code using the Chrome extension API
- `edge/`    - Edge-specific code with enhanced error handling and compatibility features
- `firefox/` - Firefox-specific code using the browser API with promises

### Build Process

The `build.js` script:
1. Copies all shared files from `src/` to both browser-specific build directories
2. Copies browser-specific files from `chrome/`, `edge/`,  and `firefox/` to their respective build directories
3. Creates complete, standalone extensions for each browser

## Key Differences Between Browser Implementations

### Chrome vs Edge
Edge is now Chromium-based, so most Chrome code works with minimal changes. The main differences are:
- Enhanced error handling in Edge implementation
- Browser detection for Edge-specific behavior
- Some modifications to notification handling
- Edge-specific manifest entries

### Chrome/Edge vs Firefox
Firefox uses a different extension API that follows the WebExtension standard:
- Firefox uses Promise-based APIs instead of callback-based APIs
- Firefox requires the `browser-polyfill.js` for compatibility
- Manifest differences for background scripts and permissions

## Publishing

### Chrome Web Store:
1. Zip the contents of the `build/chrome/` directory
2. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
3. Click "New Item" and upload your zip file

### Microsoft Edge Add-ons:
1. Zip the contents of the `build/edge/` directory
2. Go to the [Microsoft Partner Center](https://partner.microsoft.com/en-us/dashboard/microsoftedge/overview)
3. Create a new Edge Add-on submission and upload your zip file

### Firefox Add-ons:
1. Zip the contents of the `build/firefox/` directory
2. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
3. Click "Submit a New Add-on" and upload your zip file

## Troubleshooting

### Edge-Specific Issues
- If notifications don't appear, check Edge notification permissions in Windows settings
- For storage issues, check Edge's extension storage permissions
- If alarms aren't triggering, verify system time is correct and alarms are properly registered

### Firefox-Specific Issues
- If the extension doesn't load, verify `browser-polyfill.js` is included correctly
- For storage issues, check Firefox's extension storage permissions

## License

[Your License Here]