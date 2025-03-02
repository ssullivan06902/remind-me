// background.js - Chrome-focused approach
// Handle alarm management and notifications

// Initialize and check for theme preference
chrome.runtime.onInstalled.addListener(() => {
  // Initialize theme preference if not set
  chrome.storage.sync.get(['theme'], function(result) {
    if (!result.theme) {
      // Set a default theme
      chrome.storage.sync.set({ theme: 'light' });
    }
  });
});

// Listen for alarm
chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name.startsWith('reminder-')) {
    const reminderId = alarm.name.replace('reminder-', '');
    
    chrome.storage.sync.get(['reminders'], function(result) {
      const reminders = result.reminders || [];
      const reminder = reminders.find(r => r.id === reminderId);
      
      if (reminder && !reminder.completed) {
        // Show notification
        chrome.notifications.create('', {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: reminder.title,
          message: reminder.description || 'Your reminder is due!',
          priority: 2
        });
        
        // If reminder repeats, schedule next occurrence
        if (reminder.repeat !== 'none') {
          scheduleRepeatingReminder(reminder);
        }
      }
    });
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'scheduleReminder') {
    const reminder = request.reminder;
    const alarmTime = new Date(`${reminder.date}T${reminder.time}`).getTime();
    
    chrome.alarms.create(`reminder-${reminder.id}`, {
      when: alarmTime
    });
    
    sendResponse({ success: true });
  }
  
  // Keeping the message channel open for async response
  return true;
});

// Schedule repeating reminders
function scheduleRepeatingReminder(reminder) {
  const originalDate = new Date(`${reminder.date}T${reminder.time}`);
  let nextDate = new Date(originalDate);
  
  switch(reminder.repeat) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekdays':
      do {
        nextDate.setDate(nextDate.getDate() + 1);
      } while (nextDate.getDay() === 0 || nextDate.getDay() === 6);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  
  // Update reminder with new date
  const updatedReminder = {
    ...reminder,
    date: nextDate.toISOString().split('T')[0],
    time: reminder.time
  };
  
  // Save updated reminder
  chrome.storage.sync.get(['reminders'], function(result) {
    const reminders = result.reminders || [];
    const reminderIndex = reminders.findIndex(r => r.id === reminder.id);
    
    if (reminderIndex >= 0) {
      reminders[reminderIndex] = updatedReminder;
      
      chrome.storage.sync.set({ reminders }, function() {
        // Schedule next alarm
        const alarmTime = nextDate.getTime();
        chrome.alarms.create(`reminder-${reminder.id}`, {
          when: alarmTime
        });
      });
    }
  });
}