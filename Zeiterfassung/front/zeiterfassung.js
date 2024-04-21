var times = {};

function recordTime(type) {
    console.log("recordTime aufgerufen mit: " + type);
    var now = new Date();
    var time = now.getHours() + ":" + (now.getMinutes() < 10 ? "0" : "") + now.getMinutes();
    times[type] = time;

    if (type === 'end') {
        addRow(times['start'], times['end']);
    }

}
function calculateWorkTime(start, end) {
    
    var startTime = new Date("1970-01-01 " + start);
    var endTime = new Date("1970-01-01 " + end);

    
    var diff = endTime - startTime;

   
    var hours = Math.floor(diff / 1000 / 60 / 60);
    var minutes = Math.floor(diff / 1000 / 60) % 60;

    
    return hours + ":" + (minutes < 10 ? "0" : "") + minutes;
}
function calculatePause(workTime) {
    
    var workTimeParts = workTime.split(":");
    var workTimeInMinutes = parseInt(workTimeParts[0]) * 60 + parseInt(workTimeParts[1]);

    
    if (workTimeInMinutes < 6 * 60) {
        return "0:00";
    } else if (workTimeInMinutes < 9 * 60) {
        return "0:30";
    } else {
        return "0:45";
    }
}
  function addRow(start,end) {
    
      var newTimeRecord = {
          start: start,
          end: end
      };

      
      fetch('/timeRecords', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTimeRecord),
      })
      .then(response => response.json())
      .then(data => {
          // Add the new time record to the table
          var table = document.getElementById("timeTable");
          var row = table.insertRow(-1);
          row.dataset.id = data.id;
          var dateCell = row.insertCell(0);
          var startCell = row.insertCell(1);
          var endCell = row.insertCell(2);
          var workTimeCell = row.insertCell(3);
          var pauseCell = row.insertCell(4);
          var actionCell = row.insertCell(5);
          dateCell.innerHTML = new Date().toLocaleDateString();
          startCell.innerHTML = start;
          endCell.innerHTML = end;
          workTimeCell.innerHTML = calculateWorkTime(start, end);
          pauseCell.innerHTML = calculatePause(calculateWorkTime(start, end));
          actionCell.innerHTML = '<button class = "editButton" button onclick="editRow(this, ' + data.id + ')">Edit</button>';
      })
      .catch((error) => {
          console.error('Error:', error);
      });
  }

  function deleteRow(btn) {
     // Get the ID of the time record to delete
      var id = btn.parentNode.parentNode.dataset.id;

      // Send a DELETE request to the server
      fetch('/timeRecords/' + id, {
          method: 'DELETE',
      })
      .then((response) => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          // Remove the row from the table
          var row = btn.parentNode.parentNode;
          row.parentNode.removeChild(row);
      })
      .catch((error) => {
          console.error('Error:', error);
      });
  }
  window.onload = function() {
    // Erste Funktion
    fetch('/timeRecords')
    .then(response => response.json())
    .then(data => {
        data.forEach(record => {
            var table = document.getElementById("timeTable");
            var row = table.insertRow(-1);
            row.dataset.id = record.id;
            var dateCell = row.insertCell(0);
            var startCell = row.insertCell(1);
            var endCell = row.insertCell(2);
            var worktimeCell = row.insertCell(3);
            var pauseCell = row.insertCell(4);
            var actionCell = row.insertCell(5);
            dateCell.innerHTML = new Date().toLocaleDateString();
            startCell.innerHTML = record.start;
            endCell.innerHTML = record.end;
            worktimeCell.innerHTML = calculateWorkTime(record.start, record.end);
            pauseCell.innerHTML = calculatePause(calculateWorkTime(record.start, record.end));
            actionCell.innerHTML = '<button class = "editButton" button onclick="editRow(this, ' + data.id + ')">Edit</button>';
        });
    })
    .catch((error) => {
        console.error('Error:', error);
    });

};

function editRow(btn) {
    // Get the ID of the time record to edit
    var id = btn.parentNode.parentNode.dataset.id;

    // Get the start and end cells
    var startCell = btn.parentNode.parentNode.cells[1];
    var endCell = btn.parentNode.parentNode.cells[2];

    // Change the cells to input fields with the current values
    startCell.innerHTML = '<input type="time" id="startInput" value="' + startCell.innerHTML + '">';
    endCell.innerHTML = '<input type="time" id="endInput" value="' + endCell.innerHTML + '">';

    // Change the Edit button to a Save button
    btn.outerHTML = '<button class="saveButton" onclick="saveRow(this, ' + id + ')">Save</button>';
}

function saveRow(btn, id) {
    // Get the input fields
    var startInput = document.getElementById("startInput");
    var endInput = document.getElementById("endInput");

    // Get the new start and end times
    var newStart = startInput.value;
    var newEnd = endInput.value;

    // Send a PUT request to the server to update the time record
    fetch('/timeRecords/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({start: newStart, end: newEnd, id: id}),
    })
    .then(response => response.json())
    .then(data => {
        // Change the input fields back to normal cells with the new values
        startInput.parentNode.innerHTML = newStart;
        endInput.parentNode.innerHTML = newEnd;
    
        // Change the Save button back to an Edit button
        btn.outerHTML = '<button class="editButton" onclick="editRow(this)">Edit</button>';
    
        // Calculate work time and break
        var workTime = calculateWorkTime(newStart, newEnd);
        var breakTime = calculateBreak(newStart, newEnd);
    
        // Update the work time and break time in the HTML
        document.getElementById("workTime").innerHTML = workTime;
        document.getElementById("breakTime").innerHTML = breakTime;

        // Refresh the page
        document.location.reload();
    
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

