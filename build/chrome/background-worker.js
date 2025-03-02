// Simple worker that just imports the main background script
try {
  importScripts('background.js');
} catch (e) {
  console.error('Error importing background.js:', e);
}