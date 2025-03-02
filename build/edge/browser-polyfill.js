/**
 * Microsoft Edge compatibility layer
 * This is a simplified polyfill that ensures compatibility between the Chrome and browser APIs
 */

(function() {
    'use strict';
  
    if (typeof globalThis.browser === 'undefined') {
      // Define browser namespace if it doesn't exist
      globalThis.browser = {};
      
      // Create proxies for all Chrome API namespaces
      const chromeNamespaces = [
        'alarms', 
        'bookmarks', 
        'browserAction', 
        'commands', 
        'contextMenus', 
        'cookies', 
        'downloads', 
        'extension', 
        'i18n', 
        'idle', 
        'notifications', 
        'pageAction', 
        'runtime', 
        'storage', 
        'tabs', 
        'webNavigation', 
        'webRequest', 
        'windows'
      ];
      
      // For each Chrome API namespace, create a corresponding browser namespace
      chromeNamespaces.forEach(namespace => {
        if (chrome[namespace]) {
          // Create the browser namespace if it doesn't exist
          if (!browser[namespace]) {
            browser[namespace] = {};
          }
          
          // For each function in the Chrome namespace, create a Promise-based wrapper in browser
          Object.keys(chrome[namespace]).forEach(key => {
            if (typeof chrome[namespace][key] === 'function') {
              // Create a function that returns a Promise
              browser[namespace][key] = function() {
                const args = Array.from(arguments);
                
                return new Promise((resolve, reject) => {
                  try {
                    chrome[namespace][key](...args, function() {
                      // Check for chrome.runtime.lastError
                      const error = chrome.runtime.lastError;
                      if (error) {
                        reject(new Error(error.message));
                      } else {
                        // If there's only one argument, resolve with just that
                        // Otherwise resolve with an array of arguments
                        resolve(arguments.length === 1 ? arguments[0] : Array.from(arguments));
                      }
                    });
                  } catch (e) {
                    // If the function doesn't accept a callback, just call it directly
                    try {
                      const result = chrome[namespace][key](...args);
                      resolve(result);
                    } catch (e2) {
                      reject(e2);
                    }
                  }
                });
              };
            } else {
              // For non-function properties, just copy them over
              browser[namespace][key] = chrome[namespace][key];
            }
          });
        }
      });
    }
  })();