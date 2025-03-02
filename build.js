const fs = require('fs');
const path = require('path');

// Directory Configuration
const SOURCE_DIR = './src';
const CHROME_DIR = './chrome';
const FIREFOX_DIR = './firefox';
const EDGE_DIR = './edge';  // New Edge directory
const BUILD_DIR = './build';
const CHROME_BUILD_DIR = path.join(BUILD_DIR, 'chrome');
const FIREFOX_BUILD_DIR = path.join(BUILD_DIR, 'firefox');
const EDGE_BUILD_DIR = path.join(BUILD_DIR, 'edge');  // New Edge build directory

// Ensure build directories exist
ensureDirectoryExists(BUILD_DIR);
ensureDirectoryExists(CHROME_BUILD_DIR);
ensureDirectoryExists(FIREFOX_BUILD_DIR);
ensureDirectoryExists(EDGE_BUILD_DIR);  // Ensure Edge directory exists

// Build the Chrome extension
console.log('Building Chrome extension...');
buildChromeExtension();

// Build the Firefox extension
console.log('Building Firefox extension...');
buildFirefoxExtension();

// Build the Edge extension
console.log('Building Edge extension...');
buildEdgeExtension();

console.log('Build completed!');

// Functions
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyDirectory(source, destination) {
  ensureDirectoryExists(destination);
  
  const files = fs.readdirSync(source);
  
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

function buildChromeExtension() {
  // Copy shared files
  copyDirectory(SOURCE_DIR, CHROME_BUILD_DIR);
  
  // Copy Chrome-specific files
  const chromeFiles = fs.readdirSync(CHROME_DIR);
  for (const file of chromeFiles) {
    const sourcePath = path.join(CHROME_DIR, file);
    const destPath = path.join(CHROME_BUILD_DIR, file);
    
    fs.copyFileSync(sourcePath, destPath);
  }
}

function buildFirefoxExtension() {
  // Copy shared files
  copyDirectory(SOURCE_DIR, FIREFOX_BUILD_DIR);
  
  // Copy Firefox-specific files
  const firefoxFiles = fs.readdirSync(FIREFOX_DIR);
  for (const file of firefoxFiles) {
    const sourcePath = path.join(FIREFOX_DIR, file);
    const destPath = path.join(FIREFOX_BUILD_DIR, file);
    
    fs.copyFileSync(sourcePath, destPath);
  }
  
  // Download browser-polyfill.js if it doesn't exist
  const polyfillPath = path.join(FIREFOX_BUILD_DIR, 'browser-polyfill.js');
  if (!fs.existsSync(polyfillPath)) {
    console.log('browser-polyfill.js not found. Please download it from:');
    console.log('https://github.com/mozilla/webextension-polyfill/releases');
    console.log('and place it in the firefox directory.');
  }
}

function buildEdgeExtension() {
  // Copy shared files
  copyDirectory(SOURCE_DIR, EDGE_BUILD_DIR);
  
  // If you have Edge-specific files, copy them
  if (fs.existsSync(EDGE_DIR)) {
    const edgeFiles = fs.readdirSync(EDGE_DIR);
    for (const file of edgeFiles) {
      const sourcePath = path.join(EDGE_DIR, file);
      const destPath = path.join(EDGE_BUILD_DIR, file);
      
      fs.copyFileSync(sourcePath, destPath);
    }
  } else {
    // If no Edge directory exists, use Chrome files as a fallback
    console.log('No Edge-specific directory found. Using Chrome files as base...');
    const chromeFiles = fs.readdirSync(CHROME_DIR);
    for (const file of chromeFiles) {
      const sourcePath = path.join(CHROME_DIR, file);
      const destPath = path.join(EDGE_BUILD_DIR, file);
      
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}