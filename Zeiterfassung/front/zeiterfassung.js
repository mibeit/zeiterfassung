// An object to store the start and end times
var times = {};

// Function to record the start and end times
function recordTime(type) {
    console.log("recordTime called with: " + type);
    var now = new Date();
    var time = now.getHours() + ":" + (now.getMinutes() < 10 ? "0" : "") + now.getMinutes();
    var date = now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
    times[type] = time;
    times['date'] = date;

    // If the type is 'end', add a row to the table
    if (type === 'end') {
        addRow(times['start'], times['end'], times['date']);
    }
}

// Function to calculate the work time
function calculateWorkTime(start, end) {
    var startTime = new Date("1970-01-01 " + start);
    var endTime = new Date("1970-01-01 " + end);

    // Calculate the difference between the end and start times
    var diff = endTime - startTime;

    // Convert the difference to hours and minutes
    var hours = Math.floor(diff / 1000 / 60 / 60);
    var minutes = Math.floor(diff / 1000 / 60) % 60;

    // Return the work time as a string
    return hours + ":" + (minutes < 10 ? "0" : "") + minutes;
}

// Function to calculate the pause time
function calculatePause(workTime) {
    var workTimeParts = workTime.split(":");
    var workTimeInMinutes = parseInt(workTimeParts[0]) * 60 + parseInt(workTimeParts[1]);

    // Determine the pause time based on the work time
    if (workTimeInMinutes < 6 * 60) {
        return "0:00";
    } else if (workTimeInMinutes < 9 * 60) {
        return "0:30";
    } else {
        return "0:45";
    }
}

// Function to add a row to the table
function addRow(start,end,date) {
    var newTimeRecord = {
        start: start,
        end: end,
        date: date
    };

    // Send a POST request to the server with the new time record
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

// This function is used to delete a row from the time records table.
// It takes a button element as an argument, which is assumed to be nested within the row to be deleted.
function deleteRow(btn) {
    // Get the ID of the time record to delete from the data-id attribute of the row
    var id = btn.parentNode.parentNode.dataset.id;

    // Send a DELETE request to the server for the time record with the given ID
    fetch('/timeRecords/' + id, {
        method: 'DELETE',
    })
    .then((response) => {
        if (!response.ok) {
            // If the server response indicates an error, throw an exception
            throw new Error('Network response was not ok');
        }
        // If the server response is ok, remove the row from the table
        var row = btn.parentNode.parentNode;
        row.parentNode.removeChild(row);
    })
    .catch((error) => {
        // Log any errors to the console
        console.error('Error:', error);
    });
}

// This function is executed when the page is loaded.
window.onload = async function() {
    // Fetch the list of time records from the server
    fetch('/timeRecords')
    .then(response => response.json())
    .then(data => {
        // For each time record, add a row to the table
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
        // Log any errors to the console
        console.error('Error:', error);
    });
    // personal data for each user
    try {
       
        const user = await getLoggedInUser();
        if (!user) {
            throw new Error('User not found');
        }

        
        const address = await getAdress(user.username);
        const telNr = await getTelNr(user.username);

        
        document.getElementById('Name').textContent = "Name: " + user.username;
        document.getElementById('Telefonnummer').textContent ="Tel.: "+  telNr;
        document.getElementById('Adresse').textContent = "Address: "+ address;
    } catch (error) {
        console.error('Error:', error);
    }
};

// This function is used to format a date string from the format "dd.mm.yyyy" to "yyyy-mm-dd".
function formatDate(dateString) {
    var parts = dateString.split(".");
    return parts[2] + "-" + parts[1] + "-" + parts[0];
}

// This function is used to edit a row in the time records table.

function editRow(btn) {
    // Get the ID of the time record to edit from the data-id attribute of the row
    var id = btn.parentNode.parentNode.dataset.id;

    // Get the start and end cells of the row
    var startCell = btn.parentNode.parentNode.cells[1];
    var endCell = btn.parentNode.parentNode.cells[2];

    // Change the cells to input fields with the current values
    startCell.innerHTML = '<input type="time" id="startInput" value="' + startCell.innerHTML + '">';
    endCell.innerHTML = '<input type="time" id="endInput" value="' + endCell.innerHTML + '">';

    // Change the Edit button to a Save button
    btn.outerHTML = '<button class="saveButton" onclick="saveRow(this, ' + id + ')">Save</button>';
}

// This function is used to filter the time records table by month.

function filterMonth(month) {
    // Fetch the list of time records for the given month from the server
    fetch('/timeRecords/month/' + month)
        .then(response => response.json())
        .then(data => {
            var table = document.getElementById("timeTable");
            
            // Remove all existing rows from the table
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
            
            // For each time record, add a row to the table
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
            // Log any errors to the console
            console.error('Error:', error);
        });
}
// Fetches the time records for the current date from the server and displays them in a table
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
// Fetches all time records from the server and displays them in a table
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

// Updates a time record on the server with new start and end times, then updates the table
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

//Time Records to Excel
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
// time string hh:mm to decimal number
function convertTimeToDecimal(time) {
    const [hours, minutes] = time.split(':');
    return Number(hours) + Number(minutes) / 60;
}
// caLculate total salary with logged in user information
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
        document.getElementById('whichSalary').textContent =  "Total Salary:" ;
        document.getElementById('totalSalary').textContent =  totalSalary;
    } catch (error) {
        console.error('Error:', error);
    }
}
// same as above but for a specific month
async function calculateMonthlySalary(month) {
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
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
        document.getElementById('whichSalary').textContent =  "Monthly Salary "+ monthName + ":" ;
        document.getElementById('totalSalary').textContent =  totalSalary;
    } catch (error) {
        console.error('Error:', error);
    }
}

// same as above but for the last week
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
        document.getElementById('whichSalary').textContent =  "Last Week's Salary:" ;
        document.getElementById('totalSalary').textContent =  totalSalary;
    } catch (error) {
        console.error('Error:', error);
    }
}
// get logged in user to access to the salary rate
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
// get salary rate of a user
async function getSalaryRate(user) {
    const response = await fetch('/salaryRate/' + user);
    if (!response.ok) {
        throw new Error('User not found');
    }
    const salaryRate = await response.text();
    return salaryRate;
}
// get adress of a user
async function getAdress(user) {
    const response = await fetch('/adress/' + user);
    if (!response.ok) {
        throw new Error('User not found');
    }
    const adress = await response.text();
    return adress;
}
// get telnr of a user
async function getTelNr(user) {
    const response = await fetch('/telnr/' + user);
    if (!response.ok) {
        throw new Error('User not found');
    }
    const adress = await response.text();
    return adress;
}