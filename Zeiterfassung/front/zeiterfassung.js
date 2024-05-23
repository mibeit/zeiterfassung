var times = {};

function recordTime(type) {
    console.log("recordTime aufgerufen mit: " + type);
    var now = new Date();
    var time = now.getHours() + ":" + (now.getMinutes() < 10 ? "0" : "") + now.getMinutes();
    var date = now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
    times[type] = time;
    times['date'] = date;

    if (type === 'end') {
        addRow(times['start'], times['end'], times['date']);
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
  function addRow(start,end,date) {
    
      var newTimeRecord = {
          start: start,
          end: end,
          date: date
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
          dateCell.innerHTML = new Date(date).toLocaleDateString();
          startCell.innerHTML = start;
          endCell.innerHTML = end;
          workTimeCell.innerHTML = calculateWorkTime(start, end);
          pauseCell.innerHTML = calculatePause(calculateWorkTime(start, end));
          actionCell.innerHTML = '<button class = "editButton" button onclick="editRow(this, ' + data.id + ')">Edit</button>';
          actionCell.innerHTML += '<button class = "deleteButton" button onclick="deleteRow(this, ' + data.id +')">Delete</button>';
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

  // if the page is loaded table will be reloaded 
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
            dateCell.innerHTML = new Date(record.date).toLocaleDateString();
            startCell.innerHTML = record.start;
            endCell.innerHTML = record.end;
            worktimeCell.innerHTML = calculateWorkTime(record.start, record.end);
            pauseCell.innerHTML = calculatePause(calculateWorkTime(record.start, record.end));
            actionCell.innerHTML = '<button class = "editButton" button onclick="editRow(this, ' + data.id + ')">Edit</button>';
            actionCell.innerHTML += '<button class = "deleteButton" button onclick="deleteRow(this, ' + data.id +')">Delete</button>';
        });
    })
    .catch((error) => {
        console.error('Error:', error);
    });

};

function formatDate(dateString) {
    var parts = dateString.split(".");
    return parts[2] + "-" + parts[1] + "-" + parts[0];
}

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
function filterMonth(month) {
    fetch('/timeRecords/month/' + month)
        .then(response => response.json())
        .then(data => {
            var table = document.getElementById("timeTable");
            
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
            
            data.forEach(record => {
                var row = table.insertRow(-1);
                row.dataset.id = record.id;
                var dateCell = row.insertCell(0);
                var startCell = row.insertCell(1);
                var endCell = row.insertCell(2);
                var worktimeCell = row.insertCell(3);
                var pauseCell = row.insertCell(4);
                var actionCell = row.insertCell(5);
                dateCell.innerHTML = new Date(record.date).toLocaleDateString();
                startCell.innerHTML = record.start;
                endCell.innerHTML = record.end;
                worktimeCell.innerHTML = calculateWorkTime(record.start, record.end);
                pauseCell.innerHTML = calculatePause(calculateWorkTime(record.start, record.end));
                actionCell.innerHTML = '<button class = "editButton" button onclick="editRow(this, ' + record.id + ')">Edit</button>';
                actionCell.innerHTML += '<button class = "deleteButton" button onclick="deleteRow(this, ' + record.id +')">Delete</button>';
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function last7Days() {

    let today = new Date();
    let dateString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
   
    fetch('/timeRecords/date/' + dateString)
        .then(response => response.json())
        .then(data => {
            
            var table = document.getElementById("timeTable");
            
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
            
            data.forEach(record => {
                var row = table.insertRow(-1);
                row.dataset.id = record.id;
                var dateCell = row.insertCell(0);
                var startCell = row.insertCell(1);
                var endCell = row.insertCell(2);
                var worktimeCell = row.insertCell(3);
                var pauseCell = row.insertCell(4);
                var actionCell = row.insertCell(5);
                dateCell.innerHTML = new Date(record.date).toLocaleDateString();
                startCell.innerHTML = record.start;
                endCell.innerHTML = record.end;
                worktimeCell.innerHTML = calculateWorkTime(record.start, record.end);
                pauseCell.innerHTML = calculatePause(calculateWorkTime(record.start, record.end));
                actionCell.innerHTML = '<button class = "editButton" button onclick="editRow(this, ' + record.id + ')">Edit</button>';
                actionCell.innerHTML += '<button class = "deleteButton" button onclick="deleteRow(this, ' + record.id +')">Delete</button>';
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function getAllRecords() {
    fetch('/timeRecords')
        .then(response => response.json())
        .then(data => {
            var table = document.getElementById("timeTable");
            
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
            
            data.forEach(record => {
                var row = table.insertRow(-1);
                row.dataset.id = record.id;
                var dateCell = row.insertCell(0);
                var startCell = row.insertCell(1);
                var endCell = row.insertCell(2);
                var worktimeCell = row.insertCell(3);
                var pauseCell = row.insertCell(4);
                var actionCell = row.insertCell(5);
                dateCell.innerHTML = new Date(record.date).toLocaleDateString();
                startCell.innerHTML = record.start;
                endCell.innerHTML = record.end;
                worktimeCell.innerHTML = calculateWorkTime(record.start, record.end);
                pauseCell.innerHTML = calculatePause(calculateWorkTime(record.start, record.end));
                actionCell.innerHTML = '<button class = "editButton" button onclick="editRow(this, ' + record.id + ')">Edit</button>';
                actionCell.innerHTML += '<button class = "deleteButton" button onclick="deleteRow(this, ' + record.id +')">Delete</button>';
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}


function saveRow(btn, id) {
    // Get the input fields
    var startInput = document.getElementById("startInput");
    var endInput = document.getElementById("endInput");

    // Get the new start and end times
    var newStart = startInput.value;
    var newEnd = endInput.value;

    // Get the date from the row
    var dateCell = btn.parentNode.parentNode.cells[0];
    var date = formatDate(dateCell.innerHTML);

    // Send a PUT request to the server to update the time record
    fetch('/timeRecords/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({start: newStart, end: newEnd, date: date, id: id}),
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


function exportToExcel() {
    fetch('/timeRecords')
        .then(response => response.json())
        .then(data => {
            var wb = XLSX.utils.book_new();
            wb.Props = {
                Title: "Zeiterfassung",
                Subject: "Zeiterfassung",
                Author: "Ihr Name",
                CreatedDate: new Date()
            };
            wb.SheetNames.push("Zeiterfassung");
            var ws_data = [['Datum', 'Start', 'Ende', 'Arbeitszeit', 'Pause']];
            data.forEach(record => {
                ws_data.push([new Date(record.date).toLocaleDateString(), record.start, record.end, calculateWorkTime(record.start, record.end), calculatePause(calculateWorkTime(record.start, record.end))]);
            });
            var ws = XLSX.utils.aoa_to_sheet(ws_data);
            wb.Sheets["Zeiterfassung"] = ws;
            var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
            saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), 'zeiterfassung.xlsx');
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function s2ab(s) { 
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

function convertTimeToDecimal(time) {
    const [hours, minutes] = time.split(':');
    return Number(hours) + Number(minutes) / 60;
}

async function calculateTotalSalary() {
    try {
        const user = await getLoggedInUser();
        if (!user) {
            throw new Error('User not found');
        }

        const response = await fetch('/salaryRate/' + user.username);
        const salaryRate = await response.text();

        const response2 = await fetch('/timeRecords');
        const data = await response2.json();

        var totalWorkTime = 0;
        
        data.forEach(record => {
            var workTime = convertTimeToDecimal(calculateWorkTime(record.start, record.end));
            totalWorkTime += workTime;
        });
        
        var totalSalary = (totalWorkTime * parseFloat(salaryRate)).toFixed(2) + "€";
        document.getElementById('whichSalary').textContent =  "Das Gesamtghehalt beträgt:" ;
        document.getElementById('totalSalary').textContent =  totalSalary;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function calculateMonthlySalary(month) {
    var monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    var monthName = monthNames[month - 1]; 

    try {
        const user = await getLoggedInUser();
        if (!user) {
            throw new Error('User not found');
        }

        const response = await fetch('/salaryRate/' + user.username);
        const salaryRate = await response.text();

        const response2 = await fetch('/timeRecords/month/' + month);
        const data = await response2.json();

        var totalWorkTime = 0;
        
        data.forEach(record => {
            var workTime = convertTimeToDecimal(calculateWorkTime(record.start, record.end));
            totalWorkTime += workTime;
        });
        
        var totalSalary = (totalWorkTime * parseFloat(salaryRate)).toFixed(2) + "€";
        document.getElementById('whichSalary').textContent =  "Das Gehalt aus dem Monat "+ monthName + " beträgt:" ;
        document.getElementById('totalSalary').textContent =  totalSalary;
    } catch (error) {
        console.error('Error:', error);
    }
}


async function salaryLastWeek() {
    let today = new Date();
    let dateString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    try {
        const user = await getLoggedInUser();
        if (!user) {
            throw new Error('User not found');
        }

        const salaryRate = await getSalaryRate(user.username);
        if (!salaryRate) {
            throw new Error('Salary rate not found');
        }

        const response = await fetch('/timeRecords/date/' + dateString);
        const data = await response.json();

        var totalWorkTime = 0;
        
        data.forEach(record => {
            var workTime = convertTimeToDecimal(calculateWorkTime(record.start, record.end));
            totalWorkTime += workTime;
        });
        
        var totalSalary = (totalWorkTime * salaryRate).toFixed(2) + "€";
        document.getElementById('whichSalary').textContent =  "Das Gehalt aus der letzten Woche beträgt:" ;
        document.getElementById('totalSalary').textContent =  totalSalary;
    } catch (error) {
        console.error('Error:', error);
    }
}

function getLoggedInUser() {
    return fetch('/loggedInUser')
        .then(response => response.json())
        .then(user => {
            return user;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
async function getSalaryRate(user) {
    const response = await fetch('/salaryRate/' + user);
    if (!response.ok) {
        throw new Error('User not found');
    }
    const salaryRate = await response.text();
    return salaryRate;
}