document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');
  var formContainer = document.createElement('div');
  formContainer.classList.add('form-container');
  document.body.appendChild(formContainer);

  var calendar = new FullCalendar.Calendar(calendarEl, {
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    
    dateClick: function(info) {
      var date = info.date;
      var dateString = date.getFullYear() + '-' + pad((date.getMonth() + 1)) + '-' + pad(date.getDate());

      // Create a form to add task details
      var form = createTaskForm(dateString);

      // Append the form to the form container
      formContainer.innerHTML = '';
      formContainer.appendChild(form);
    },
    eventClick: function(info) {
      var event = info.event;
      var eventData = {
        id: event.id,
        title: event.title,
        time: event.extendedProps.time || '',
        endDate: event.end ? event.end.toISOString().slice(0, 16) : '',
        reminder: event.extendedProps.reminder || ''
      };

      // Create a form to display task details
      var form = createTaskForm(event.start.toISOString().slice(0, 16), eventData);
      // Append the form to the form container
      formContainer.innerHTML = '';
      formContainer.appendChild(form);

      // Add delete button to the form
      var deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.classList.add('delete-button');
      deleteButton.addEventListener('click', function() {
        event.remove();
        formContainer.innerHTML = ''; // Clear the form container after deleting
      });
      formContainer.appendChild(deleteButton);
    }
  });

  calendar.render();

  function createTaskForm(dateString, eventData = {}) {
    var form = document.createElement('form');
    form.innerHTML = `
      <label for="taskTitle">Task Title:</label>
      <input type="text" id="taskTitle" name="taskTitle" value="${eventData.title || ''}" required>
      <br>
      <label for="taskTime">Task Time:</label>
      <input type="time" id="taskTime" name="taskTime" value="${eventData.time || ''}">
      <br>
      <label for="endDate">End Date and Time:</label>
      <input type="datetime-local" id="endDate" name="endDate" value="${eventData.endDate || ''}">
      <br>
      <label for="reminder">Set Reminder:</label>
      <input type="checkbox" id="reminder" name="reminder" value="${eventData.reminder || ''}">
      <br>
      <input type="submit" value="${eventData.start ? 'Update Task' : 'Add Task'}">
    `;

    // Submit form handler
    form.addEventListener('submit', function(event) {
      event.preventDefault();

      var taskTitle = document.getElementById('taskTitle').value;
      var taskTime = document.getElementById('taskTime').value;
      var endDate = document.getElementById('endDate').value;
      var reminder = document.getElementById('reminder').value;

      var updatedEventData = {
        title: taskTitle,
        start: dateString + 'T00:00:00', // Set the start time to midnight
        allDay: true,
        extendedProps: {
          time: taskTime,
          reminder: reminder,
          end: endDate,
        }
      };

      if (endDate) {
        updatedEventData.end = endDate;
      }

      if (eventData.start) {
        // Update existing event
        calendar.getEventById(eventData.id).remove();
      }

      calendar.addEvent(updatedEventData);

      // Clear the form container after adding/updating the task
      formContainer.innerHTML = '';
    });

    return form;
  }

  function pad(num) {
    return num < 10 ? '0' + num : num;
  }
});