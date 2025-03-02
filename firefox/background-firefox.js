// Firefox version of background.js
// Uses the browser API with promises

// Initialize and check for theme preference
browser.runtime.onInstalled.addListener(() => {
  // Initialize theme preference if not set
  browser.storage.sync.get(['theme']).then(result => {
    if (!result.theme) {
      // Set a default theme
      return browser.storage.sync.set({ theme: 'light' });
    }
  }).catch(error => {
    console.error("Error initializing theme:", error);
  });
});

// Listen for alarm
browser.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name.startsWith('reminder-')) {
    const reminderId = alarm.name.replace('reminder-', '');
    
    browser.storage.sync.get(['reminders']).then(result => {
      const reminders = result.reminders || [];
      const reminder = reminders.find(r => r.id === reminderId);
      
      if (reminder && !reminder.completed) {
        // Show notification
        return browser.notifications.create('', {
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: reminder.title,
          message: reminder.description || 'Your reminder is due!',
          priority: 2
        }).then(() => {
          // If reminder repeats, schedule next occurrence
          if (reminder.repeat !== 'none') {
            return scheduleRepeatingReminder(reminder);
          }
        });
      }
    }).catch(error => {
      console.error("Error processing alarm:", error);
    });
  }
});

// Listen for messages from popup
browser.runtime.onMessage.addListener(function(request, sender) {
  if (request.action === 'scheduleReminder') {
    const reminder = request.reminder;
    const alarmTime = new Date(`${reminder.date}T${reminder.time}`).getTime();
    
    return browser.alarms.create(`reminder-${reminder.id}`, {
      when: alarmTime
    }).then(() => {
      return Promise.resolve({ success: true });
    });
  }
  
  // Return a promise for Firefox
  return Promise.resolve(null);
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
  return browser.storage.sync.get(['reminders']).then(result => {
    const reminders = result.reminders || [];
    const reminderIndex = reminders.findIndex(r => r.id === reminder.id);
    
    if (reminderIndex >= 0) {
      reminders[reminderIndex] = updatedReminder;
      
      return browser.storage.sync.set({ reminders }).then(() => {
        // Schedule next alarm
        const alarmTime = nextDate.getTime();
        return browser.alarms.create(`reminder-${reminder.id}`, {
          when: alarmTime
        });
      });
    }
  }).catch(error => {
    console.error("Error scheduling repeating reminder:", error);
  });
}