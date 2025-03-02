// Firefox version of popup.js
document.addEventListener('DOMContentLoaded', function() {
  // Theme Initialization
  initializeTheme();
  
  // Theme Toggle
  const themeToggleBtn = document.getElementById('theme-toggle');
  themeToggleBtn.addEventListener('click', toggleTheme);
  
  // Tab Switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      
      // Update active tab button
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Show active tab content
      tabContents.forEach(content => content.classList.remove('active'));
      document.getElementById(`${tabName}-tab`).classList.add('active');
      
      // Refresh reminders list when switching to view tab
      if (tabName === 'view') {
        loadReminders();
      }
    });
  });
  
  // Form Submission
  const reminderForm = document.getElementById('reminder-form');
  reminderForm.addEventListener('submit', function(event) {
    event.preventDefault();
    
    let title = '';
    let description = '';
    let date = '';
    let time = '';
    let repeat = 'none'; // Default value
    let priority = 'medium'; // Default value

    // Safely get values with error handling
    const titleElement = document.getElementById('title');
    if (titleElement) title = titleElement.value;

    const descriptionElement = document.getElementById('description');
    if (descriptionElement) description = descriptionElement.value;

    // Try both possible IDs for date
    const dateElement = document.getElementById('date') || document.getElementById('reminder-date');
    if (dateElement) date = dateElement.value;

    // Try both possible IDs for time
    const timeElement = document.getElementById('time') || document.getElementById('reminder-time');
    if (timeElement) time = timeElement.value;

    const repeatElement = document.getElementById('repeat');
    if (repeatElement) repeat = repeatElement.value;

    const priorityElement = document.getElementById('priority');
    if (priorityElement) priority = priorityElement.value;

    // Log the values to help with debugging
    console.log('Form values:', { title, description, date, time, repeat, priority });
    
    // Check if we're editing an existing reminder
    const idInput = document.getElementById('reminder-id');
    const id = idInput ? idInput.value : Date.now().toString();
    
    const reminder = {
      id,
      title,
      description,
      date,
      time,
      repeat,
      priority,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    saveReminder(reminder);
  });
  
  // Filter Change
  const filterSelect = document.getElementById('filter');
  filterSelect.addEventListener('change', loadReminders);
  
  // Load initial reminders
  loadReminders();
  
  // Set default date to today
  const dateInput = document.getElementById('reminder-date') || document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.min = today;
  } else {
    console.error('Date input element not found. Check your HTML IDs.');
  }
});

// Custom success notification function
function showSuccessMessage() {
  // Create custom success notification
  const notification = document.createElement('div');
  notification.className = 'success-notification';
  
  // Create content container
  const contentDiv = document.createElement('div');
  contentDiv.className = 'notification-content';
  
  // Create and add message
  const message = document.createElement('p');
  message.textContent = 'Reminder saved successfully!';
  contentDiv.appendChild(message);
  
  // Create button container
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'notification-button-container';
  
  // Create OK button
  const okButton = document.createElement('button');
  okButton.id = 'success-ok-btn';
  okButton.textContent = 'OK';
  buttonContainer.appendChild(okButton);
  
  // Assemble the notification
  contentDiv.appendChild(buttonContainer);
  notification.appendChild(contentDiv);
  
  // Add to body
  document.body.appendChild(notification);
  
  // Add event listener to close
  okButton.addEventListener('click', function() {
    document.body.removeChild(notification);
  });
  
  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 3000);
}

// Theme functions
function initializeTheme() {
  browser.storage.sync.get(['theme']).then(result => {
    const savedTheme = result.theme || 'light';
    document.body.className = savedTheme + '-mode';
  }).catch(error => {
    console.error("Error getting theme:", error);
    document.body.className = 'light-mode'; // Default fallback
  });
}

function toggleTheme() {
  const isDarkMode = document.body.classList.contains('dark-mode');
  const newTheme = isDarkMode ? 'light' : 'dark';
  
  document.body.className = newTheme + '-mode';
  
  browser.storage.sync.set({ theme: newTheme }).catch(error => {
    console.error("Error setting theme:", error);
  });
}

// Save reminder to storage
function saveReminder(reminder) {
  browser.storage.sync.get(['reminders']).then(result => {
    const reminders = result.reminders || [];
    
    // Check if editing existing reminder
    const existingIndex = reminders.findIndex(r => r.id === reminder.id);
    
    if (existingIndex >= 0) {
      reminders[existingIndex] = reminder;
    } else {
      reminders.push(reminder);
      
      // Schedule notification
      scheduleReminder(reminder);
    }
    
    return browser.storage.sync.set({ reminders });
  }).then(() => {
    // Reset form
    document.getElementById('reminder-form').reset();
    
    // Remove hidden ID if exists
    const idInput = document.getElementById('reminder-id');
    if (idInput) {
      idInput.remove();
    }
    
    // Show custom success message
    showSuccessMessage();
    
    // Switch to view tab after a slight delay to ensure storage operation is complete
    setTimeout(() => {
      document.querySelector('[data-tab="view"]').click();
    }, 300);
  }).catch(error => {
    console.error("Error saving reminder:", error);
    alert('Error saving reminder. Please try again.');
  });
}

// Load reminders from storage and display
function loadReminders() {
  const remindersList = document.getElementById('reminders-list');
  const filter = document.getElementById('filter').value;
  
  browser.storage.sync.get(['reminders']).then(result => {
    const reminders = result.reminders || [];
    
    // Sort reminders by date and time
    reminders.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });
    
    // Filter reminders
    const today = new Date().toISOString().split('T')[0];
    let filteredReminders = reminders;
    
    if (filter === 'today') {
      filteredReminders = reminders.filter(r => r.date === today);
    } else if (filter === 'upcoming') {
      filteredReminders = reminders.filter(r => r.date > today && !r.completed);
    } else if (filter === 'completed') {
      filteredReminders = reminders.filter(r => r.completed);
    }
    
    // Display reminders
    if (filteredReminders.length === 0) {
      // Safely set empty message
      remindersList.textContent = '';
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = 'No reminders found.';
      remindersList.appendChild(emptyMessage);
      return;
    }
    
    // Clear the list safely
    remindersList.textContent = '';
    
    filteredReminders.forEach(reminder => {
      const reminderElement = createReminderElement(reminder);
      remindersList.appendChild(reminderElement);
    });
  }).catch(error => {
    console.error("Error loading reminders:", error);
    
    // Safely set error message
    remindersList.textContent = '';
    const errorMessage = document.createElement('p');
    errorMessage.className = 'error-message';
    errorMessage.textContent = 'Error loading reminders. Please refresh.';
    remindersList.appendChild(errorMessage);
  });
}

// Create HTML element for a reminder
function createReminderElement(reminder) {
  const reminderDiv = document.createElement('div');
  reminderDiv.className = `reminder-item priority-${reminder.priority}`;
  
  if (reminder.completed) {
    reminderDiv.classList.add('completed');
  }
  
  const dateObj = new Date(`${reminder.date}T${reminder.time}`);
  const formattedDate = dateObj.toLocaleDateString(undefined, { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  const formattedTime = dateObj.toLocaleTimeString(undefined, { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Create header
  const headerDiv = document.createElement('div');
  headerDiv.className = 'reminder-header';
  
  // Title
  const titleDiv = document.createElement('div');
  titleDiv.className = 'reminder-title';
  titleDiv.textContent = reminder.title;
  headerDiv.appendChild(titleDiv);
  
  // Date
  const dateDiv = document.createElement('div');
  dateDiv.className = 'reminder-date';
  dateDiv.textContent = `${formattedDate}, ${formattedTime}`;
  headerDiv.appendChild(dateDiv);
  
  // Description
  const descriptionDiv = document.createElement('div');
  descriptionDiv.className = 'reminder-description';
  descriptionDiv.textContent = reminder.description || '';
  
  // Repeat info
  const repeatDiv = document.createElement('div');
  repeatDiv.className = 'reminder-repeat';
  if (reminder.repeat !== 'none') {
    repeatDiv.textContent = `Repeats: ${reminder.repeat}`;
  }
  
  // Actions
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'reminder-actions';
  
  // Add complete button if not completed
  if (!reminder.completed) {
    const completeBtn = document.createElement('button');
    completeBtn.className = 'action-btn complete-btn';
    completeBtn.dataset.id = reminder.id;
    completeBtn.textContent = 'Complete';
    
    completeBtn.addEventListener('click', () => {
      completeReminder(reminder.id);
    });
    
    actionsDiv.appendChild(completeBtn);
  }
  
  // Edit button
  const editBtn = document.createElement('button');
  editBtn.className = 'action-btn edit-btn';
  editBtn.dataset.id = reminder.id;
  editBtn.textContent = 'Edit';
  
  editBtn.addEventListener('click', () => {
    editReminder(reminder.id);
  });
  
  actionsDiv.appendChild(editBtn);
  
  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'action-btn delete-btn';
  deleteBtn.dataset.id = reminder.id;
  deleteBtn.textContent = 'Delete';
  
  deleteBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      deleteReminder(reminder.id);
    }
  });
  
  actionsDiv.appendChild(deleteBtn);
  
  // Assemble the reminder element
  reminderDiv.appendChild(headerDiv);
  reminderDiv.appendChild(descriptionDiv);
  reminderDiv.appendChild(repeatDiv);
  reminderDiv.appendChild(actionsDiv);
  
  return reminderDiv;
}

// Edit reminder
function editReminder(id) {
  browser.storage.sync.get(['reminders']).then(result => {
    const reminders = result.reminders || [];
    const reminder = reminders.find(r => r.id === id);
    
    if (reminder) {
      // Populate form
      document.getElementById('title').value = reminder.title;
      document.getElementById('description').value = reminder.description;
      
      // Handle both potential ID formats for date and time
      const dateInput = document.getElementById('date') || document.getElementById('reminder-date');
      const timeInput = document.getElementById('time') || document.getElementById('reminder-time');
      
      if (dateInput) dateInput.value = reminder.date;
      if (timeInput) timeInput.value = reminder.time;
      
      document.getElementById('repeat').value = reminder.repeat;
      document.getElementById('priority').value = reminder.priority;
      
      // Switch to add tab
      document.querySelector('[data-tab="add"]').click();
      
      // Create a hidden input to store the reminder ID
      let idInput = document.getElementById('reminder-id');
      if (!idInput) {
        idInput = document.createElement('input');
        idInput.type = 'hidden';
        idInput.id = 'reminder-id';
        document.getElementById('reminder-form').appendChild(idInput);
      }
      idInput.value = id;
    }
  }).catch(error => {
    console.error("Error editing reminder:", error);
  });
}

// Delete reminder
function deleteReminder(id) {
  browser.storage.sync.get(['reminders']).then(result => {
    const reminders = result.reminders || [];
    const updatedReminders = reminders.filter(r => r.id !== id);
    
    return browser.storage.sync.set({ reminders: updatedReminders });
  }).then(() => {
    loadReminders();
  }).catch(error => {
    console.error("Error deleting reminder:", error);
  });
}

// Mark reminder as complete
function completeReminder(id) {
  browser.storage.sync.get(['reminders']).then(result => {
    const reminders = result.reminders || [];
    const reminder = reminders.find(r => r.id === id);
    
    if (reminder) {
      reminder.completed = true;
      
      return browser.storage.sync.set({ reminders });
    }
  }).then(() => {
    loadReminders();
  }).catch(error => {
    console.error("Error completing reminder:", error);
  });
}

// Schedule reminder notification
function scheduleReminder(reminder) {
  const dateTime = new Date(`${reminder.date}T${reminder.time}`);
  
  // Only schedule if the time is in the future
  if (dateTime > new Date()) {
    browser.runtime.sendMessage({
      action: 'scheduleReminder',
      reminder: reminder
    }).catch(error => {
      console.error("Error scheduling reminder:", error);
    });
  }
}